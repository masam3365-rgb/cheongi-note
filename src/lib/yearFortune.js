import { Solar } from "lunar-javascript";
import {
  STEM_ELEMENT,
  branchRelation,
  clamp,
  koDiShi,
  koGz,
  levelFromScore,
  mainStem,
  stemRelation,
  tenGod,
} from "./ganzhi.js";
import { MONTH_BASIS_NOTE, monthMeta } from "./monthLabel.js";
import { easeSentence } from "./plainTerms.js";

const WEALTH_W = { 정재: 12, 편재: 10, 식신: 8, 정관: 4, 정인: 2, 상관: 3, 편관: -3, 편인: 0, 비견: -4, 겁재: -12 };
const CAREER_W = { 정관: 12, 편관: 8, 정인: 7, 편인: 5, 식신: 6, 상관: 4, 정재: 3, 편재: 2, 비견: -2, 겁재: -6 };
const REL_W = { 식신: 8, 상관: 6, 정재: 5, 편재: 7, 정관: 4, 편관: -2, 정인: 3, 편인: 1, 비견: 2, 겁재: -8 };

const DISHI_EASY = {
  장생: "새 기운이 자라나는 때",
  목욕: "겉모습이 드러나고 마음이 들뜨기 쉬운 때",
  관대: "옷과 자리를 갖추며 이름을 올리는 때",
  건록: "내 힘으로 일을 밀고 가기 좋은 때",
  제왕: "힘이 가장 센 때",
  쇠: "속도를 줄여야 하는 때",
  병: "몸과 일정이 무거워지기 쉬운 때",
  사: "억지로 밀면 지치는 때",
  묘: "모아 두고 정리하기 좋은 때",
  절: "끊고 비우는 때",
  태: "씨앗을 심는 때",
  양: "조용히 키우는 때",
};

const WEALTH_LINE = {
  정재: "들어올 돈을 청구·정산하기 좋은 달입니다. 고정 수입부터 챙기세요.",
  편재: "소개와 외근에서 작은 거래가 붙기 쉽습니다. 계약서를 먼저 받으세요.",
  식신: "만든 결과물이 돈이 됩니다. 시연·샘플을 보여 주세요.",
  상관: "아이디어는 빠른데 지출도 빨라집니다. 견적과 마감을 같이 적으세요.",
  정관: "공식 절차와 서류가 돈을 지켜 줍니다. 세금·보험 기한을 먼저 보세요.",
  편관: "급하게 맡은 일이 수입이 될 수 있지만, 역할 범위를 글로 남겨 두세요.",
  정인: "자격과 문서가 나중에 돈이 됩니다. 당장의 현금보다 간판을 쌓으세요.",
  편인: "남이 안 보는 자료에서 답이 납니다. 혼자 파는 기술에 시간을 쓰세요.",
  비견: "내 몫을 지키는 달입니다. 같이 하는 돈은 지분을 먼저 적으세요.",
  겁재: "빌려 주기·보증·충동 구매가 새기 쉽습니다. 당일 큰돈은 멈추세요.",
};

const CAREER_LINE = {
  정재: "실무 정산과 성과 기록이 점수가 됩니다. 숫자로 남기세요.",
  편재: "외부 미팅과 영업이 기회를 엽니다. 한 건만 끝까지 밀어 보세요.",
  식신: "손기술·콘텐츠·결과물이 인정받습니다. 초안을 빨리 보여 주세요.",
  상관: "발표와 제안이 눈에 띕니다. 말투는 한 톤 낮추고 근거를 붙이세요.",
  정관: "지원·면접·승진·계약 도장에 유리합니다. 공식 루트를 타세요.",
  편관: "급한 보직·압박 업무가 옵니다. 권한과 마감을 먼저 확인하세요.",
  정인: "공부·자격·멘토가 다음 자리를 엽니다. 자료만 모으다 끝내지 마세요.",
  편인: "특수 분야·혼자 파는 기술이 맞습니다. 계산은 한 사람에게 보여 주세요.",
  비견: "동료와 역할을 나누면 속도가 납니다. 내 영역을 한 줄로 말해 두세요.",
  겁재: "경쟁이 센 달입니다. 새 판보다 기존 자리를 지키는 쪽이 이득입니다.",
};

