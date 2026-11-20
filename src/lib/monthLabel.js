import { koGz } from "./ganzhi.js";

export const MONTH_BASIS_NOTE =
  "본 월별 운세는 현대인의 편의를 위해 양력 월을 기준으로 하되, 사주 명리학의 정확한 기운 흐름인 절기 월(간지)을 함께 적용하여 분석하였습니다.";

function pad(value) {
  return String(value).padStart(2, "0");
}

function lastDay(year, month) {
  return new Date(year, month, 0).getDate();
}

export function monthMeta(year, month, gan, zhi) {
  const gz = `${gan}${zhi}`;
  const gzKo = koGz(gz);
  const solarRange = `${year}.${pad(month)}.01 ~ ${pad(month)}.${pad(lastDay(year, month))}`;
  const jieqiLabel = `${gzKo}월(${gz}月)`;
  return {
    year,
    month,
    gan,
    zhi,
    gz,
    gzKo,
    solarRange,
    jieqiLabel,
    heading: `${year}년 ${month}월 운세 (양력 ${solarRange} / 음력 및 간지 월 ${jieqiLabel} 기준)`,
    shortLabel: `${month}월 · ${jieqiLabel}`,
  };
}
