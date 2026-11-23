import { buildWesternAstrology, crossAdvice, westernTopicReading } from "./westernAstrology.js";
import { scoreMarriageDay } from "./taegil.js";
import { koGz } from "./ganzhi.js";
import { dayMasterPhrase, easeSentence, elementPhrase, favorBundlePhrase, strengthPhrase } from "./plainTerms.js";
import { buildCareerPlaybook } from "./careerRemedyGuide.js";
import { buildCareerLifePlain } from "./careerCopy.js";
import { buildFamilyLifePlain } from "./familyCopy.js";
import { buildDaYunLifeFlow } from "./flowCopy.js";
import { buildHealthLifePlain } from "./healthCopy.js";
import { buildWealthEastern, buildWealthLifePlain, buildWealthVesselLines } from "./wealthCopy.js";
import { buildPlanLifePlain } from "./planCopy.js";

/** 주제별 동양 심층 — 공통 일간·오행 장문 반복을 피하고 역할만 짧게 */
function buildTopicEastern(topicId, chart, title, detailSections) {
  if (topicId === "wealth") return buildWealthEastern(chart);

  const strong = chart.strength.strong;
  const yong = chart.strength.favorable?.[0];
  const gi = chart.strength.unfavorable?.[0];
  const strengthEasy = strong
    ? "방향을 정하면 끝까지 가는 힘이 있습니다. 주변 몫까지 혼자 지지 않도록 역할만 나누세요."
    : "채워 주는 사람·환경이 있을 때 실력이 더 잘 드러납니다. 믿을 사람 한 명과 상의하면 선택이 가벼워집니다.";

  const lead = [
    `${title}을 볼 때 기본 체질은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength.label)}입니다. ${strengthEasy}`,
    yong
      ? `이 주제에서 우선 도움이 되는 기운은 ${elementPhrase(yong, topicId)}이고, 과하면 부담이 되기 쉬운 기운은 ${elementPhrase(gi || "—", topicId)}입니다.`
      : "",
    `사회에서 자주 드러나는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
  ].filter(Boolean);

  // 월주 태도 문장은 본원·근거 박스에 있으므로 주제 동양 리드에서 반복하지 않음
  const leadNoMonth = lead.filter((line) => !/사회에서 자주 드러나는 태도/.test(line));
  const extras = (detailSections || []).flatMap((section) => (section.lines || []).slice(0, 1));
  return [...leadNoMonth, ...extras].slice(0, 5);
}

const TOPIC_ACTIONS = {
  marriage: [
    "후보 해·계절이 정해지면 양가 일정 조율 1회와 주거·예산 메모 1장만 먼저 적어두세요.",
    "예식·혼인신고·상견례는 날짜를 하루로 몰지 말고, 택일 가이드의 길일 후보에서 각각 하루씩 고르세요.",
    "상대와 “화났을 때 바로 톡할지, 하루 쉴지”처럼 갈등 복구 규칙 하나만 정해 두세요.",
  ],
  compatibility: [
    "세 번째 만남에서 수면·연락 빈도·돈 씀씀이 차이를 자연스럽게 확인해 보세요.",
    "합이 강하면 결정을 너무 오래 미루지 말고, 충·원진이 보이면 큰일 전에 역할·일정을 문장으로 나누세요.",
    "공동 길일 후보가 있으면 상견례·예식·혼인신고 중 하나만 그날에 넣고 나머지는 여유를 두세요.",
  ],
  children: [
    "주 1회 같은 시간에 짧은 산책이나 함께 식사하는 약속을 하나만 만드세요.",
    "훈계가 길어질 때는 문장을 한 줄로 줄이고, 양육자 본인의 수면부터 챙기세요.",
  ],
  wealth: [
    "고정비 목록을 한 장으로 만들고, 입금·청구를 같은 요일에 확인하세요.",
    "보증·당일 큰 송금·비교 소비는 ‘하지 않을 일’로 메모에 적어 두세요.",
  ],
  career: [
    "추천 계열에서 관심 전공 2~3개만 고르고, 관련 자격·포트폴리오 목록을 한 장으로 만드세요.",
    "원서·접수·면접은 ‘유리한 해·달’에 두고, 주의 달에는 새 지원보다 오답 정리·모의고사에 쓰세요.",
    "이번 분기에 남길 결과 파일 하나를 정해 주간 보고·성적·자격 증빙으로 남기세요.",
  ],
  business: [
    "확장·채용·광고는 한 번에 하나만 열고, 장부·역할은 같은 주에 잠그세요.",
    "동업이라면 지분·역할·종료 조건을 계약서 첫 장에 적으세요.",
  ],
  moving: [
    "현장 확인 날과 계약·등기 날을 하루 이상 나누세요.",
    "계약금은 현장 확인 전에 보내지 마세요.",
  ],
  health: [
    "몸이 신호를 보내면 일정을 하나 줄이는 것을 첫 개운으로 삼으세요.",
    "수면·식사 시간만 먼저 고정하고, 그다음에 운동을 더하세요.",
  ],
  travel: [
    "목적이 하나인 2박 내외 일정부터 잡고, 출국 전 이틀 수면을 지키세요.",
    "점수 낮은 달에는 장거리보다 근교 회복을 고르세요.",
  ],
};

export const CUSTOM_CATALOG = [
  {
    id: "marriage",
    title: "결혼운",
    blurb: "결혼 적기와 배우자운",
    preview: "혼담이 열리기 쉬운 해와, 배우자와의 생활 리듬을 쉬운 말로 풀어 드립니다.",
  },
  {
    id: "compatibility",
    title: "정밀 궁합",
    blurb: "2인 이름·생시 궁합",
    preview: "상대의 생년월일시를 넣으면 두 사람의 합·충·생활 리듬을 함께 읽습니다.",
    needsPartner: true,
  },
  {
    id: "children",
    title: "자녀운",
    blurb: "자녀 인연·양육 성향",
    preview: "아이와의 인연 시기와 양육에서 힘이 되는 태도를 짚어 드립니다.",
  },
  {
    id: "wealth",
    title: "재물운",
    blurb: "재물 그릇·손재수",
    preview: "돈이 모이는 그릇과 새기 쉬운 구멍, 대운에서 재물이 움직이는 시기를 봅니다.",
  },
  {
    id: "career",
    title: "직업·승진운",
    blurb: "적성·학과·합격 타이밍",
    preview: "맞는 일의 방향과 맞춤 학과·전공, 진학·시험·이직이 수월한 시기를 풀어 드립니다.",
  },
  {
    id: "business",
    title: "사업운",
    blurb: "창업·동업 유불리",
    preview: "창업·확장 적기와 동업·단독 중 어디에 힘이 실리는지 알려 드립니다.",
  },
  {
    id: "moving",
    title: "이사·부동산 매매운",
    blurb: "문서운·길한 방위",
    preview: "계약·등기 문서가 열리는 때와 이사·매매에 편한 방향을 안내합니다.",
  },
  {
    id: "health",
    title: "건강운",
    blurb: "월별 신체 주의 포인트",
    preview: "오행으로 약한 기운을 보고, 몇 월에 어느 부위를 조심할지 월별로 표시합니다.",
  },
  {
    id: "travel",
    title: "여행운",
    blurb: "길한 방향·추천 시기",
    preview: "기운을 북돋우는 방향과, 떠나기 좋은 달을 고르는 법을 알려 드립니다.",
  },
];

export const PLANS = {
  single: { id: "single", label: "1가지 개별", price: 8000, max: 1, desc: "원하는 1개 항목만" },
  triple: { id: "triple", label: "3가지 맞춤", price: 19000, max: 3, desc: "원하는 3개 항목" },
  full: {
    id: "full",
    label: "전체운·평생운 풀 패키지",
    price: 29000,
    max: 9,
    desc: "9종 전체 + 평생 총운 + 10년 세운 + PDF 리포트",
  },
};

/** 요금제별 상세 구성·포함 내역 (UI 안내 박스용) */
export const PLAN_DETAILS = {
  single: {
    badge: "단품 · 약 10페이지",
    headline: "1가지 개별 운세 — 선택한 주제만 깊게",
    lead: "결혼·궁합·자녀·재물·직업·사업·이사·건강·여행 중 원하는 1가지만 골라, 근거와 행동 지침을 자세히 풀어 드립니다.",
    pages: "A4 기준 약 10페이지 분량의 주제 집중 PDF 리포트",
    includes: [
      "선택한 1개 개별운 심층 풀이 무제한 열람",
      "동양 역학 풀이 + 서양 점성술 풀이 + 동서양 교차 종합 조언 (3단 구조)",
      "해당 주제의 시기·주의점·생활 행동 지침",
      "건강운 선택 시 월별 생활 리듬 점검 / 궁합 선택 시 상대 생시 입력 연동",
      "약 10페이지 주제 집중 PDF(마켓 주문 후 판매자 전달)",
    ],
    tip: "아래 카드에서 보고 싶은 운세 1개를 골라 구성을 미리 보세요. 사이트에서 즉시 PDF를 받지는 않습니다.",
  },
  triple: {
    badge: "맞춤 3종 · 약 30페이지",
    headline: "3가지 맞춤 패키지 — 필요한 세 갈래만",
    lead: "관심 있는 운세 3개를 골라 동서양 융합 분석을 묶음으로 받아 보세요. 가장 먼저 고른 항목부터 채워지며, 4개를 누르면 안내와 함께 교체됩니다.",
    pages: "선택한 3주제 합산 약 30페이지 분량의 맞춤 PDF 리포트",
    includes: [
      "원하는 개별운 3종 심층 풀이",
      "각 주제마다 동양 역학 + 서양 점성술 + 교차 종합 3단 분석",
      "주제별 행동 지침과 시기 요약",
      "정밀 궁합 포함 시 상대 생년월일시 반영",
      "3종 묶음 PDF(마켓 주문 후 판매자 전달)",
    ],
    tip: "아래 카드에서 3개까지 골라 구성을 미리 보세요. 실제 PDF는 크몽·당근 주문·결제 확인 후 전달됩니다.",
  },
  full: {
    badge: "풀 패키지 · 심층 분량",
    headline: "전체운·평생운 풀 패키지 — 한 권으로 끝내는 심층 리포트",
    lead: "9대 개별운 전체와 평생 총운, 10년 세운, 12개월 월운, 개운법까지 담은 소장용 패키지입니다. 선택 시 9개 항목이 모두 자동 선택됩니다.",
    pages: "심층 PDF(명식·구성에 따라 분량 상이 · 표지·목차에 실제 쪽수 표기, 통상 약 100페이지 전후)",
    includes: [
      "9대 개별운 전체 (결혼·정밀궁합·자녀·재물·직업승진·사업·이사매매·건강·여행운)",
      "동양 역학 + 서양 점성술 3단 교차 정밀 분석",
      "평생 총운 + 향후 10년 대운·세운 + 12개월 월별 운세",
      "심층 소장용 PDF(마켓 주문 후 판매자 전달 · 분량은 명식에 따라 다름)",
      "맞춤 개운법(음식·색·습관) 안내",
    ],
    tip: "풀 패키지는 사이트에서 결제·즉시 다운로드되지 않습니다. 크몽·당근 주문 후 판매자가 PDF를 전달합니다.",
  },
};

export function formatWon(value) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function priceFor(planId, selectedCount) {
  if (planId === "full") return PLANS.full.price;
  if (planId === "triple" || selectedCount >= 2) return PLANS.triple.price;
  return PLANS.single.price;
}

function byId(list, id) {
  return list?.find((item) => item.id === id);
}

function loveYearRows(forecast, limit = 4) {
  const love = byId(forecast, "love");
  return (love?.years || []).filter((item) => item.score >= 68).slice(0, limit);
}

function isMarried(reading) {
  return reading.profile?.status === "married";
}

function marriageSeasonHint(chart, married) {
  const fill = chart.strength.favorable[0];
  if (fill === "목" || fill === "화") {
    return married
      ? { seasons: "봄(3~5월)·초여름", reason: "목·화 기운이 도움이라 따뜻한 계절의 가족 행사·기념일이 몸에 덜 부담입니다." }
      : { seasons: "봄(3~5월)·초여름", reason: "목·화 기운이 도움이라 따뜻한 계절 예식이 몸에 덜 부담입니다." };
  }
  if (fill === "금" || fill === "수") {
    return married
      ? { seasons: "가을(9~11월)·초겨울", reason: "금·수 기운이 도움이라 선선한 계절의 가족 행사·기념일이 리듬에 잘 맞습니다." }
      : { seasons: "가을(9~11월)·초겨울", reason: "금·수 기운이 도움이라 선선한 계절 예식이 리듬에 잘 맞습니다." };
  }
  return married
    ? { seasons: "봄·가을", reason: "가족 행사·기념일·집안 대소사는 무더위·한파를 피한 봄·가을이 조율하기 쉽습니다." }
    : { seasons: "봄·가을", reason: "예식·상견례는 무더위·한파를 피한 봄·가을이 조율하기 쉽습니다." };
}

function bestMonthsForLove(reading) {
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  return months
    .filter((item) => item.score >= 68)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => `${item.month}월(${item.level} ${item.score}점)`);
}

function decadeMarriageHint(reading) {
  return (reading.guide?.decades || [])
    .filter((cycle) => cycle.score >= 68)
    .slice(0, 2)
    .map((cycle) => `${cycle.startYear}–${cycle.endYear}년 ${cycle.gzKo}(${cycle.level})`);
}

function formatPick(day) {
  const meta = day.purposes?.marriage || {};
  const flags = [];
  if (day.emptyHand || meta.emptyHand) flags.push("손 없는 날");
  if (meta.rel === "합") flags.push("일지 합");
  if (meta.rel === "충") flags.push("일지 충(주의)");
  if (meta.rel === "원진") flags.push("원진(주의)");
  if (meta.rel === "자형") flags.push("자형(주의)");
  return `${day.year || ""}.${day.month}.${day.day}(${day.weekday}) ${day.gzKo} · ${meta.level || ""} ${meta.score || ""}점${flags.length ? ` · ${flags.join("·")}` : ""}`;
}

function buildMarriageTaegilGuide(reading, partnerChart = null) {
  const married = isMarried(reading);
  const chart = reading.chart;
  const picks = reading.taegil?.picks?.marriage || [];
  const clashBranch = chart.dayBranch;
  const lines = married
    ? [
        "일정 조율은 ‘부부 소통과 가정 화목이 무난한 시기’ 안에서 가족 행사·기념일·집안 대소사를 서로 다른 날에 나누는 일입니다. 하루에 몰아넣지 마세요.",
        `피하면 좋은 날: ① 본인 일지(${koGz(clashBranch)} 계열)와 강하게 충·원진·자형으로 부딪히는 날 ② 감정이 예민해지기 쉬운 원진일 ③ 가족 일정이 겹쳐 서류·체력이 무너지는 날.`,
        "민속 기준으로 ‘손 없는 날’(음력으로 손이 쉬는 날)은 집안 대소사·이사에 자주 쓰입니다. 손 없는 날이라도 일지 충이 세면 후보에서 빼는 편이 안전합니다.",
        "날을 고르는 실전 순서: ① 가정 화목이 무난한 해·계절 안에서 후보 달을 고른다 → ② 그달에서 손 없는 날·일지 합이 겹치는 날을 우선한다 → ③ 가족 행사 / 기념일 / 집안 대소사를 서로 다른 날에 배치한다.",
      ]
    : [
        "택일(날짜 고르기)은 ‘길한 해’ 안에서 예식·혼인신고·상견례 날짜를 나누어 고르는 일입니다. 세 가지를 하루에 몰아넣지 마세요.",
        `피하면 좋은 날: ① 본인 일지(${koGz(clashBranch)} 계열)와 강하게 충·원진·자형으로 부딪히는 날 ② 감정이 예민해지기 쉬운 원진일 ③ 양가·하객 일정이 겹쳐 서류·체력이 무너지는 날.`,
        "민속 기준으로 ‘손 없는 날’(음력으로 손이 쉬는 날)은 혼사·이사에 자주 쓰입니다. 손 없는 날이라도 일지 충이 세면 후보에서 빼는 편이 안전합니다.",
        "길일을 고르는 실전 순서: ① 결혼 적기 해·계절 안에서 후보 달을 고른다 → ② 그달에서 손 없는 날·일지 합이 겹치는 날을 우선한다 → ③ 예식 / 혼인신고 / 상견례를 서로 다른 날에 배치한다.",
      ];
  if (picks.length) {
    lines.push(
      married
        ? `가까운 가족 행사·기념일 후보: ${picks.slice(0, 3).map(formatPick).join(" / ")}`
        : `가까운 결혼·상견례 길일 후보: ${picks.slice(0, 3).map(formatPick).join(" / ")}`,
    );
  } else {
    lines.push(
      married
        ? "택일 달력에서도 같은 기준으로 가족 일정 후보일을 더 볼 수 있습니다."
        : "택일 탭의 ‘결혼’ 목적에서도 같은 기준으로 후보일을 더 볼 수 있습니다.",
    );
  }

  let jointPicks = [];
  if (partnerChart && reading.taegil?.days?.length) {
    jointPicks = [...reading.taegil.days]
      .map((day) => {
        const self = day.purposes.marriage;
        const partner = scoreMarriageDay(partnerChart, day.gan, day.zhi, day.emptyHand);
        const score = Math.round((self.score + partner.score) / 2);
        return { ...day, jointScore: score, partnerRel: partner.rel, selfRel: self.rel };
      })
      .filter((day) => !["충", "자형"].includes(day.selfRel) && !["충", "자형"].includes(day.partnerRel))
      .sort((a, b) => b.jointScore - a.jointScore)
      .slice(0, 3);
    if (jointPicks.length) {
      lines.push(
        `두 사람 사주를 함께 보면, 양쪽 일지와 크게 충·자형하지 않으면서 점수가 고른 날: ${jointPicks
          .map((day) => `${day.year}.${day.month}.${day.day}(${day.gzKo}, 공동 ${day.jointScore}점${day.emptyHand ? ", 손 없는 날" : ""})`)
          .join(" / ")}`,
      );
      lines.push(
        married
          ? "같이 고른 날에도 가족 행사·기념일·집안 대소사를 하루에 몰지 마세요. 한쪽만 편한 날은 가벼운 기념일에, 둘 다 고른 날에 큰 집안 대소사를 두세요."
          : "공동 길일에도 예식·신고·상견례를 하루에 몰지 마세요. 한쪽만 편한 날은 상견례처럼 가벼운 일정에, 둘 다 고른 날에 예식·신고를 두세요.",
      );
    }
  }

  return {
    title: married ? "가족 일정 가이드(기념일·집안 대소사)" : "택일 가이드(예식·혼인신고·상견례)",
    lines,
    picks,
    jointPicks,
  };
}

function buildMarriageTiming(reading) {
  const married = isMarried(reading);
  const peaks = loveYearRows(reading.forecast);
  const season = marriageSeasonHint(reading.chart, married);
  const months = bestMonthsForLove(reading);
  const decades = decadeMarriageHint(reading);
  const love = byId(reading.forecast, "love");
  const yearLine = peaks.length
    ? married
      ? `세운(그해의 흐름)으로 부부 소통과 가정 화목이 무난한 시기: ${peaks.map((item) => `${item.year}년(${item.gzKo}, ${item.level})`).join(", ")}`
      : `세운(그해의 흐름)으로 혼담·예식 준비가 비교적 수월한 해: ${peaks.map((item) => `${item.year}년(${item.gzKo}, ${item.level})`).join(", ")}`
    : married
      ? "앞으로 몇 해는 큰 가족 행사를 급히 잡기보다, 부부 소통과 생활 리듬을 먼저 다지는 편이 맞습니다."
      : "앞으로 몇 해는 새 혼담을 급히 열기보다, 관계의 약속·생활 리듬을 먼저 다지는 편이 맞습니다.";
  const decadeLine = decades.length
    ? `대운(대략 10년 큰 흐름)에서 인연·생활이 움직이기 쉬운 구간: ${decades.join(", ")}`
    : married
      ? "대운에서는 큰 행사보다 주거·재정 기반이 잡히는 구간을 우선하세요."
      : "대운에서는 ‘화려한 예식’보다 주거·재정 기반이 잡히는 구간을 우선하세요.";
  const monthLine = months.length
    ? `올해(${reading.yearFortune?.defaultYear || "올해"}) 안에서 조율이 수월한 달: ${months.join(", ")}. 그중에서 ${season.seasons}를 우선 후보로 두세요.`
    : `계절 후보로는 ${season.seasons}가 무난합니다. ${season.reason}`;
  const closing = married
    ? "이 흐름은 부부 소통과 가정 화목이 무난한 시기이자, 가족 행사·기념일·집안 대소사를 조율하기 좋은 시기입니다."
    : love?.timingNote || love?.summary || "적기는 ‘사람’보다 ‘준비가 되는 때’로 읽습니다. 서류·주거·양가 일정이 열리는 해를 고르세요.";
  return {
    title: married ? "가정 화목 시기(부부 소통·가족 행사가 무난한 때)" : "결혼 적기(유리한 연도·계절/월)",
    lines: [yearLine, decadeLine, monthLine, season.reason, closing],
  };
}

function buildMarriage(reading) {
  const married = isMarried(reading);
  const timing = buildMarriageTiming(reading);
  const taegilGuide = buildMarriageTaegilGuide(reading, reading.partner?.chart || null);
  const peaks = loveYearRows(reading.forecast);
  const summary = married
    ? peaks.length
      ? `${reading.profile.statusLabel} 기준입니다. 부부 소통과 가정 화목이 무난한 시기는 ${peaks.map((item) => `${item.year}년`).join(", ")}이며, 가족 행사·기념일·집안 대소사는 그 안에서 나누어 조율하세요.`
      : `${reading.profile.statusLabel} 기준입니다. 당분간은 큰 행사보다 부부 소통과 가정 화목을 다지는 시기에 가깝습니다.`
    : peaks.length
      ? `${reading.profile.statusLabel} 기준 결혼·배우자 흐름입니다. 적기 후보는 ${peaks.map((item) => `${item.year}년`).join(", ")}이며, 날짜는 택일 가이드로 나누어 고르세요.`
      : `${reading.profile.statusLabel} 기준 결혼·배우자 흐름입니다. 당분간은 새 혼담보다 관계의 뼈대를 다지는 시기에 가깝습니다.`;
  return {
    summary,
    sections: [
      {
        title: "배우자운(어떤 사람과 어떻게 살면 편한가)",
        lines: [
          reading.profile.status === "married"
            ? "이미 배우자가 있다면, 새 인연보다 생활 달력·돈 이야기·잠자리 리듬을 같이 맞추는 능력이 배우자운을 살립니다."
            : "배우자는 화려한 말보다 세 번째 약속의 시간을 지키는 사람 쪽에서 인연이 깊어집니다. ‘재미있는 사람’과 ‘같이 살 사람’을 메모로 나눠 보세요.",
          `사회 태도(월주·십신)는 ${reading.chart.monthGod}에 가깝습니다. 바깥일·집안일·돈 정산의 역할 분담도 이 태도를 닮기 쉽습니다.`,
        ],
      },
    ],
    timing,
    taegilGuide,
    lifePlain: buildFamilyLifePlain("marriage", reading.chart, reading.guide, { married }),
  };
}

function buildCompatibility(reading) {
  const married = isMarried(reading);
  if (!reading.compat) {
    return {
      summary: "상대의 이름·생년월일시·성별을 입력하면 정밀 궁합이 열립니다.",
      sections: [
        {
          title: "안내",
          lines: [
            "아래 2인 궁합 입력란에 상대 정보를 넣고 ‘궁합 다시 계산’을 눌러 주세요.",
            "입력 후에는 일간·일지·띠의 합·충을 생활 문장으로 풀고, 함께 맞추기 좋은 시기와 택일 주의점도 보여 드립니다.",
          ],
        },
      ],
      waitingPartner: true,
      lifePlain: buildFamilyLifePlain("compatibility", reading.chart, reading.guide, {
        married,
        hasCompat: false,
      }),
    };
  }

  const partnerChart = reading.partner?.chart || null;
  const timing = buildMarriageTiming(reading);
  const taegilGuide = buildMarriageTaegilGuide(reading, partnerChart);
  const jointYears = loveYearRows(reading.forecast, 3);
  const jointLine = jointYears.length
    ? married
      ? `두 사람 기준으로도 부부 소통과 가정 화목이 무난한 시기: ${jointYears.map((item) => `${item.year}년(${item.level})`).join(", ")}. 가족 행사·기념일·집안 대소사를 조율하기 좋은 해입니다.`
      : `두 사람 기준으로도 혼담·예식 조율이 수월한 해 후보: ${jointYears.map((item) => `${item.year}년(${item.level})`).join(", ")}. 한쪽만 좋은 해보다, 양쪽 일정이 열리는 해를 고르세요.`
    : married
      ? "당장은 큰 가족 행사보다 생활 리듬(수면·연락·돈)을 맞추는 기간으로 두는 편이 안전합니다."
      : "당장은 예식 날짜보다 생활 리듬(수면·연락·돈)을 맞추는 기간으로 두는 편이 안전합니다.";

  return {
    summary: `${reading.compat.pair} 궁합 ${reading.compat.score}점 · ${reading.compat.level}`,
    sections: [
      {
        title: "두 사람의 온도",
        lines: reading.compat.lines,
      },
    ],
    timing: {
      title: married ? "함께 맞추기 좋은 시기" : "공동 결혼·예식 적기",
      lines: [jointLine, ...timing.lines.slice(1, 4)],
    },
    taegilGuide: {
      ...taegilGuide,
      title: married ? "가족 일정 가이드(두 사람 기준)" : "공동 택일 가이드(두 사람 기준)",
      lines: [
        married
          ? "두 사람 사주를 겹쳐 볼 때는 ‘한쪽만 편한 날’보다 ‘양쪽 일지와 크게 충·자형하지 않는 날’에 가족 행사·기념일·집안 대소사를 두세요."
          : "두 사람 사주를 겹쳐 볼 때는 ‘한쪽만 좋은 날’보다 ‘양쪽 일지와 크게 충·자형하지 않는 날’을 우선합니다.",
        ...taegilGuide.lines.slice(1),
      ],
    },
    lifePlain: buildFamilyLifePlain("compatibility", reading.chart, reading.guide, {
      married,
      hasCompat: true,
    }),
  };
}

/** 월별 생활 리듬 힌트 — 장기·질병 진단 표현 금지 */
const RHYTHM_MONTH = {
  목: ["움직임·스트레칭", "일정 밀도", "새 일과 휴식 균형"],
  화: ["수면·자극 조절", "대화·감정 소모", "쉬는 시간 확보"],
  토: ["식사 리듬", "생활 루틴", "여유 있는 페이스"],
  금: ["일정 정리", "마감·긴장 완화", "숨 고르기"],
  수: ["수분·휴식", "생각 정리 시간", "취침 전 여유"],
};

const DIR = { 목: "동쪽", 화: "남쪽", 토: "중앙·남서", 금: "서쪽", 수: "북쪽" };

function healthMonths(chart) {
  const weak = chart.strength.unfavorable[0] || chart.dayElement;
  const parts = RHYTHM_MONTH[weak] || RHYTHM_MONTH.토;
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const part = parts[index % parts.length];
    const caution = month % 3 === 0;
    return {
      month,
      body: part,
      tip: caution
        ? `${month}월은 ‘${part}’를 조금 더 챙기면 좋습니다. 수면과 따뜻한 식사부터 지키면 하루가 한결 편해지기 쉽습니다.`
        : `${month}월은 ‘${part}’만 가볍게 점검해 보세요. 무리한 일정을 하나 줄이는 것만으로도 충분합니다.`,
    };
  });
}

function buildChildren(reading) {
  const family = byId(reading.forecast, "family");
  const child = reading.dashboard?.character?.children;
  const married = isMarried(reading);
  return {
    summary: child?.summary || family?.summary || "자녀운은 완벽한 훈육법보다, 양육자의 생활 습관과 감정 안정에서 먼저 풀립니다.",
    sections: [
      {
        title: "자녀 인연과 성향",
        lines: [
          // summary는 주제 요약에만 두고 섹션 본문 중복을 피함
          ...([child?.detail, child?.timing].filter(Boolean)),
          "사주에서 자녀·양육은 ‘키우고 표현하는 기운’과 가족 흐름이 닿는 자리로 봅니다. 시기가 열려도 양육자 본인이 지쳐 있으면 인연의 온도가 먼저 식습니다.",
        ],
      },
      {
        title: "양육 태도(실제로 무엇을 하면 좋은가)",
        lines: [
          child?.tip || "아이와는 긴 훈계보다 짧은 칭찬과 함께하는 식사 한 끼가 인연을 깊게 합니다. 주 1회라도 같은 시간에 산책·식사를 약속해 보세요.",
          family?.summary || "가족 일정은 한 달력에 모으면 다툼이 줄어듭니다. ‘누가 언제 무엇을 하는지’가 보이면 잔소리가 줄고 협력이 늘니다.",
          "당신이 충분히 자고 먹은 날의 말투가, 아이와의 관계를 가장 크게 바꿉니다. 양육운의 첫 단추는 양육자의 수면입니다.",
        ],
      },
    ],
    lifePlain: buildFamilyLifePlain("children", reading.chart, reading.guide, { married }),
  };
}

function buildWealth(reading) {
  const wealth = byId(reading.forecast, "wealth");
  const decades = (reading.guide?.decades || [])
    .filter((cycle) => cycle.score >= 70)
    .slice(0, 3)
    .map((cycle) => `${cycle.startYear}–${cycle.endYear}년 ${cycle.gzKo}(${cycle.level})`);
  const vessel = buildWealthVesselLines(reading.chart);
  const lifePlain = buildWealthLifePlain(reading.chart, reading.guide);
  return {
    summary: wealth?.summary || reading.profile.wealth,
    sections: [
      {
        title: "재물 그릇(돈이 모이는 방식)",
        lines: [
          ...vessel,
        ],
      },
      {
        title: "대운(10년 흐름) 재물 시기 · 손재수",
        lines: [
          decades.length
            ? `재물이 움직이기 쉬운 대략 10년 단위 구간(대운): ${decades.join(", ")}. 이 구간에는 ‘투자 여부’보다 ‘장부와 계약이 깨끗한지’를 먼저 보세요.`
            : "대운에서는 화려한 확장보다 정리와 청구가 먼저인 해가 이득인 경우가 많습니다.",
          "손재수는 대개 보증·당일 큰 송금·비교 소비에서 옵니다. 좋은 소식일수록 하루를 자고 금액·날짜·역할을 문장으로 남기세요.",
          (reading.guide?.risks || []).find((risk) => risk.id === "money")?.remedy ||
            "큰돈은 구두 약속이 아니라 문서와 함께 움직이세요. 같이 쓰는 돈일수록 더 그렇습니다.",
        ],
      },
    ],
    lifePlain,
  };
}

const MAJOR_TRACKS = {
  목: {
    stream: "문과·예체능(기획·표현)에 힘이 실립니다",
    strength: "표현·기획·사람을 키우는 힘",
    majors: ["신문방송·미디어커뮤니케이션", "광고홍보·콘텐츠기획", "교육학·유아교육", "시각디자인·산업디자인", "경영학(마케팅·브랜드)"],
    tip: "글·기획안·발표로 성과가 보이는 전공이 잘 맞습니다.",
  },
  화: {
    stream: "문과·예체능(대인·무대)과 돌봄·상담 계열에 힘이 실립니다",
    strength: "표현·설득·분위기 만들기",
    majors: ["방송연예·공연예술", "심리상담·사회복지", "간호·보건행정", "호텔관광·이벤트", "마케팅·소비자학"],
    tip: "사람 앞에서 말하고 관계를 데우는 현장이 적성에 가깝습니다.",
  },
  토: {
    stream: "실무·경영·관리 계열에 힘이 실립니다",
    strength: "운영·신뢰·현장 조율",
    majors: ["경영학·행정학", "부동산학·도시계획", "호텔관광경영", "회계학·세무학", "물류·유통관리"],
    tip: "숫자와 사람 사이를 받치는 전공·직무가 오래갑니다.",
  },
  금: {
    stream: "이과·법무·금융처럼 기준이 분명한 계열에 힘이 실립니다",
    strength: "분석력·기준·품질 관리",
    majors: ["법학·경찰행정", "회계·금융·보험", "산업공학·품질경영", "정보보안·사이버", "건축·토목(시공·감리)"],
    tip: "규칙·서류·정확도가 점수인 전공이 강점을 살립니다.",
  },
  수: {
    stream: "이과·공학·연구(분석·IT) 계열에 힘이 실립니다",
    strength: "분석력·수리·흐름 설계",
    majors: ["컴퓨터공학·소프트웨어", "데이터사이언스·통계", "전자·전기공학", "화학·생명과학", "경제학·산업공학(전략·분석)"],
    tip: "데이터·실험·코드처럼 ‘읽고 설계하는’ 전공이 잘 맞습니다.",
  },
};

const GOD_MAJOR_TILT = {
  식신: { label: "표현·창작 기운(식신)", add: ["문예창작·스토리텔링", "요리·식품영양(실무 창작)"] },
  상관: { label: "기획·돌파 기운(상관)", add: ["창업·벤처경영", "UX·서비스디자인"] },
  정인: { label: "학업·문서 기운(정인)", add: ["문헌정보·기록관리", "교육학·교직 과정"] },
  편인: { label: "연구·특수 전문 기운(편인)", add: ["대학원·연구 트랙", "전문자격(세무·노무·변리) 연계 전공"] },
  정관: { label: "조직·합격 기운(정관)", add: ["행정고시·공공인재", "인사조직·노사관계"] },
  편관: { label: "현장·도전 기운(편관)", add: ["군사·경호·안전공학", "스포츠지도·체육학"] },
  정재: { label: "경영·실무 재물 기운(정재)", add: ["무역학·국제통상", "부동산·자산관리"] },
  편재: { label: "유통·기회 재물 기운(편재)", add: ["무역·물류", "영업관리·유통학"] },
  비견: { label: "동료·협업 기운(비견)", add: ["팀 프로젝트형 전공(공학설계·경영컨설팅)"] },
  겁재: { label: "경쟁·순발력 기운(겁재)", add: ["스포츠·e스포츠", "영업·경쟁 입시 트랙"] },
};

const SIGN_STREAM = {
  양: "이과·실무 현장에서 속도를 내는 쪽",
  황소: "실무·기술·감각 품질을 쌓는 쪽",
  쌍둥이: "문과·미디어·정보 전달 쪽",
  게: "돌봄·상담·교육·의료 보조 쪽",
  사자: "예체능·무대·브랜드 표현 쪽",
  처녀: "이과·분석·의료·품질 관리 쪽",
  천칭: "문과·법무·디자인·협상 쪽",
  전갈: "연구·심리·의료·심층 분석 쪽",
  사수: "문과·국제·교육·여행·법학 쪽",
  염소: "경영·법무·행정·장기 자격 쪽",
  물병: "이과·IT·혁신·네트워크 쪽",
  물고기: "예체능·상담·돌봄·치유 쪽",
};

function buildCareerMajors(reading) {
  const chart = reading.chart;
  const western = reading.western;
  const play = buildCareerPlaybook(chart);
  const track = MAJOR_TRACKS[chart.dayElement] || MAJOR_TRACKS.토;
  const tilt = GOD_MAJOR_TILT[chart.monthGod];
  const sun = western?.sun?.name;
  const mercury = western?.planets?.find((item) => item.id === "mercury");
  const mercurySign = mercury?.sign || sun;
  const westStream = SIGN_STREAM[mercurySign] || SIGN_STREAM[sun] || "본인 강점이 드러나는 실무 쪽";
  const pick = (play.majorTips || track.majors).slice(0, 6);
  const topJobs = (play.primaryFields || [])
    .map((f) => `【${f.name}】 ${(f.jobs || []).slice(0, 4).join(" · ")}`)
    .join(" / ");
  return {
    title: "맞춤 학과·전공·현대 직종 추천",
    lines: [
      `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength.label)} 기준으로 보면, 핵심은 ${play.topGroupLabel}과 용신·희신 ${play.yong}${play.hee?.length ? `·${play.hee.join("·")}` : ""} 기운입니다. ${track.stream}.`,
      `1순위 현대 직종 요약: ${topJobs || track.strength}.`,
      `추천 학과·전공: ① ${pick[0] || "관련 전공"} ② ${pick[1] || "관련 전공"} ③ ${pick[2] || "관련 전공"} ④ ${pick[3] || "관련 전공"}${pick[4] ? ` ⑤ ${pick[4]}` : ""}${pick[5] ? ` ⑥ ${pick[5]}` : ""}. ${play.majorTipText}`,
      tilt
        ? `월주 태도(${tilt.label})를 더하면 ${tilt.add.join("·")}도 후보에 올릴 만합니다.`
        : `월주 태도(${chart.monthGod})는 일터에서 성과를 인정받는 방식과도 맞닿아, 같은 계열의 세부 전공을 고를 때 참고하세요.`,
      `서양 점성술의 수성(${mercurySign || "학습"}자리)과 태양(${sun || "—"}자리)을 겹치면 ${westStream}에도 관심이 자연스럽습니다. PDF ‘진로 지침서 1·2’에 직종 전체 목록이 있습니다.`,
    ],
  };
}

function buildCareerExamTiming(reading) {
  const study = byId(reading.forecast, "study");
  const career = byId(reading.forecast, "career");
  const studyPeaks = (study?.years || [])
    .filter((item) => item.score >= 70)
    .slice(0, 3)
    .map((item) => `${item.year}년(${item.level}${item.gzKo ? `, ${item.gzKo}` : ""})`);
  const careerPeaks = (career?.years || [])
    .filter((item) => item.score >= 72)
    .slice(0, 3)
    .map((item) => `${item.year}년(${item.level})`);
  const studyCaution = (study?.years || [])
    .filter((item) => item.score > 0 && item.score < 55)
    .slice(0, 2)
    .map((item) => `${item.year}년(${item.level})`);
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  const goodMonths = [...months]
    .filter((item) => item.score >= 70)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => `${item.month}월(${item.level})`);
  const cautionMonths = [...months]
    .filter((item) => item.score > 0 && item.score < 58)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((item) => `${item.month}월(${item.level})`);
  const western = reading.western;
  const mercury = western?.planets?.find((item) => item.id === "mercury");
  const saturn = western?.planets?.find((item) => item.id === "saturn");

  return {
    title: "진학·입시·시험·이직 유리한 시기 및 주의점",
    lines: [
      studyPeaks.length
        ? `합격·학업·문서운이 비교적 강하게 들어오는 해: ${studyPeaks.join(", ")}. 이 해에 원서 접수·자격 필기·논문·포트폴리오 제출을 우선 배치하세요.`
        : "당장 학업 점수가 크게 열리는 해보다, 자격·서류·오답 노트를 쌓는 준비 해로 읽는 편이 실속을 남깁니다.",
      careerPeaks.length
        ? `이직·면접·승진 평가가 비교적 열리는 해: ${careerPeaks.join(", ")}. 진학 일정과 이직 일정을 같은 해에 몰지 말고 목표별로 해를 나누세요.`
        : "이직·평가는 지원 수를 늘리기보다, 대체 불가능한 실무·자격 증빙을 남기는 해가 먼저입니다.",
      goodMonths.length
        ? `${year}년 유리한 달(집중·서류·시험): ${goodMonths.join(", ")}. 원서 마감·필기·면접처럼 점수에 직결되는 일정을 이 달에 두세요.`
        : `${year}년은 큰 피크보다 매주 같은 시간대에 공부·서류 시간을 고정하는 쪽이 유리합니다.`,
      cautionMonths.length || studyCaution.length
        ? `준비·시험·면접 주의 시기(집중력 저하·실수): ${[...cautionMonths, ...studyCaution].slice(0, 4).join(", ")}. 이때는 신규 원서·충동 이직보다 모의고사·오답 정리·이력서 퇴고에 쓰세요.`
        : "주의 달이 뚜렷하지 않아도, 수면이 깨진 주에는 접수·면접을 하루 미루는 편이 안전합니다.",
      `수성(${mercury?.sign || "학습"}자리)은 서류·암기 실수, 토성(${saturn?.sign || "책임"}자리)은 장기 준비력을 봅니다. 시험 주에는 수성 실수(오기·일정 착오)만 체크리스트로 막으세요.`,
    ],
  };
}

function buildCareer(reading) {
  const career = byId(reading.forecast, "career");
  const nature = reading.dashboard?.cards?.find((card) => card.id === "aptitude")?.nature;
  const majors = buildCareerMajors(reading);
  const timing = buildCareerExamTiming(reading);
  const peakHint = (career?.years || []).filter((item) => item.score >= 72).slice(0, 2);
  const summary = peakHint.length
    ? `${career?.summary || reading.profile.career} 아래 ‘맞춤 학과·전공 추천’과 ‘진학·입시·시험·이직 시기’를 함께 보세요.`
    : `${career?.summary || reading.profile.career} 아래 학과·전공 추천과 시험·이직 시기를 함께 보세요.`;
  const lifePlain = buildCareerLifePlain(reading.chart, reading.guide, nature);
  return {
    summary,
    sections: [
      {
        title: "적성·잘 맞는 일의 방식",
        lines: [
          nature
            ? `잘 맞는 일의 방향은 ${nature.fit}입니다. ${nature.trait}`
            : reading.profile.career,
          `사회 태도(월주·십신)는 ${reading.chart.monthGod}에 가깝습니다. 상사·동료에게 보이는 인상과 일을 밀어가는 방식이 이 태도를 닮기 쉽습니다.`,
          nature?.slip
            ? `발목을 잡기 쉬운 습관은 ${nature.slip}입니다. 문서로 보완하면 평가가 또렷해집니다.`
            : "맡은 범위·마감·성과를 짧게 남겨 두면 평가가 선명해집니다.",
        ],
      },
    ],
    majors,
    timing,
    lifePlain,
  };
}

function buildBusiness(reading) {
  const wealth = byId(reading.forecast, "wealth");
  const strong = reading.chart.strength.strong;
  const solo = strong || reading.profile.role === "owner";
  const expandYears = (reading.tenYear?.years || [])
    .filter((item) => item.wealth.score >= 72)
    .slice(0, 3)
    .map((item) => `${item.year}년`);
  return {
    summary: solo
      ? "단독으로 밀고 나갈 힘이 있는 편입니다. 다만 장부·세무·재고처럼 숫자로 잠그는 부분은 한 사람에게 더 보여 주세요."
      : "동업·파트너와 역할을 나눌 때 사업이 안정됩니다. 시작 전에 지분·역할·종료 조건을 먼저 적어 두세요.",
    sections: [
      {
        title: "창업·확장 적기",
        lines: [
          wealth?.summary ||
            "매출 숫자보다 입금일과 미수금이 사업운의 본체입니다. ‘팔렸다’보다 ‘통장에 들어왔다’를 기준으로 보세요.",
          expandYears.length
            ? `확장·투자가 비교적 수월한 해: ${expandYears.join(", ")}. 그해에도 점포·채용·광고를 한 번에 늘리기보다 하나만 선택하세요.`
            : "앞으로 몇 해는 판을 키우기보다 현금 흐름과 단골을 남기는 해가 맞습니다.",
          "새 점포·신규 채용·큰 광고는 한 번에 하나만 여세요. 확장의 해에도 ‘잠그는 장부’가 있어야 돈이 남습니다.",
        ],
      },
      {
        title: "동업 / 단독",
        lines: [
          solo
            ? "단독이 유리한 편입니다. 다만 계약·세무·재고 숫자는 외부의 믿을 사람 한 명과 공유하면 실수가 크게 줄어듭니다."
            : "동업이 숨을 틔우는 편입니다. 역할·지분·출구(언제 어떻게 끝낼지) 조항을 계약서 첫 장에 두세요.",
          "친구와의 구두 동업은 손재수의 입구입니다. 사이가 좋을수록 금액·날짜·역할을 문서로 남겨 관계를 지키세요.",
        ],
      },
    ],
    lifePlain: buildPlanLifePlain("business", reading),
  };
}

function buildMoving(reading) {
  const move = byId(reading.forecast, "move");
  const qimen = reading.engines.find((item) => item.id === "qimen");
  const doors = qimen?.doors;
  const picks = reading.taegil?.picks?.move?.slice(0, 3) || [];
  const fill = reading.chart.strength.favorable[0];
  return {
    summary: move?.summary || "이사와 매매는 ‘좋은 집’보다 서류·등기가 깔끔히 열리는 날을 고르는 것이 절반입니다.",
    sections: [
      {
        title: "문서운·길한 시기",
        lines: [
          move?.summary || "등기·계약 서류가 깨끗한 날에 움직이세요. 현장 흥분이 큰 날과 계약 조건을 읽는 날을 하루 이상 나누면 실수가 줄어듭니다.",
          picks.length
            ? `가까운 이사·계약 후보일: ${picks.map((item) => `${item.month}월 ${item.day}일(${item.gzKo})`).join(", ")}. 후보일에도 현장 확인 전에는 계약금을 보내지 마세요.`
            : "택일 탭에서 이사·계약 길일(비교적 움직임이 수월한 날)을 함께 보세요.",
          "계약금은 현장 확인 전에 보내지 마세요. 문서운이 좋아도 ‘확인하지 않은 돈’은 위험을 키웁니다.",
        ],
      },
      {
        title: "방위·집 안 배치 안내",
        lines: [
          doors
            ? `방위·동선으로 생활 흐름을 보는 렌즈로 보면, 숨이 트이는 쪽은 ${doors.생문}, 일과 만남이 수월한 쪽은 ${doors.개문}, 피하면 좋은 쪽은 ${doors.사문}입니다.`
            : `집 안에서는 ${DIR[fill] || "밝은 쪽"}을 비우고 밝히면 마음이 편해집니다.`,
          `도움이 되는 기운은 ${fill}이라, ${DIR[fill] || "그 방향"}의 채광·통풍을 우선하세요. 낮뿐 아니라 저녁 소음·분위기까지 상상해 보면 ‘쉬는 집’인지 판단이 쉬워집니다.`,
          "침대는 문 바로 앞과 날카로운 모서리를 피하세요. 잠자리가 편해야 이사 후에도 운이 몸으로 느껴집니다.",
        ],
      },
    ],
    lifePlain: buildPlanLifePlain("moving", reading),
  };
}

function buildHealth(reading) {
  const health = byId(reading.forecast, "health");
  const months = healthMonths(reading.chart);
  const weak = reading.chart.strength.unfavorable[0];
  const lifePlain = buildHealthLifePlain(reading.chart, reading.guide);
  return {
    summary:
      health?.summary ||
      `나의 중심 기운이 ${reading.chart.dayElement}인 분은, ${weak} 기운이 과할 때 생활 리듬이 먼저 흔들리기 쉽습니다. 병명을 맞히기보다 ‘쉬는 칸이 부족한 달’을 먼저 보세요.`,
    sections: [
      {
        title: "오행으로 보는 생활 리듬",
        lines: [
          `당신의 중심은 ${dayMasterPhrase(reading.chart.dayMasterKo, reading.chart.dayElement)}이고, 지금은 ${strengthPhrase(reading.chart.strength.label)}입니다. 쉽게 말해 하루를 운영하는 ‘기본 온도’의 참고입니다.`,
          `과하면 부담이 되기 쉬운 기운은 ${favorBundlePhrase(reading.chart.strength.unfavorable.join("·"), "health")}, 채우면 편한 기운은 ${favorBundlePhrase(reading.chart.strength.favorable.join("·"), "health")}입니다. 거창한 처방보다 수면·식사·물을 그 온도에 맞게 맞추는 편이 현실적입니다.`,
          reading.guide?.table?.habit ||
            "식사 시간과 따뜻한 물만 지켜도 컨디션이 한결 고릅니다. 피곤이 오면 일정을 하나 줄이는 것이 가장 빠른 조절입니다.",
          "이 장은 생활 페이스 참고용이며, 사주로 질병·장기 이상·발병 시기를 진단하지 않습니다.",
        ],
      },
      {
        title: "월별 생활 리듬 점검",
        lines: months.map((item) => `${item.month}월 · ${item.body} — ${item.tip}`),
      },
    ],
    months,
    lifePlain,
  };
}

function buildTravel(reading) {
  const fill = reading.chart.strength.favorable[0];
  const qimen = reading.engines.find((item) => item.id === "qimen");
  const bestMonths = (reading.yearFortune?.byYear?.[reading.yearFortune.defaultYear]?.months || [])
    .filter((item) => item.score >= 70)
    .slice(0, 4)
    .map((item) => `${item.month}월`);
  return {
    summary: `기운을 북돋우는 기본 방향은 ${DIR[fill] || "밝은 쪽"}입니다. 여행은 ‘멀리 가는 것’보다 ‘마음이 넓어지고 몸이 회복되는 경험’으로 고르면 다녀와서도 에너지가 남습니다.`,
    sections: [
      {
        title: "길한 방향",
        lines: [
          `${fill} 기운이 도움이 되니, 여행·출장은 ${DIR[fill] || "채광 좋은 쪽"}을 우선하세요. 같은 거리라도 방향이 맞으면 피로가 덜한 경우가 많습니다.`,
          qimen?.doors
            ? `방위·동선 렌즈로 보면 일과 만남이 열리는 쪽은 ${qimen.doors.개문}, 휴식이 편한 쪽은 ${qimen.doors.휴문}입니다. 숙소·일정 방향을 고를 때 참고해 보세요.`
            : "숙소는 조용하고 밝은 방을 고르세요. 창이 있는 방이 회복에 유리합니다.",
          "피하면 좋은 흐름이 끼는 어두운 끝방·지하 숙소는 피하세요. 여행운이 좋아도 잠이 안 오면 체감이 떨어집니다.",
        ],
      },
      {
        title: "추천 시기",
        lines: [
          bestMonths.length
            ? `올해 떠나기 좋은 달(월운 점수 기준): ${bestMonths.join(", ")}. 목적이 하나인 2박 내외 여행이 잘 맞습니다.`
            : "점수 높은 달을 골라 2박 이내 짧은 여행부터 시작하세요.",
          "합·충이 센 달(서로 끌어당기거나 부딪히기 쉬운 달)에는 장거리·환승보다 근교에서 쉬는 편이 맞습니다.",
          "여행 전날·전전날 수면만 지켜도 여행운이 한 단계 올라갑니다. 출국·예약 전에 몸부터 맞춰 두세요.",
        ],
      },
    ],
    lifePlain: buildPlanLifePlain("travel", reading),
  };
}

function buildLifetime(reading) {
  const decades = reading.guide?.decades || [];
  const lifeFlow = buildDaYunLifeFlow(reading.chart, reading.guide);
  return {
    summary:
      reading.guide?.summary ||
      "평생의 큰 흐름은 대운(대략 10년 단위의 큰 물줄기)의 온도로 이어집니다. 좋은 대운에도 수면·관계·서류가 준비되지 않으면 체감이 약해집니다.",
    sections: [
      {
        title: "평생 총운",
        lines: [
          reading.guide?.summary,
          reading.bridge,
          `${dayMasterPhrase(reading.chart.dayMasterKo, reading.chart.dayElement)} · 지금은 ${strengthPhrase(reading.chart.strength.label)}입니다. 이 체질을 기준으로 대운·세운·월운을 읽으면 “왜 어떤 해는 편하고 어떤 해는 버거운지”가 선명해집니다.`,
        ].filter(Boolean),
      },
      {
        title: "10년 대운 줄거리",
        lines: decades
          .slice(0, 6)
          .map(
            (cycle) =>
              `${cycle.gzKo} ${cycle.startYear}–${cycle.endYear} · ${cycle.level} — ${cycle.text}`,
          ),
      },
    ],
    lifeFlow,
  };
}

const BUILDERS = {
  marriage: buildMarriage,
  compatibility: buildCompatibility,
  children: buildChildren,
  wealth: buildWealth,
  career: buildCareer,
  business: buildBusiness,
  moving: buildMoving,
  health: buildHealth,
  travel: buildTravel,
};

function topicActions(id, married) {
  if (id === "marriage" && married) {
    return [
      "부부 소통과 가정 화목이 무난한 시기에는 생활 달력·돈 이야기·기념일 하나만 같이 적어 두세요.",
      "가족 행사·기념일·집안 대소사는 하루에 몰지 말고, 서로 다른 날에 나누어 조율하세요.",
      "배우자와 “화났을 때 바로 말할 일, 하루 쉬고 말할 일”을 한 줄로 정해 두세요.",
    ];
  }
  if (id === "compatibility" && married) {
    return [
      "수면·연락·돈 씀씀이 차이를 가족 행사 전에 짧게 맞춰 보세요.",
      "의견이 부딪히면 큰 집안 대소사 전에 역할·일정을 문장으로 나누세요.",
      "가족 행사·기념일·집안 대소사는 같은 날에 몰아넣지 마세요.",
    ];
  }
  return TOPIC_ACTIONS[id];
}

function easeItem(item, wealth) {
  if (!item) return item;
  const line = (value) => easeSentence(value, { wealth });
  const lines = (list) => (list || []).map((entry) => line(entry));
  return {
    ...item,
    blurb: line(item.blurb),
    preview: line(item.preview),
    summary: line(item.summary),
    sections: (item.sections || []).map((section) => ({
      ...section,
      title: line(section.title),
      lines: lines(section.lines),
    })),
    timing: item.timing
      ? { ...item.timing, title: line(item.timing.title), lines: lines(item.timing.lines) }
      : item.timing,
    majors: item.majors
      ? { ...item.majors, title: line(item.majors.title), lines: lines(item.majors.lines) }
      : item.majors,
    taegilGuide: item.taegilGuide
      ? { ...item.taegilGuide, title: line(item.taegilGuide.title), lines: lines(item.taegilGuide.lines) }
      : item.taegilGuide,
    eastern: item.eastern
      ? { ...item.eastern, title: line(item.eastern.title), paragraphs: lines(item.eastern.paragraphs) }
      : item.eastern,
    western: item.western
      ? { ...item.western, title: line(item.western.title), paragraphs: lines(item.western.paragraphs) }
      : item.western,
    bridge: item.bridge
      ? { ...item.bridge, title: line(item.bridge.title), paragraphs: lines(item.bridge.paragraphs) }
      : item.bridge,
    lifePlain: item.lifePlain
      ? { title: line(item.lifePlain.title), lines: lines(item.lifePlain.lines) }
      : item.lifePlain,
    actions: lines(item.actions),
  };
}

export function buildCustomFortunePack(reading) {
  const western = reading.western || buildWesternAstrology(reading.chart);
  const enriched = { ...reading, western };
  const married = isMarried(reading);
  const items = CUSTOM_CATALOG.map((meta) => {
    const deep = BUILDERS[meta.id](enriched);
    const detailSections = (deep.sections || []).filter(
      (section) => !/적기|택일|가이드|시기|학과|전공/.test(section.title),
    );
    const sectionKeys = new Set(
      (deep.sections || []).flatMap((section) =>
        (section.lines || []).map((line) => String(line || "").replace(/\s+/g, "").slice(0, 48)),
      ),
    );
    const eastLines = buildTopicEastern(meta.id, reading.chart, meta.title, detailSections).filter(
      (line) => !sectionKeys.has(String(line || "").replace(/\s+/g, "").slice(0, 48)),
    );
    const west = westernTopicReading(western, meta.id, reading.profile);
    const bridge = crossAdvice(reading.chart, western, meta.id);
    const majors =
      meta.id === "career" ? deep.majors || buildCareerMajors(enriched) : deep.majors || null;
    const timing =
      meta.id === "career"
        ? deep.timing || buildCareerExamTiming(enriched)
        : deep.timing || null;
    const wealth = meta.id === "wealth";
    const copy =
      meta.id === "marriage" && married
        ? {
            blurb: "부부 소통과 가정 화목",
            preview: "부부 소통과 가정 화목이 무난한 시기, 가족 행사·기념일·집안 대소사를 조율하기 좋은 때를 풀어 드립니다.",
          }
        : meta.id === "compatibility" && married
          ? {
              blurb: "부부 생활 리듬",
              preview: "두 사람의 합·충을 보고, 가정 화목과 가족 행사를 조율하기 좋은 때를 함께 읽습니다.",
            }
          : { blurb: meta.blurb, preview: meta.preview };
    return easeItem({
      ...meta,
      ...copy,
      summary: deep.summary,
      sections: deep.sections,
      months: deep.months,
      timing,
      majors,
      taegilGuide: deep.taegilGuide || null,
      lifePlain: deep.lifePlain || null,
      waitingPartner: deep.waitingPartner || false,
      eastern: {
        title: "상세 원인 풀이 · 동양 역학",
        paragraphs: eastLines,
      },
      western: {
        title: "상세 원인 풀이 · 서양 점성술",
        paragraphs: [`이 주제의 렌즈: ${west.lens}`, ...west.paragraphs],
      },
      bridge: {
        title: "동서양 교차 한 줄",
        paragraphs: bridge,
      },
      actions: topicActions(meta.id, married) || [
        `${meta.title}에서 이번 주에 할 일 하나만 달력에 적으세요.`,
      ],
    }, wealth);
  });
  const lifetime = buildLifetime(enriched);
  return {
    items,
    western,
    lifetime: {
      ...lifetime,
      summary: easeSentence(lifetime.summary),
      sections: (lifetime.sections || []).map((section) => ({
        ...section,
        title: easeSentence(section.title),
        lines: (section.lines || []).map((entry) => easeSentence(entry)),
      })),
      lifeFlow: lifetime.lifeFlow
        ? {
            title: easeSentence(lifetime.lifeFlow.title),
            lines: (lifetime.lifeFlow.lines || []).map((entry) => easeSentence(entry)),
          }
        : null,
    },
    tenYearSummary: easeSentence(reading.tenYear?.summary || ""),
    tenYearPeaks: (reading.tenYear?.years || [])
      .slice(0, 3)
      .map((item) => easeSentence(`${item.year}년 ${item.gzLabel} ${item.level}`)),
  };
}


export function toggleCustomSelection(selected, id, planId) {
  const plan = PLANS[planId] || PLANS.single;
  const max = plan.max;
  const exists = selected.includes(id);
  if (exists) {
    return { selected: selected.filter((item) => item !== id), notice: "" };
  }
  if (planId === "full") {
    return { selected: CUSTOM_CATALOG.map((item) => item.id), notice: "" };
  }
  if (selected.length < max) {
    return { selected: [...selected, id], notice: "" };
  }
  if (max === 1) {
    return { selected: [id], notice: "1가지 모드에서는 선택한 항목이 교체됩니다." };
  }
  const next = [...selected.slice(1), id];
  return {
    selected: next,
    notice: `3가지까지 고를 수 있어, 가장 먼저 고른 항목을 내리고 ${CUSTOM_CATALOG.find((item) => item.id === id)?.title || "새 항목"}을 넣었습니다.`,
  };
}