const REL_LINE = {
  정재: "약속과 생활비가 관계의 중심입니다. 일정과 돈을 같이 적으세요.",
  편재: "소개와 모임에서 사람이 붙습니다. 다음 약속을 그 자리에서 정하세요.",
  식신: "먹고 나누는 자리가 관계가 됩니다. 식사 한 끼를 먼저 잡으세요.",
  상관: "솔직한 말이 지적처럼 들릴 수 있습니다. 짧은 대화로 끊으세요.",
  정관: "예의를 지키면 윗사람과 인연이 편해집니다. 호칭과 기한을 지키세요.",
  편관: "압박이 말로 나옵니다. 중요한 이야기는 감정이 식은 뒤 하세요.",
  정인: "도와주는 사람이 붙습니다. 도움을 받을 때는 감사와 기한을 분명히 하세요.",
  편인: "혼자 있고 싶어집니다. 단톡보다 한 사람과 짧게 만나세요.",
  비견: "비슷한 처지의 동료와 마음이 맞습니다. 비교 말은 줄이세요.",
  겁재: "비교와 서운함이 커지기 쉽습니다. 편 들기 전에 사실부터 들으세요.",
};

function yearGanzhi(year) {
  const eight = Solar.fromYmd(year, 7, 1).getLunar().getEightChar();
  return { gan: eight.getYearGan(), zhi: eight.getYearZhi() };
}

function monthPillar(year, month) {
  const eight = Solar.fromYmd(year, month, 15).getLunar().getEightChar();
  return {
    gan: eight.getMonthGan(),
    zhi: eight.getMonthZhi(),
    diShi: koDiShi(eight.getMonthDiShi()),
    hide: (Array.isArray(eight.getMonthHideGan())
      ? eight.getMonthHideGan()
      : String(eight.getMonthHideGan() || "").split(",")
    )
      .filter(Boolean)
      .map((item) => koGz(item)),
    hideRaw: Array.isArray(eight.getMonthHideGan())
      ? eight.getMonthHideGan()
      : String(eight.getMonthHideGan() || "").split(",").filter(Boolean),
  };
}

function scoreAxis(chart, gan, zhi, weights) {
  const tg = tenGod(chart.dayStem, gan);
  const branchGod = tenGod(chart.dayStem, mainStem(zhi));
  let score = 60 + (weights[tg] || 0) * 0.7 + (weights[branchGod] || 0) * 0.35;
  const relDay = branchRelation(chart.dayBranch, zhi);
  const stemRel = stemRelation(chart.dayStem, gan);
  if (relDay === "충") score -= 7;
  if (relDay === "합") score += 6;
  if (relDay === "원진") score -= 4;
  if (stemRel === "합") score += 4;
  if (stemRel === "충") score -= 4;
  const element = STEM_ELEMENT[gan];
  if (chart.strength.favorable.includes(element)) score += 5;
  if (chart.strength.unfavorable.includes(element)) score -= 4;
  return clamp(Math.round(score), 14, 96);
}

function analyzePair(chart, gan, zhi, hideRaw = []) {
  const tg = tenGod(chart.dayStem, gan);
  const relDay = branchRelation(chart.dayBranch, zhi);
  const stemRel = stemRelation(chart.dayStem, gan);
  const element = STEM_ELEMENT[gan];
  let score = 62 + (WEALTH_W[tg] || 0) * 0.35 + (CAREER_W[tg] || 0) * 0.35 + (REL_W[tg] || 0) * 0.3;
  if (relDay === "충") score -= 8;
  if (relDay === "합") score += 7;
  if (relDay === "원진") score -= 4;
  if (stemRel === "합") score += 3;
  if (stemRel === "충") score -= 4;
  if (chart.strength.favorable.includes(element)) score += 6;
  if (chart.strength.unfavorable.includes(element)) score -= 5;
  if (hideRaw.includes(chart.dayStem)) score += 4;
  if (zhi === chart.specials.dohwa) score += 5;
  if (zhi === chart.specials.yeokma) score += 3;
  if (zhi === chart.specials.munchang) score += 4;
  const empty = String(chart.xunKong || "").includes(koGz(zhi)) || String(chart.xunKong || "").includes(zhi);
  if (empty) score -= 3;
  score = clamp(Math.round(score), 14, 96);
  return {
    tg,
    relDay,
    stemRel,
    element,
    score,
    level: levelFromScore(score),
    empty,
    wealth: scoreAxis(chart, gan, zhi, WEALTH_W),
    career: scoreAxis(chart, gan, zhi, CAREER_W),
    relation: scoreAxis(chart, gan, zhi, REL_W),
  };
}

