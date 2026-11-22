/**
 * 사주 시간 모드 (opt-in) — 서비스 기본 경로와 분리.
 *
 * - legacy_raw (기본): 입력 시·분을 chart.js에 그대로 전달 (현행 앱과 동일)
 * - korea_civil_v1: 사용자가 명시적으로 선택할 때만.
 *     민정시 → IANA Asia/Seoul UTC(1회) → 라이브러리 절기 표기용 고정 UTC+8 벽 → buildChart
 *
 * 연결 금지: reading.js / UI / PDF / 결제에서 import 하지 말 것 (8-7).
 * 경도·진태양시: 미적용.
 * 야자시(yaja)·대운 sect: timeMode와 독립 — 입력 플래그만 그대로 buildChart에 전달.
 */

import { buildChart } from "./chart.js";
import {
  classifyKoreaCivil,
  DISAMBIGUATION,
  koreaCivilToUtc,
} from "./koreaCivilTime.js";

export const TIME_MODE = Object.freeze({
  LEGACY_RAW: "legacy_raw",
  KOREA_CIVIL_V1: "korea_civil_v1",
});

/** lunar-javascript 절기 벽시계 ≈ UTC+8 표기 (8-3·8-6 검증) */
export const LIBRARY_WALL_OFFSET = "+08:00";

const DEFAULT_MODE = TIME_MODE.LEGACY_RAW;

function chartInputBase(input) {
  return {
    gender: input.gender,
    calendar: input.calendar || "solar",
    leap: Boolean(input.leap),
    yaja: Boolean(input.yaja),
    hourUnknown: Boolean(input.hourUnknown),
  };
}

function civilParts(input) {
  return {
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: input.hourUnknown ? 12 : Number(input.hour),
    minute: input.hourUnknown ? 0 : Number(input.minute ?? 0),
    second: Number(input.second ?? 0),
  };
}

export function snapshotChart(chart) {
  return {
    pillars: chart.pillars.map((p) => p.gzKo),
    pillarsZh: chart.pillars.map((p) => p.gz),
    jieQiKo: chart.jieQiKo,
    daYun: {
      forward: chart.daYun.forward,
      startText: chart.daYun.startText,
      firstGz: chart.daYun.cycles.find((c) => c.gz)?.gzKo || "대운 전",
      firstStartYear: chart.daYun.cycles.find((c) => c.gz)?.startYear ?? null,
      firstStartAge: chart.daYun.cycles.find((c) => c.gz)?.startAge ?? null,
    },
    clock: chart.clock,
    lunarText: chart.lunarText,
    yaja: chart.yaja,
  };
}

function runLegacy(input) {
  const engineInput = {
    year: Number(input.year),
    month: Number(input.month),
    day: Number(input.day),
    hour: input.hourUnknown ? "" : Number(input.hour),
    minute: input.hourUnknown ? 0 : Number(input.minute ?? 0),
  };
  const chart = buildChart({
    ...chartInputBase(input),
    ...engineInput,
    hourUnknown: Boolean(input.hourUnknown),
  });
  return {
    ok: true,
    mode: TIME_MODE.LEGACY_RAW,
    engineInput: {
      year: chart.solar.year,
      month: chart.solar.month,
      day: chart.solar.day,
      hour: input.hourUnknown ? 12 : Number(input.hour),
      minute: input.hourUnknown ? 0 : Number(input.minute ?? 0),
    },
    result: snapshotChart(chart),
    chart,
  };
}

/**
 * korea_civil_v1 — 명시적 disambiguation 없으면 모호/공백 시 오류 안내.
 * @param {object} input
 * @param {{ disambiguation?: 'reject'|'earlier'|'later' }} [civilOptions]
 */
