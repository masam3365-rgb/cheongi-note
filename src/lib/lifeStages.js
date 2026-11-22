/**
 * 생애 단계(초년·중년·말년)와 10년 대운 구간을 분리합니다.
 * 대운 시작 나이·간지·순행/역행 계산은 chart 엔진 값을 그대로 씁니다.
 */

/** @typedef {{ id: string, title: string, shortTitle: string, from: number, to: number, hint: string }} LifeStage */

/** @type {LifeStage[]} */
export const LIFE_STAGES = [
  {
    id: "early",
    title: "초년",
    shortTitle: "초년",
    from: 1,
    to: 30,
    hint: "배움, 첫 자리, 생활 습관이 평생의 바닥을 만듭니다.",
  },
  {
    id: "mid",
    title: "중년",
    shortTitle: "중년",
    from: 31,
    to: 60,
    hint: "돈, 가정, 직함의 책임이 한자리에 모입니다.",
  },
  {
    id: "late",
    title: "말년",
    shortTitle: "말년",
    from: 61,
    to: 120,
    hint: "버틴 체력과 정리된 관계가 남은 시간을 결정합니다.",
  },
];

export const LIFE_STAGE_CRITERIA_TEXT =
  "생애 단계 기준(세는나이): 초년 1~30세, 중년 31~60세, 말년 61세 이후. 이 구분은 10년 대운 순번과 다릅니다.";

export function isPreDaYunCycle(cycle) {
  if (!cycle) return true;
  const gz = String(cycle.gz || "").trim();
  const gzKo = String(cycle.gzKo || "").trim();
  if (!gz) return true;
  return gzKo === "대운 전" || gzKo === "대운 시작 전";
}

export function displayDaYunLabel(cycle) {
  if (isPreDaYunCycle(cycle)) return "대운 시작 전";
  return String(cycle.gzKo || cycle.gz || "—");
}

/**
 * 대운 상세 제목 — 생애 단계 명칭을 대운 순번에 붙이지 않음
 * @param {object} cycle
 * @param {number} daYunOrdinal 간지가 있는 대운만 센 순번(1부터)
 */
export function daYunDetailTitle(cycle, daYunOrdinal) {
  if (isPreDaYunCycle(cycle)) return "대운 시작 전";
  const gz = displayDaYunLabel(cycle);
  return `제${daYunOrdinal}대운 · ${gz}`;
}

export function lifeStageForAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return null;
  return LIFE_STAGES.find((s) => n >= s.from && n <= s.to) || null;
}

/** 대운 나이 구간이 겹치는 생애 단계들 */
export function lifeStagesOverlappingCycle(cycle) {
  if (!cycle || isPreDaYunCycle(cycle)) return [];
  const start = Number(cycle.startAge);
  const end = Number(cycle.endAge);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  return LIFE_STAGES.filter((s) => end >= s.from && start <= s.to);
}

export function decadeAdviceForCycle(cycle) {
  if (isPreDaYunCycle(cycle)) {
    return "대운이 본격적으로 시작되기 전입니다. 집안의 온도와 생활 리듬·학습 습관이 이 시기의 바탕이 됩니다. 무리한 독립과 큰돈 결정보다 체력과 기초를 남기세요.";
  }
  const stages = lifeStagesOverlappingCycle(cycle);
  if (!stages.length) {
    return "이 10년 대운은 간지·합충으로 온도가 갈립니다. 밀 일과 지킬 일을 나누어 보세요.";
  }
  const names = stages.map((s) => `${s.title}(${s.from}~${s.to === 120 ? "이후" : `${s.to}`}세)`).join("·");
  const primary = stages[Math.floor((stages.length - 1) / 2)] || stages[0];
  const tip =
    primary.id === "early"
      ? "공부·첫 직장·인간관계의 뼈대를 만듭니다. 기록과 멘토가 자산입니다."
      : primary.id === "mid"
        ? "책임·수입·가정의 균형이 핵심입니다. 큰 계약은 서류와 수면을 같이 보세요."
        : "정리·전수·건강이 우선입니다. 벌리기보다 지키는 선택이 이득입니다.";
  return `이 10년 대운은 생애 단계 ${names}와 겹칩니다. ${tip}`;
}

/**
 * 세는나이·출생연도·대운 연도 일치 검증 (엔진 값은 수정하지 않고 검사만)
 * 세는나이 기준: startYear ≈ birthYear + startAge - 1
 */