function lastDay(year, month) {
  return new Date(year, month, 0).getDate();
}

function watchDays(year, month, chart, meta) {
  const end = lastDay(year, month);
  const samples = [3, 7, 11, 15, 19, 23, 27].filter((day) => day <= end);
  const hits = [];
  samples.forEach((day) => {
    const eight = Solar.fromYmd(year, month, day).getLunar().getEightChar();
    const zhi = eight.getDayZhi();
    const rel = branchRelation(chart.dayBranch, zhi);
    if (rel === "충") {
      hits.push({ day, tip: "일정·몸이 부딪히기 쉬운 날입니다. 계약·운전·큰 결정을 하루 미루세요." });
    } else if (rel === "원진") {
      hits.push({ day, tip: "말이 엇갈리기 쉬운 날입니다. 중요한 이야기는 짧게, 만나서 하세요." });
    } else if (meta.empty && [7, 15, 23].includes(day)) {
      hits.push({ day, tip: "약속이 느슨해지기 쉬운 날입니다. 시간과 장소를 다시 확인하세요." });
    }
  });
  if (!hits.length) {
    hits.push({
      day: Math.min(15, end),
      tip: "중간 점검 날로 쓰기 좋습니다. 청구·정리·짧은 산책을 하세요.",
    });
  }
  return hits.slice(0, 3);
}

function remedyFor(meta, qimen, diShi) {
  const door = qimen?.doors || {};
  const parts = [];
  if (meta.relDay === "충") {
    parts.push("이사·수술·큰 계약은 날짜를 한 번 더 미루세요.");
  } else if (meta.relDay === "합") {
    parts.push("미팅과 소개를 이 달에 잡으면 사람이 붙습니다.");
  }
  if (meta.tg === "겁재" || meta.tg === "편관") {
    parts.push("큰돈은 하루 자고 결정하고, 보증·당일 송금은 멈춤이 답입니다.");
  }
  if (meta.wealth >= 72) {
    parts.push(`받을 돈과 청구서는 ${door.생문 || "집의 밝은 쪽"} 근처에 두어 정리를 쉽게 하세요.`);
  } else {
    parts.push("지갑과 통장 앱을 주 1회 확인하고, 자동결제 목록을 한 줄 줄이세요.");
  }
  if (diShi === "병" || diShi === "쇠" || diShi === "사") {
    parts.push("수면과 가벼운 걷기를 먼저 챙기면 일의 실수가 줄어듭니다.");
  }
  if (door.사문) {
    parts.push(`현관·침대 앞(${door.사문})에는 버리는 물건을 하룻밤도 쌓아 두지 마세요.`);
  }
  return parts.slice(0, 3).join(" ");
}

function summaryLine(year, month, meta, diShi) {
  const pace = DISHI_EASY[diShi] || "흐름을 살펴야 하는 때";
  if (meta.score >= 78) return `${month}월은 기회가 먼저 오는 달입니다. ${pace}에 가깝습니다. 미뤄 둔 일을 하나씩 열면 됩니다.`;
  if (meta.score >= 64) return `${month}월은 차근히 쌓는 달입니다. ${pace}에 맞춰 한 가지만 끝까지 하세요.`;
  if (meta.score >= 48) return `${month}월은 지키는 달입니다. ${pace}에 가깝습니다. 벌리기보다 정리와 확인이 이득입니다.`;
  return `${month}월은 속도를 낮출 달입니다. ${pace}에 가깝습니다. 큰 약속은 미루고 몸과 서류를 먼저 보세요.`;
}

