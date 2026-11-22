/** 대운·세운 ‘생활 속 운의 흐름’ — 기존 계산·전문 풀이 뒤에만 추가 */

import { koGz, tenGod } from "./ganzhi.js";

const STEM_FLOW = {
  갑: "큰 흐름을 볼 때, 새 판을 여는 힘과 ‘끝을 닫는 습관’을 같이 보면 생활이 안정됩니다.",
  을: "큰 흐름을 볼 때, 유연하게 맞추는 힘이 있으니 중요한 약속만 먼저 달력에 고정해 두면 좋습니다.",
  병: "큰 흐름을 볼 때, 사람과 자리가 먼저 데워지니 쉬는 시간도 일정에 넣어 두면 오래갑니다.",
  정: "큰 흐름을 볼 때, 꾸준히 밝히는 힘이 있으니 주간 할 일을 짧게 기록하는 습관이 도움이 됩니다.",
  무: "큰 흐름을 볼 때, 버티는 힘이 있으니 급한 결정보다 준비·점검 목록을 먼저 두면 흔들림이 덜합니다.",
  기: "큰 흐름을 볼 때, 생활의 디테일을 챙기는 힘이 있으니 작은 루틴을 지키는 편이 편안합니다.",
  경: "큰 흐름을 볼 때, 정리·기준이 분명하니 할 일을 줄이고 마감하는 쪽이 흐름에 잘 맞습니다.",
  신: "큰 흐름을 볼 때, 품질을 다듬는 힘이 있으니 완성도를 지키는 일정 관리가 도움이 됩니다.",
  임: "큰 흐름을 볼 때, 흐름을 읽는 힘이 있으니 ‘언제 움직일지’를 주 단위로 보면 선택이 가벼워집니다.",
  계: "큰 흐름을 볼 때, 세밀히 살피는 힘이 있으니 큰 결정보다 확인 목록을 짧게 두는 편이 맞습니다.",
};

const TG_THEME = {
  비견: "함께하거나 역할을 나누는 주제가 생활의 중심이 되기 쉽습니다.",
  겁재: "속도·경쟁이 느껴질 수 있으니, 비교보다 내 일정을 지키는 편이 안전합니다.",
  식신: "만들어 보이는 일·결과물이 주제가 되기 쉽습니다. 한 가지만 끝까지 가져가 보세요.",
  상관: "아이디어와 말이 많아지기 쉽습니다. 말보다 짧은 기록을 남기면 흐름이 정리됩니다.",
  편재: "바깥 기회·이동이 보이기 쉽습니다. 다만 ‘된다’고 단정하지 말고 조건부터 적어 보세요.",
  정재: "생활비·실무·정산이 주제가 되기 쉽습니다. 숫자와 날짜를 같이 보면 마음이 놓입니다.",
  편관: "책임·압박이 느껴질 수 있습니다. 권한과 기한을 먼저 확인하는 것이 참고가 됩니다.",
  정관: "원칙·자리·절차가 주제가 되기 쉽습니다. 공식 루트를 따르면 일이 덜 꼬입니다.",
  편인: "혼자 파는 공부·특수 주제가 붙기 쉽습니다. 한 사람에게만 공유해도 충분합니다.",
  정인: "배움·문서·도움이 주제가 되기 쉽습니다. 자료 정리부터 하면 다음 선택이 쉬워집니다.",
};

const SCORE_PACE = {
  high: "움직임이 비교적 수월한 흐름으로 읽힙니다. 그래도 한 번에 모두 벌리기보다 우선순위 하나가 핵심입니다.",
  mid: "차근히 쌓는 흐름으로 읽힙니다. 속도보다 확인과 마감이 생활의 점수가 됩니다.",
  low: "속도를 낮추는 편이 편한 흐름으로 읽힙니다. 큰 결정보다 정리·휴식·서류 점검이 참고가 됩니다.",
};

function paceFromScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return SCORE_PACE.mid;
  if (n >= 74) return SCORE_PACE.high;
  if (n >= 58) return SCORE_PACE.mid;
  return SCORE_PACE.low;
}

function actionFromScore(score, kind) {
  const n = Number(score);
  if (kind === "dayun") {
    if (Number.isFinite(n) && n >= 74) {
      return "준비·점검할 일 한 가지: 앞으로 1년 안에 손볼 일 목록을 세 줄만 적어 우선순위 하나를 정하세요.";
    }
    if (Number.isFinite(n) && n < 58) {
      return "준비·점검할 일 한 가지: 이번 달 ‘하지 않을 일’ 하나를 정해 달력에 표시해 두세요.";
    }
    return "준비·점검할 일 한 가지: 수면·서류·약속 중 이번 주에 확인할 칸 하나만 고르세요.";
  }
  if (Number.isFinite(n) && n >= 74) {
    return "실천할 일 한 가지: 미뤄 둔 일 중 하나만 골라 이번 주 날짜를 정하세요.";
  }
  if (Number.isFinite(n) && n < 58) {
    return "실천할 일 한 가지: 큰 약속 하나를 보류하고, 확인이 필요한 서류·일정을 먼저 정리하세요.";
  }
  return "실천할 일 한 가지: 이번 주 할 일 목록에서 끝까지 마칠 것 하나만 남기세요.";
}

