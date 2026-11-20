export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_KO = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCH_KO = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

export const STEM_ELEMENT = {
  甲: "목",
  乙: "목",
  丙: "화",
  丁: "화",
  戊: "토",
  己: "토",
  庚: "금",
  辛: "금",
  壬: "수",
  癸: "수",
};

export const BRANCH_ELEMENT = {
  子: "수",
  亥: "수",
  寅: "목",
  卯: "목",
  巳: "화",
  午: "화",
  申: "금",
  酉: "금",
  辰: "토",
  戌: "토",
  丑: "토",
  未: "토",
};

const BRANCH_MAIN = {
  子: "癸",
  丑: "己",
  寅: "甲",
  卯: "乙",
  辰: "戊",
  巳: "丙",
  午: "丁",
  未: "己",
  申: "庚",
  酉: "辛",
  戌: "戊",
  亥: "壬",
};

const SHISHEN_KO = {
  比肩: "비견",
  劫财: "겁재",
  食神: "식신",
  伤官: "상관",
  偏财: "편재",
  正财: "정재",
  七杀: "편관",
  偏官: "편관",
  正官: "정관",
  偏印: "편인",
  枭神: "편인",
  正印: "정인",
  日主: "일원",
};

const DISHI_KO = {
  长生: "장생",
  沐浴: "목욕",
  冠带: "관대",
  临官: "건록",
  帝旺: "제왕",
  衰: "쇠",
  病: "병",
  死: "사",
  墓: "묘",
  绝: "절",
  胎: "태",
  养: "양",
};

const NAYIN_KO = {
  海中金: "해중금",
  炉中火: "노중화",
  大林木: "대림목",
  路旁土: "노방토",
  剑锋金: "검봉금",
  山头火: "산두화",
  涧下水: "간하수",
  城头土: "성두토",
  白蜡金: "백랍금",
  杨柳木: "양류목",
  泉中水: "천중수",
  屋上土: "옥상토",
  霹雳火: "벽력화",
  松柏木: "송백목",
  长流水: "장류수",
  沙中金: "사중금",
  山下火: "산하화",
  平地木: "평지목",
  壁上土: "벽상토",
  金箔金: "금박금",
  覆灯火: "복등화",
  天河水: "천하수",
  大驿土: "대역토",
  钗钏金: "채천금",
  桑柘木: "상자목",
  大溪水: "대계수",
  沙中土: "사중토",
  天上火: "천상화",
  石榴木: "석류목",
  大海水: "대해수",
};

const ELEMENT_KO = { 木: "목", 火: "화", 土: "토", 金: "금", 水: "수" };

const CLASH = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

const COMBINE = [
  ["子", "丑"],
  ["寅", "亥"],
  ["卯", "戌"],
  ["辰", "酉"],
  ["巳", "申"],
  ["午", "未"],
];

const HARM = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "酉"],
  ["卯", "申"],
  ["辰", "亥"],
  ["巳", "戌"],
];

const STEM_COMBINE = [
  ["甲", "己"],
  ["乙", "庚"],
  ["丙", "辛"],
  ["丁", "壬"],
  ["戊", "癸"],
];

const STEM_CLASH = [
  ["甲", "庚"],
  ["乙", "辛"],
  ["丙", "壬"],
  ["丁", "癸"],
];

const MUNCHANG = {
  甲: "巳",
  乙: "午",
  丙: "申",
  丁: "酉",
  戊: "申",
  己: "酉",
  庚: "亥",
  辛: "子",
  壬: "寅",
  癸: "卯",
};

export function eun(word) {
  return `${word}${hasBatchim(word) ? "은" : "는"}`;
}

export function eul(word) {
  return `${word}${hasBatchim(word) ? "을" : "를"}`;
}

export function iga(word) {
  return `${word}${hasBatchim(word) ? "이" : "가"}`;
}