function buildMonthCard(chart, year, month, qimen) {
  const pillar = monthPillar(year, month);
  const meta = analyzePair(chart, pillar.gan, pillar.zhi, pillar.hideRaw);
  const label = monthMeta(year, month, pillar.gan, pillar.zhi);
  const watches = watchDays(year, month, chart, meta);
  const specialHints = [];
  if (pillar.zhi === chart.specials.dohwa) specialHints.push("사람 운이 밝아지는 달입니다.");
  if (pillar.zhi === chart.specials.yeokma) specialHints.push("이동·이직·출장이 붙기 쉬운 달입니다.");
  if (pillar.zhi === chart.specials.munchang) specialHints.push("글·시험·서류가 힘을 받는 달입니다.");
  if (meta.empty) specialHints.push("약속이 느슨해질 수 있어 확인이 필요합니다.");

  return {
    ...label,
    score: meta.score,
    level: meta.level,
    diShi: pillar.diShi,
    diShiEasy: DISHI_EASY[pillar.diShi] || "",
    hide: pillar.hide,
    summary: easeSentence(summaryLine(year, month, meta, pillar.diShi)),
    wealth: easeSentence(WEALTH_LINE[meta.tg] || "돈은 크게 벌기보다 새는 구멍을 막는 달이 맞습니다.", { wealth: true }),
    career: easeSentence(CAREER_LINE[meta.tg] || "일은 새 판보다 맡은 일을 끝까지 마무리하세요."),
    relation: easeSentence(REL_LINE[meta.tg] || "관계는 긴 설명보다 짧은 확인이 도움이 됩니다."),
    wealthScore: meta.wealth,
    careerScore: meta.career,
    relationScore: meta.relation,
    watchDates: watches.map((item) => `${month}월 ${item.day}일 전후 — ${item.tip}`),
    remedy: easeSentence(remedyFor(meta, qimen, pillar.diShi)),
    specialHints,
  };
}

function yearTitle(year, now) {
  if (year === now) return `${year}년 한 해 총정리`;
  if (year === now + 1) return `${year}년 신년운세`;
  if (year > now) return `${year}년 앞날 운세`;
  return `${year}년 돌아보기`;
}

function buildGuides(year, months, profile, yearMeta) {
  const byCareer = [...months].sort((a, b) => b.careerScore - a.careerScore)[0];
  const byWealth = [...months].sort((a, b) => b.wealthScore - a.wealthScore)[0];
  const byRel = [...months].sort((a, b) => b.relationScore - a.relationScore)[0];
  const hard = [...months].sort((a, b) => a.score - b.score)[0];
  const role = profile?.roleLabel || "지금 하는 일";
  const status = profile?.statusLabel || "관계";

  return [
    {
      id: "job",
      question: "올해 이직이나 창업을 고민 중이신가요?",
      preview: `${year}년에는 ${byCareer.month}월 전후가 움직임이 가장 부드럽습니다.`,
      answer: easeSentence(`${role} 기준으로 보면 ${byCareer.month}월(${byCareer.jieqiLabel})에 일자리·사업 기운이 가장 돕습니다. ${byCareer.career} 반대로 ${hard.month}월은 속도를 낮추는 편이 안전합니다.`),
      targetMonth: byCareer.month,
    },
    {
      id: "money",
      question: "묶인 자금이 언제 풀릴지 답답하신가요?",
      preview: `돈이 움직이기 쉬운 달은 ${byWealth.month}월입니다.`,
      answer: easeSentence(`${byWealth.month}월은 재물 점수가 높은 달입니다. ${byWealth.wealth} 청구·정산·회수는 이 달에 잡고, ${hard.month}월에는 보증과 큰 베팅을 피하세요.`, { wealth: true }),
      targetMonth: byWealth.month,
    },
    {
      id: "people",
      question: "사람 문제로 마음이 무거운가요?",
      preview: `${status}과 대인 흐름은 ${byRel.month}월에 풀리기 쉽습니다.`,
      answer: easeSentence(`${byRel.month}월(${byRel.jieqiLabel})에 사람과 약속이 붙기 쉽습니다. ${byRel.relation} ${yearMeta.level}인 해이니, 관계는 한 번에 해결하려 하지 말고 달마다 짧게 확인하세요.`),
      targetMonth: byRel.month,
    },
    {
      id: "health",
      question: "몸과 일정이 자꾸 겹쳐 지치시나요?",
      preview: `${hard.month}월에는 쉬는 날짜를 미리 비워 두세요.`,
      answer: `${hard.month}월은 한 해 중 가장 무거운 달입니다. ${hard.summary} 주의일: ${hard.watchDates[0]} 개운은 간단합니다. ${hard.remedy}`,
      targetMonth: hard.month,
    },
  ];
}

export function listYearOptions(now = new Date().getFullYear()) {
  return Array.from({ length: 21 }, (_, index) => now - 10 + index);
}

