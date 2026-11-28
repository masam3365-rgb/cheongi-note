/**
 * 실데이터 풀 PDF 생성 + 논리 페이지 분량·도표·인쇄 쪽 공백 검증
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { estimateBodyWeight } from "../src/lib/pageBalance.js";
import { PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-balance");
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

const html = generateProductReportHtml(reading, { mode: "full" });
const htmlPath = resolve(outDir, "full-balanced.html");
writeFileSync(htmlPath, html, "utf8");

const pageChunks = html.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
const logicalPages = pageChunks.length;

function pageMeta(chunk, i) {
  const title = (chunk.match(/<h2[^>]*>([^<]+)/) || [])[1] || "";
  const text = chunk
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    i: i + 1,
    title: title.slice(0, 48),
    weight: estimateBodyWeight(chunk),
    chars: text.replace(/천기노트|참고용|안내 자료|\d+/g, "").trim().length,
    visuals: (chunk.match(/data-visual=/g) || []).length,
    ornaments: (chunk.match(/data-ornament=/g) || []).length,
  };
}

const metas = pageChunks.map(pageMeta);
const sparse = metas.filter((m) => m.i > 1 && m.i < logicalPages && m.weight < 520 && m.chars < 280);
const empty = metas.filter((m) => m.chars < 40);
const focus = [8, 11, 12, 18].map((n) => metas[n - 1]).filter(Boolean);
const wealth = metas.filter((m) => /재물/.test(m.title || ""));

const bodyHtml = html.replace(/<style[\s\S]*?<\/style>/gi, "");
const visualIds = [...bodyHtml.matchAll(/data-visual="([^"]+)"/g)].map((m) => m[1]);
const ornamentIds = [...bodyHtml.matchAll(/data-ornament="([^"]+)"/g)].map((m) => m[1]);
const dupVisual = visualIds.filter((id, idx) => visualIds.indexOf(id) !== idx);
const dupOrnament = ornamentIds.filter((id, idx) => ornamentIds.indexOf(id) !== idx);

assert.equal(empty.length, 0, `empty pages ${JSON.stringify(empty)}`);
assert.ok(sparse.length <= Math.ceil(logicalPages * 0.08), `sparse pages ${sparse.length}: ${JSON.stringify(sparse.slice(0, 8))}`);
assert.equal(dupVisual.length, 0, `duplicate visuals ${dupVisual}`);
assert.equal(dupOrnament.length, 0, `duplicate ornaments ${dupOrnament}`);
assert.ok(visualIds.length >= 5, `expected more data visuals, got ${visualIds.length}`);
assert.ok(ornamentIds.length >= 2, `ornaments ${ornamentIds.length}`);
assert.ok(logicalPages >= 90 && logicalPages <= 130, `logical pages ${logicalPages}`);
assert.ok(/font-size:\s*12pt/.test(html), "12pt");
assert.ok(/margin:\s*16mm/.test(html), "16mm margin");
assert.deepEqual([PLANS.single.price, PLANS.triple.price, PLANS.full.price], [8000, 19000, 29000]);

// 재물운 장에 재물 도표
assert.ok(
  wealth.some((w) => w.visuals > 0) || html.includes("theme-wealthScore") || html.includes("월별 재물"),
  "wealth visual missing",
);

let pdfPath = null;
let pdfPages = null;
let printGaps = [];

const { resolveChromePath } = await import("./lib/sellerReportCore.mjs");
const puppeteer = (await import("puppeteer")).default;
const chrome = await resolveChromePath();
assert.ok(chrome || true, "chrome optional");

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 300000 });

  // 논리 .page 콘텐츠 높이 vs A4 본문 영역(~265mm) — 하단 공백 비율
  const measures = await page.evaluate(() => {
    const mm = 96 / 25.4;
    const contentH = (297 - 32) * mm; // 16mm*2 margins
    return [...document.querySelectorAll(".page")].map((el, i) => {
      const dense = el.querySelector(".dense") || el;
      const h = dense.getBoundingClientRect().height;
      const gap = Math.max(0, contentH - h);
      const gapRatio = gap / contentH;
      const title = el.querySelector("h2")?.textContent?.trim() || "";
      const visuals = el.querySelectorAll("[data-visual]").length;
      const ornaments = el.querySelectorAll("[data-ornament]").length;
      return {
        i: i + 1,
        title: title.slice(0, 40),
        contentPx: Math.round(h),
        gapPx: Math.round(gap),
        gapRatio: Number(gapRatio.toFixed(3)),
        visuals,
        ornaments,
      };
    });
  });

  writeFileSync(resolve(outDir, "page-measures.json"), JSON.stringify(measures, null, 2), "utf8");

  // cover 제외, 과도한 하단 공백(55%+) 페이지
  printGaps = measures.filter((m) => m.i > 1 && m.gapRatio > 0.55);
  assert.ok(
    printGaps.length <= Math.ceil(measures.length * 0.12),
    `too many large bottom gaps: ${printGaps.length} ${JSON.stringify(printGaps.slice(0, 10))}`,
  );

  const focusPrint = [8, 11, 12, 18].map((n) => measures[n - 1]).filter(Boolean);
  writeFileSync(resolve(outDir, "focus-pages.json"), JSON.stringify({ focus, focusPrint, wealth }, null, 2), "utf8");

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  pdfPath = resolve(outDir, "full-balanced.pdf");
  writeFileSync(pdfPath, pdf);
  pdfPages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.ok(pdfPages >= 95 && pdfPages <= 160, `printed pdf pages ${pdfPages}`);
  assert.ok(existsSync(pdfPath) && pdf.length > 50000, "pdf too small");
} finally {
  await browser.close();
}

const summary = {
  ok: true,
  person: `${reading.displayName}(${reading.hanja})`,
  logicalPages,
  pdfPages,
  pdfPath,
  htmlPath,
  visualIds,
  ornamentIds,
  sparseCount: sparse.length,
  largeGapCount: printGaps.length,
  focusLogical: focus,
  wealthPages: wealth,
  prices: [8000, 19000, 29000],
};
writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
