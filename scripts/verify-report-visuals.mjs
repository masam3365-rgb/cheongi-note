/**
 * PDF 시각자료: 실데이터 SVG 존재·중복·페이지 수 급증 여부
 */
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { svgWuxingBalance, svgTenYearFlow, svgMonthFlowBars } from "../src/lib/reportVisuals.js";

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), "../output/paid-report-quality");
mkdirSync(outDir, { recursive: true });

const reading = createReading({
  surname: "가",
  given: "상갑",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "female",
  calendar: "solar",
  status: "single",
  role: "employee",
  yaja: true,
});

const count = reading.chart.count || {};
const wx = svgWuxingBalance(count);
for (const [k, v] of Object.entries(count)) {
  assert.ok(wx.includes(String(v)), `wuxing missing count ${k}=${v}`);
}

const years = reading.tenYear?.years || [];
const ten = svgTenYearFlow(years);
years.forEach((y) => {
  assert.ok(ten.includes(String(y.score)), `tenyear missing score ${y.year}`);
});

const year = reading.yearFortune?.defaultYear;
const months = reading.yearFortune?.byYear?.[year]?.months || [];
const mon = svgMonthFlowBars(months, `${year}년`);
months.forEach((m) => {
  assert.ok(mon.includes(String(m.score)), `month missing score ${m.month}`);
});

const html = generateProductReportHtml(reading, { mode: "full" });
writeFileSync(resolve(outDir, "full-with-visuals.html"), html, "utf8");
const bodyHtml = html.replace(/<style[\s\S]*?<\/style>/gi, "");

const pages = (html.match(/class="page[\s"]/g) || []).length;
const wuxingSlots = (bodyHtml.match(/data-visual="wuxing"/g) || []).length;
const tenSlots = (bodyHtml.match(/data-visual="tenyear"/g) || []).length;
const monthSlots = (bodyHtml.match(/data-visual="month"/g) || []).length;
const landscapes = (bodyHtml.match(/data-ornament="landscape"/g) || []).length;
const lotuses = (bodyHtml.match(/data-ornament="lotus"/g) || []).length;

assert.ok(wuxingSlots === 1, `오행 균형도 1회(got ${wuxingSlots})`);
assert.ok(tenSlots === 1, `10년 흐름 그래프 1회(got ${tenSlots})`);
assert.ok(monthSlots === 1, `월별 종합 흐름 1회(got ${monthSlots})`);
assert.ok(landscapes <= 1, `landscape ornaments ${landscapes}`);
assert.ok(lotuses <= 1, `lotus ornaments ${lotuses}`);
assert.ok(pages >= 90 && pages <= 130, `pages ${pages}`);
assert.ok(/font-size:\s*12pt/.test(html), "12pt body");

const visualIds = [...html.matchAll(/data-visual="([^"]+)"/g)].map((m) => m[1]);
const dupVisual = visualIds.filter((id, i) => visualIds.indexOf(id) !== i);
assert.equal(dupVisual.length, 0, `duplicate visual ids ${dupVisual}`);

// 같은 페이지에 장식 2개 이상 금지(대략)
const pageChunks = html.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
const doubleOrnament = pageChunks.filter((c) => (c.match(/data-ornament=/g) || []).length > 1);
assert.equal(doubleOrnament.length, 0, "page with >1 ornament");

const result = {
  ok: true,
  pages,
  wuxingSlots,
  tenSlots,
  monthSlots,
  landscapes,
  lotuses,
  sampleCounts: count,
  tenYearScores: years.map((y) => y.score),
};
console.log(JSON.stringify(result, null, 2));
