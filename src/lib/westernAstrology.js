/** 출생 시각·출생지 기반 열대 황도 근사 점성술 — 쉬운 일상어 풀이 */

import { resolveBirthPlace } from "./birthPlaces.js";
import { dayMasterPhrase, strengthPhrase } from "./plainTerms.js";

const SIGNS = [
  {
    name: "양",
    en: "Aries",
    element: "화",
    modality: "활동",
    houseTheme: "시작과 나를 드러내기",
    easy: "먼저 나서고 속도를 내는 기질",
    tip: "시작은 빠르니, 마감 날짜를 미리 적어 두면 결과가 남습니다.",
  },
  {
    name: "황소",
    en: "Taurus",
    element: "토",
    modality: "고정",
    houseTheme: "안정과 감각적 편안함",
    easy: "익숙한 리듬과 실질적인 안정을 좋아하는 기질",
    tip: "급하게 바꾸기보다, 하나씩 자리를 잡는 방식이 잘 맞습니다.",
  },
  {
    name: "쌍둥이",
    en: "Gemini",
    element: "금",
    modality: "유동",
    houseTheme: "말과 정보 나누기",
    easy: "대화와 아이디어가 빠른 기질",
    tip: "관심사가 넓으니, 이번 주에 끝낼 주제 하나만 고르면 힘이 모입니다.",
  },
  {
    name: "게",
    en: "Cancer",
    element: "수",
    modality: "활동",
    houseTheme: "집과 마음 돌보기",
    easy: "가까운 사람과 집의 온도에 민감한 기질",
    tip: "감정 기복이 있을 때는 집·식사·수면부터 챙기면 마음이 가라앉습니다.",
  },
  {
    name: "사자",
    en: "Leo",
    element: "화",
    modality: "고정",
    houseTheme: "표현과 인정받기",
    easy: "드러나고 칭찬받을 때 힘이 나는 기질",
    tip: "박수보다 ‘남긴 결과물’을 쌓으면 인정이 오래갑니다.",
  },
  {
    name: "처녀",
    en: "Virgo",
    element: "토",
    modality: "유동",
    houseTheme: "정리와 세심한 관리",
    easy: "디테일과 실용을 중시하는 기질",
    tip: "완벽을 기다리다 시기를 놓치기 쉬우니, 70점짜리 초안부터 보여 주세요.",
  },
  {
    name: "천칭",
    en: "Libra",
    element: "금",
    modality: "활동",
    houseTheme: "관계와 균형 맞추기",
    easy: "사람 사이 분위기와 공정함을 살피는 기질",
    tip: "양쪽 이야기를 다 듣되, 결정 기한을 정해 두면 지치지 않습니다.",
  },
  {
    name: "전갈",
    en: "Scorpio",
    element: "수",
    modality: "고정",
    houseTheme: "깊은 변화와 진심",
    easy: "속마음을 깊이 읽고 쉽게 놓지 않는 기질",
    tip: "의심이 커질 때는 사실 확인부터 하면 관계가 덜 무거워집니다.",
  },
  {
    name: "사수",
    en: "Sagittarius",
    element: "화",
    modality: "유동",
    houseTheme: "시야 넓히기와 믿음",
    easy: "멀리 보고 의미를 찾는 기질",
    tip: "약속의 범위를 먼저 적어두면, 열정이 책임으로 잘 이어집니다.",
  },
  {
    name: "염소",
    en: "Capricorn",
    element: "토",
    modality: "활동",
    houseTheme: "목표와 현실적 성취",
    easy: "오래 버티며 구조를 쌓는 기질",
    tip: "속도보다 단계별 계획이 맞습니다. 한 칸씩 올라가면 됩니다.",
  },
  {
    name: "물병",
    en: "Aquarius",
    element: "금",
    modality: "고정",
    houseTheme: "새로운 방식과 네트워크",
    easy: "틀에 갇히기 싫어하고 독특한 시각을 가진 기질",
    tip: "혼자 앞서가기 전에 한 줄 설명을 덧붙이면 사람들이 따라옵니다.",
  },
  {
    name: "물고기",
    en: "Pisces",
    element: "수",
    modality: "유동",
    houseTheme: "직감과 치유",
    easy: "분위기와 감수성이 섬세한 기질",
    tip: "경계(시간·역할)를 정해 두면, 좋은 직감이 흐려지지 않습니다.",
  },
];