function runKoreaCivilV1(input, civilOptions = {}) {
  const parts = civilParts(input);
  const classified = classifyKoreaCivil(parts);
  const policy = civilOptions.disambiguation || DISAMBIGUATION.REJECT;

  // 존재하지 않는 민정시: earlier/later로도 임의 확정하지 않음
  if (classified.status === "nonexistent") {
    return {
      ok: false,
      mode: TIME_MODE.KOREA_CIVIL_V1,
      error: {
        code: "NONEXISTENT_LOCAL",
        message: "존재하지 않는 민정시입니다(서머타임·표준시 점프). 다른 시각을 입력하세요.",
        guidance: {
          earlierMapped: classified.earlierMapped,
          laterMapped: classified.laterMapped,
          choices: ["pick_another_time", "cancel"],
        },
      },
    };
  }

  // 모호한 민정시: 명시적 earlier/later 없으면 선택 안내
  if (classified.status === "ambiguous" && policy === DISAMBIGUATION.REJECT) {
    return {
      ok: false,
      mode: TIME_MODE.KOREA_CIVIL_V1,
      error: {
        code: "AMBIGUOUS_LOCAL",
        message: "모호한 민정시입니다. disambiguation: 'earlier' 또는 'later'를 명시하세요.",
        guidance: {
          earlier: classified.earlier,
          later: classified.later,
          choices: ["earlier", "later", "cancel"],
        },
      },
    };
  }

  try {
    const utc = koreaCivilToUtc(parts, { disambiguation: policy });
    // 절기 보정 중복 금지: UTC 한 번 → 라이브러리 벽 한 번만
    const wall = Temporal.Instant.from(utc.instant).toZonedDateTimeISO(LIBRARY_WALL_OFFSET);
    const engineInput = {
      year: wall.year,
      month: wall.month,
      day: wall.day,
      hour: wall.hour,
      minute: wall.minute,
    };
    const chart = buildChart({
      ...chartInputBase(input),
      ...engineInput,
      hourUnknown: false,
    });
    return {
      ok: true,
      mode: TIME_MODE.KOREA_CIVIL_V1,
      policy: {
        civilToUtc: "koreaCivilTime / Asia/Seoul once",
        libraryWall: `fixed ${LIBRARY_WALL_OFFSET}`,
        longitude: false,
        trueSolar: false,
        yajaIndependent: true,
      },
      utc: {
        instant: utc.instant,
        offset: utc.offset,
        epochMs: utc.epochMs,
      },
      engineInput,
      result: snapshotChart(chart),
      chart,
    };
  } catch (e) {
    return {
      ok: false,
      mode: TIME_MODE.KOREA_CIVIL_V1,
      error: {
        code: e.code || "ERROR",
        message: e.message,
        details: e.details,
        guidance:
          e.code === "AMBIGUOUS_LOCAL"
            ? { choices: ["earlier", "later", "cancel"], hint: e.details }
            : { choices: ["pick_another_time", "cancel"] },
      },
    };
  }
}

/**
 * 선택형 계산 인터페이스.
 * @param {object} input buildChart와 동일한 사람 입력 (+ yaja)
 * @param {{ timeMode?: 'legacy_raw'|'korea_civil_v1', disambiguation?: 'reject'|'earlier'|'later' }} [options]
 *
 * 기본 timeMode = legacy_raw (서비스 현행과 동일).
 * korea_civil_v1은 options.timeMode를 명시해야 함.
 */
export function computeBaziByTimeMode(input, options = {}) {
  const timeMode = options.timeMode || DEFAULT_MODE;
  if (timeMode === TIME_MODE.LEGACY_RAW) {
    return runLegacy(input);
  }
  if (timeMode === TIME_MODE.KOREA_CIVIL_V1) {
    return runKoreaCivilV1(input, {
      disambiguation: options.disambiguation || DISAMBIGUATION.REJECT,
    });
  }
  return {
    ok: false,
    mode: timeMode,
    error: {
      code: "UNKNOWN_TIME_MODE",
      message: `알 수 없는 timeMode: ${timeMode}. '${TIME_MODE.LEGACY_RAW}' 또는 '${TIME_MODE.KOREA_CIVIL_V1}'만 지원합니다.`,
    },
  };
}

/**
 * 절기 경계 등: legacy와 korea_civil_v1을 나란히 비교 (서비스 미연결).
 * 야자시·성별은 양쪽에 동일 적용.
 */
export function compareLegacyAndCivilV1(input, civilOptions = {}) {
  const legacy = computeBaziByTimeMode(input, { timeMode: TIME_MODE.LEGACY_RAW });
  const v1 = computeBaziByTimeMode(input, {
    timeMode: TIME_MODE.KOREA_CIVIL_V1,
    disambiguation: civilOptions.disambiguation || DISAMBIGUATION.REJECT,
  });

  if (!v1.ok) {
    return {
      comparable: false,
      legacy,
      korea_civil_v1: v1,
      pillarDiff: null,
      dayunDiff: null,
      anyChange: null,
    };
  }

  const a = legacy.result;
  const b = v1.result;
  const pillarDiff = a.pillars.map((p, i) => ({
    slot: ["년주", "월주", "일주", "시주"][i],
    legacy: p,
    korea_civil_v1: b.pillars[i],
    same: p === b.pillars[i],
  }));
  const dayunDiff = {
    forward: { legacy: a.daYun.forward, korea_civil_v1: b.daYun.forward, same: a.daYun.forward === b.daYun.forward },
    startText: {
      legacy: a.daYun.startText,
      korea_civil_v1: b.daYun.startText,
      same: a.daYun.startText === b.daYun.startText,
    },
    firstGz: {
      legacy: a.daYun.firstGz,
      korea_civil_v1: b.daYun.firstGz,
      same: a.daYun.firstGz === b.daYun.firstGz,
    },
  };
  const pillarChanged = pillarDiff.some((d) => !d.same);
  const dayunChanged = !dayunDiff.forward.same || !dayunDiff.startText.same || !dayunDiff.firstGz.same;

  return {
    comparable: true,
    legacy,
    korea_civil_v1: v1,
    pillarDiff,
    dayunDiff,
    pillarChanged,
    dayunChanged,
    anyChange: pillarChanged || dayunChanged,
    note: "야자시·대운 공식은 양쪽에 동일. 차이는 민정시→UTC→라이브러리 벽 투영만.",
  };
}

export function getDefaultTimeMode() {
  return DEFAULT_MODE;
}