function decadeFocus(guide, chart) {
  const decades = guide?.decades || [];
  const year = guide?.year || chart?.solar?.year || new Date().getFullYear();
  const current = decades.find((c) => year >= c.startYear && year <= c.endYear);
  const scored = decades.find((c) => typeof c.score === "number" && c.gz && c.gzKo !== "대운 전");
  return current || scored || decades.find((c) => c.gz) || null;
}

/**
 * 대운 해석 맨 뒤용 — 전체 흐름 조언만 (재물·직업·가족·건강 lifePlain과 주제 중복 최소화)
 */
export function buildDaYunLifeFlow(chart, guide) {
  const lines = [];
  const stem = chart?.dayMasterKo;
  const focus = decadeFocus(guide, chart);
  const forward = chart?.daYun?.forward;
  const startText = chart?.daYun?.startText;

  if (stem && STEM_FLOW[stem]) lines.push(STEM_FLOW[stem]);
  else {
    lines.push(
      "큰 흐름을 볼 때, 일간 정보가 부족하면 일반적인 참고로만 말씀드립니다. 10년 단위에서는 ‘밀기’와 ‘기다리기’를 번갈아 두면 생활이 편해집니다.",
    );
  }

  if (typeof forward === "boolean") {
    lines.push(
      forward
        ? "이 사주의 대운은 순행으로 읽힙니다. 흐름이 앞으로 이어지니, 준비된 일부터 차례로 점검하면 됩니다."
        : "이 사주의 대운은 역행으로 읽힙니다. 흐름이 되짚어 가니, 서두르기보다 정리·확인이 먼저인 구간이 있을 수 있습니다.",
    );
  }

  if (focus?.gzKo && focus.gzKo !== "대운 전") {
    const gan = focus.gz?.[0];
    const tg = gan && chart?.dayStem ? tenGod(chart.dayStem, gan) : "";
    const theme = TG_THEME[tg] || "";
    const level = focus.level ? ` (${focus.level})` : "";
    lines.push(
      `자료상 주목 구간은 ${focus.startYear}–${focus.endYear}년 ${focus.gzKo}${level}입니다. ${theme || ""}`.trim(),
    );
    lines.push(paceFromScore(focus.score));
  } else {
    lines.push(
      "지금은 뚜렷한 대운 간지 자료가 부족합니다. 추측하지 않고, 올해 안에서 준비·점검할 일 하나만 정해 두세요.",
    );
  }

  if (startText) {
    lines.push(
      `대운 시작 표기는 기존 계산값(${startText})을 그대로 사용합니다. 절입·표준시 보정에 따라 만세력마다 차이가 날 수 있어, 임의로 바꾸지 않았습니다.`,
    );
  }

  lines.push(actionFromScore(focus?.score, "dayun"));
  lines.push(
    "이 안내는 전통 명리학의 참고 해석이며, 특정 연도에 반드시 큰돈을 벌거나 실직·큰 불행이 생긴다고 단정하지 않습니다.",
  );

  return {
    title: "생활 속 운의 흐름",
    lines: lines.filter(Boolean).slice(0, 6),
  };
}

/**
 * 세운(연도) 해석 맨 뒤용 — 해당 해의 전체 흐름만
 */
export function buildYearLifeFlow(chart, yearRow) {
  const lines = [];
  const year = yearRow?.year;
  const gzKo = yearRow?.gzKo || (yearRow?.gz ? koGz(yearRow.gz) : "");
  const score = yearRow?.score;
  const level = yearRow?.level;
  const gan = yearRow?.gan || yearRow?.gz?.[0];
  const tg = gan && chart?.dayStem ? tenGod(chart.dayStem, gan) : "";

  if (year && gzKo) {
    const levelBit = level ? `(${level})` : "";
    lines.push(
      `${year}년 ${gzKo} 세운${levelBit}은, 한 해의 ‘밀지/기다릴지’ 온도를 보는 참고 자료입니다.`,
    );
  } else {
    lines.push("해당 연도 세운 간지 정보가 부족합니다. 일반적인 참고로만 읽어 주세요.");
  }

  if (tg && TG_THEME[tg]) lines.push(`올해 주목할 생활 주제: ${TG_THEME[tg]}`);
  else lines.push("올해 주목할 생활 주제: 수면·약속·서류처럼 생활의 기본기를 지키는 일입니다.");

  lines.push(paceFromScore(score));
  if (Number.isFinite(Number(score)) && Number(score) < 58) {
    lines.push("신중히 살필 부분: 급한 약속·큰 결정을 하루 미뤄 보고, 확인이 필요한 항목부터 챙기세요.");
  } else if (Number.isFinite(Number(score)) && Number(score) >= 74) {
    lines.push("신중히 살필 부분: 기회가 보여도 한 번에 모두 벌리지 말고, 우선순위 하나만 실행하세요.");
  } else {
    lines.push("신중히 살필 부분: 말보다 날짜·역할을 짧게 남겨 두면 오해가 줄어듭니다.");
  }

  lines.push(actionFromScore(score, "year"));
  lines.push(
    "이 안내는 참고 해석이며, 해당 연도에 질병이나 큰 손실이 반드시 생긴다고 예측하지 않습니다.",
  );

  return {
    title: "생활 속 운의 흐름",
    lines: lines.filter(Boolean).slice(0, 6),
  };
}
