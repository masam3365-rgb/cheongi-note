import { BRANCHES, iga, jiaZiIndex, mod } from "./ganzhi.js";

const YANG = {
  冬至: [1, 7, 4],
  小寒: [2, 8, 5],
  大寒: [3, 9, 6],
  立春: [8, 5, 2],
  雨水: [9, 6, 3],
  惊蛰: [1, 7, 4],
  春分: [3, 9, 6],
  清明: [4, 1, 7],
  谷雨: [5, 2, 8],
  立夏: [4, 1, 7],
  小满: [5, 2, 8],
  芒种: [6, 3, 9],
};

const YIN = {
  夏至: [9, 3, 6],
  小暑: [8, 2, 5],
  大暑: [7, 1, 4],
  立秋: [2, 5, 8],
  处暑: [1, 4, 7],
  白露: [9, 3, 6],
  秋分: [7, 1, 4],
  寒露: [6, 9, 3],
  霜降: [5, 8, 2],
  立冬: [6, 9, 3],
  小雪: [5, 8, 2],
  大雪: [4, 7, 1],
};

const PALACE = {
  1: { name: "감궁", dir: "북" },
  2: { name: "곤궁", dir: "서남" },
  3: { name: "진궁", dir: "동" },
  4: { name: "손궁", dir: "동남" },
  5: { name: "중궁", dir: "중앙" },
  6: { name: "건궁", dir: "서북" },
  7: { name: "태궁", dir: "서" },
  8: { name: "간궁", dir: "동북" },
  9: { name: "이궁", dir: "남" },
};

const STAR_BY_PALACE = ["", "천봉", "천예", "천충", "천보", "천금", "천심", "천주", "천임", "천영"];
const DOOR_BY_PALACE = ["", "휴문", "사문", "상문", "두문", "", "개문", "驚문", "생문", "景문"];
const DOOR_CYCLE = ["휴문", "사문", "상문", "두문", "개문", "驚문", "생문", "景문"];
const EARTH_STEMS = ["戊", "己", "庚", "辛", "壬", "癸", "丁", "丙", "乙"];
const XUN_STEM = ["戊", "己", "庚", "辛", "壬", "癸"];
const GODS = ["직부", "등사", "태음", "육합", "백호", "현무", "구지", "구천"];
const STEM_KO = { 戊: "무", 己: "기", 庚: "경", 辛: "신", 壬: "임", 癸: "계", 丁: "정", 丙: "병", 乙: "을", 甲: "갑" };

function palaceAfter(start, steps, yin) {
  let index = start - 1 + (yin ? -steps : steps);
  index = mod(index, 9);
  return index + 1;
}

function doorLabel(door) {
  if (door === "驚문") return "경문(驚)";
  if (door === "景문") return "경문(景)";
  return door;
}

export function buildQimen(chart) {
  const term = chart.jieQi;
  const yangRow = YANG[term];
  const row = yangRow || YIN[term] || YANG.冬至;
  const yin = !yangRow && Boolean(YIN[term]);
  const yuanIndex = Math.max(0, Math.min(2, Math.floor(chart.jieQiDays / 5)));
  const ju = row[yuanIndex];
  const yuan = ["상원", "중원", "하원"][yuanIndex];
  const dun = yin ? "음둔" : "양둔";

  const earth = {};
  EARTH_STEMS.forEach((stem, index) => {
    earth[palaceAfter(ju, index, yin)] = stem;
  });

  const dayGz = chart.pillars[2].gz;
  const xun = Math.floor(jiaZiIndex(dayGz) / 10);
  const xunStem = XUN_STEM[xun];
  const hourStem = chart.pillars[3].gan === "甲" ? xunStem : chart.pillars[3].gan;
  const stemPalace = (stem) => Number(Object.entries(earth).find(([, value]) => value === stem)?.[0] || ju);
  const zhifuPalace = stemPalace(xunStem);
  const luoPalace = stemPalace(hourStem);

  const heavenStar = {};
  for (let i = 0; i < 9; i += 1) {
    const starIndex = ((zhifuPalace - 1 + i) % 9) + 1;
    heavenStar[palaceAfter(luoPalace, i, yin)] = STAR_BY_PALACE[starIndex];
  }

  const doorOrigin = zhifuPalace === 5 ? 2 : zhifuPalace;
  const headBranches = ["子", "戌", "申", "午", "辰", "寅"];
  const steps = mod(BRANCHES.indexOf(chart.pillars[3].zhi) - BRANCHES.indexOf(headBranches[xun]), 12);
  let doorCursor = DOOR_CYCLE.indexOf(DOOR_BY_PALACE[doorOrigin]);
  const heavenDoor = {};
  for (let i = 0; i < 9; i += 1) {
    const palace = palaceAfter(doorOrigin, i, yin);
    if (palace === 5) {
      heavenDoor[palace] = "";
      continue;
    }
    heavenDoor[palace] = DOOR_CYCLE[mod(doorCursor, 8)];
    doorCursor += 1;
  }
  const zhishiPalace = palaceAfter(doorOrigin, steps, yin);

  const gods = {};
  let godIndex = 0;
  for (let i = 0; i < 9 && godIndex < GODS.length; i += 1) {
    const palace = palaceAfter(luoPalace, i, yin);
    if (palace === 5) continue;
    gods[palace] = GODS[godIndex];
    godIndex += 1;
  }

  const cells = [4, 9, 2, 3, 5, 7, 8, 1, 6].map((id) => ({
    id,
    ...PALACE[id],
    earth: STEM_KO[earth[id]],
    star: heavenStar[id],
    baseStar: STAR_BY_PALACE[id],
    door: doorLabel(heavenDoor[id] || ""),
    god: gods[id] || "",
    zhifu: id === luoPalace,
    zhishi: id === zhishiPalace,
  }));

  const doorDir = (door) => {
    const found = cells.find((cell) => cell.door === doorLabel(door));
    return found ? found.dir : PALACE[8].dir;
  };

  const zhifu = cells.find((cell) => cell.zhifu);
  const zhishi = cells.find((cell) => cell.zhishi);
  const summary = `${chart.jieQiKo} ${dun} ${ju}국 ${yuan}입니다. ${iga(zhifu.star)} ${zhifu.dir} ${zhifu.name}에 직부로 앉고, 직사 자리는 ${zhishi.dir} ${zhishi.name}${zhishi.door ? `의 ${zhishi.door}` : ""}입니다. 생문은 ${doorDir("생문")}, 개문은 ${doorDir("개문")}, 휴문은 ${doorDir("휴문")}입니다.`;

  return {
    id: "qimen",
    name: "기문둔갑",
    summary,
    points: [
      `지반 순서는 ${dun} ${ju}국에서 무부터 포국했습니다.`,
      `공망은 ${chart.xunKong}라서, 그 방위의 문과 별은 실속이 늦습니다.`,
      `재물 가구는 생문 ${doorDir("생문")}, 출입과 커리어는 개문 ${doorDir("개문")}을 등지지 않게 둡니다.`,
      `침대와 환자 자리는 사문 ${doorDir("사문")}을 피하고 휴문 ${doorDir("휴문")} 쪽이 낫습니다.`,
    ],
    cells,
    doors: {
      생문: doorDir("생문"),
      개문: doorDir("개문"),
      휴문: doorDir("휴문"),
      사문: doorDir("사문"),
      직부: zhifu.dir,
      직사: zhishi.dir,
    },
    meta: `${dun} ${ju}국 ${yuan}`,
  };
}
