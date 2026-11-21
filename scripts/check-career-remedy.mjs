import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { buildCareerPlaybook, buildRemedyGuide } from "../src/lib/careerRemedyGuide.js";

const reading = createReading({
  surname: "김",
  given: "민수",
  surnameHanja: "金",
  givenHanja: "民洙",
  gender: "male",
  status: "single",
  role: "employee",
  calendar: "solar",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
});

const play = buildCareerPlaybook(reading.chart);
const remedy = buildRemedyGuide(reading.chart);
const html = generateProductReportHtml(reading, { mode: "full" });

const checks = {
  primaryFields: play.primaryFields.length,
  secondaryFields: play.secondaryFields.length,
  jobsSample: play.primaryFields[0]?.jobs?.length,
  remedyRows: remedy.rows.length,
  hasGuide1: html.includes("진로 지침서 1"),
  hasGuide2: html.includes("진로 지침서 2"),
  hasCompare: html.includes("좋은 영향을 주는 것"),
  hasLuckyCho: html.includes("행운의 초성"),
  pages: (html.match(/class="page/g) || []).length,
};

if (checks.primaryFields !== 3) throw new Error("primary fields != 3");
if (checks.secondaryFields < 3) throw new Error("secondary fields < 3");
if (checks.jobsSample < 10) throw new Error("jobs < 10");
if (checks.remedyRows !== 7) throw new Error("remedy rows != 7");
if (!checks.hasGuide1 || !checks.hasGuide2 || !checks.hasCompare) {
  throw new Error("HTML missing career/remedy sections");
}

console.log(JSON.stringify({ ok: true, ...checks, primary: play.primaryElement, majors: play.majorTips }, null, 2));