function hasBatchim(word) {
  const ch = [...String(word)].pop();
  if (!ch) return false;
  const code = ch.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

export function mod(n, m) {
  return ((n % m) + m) % m;
}

export function koChar(ch) {
  const s = STEMS.indexOf(ch);
  if (s >= 0) return STEM_KO[s];
  const b = BRANCHES.indexOf(ch);
  if (b >= 0) return BRANCH_KO[b];
  return ch;
}

export function koGz(value) {
  return [...String(value ?? "")].map(koChar).join("");
}

export function koShiShen(value) {
  return SHISHEN_KO[value] || value || "";
}

export function koDiShi(value) {
  return DISHI_KO[value] || value || "";
}

export function koNaYin(value) {
  return NAYIN_KO[value] || [...String(value ?? "")].map((ch) => ELEMENT_KO[ch] || ch).join("");
}

export function koWuXingPair(value) {
  return [...String(value ?? "")].map((ch) => ELEMENT_KO[ch] || ch).join("");
}

export function branchIndex(branch) {
  return BRANCHES.indexOf(branch);
}

export function stemIndex(stem) {
  return STEMS.indexOf(stem);
}

export function jiaZiIndex(gz) {
  for (let i = 0; i < 60; i += 1) {
    if (STEMS[i % 10] === gz[0] && BRANCHES[i % 12] === gz[1]) return i;
  }
  return 0;
}

export function mainStem(branch) {
  return BRANCH_MAIN[branch];
}

export function tenGod(dayStem, otherStem) {
  if (!dayStem || !otherStem) return "";
  if (dayStem === otherStem) return "비견";
  const samePolarity = stemIndex(dayStem) % 2 === stemIndex(otherStem) % 2;
  const mine = STEM_ELEMENT[dayStem];
  const theirs = STEM_ELEMENT[otherStem];
  const child = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  const wealth = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };
  const officer = { 목: "금", 화: "수", 토: "목", 금: "화", 수: "토" };
  const parent = { 목: "수", 화: "목", 토: "화", 금: "토", 수: "금" };
  if (mine === theirs) return samePolarity ? "비견" : "겁재";
  if (child[mine] === theirs) return samePolarity ? "식신" : "상관";
  if (wealth[mine] === theirs) return samePolarity ? "편재" : "정재";
  if (officer[mine] === theirs) return samePolarity ? "편관" : "정관";
  if (parent[mine] === theirs) return samePolarity ? "편인" : "정인";
  return "";
}

function paired(table, a, b) {
  return table.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

export function branchRelation(a, b) {
  if (!a || !b) return "";
  if (a === b) return "자형";
  if (paired(CLASH, a, b)) return "충";
  if (paired(COMBINE, a, b)) return "합";
  if (paired(HARM, a, b)) return "원진";
  return "";
}

export function stemRelation(a, b) {
  if (!a || !b || a === b) return "";
  if (paired(STEM_COMBINE, a, b)) return "합";
  if (paired(STEM_CLASH, a, b)) return "충";
  return "";
}

export function groupKey(branch) {
  if ("申子辰".includes(branch)) return "신자진";
  if ("寅午戌".includes(branch)) return "인오술";
  if ("巳酉丑".includes(branch)) return "사유축";
  if ("亥卯未".includes(branch)) return "해묘미";
  return "";
}

const DOHWA = { 신자진: "酉", 인오술: "卯", 사유축: "午", 해묘미: "子" };
const YEOKMA = { 신자진: "寅", 인오술: "申", 사유축: "亥", 해묘미: "巳" };

export function specialBranches(dayStem, dayBranch) {
  const key = groupKey(dayBranch);
  return {
    munchang: MUNCHANG[dayStem],
    dohwa: DOHWA[key],
    yeokma: YEOKMA[key],
  };
}

export function elementBalance(pillars) {
  const count = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  pillars.forEach((pillar) => {
    count[STEM_ELEMENT[pillar.gan]] += 1;
    count[BRANCH_ELEMENT[pillar.zhi]] += 1;
  });
  return count;
}

export function judgeStrength(dayStem, count) {
  const mine = STEM_ELEMENT[dayStem];
  const parent = { 목: "수", 화: "목", 토: "화", 금: "토", 수: "금" }[mine];
  const child = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }[mine];
  const wealth = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" }[mine];
  const officer = { 목: "금", 화: "수", 토: "목", 금: "화", 수: "토" }[mine];
  const support = count[mine] + count[parent];
  const drain = count[child] + count[wealth] + count[officer];
  const strong = support >= drain;
  return {
    strong,
    label: strong ? "신강" : "신약",
    support,
    drain,
    favorable: strong ? [child, wealth, officer] : [parent, mine],
    unfavorable: strong ? [parent, mine] : [child, wealth, officer],
    roles: { mine, parent, child, wealth, officer },
  };
}

export function levelFromScore(score) {
  if (score >= 85) return "대길";
  if (score >= 74) return "길";
  if (score >= 62) return "평";
  if (score >= 50) return "신중";
  return "흉";
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Math.round(n)));
}
