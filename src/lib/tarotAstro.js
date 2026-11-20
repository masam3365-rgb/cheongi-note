import { branchIndex, stemIndex } from "./ganzhi.js";

const SIGNS = [
  { name: "염소", element: "토", from: [12, 22], to: [1, 19], trait: "목표를 쌓아 올리는 별입니다. 속도보다 구조가 이깁니다." },
  { name: "물병", element: "금", from: [1, 20], to: [2, 18], trait: "틀을 의심하고 새로운 판을 그리는 별입니다. 혼자 앞서가면 설명이 필요합니다." },
  { name: "물고기", element: "수", from: [2, 19], to: [3, 20], trait: "분위기와 직감이 빠른 별입니다. 경계를 정해야 힘이 남습니다." },
  { name: "양", element: "화", from: [3, 21], to: [4, 19], trait: "시작이 빠른 별입니다. 첫 주의 열정을 마감까지 나눠 쓰세요." },
  { name: "황소", element: "토", from: [4, 20], to: [5, 20], trait: "감각과 소유가 분명한 별입니다. 편한 속도를 지키면 돈이 남습니다." },
  { name: "쌍둥이", element: "금", from: [5, 21], to: [6, 21], trait: "말과 정보가 재주인 별입니다. 한 주제를 끝까지 잡는 연습이 필요합니다." },
  { name: "게", element: "수", from: [6, 22], to: [7, 22], trait: "집과 마음을 지키는 별입니다. 돌봄이 과하면 속이 상합니다." },
  { name: "사자", element: "화", from: [7, 23], to: [8, 22], trait: "드러날 때 빛나는 별입니다. 박수보다 결과 파일을 남기세요." },
  { name: "처녀", element: "토", from: [8, 23], to: [9, 22], trait: "디테일로 신뢰를 만드는 별입니다. 완벽을 기다리다 시기를 놓치지 마세요." },
  { name: "천칭", element: "금", from: [9, 23], to: [10, 22], trait: "균형과 관계를 보는 별입니다. 양쪽을 다 들으면 결정이 늦어집니다." },
  { name: "전갈", element: "수", from: [10, 23], to: [11, 22], trait: "속마음을 깊게 읽는 별입니다. 의심이 확인보다 앞서면 관계가 식습니다." },
  { name: "사수", element: "화", from: [11, 23], to: [12, 21], trait: "멀리 보고 움직이는 별입니다. 약속의 범위를 먼저 적으세요." },
];

const MAJOR = [
  ["바보", "시작과 여행", "경험 없는 길을 열 때입니다. 짐을 줄이고 한 걸음만 옮기세요."],
  ["마법사", "도구와 실력", "이미 가진 기술로 충분합니다. 새 장비보다 손끝을 믿으세요."],
  ["여사제", "침묵과 직감", "아직 말하지 마세요. 하루만 정보를 더 모으면 답이 선명해집니다."],
  ["여황제", "풍요와 돌봄", "사람과 자리를 먹이고 키우는 쪽이 이득입니다."],
  ["황제", "질서와 경계", "규칙을 세우면 혼란이 줄어듭니다. 권한의 끝을 문장으로 적으세요."],
  ["교황", "배움과 전통", "혼자 결론 내기보다 검증된 방법과 선배의 조언을 빌리세요."],
  ["연인", "선택과 마음", "두 마음을 동시에 두지 마세요. 오늘의 선택은 관계의 방향을 정합니다."],
  ["전차", "전진과 통제", "속도를 내도 되는 카드입니다. 핸들은 한 사람이 잡아야 합니다."],
  ["힘", "부드러운 용기", "소리 높이기보다 호흡을 고르면 상대가 따릅니다."],
  ["은둔자", "혼자 보는 시간", "모임을 줄이고 등불을 켜듯 한 가지 질문만 드세요."],
  ["운명의 수레바퀴", "순환", "올라가는 중인지 내려가는 중인지 인정하면 대응이 쉬워집니다."],
  ["정의", "균형과 계약", "숫자와 조건을 맞추면 마음이 편해집니다. 구두 약속은 피하세요."],
  ["매달린 사람", "멈춤", "지금은 버티는 지혜가 이깁니다. 성급한 사직과 해지는 손실입니다."],
  ["죽음", "마무리", "끝난 일을 붙잡지 마세요. 정리한 자리에 다음이 앉습니다."],
  ["절제", "섞기와 조절", "극단을 피하고 비율을 맞추면 몸과 돈이 같이 남습니다."],
  ["악마", "집착과 유혹", "달콤한 제안의 이자를 계산하세요. 묶이는 계약은 오늘 서명하지 마세요."],
  ["탑", "갑작스러운 진실", "무너지는 것처럼 보여도, 숨기던 문제가 드러나는 과정입니다. 사실을 먼저 적으세요."],
  ["별", "회복과 희망", "작은 루틴이 희망을 만듭니다. 물을 마시고 내일을 한 줄만 적으세요."],
  ["달", "안개와 불안", "밤의 걱정은 과장되기 쉽습니다. 아침의 메모와 대조하세요."],
  ["태양", "드러남과 성취", "숨기지 말고 결과를 보여 주세요. 사람이 자연스럽게 모입니다."],
  ["심판", "부름과 재시작", "지난 선택을 평가하고, 같은 실수를 반복하지 않겠다는 문장을 남기세요."],
  ["세계", "완성", "한 주기의 끝입니다. 축하하고, 다음 주기의 첫 할 일을 작게 적으세요."],
];

function sunSign(month, day) {
  return (
    SIGNS.find((sign) => {
      const [fromMonth, fromDay] = sign.from;
      const [toMonth, toDay] = sign.to;
      if (fromMonth === toMonth) return month === fromMonth && day >= fromDay && day <= toDay;
      if (month === fromMonth && day >= fromDay) return true;
      if (month === toMonth && day <= toDay) return true;
      return false;
    }) || SIGNS[0]
  );
}

function draw(chart) {
  const seed = stemIndex(chart.dayStem) * 12 + branchIndex(chart.dayBranch) + chart.solar.month * 3 + chart.solar.day;
  const used = new Set();
  const roles = ["바탕", "지금", "조언"];
  return roles.map((role, index) => {
    let cursor = Math.abs(seed + index * 7) % MAJOR.length;
    while (used.has(cursor)) cursor = (cursor + 1) % MAJOR.length;
    used.add(cursor);
    const [name, theme, text] = MAJOR[cursor];
    return { role, name, theme, text };
  });
}

export function buildSky(chart) {
  const sign = sunSign(chart.solar.month, chart.solar.day);
  const same = sign.element === chart.dayElement;
  const cards = draw(chart);
  return {
    id: "sky",
    title: "타로 · 별자리",
    sign,
    bridge: same
      ? `태양별자리 ${sign.name}자리의 기운과 사주 일간 ${chart.dayElement}이 같은 결입니다. 별자리의 본능과 사주의 태도가 한 방향을 봅니다.`
      : `태양별자리 ${sign.name}자리는 ${sign.element}의 언어이고, 사주 일간은 ${chart.dayElement}입니다. 겉으로 보이는 매력과 속으로 결정하는 방식이 다르니, 소개할 때 둘 다 말해 주세요.`,
    cards,
  };
}
