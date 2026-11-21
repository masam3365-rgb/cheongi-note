import { Solar } from "lunar-javascript";
import {
  STEM_ELEMENT,
  branchRelation,
  clamp,
  koGz,
  levelFromScore,
  tenGod,
} from "./ganzhi.js";
import { monthMeta } from "./monthLabel.js";
import { easeSentence } from "./plainTerms.js";

const LIFE = {
  정재: "월급, 받을 돈, 생활비가 이 10년의 중심입니다. 들어오는 돈을 바로 적으면 새지 않습니다.",
  편재: "사업과 외출, 움직이는 돈이 늘어납니다. 판을 키울 때는 한 번에 한 계약만 여세요.",
  식신: "손기술, 콘텐츠, 먹고 만드는 일에서 인정과 수입이 같이 옵니다.",
  상관: "아이디어는 빠른데 말과 지출이 먼저 나갑니다. 단가와 마감을 미리 적으세요.",
  정관: "승진, 채용, 자격처럼 이름이 붙는 기회가 열립니다. 기한과 평판을 지키면 자리가 남습니다.",
  편관: "압박과 책임, 갑작스러운 보직 이야기가 나올 수 있습니다. 권한의 범위를 글로 남기면 소모가 줄어듭니다.",
  정인: "자격, 문서, 공부를 쌓는 10년입니다. 당장의 현금보다 간판과 실력이 나중에 돈이 됩니다.",
  편인: "혼자 파는 기술과 특수 분야가 맞습니다. 계산은 한 사람에게 더 보여 주세요.",
  비견: "내 몫을 지키는 힘이 셉니다. 같이 하는 일은 지분과 역할을 먼저 적으세요.",
  겁재: "경쟁과 새는 돈이 겹칩니다. 보증, 큰 베팅, 말로만 한 돈 약속은 이 구간의 함정입니다.",
};

const MONTH_CHANCE = {
  정재: "들어올 돈을 청구하고 정산하기 좋습니다. 고정 수입을 먼저 확보하세요.",
  편재: "소개와 외근에서 일이 붙습니다. 작은 거래를 하나 성사시키기에 좋은 달입니다.",
  식신: "결과물을 내놓으면 반응이 옵니다. 먹고 나누는 자리가 기회로 이어집니다.",
  상관: "제안과 발표가 눈에 띕니다. 초안을 빨리 보여주고 수정을 받으세요.",
  정관: "지원, 면접, 계약 도장을 진행하기 좋습니다. 공식 절차가 나를 도와줍니다.",
  편관: "급한 일을 맡으면 존재감이 커집니다. 역할을 좁혀 받으면 성과가 남습니다.",
  정인: "공부, 자격, 서류 정리가 다음 기회의 밑천이 됩니다.",
  편인: "남들이 안 보는 자료를 파면 답이 나옵니다. 조용한 시간이 무기입니다.",
  비견: "동료와 역할을 나누면 속도가 납니다. 내 영역을 한 줄로 말해 두세요.",
  겁재: "경쟁이 붙는 달이라 기존 고객과 기존 계약을 지키는 쪽이 이득입니다.",
};

const MONTH_CAUTION = {
  정재: "소액 구독과 할부가 쌓이기 쉽습니다. 결제 내역을 한 번 훑으세요.",
  편재: "좋은 말만 듣고 송금하기 쉽습니다. 계좌는 확인하고 계약서를 받으세요.",
  식신: "즐거움이 과식과 야식으로 이어집니다. 약속 사이 끼니 시간을 비우세요.",
  상관: "솔직한 말이 지적처럼 들립니다. 문자로 보낼 문장은 한 번 낮춰 쓰세요.",
  정관: "규정을 어기면 바로 기록이 남습니다. 지각, 세금, 신고 기한을 먼저 보세요.",
  편관: "압박이 말실수와 서두름으로 나옵니다. 서명 전에 하루를 두세요.",
  정인: "생각이 많아 실행이 늦어집니다. 자료만 모으고 끝내지 마세요.",
  편인: "걱정이 잠을 깨웁니다. 밤중 검색과 단톡을 줄이세요.",
  비견: "내 방식이 맞다는 고집이 갈등을 키웁니다. 양보할 항목을 하나 정해 두세요.",
  겁재: "빌려 주기, 보증, 충동 구매가 손실로 남습니다. 당일 큰돈은 멈춤이 답입니다.",
};

