import { easeSentence } from "./plainTerms.js";

const ELEMENT_CORE = {
  목: {
    name: "나무",
    vibe: "자라는 기운",
    style: "외향에 가깝습니다. 새 일을 먼저 꺼내고, 사람과 이야기를 나누며 힘이 납니다.",
    core: "타고난 본성은 새싹처럼 앞으로 뻗는 쪽입니다. 궁금한 것이 생기면 손을 뻗고, 누군가가 자라도록 도와주는 일에 마음이 갑니다.",
    deep: "속마음은 ‘나만의 숲을 키우고 싶다’는 쪽에 가깝습니다. 겉으로는 밝게 시작하지만, 끝맺음을 혼자 떠안으면 쉽게 지칩니다.",
    strengths: ["시작하는 용기", "사람을 키워 주는 마음", "새로운 아이디어"],
    weaknesses: ["끝을 맺기 전에 다음 일을 벌임", "기다려 달라는 말을 잘 못 함", "관심사가 너무 넓어짐"],
    tip: "시작할 때는 끝날을 달력에 먼저 적어 두세요. 한 가지를 끝낸 뒤에 다음 씨앗을 심으면 마음이 한결 편해집니다.",
  },
  화: {
    name: "불",
    vibe: "따뜻하게 비추는 기운",
    style: "외향에 가깝습니다. 밝게 말하고 분위기를 데우며, 반응이 오면 더 힘이 납니다.",
    core: "타고난 본성은 등불처럼 주변을 밝히는 쪽입니다. 칭찬과 대화가 오면 금세 살아나고, 혼자 어두우면 금방 시듭니다.",
    deep: "속마음은 ‘내가 따뜻하면 모두가 편해진다’는 믿음입니다. 다만 밤늦게까지 감정을 태우면 다음 날 몸과 말이 무거워집니다.",
    strengths: ["사람을 편하게 만드는 말", "열정과 표현력", "자리를 밝게 만드는 힘"],
    weaknesses: ["흥분한 말을 바로 보냄", "거절을 잘 못 함", "쉬지 않고 달리다 방전됨"],
    tip: "중요한 문장은 하룻밤 자고 보내세요. 낮에 밝히고 밤에는 불을 끄는 리듬이 당신을 지켜 줍니다.",
  },
  토: {
    name: "흙",
    vibe: "받쳐 주는 기운",
    style: "중도형입니다. 사람 사이에서는 따뜻하지만, 결정은 천천히 고르는 편입니다.",
    core: "타고난 본성은 땅처럼 믿어 주는 쪽입니다. 약속과 신뢰를 소중히 하고, 급한 변화보다 차근한 안정을 좋아합니다.",
    deep: "속마음은 ‘우리 편이 무너지지 않게’입니다. 겉으로는 차분하지만, 걱정이 쌓이면 배가 더부룩해지듯 결정이 늦어집니다.",
    strengths: ["믿음직함", "오래 지키는 성실함", "갈등을 부드럽게 받쳐 줌"],
    weaknesses: ["걱정이 결정을 미룸", "거절을 미뤄 짐이 커짐", "변화를 너무 늦게 고름"],
    tip: "걱정이 오면 ‘오늘 할 일 하나’만 고르세요. 식사 시간과 잠자리를 지키면 마음이 다시 단단해집니다.",
  },
  금: {
    name: "쇠",
    vibe: "기준을 세우는 기운",
    style: "내향에 가깝습니다. 혼자 정리한 뒤 말하고, 애매한 약속보다 분명한 규칙을 좋아합니다.",
    core: "타고난 본성은 줄자처럼 반듯한 쪽입니다. 옳고 그름을 빨리 느끼고, 흐트러진 일을 깔끔히 정리할 때 마음이 놓입니다.",
    deep: "속마음은 ‘제대로 해야 마음이 편하다’입니다. 맞는 말이라도 너무 차갑게 나가면 가까운 사람이 먼저 멀어질 수 있습니다.",
    strengths: ["정리력", "원칙을 지키는 힘", "품질을 높이는 눈"],
    weaknesses: ["맞는 말도 차갑게 들림", "융통성이 부족해 보임", "완벽한 답을 기다리다 늦음"],
    tip: "지적 앞에는 따뜻한 한 줄을 먼저 쓰세요. ‘고마워요’ 다음에 기준을 말하면 관계가 마르지 않습니다.",
  },
  수: {
    name: "물",
    vibe: "깊이 흐르는 기운",
    style: "내향에 가깝습니다. 먼저 듣고 속으로 이해한 뒤, 타이밍을 보고 움직입니다.",
    core: "타고난 본성은 강물처럼 깊이 읽는 쪽입니다. 정보는 많이 모으고, 겉으로 드러내기보다 흐름을 보고 결정합니다.",
    deep: "속마음은 ‘내가 먼저 알면 안전하다’입니다. 혼자 결론을 너무 오래 쥐면, 주변은 당신이 닫혀 있다고 느낄 수 있습니다.",
    strengths: ["관찰력", "전략을 짜는 힘", "타이밍을 고르는 감각"],
    weaknesses: ["혼자 결론 내고 공유가 늦음", "걱정이 밤에 커짐", "도움을 청하기 어려워함"],
    tip: "생각한 것의 절반만 짧게 말해 보세요. 따뜻한 물과 규칙적인 잠이 당신의 흐름을 맑게 합니다.",
  },
};

