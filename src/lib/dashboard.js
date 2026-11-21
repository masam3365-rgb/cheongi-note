import { levelFromScore } from "./ganzhi.js";
import { buildYearMonths } from "./lifeGuide.js";
import { buildCharacterProfile } from "./personality.js";

const NATURE = {
  목: {
    trait: "시작하고 키우는 성미입니다. 새 판을 잘 열고, 끝을 같이 잡아 주는 사람과 팀이 맞습니다.",
    fit: "기획, 교육, 브랜드, 사람을 성장시키는 일",
    slip: "끝을 맺기 전에 다음 일을 벌이는 버릇",
  },
  화: {
    trait: "드러내고 데우는 성미입니다. 자리의 온도를 올리지만, 밤까지 달구면 쉽게 소진됩니다.",
    fit: "영업, 상담, 방송, 사람 앞에 서는 일",
    slip: "흥분한 문장을 바로 보내는 버릇",
  },
  토: {
    trait: "가운데서 받치는 성미입니다. 믿음이 두텁고, 변화는 숫자를 보고 천천히 고릅니다.",
    fit: "운영, 관리, 부동산, 신뢰를 쌓는 일",
    slip: "걱정이 체증이 되어 결정을 미루는 버릇",
  },
  금: {
    trait: "기준을 세우는 성미입니다. 정리는 잘하고, 애매한 약속은 오래 견디지 못합니다.",
    fit: "재무, 품질, 법률, 기준을 칼같이 지키는 일",
    slip: "맞는 말도 차갑게 들려 관계가 마르는 버릇",
  },
  수: {
    trait: "속으로 읽고 흐르는 성미입니다. 정보는 많고, 말보다 타이밍이 결과를 가릅니다.",
    fit: "연구, 전략, 데이터, 흐름을 설계하는 일",
    slip: "혼자 결론 내고 공유가 늦는 버릇",
  },
};

const PHASES = [
  { id: "early", title: "초년운", from: 1, to: 30, hint: "배움, 첫 자리, 생활 습관이 평생의 바닥을 만듭니다." },
  { id: "mid", title: "중년운", from: 31, to: 60, hint: "돈, 가정, 직함의 책임이 한자리에 모입니다." },
  { id: "late", title: "말년운", from: 61, to: 120, hint: "버틴 체력과 정리된 관계가 남은 시간을 결정합니다." },
];

function average(rows) {
  if (!rows.length) return 0;
  return Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length);
}

function headline(months) {
  const score = average(months);
  const best = [...months].sort((a, b) => b.score - a.score)[0];
  const worst = [...months].sort((a, b) => a.score - b.score)[0];
  return {
    score,
    level: levelFromScore(score),
    best,
    worst,
    line: `한 해 평균은 ${score}점, ${levelFromScore(score)}입니다. 가장 열릴 달은 ${best.month}월(${best.level})이고, 숨을 고를 달은 ${worst.month}월(${worst.level})입니다.`,
  };
}

function phasesOf(decades, profile) {
  return PHASES.map((phase) => {
    const rows = decades.filter((cycle) => cycle.endAge >= phase.from && cycle.startAge <= phase.to && cycle.startYear);
    const score = average(rows);
    const roleNote =
      phase.id === "early" && profile.role === "seeker"
        ? " 이 구간의 성패는 자격과 첫 자리입니다."
        : phase.id === "mid" && profile.role === "owner"
          ? " 이 구간은 사업을 키우기보다 현금과 사람을 남기는 쪽이 맞습니다."
          : phase.id === "mid" && profile.role === "employee"
            ? " 이 구간은 직함보다 대체 불가능한 실무가 남습니다."
            : "";
    return {
      ...phase,
      score,
      level: rows.length ? levelFromScore(score) : "평",
      summary: rows.length
        ? `${phase.title}은 ${rows[0].startYear}년부터 ${rows[rows.length - 1].endYear}년까지입니다. ${phase.hint}${roleNote}`
        : `${phase.title}에 해당하는 대운 구간이 짧습니다. ${phase.hint}`,
      cycles: rows,
    };
  });
}

export function buildDashboard(chart, forecast, guide, profile, ziwei = null) {
  const wealth = forecast.find((item) => item.id === "wealth");
  const love = forecast.find((item) => item.id === "love");
  const career = forecast.find((item) => item.id === "career");
  const nature = NATURE[chart.dayElement];
  const year = 2027;
  const newYearMonths = buildYearMonths(chart, year);
  const newYear = headline(newYearMonths);
  const wealthMonths = guide.months;
  const loveMonths = guide.months;
  const careerMonths = guide.months;
  const wealthHead = headline(wealthMonths);
  const loveHead = headline(loveMonths);
  const phases = phasesOf(guide.decades, profile);
  const character = buildCharacterProfile(chart, forecast, ziwei, profile);

  return {
    profile,
    character,
    cards: [
      {
        id: "newyear",
        title: `${year}년 신년운세`,
        kicker: "열두 달의 기회와 위기",
        summary: `${year}년은 ${newYear.line} ${profile.roleLabel}에게는 ${profile.career} ${profile.statusLabel}에게는 ${profile.love}`,
        head: newYear,
        months: newYearMonths,
        remedies: true,
      },
      {
        id: "wealth",
        title: "재물운",
        kicker: profile.roleLabel,
        summary: `${wealth?.summary || ""} ${guide.year}년은 ${wealthHead.line}`,
        head: wealthHead,
        months: wealthMonths,
        years: wealth?.years || [],
        remedies: "money",
      },
      {
        id: "love",
        title: profile.status === "married" ? "부부·관계" : "애정운",
        kicker: profile.statusLabel,
        summary: `${love?.summary || ""} ${guide.year}년은 ${loveHead.line}`,
        head: loveHead,
        months: loveMonths,
        years: love?.years || [],
        remedies: "people",
      },
      {
        id: "life",
        title: "종합운",
        kicker: "초년 · 중년 · 말년",
        summary: `${guide.summary} 초년·중년·말년은 10년 대운을 나이대로 다시 묶은 것입니다.`,
        phases,
      },
      {
        id: "aptitude",
        title: "성격 · 적성 · 직업운",
        kicker: `${chart.dayMasterKo}${chart.dayElement} · ${profile.roleLabel}`,
        summary: `${nature.trait} 잘 맞는 일은 ${nature.fit}입니다. 발목을 잡는 습관은 ${nature.slip}입니다. 사회생활의 결은 ${chart.monthGod}입니다. ${career?.summary || ""}`,
        head: headline(careerMonths),
        months: careerMonths,
        years: career?.years || [],
        nature,
      },
    ],
  };
}
