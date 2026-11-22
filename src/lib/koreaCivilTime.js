/**
 * 한국 민정시(Asia/Seoul) ↔ UTC 절대시각 변환.
 *
 * - 8-1 설계: 민정시 → IANA 한 번만 → UTC. 경도·진태양·야자시는 다루지 않음.
 * - chart.js / reading.js 와 연결하지 않음 (독립 모듈).
 * - 런타임 IANA(ICU) Asia/Seoul 데이터를 Temporal로 사용.
 */

export const KOREA_TIME_ZONE = "Asia/Seoul";

export const DISAMBIGUATION = Object.freeze({
  /** 모호·공백 시각은 확정하지 않고 오류 (기본·권장) */
  REJECT: "reject",
  /** 겹치는 구간에서 더 이른 UTC (폴백 구간용, 명시 선택 시에만) */
  EARLIER: "earlier",
  /** 겹치는 구간에서 더 늦은 UTC */
  LATER: "later",
});

/**
 * @typedef {{ year: number, month: number, day: number, hour?: number, minute?: number, second?: number }} CivilParts
 * @typedef {{ year: number, month: number, day: number, hour: number, minute: number, second: number, offset: string, epochMs: number, instant: string, timeZone: string }} CivilResolved
 */

function requireTemporal() {
  if (typeof Temporal === "undefined" || !Temporal.ZonedDateTime) {
    const err = new Error(
      "koreaCivilTime: Temporal API가 필요합니다. Node 20+ 또는 Temporal을 지원하는 환경에서 실행하세요.",
    );
    err.code = "TEMPORAL_UNAVAILABLE";
    throw err;
  }
}

function normalizeCivil(parts) {
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = parts.hour == null ? 0 : Number(parts.hour);
  const minute = parts.minute == null ? 0 : Number(parts.minute);
  const second = parts.second == null ? 0 : Number(parts.second);
  for (const [label, n, min, max] of [
    ["year", year, 1900, 2100],
    ["month", month, 1, 12],
    ["day", day, 1, 31],
    ["hour", hour, 0, 23],
    ["minute", minute, 0, 59],
    ["second", second, 0, 59],
  ]) {
    if (!Number.isInteger(n) || n < min || n > max) {
      const err = new Error(`koreaCivilTime: ${label} 값이 올바르지 않습니다.`);
      err.code = "INVALID_CIVIL";
      throw err;
    }
  }
  return { year, month, day, hour, minute, second };
}

function wallMatches(zdt, civil) {
  return (
    zdt.year === civil.year &&
    zdt.month === civil.month &&
    zdt.day === civil.day &&
    zdt.hour === civil.hour &&
    zdt.minute === civil.minute &&
    zdt.second === civil.second
  );
}

function fromDisambiguation(civil, disambiguation) {
  return Temporal.ZonedDateTime.from(
    {
      timeZone: KOREA_TIME_ZONE,
      year: civil.year,
      month: civil.month,
      day: civil.day,
      hour: civil.hour,
      minute: civil.minute,
      second: civil.second,
    },
    { disambiguation },
  );
}

function toResolved(zdt) {
  return {
    year: zdt.year,
    month: zdt.month,
    day: zdt.day,
    hour: zdt.hour,
    minute: zdt.minute,
    second: zdt.second,
    offset: zdt.offset,
    epochMs: zdt.epochMilliseconds,
    instant: zdt.toInstant().toString(),
    timeZone: KOREA_TIME_ZONE,
  };
}

function candidateInfo(zdt) {
  return {
    offset: zdt.offset,
    instant: zdt.toInstant().toString(),
    epochMs: zdt.epochMilliseconds,
    wall: zdt.toPlainDateTime().toString(),
  };
}

/**
 * 민정시가 유일·모호·공백인지 분류 (확정하지 않음).
 * @param {CivilParts} parts
 */
export function classifyKoreaCivil(parts) {
  requireTemporal();
  const civil = normalizeCivil(parts);
  const earlier = fromDisambiguation(civil, "earlier");
  const later = fromDisambiguation(civil, "later");
  const earlierOk = wallMatches(earlier, civil);
  const laterOk = wallMatches(later, civil);

  if (earlierOk && laterOk) {
    if (earlier.epochNanoseconds === later.epochNanoseconds) {
      return { status: "unique", civil, zoned: earlier };
    }
    return {
      status: "ambiguous",
      civil,
      earlier: candidateInfo(earlier),
      later: candidateInfo(later),
      note: "서머타임·표준시 접힘으로 같은 벽시계가 두 UTC에 대응합니다. 임의 확정하지 않습니다.",
    };
  }

  return {
    status: "nonexistent",
    civil,
    earlierMapped: candidateInfo(earlier),
    laterMapped: candidateInfo(later),
    note: "서머타임·표준시 점프로 이 벽시계는 존재하지 않습니다. 임의 확정하지 않습니다.",
  };
}

/**
 * 한국 민정시 → UTC Instant 정보.
 * @param {CivilParts} parts
 * @param {{ disambiguation?: 'reject'|'earlier'|'later' }} [options]
 * @returns {CivilResolved}
 */
