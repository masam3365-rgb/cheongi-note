import { MONTH_BASIS_NOTE } from "./monthLabel.js";

function linesOf(engine) {
  return [engine.summary, ...engine.points.map((point) => `- ${point}`)];
}

export function readingToText(reading) {
  const { chart } = reading;
  const blocks = [
    `천기노트`,
    `${reading.displayName}${reading.hanja ? ` (${reading.hanja})` : ""} · ${chart.genderLabel} · ${chart.clock}`,
    `양력 ${chart.solarText} / ${chart.lunarText}`,
    `야자시 ${chart.yaja ? "적용" : "미적용"} · 공망 ${chart.xunKong} · ${chart.strength.label}`,
    chart.pillars.map((pillar) => `${pillar.label} ${pillar.gzKo} ${pillar.shiShen} ${pillar.nayin}`).join(" | "),
    reading.bridge,
  ];

  if (reading.profile) {
    blocks.push(`${reading.profile.statusLabel} · ${reading.profile.roleLabel}`);
  }

  if (reading.report) {
    blocks.push("", `[심층 리포트 ${reading.report.pages.length}쪽]`);
    reading.report.pages.forEach((page) => {
      blocks.push("", `${page.no}. ${page.title}`, ...page.paragraphs);
    });
  }

  if (reading.today) {
    const today = reading.today.today;
    blocks.push("", `[오늘의 운세] ${today.solarText} ${today.lunarText} ${today.gzKo}일`, today.headline, `${today.level} ${today.score}점`);
    today.sections.forEach((section) => {
      blocks.push("", section.title, ...section.lines, `지침: ${section.tip}`);
    });
  }

  if (reading.tenYear) {
    blocks.push("", `[10년 세운] ${reading.tenYear.startYear}-${reading.tenYear.endYear}`, reading.tenYear.summary);
    reading.tenYear.years.forEach((item) => {
      blocks.push(
        "",
        `${item.year}년 ${item.gzFull} ${item.level} ${item.score}% ★${item.stars}`,
        item.headline,
        `재물: ${item.wealth.text}`,
        `직장: ${item.career.text}`,
        `애정: ${item.love.text}`,
      );
    });
  }

  if (reading.yearFortune) {
    const pack = reading.yearFortune.byYear[reading.yearFortune.defaultYear];
    if (pack) {
      blocks.push("", `[연도·월별 운세] ${pack.title}`, pack.summary, MONTH_BASIS_NOTE);
      pack.guides.forEach((guide) => {
        blocks.push("", guide.question, guide.preview, guide.answer);
      });
      pack.months.forEach((month) => {
        blocks.push("", month.heading, `요약: ${month.summary}`);
        blocks.push(`재물: ${month.wealth}`);
        blocks.push(`직장: ${month.career}`);
        blocks.push(`대인: ${month.relation}`);
        blocks.push(`주의: ${month.watchDates.join(" / ")}`);
        blocks.push(`개운: ${month.remedy}`);
      });
    }
  }

  if (reading.dashboard?.character) {
    const { personality, children, ancestors } = reading.dashboard.character;
    blocks.push("", `[${personality.title}]`, personality.summary, personality.deep, personality.balance, personality.tip);
    blocks.push("", `[${children.title}]`, children.summary, children.detail, children.tip);
    blocks.push("", `[${ancestors.title}]`, ancestors.summary, ancestors.detail, ancestors.influence, ancestors.tip);
  }

  if (reading.dashboard) {
    reading.dashboard.cards.forEach((card) => {
      blocks.push("", `[${card.title}]`, card.summary);
      if (card.head) blocks.push(card.head.line);
      if (card.months?.length) blocks.push(MONTH_BASIS_NOTE);
      (card.months || []).forEach((month) => {
        blocks.push(`${month.heading || `${month.month}월 ${month.gzKo}`} ${month.level} ${month.score}`);
        blocks.push(`기회: ${month.chance}`);
        blocks.push(`위기: ${month.caution}`);
      });
      (card.phases || []).forEach((phase) => {
        blocks.push(`${phase.title} ${phase.level} ${phase.score} ${phase.summary}`);
      });
    });
  }

  if (reading.compat) {
    blocks.push("", `궁합 ${reading.compat.pair} ${reading.compat.score}점 ${reading.compat.level}`, ...reading.compat.lines);
  }

  reading.engines.forEach((engine) => {
    blocks.push("", `[${engine.name}]`, ...linesOf(engine));
  });

  const { guide } = reading;
  if (guide) {
    blocks.push("", "[생활 운세]", guide.summary);
    guide.decades.forEach((cycle) => {
      blocks.push(`${cycle.gzKo} ${cycle.startYear}-${cycle.endYear} ${cycle.level} ${cycle.score}점 ${cycle.turning ? "전환" : ""} ${cycle.text}`);
    });
    blocks.push("", `[${guide.year}년 월별]`, MONTH_BASIS_NOTE);
    guide.months.forEach((month) => {
      blocks.push(`${month.heading || `${month.month}월 ${month.gzKo}`} ${month.level} ${month.score}점`);
      blocks.push(`기회: ${month.chance}`);
      blocks.push(`조심: ${month.caution}`);
    });
    blocks.push("", `[개운] ${guide.table.element} ${guide.table.foods.join(", ")}`, guide.table.habit);
    guide.palette.items.forEach((item) => blocks.push(`${item.title} ${item.name} ${item.text}`));
    blocks.push("", "[액땜]");
    guide.risks.forEach((risk) => {
      blocks.push(`${risk.title}: ${risk.warning}`);
      blocks.push(`막는 법: ${risk.remedy}`);
    });
  }

  reading.forecast.forEach((category) => {
    blocks.push("", `[${category.title}]`, category.summary);
    if (category.timingNote) blocks.push(category.timingNote);
    category.years.forEach((year) => {
      blocks.push(`${year.year}년 ${year.gzKo} ${year.level} ${year.score}점 (세는나이 ${year.age}) ${year.text}`);
    });
    const firstYear = category.years[0]?.year;
    if (firstYear) {
      blocks.push(`-- ${firstYear}년 월별 --`, MONTH_BASIS_NOTE);
      category.months[firstYear].forEach((month) => {
        blocks.push(`${month.heading || `${month.month}월 ${month.gzKo}`} ${month.level} ${month.score}점 ${month.text}`);
      });
    }
  });

  blocks.push("", "참고용 해석입니다. 진료, 투자, 법률 판단을 대신하지 않습니다.");
  return blocks.join("\n");
}
