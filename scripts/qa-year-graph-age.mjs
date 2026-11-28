/**
 * 세운 연도↔월 그래프 연도 일치, 세는나이·출생연도, 그래프 점수 검증
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { verifyDaYunAgeYearConsistency } from "../src/lib/lifeStages.js";
import { PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v4");
mkdirSync(outDir, { recursive: true });

const reading = createReading({
  surname: "이",
  given: "민수",
  surnameHanja: "李",
  givenHanja: "珉洙",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "male",
  calendar: "solar",
  status: "single",
  role: "employee",
  yaja: true,
});

const birthYear = reading.chart.solar.year;
assert.equal(birthYear, 1990);

const tenYears = reading.tenYear?.years || [];
const ageIssues = [];
for (const y of tenYears) {
  const expected = y.year - birthYear + 1;
  if (y.age !== expected) ageIssues.push({ year: y.year, age: y.age, expected });
}

const dayunIssues = [];
for (const c of reading.chart.daYun?.cycles || []) {
  const v = verifyDaYunAgeYearConsistency(c, birthYear);
  if (!v.ok && !v.skipped) dayunIssues.push({ cycle: c.label || c.gzKo, ...v });
}

const html = generateProductReportHtml(reading, { mode: "full" });
const defaultYear = reading.yearFortune?.defaultYear;

const graphYearMismatches = [];
const yearHeads = [...html.matchAll(/(\d{4})년\s*세운\s*심층\s*리포트/g)];
for (let i = 0; i < yearHeads.length; i += 1) {
  const sewoonYear = Number(yearHeads[i][1]);
  const start = yearHeads[i].index;
  const end = i + 1 < yearHeads.length ? yearHeads[i + 1].index : html.length;
  const block = html.slice(start, Math.min(end, start + 14000));
  for (const cap of block.matchAll(/(\d{4})년\s*월별\s*(종합|재물|직장|대인)\s*지수/g)) {
    if (Number(cap[1]) !== sewoonYear) {
      graphYearMismatches.push({ sewoonYear, graphYear: Number(cap[1]), caption: cap[0] });
    }
  }
  for (const dy of block.matchAll(/data-year="(\d{4})"/g)) {
    if (Number(dy[1]) !== sewoonYear) {
      graphYearMismatches.push({ sewoonYear, dataYear: Number(dy[1]) });
    }
  }
}

const scoreChecks = [];
for (const yr of [2026, 2027, 2030].filter((y) => reading.yearFortune?.byYear?.[y])) {
  const marker = `data-visual="theme-score-${yr}"`;
  const idx = html.indexOf(marker);
  const slot = idx >= 0 ? html.slice(idx, idx + 4500) : "";
  const expectedScores = (reading.yearFortune.byYear[yr].months || []).map((m) => Number(m.score));
  const scoreTexts = [...slot.matchAll(/font-size="8"[^>]*>(\d{1,3})<\/text>/g)].map((x) => Number(x[1]));
  const ok =
    idx >= 0 &&
    scoreTexts.length === expectedScores.length &&
    scoreTexts.every((s, i) => s === expectedScores[i]);
  scoreChecks.push({
    year: yr,
    ok,
    hasSlot: idx >= 0,
    hasCaption: /월별 종합 지수/.test(slot),
    expectedSample: expectedScores.slice(0, 4),
    shownSample: scoreTexts.slice(0, 4),
    scoreCount: scoreTexts.length,
  });
}

/** 주제(재물 등) 장은 defaultYear 월 그래프만 허용 */
const topicWealthCaps = [...html.matchAll(/제2부[\s\S]{0,20000}?(\d{4})년\s*월별\s*재물\s*지수/g)];
const topicYearOk = topicWealthCaps.length === 0 || topicWealthCaps.every((m) => Number(m[1]) === defaultYear);

const report = {
  birthYear,
  defaultYear,
  tenYearRange: tenYears.length
    ? { from: tenYears[0].year, to: tenYears[tenYears.length - 1].year, count: tenYears.length }
    : null,
  ageIssues,
  dayunIssues,
  graphYearMismatches,
  scoreChecks,
  topicYearOk,
  prices: [PLANS.single.price, PLANS.triple.price, PLANS.full.price],
  fontOk: /font-size:\s*12\.5pt/.test(html),
  ok:
    ageIssues.length === 0 &&
    dayunIssues.length === 0 &&
    graphYearMismatches.length === 0 &&
    scoreChecks.every((s) => s.ok && s.hasCaption) &&
    topicYearOk,
};

writeFileSync(resolve(outDir, "qa-year-graph-age.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