const FOOD = {
  목: {
    name: "초록 기운",
    foods: ["시금치", "브로콜리", "새싹 채소", "키위"],
    habit: "아침을 거르지 말고, 식전에 신 과일 몇 조각을 드세요. 녹색 채소를 하루 한 번은 식탁에 올리세요.",
  },
  화: {
    name: "따뜻한 기운",
    foods: ["토마토", "파프리카", "대추차", "따뜻한 수프"],
    habit: "얼음물 대신 미지근한 물을 두세요. 저녁을 과하게 먹으면 잠이 얕아지므로 식사 시간을 정해 두세요.",
  },
  토: {
    name: "중심 기운",
    foods: ["고구마", "단호박", "잡곡밥", "노란 콩"],
    habit: "식사 시간을 고정하세요. 단 간식은 끼니 뒤에만 두고, 걱정이 밀려올 때는 따뜻한 죽으로 속을 달래세요.",
  },
  금: {
    name: "맑은 기운",
    foods: ["배", "무", "흰 살 생선", "도라지차"],
    habit: "매운 야식을 줄이세요. 목이 마르면 미지근한 차를 마시고, 실내 공기를 한 번씩 바꿉니다.",
  },
  수: {
    name: "검은 기운",
    foods: ["검은콩", "미역", "김", "따뜻한 국물"],
    habit: "찬 음료와 잠들기 전 커피를 줄이세요. 저녁에는 국물 한 그릇으로 몸을 식히지 말고 데우세요.",
  },
};

const SWATCH = {
  목: ["#2f6b4f", "#8fbf7a"],
  화: ["#c4524a", "#e7a0b4"],
  토: ["#c6a15b", "#d8c3a5"],
  금: ["#f4f1ea", "#c5c9d1"],
  수: ["#1d3557", "#0e1a2b"],
};

const COLOR_NAME = {
  목: "초록·민트",
  화: "코랄·분홍",
  토: "베이지·머스타드",
  금: "화이트·실버",
  수: "네이비·블랙",
};

function batchim(word) {
  const ch = [...String(word)].pop();
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

function monthGanzhi(year, month) {
  const eight = Solar.fromYmd(year, month, 15).getLunar().getEightChar();
  return { gan: eight.getMonthGan(), zhi: eight.getMonthZhi() };
}

function lacking(chart) {
  return [...chart.strength.favorable].sort((a, b) => chart.count[a] - chart.count[b])[0];
}

function scorePair(chart, gan, zhi) {
  const tg = tenGod(chart.dayStem, gan);
  const element = STEM_ELEMENT[gan];
  const weights = { 정재: 10, 편재: 8, 식신: 8, 정관: 6, 정인: 4, 상관: 2, 편관: -4, 편인: 0, 비견: -2, 겁재: -10 };
  let score = 62 + (weights[tg] || 0);
  if (chart.strength.favorable.includes(element)) score += 8;
  if (chart.strength.unfavorable.includes(element)) score -= 6;
  const relDay = branchRelation(chart.dayBranch, zhi);
  if (relDay === "충") score -= 8;
  if (relDay === "합") score += 6;
  if (relDay === "원진") score -= 4;
  score = clamp(score, 18, 96);
  return { score, level: levelFromScore(score), tg, element, relDay, zhi };
}

function buildDecades(chart) {
  let previous = null;
  return chart.daYun.cycles.map((cycle) => {
    const raw = cycle.gz || "";
    const gan = raw[0];
    const zhi = raw[1];
    if (!gan || !STEM_ELEMENT[gan]) {
      return {
        ...cycle,
        score: 58,
        level: "평",
        turning: false,
        text: "큰 운의 줄기가 시작되기 전입니다. 집안의 온도와 생활 리듬이 이 시기의 바탕이 됩니다. 무리한 독립과 큰돈 결정보다 체력과 공부 습관을 남기세요.",
        turnNote: "",
      };
    }
    const meta = scorePair(chart, gan, zhi);
    const helpful = chart.strength.favorable.includes(meta.element);
    const flip = previous && previous.helpful !== helpful;
    const clash = meta.relDay === "충";
    const jump = previous && Math.abs(meta.score - previous.score) >= 12;
    const turning = Boolean(flip || clash || jump);
    let turnNote = "";
    if (flip) turnNote = helpful ? "막혀 있던 일이 풀리기 시작하는 전환입니다." : "달리던 속도를 낮추고 정리로 돌아서는 전환입니다.";
    else if (clash) turnNote = "자리, 계약, 몸이 흔들리는 고비입니다. 날짜를 서두르지 마세요.";
    else if (jump) turnNote = "이전 10년과 온도가 확 달라지는 구간입니다.";
    const tone = helpful
      ? cycle.startAge < 20
        ? "배움과 체력이 쌓이는 10년입니다. 관심 있는 일을 하나씩 끝까지 해 보세요."
        : "힘을 써도 되는 10년입니다. 미뤄 둔 자격, 이직, 살림의 판을 하나씩 여세요."
      : cycle.startAge < 20
        ? "서두르기보다 몸과 생활 리듬을 지키는 10년입니다. 비교와 과한 스케줄은 내려놓으세요."
        : "벌리는 10년보다 지키는 10년입니다. 빚, 보증, 과로는 이 구간에 남기지 마세요.";
    const text = `${cycle.startYear}년부터 ${cycle.endYear}년까지, ${cycle.startAge}세에서 ${cycle.endAge}세의 흐름입니다. ${tone} ${LIFE[meta.tg] || ""}`;
    previous = { helpful, score: meta.score };
    return { ...cycle, score: meta.score, level: meta.level, turning, turnNote, text: easeSentence(`${text} ${turnNote}`.trim()) };
  });
}

function relationLine(relDay) {
  if (relDay === "충")
    return "일정이 겹치고 몸이 먼저 신호를 보냅니다. 이사·큰 계약은 하루 여유를 두고, 진료·수술 일정은 운세가 아니라 의료진의 판단에 따르세요.";
  if (relDay === "합") return "사람과 약속이 자연스럽게 붙기 쉽습니다. 미팅과 소개를 이 달에 잡아 보세요.";
  if (relDay === "원진") return "감정은 남는데 말이 어긋나기 쉽습니다. 중요한 이야기는 만나서 짧게 하세요.";
  return "";
}

export function buildYearMonths(chart, year) {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const gz = monthGanzhi(year, month);
    const meta = scorePair(chart, gz.gan, gz.zhi);
    const extra = relationLine(meta.relDay);
    const label = monthMeta(year, month, gz.gan, gz.zhi);
    return {
      ...label,
      score: meta.score,
      level: meta.level,
      chance: [MONTH_CHANCE[meta.tg], extra && meta.relDay === "합" ? extra : ""].filter(Boolean).join(" "),
      caution: [MONTH_CAUTION[meta.tg], extra && meta.relDay !== "합" ? extra : ""].filter(Boolean).join(" "),
    };
  });
}