export function koreaCivilToUtc(parts, options = {}) {
  requireTemporal();
  const policy = options.disambiguation || DISAMBIGUATION.REJECT;
  const classified = classifyKoreaCivil(parts);

  if (classified.status === "unique") {
    return toResolved(classified.zoned);
  }

  if (classified.status === "ambiguous") {
    if (policy === DISAMBIGUATION.EARLIER) {
      return toResolved(fromDisambiguation(classified.civil, "earlier"));
    }
    if (policy === DISAMBIGUATION.LATER) {
      return toResolved(fromDisambiguation(classified.civil, "later"));
    }
    const err = new Error(
      `koreaCivilTime: 모호한 현지 시각입니다 (${classified.civil.year}-${classified.civil.month}-${classified.civil.day} ${String(classified.civil.hour).padStart(2, "0")}:${String(classified.civil.minute).padStart(2, "0")}). earlier/later를 명시하세요.`,
    );
    err.code = "AMBIGUOUS_LOCAL";
    err.details = classified;
    throw err;
  }

  // nonexistent
  const err = new Error(
    `koreaCivilTime: 존재하지 않는 현지 시각입니다 (${classified.civil.year}-${classified.civil.month}-${classified.civil.day} ${String(classified.civil.hour).padStart(2, "0")}:${String(classified.civil.minute).padStart(2, "0")}).`,
  );
  err.code = "NONEXISTENT_LOCAL";
  err.details = classified;
  throw err;
}

/**
 * UTC Instant → 한국 민정시.
 * @param {number|string|Date|Temporal.Instant} utc epoch ms, ISO instant, Date, or Instant
 * @returns {CivilResolved}
 */
export function utcToKoreaCivil(utc) {
  requireTemporal();
  let instant;
  if (typeof utc === "number") {
    instant = Temporal.Instant.fromEpochMilliseconds(utc);
  } else if (utc instanceof Date) {
    instant = Temporal.Instant.fromEpochMilliseconds(utc.getTime());
  } else if (typeof utc === "string") {
    instant = Temporal.Instant.from(utc);
  } else if (utc && typeof utc.epochNanoseconds !== "undefined") {
    instant = utc;
  } else {
    const err = new Error("koreaCivilTime: UTC 입력을 해석할 수 없습니다.");
    err.code = "INVALID_UTC";
    throw err;
  }
  const zdt = instant.toZonedDateTimeISO(KOREA_TIME_ZONE);
  return toResolved(zdt);
}

/**
 * 민정시 → UTC → 민정시 왕복. 유일 시각만 성공.
 * @param {CivilParts} parts
 */
export function roundTripKoreaCivil(parts) {
  const forward = koreaCivilToUtc(parts, { disambiguation: DISAMBIGUATION.REJECT });
  const back = utcToKoreaCivil(forward.epochMs);
  const ok =
    back.year === forward.year &&
    back.month === forward.month &&
    back.day === forward.day &&
    back.hour === forward.hour &&
    back.minute === forward.minute &&
    back.second === forward.second &&
    back.offset === forward.offset;
  return { ok, forward, back };
}

/**
 * 실행 환경의 Temporal/ICU·타임존 지원 정보 (진단용).
 */
export function getKoreaTimeRuntimeInfo() {
  requireTemporal();
  const sample = koreaCivilToUtc({ year: 1960, month: 3, day: 16, hour: 22, minute: 0 });
  const modern = koreaCivilToUtc({ year: 2020, month: 1, day: 1, hour: 12, minute: 0 });
  return {
    timeZone: KOREA_TIME_ZONE,
    nodeVersion: typeof process !== "undefined" ? process.version : null,
    icuVersion: typeof process !== "undefined" ? process.versions?.icu ?? null : null,
    temporalAvailable: true,
    sample1960Offset: sample.offset,
    sample2020Offset: modern.offset,
    notes: [
      "오프셋은 실행 환경 ICU/IANA Asia/Seoul 데이터를 따릅니다.",
      "법령 원문·관보와의 전수 대조는 미검증입니다.",
      "경도·진태양시·야자시는 이 모듈 범위 밖입니다.",
    ],
  };
}

/**
 * 기존 앱(chart.js)처럼 “숫자 시각을 보정 없이” 쓸 때와 비교하기 위한 참고값.
 * 사주 엔진을 호출하지 않음. 현대 KST(+09:00)로만 가정한 가상 UTC.
 * @param {CivilParts} parts
 */
export function legacyNaiveUtcPlus9(parts) {
  requireTemporal();
  const civil = normalizeCivil(parts);
  const epochMs = Date.UTC(civil.year, civil.month - 1, civil.day, civil.hour - 9, civil.minute, civil.second);
  return {
    assumption: "fixed UTC+09:00 (no historical Asia/Seoul)",
    epochMs,
    instant: Temporal.Instant.fromEpochMilliseconds(epochMs).toString(),
    offset: "+09:00",
  };
}