const PLANETS = [
  { id: "sun", name: "태양", meaning: "내가 세상에 보여주고 싶은 목표와 자존감", easy: "삶의 주인공처럼 드러나는 나" },
  { id: "moon", name: "달", meaning: "마음이 편해지려면 필요한 감정 습관과 안정", easy: "속마음과 쉬는 방식" },
  { id: "mercury", name: "수성", meaning: "생각하고 말하고 배우는 방식", easy: "말과 생각의 습관" },
  { id: "venus", name: "금성", meaning: "사랑·취향·돈이 편안하게 느껴지는 방식", easy: "호감과 취향, 돈의 편안함" },
  { id: "mars", name: "화성", meaning: "일을 밀고 나가는 힘과 갈등에 반응하는 속도", easy: "추진력과 화내는 방식" },
  { id: "jupiter", name: "목성", meaning: "기회·배움·믿음이 커지는 방향", easy: "운이 트이고 시야가 넓어지는 곳" },
  { id: "saturn", name: "토성", meaning: "책임·시간·현실적인 뼈대를 만드는 힘", easy: "책임감과 오래 버티는 힘" },
];

const HOUSES = [
  { house: 1, short: "나·첫인상", easy: "내가 세상에 처음 보이는 모습과 몸의 태도" },
  { house: 2, short: "내 돈·가치", easy: "내가 버는 돈, 소유, ‘이게 나한테 값어치 있다’고 느끼는 기준" },
  { house: 3, short: "말·짧은 이동", easy: "대화, 배우기, 가까운 이동과 일상 정보" },
  { house: 4, short: "집·가족", easy: "집, 가족, 마음속 뿌리가 편안한지" },
  { house: 5, short: "연애·자녀 기쁨", easy: "설렘, 취미, 창작, 아이와 함께하는 기쁨" },
  { house: 6, short: "일상·건강·실무", easy: "매일의 일과 건강, 출근·서류·생활 루틴을 관리하는 영역" },
  { house: 7, short: "파트너·결혼", easy: "연인·배우자·중요한 계약처럼 ‘둘이서’ 하는 관계" },
  { house: 8, short: "공유 재산·깊은 변화", easy: "같이 쓰는 돈, 깊은 신뢰, 인생의 큰 전환" },
  { house: 9, short: "여행·배움", easy: "멀리 떠남, 공부, 시야를 넓히는 경험" },
  { house: 10, short: "직장·성취", easy: "직장에서의 내 자리, 사회적 평가와 성취" },
  { house: 11, short: "친구·목표", easy: "친구, 모임, 함께 꾸는 미래 목표" },
  { house: 12, short: "휴식·치유", easy: "혼자 쉬는 시간, 숨은 걱정, 마음을 치유하는 영역" },
];

const TOPIC_FOCUS = {
  marriage: { planet: "venus", house: 7, lensEasy: "호감과 취향(금성), 배우자·파트너 관계(7하우스)" },
  compatibility: { planet: "venus", house: 7, lensEasy: "취향(금성), 속마음(달), 둘의 관계(7하우스)" },
  children: { planet: "moon", house: 5, lensEasy: "감정 안정(달), 아이와 기쁨의 자리(5하우스)" },
  wealth: { planet: "venus", house: 2, lensEasy: "돈의 편안함(금성), 내 재산(2하우스)과 같이 쓰는 돈(8하우스)" },
  career: { planet: "saturn", house: 10, lensEasy: "책임과 성취(토성·태양), 직장에서의 자리(10하우스)" },
  business: { planet: "jupiter", house: 10, lensEasy: "확장과 실행(목성·화성), 바깥 간판과 성취(10하우스)" },
  moving: { planet: "moon", house: 4, lensEasy: "편안함(달), 집과 뿌리(4하우스)" },
  health: { planet: "mars", house: 6, lensEasy: "과로와 추진(화성), 일상·건강 루틴(6하우스)" },
  travel: { planet: "jupiter", house: 9, lensEasy: "시야를 넓히는 운(목성), 여행과 배움(9하우스)" },
};

function houseLabel(houseNo) {
  const idx = Math.min(11, Math.max(0, (Number(houseNo) || 1) - 1));
  const h = HOUSES[idx];
  return `${h.house}하우스(${h.easy})`;
}

function signEasy(signName) {
  const sign = SIGNS.find((item) => item.name === signName) || SIGNS[0];
  return `${sign.name}자리(${sign.easy})`;
}