export function buildYearFortune(chart, year, engines = {}, profile = null) {
  const now = new Date().getFullYear();
  const gz = yearGanzhi(year);
  const meta = analyzePair(chart, gz.gan, gz.zhi);
  const months = Array.from({ length: 12 }, (_, index) => buildMonthCard(chart, year, index + 1, engines.qimen));
  const best = [...months].sort((a, b) => b.score - a.score).slice(0, 3);
  const hard = [...months].sort((a, b) => a.score - b.score).slice(0, 3);
  const age = year - chart.solar.year + 1;
  const strengthEasy = chart.strength.strong
    ? "혼자 버티는 힘이 센 편이라, 올해는 방향을 정하면 끝까지 밀 수 있습니다."
    : "옆에서 채워 줄 사람과 환경이 있어야 편한 편이라, 올해는 혼자 욕심내기보다 도움을 받는 쪽이 맞습니다.";
  const emptyEasy = meta.empty
    ? "올해는 약속이 느슨해지기 쉬운 기운이 있습니다. 중요한 날짜는 문자로 한 번 더 확인하세요."
    : "올해는 약속의 뼈대가 비교적 단단합니다. 말한 기한을 지키면 신뢰가 쌓입니다.";
  const zi = engines.ziwei?.lookup || {};
  const ziweiEasy = zi.재백궁 || zi.관록궁
    ? `별자리 흐름으로는 돈의 창고가 ${zi.재백궁 || "재물 자리"} 쪽, 일의 자리는 ${zi.관록궁 || "직장 자리"} 쪽으로 읽힙니다. 이름보다 생활의 숫자와 역할로 보시면 됩니다.`
    : "별자리 흐름은 생활의 숫자와 역할을 함께 보면 더 또렷해집니다.";
  const qimenEasy = engines.qimen?.doors
    ? `집과 책상에서 숨이 트이는 방향은 ${engines.qimen.doors.생문}, 일과 만남이 수월한 쪽은 ${engines.qimen.doors.개문}입니다. ${engines.qimen.doors.사문}만 피하면 됩니다.`
    : "책상과 잠자리는 밝고 비운 쪽이 마음을 편하게 합니다.";
  const diShi = koDiShi(Solar.fromYmd(year, 7, 1).getLunar().getEightChar().getYearDiShi());
  const pace = DISHI_EASY[diShi] || "";

  const summary = [
    `${year}년은 ${koGz(`${gz.gan}${gz.zhi}`)} 기운의 해이고, 세는나이 ${age}세 흐름입니다.`,
    strengthEasy,
    emptyEasy,
    pace ? `한 해의 호흡은 ${pace}에 가깝습니다.` : "",
    `열두 달 중 비교적 밝은 달은 ${best.map((item) => `${item.month}월`).join("·")}이고, 조심할 달은 ${hard.map((item) => `${item.month}월`).join("·")}입니다.`,
  ]
    .filter(Boolean)
    .join(" ");

  const yearMeta = {
    year,
    age,
    gz: `${gz.gan}${gz.zhi}`,
    gzKo: koGz(`${gz.gan}${gz.zhi}`),
    score: meta.score,
    level: meta.level,
    title: yearTitle(year, now),
    summary: easeSentence(summary),
    focus: [
      `재물 온도 ${Math.round(months.reduce((sum, item) => sum + item.wealthScore, 0) / 12)}점대 — 청구와 정산을 달력에 먼저 적으세요.`,
      `직장·일 온도 ${Math.round(months.reduce((sum, item) => sum + item.careerScore, 0) / 12)}점대 — ${profile?.career || "맡은 일을 문서로 남기면 점수가 됩니다."}`,
      `사람 온도 ${Math.round(months.reduce((sum, item) => sum + item.relationScore, 0) / 12)}점대 — ${profile?.love || "한 사람과의 다음 약속을 짧게 정하세요."}`,
    ],
    bestMonths: best.map((item) => ({ month: item.month, level: item.level, summary: item.summary })),
    hardMonths: hard.map((item) => ({ month: item.month, level: item.level, summary: item.summary })),
    strengthEasy,
    emptyEasy,
    ziweiEasy,
    qimenEasy,
    basisNote: MONTH_BASIS_NOTE,
  };

  return {
    ...yearMeta,
    months,
    guides: buildGuides(year, months, profile, yearMeta),
  };
}

export function buildYearFortuneBook(chart, engines, profile) {
  const years = listYearOptions();
  const defaultYear = new Date().getFullYear();
  return {
    years,
    defaultYear,
    byYear: Object.fromEntries(years.map((year) => [year, buildYearFortune(chart, year, engines, profile)])),
  };
}
