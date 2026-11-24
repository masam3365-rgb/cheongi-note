/**
 * 적성·직업 / 진로지침서 — 무료·유료 분리 회귀
 */
import assert from "node:assert/strict";
import { createReading } from "./reading.js";
import { generateProductReportHtml } from "./productReportHtml.js";
import { readingToText } from "./plainText.js";
import { readingToReportHtml } from "./reportHtml.js";
import {
  buildAptitudeJobFreeLines,
  buildCareerGuideFreeLines,
  freeExportLeaksCareerDetail,
} from "./careerFreeSummary.js";
import { buildCareerPlaybook, buildRemedyGuide } from "./careerRemedyGuide.js";

const form = {
  surname: "가",
  given: "상갑",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  yaja: true,
  gender: "female",
  calendar: "solar",
  status: "single",
  role: "employee",
};

const reading = createReading(form);

const aptitude = buildAptitudeJobFreeLines(reading);
const guide = buildCareerGuideFreeLines(reading);
assert.ok(aptitude.length >= 3 && aptitude.length <= 5, `aptitude lines ${aptitude.length}`);
assert.ok(guide.length >= 3 && guide.length <= 5, `guide lines ${guide.length}`);
assert.ok(aptitude.some((l) => l.includes("적성·직업")), "aptitude purpose");
assert.ok(guide.some((l) => l.includes("진로지침서")), "guide purpose");
assert.ok(!aptitude.join("").includes("AI 에듀테크"), "no job list in aptitude free");
assert.ok(!guide.join("").includes("AI 에듀테크"), "no job list in guide free");

const text = readingToText(reading);
const htmlFree = readingToReportHtml(reading, { year: reading.yearFortune?.defaultYear });
const leaksText = freeExportLeaksCareerDetail(text);
const leaksHtml = freeExportLeaksCareerDetail(htmlFree);
assert.equal(leaksText.length, 0, `text leaks: ${leaksText}`);
assert.equal(leaksHtml.length, 0, `html leaks: ${leaksHtml}`);
assert.ok(!text.includes("재물: ") || !/10년 세운[\s\S]*재물:/.test(text), "ten-year wealth detail not in free text");

// 엔진·유료 PDF는 상세 유지
const play = buildCareerPlaybook(reading.chart);
const remedy = buildRemedyGuide(reading.chart);
assert.ok(play.primaryFields?.[0]?.jobs?.length > 3, "playbook jobs exist");
assert.ok(remedy.rows?.length >= 3, "remedy rows exist");

const paid = generateProductReportHtml(reading, { mode: "full" });
assert.ok(paid.includes("진로 지침서") || paid.includes("진로 적성"), "paid has career guide part");
const fieldToken = play.primaryFields[0].name.split("·")[0];
assert.ok(paid.includes(fieldToken), "paid has primary field token");
assert.ok(
  play.primaryFields[0].jobs.some((job) => paid.includes(job)),
  "paid includes concrete job titles",
);
assert.ok(
  paid.includes("좋은 영향") ||
    paid.includes("개운") ||
    paid.includes("피하거나") ||
    paid.includes(play.majorTipText.slice(0, 12)),
  "paid has remedy/major content",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      aptitudeLines: aptitude.length,
      guideLines: guide.length,
      freeTextBytes: Buffer.byteLength(text, "utf8"),
      freeHtmlBytes: Buffer.byteLength(htmlFree, "utf8"),
      paidHasJobs: true,
      paidPages: (paid.match(/class="page[\s"]/g) || []).length,
    },
    null,
    2,
  ),
);