function norm360(value) {
  const n = value % 360;
  return n < 0 ? n + 360 : n;
}

function signFromLong(longitude) {
  const idx = Math.floor(norm360(longitude) / 30) % 12;
  return { ...SIGNS[idx], index: idx, degree: norm360(longitude) % 30 };
}

function dayNumber(y, m, d) {
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

function approximateLongitudes(solar, hour = 12, minute = 0) {
  const dn = dayNumber(solar.year, solar.month, solar.day) + (hour + minute / 60) / 24;
  const sun = norm360(280.46 + 0.9856474 * dn);
  const moon = norm360(218.32 + 13.176396 * dn);
  const mercury = norm360(sun + 20 * Math.sin(dn / 8));
  const venus = norm360(sun + 40 * Math.sin(dn / 15));
  const mars = norm360(250 + 0.524 * dn);
  const jupiter = norm360(34 + 0.083 * dn);
  const saturn = norm360(280 + 0.033 * dn);
  return { sun, moon, mercury, venus, mars, jupiter, saturn };
}

/** 경도 보정 포함 상승궁 황경 근사(균등 하우스용). 정밀 천문 계산이 아닌 참고용입니다. */
function ascendantLong(sunLong, hour, minute, place) {
  const tz = place?.tz ?? 9;
  const lng = place?.lng ?? 126.978;
  const stdMeridian = 15 * tz;
  const lonCorrectionHours = (lng - stdMeridian) / 15;
  const local = hour + minute / 60 + lonCorrectionHours;
  return norm360(sunLong + (local - 6) * 15);
}

function parseClock(chart) {
  const unknown =
    Boolean(chart?.hourUnknown) || !chart?.clock || String(chart.clock).includes("미입력");
  if (unknown) return { hour: 12, minute: 0, hourUnknown: true };
  const [h, m] = String(chart.clock).split(":");
  const hour = Number(h);
  const minute = Number(m);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    return { hour: 12, minute: 0, hourUnknown: true };
  }
  return {
    hour,
    minute: Number.isFinite(minute) ? minute : 0,
    hourUnknown: false,
  };
}

function houseOf(longitude, ascLong) {
  const diff = norm360(longitude - ascLong);
  return Math.floor(diff / 30) + 1;
}

function planetBlock(id, long, asc) {
  const meta = PLANETS.find((item) => item.id === id);
  const sign = signFromLong(long);
  const house = houseOf(long, asc);
  const houseMeta = HOUSES[house - 1];
  return {
    id,
    name: meta.name,
    meaning: meta.meaning,
    easy: meta.easy,
    sign: sign.name,
    signEasy: sign.easy,
    element: sign.element,
    house,
    houseLabel: houseLabel(house),
    text: `${meta.name}(${meta.easy})은 ${signEasy(sign.name)}의 영향을 받으며, 생활에서는 ${houseMeta.easy} 쪽에서 잘 드러납니다. 그래서 ${meta.meaning}이 ${sign.tip}`,
  };
}