function buildPalette(chart) {
  const roles = chart.strength.roles;
  const wear = lacking(chart);
  const money = chart.strength.favorable.includes(roles.wealth) ? roles.wealth : wear;
  const people = chart.strength.favorable.includes(roles.child) ? roles.child : wear;
  return {
    wear,
    money,
    people,
    items: [
      {
        id: "wear",
        title: "매일 입는 색",
        element: wear,
        name: COLOR_NAME[wear],
        swatches: SWATCH[wear],
        text: `${COLOR_NAME[wear]}${batchim(COLOR_NAME[wear]) ? "을" : "를"} 셔츠, 니트, 가방에 두면 우선 도움 기운 중 가장 모자란 ${wear}이 생활 속에서 채워지기 쉽습니다.`,
      },
      {
        id: "money",
        title: "재물운 포인트",
        element: money,
        name: COLOR_NAME[money],
        swatches: SWATCH[money],
        text: `지갑, 카드 케이스, 계약하러 가는 날의 소품은 ${COLOR_NAME[money]}${batchim(COLOR_NAME[money]) ? "이" : "가"} 맞습니다. 돈 이야기 자리에 이 색을 하나 두면 정리가 쉬워집니다.`,
      },
      {
        id: "people",
        title: "인기운 포인트",
        element: people,
        name: COLOR_NAME[people],
        swatches: SWATCH[people],
        text: `모임과 소개 자리에는 ${COLOR_NAME[people]}${batchim(COLOR_NAME[people]) ? "을" : "를"} 스카프, 양말, 네일처럼 작은 면적으로 쓰세요. 첫인상이 부드러워집니다.`,
      },
    ],
  };
}

function buildTable(element) {
  return { element, ...FOOD[element] };
}

