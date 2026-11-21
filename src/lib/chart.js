import { Lunar, Solar } from "lunar-javascript";
import {
  BRANCH_ELEMENT,
  STEM_ELEMENT,
  elementBalance,
  judgeStrength,
  koDiShi,
  koGz,
  koNaYin,
  koShiShen,
  koWuXingPair,
  mainStem,
  specialBranches,
  tenGod,
} from "./ganzhi.js";

const JIEQI_KO = {
  立春: "입춘",
  雨水: "우수",
  惊蛰: "경칩",
  春分: "춘분",
  清明: "청명",
  谷雨: "곡우",
  立夏: "입하",
  小满: "소만",
  芒种: "망종",
  夏至: "하지",
  小暑: "소서",
  大暑: "대서",
  立秋: "입추",
  处暑: "처서",
  白露: "백로",
  秋分: "추분",
  寒露: "한로",
  霜降: "상강",
  立冬: "입동",
  小雪: "소설",
  大雪: "대설",
  冬至: "동지",
  小寒: "소한",
  大寒: "대한",
};

function numberIn(value, min, max, label) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${label} 값을 다시 입력해 주세요.`);
  }
  return n;
}

function validSolar(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function pillar(label, gan, zhi, shiShen, hide, nayin, diShi) {
  const hideList = Array.isArray(hide) ? hide : String(hide || "").split(",").filter(Boolean);
  return {
    label,
    gan,
    zhi,
    ganKo: koGz(gan),
    zhiKo: koGz(zhi),
    gz: `${gan}${zhi}`,
    gzKo: koGz(`${gan}${zhi}`),
    shiShen: koShiShen(shiShen),
    hide: hideList.map((item) => koGz(item)),
    nayin: koNaYin(nayin),
    diShi: koDiShi(diShi),
    element: `${STEM_ELEMENT[gan]}${BRANCH_ELEMENT[zhi]}`,
  };
}

export function buildChart(input) {
  const year = numberIn(input.year, 1900, 2100, "연도");
  const month = numberIn(input.month, 1, 12, "월");
  const day = numberIn(input.day, 1, 31, "일");
  const hourUnknown = input.hour === "" || input.hour == null || input.hourUnknown === true;
  const hour = hourUnknown ? 12 : numberIn(input.hour, 0, 23, "시");
  const minute = hourUnknown
    ? 0
    : input.minute === "" || input.minute == null
      ? 0
      : numberIn(input.minute, 0, 59, "분");
  if (input.gender !== "male" && input.gender !== "female") {
    throw new Error("성별을 선택해 주세요.");
  }
  if (input.calendar === "solar" && !validSolar(year, month, day)) {
    throw new Error("양력에 없는 날짜입니다.");
  }

  let lunar;
  try {
    if (input.calendar === "lunar") {
      lunar = Lunar.fromYmdHms(year, input.leap ? -month : month, day, hour, minute, 0);
    } else {
      lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
    }
  } catch {
    throw new Error("생년월일을 다시 확인해 주세요. 없는 날이거나, 그해에는 없는 윤달입니다.");
  }

  const solar = lunar.getSolar();
  const eight = lunar.getEightChar();
  eight.setSect(input.yaja ? 1 : 2);

  const pillars = [
    pillar("년주", eight.getYearGan(), eight.getYearZhi(), eight.getYearShiShenGan(), eight.getYearHideGan(), eight.getYearNaYin(), eight.getYearDiShi()),
    pillar("월주", eight.getMonthGan(), eight.getMonthZhi(), eight.getMonthShiShenGan(), eight.getMonthHideGan(), eight.getMonthNaYin(), eight.getMonthDiShi()),
    pillar("일주", eight.getDayGan(), eight.getDayZhi(), "일원", eight.getDayHideGan(), eight.getDayNaYin(), eight.getDayDiShi()),
    pillar("시주", eight.getTimeGan(), eight.getTimeZhi(), eight.getTimeShiShenGan(), eight.getTimeHideGan(), eight.getTimeNaYin(), eight.getTimeDiShi()),
  ];

  const dayStem = eight.getDayGan();
  const count = elementBalance(pillars);
  const strength = judgeStrength(dayStem, count);
  const gender = input.gender === "male" ? 1 : 0;
  const yun = eight.getYun(gender);
  const cycles = yun.getDaYun(9).map((item, index) => ({
    index,
    gz: item.getGanZhi(),
    gzKo: item.getGanZhi() ? koGz(item.getGanZhi()) : "대운 전",
    startYear: item.getStartYear(),
    endYear: item.getEndYear(),
    startAge: item.getStartAge(),
    endAge: item.getEndAge(),
  }));

  const termName = lunar.getPrevJieQi(true).getName();
  const monthStem = eight.getMonthGan();
  const monthGod = monthStem === dayStem ? tenGod(dayStem, mainStem(eight.getMonthZhi())) : tenGod(dayStem, monthStem);

  return {
    gender: input.gender,
    genderLabel: input.gender === "male" ? "남" : "여",
    yaja: Boolean(input.yaja),
    calendarLabel: input.calendar === "lunar" ? "음력" : "양력",
    leap: Boolean(input.leap),
    hourUnknown,
    clock: hourUnknown ? "시각 미입력(참고)" : `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    solar: { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() },
    solarText: solar.toYmd(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    lunarLeap: lunar.getMonth() < 0,
    lunarText: `음력 ${lunar.getYear()}년 ${lunar.getMonth() < 0 ? "윤" : ""}${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`,
    pillars,
    dayStem,
    dayBranch: eight.getDayZhi(),
    dayMasterKo: koGz(dayStem),
    dayElement: STEM_ELEMENT[dayStem],
    dayWuXing: koWuXingPair(eight.getDayWuXing()),
    count,
    strength,
    xunKong: koGz(eight.getDayXunKong()),
    monthGod,
    specials: specialBranches(dayStem, eight.getDayZhi()),
    daYun: {
      forward: yun.isForward(),
      startText: `${yun.getStartYear()}년 ${yun.getStartMonth()}개월 ${yun.getStartDay()}일`,
      cycles,
    },
    jieQi: termName,
    jieQiKo: JIEQI_KO[termName] || termName,
    jieQiDays: Math.max(0, solar.subtract(lunar.getPrevJieQi(true).getSolar())),
    eight,
    lunar,
  };
}