export function buildWesternAstrology(chart, options = {}) {
  const { hour, minute, hourUnknown } = parseClock(chart);
  const place = resolveBirthPlace(options.birthPlaceId || chart.birthPlaceId || "");
  const longs = approximateLongitudes(chart.solar, hour, minute);
  const ascLong = ascendantLong(longs.sun, hour, minute, place);
  const sun = signFromLong(longs.sun);
  const moon = signFromLong(longs.moon);
  const rising = signFromLong(ascLong);

  const planets = PLANETS.map((planet) => planetBlock(planet.id, longs[planet.id], ascLong));
  const houses = HOUSES.map((meta, index) => {
    const cusp = signFromLong(ascLong + index * 30);
    return {
      house: meta.house,
      label: houseLabel(meta.house),
      short: meta.short,
      easy: meta.easy,
      sign: cusp.name,
      signEasy: cusp.easy,
      element: cusp.element,
    };
  });

  const elementCount = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  planets.forEach((planet) => {
    elementCount[planet.element] = (elementCount[planet.element] || 0) + 1;
  });

  const accuracyNotes = [
    "서양 점성술 상승궁·하우스는 정밀 천문 에페메리스가 아닌 근사 계산입니다. 참고용으로만 읽어 주세요.",
  ];
  if (hourUnknown) {
    accuracyNotes.push(
      "출생 시각이 없어 정오(12:00) 기준으로 상승궁·하우스를 참고 계산했습니다. 시간대별 세부 해석은 제한됩니다.",
    );
  }
  if (place.assumed) {
    accuracyNotes.push(
      `출생지를 선택하지 않아 ${place.name} 경도·시간대 기준으로 상승궁·하우스를 근사했습니다.`,
    );
  } else {
    accuracyNotes.push(`출생지 ${place.name}(경도 ${place.lng}°) 기준으로 상승궁·하우스를 근사했습니다.`);
  }

  const risingText = hourUnknown
    ? `상승궁(첫인상)은 출생 시각이 없어 ${place.label}·정오 기준 참고값으로 ${signEasy(rising.name)}에 가깝게 읽힙니다. 실제 상승궁은 시각·지역에 따라 달라질 수 있습니다. ${rising.tip}`
    : `상승궁(첫인상·몸이 세상을 맞는 태도)이 ${signEasy(rising.name)}입니다. ${place.assumed ? `${place.name} 근사 기준이며, ` : `${place.name} 기준이며, `}처음 만난 사람이 당신에게서 먼저 느끼는 분위기가 바로 이 부분입니다. ${rising.tip}`;

  return {
    place,
    hourUnknown,
    placeAssumed: place.assumed,
    accuracyNotes,
    sun: {
      ...sun,
      label: `태양 ${sun.name}자리`,
      text: `태양(${PLANETS[0].easy})이 ${signEasy(sun.name)}에 있습니다. 사람들이 ‘이 사람은 이런 목표를 향해 산다’고 느끼는 모습이 여기에 가깝습니다. ${sun.tip}`,
    },
    moon: {
      ...moon,
      label: `달 ${moon.name}자리`,
      text: `달(${PLANETS[1].easy})이 ${signEasy(moon.name)}에 있습니다. 피곤하거나 예민할 때 당신이 진짜로 원하는 휴식 방식이 여기에 담겨 있습니다. ${moon.tip}`,
    },
    rising: {
      ...rising,
      label: hourUnknown ? `상승 ${rising.name}자리(참고)` : `상승 ${rising.name}자리`,
      approximate: hourUnknown || place.assumed,
      text: risingText,
    },
    planets,
    houses,
    elementCount,
    summary: `쉽게 말하면, 겉모습의 인상은 상승 ${rising.name}자리(${rising.easy}${hourUnknown || place.assumed ? " · 참고" : ""}), 삶의 목표 감각은 태양 ${sun.name}자리(${sun.easy}), 속마음과 쉬는 방식은 달 ${moon.name}자리(${moon.easy})에 가깝습니다. 세 가지를 함께 보면 ‘왜 첫인상과 속마음이 다르게 느껴지는지’가 훨씬 분명해집니다.`,
  };
}