function buildRisks(chart, engines) {
  const gods = chart.pillars.map((pillar) => pillar.shiShen);
  const branches = chart.pillars.map((pillar) => pillar.zhi);
  const clash = branches.some((branch) => branch !== chart.dayBranch && branchRelation(chart.dayBranch, branch) === "충");
  const harm = branches.some((branch) => branchRelation(chart.dayBranch, branch) === "원진");
  const door = engines.qimen.doors;
  const risks = [];
  if (gods.includes("편관") || chart.monthGod === "편관" || gods.filter((god) => god === "정관" || god === "편관").length >= 2) {
    risks.push({
      id: "law",
      title: "관재와 서류 문제",
      warning: "벌금, 계약 분쟁, 윗사람과의 마찰이 문서로 남기 쉬운 흐름입니다. 말다툼이 기록으로 이어질 수 있습니다.",
      remedy: `세금·보험·계약 기한은 사흘 전에 끝내세요. 현관과 ${door.개문} 쪽은 밝게 비우고, 다툼 내용은 감정이 빠진 문자로만 남기세요.`,
    });
  }
  if (clash || gods.includes("편관") || branches.includes(chart.specials.yeokma)) {
    risks.push({
      id: "accident",
      title: "사고와 몸 부상",
      warning: "이동이 잦거나 일정이 부딪히면 발, 허리, 교통 사고가 따라오기 쉽습니다. 피곤한 날의 운전과 야근이 겹치면 신호가 커집니다.",
      remedy: "급한 날에는 대중교통과 충분한 수면을 먼저 고르세요. 침대는 문 바로 앞과 날카로운 모서리를 피하고, 밤길은 밝은 신발을 신으세요.",
    });
  }
  if (gods.includes("겁재") || gods.includes("비견") || harm) {
    risks.push({
      id: "people",
      title: "사람 사이의 갈등",
      warning: "친구, 동료, 가족 사이에서 비교와 서운함이 커지기 쉽습니다. 애매한 호감과 편들기가 관계를 흐립니다.",
      remedy: "돈과 역할이 걸린 약속은 단톡이 아니라 둘만의 문장으로 확인하세요. 집에서는 식탁 자리를 고정하고, 편을 들기 전에 사실부터 듣습니다.",
    });
  }
  if (gods.includes("겁재") || chart.strength.unfavorable.includes(chart.strength.roles.wealth)) {
    risks.push({
      id: "money",
      title: "금전 손실",
      warning: "보증, 빌려 준 돈, 한 번에 넣는 투자가 빠져나가기 쉽습니다. 좋은 소식일수록 당일 송금을 조심하세요.",
      remedy: `큰돈은 하루 자고 결정하세요. 통장과 도장은 ${door.생문} 쪽에 두고, 사문 ${door.사문}에는 지갑과 중요 서류를 두지 마세요.`,
    });
  }
  if (risks.length < 2) {
    risks.push({
      id: "steady",
      title: "방심에서 오는 새는 운",
      warning: "크게 터지는 액보다, 미룬 병원·보험·점검이 나중에 비용이 됩니다.",
      remedy: "분기에 한 번 건강 검진과 보험 특약을 보고, 현관 조명을 밝게 유지하세요. 버리는 물건은 사문 쪽에 하룻밤도 쌓아 두지 마세요.",
    });
  }
  return risks.slice(0, 4);
}

function lead(chart, lack, decades, year) {
  const current = decades.find((cycle) => year >= cycle.startYear && year <= cycle.endYear);
  const turns = decades.filter((cycle) => cycle.turning);
  const turnText = turns.length
    ? `삶의 결이 바뀌는 구간은 ${turns.map((cycle) => `${cycle.startYear}년`).join(", ")}입니다.`
    : "10년마다 온도는 조금씩 달라지고, 급하게 뒤집히는 고비는 크지 않습니다.";
  const nowText = current
    ? `지금 밟고 있는 10년은 ${current.startYear}–${current.endYear}년 ${current.gzKo}입니다.`
    : "지금 시기는 큰 운의 사이입니다.";
  const label = chart.strength.strong ? "버티는 힘이 센 편" : "옆에서 채워 줘야 편한 편";
  const help = chart.strength.favorable.join("·");
  return `${chart.dayMasterKo}${chart.dayElement} 기운이고, ${label}입니다. 우선 도움 기운은 ${help}이며, 식탁과 옷으로 먼저 채울 기운은 그중 가장 모자란 ${lack}입니다. ${nowText} ${turnText}`;
}

export function buildLifeGuide(chart, engines) {
  const year = new Date().getFullYear();
  const lack = lacking(chart);
  const decades = buildDecades(chart);
  return {
    year,
    summary: easeSentence(lead(chart, lack, decades, year)),
    lack,
    lackName: FOOD[lack].name,
    decades,
    months: buildYearMonths(chart, year),
    palette: buildPalette(chart),
    table: buildTable(lack),
    risks: buildRisks(chart, engines),
  };
}
