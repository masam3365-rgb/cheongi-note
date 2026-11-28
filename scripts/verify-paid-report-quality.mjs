/**
 * 풀 패키지 HTML(+선택 PDF) 품질 검사: 빈 페이지·중복·공백·한글·쪽번호
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { PLANS } from "../src/lib/customFortune.js";
import { buildPaidReport } from "../server/buildPaidReport.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-quality");
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

const html = generateProductReportHtml(reading, { mode: "full" });
const htmlPath = resolve(outDir, "full-package.html");
writeFileSync(htmlPath, html, "utf8");

const pageChunks = html.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
const pages = pageChunks.length;

function pageText(chunk) {
  return chunk
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const texts = pageChunks.map(pageText);
const emptyPages = texts
  .map((t, i) => ({ i: i + 1, len: t.replace(/천기노트|참고용|안내 자료|\d+/g, "").trim().length }))
  .filter((row) => row.len < 40);

const sparsePages = texts
  .map((t, i) => ({ i: i + 1, chars: t.length }))
  .filter((row) => row.i > 1 && row.i < pages && row.chars < 220);

// 연속 페이지 본문 중복(앞 80자)
let duplicatePairs = 0;
for (let i = 1; i < texts.length; i += 1) {
  const a = texts[i - 1].replace(/\s+/g, "").slice(40, 120);
  const b = texts[i].replace(/\s+/g, "").slice(40, 120);
  if (a && b && a === b) duplicatePairs += 1;
}

const plain = html.replace(/<[^>]+>/g, " ");
const hasHangul =
  /[\uAC00-\uD7A3]{4,}/.test(plain) && (plain.match(/[\uAC00-\uD7A3]/g) || []).length > 500;
const has12pt = /font-size:\s*12pt/.test(html);
const hasTitlePt = /font-size:\s*18pt/.test(html);
const hasMargin16 = /margin:\s*16mm/.test(html);
const hasCounsel =
  plain.includes("원인 분석") &&
  plain.includes("타고난 성향") &&
  plain.includes("현재 상황") &&
  plain.includes("향후 흐름") &&
  plain.includes("주의할 점") &&
  plain.includes("생활 속 실천");
const hasPageNos = (html.match(/천기노트 — 참고용 안내 자료/g) || []).length >= pages - 1;
const inventedBan = /임의로 배치한 행성|가상 별자리|없는 대운/.test(html);

assert.ok(pages >= 95 && pages <= 125, `full package section pages target ~100 (got ${pages})`);
assert.equal(emptyPages.length, 0, `empty pages: ${JSON.stringify(emptyPages)}`);
assert.ok(sparsePages.length <= Math.ceil(pages * 0.1), `too many sparse pages: ${sparsePages.length}`);
assert.equal(duplicatePairs, 0, "adjacent duplicate bodies");
assert.ok(hasHangul, "hangul missing");
assert.ok(hasCounsel, "6-section counsel missing");
assert.ok(has12pt, "body 12pt missing");
assert.ok(hasTitlePt, "title 18pt missing");
assert.ok(hasMargin16, "page margin 16mm missing");
assert.ok(hasPageNos, "page footers missing");
assert.equal(inventedBan, false);
assert.deepEqual([PLANS.single.price, PLANS.triple.price, PLANS.full.price], [8000, 19000, 29000]);

const single = buildPaidReport({
  surname: "가",
  given: "상갑",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "female",
  calendar: "solar",
  product: "single",
  topicId: "wealth",
});
const triple = buildPaidReport({
  surname: "가",
  given: "상갑",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "female",
  calendar: "solar",
  product: "triple",
  selected: ["wealth", "career", "marriage"],
});

assert.ok(single.pages < pages, "single should be shorter than full");
assert.ok(triple.pages < pages && triple.pages > single.pages, "triple between single and full");
assert.ok(/원인 분석/.test(single.html));

let pdfBytes = null;
let pdfPages = null;
if (process.env.PAID_REPORT_PDF === "1") {
  const { resolveChromePath } = await import("./lib/sellerReportCore.mjs");
  const puppeteer = (await import("puppeteer")).default;
  const chrome = await resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 300000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    pdfBytes = pdf.length;
    pdfPages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
    writeFileSync(resolve(outDir, "full-package.pdf"), pdf);
    assert.ok(pdfPages >= 100 && pdfPages <= 140, `printed PDF pages ${pdfPages}`);
  } finally {
    await browser.close();
  }
}

const result = {
  ok: true,
  pages,
  cards: (html.match(/class="card"/g) || []).length,
  bytes: html.length,
  emptyPages: emptyPages.length,
  sparsePages: sparsePages.slice(0, 8),
  duplicatePairs,
  hasHangul,
  hasCounsel,
  has12pt,
  hasTitlePt,
  hasMargin16,
  prices: [PLANS.single.price, PLANS.triple.price, PLANS.full.price],
  singlePages: single.pages,
  triplePages: triple.pages,
  htmlPath,
  pdfBytes,
  pdfPages,
  pdfPath: pdfBytes ? resolve(outDir, "full-package.pdf") : null,
};

writeFileSync(resolve(outDir, "report.json"), JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