export function westernTopicReading(astro, topicId, profile) {
  const focus = TOPIC_FOCUS[topicId] || TOPIC_FOCUS.career;
  const planet = astro.planets.find((item) => item.id === focus.planet) || astro.planets[0];
  const house = astro.houses[focus.house - 1];
  const sun = astro.sun;
  const moon = astro.moon;
  const rising = astro.rising;

  const base = [
    `서양 점성술로 이 주제를 볼 때는 ${focus.lensEasy}를 중심으로 읽습니다.`,
    `${planet.name}(${planet.easy})이 ${signEasy(planet.sign)}의 영향을 받으며, 특히 ${houseLabel(planet.house)}에서 자주 드러납니다. 이 주제와 맞닿은 영역은 ${house.label}이고, 그 문 앞 분위기가 ${signEasy(house.sign)}에 가깝다면 태도도 ${house.signEasy} 쪽으로 흐르기 쉽습니다.`,
  ];

  const byTopic = {
    marriage: profile?.status === "married"
      ? [
          "기혼의 관계는 ‘둘이서 만드는 생활’인 7하우스와 호감·취향의 금성을 함께 봅니다. 부부 소통과 가정 화목이 무난한 시기, 가족 행사·기념일·집안 대소사를 조율하기 좋은 때를 달과 금성이 같이 가리킵니다.",
          `같이 살 때의 온도는 달 ${moon.name}자리에서 갈립니다. 식사·잠·돈 이야기가 존중될 때 가정이 오래갑니다.`,
          "이미 배우자가 있다면, 금성·달이 좋아하는 편안함(식사·잠·돈 이야기)이 가정 화목의 핵심입니다.",
        ]
      : [
          `결혼·배우자 이야기는 ‘둘이서 만드는 관계’인 7하우스와 호감·취향의 금성을 함께 봅니다. 달(${moon.name}자리)이 원하는 편안함—대화량, 쉬는 방식, 집의 온도—이 존중될 때 관계가 오래갑니다.`,
          `첫 만남의 매력은 상승 ${rising.name}자리에서, 같이 살 때의 온도는 달 ${moon.name}자리에서 갈립니다. 7하우스 관계는 설렘보다 갈등 복구 방식이 뼈대입니다.`,
          "미혼이라면 태양이 가리키는 목표를 응원하는 사람과, 달의 불안을 다그치지 않는 사람이 같은 기준이어야 오래갑니다.",
        ],
    compatibility: [
      `궁합은 금성(취향)·달(감정 리듬)·7하우스(둘의 자리)로 읽습니다. 말이 통해도 쉬는 방식·수면·식사 리듬이 크게 다르면 일상 온도가 무거워질 수 있습니다.`,
      `달 ${moon.name}자리(${moon.easy})는 “이렇게 쉬고 싶다”는 신호입니다. 상대가 이를 무시하면 호감이 서운함으로 바뀌기 쉽습니다.`,
      `궁합이 좋다는 말은 ‘싸울 일이 없다’가 아니라 ‘싸운 뒤 복구하는 방식이 맞는다’에 가깝습니다.`,
    ],
    children: [
      `자녀·양육은 5하우스(기쁨·자녀)와 달의 감정 안정으로 읽습니다. 그 영역이 ${signEasy(house.sign)}라면 놀이와 칭찬도 그 방식으로 통하기 쉽습니다.`,
      `달 ${moon.name}자리는 양육자의 감정 바닥입니다. 양육자가 안정될 때 아이에게 돌아가는 말투부터 달라집니다.`,
      `5하우스는 취미·창작의 기쁨이기도 해서, 본인의 기쁨이 살아 있을수록 양육 인연의 온도도 부드러워집니다.`,
    ],
    wealth: [
      `돈은 2하우스(내 재산)·8하우스(같이 쓰는 돈)·금성(돈의 편안함)으로 읽습니다. 금성이 ${signEasy(planet.sign)}에 있으면 숫자뿐 아니라 ‘마음이 편한 감각’이 재물 감각이 됩니다.`,
      `충동 소비는 화성(추진)·달(불안)이 겹칠 때 커지기 쉽고, 공유 재산 갈등은 8하우스에서 숫자가 흐릴 때 커집니다.`,
    ],
    career: [
      `직업·승진은 10하우스(직장에서의 자리)·토성(책임)·태양(목표)으로 읽습니다. 분위기가 ${signEasy(house.sign)}에 가깝다면 일터 첫인상도 그 기질을 닮기 쉽습니다.`,
      `태양 ${sun.name}자리(${sun.easy})의 강점이 ‘눈에 보이는 결과’로 남을 때 토성의 책임 자리로 자연스럽게 올라갑니다. 6하우스(일상·실무)가 무너지면 10하우스 명예도 체력에서 먼저 흔들립니다.`,
    ],
    business: [
      `사업은 10하우스(바깥 간판)·2하우스(현금)·화성(실행)·목성(확장)·토성(장부)으로 읽습니다. 확장이 와도 토성이 잠그지 않으면 성장이 빚으로 바뀌기 쉽습니다.`,
      `상승 ${rising.name}자리(${rising.easy})는 브랜드 첫인상이고, 동업 갈등은 대개 말보다 숫자·역할이 흐릴 때 커집니다.`,
    ],
    moving: [
      `이사·주거는 4하우스(집·뿌리)와 달(편안함)로 읽습니다. ${signEasy(house.sign)} 분위기라면 채광·소음·동선 취향도 그쪽으로 기울기 쉽습니다.`,
      `입지가 좋아도 달의 조건(잠·저녁 분위기)이 안 맞으면 집이 쉬는 곳이 되지 못하고, 서류·등기는 토성처럼 정확한 영역입니다.`,
    ],
    health: [
      `건강은 6하우스(일상·습관)·화성(과로)·달(예민함)로 읽습니다. ‘큰 병’보다 잔잔한 리듬이 무너지는 신호가 점성술적 건강운의 핵심입니다.`,
      `달 ${moon.name}자리(${moon.easy})가 예민할수록 수면·물이 중요하고, 화성이 센 날에는 말다툼·무리한 운동·염증성 자극에 취약합니다.`,
    ],
    travel: [
      `여행은 9하우스(시야·이동)와 목성(확장)으로 읽습니다. ${signEasy(house.sign)} 분위기라면 마음이 열리는 여행지도 그 취향을 띠기 쉽습니다.`,
      `목성이 돕는 달에는 목적 있는 짧은 여행이, 달이 가라앉은 달에는 장거리보다 근교 회복이 잘 맞습니다. 9하우스 확장은 ‘멀리 감’보다 ‘마음이 넓어짐’에 가깝습니다.`,
    ],
  };


  const limits = [];
  if (astro.hourUnknown) {
    limits.push("출생 시각이 없어 상승궁·하우스 해석은 정오 기준 참고값입니다.");
  }
  if (astro.placeAssumed) {
    limits.push(`출생지 미선택으로 ${astro.place?.name || "서울"} 근사 기준입니다.`);
  }

  return {
    lens: focus.lensEasy,
    planet,
    house,
    paragraphs: [...limits, ...base, ...(byTopic[topicId] || byTopic.career)],
  };
}

