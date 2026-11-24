import { MONTH_BASIS_NOTE } from "./monthLabel.js";
import { buildAptitudeJobFreeLines, buildCareerGuideFreeLines } from "./careerFreeSummary.js";

/** 무료 화면과 동일한 범위만 텍스트로 내보냄 (유료 상세·직종 목록 제외) */
export function readingToText(reading) {
  const { chart } = reading;
  const blocks = [
    `천기노트 · 무료 요약`,
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
    blocks.push("", `[심층 리포트 ${reading.report.pages.length}쪽 · 무료 범위]`);
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
    blocks.push("", `[10년 세운 · 무료 요약] ${reading.tenYear.startYear}-${reading.tenYear.endYear}`, reading.tenYear.summary);
    reading.tenYear.years.forEach((item) => {
      blocks.push("", `${item.year}년 ${item.gzFull} ${item.level} ${item.score}% ★${item.stars}`, item.headline);
    });
  }

  if (reading.yearFortune) {
    const pack = reading.yearFortune.byYear[reading.yearFortune.defaultYear];
    if (pack) {
      blocks.push("", `[연도·월별 · 무료 요약] ${pack.title}`, pack.summary, MONTH_BASIS_NOTE);
      pack.months.forEach((month) => {
        blocks.push(`${month.month}월 ${month.level} ${month.score}: ${month.summary}`);
      });
    }
  }

  blocks.push("", "[적성·직업 · 무료 요약]", ...buildAptitudeJobFreeLines(reading));
  blocks.push("", "[진로지침서 · 무료 요약]", ...buildCareerGuideFreeLines(reading));

  if (reading.dashboard?.character) {
    const { personality } = reading.dashboard.character;
    blocks.push("", `[${personality.title}]`, personality.summary);
  }

  if (reading.compat) {
    blocks.push("", `궁합 ${reading.compat.pair} ${reading.compat.score}점 ${reading.compat.level}`, ...reading.compat.lines.slice(0, 3));
  }

  reading.engines.forEach((engine) => {
    blocks.push("", `[${engine.name}]`, engine.summary);
  });

  const { guide } = reading;
  if (guide) {
    blocks.push("", "[생활 운세]", guide.summary);
  }

  reading.forecast.forEach((category) => {
    if (category.id === "career") return;
    blocks.push("", `[${category.title}]`, category.summary);
  });

  blocks.push("", "참고용 해석입니다. 진료, 투자, 법률 판단을 대신하지 않습니다.");
  blocks.push("유료 심층 PDF(직종·전공·개운표·월별/연도 상세)는 크몽·당근 주문 후 판매자가 전달합니다.");
  return blocks.join("\n");
}
