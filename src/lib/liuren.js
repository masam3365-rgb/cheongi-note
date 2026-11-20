import { BRANCHES, BRANCH_ELEMENT, koGz } from "./ganzhi.js";

const GENERAL = {
  立春: "亥",
  雨水: "亥",
  惊蛰: "戌",
  春分: "戌",
  清明: "酉",
  谷雨: "酉",
  立夏: "申",
  小满: "申",
  芒种: "未",
  夏至: "未",
  小暑: "午",
  大暑: "午",
  立秋: "巳",
  处暑: "巳",
  白露: "辰",
  秋分: "辰",
  寒露: "卯",
  霜降: "卯",
  立冬: "寅",
  小雪: "寅",
  大雪: "丑",
  冬至: "丑",
  小寒: "子",
  大寒: "子",
};

const GENERAL_NAME = {
  亥: "등명",
  戌: "하괴",
  酉: "종규",
  申: "현무",
  未: "태상",
  午: "승광",
  巳: "태을",
  辰: "천강",
  卯: "태충",
  寅: "공조",
  丑: "대길",
  子: "신후",
};

export function buildLiuren(chart) {
  const general = GENERAL[chart.jieQi] || "亥";
  const day = BRANCHES.indexOf(chart.dayBranch);
  const hour = BRANCHES.indexOf(chart.pillars[3].zhi);
  const heaven = Array(12);
  for (let i = 0; i < 12; i += 1) {
    heaven[modIndex(day + i)] = modIndex(BRANCHES.indexOf(general) + i);
  }
  const first = heaven[hour];
  const second = heaven[first];
  const third = heaven[second];
  const trio = [first, second, third].map((index) => BRANCHES[index]);
  const kong = chart.xunKong;
  const hitKong = trio.filter((branch) => kong.includes(koGz(branch))).map((branch) => koGz(branch));
  const elements = trio.map((branch) => BRANCH_ELEMENT[branch]);

  return {
    id: "liuren",
    name: "육임",
    summary: `${chart.jieQiKo}의 월장은 ${koGz(general)}(${GENERAL_NAME[general]})입니다. 일지 ${koGz(chart.dayBranch)} 위에 월장을 두고 천반을 깔면, 시지에서 초전 ${koGz(trio[0])}, 중전 ${koGz(trio[1])}, 말전 ${koGz(trio[2])}이 이어집니다. 오행은 ${elements.join(" → ")}입니다.`,
    points: [
      hitKong.length
        ? `삼전 가운데 ${hitKong.join(", ")}이 공망이라 그 전은 약속이 늦거나 빈말로 남기 쉽습니다.`
        : "삼전이 공망을 비켰으니, 나온 전은 빈칸 없이 현실로 이어지기 쉽습니다.",
      `초전은 일의 시작, 중전은 과정, 말전은 결과입니다. 말전의 오행은 ${elements[2]}라서, 끝자락의 태도가 그 성질을 띱니다.`,
      "과전은 일간과 월장이 가리키는 천반을 함께 보되, 여기서는 시진 삼전을 본과로 삼았습니다.",
    ],
    trio: trio.map(koGz),
  };
}

function modIndex(n) {
  return ((n % 12) + 12) % 12;
}
