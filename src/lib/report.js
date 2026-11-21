import { MONTH_BASIS_NOTE } from "./monthLabel.js";
import { buildCareerPlaybook, buildRemedyGuide } from "./careerRemedyGuide.js";
import { dayMasterPhrase, easeSentence, favorBundlePhrase, strengthPhrase } from "./plainTerms.js";

function page(title, paragraphs, options) {
  return { title, paragraphs: paragraphs.filter(Boolean).map((line) => easeSentence(line, options)) };
}

function byId(list, id) {
  return list.find((item) => item.id === id);
}

export function buildReport(reading) {
  const { chart, profile, engines, forecast, guide, today, face, taegil } = reading;
  const wealth = byId(forecast, "wealth");
  const career = byId(forecast, "career");
  const love = byId(forecast, "love");
  const health = byId(forecast, "health");
  const family = byId(forecast, "family");
  const move = byId(forecast, "move");
  const study = byId(forecast, "study");
  const engine = (id) => byId(engines, id);
  const bestMove = taegil.picks.move[0];
  const bestContract = taegil.picks.contract[0];
  const bestMarriage = taegil.picks.marriage[0];
  const pages = [
    page("표지, 이 사람을 한 장으로", [
      `${reading.displayName}${reading.hanja ? ` ${reading.hanja}` : ""} 님은 ${chart.genderLabel}, ${profile.statusLabel}, ${profile.roleLabel}입니다.`,
      `양력 ${chart.solarText} ${chart.clock}, ${chart.lunarText}. 네 기둥은 ${chart.pillars.map((pillar) => pillar.gzKo).join(" ")}입니다.`,
      reading.bridge,
      "이 리포트는 사주, 방위 렌즈, 풍수, 성명, 토정을 한 사람의 생활 문장으로 잇고, 관상·진로지침서·택일로 오늘과 날짜를 더합니다.",
    ]),
    page("사주 원국", [
      engine("bazi").summary,
      ...engine("bazi").points,
      `사회생활의 결은 ${chart.monthGod}이고, 약속이 느슨해지기 쉬운 자리는 ${chart.xunKong}입니다.`,
    ]),
    page("오행과 힘의 방향", [
      `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · 지금은 ${strengthPhrase(chart.strength.label)}입니다. 힘이 되는 기운은 ${favorBundlePhrase(chart.strength.favorable.join("·"))}, 과하면 부담인 기운은 ${favorBundlePhrase(chart.strength.unfavorable.join("·"))}입니다.`,
      `오행 개수는 목 ${chart.count.목}, 화 ${chart.count.화}, 토 ${chart.count.토}, 금 ${chart.count.금}, 수 ${chart.count.수}입니다.`,
      guide.summary,
    ]),
    page("10년 대운", [
      `큰 운은 ${chart.daYun.forward ? "앞으로" : "뒤로"} 흐르고, ${chart.daYun.startText} 뒤에 첫 줄기가 시작됩니다.`,
      ...chart.daYun.cycles.slice(0, 4).map((cycle) => `${cycle.gzKo} ${cycle.startYear}–${cycle.endYear}, ${cycle.startAge}–${cycle.endAge}세.`),
      "점수가 바뀌는 해에는 이사, 이직, 계약 중 하나만 움직이고 나머지는 지키세요.",
    ]),
    page("재물과 열두 달", [
      wealth.summary,
      profile.wealth,
      MONTH_BASIS_NOTE,
      ...wealth.months[wealth.years[0].year].map(
        (month) => `${month.heading} · ${month.level}. ${month.text}`,
      ),
    ], { wealth: true }),
    page("연도 선택 세운·월운", (() => {
      const pack = reading.yearFortune?.byYear?.[reading.yearFortune.defaultYear];
      if (!pack) return ["원하는 연도를 고르면 세운과 열두 달 월운이 바로 계산됩니다."];
      return [
        pack.title,
        pack.summary,
        MONTH_BASIS_NOTE,
        ...pack.guides.map((guide) => `${guide.question} ${guide.answer}`),
        ...pack.months.slice(0, 6).map(
          (month) =>
            `${month.heading} · ${month.level}. ${month.summary} 재물: ${month.wealth} 직장: ${month.career} 대인: ${month.relation} 주의: ${month.watchDates[0]} 개운: ${month.remedy}`,
        ),
      ];
    })()),
    page("일과 적성", [
      career.summary,
      study.summary,
      profile.career,
      `${profile.roleLabel}에게 올해의 일은 속도보다 남기는 문서에서 갈립니다.`,
    ]),
    page("애정과 가족", [
      love.summary,
      profile.love,
      family.summary,
      profile.status === "married"
        ? "기혼의 애정은 새 설렘보다 생활 달력을 같이 쓰는 능력입니다."
        : "미혼의 애정은 여러 대화를 줄이고 한 사람과 다음 약속을 정할 때 열립니다.",
    ]),
    page("건강과 몸", [
      health.summary,
      "검진과 수면은 운이 나쁠 때 찾는 응급이 아니라, 운이 좋을 때 미리 잡아 두는 일정입니다.",
      `부족한 ${guide.table.element} 기운의 식탁은 ${guide.table.foods.join(", ")}입니다. ${guide.table.habit}`,
    ]),
    page("집과 이동", [move.summary, "이사는 길한 날짜만으로 끝나지 않습니다. 계약서의 하자와 방향, 침실 위치를 같은 날에 확인하세요."]),
    page("자미두수", [engine("ziwei").summary, ...engine("ziwei").points]),
    page("주역과 육효", [engine("yijing").summary, engine("liuyao").summary, ...engine("liuyao").points.slice(0, 3)]),
    page("기문과 육임", [engine("qimen").summary, engine("liuren").summary]),
    page("풍수와 성명, 토정", [
      engine("fengshui").summary,
      engine("name").summary,
      ...engine("name").points.slice(0, 3),
      engine("tojeong").summary,
    ]),
    page("관상과 골상", [face.summary, ...face.lines, ...face.habits.map((habit) => `재물 인상: ${habit}`)]),
    ...(() => {
      const play = buildCareerPlaybook(chart);
      const remedy = buildRemedyGuide(chart);
      return [
        page("진로지침서 1 · 최상위 적성", [
          play.primaryIntro,
          ...play.primaryFields.map(
            (f) => `【${f.name}】(${f.element}): ${(f.jobs || []).slice(0, 12).join(" · ")}`,
          ),
        ]),
        page("진로지침서 2 · 차선책·전공", [
          play.secondaryIntro,
          ...play.secondaryFields.map(
            (f) => `【${f.name}】(${f.element}): ${(f.jobs || []).slice(0, 10).join(" · ")}`,
          ),
          play.majorTipText,
        ]),
        page("운을 좋게 하는 비법 대조표", [
          remedy.intro,
          ...remedy.rows.map((r) => `${r.label} — 좋음: ${r.good} / 줄일 것: ${r.bad}`),
        ]),
      ];
    })(),
    page("택일의 결론", [
      `앞으로 60일 가운데 이사에 가장 열린 날은 ${bestMove.month}월 ${bestMove.day}일 ${bestMove.gzKo}, ${bestMove.purposes.move.level}입니다. ${bestMove.purposes.move.note}`,
      `계약에 가장 열린 날은 ${bestContract.month}월 ${bestContract.day}일 ${bestContract.gzKo}입니다. ${bestContract.purposes.contract.note}`,
      profile.status === "married"
        ? `가족 행사·기념일·집안 대소사를 조율하기 좋은 날은 ${bestMarriage.month}월 ${bestMarriage.day}일 ${bestMarriage.gzKo}입니다. 부부 소통과 가정 화목이 무난한 시기로 읽으면 됩니다.`
        : `혼담과 예식에 가장 열린 날은 ${bestMarriage.month}월 ${bestMarriage.day}일 ${bestMarriage.gzKo}입니다. ${bestMarriage.purposes.marriage.note}`,
      "추천 시각은 그 날짜 카드에 적힌 두 시진입니다. 길한 날이어도 몸과 서류가 준비되지 않았으면 다음 후보로 미루세요.",
    ]),
    page("개운, 음식과 색과 액땜", [
      `${guide.table.name}을 식탁에 올리는 이유: ${guide.table.habit}`,
      ...guide.palette.items.map((item) => `${item.title}은 ${item.name}. ${item.text}`),
      ...guide.risks.flatMap((risk) => [`${risk.title}: ${risk.warning}`, `막는 법: ${risk.remedy}`]),
    ]),
    page("오늘로 돌아오기", [
      `${today.today.solarText} ${today.today.lunarText}, 일진 ${today.today.gzKo}. ${today.today.headline}`,
      `오늘 점수는 ${today.today.score}, ${today.today.level}입니다. 게이지가 가운데보다 왼쪽이면 정리하고, 오른쪽이면 하나만 끝내세요.`,
      "매일 들어오는 오늘의 운세는 이 리포트의 요약이 아니라, 같은 명식이 날짜와 만날 때의 사용 설명서입니다.",
    ]),
    page("닫는 글", [
      "이 글은 명식과 시반, 진로지침서와 택일을 겹친 참고입니다. 진료, 투자, 법률, 혼인 신고를 대신하지 않습니다.",
      "좋은 날은 기다리는 날이 아니라, 문서와 체력과 관계를 미리 맞춰 둔 날입니다.",
      `${reading.displayName} 님의 다음 행동은 하나입니다. 진로지침서에서 직종 하나를 고르고, 택일 달력에서 가장 가까운 길한 날에 그 일만 적으세요.`,
    ]),
  ];
  return { title: "심층 리포트", pages: pages.map((item, index) => ({ ...item, no: index + 1, total: pages.length })) };
}
