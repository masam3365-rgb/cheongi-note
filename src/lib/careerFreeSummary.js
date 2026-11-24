/**
 * 공개 무료 화면용 — 적성·직업 vs 진로지침서 목적 분리 요약 (3~5문장).
 * 상세 직종 목록·개운 대조표·시기별 월 풀이는 productReportHtml(유료 PDF)에만 둡니다.
 */
import { buildCareerPlaybook } from "./careerRemedyGuide.js";
import { dayMasterPhrase, strengthPhrase } from "./plainTerms.js";

function clip(text, max = 120) {
  const s = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/** 적성·직업: 지금 하는 일·직장 성향·잘 맞는 일의 방식 (직종 목록 없음) */
export function buildAptitudeJobFreeLines(reading) {
  const chart = reading?.chart;
  const career = reading?.forecast?.find((item) => item.id === "career");
  const nature = reading?.dashboard?.cards?.find((card) => card.id === "aptitude")?.nature;
  const profile = reading?.profile;
  const lines = [];

  lines.push(
    "【적성·직업】은 ‘지금 하는 일과 잘 맞는 일의 방식’을 짧게 보는 메뉴입니다. 중장기 직종·전공 목록은 「진로지침서」와 유료 PDF에서 다룹니다.",
  );

  if (chart) {
    lines.push(
      `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength?.label)}. 사회생활의 결은 ${chart.monthGod || "—"}로 읽습니다.`,
    );
  }

  if (nature?.trait) lines.push(clip(nature.trait, 110));
  if (nature?.fit) lines.push(`잘 맞는 일의 결은 ${clip(nature.fit, 80)}입니다.`);

  if (career?.summary) lines.push(clip(career.summary, 130));
  else if (profile?.career) lines.push(clip(profile.career, 110));

  if (profile?.roleLabel) {
    lines.push(
      `${profile.roleLabel} 기준으로는 속도보다 ‘남기는 결과·문서’를 먼저 정리하는 편이 실수와 소진을 줄입니다.`,
    );
  }

  const unique = [...new Set(lines.filter(Boolean))];
  return unique.slice(0, 5);
}

/** 진로지침서: 중장기 진로 방향·1·2순위 분야명만 (직종·전공 나열·개운표 없음) */
export function buildCareerGuideFreeLines(reading) {
  const chart = reading?.chart;
  if (!chart) {
    return ["【진로지침서】 명식을 먼저 풀면 중장기 진로 방향 요약을 볼 수 있습니다."];
  }
  const play = buildCareerPlaybook(chart);
  const primaryNames = (play.primaryFields || []).map((f) => f.name).filter(Boolean);
  const secondaryNames = (play.secondaryFields || []).map((f) => f.name).filter(Boolean);
  const lines = [];

  lines.push(
    "【진로지침서】는 ‘앞으로 갈 진로 방향’을 보는 메뉴입니다. 지금 직장 성향은 「적성·직업」에서, 직종·전공 전체 목록과 시기별 지침은 유료 PDF에서 확인하세요.",
  );
  lines.push(
    `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · 강점 ${play.topGroupLabel || "—"}. 도움이 되는 기운 쪽을 기준으로 분야를 고릅니다.`,
  );
  if (primaryNames.length) {
    lines.push(`1순위 방향(분야명): ${primaryNames.join(" · ")}.`);
  }
  if (secondaryNames.length) {
    lines.push(`2순위 차선 방향(분야명): ${secondaryNames.slice(0, 3).join(" · ")}.`);
  }
  lines.push(
    "상세 현대 직종·추천 전공·개운 대조표·시기별 행동 지침은 크몽·당근 주문 후 전달되는 맞춤 PDF에 담깁니다.",
  );

  return lines.filter(Boolean).slice(0, 5);
}

/** 무료 텍스트/HTML에 직종 상세 목록이 섞였는지 검사 (회귀용) */
export function freeExportLeaksCareerDetail(text) {
  const s = String(text || "");
  const markers = [
    "AI 에듀테크 콘텐츠 기획자",
    "좋은 영향을 주는 것",
    "피하거나 줄여야 할 것",
    "진로 지침서 1 · 상위급",
    "대학 전공·자격 방향",
  ];
  return markers.filter((m) => s.includes(m));
}
