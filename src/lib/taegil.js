import { Solar } from "lunar-javascript";
import { BRANCH_ELEMENT, STEM_ELEMENT, branchRelation, clamp, koGz, levelFromScore, tenGod } from "./ganzhi.js";

const HOURS = [
  ["子", "자", "23:00–01:00"],
  ["丑", "축", "01:00–03:00"],
  ["寅", "인", "03:00–05:00"],
  ["卯", "묘", "05:00–07:00"],
  ["辰", "진", "07:00–09:00"],
  ["巳", "사", "09:00–11:00"],
  ["午", "오", "11:00–13:00"],
  ["未", "미", "13:00–15:00"],
  ["申", "신", "15:00–17:00"],
  ["酉", "유", "17:00–19:00"],
  ["戌", "술", "19:00–21:00"],
  ["亥", "해", "21:00–23:00"],
];

const PURPOSES = [
  { id: "move", title: "이사", hint: "짐을 옮기고 주소를 바꾸는 날" },
  { id: "contract", title: "계약", hint: "도장, 입금, 채용을 정하는 날" },
  { id: "marriage", title: "결혼", hint: "혼담, 상견례, 예식을 여는 날" },
  { id: "plan", title: "중요 일정", hint: "시험, 발표, 중요한 일정을 고르는 날(진료·수술은 의료진 판단 우선)" },
];

/** 음력 월·일 기준 민속 ‘손 없는 날’ (혼사·이사에 자주 쓰는 기준) */
const EMPTY_HAND_BY_LUNAR_MONTH = {
  1: [7, 8, 18, 19, 27, 28],
  2: [5, 6, 15, 16, 25, 26],
  3: [3, 4, 13, 14, 23, 24],
  4: [1, 2, 11, 12, 21, 22],
  5: [9, 10, 19, 20, 29, 30],
  6: [7, 8, 17, 18, 27, 28],
  7: [5, 6, 15, 16, 25, 26],
  8: [3, 4, 13, 14, 23, 24],
  9: [1, 2, 11, 12, 21, 22],
  10: [9, 10, 19, 20, 29, 30],
  11: [7, 8, 17, 18, 27, 28],
  12: [5, 6, 15, 16, 25, 26],
};

export function isEmptyHandDay(lunarMonth, lunarDay) {
  const days = EMPTY_HAND_BY_LUNAR_MONTH[((lunarMonth - 1) % 12) + 1] || [];
  return days.includes(lunarDay);
}

function addDays(date, amount) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  next.setDate(next.getDate() + amount);
  return next;
}

function mark(date) {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const eight = solar.getLunar().getEightChar();
  return { date, gan: eight.getDayGan(), zhi: eight.getDayZhi(), gzKo: koGz(`${eight.getDayGan()}${eight.getDayZhi()}`) };
}

function baseScore(chart, gan, zhi) {
  const tg = tenGod(chart.dayStem, gan);
  const element = STEM_ELEMENT[gan];
  const weights = { 정재: 8, 편재: 6, 식신: 6, 정관: 8, 정인: 4, 상관: 1, 편관: -4, 편인: 0, 비견: -1, 겁재: -8 };
  let score = 60 + (weights[tg] || 0);
  if (chart.strength.favorable.includes(element)) score += 8;
  if (chart.strength.unfavorable.includes(element)) score -= 6;
  const rel = branchRelation(chart.dayBranch, zhi);
  return { score, tg, element, rel };
}

function purposeScore(chart, purpose, gan, zhi, emptyHand = false) {
  const meta = baseScore(chart, gan, zhi);
  let score = meta.score;
  if (purpose === "move") {
    if (zhi === chart.specials.yeokma) score += 10;
    if (meta.rel === "충") score += 6;
    if (meta.rel === "합") score -= 2;
    if (emptyHand) score += 4;
  } else if (purpose === "contract") {
    if (meta.rel === "합") score += 10;
    if (meta.rel === "충") score -= 12;
    if (meta.tg === "정관" || meta.tg === "정재") score += 6;
  } else if (purpose === "marriage") {
    if (meta.rel === "합") score += 12;
    if (zhi === chart.specials.dohwa) score += 8;
    if (meta.rel === "원진" || meta.rel === "충" || meta.rel === "자형") score -= 12;
    if (emptyHand) score += 6;
  } else if (meta.rel === "충") score -= 6;
  score = clamp(score, 20, 98);
  return { ...meta, score, level: levelFromScore(score), emptyHand };
}

function hoursFor(chart, zhi) {
  return HOURS.map(([branch, name, clock]) => {
    const element = BRANCH_ELEMENT[branch];
    let score = chart.strength.favorable.includes(element) ? 2 : 0;
    if (chart.strength.unfavorable.includes(element)) score -= 1;
    if (branchRelation(zhi, branch) === "충") score -= 2;
    if (branchRelation(zhi, branch) === "합") score += 1;
    return { branch: name, clock, element, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}

function reason(purpose, meta) {
  if (purpose === "move" && meta.rel === "충") return "자리가 움직이는 날이니 이삿짐과 주소 변경이 실제로 굴러갑니다.";
  if (purpose === "contract" && meta.rel === "합") return "약속이 붙는 날이니 도장과 입금이 한 번에 맞기 좋습니다.";
  if (purpose === "marriage" && meta.rel === "합") {
    return meta.emptyHand
      ? "일지 합에 손 없는 날까지 겹칩니다. 예식·상견례·혼인신고 후보로 우선 보세요."
      : "사람과 마음이 붙기 쉬운 날입니다. 예식·상견례 후보로 두세요.";
  }
  if (purpose === "marriage" && meta.emptyHand && meta.rel !== "충" && meta.rel !== "원진") {
    return "손 없는 날이라 혼사·이사 민속 기준으로도 부담이 적습니다.";
  }
  if (meta.score >= 78) return "길한 창입니다. 추천 시각에 핵심만 진행하세요.";
  return "무난한 날입니다. 큰 조건은 문서에 남기고 범위를 좁혀 진행하세요.";
}

export function scoreMarriageDay(chart, gan, zhi, emptyHand = false) {
  return purposeScore(chart, "marriage", gan, zhi, emptyHand);
}

export function buildTaegil(chart, now = new Date()) {
  const start = addDays(now, 1);
  const days = Array.from({ length: 60 }, (_, index) => {
    const date = addDays(start, index);
    const marked = mark(date);
    const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const lunar = solar.getLunar();
    const emptyHand = isEmptyHandDay(lunar.getMonth(), lunar.getDay());
    const purposes = Object.fromEntries(
      PURPOSES.map((purpose) => {
        const meta = purposeScore(chart, purpose.id, marked.gan, marked.zhi, emptyHand);
        return [purpose.id, { ...meta, hours: hoursFor(chart, marked.zhi), note: reason(purpose.id, meta) }];
      }),
    );
    return {
      key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: "일월화수목금토"[date.getDay()],
      gzKo: marked.gzKo,
      gan: marked.gan,
      zhi: marked.zhi,
      emptyHand,
      lunarLabel: `음력 ${lunar.getMonth()}월 ${lunar.getDay()}일`,
      purposes,
    };
  });
  const picks = Object.fromEntries(
    PURPOSES.map((purpose) => [
      purpose.id,
      [...days].sort((a, b) => b.purposes[purpose.id].score - a.purposes[purpose.id].score).slice(0, 5),
    ]),
  );
  return { id: "taegil", title: "택일", purposes: PURPOSES, days, picks };
}