const MONTH_GOD_DEPTH = {
  정재: "생활과 돈의 계산이 성격을 단단하게 붙잡아 줍니다. 현실적인 약속을 지키면 마음이 안정됩니다.",
  편재: "바깥 기회에 눈이 밝습니다. 새 사람을 만나면 살아나지만, 한 번에 하나만 붙잡으면 좋습니다.",
  식신: "만들고 돌보는 데서 기쁨을 느낍니다. 결과물을 보여 줄 때 자존감이 올라갑니다.",
  상관: "생각이 빠르고 표현이 세집니다. 초안을 빨리 보여 주고, 말은 한 톤 낮추면 설득력이 커집니다.",
  정관: "이름과 책임을 중시합니다. 공식적인 자리와 예의가 당신을 돋보이게 합니다.",
  편관: "압박 속에서도 존재감이 커집니다. 역할의 범위를 글로 남기면 소모가 줄어듭니다.",
  정인: "배움과 도움을 잘 받습니다. 멘토와 문서가 당신의 심지를 지켜 줍니다.",
  편인: "혼자만의 세계가 깊습니다. 특수한 관심사를 존중받거나, 한 사람에게만 속마음을 열면 편합니다.",
  비견: "내 몫을 지키는 힘이 셉니다. 함께할 때는 역할을 먼저 나누면 갈등이 줄어듭니다.",
  겁재: "경쟁 감각이 빠릅니다. 비교와 충동만 조심하면, 그 예리함이 실력이 됩니다.",
};

