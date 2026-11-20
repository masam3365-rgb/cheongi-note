import { BRANCHES, mod } from "./ganzhi.js";

const BUREAU_TABLE = [
  [2, 6, 5, 3, 4],
  [6, 5, 3, 4, 2],
  [5, 3, 4, 2, 6],
  [3, 4, 2, 6, 5],
  [4, 2, 6, 5, 3],
  [6, 5, 3, 4, 2],
];

const BUREAU_NAME = { 2: "수2국", 3: "목3국", 4: "금4국", 5: "토5국", 6: "화6국" };

const PALACES = ["명궁", "형제궁", "부처궁", "자녀궁", "재백궁", "질액궁", "천이궁", "노복궁", "관록궁", "전택궁", "복덕궁", "부모궁"];

const STAR_MEAN = {
  자미: "중심을 잡고 사람을 모으는 별",
  천기: "기획과 학문, 잔머리보다 설계가 강한 별",
  태양: "밖으로 드러나고 명예를 맡는 별",
  무곡: "재물과 결단, 숫자와 실행의 별",
  천동: "복과 어린 기운, 배우는 즐거움의 별",
  염정: "예리한 매력과 시비가 함께 붙는 별",
  천부: "창고와 안정, 모아 두고 지키는 별",
  태음: "재물·부동산·마음 살림의 별",
  탐랑: "욕망과 재능, 연애와 사교의 별",
  거문: "말과 문서, 시비와 학문의 별",
  천상: "옷차림과 문서, 체면의 별",
  천량: "어른과 명분, 정리와 학문의 별",
  칠살: "밀어붙이는 권력과 경쟁의 별",
  파군: "허물고 다시 짓는 변화의 별",
};

const SIHUA = {
  甲: [["염정", "화록"], ["파군", "화권"], ["무곡", "화과"], ["태양", "화기"]],
  乙: [["천기", "화록"], ["천량", "화권"], ["자미", "화과"], ["태음", "화기"]],
  丙: [["천동", "화록"], ["천기", "화권"], ["문창", "화과"], ["염정", "화기"]],
  丁: [["태음", "화록"], ["천동", "화권"], ["천기", "화과"], ["거문", "화기"]],
  戊: [["탐랑", "화록"], ["태음", "화권"], ["우필", "화과"], ["천기", "화기"]],
  己: [["무곡", "화록"], ["탐랑", "화권"], ["천량", "화과"], ["문곡", "화기"]],
  庚: [["태양", "화록"], ["무곡", "화권"], ["태음", "화과"], ["천동", "화기"]],
  辛: [["거문", "화록"], ["태양", "화권"], ["문곡", "화과"], ["문창", "화기"]],
  壬: [["천량", "화록"], ["자미", "화권"], ["좌보", "화과"], ["무곡", "화기"]],
  癸: [["파군", "화록"], ["거문", "화권"], ["태음", "화과"], ["탐랑", "화기"]],
};

function stemGroup(stem) {
  return { 甲: 0, 己: 0, 乙: 1, 庚: 1, 丙: 2, 辛: 2, 丁: 3, 壬: 3, 戊: 4, 癸: 4 }[stem];
}

function ziweiIndex(day, bureau) {
  let borrow = 0;
  while ((day + borrow) % bureau !== 0) borrow += 1;
  const quotient = (day + borrow) / bureau;
  if (borrow % 2 === 0) return mod(2 + quotient - 1, 12);
  return mod(2 - (quotient - 1), 12);
}

function starsOf(index, offsets) {
  return offsets.map(([delta, name]) => ({ branch: mod(index + delta, 12), name }));
}

export function buildZiwei(chart) {
  const hourIndex = BRANCHES.indexOf(chart.pillars[3].zhi);
  const ming = mod(2 + chart.lunarMonth - 1 - hourIndex, 12);
  const shen = mod(2 + chart.lunarMonth - 1 + hourIndex, 12);
  const bureau = BUREAU_TABLE[Math.floor(ming / 2)][stemGroup(chart.pillars[0].gan)];
  const ziwei = ziweiIndex(chart.lunarDay, bureau);
  const tianfu = mod(4 - ziwei, 12);
  const placed = [
    ...starsOf(ziwei, [
      [0, "자미"],
      [-1, "천기"],
      [-3, "태양"],
      [-4, "무곡"],
      [-5, "천동"],
      [-8, "염정"],
    ]),
    ...starsOf(tianfu, [
      [0, "천부"],
      [1, "태음"],
      [2, "탐랑"],
      [3, "거문"],
      [4, "천상"],
      [5, "천량"],
      [6, "칠살"],
      [10, "파군"],
    ]),
  ];

  const transforms = Object.fromEntries(SIHUA[chart.pillars[0].gan].map(([star, tag]) => [star, tag]));
  const cells = BRANCHES.map((branch, index) => ({
    branch,
    branchKo: chart.pillars[0].gzKo ? branch : branch,
    palace: PALACES[mod(ming - index, 12)],
    shen: index === shen,
    ming: index === ming,
    stars: placed
      .filter((star) => star.branch === index)
      .map((star) => ({ name: star.name, hua: transforms[star.name] || "" })),
  }));

  cells.forEach((cell) => {
    const ko = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
    cell.branchKo = ko[BRANCHES.indexOf(cell.branch)];
  });

  const at = (palace) => cells.find((cell) => cell.palace === palace);
  const starText = (palace) => {
    const stars = at(palace).stars;
    if (!stars.length) return "주요 14성이 비어 있어 유연한 궁";
    return stars.map((star) => `${star.name}${star.hua ? `(${star.hua})` : ""}`).join(", ");
  };

  const mingStars = at("명궁").stars;
  const summary = mingStars.length
    ? `명궁은 ${cells[ming].branchKo}지에 있고 ${BUREAU_NAME[bureau]}입니다. 명궁의 별은 ${starText("명궁")}이라 ${STAR_MEAN[mingStars[0].name]}.`
    : `명궁은 ${cells[ming].branchKo}지에 있고 ${BUREAU_NAME[bureau]}입니다. 명궁에 주요 14성이 없어, 주변 궁의 별을 빌려 읽는 명식입니다.`;

  return {
    id: "ziwei",
    name: "자미두수",
    bureau: BUREAU_NAME[bureau],
    summary,
    points: [
      `재백궁: ${starText("재백궁")}`,
      `관록궁: ${starText("관록궁")}`,
      `부처궁: ${starText("부처궁")}`,
      `자녀궁: ${starText("자녀궁")}`,
      `질액궁: ${starText("질액궁")}`,
      `전택궁: ${starText("전택궁")}`,
    ],
    cells,
    lookup: Object.fromEntries(PALACES.map((name) => [name, starText(name)])),
  };
}
