import { Solar } from "lunar-javascript";
import { STEM_ELEMENT, branchRelation, clamp, koGz, levelFromScore, tenGod } from "./ganzhi.js";

const ANIMAL = {
  子: "쥐",
  丑: "소",
  寅: "호랑이",
  卯: "토끼",
  辰: "용",
  巳: "뱀",
  午: "말",
  未: "양",
  申: "원숭이",
  酉: "닭",
  戌: "개",
  亥: "돼지",
};

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function atNoon(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function addDays(date, amount) {
  const next = atNoon(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dayMark(date) {
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const lunar = solar.getLunar();
  const eight = lunar.getEightChar();
  const gan = eight.getDayGan();
  const zhi = eight.getDayZhi();
  return {
    key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
    date,
    weekday: WEEK[date.getDay()],
    solarText: `${solar.getYear()}년 ${solar.getMonth()}월 ${solar.getDay()}일`,
    lunarText: `음력 ${lunar.getYear()}년 ${lunar.getMonth() < 0 ? "윤" : ""}${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`,
    gan,
    zhi,
    gzKo: koGz(`${gan}${zhi}`),
  };
}

function scoreDay(chart, gan, zhi) {
  const tg = tenGod(chart.dayStem, gan);
  const element = STEM_ELEMENT[gan];
  const weights = { 정재: 10, 편재: 8, 식신: 8, 정관: 6, 정인: 4, 상관: 2, 편관: -4, 편인: 0, 비견: -2, 겁재: -10 };
  let score = 62 + (weights[tg] || 0);
  if (chart.strength.favorable.includes(element)) score += 8;
  if (chart.strength.unfavorable.includes(element)) score -= 6;
  const relDay = branchRelation(chart.dayBranch, zhi);
  if (relDay === "충") score -= 8;
  if (relDay === "합") score += 6;
  if (relDay === "원진") score -= 4;
  if (zhi === chart.specials.dohwa) score += 4;
  if (zhi === chart.specials.yeokma) score += 2;
  score = clamp(score, 18, 96);
  return { score, level: levelFromScore(score), tg, element, relDay, helpful: chart.strength.favorable.includes(element) };
}

function relationText(relDay) {
  if (relDay === "충") return "내 자리와 부딪히는 날이라 일정과 말이 겹치기 쉽습니다. 급한 서명과 장거리 이동은 한 박자 늦추세요.";
  if (relDay === "합") return "사람과 약속이 잘 붙는 날입니다. 먼저 안부를 건네면 일이 부드럽게 이어집니다.";
  if (relDay === "원진") return "마음은 가까운데 표현이 빗나가기 쉽습니다. 중요한 말은 짧게, 만나서 하세요.";
  return "크게 부딪히는 날은 아닙니다. 속도만 내 호흡에 맞추면 하루가 편해집니다.";
}

function euro(word) {
  const code = [...String(word)].pop()?.charCodeAt(0) ?? 0;
  const jong = code >= 0xac00 && code <= 0xd7a3 ? (code - 0xac00) % 28 : 0;
  return `${word}${jong === 0 || jong === 8 ? "로" : "으로"}`;
}

function headline(chart, meta) {
  if (meta.score >= 80) return "오늘은 문을 열어도 되는 날입니다. 미뤄 둔 한 가지를 끝내세요.";
  if (meta.score >= 68) return "무난히 풀리는 날입니다. 욕심을 하나 줄이면 더 가볍습니다.";
  if (meta.score >= 55) return "지키는 날입니다. 새 판보다 이미 맡은 일을 정리하세요.";
  return "서두르면 새는 날입니다. 큰 결정과 큰돈은 내일로 넘기세요.";
}

function buildSections(chart, profile, day, meta) {
  const name = chart.dayMasterKo + chart.dayElement;
  const money = profile.role === "owner" ? "입금과 미수금" : profile.role === "seeker" ? "시험비와 생활비" : "월급과 오늘의 지출";
  const bondLead =
    profile.status === "married"
      ? "부부 사이는 거창한 이벤트보다 오늘 저녁의 한 끼와 일정 한 줄이 온도를 바꿉니다."
      : "연인이나 호감 있는 사람에게는 긴 설명보다 오늘 만날 수 있는 시간을 구체적으로 제안하세요.";
  return [
    {
      id: "total",
      title: "오늘의 총운",
      tipTitle: "오늘의 핵심 태도",
      tip: meta.helpful ? "하나만 끝내고 자리를 뜨세요. 더 벌리지는 마세요." : "오늘은 속도를 낮추고, 이미 약속한 것만 지키세요.",
      lines: [
        `${day.solarText}, ${day.gzKo}일의 일진은 ${name}인 당신에게 ${euro(meta.level)} 읽힙니다. 점수는 ${meta.score}점입니다.`,
        headline(chart, meta),
        relationText(meta.relDay),
        meta.helpful
          ? "도움이 되는 기운이 들어와, 오전에 시작한 일이 오후까지 힘이 남습니다."
          : "거슬리는 기운이 있어, 오후에 체력과 집중이 먼저 떨어질 수 있습니다.",
        `${profile.roleLabel}에게 오늘은 성과를 자랑하기보다 맡은 범위를 또렷이 말하는 태도가 하루를 지킵니다.`,
      ],
    },
    {
      id: "wealth",
      title: "재물운",
      tipTitle: "금전·시간 관리 팁",
      tip:
        profile.role === "owner"
          ? "오늘 확인할 입금은 세 건만 적고, 그 외 송금은 내일로 미루세요."
          : profile.role === "seeker"
            ? "오늘은 충동 구매를 멈추고, 면접·시험에 쓰는 돈만 따로 두세요."
            : "카드 명세에서 오늘 결제될 항목만 보고, 새 구독은 넣지 마세요.",
      lines: [
        `오늘의 재물은 ${money}처럼 손에 잡히는 돈에서 갈립니다.`,
        meta.tg === "겁재" || meta.tg === "비견"
          ? "나누고 빌려 주는 마음이 커지는 날입니다. 좋은 부탁일수록 당일 송금은 쉬세요."
          : "들어올 돈과 나갈 돈을 같은 메모에 적으면 저녁에 마음이 편해집니다.",
        meta.helpful
          ? "작은 정산, 밀린 청구, 장바구니 비우기처럼 마무리가 이득입니다."
          : "할인, 한정, 지인 추천이 많아 보여도 오늘 새로 넣는 돈은 줄이세요.",
        "시간은 돈과 같이 움직입니다. 빈 일정 하나를 비워 두면 급한 일을 돈으로 막지 않아도 됩니다.",
        "자기 전에 오늘 쓴 돈을 세 줄만 적으세요. 내일이 훨씬 단정해집니다.",
      ],
    },
    {
      id: "people",
      title: "애정·대인운",
      tipTitle: "관계·소통 팁",
      tip: "답장 전에 한 박자 쉬고, 사실 한 문장과 마음 한 문장을 나눠 보내세요.",
      lines: [
        profile.status === "married"
          ? "오늘은 새 사람보다 이미 곁에 있는 사람과의 말투가 운을 가릅니다."
          : "오늘은 새로운 시선과 기존 친구의 한 마디가 같이 들어옵니다. 한 사람에게 집중하세요.",
        relationText(meta.relDay),
        meta.zhi === chart.specials.dohwa
          ? "사람 운이 밝아 인사와 소개가 자연스럽습니다. 가벼운 약속이 다음 만남으로 이어집니다."
          : "모임의 중심이 되기보다, 한 사람과 제대로 대화하는 쪽이 남습니다.",
        `${profile.roleLabel}으로서 동료와 가족에게 같은 말투를 쓰지 마세요. 자리마다 한 톤만 낮추면 오해가 줄어듭니다.`,
        "오늘 서운했던 말은 밤중에 꺼내지 말고, 내일 낮에 사실부터 확인하세요.",
      ],
    },
    {
      id: "health",
      title: "건강·컨디션운",
      tipTitle: "휴식·활력 관리 팁",
      tip: meta.score < 60 ? "오늘은 운동 강도를 낮추고, 따뜻한 물과 제시간 식사로 컨디션을 지키세요." : "가벼운 산책과 제시간 저녁이 오늘의 보약입니다. 밤 운동은 쉬세요.",
      lines: [
        meta.relDay === "충"
          ? "몸도 일정과 함께 부딪히기 쉽습니다. 어깨, 위, 이동 중 피로를 먼저 살피세요."
          : "큰 탈이 오기보다 수면과 끼니 리듬이 컨디션을 결정하는 날입니다.",
        chart.dayElement === "화" || meta.element === "화"
          ? "열이 오르기 쉬우니 매운 야식과 늦은 카페인을 줄이세요."
          : chart.dayElement === "수" || meta.element === "수"
            ? "찬 음료와 늦은 걱정이 몸을 식힙니다. 저녁은 따뜻한 국물로 데우세요."
            : "과식보다 거르는 끼니가 오후에 집중을 깨뜨립니다. 식사 시간을 지켜 주세요.",
        meta.helpful
          ? "오전에 몸을 조금만 풀어도 오후까지 기운이 이어집니다."
          : "오후 슬럼프가 오기 전에 10분이라도 화면에서 눈을 떼세요.",
        "잠들기 한 시간 전에는 일 이야기를 끊는 것이 내일 아침의 컨디션입니다.",
        "아프다는 신호가 오면 참지 말고 오늘 일정을 하나 빼세요.",
      ],
    },
    {
      id: "bond",
      title: "부부·연인 금슬운",
      tipTitle: "애정 표현 팁",
      tip:
        profile.status === "married"
          ? "오늘 배우자에게 고마운 일 하나를 구체적으로 말해 주세요. 선물은 없어도 됩니다."
          : "좋아한다는 말 대신, 내일 만날 시간과 장소를 먼저 제안해 보세요.",
      lines: [
        bondLead,
        profile.love,
        meta.relDay === "합"
          ? "오늘 건넨 다정한 말은 상대가 잘 받아 줍니다. 짧은 칭찬이 오래 남습니다."
          : meta.relDay === "충" || meta.relDay === "원진"
            ? "잔소리와 해명이 길어지면 금슬이 식습니다. 결론을 한 문장으로 줄이세요."
            : "특별한 이벤트가 없어도, 안부를 먼저 묻는 쪽이 오늘의 애정운을 가져갑니다.",
        "돈, 집안일, 미래 계획은 오늘 한꺼번에 꺼내지 마세요. 주제는 하나만 고르세요.",
        "잠들기 전 서로의 내일 일정만 공유해도 마음이 한쪽으로 기울지 않습니다.",
      ],
    },
  ];
}

function describe(chart, profile, date) {
  const day = dayMark(atNoon(date));
  const meta = scoreDay(chart, day.gan, day.zhi);
  return {
    ...day,
    ...meta,
    headline: headline(chart, meta),
    sections: buildSections(chart, profile, day, meta),
  };
}

export function buildToday(chart, profile, now = new Date()) {
  const base = atNoon(now);
  const today = describe(chart, profile, base);
  const tomorrow = describe(chart, profile, addDays(base, 1));
  const sunday = addDays(base, -base.getDay());
  const week = Array.from({ length: 7 }, (_, index) => {
    const item = describe(chart, profile, addDays(sunday, index));
    return { ...item, today: item.key === today.key };
  });
  const monthStart = new Date(base.getFullYear(), base.getMonth(), 1, 12);
  const last = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const month = Array.from({ length: last }, (_, index) => {
    const item = describe(chart, profile, addDays(monthStart, index));
    return {
      key: item.key,
      day: index + 1,
      weekday: item.weekday,
      gzKo: item.gzKo,
      score: item.score,
      level: item.level,
      headline: item.headline,
      today: item.key === today.key,
    };
  });
  const animal = ANIMAL[chart.pillars[0].zhi] || "";
  return {
    animal,
    today,
    tomorrow,
    week,
    month,
    monthLabel: `${base.getFullYear()}년 ${base.getMonth() + 1}월`,
  };
}

export function todayShareText(reading) {
  const today = reading.today.today;
  return [
    `천기노트 · ${reading.displayName}의 오늘 운세`,
    `${today.solarText} (${today.weekday}) ${today.lunarText} · ${today.gzKo}일`,
    today.headline,
    `${today.level} ${today.score}점`,
    location.origin || "",
  ]
    .filter(Boolean)
    .join("\n");
}