const CHILD_TONE = {
  식신: {
    bond: "아이와는 먹이고 놀아 주는 시간이 인연을 깊게 하기 쉽습니다.",
    trait: "전통 해석으로는 밝고 표현이 풍부한 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
  상관: {
    bond: "아이와는 개성을 인정해 줄 때 마음이 통하기 쉽습니다.",
    trait: "전통 해석으로는 자기 주장이 분명하고 재능이 돋보이는 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
  정관: {
    bond: "아이와는 규칙과 약속을 함께 지킬 때 신뢰가 쌓이기 쉽습니다.",
    trait: "전통 해석으로는 또렷하고 책임감 있는 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
  편관: {
    bond: "아이와는 목소리보다 낮은 대화가 관계를 살리기 쉽습니다.",
    trait: "전통 해석으로는 기세와 승부욕이 있을 수 있는 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
  정재: {
    bond: "아이와는 생활비·일정처럼 현실적인 돌봄이 사랑이 되기 쉽습니다.",
    trait: "전통 해석으로는 실속과 생활력이 돋보이는 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
  편재: {
    bond: "아이와는 바깥 경험과 짧은 외출이 추억이 되기 쉽습니다.",
    trait: "전통 해석으로는 호기심과 활동성이 돋보이는 결로 읽히는 편입니다. 실제 성향은 양육 환경과 함께 확인해 보세요.",
  },
};

function topElements(count) {
  return Object.entries(count)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));
}

function childGod(chart) {
  const roles = chart.strength.roles;
  const gods = chart.pillars.map((pillar) => pillar.shiShen).filter(Boolean);
  if (chart.gender === "female") {
    if (gods.includes("식신")) return "식신";
    if (gods.includes("상관")) return "상관";
    return roles.child === "화" || roles.child === "토" ? "식신" : "상관";
  }
  if (gods.includes("정관")) return "정관";
  if (gods.includes("편관")) return "편관";
  return "정관";
}

function buildPersonality(chart) {
  const core = ELEMENT_CORE[chart.dayElement];
  const ranked = topElements(chart.count);
  const strong = chart.strength.strong;
  const depthLabel = strong ? "버티는 힘이 센 편" : "채움이 필요한 편";
  const depthText = strong
    ? "속 기질은 스스로 중심을 잡는 쪽에 가깝습니다. 방향을 정하면 오래 밀 수 있지만, 혼자 모든 짐을 지려 하면 주변과 멀어질 수 있습니다."
    : "속 기질은 따뜻한 도움과 환경이 있을 때 빛나는 쪽에 가깝습니다. 혼자 버티기보다 믿을 사람 한 명을 두면 성격이 훨씬 편해집니다.";
  const help = chart.strength.favorable;
  const drain = chart.strength.unfavorable[0];
  const lack = [...help].sort((a, b) => chart.count[a] - chart.count[b])[0];

  return {
    title: "성격 분석",
    kicker: `${chart.dayMasterKo}${chart.dayElement} · ${core.vibe}`,
    elementName: core.name,
    style: core.style,
    summary: easeSentence(`당신의 본원 기운은 ${core.name}(${chart.dayElement})입니다. ${core.core}`),
    outward: core.style,
    deepTitle: "심층 기질",
    deep: easeSentence(`${depthLabel}입니다. ${depthText} ${core.deep} 사회생활의 결은 ${chart.monthGod}이라, ${MONTH_GOD_DEPTH[chart.monthGod] || "일상에서 그 결이 성격을 더 또렷하게 만듭니다."}`),
    strengths: core.strengths,
    weaknesses: core.weaknesses,
    tip: core.tip,
    lack,
    balance: easeSentence(
      `오행 개수는 목 ${chart.count.목}, 화 ${chart.count.화}, 토 ${chart.count.토}, 금 ${chart.count.금}, 수 ${chart.count.수}입니다. 가장 많은 기운은 ${ranked[0].name}, 개수로 가장 적은 기운은 ${ranked[ranked.length - 1].name}입니다. 우선 도움 기운은 ${help.join("·")}이고, 생활(음식·색)에서 먼저 채울 기운은 그중 가장 모자란 ${lack}입니다. ${drain} 기운이 과해지지 않게 보면 성격이 한결 고르게 느껴집니다.`,
    ),
  };
}

function buildChildren(chart, forecast, ziwei, profile) {
  const family = forecast?.find((item) => item.id === "family");
  const god = childGod(chart);
  const tone = CHILD_TONE[god] || CHILD_TONE.식신;
  const palace = ziwei?.lookup?.자녀궁 || "자녀와 닿는 별자리가 열려 있는 편";
  const year = family?.years?.[0];
  const married = profile?.status === "married";
  const timing = year
    ? `${year.year}년 전후(${year.level})에 아이·가족과 연결된 이야기가 또렷해질 수 있습니다.`
    : "아이와 연결된 이야기는 생활의 온도가 따뜻할 때 더 잘 열립니다.";

  return {
    title: married ? "자녀·양육" : "자녀 인연(참고)",
    kicker: married ? "양육·가족 돌봄의 결" : "혼인·양육 전에도 참고할 수 있는 인연의 결",
    summary: `${tone.bond} ${tone.trait}`,
    bond: tone.bond,
    trait: tone.trait,
    detail: easeSentence(
      `전통 해석에서 자녀 자리는 ${palace}으로 읽힙니다. ${family?.summary || "가족과 아이 이야기는 긴 설명보다 생활 습관에서 먼저 풀립니다."}`,
    ),
    traditionNote: `자미 자녀궁 · ${palace}`,
    tip: chart.gender === "female"
      ? "아이와는 밥 한 끼, 짧은 칭찬 한 줄이 긴 훈계보다 인연을 깊게 하기 쉽습니다."
      : "아이와는 규칙 하나를 같이 정하고, 지키는 모습을 먼저 보여 주면 신뢰가 쌓이기 쉽습니다.",
    timing,
  };
}

function buildAncestors(chart, ziwei) {
  const yearPillar = chart.pillars[0];
  const parentPalace = ziwei?.lookup?.부모궁 || "부모·가문과 닿는 자리가 연결되어 있습니다";
  const blessing = ziwei?.lookup?.복덕궁 || "복을 기르는 자리가 함께 읽힙니다";
  const rootTone = chart.strength.strong
    ? "가문의 기운이 당신을 세워 주는 쪽보다, 당신이 가문의 이야기를 이어 가는 힘이 더 큽니다."
    : "가문과 어른의 돌봄, 집안의 생활 습관이 당신의 성격을 부드럽게 받쳐 주는 편입니다.";

  let influence =
    "가문의 생활력과 현실 감각이 당신의 뿌리가 됩니다. 집안의 좋은 습관 하나만 이어가도 충분합니다.";
  if (yearPillar.shiShen === "정인" || yearPillar.shiShen === "편인") {
    influence = "어른의 가르침과 보호가 성격의 뿌리가 됩니다. 고마운 말은 짧게라도 전해 두면 마음이 편해집니다.";
  } else if (yearPillar.shiShen === "비견" || yearPillar.shiShen === "겁재") {
    influence = "형제·친척과의 비교가 어릴 때부터 성격에 닿았을 수 있습니다. 내 속도와 가문의 속도를 나누면 숨이 트입니다.";
  } else if (yearPillar.shiShen === "정관" || yearPillar.shiShen === "편관") {
    influence = "가문의 규칙과 체면이 성격을 반듯하게 만들었습니다. 원칙은 지키되, 가까운 사람에게는 온기를 한 스푼 더하세요.";
  }

  return {
    title: "조상운",
    kicker: "가문의 기운 및 뿌리 영향",
    summary: easeSentence(`뿌리 기운은 년주 ${yearPillar.gzKo}에서 읽습니다. ${rootTone}`),
    detail: easeSentence(`가문의 결은 ${yearPillar.gzKo}(${yearPillar.shiShen})로 이어집니다. 자미의 부모 자리에서는 ${parentPalace}이고, 복을 기르는 자리는 ${blessing}입니다. 어릴 때 집안에서 배운 말투와 식사 습관이, 지금의 성격 바닥에 그대로 남아 있을 가능성이 큽니다.`),
    influence,
    tip: "조상의 기운은 거창한 행사보다, 집 안을 밝히고 어른에게 안부를 전하는 작은 행동에서 살아납니다.",
  };
}

export function buildCharacterProfile(chart, forecast, ziwei, profile) {
  return {
    personality: buildPersonality(chart),
    children: buildChildren(chart, forecast, ziwei, profile),
    ancestors: buildAncestors(chart, ziwei),
  };
}