export function crossAdvice(chart, astro, topicId) {
  const same = astro.sun.element === chart.dayElement;
  const risingDiff = astro.rising.name !== astro.sun.name;
  const common = [
    `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength.label)}는 결정의 체질이고, 태양 ${astro.sun.name}자리(${astro.sun.easy})는 세상에 보여주고 싶은 목표입니다.`,
    same
      ? "중심 기운과 태양의 성향이 비슷해 말과 선택이 한 방향으로 잘 맞습니다. 혼자 모든 짐을 지기보다 진행을 한 사람과 공유할 때 균형이 납니다."
      : `중심 기운은 ${chart.dayElement}인데 태양은 ${astro.sun.name}자리라, 겉 매력과 속 결정 방식이 다르게 느껴질 수 있습니다. 소개할 때 그 차이를 한 줄만 말하면 오해가 줄어듭니다.`,
    risingDiff
      ? `상승 ${astro.rising.name}자리(첫인상)와 태양 ${astro.sun.name}자리(본심)가 달라, 처음 보는 나와 친해진 뒤의 나가 다를 수 있습니다.`
      : "상승과 태양이 가까워 첫인상이 본심에 가깝게 전달됩니다. 솔직함을 거친 말과 나누어 쓰면 관계가 더 편합니다.",
  ];

  const topicLine = {
    marriage: [
      "결혼은 사주의 배우자·인연 흐름으로 ‘언제’를, 금성·7하우스로 ‘어떤 사람과 어떻게’를 나란히 보면 선택이 덜 흔들립니다.",
    ],
    compatibility: [
      "궁합은 사주 합·충과 점성술의 달·금성 리듬을 같이 봅니다. 성격 점수보다 생활 속도가 맞는지가 더 오래갑니다.",
    ],
    children: [
      "자녀운은 사주의 키움·표현 기운과 5하우스·달을 겹쳐 봅니다. 훈육 기술보다 양육자의 감정 바닥이 먼저입니다.",
    ],
    wealth: [
      "재물은 사주 재물 기운·대운 시기와 2·8하우스·금성을 함께 봅니다. ‘들어오는 때’와 ‘편한 관리법’이 한 세트입니다.",
    ],
    career: [
      "직업은 사주의 사회·명예 시기와 10하우스·태양·상승 태도를 함께 봅니다. 언제 움직일지와 어떻게 보일지를 나누면 실수가 줄어듭니다.",
    ],
    business: [
      "사업은 사주의 확장 기운과 목성·화성·토성을 함께 봅니다. 확장이 와도 장부와 역할이 잠겨 있어야 성장이 남습니다.",
    ],
    moving: [
      "이사는 사주의 이동·길일과 4하우스·달의 편안함을 함께 봅니다. 날짜와 ‘쉬는 집인지’를 따로 확인하세요.",
    ],
    health: [
      "건강은 오행의 과부족과 6하우스·화성의 과로 신호를 함께 봅니다. 조심할 달과 매일의 리듬이 한 세트입니다.",
    ],
    travel: [
      "여행은 사주의 이동 달과 9하우스·목성을 함께 봅니다. 떠날 때와 목적(휴식/배움)을 나누면 다녀와서도 에너지가 남습니다.",
    ],
  };

  return [...common, ...(topicLine[topicId] || topicLine.career)];
}