export function verifyDaYunAgeYearConsistency(cycle, birthYear, { tolerance = 1 } = {}) {
  if (!cycle || isPreDaYunCycle(cycle)) {
    return { ok: true, skipped: true };
  }
  const by = Number(birthYear);
  const startAge = Number(cycle.startAge);
  const endAge = Number(cycle.endAge);
  const startYear = Number(cycle.startYear);
  const endYear = Number(cycle.endYear);
  if (![by, startAge, endAge, startYear, endYear].every(Number.isFinite)) {
    return { ok: false, reason: "missing_fields" };
  }
  const expectedStart = by + startAge - 1;
  const expectedEnd = by + endAge - 1;
  const startOk = Math.abs(startYear - expectedStart) <= tolerance;
  const endOk = Math.abs(endYear - expectedEnd) <= tolerance;
  const ageSpan = endAge - startAge;
  const yearSpan = endYear - startYear;
  const spanOk = Math.abs(ageSpan - yearSpan) <= tolerance;
  return {
    ok: startOk && endOk && spanOk,
    expectedStart,
    expectedEnd,
    startYear,
    endYear,
    startAge,
    endAge,
    startOk,
    endOk,
    spanOk,
  };
}

/**
 * 보고서 HTML에서 잘못된 생애단계↔나이 매핑이 있는지 검사
 * 예: 중년이 7~16세로 표기, 말년이 17~26세로 표기
 */
export function findMislabeledLifeStageInHtml(html) {
  const text = String(html || "");
  const issues = [];

  // 제목/헤더에 붙은 "중년|말년|초년" 근처의 세는나이 구간
  const headingRe =
    /(?:대운\s*상세\s*[·・]\s*)?(초년|중년|말년)\s*(?:\([^)]*\))?\s*[\s\S]{0,220}?세는나이\s*(\d+)\s*[~～\-–]\s*(\d+)\s*세/g;
  let m;
  while ((m = headingRe.exec(text))) {
    const label = m[1];
    const a = Number(m[2]);
    const b = Number(m[3]);
    const stage = LIFE_STAGES.find((s) => s.shortTitle === label || s.title === label);
    if (!stage) continue;
    // 구간 전체가 생애 단계와 겹치지 않으면 오류 (대운 10년이 단계 경계에 걸치는 경우는 허용)
    const overlaps = b >= stage.from && a <= stage.to;
    if (!overlaps) {
      issues.push({
        kind: "stage_age_mismatch",
        label,
        startAge: a,
        endAge: b,
        expected: `${stage.from}~${stage.to === 120 ? "이후" : stage.to}`,
      });
    }
  }

  // 대표 회귀: 중년 7~16 / 말년 17~26 패턴
  if (/중년[\s\S]{0,120}?7\s*[~～\-–]\s*16\s*세/.test(text)) {
    issues.push({ kind: "classic_mid_7_16" });
  }
  if (/말년[\s\S]{0,120}?17\s*[~～\-–]\s*26\s*세/.test(text)) {
    issues.push({ kind: "classic_late_17_26" });
  }
  if (/초년[\s\S]{0,120}?1\s*[~～\-–]\s*6\s*세/.test(text) && /대운\s*상세\s*[·・]\s*초년/.test(text)) {
    issues.push({ kind: "classic_early_1_6_as_dayun_phase" });
  }

  return issues;
}

export function phasesOfCycles(cycles, profile = {}) {
  return LIFE_STAGES.map((phase) => {
    const rows = (cycles || []).filter(
      (cycle) =>
        !isPreDaYunCycle(cycle) &&
        Number(cycle.endAge) >= phase.from &&
        Number(cycle.startAge) <= phase.to &&
        cycle.startYear,
    );
    return {
      ...phase,
      cycles: rows,
      summary: rows.length
        ? `${phase.title}(${phase.from}~${phase.to === 120 ? "이후" : phase.to}세)에 겹치는 대운: ${rows
            .map((c) => `${displayDaYunLabel(c)} ${c.startYear}~${c.endYear}`)
            .join(", ")}. ${phase.hint}`
        : `${phase.title}(${phase.from}~${phase.to === 120 ? "이후" : phase.to}세)에 해당하는 대운 구간이 짧거나 없습니다. ${phase.hint}`,
      roleNote:
        phase.id === "early" && profile.role === "seeker"
          ? " 이 구간의 성패는 자격과 첫 자리입니다."
          : phase.id === "mid" && profile.role === "owner"
            ? " 이 구간은 사업을 키우기보다 현금과 사람을 남기는 쪽이 맞습니다."
            : phase.id === "mid" && profile.role === "employee"
              ? " 이 구간은 직함보다 대체 불가능한 실무가 남습니다."
              : "",
    };
  });
}
