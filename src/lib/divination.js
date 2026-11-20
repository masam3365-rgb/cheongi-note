import { BRANCHES, eun, iga, mod } from "./ganzhi.js";

const TRIGRAMS = [
  null,
  { name: "건", lines: [1, 1, 1], nature: "하늘", trait: "강건함" },
  { name: "태", lines: [1, 1, 0], nature: "못", trait: "기쁨" },
  { name: "리", lines: [1, 0, 1], nature: "불", trait: "밝음" },
  { name: "진", lines: [1, 0, 0], nature: "우레", trait: "움직임" },
  { name: "손", lines: [0, 1, 1], nature: "바람", trait: "스며듦" },
  { name: "감", lines: [0, 1, 0], nature: "물", trait: "험난함" },
  { name: "간", lines: [0, 0, 1], nature: "산", trait: "멈춤" },
  { name: "곤", lines: [0, 0, 0], nature: "땅", trait: "포용" },
];

const NAMES = {
  건건: "건위천",
  건태: "천택리",
  건리: "천화동인",
  건진: "천뢰무망",
  건손: "천풍구",
  건감: "천수송",
  건간: "천산둔",
  건곤: "천지비",
  태건: "택천쾌",
  태태: "태위택",
  태리: "택화혁",
  태진: "택뢰수",
  태손: "택풍대과",
  태감: "택수곤",
  태간: "택산함",
  태곤: "택지췌",
  리건: "화천대유",
  리태: "화택규",
  리리: "이위화",
  리진: "화뢰서합",
  리손: "화풍정",
  리감: "화수미제",
  리간: "화산려",
  리곤: "화지진",
  진건: "뇌천대장",
  진태: "뇌택귀매",
  진리: "뇌화풍",
  진진: "진위뢰",
  진손: "뇌풍항",
  진감: "뇌수해",
  진간: "뇌산소과",
  진곤: "뇌지예",
  손건: "풍천소축",
  손태: "풍택중부",
  손리: "풍화가인",
  손진: "풍뢰익",
  손손: "손위풍",
  손감: "풍수환",
  손간: "풍산점",
  손곤: "풍지관",
  감건: "수천수",
  감태: "수택절",
  감리: "수화기제",
  감진: "수뢰둔",
  감손: "수풍정",
  감감: "감위수",
  감간: "수산건",
  감곤: "수지비",
  간건: "산천대축",
  간태: "산택손",
  간리: "산화비",
  간진: "산뢰이",
  간손: "산풍고",
  간감: "산수몽",
  간간: "간위산",
  간곤: "산지박",
  곤건: "지천태",
  곤태: "지택림",
  곤리: "지화명이",
  곤진: "지뢰복",
  곤손: "지풍승",
  곤감: "지수사",
  곤간: "지산겸",
  곤곤: "곤위지",
};

function trigramByLines(lines) {
  return TRIGRAMS.find((item, index) => index > 0 && item.lines.every((bit, i) => bit === lines[i]));
}

function hexagram(upper, lower) {
  const lines = [...lower.lines, ...upper.lines];
  return {
    key: `${upper.name}${lower.name}`,
    name: NAMES[`${upper.name}${lower.name}`],
    upper,
    lower,
    lines,
  };
}

function describe(gua, moving) {
  const picture = `${gua.upper.nature}이 ${gua.lower.nature} 위에 놓여 ${gua.upper.trait}과 ${gua.lower.trait}이 한 그림이 됩니다.`;
  const move = moving
    ? ` 변효는 ${moving}효라, 그 자리의 음양을 뒤집으면 상황이 다음 괘로 넘어갑니다.`
    : "";
  return `${gua.name}(${gua.key}). ${picture}${move}`;
}

function numbers(chart) {
  const yearBranch = BRANCHES.indexOf(chart.pillars[0].zhi) + 1;
  const hourBranch = BRANCHES.indexOf(chart.pillars[3].zhi) + 1;
  const month = chart.solar.month;
  const day = chart.solar.day;
  const upper = mod(yearBranch + month + day, 8) || 8;
  const lower = mod(yearBranch + month + day + hourBranch, 8) || 8;
  const moving = mod(yearBranch + month + day + hourBranch, 6) || 6;
  return { upper, lower, moving };
}

export function buildYijing(chart) {
  const { upper, lower, moving } = numbers(chart);
  const original = hexagram(TRIGRAMS[upper], TRIGRAMS[lower]);
  const flipped = original.lines.map((bit, index) => (index === moving - 1 ? 1 - bit : bit));
  const changed = hexagram(trigramByLines(flipped.slice(3)), trigramByLines(flipped.slice(0, 3)));
  return {
    id: "yijing",
    name: "주역",
    summary: `매화역수로 뽑은 본괘는 ${describe(original, moving)} 지괘는 ${changed.name}입니다.`,
    points: [
      `본괘 ${original.name}: 지금 명식의 기본 태도`,
      `변효 ${moving}효: 손대면 결과가 갈리는 지점`,
      `지괘 ${changed.name}: 그 선택을 지난 뒤의 자리`,
    ],
    lines: original.lines,
    moving,
    changedLines: changed.lines,
    original: original.name,
    changed: changed.name,
  };
}

export function buildLiuyao(chart) {
  const base = buildYijing(chart);
  const roles = ["초효", "이효", "삼효", "사효", "오효", "상효"];
  const world = 3;
  const response = 6;
  return {
    id: "liuyao",
    name: "육효",
    summary: `${base.original}의 ${iga(roles[base.moving - 1])} 동합니다. 세효는 ${roles[world - 1]}, 응효는 ${roles[response - 1]}로 두고, 동효가 세와 가까우면 내 쪽에서 일이 열리고 응과 가까우면 상대와 환경이 먼저 움직입니다.`,
    points: [
      `동효 ${roles[base.moving - 1]}가 ${base.moving <= 3 ? "아래 괘, 곧 나의 기반" : "위 괘, 곧 밖의 조건"}에 있습니다.`,
      `지괘 ${eun(base.changed)} 효가 바뀐 뒤의 결론입니다.`,
      chart.gender === "male"
        ? "재물 효는 재성, 직업 효는 관성 쪽으로 읽습니다."
        : "관계 효는 관성, 자식·표현 효는 식상 쪽으로 읽습니다.",
    ],
    lines: base.lines,
    moving: base.moving,
    original: base.original,
    changed: base.changed,
  };
}

export function buildTojeong(chart) {
  const yearNum = BRANCHES.indexOf(chart.pillars[0].zhi) + 1;
  const month = chart.lunarMonth;
  const day = chart.lunarDay;
  const upper = mod(yearNum + month, 8) || 8;
  const lower = mod(yearNum + month + day, 8) || 8;
  const gua = hexagram(TRIGRAMS[upper], TRIGRAMS[lower]);
  return {
    id: "tojeong",
    name: "토정비결",
    summary: `${chart.lunarText}의 세수 ${yearNum}, 월 ${month}, 일 ${day}로 뽑은 괘는 ${gua.name}입니다. ${gua.upper.nature}과 ${iga(gua.lower.nature)} 한 해의 결을 이루니, ${gua.upper.trait}은 밖으로 드러나는 일이고 ${gua.lower.trait}은 집 안에서 먼저 다듬을 일입니다.`,
    points: [
      `${gua.name}은 새해 결심을 크게 벌리기보다, 괘의 아래를 안정시킨 뒤 위를 여는 순서가 맞습니다.`,
      `세수가 ${yearNum}이라 같은 띠라도 월·일이 다르면 괘가 갈립니다.`,
    ],
    original: gua.name,
  };
}
