/**
 * 인쇄 레이아웃 v4 최종 검증
 * HTML 생성 → PDF → 페이지별 단독 스크린샷 → 측정/비교
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync, copyFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { estimateBodyWeight } from "../src/lib/pageBalance.js";
import { PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v4");
const imgDir = resolve(outDir, "pages");
const compareDir = resolve(outDir, "compare-before-after");
const prevImgDir = resolve(__dirname, "../output/paid-report-layout-v3/pages");
mkdirSync(imgDir, { recursive: true });
mkdirSync(compareDir, { recursive: true });

function person(overrides = {}) {
  return createReading({
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
    ...overrides,
  });
}

function extractStyle(html) {
  const m = String(html).match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : "";
}

function pageChunksOf(html) {
  return html.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
}

const longReading = person();
const shortReading = person({
  surname: "김",
  given: "서",
  surnameHanja: "",
  givenHanja: "",
  hour: 12,
  unknownTime: true,
});

const draftHtml = generateProductReportHtml(longReading, { mode: "full" });
const bodyOnlyDraft = draftHtml.replace(/<style[\s\S]*?<\/style>/gi, "");
assert.ok(/keep-block|card-keep/.test(draftHtml), "keep missing");
assert.ok(/orphans:\s*4/.test(draftHtml), "orphans");
assert.ok(/font-size:\s*12\.5pt/.test(draftHtml), "12.5pt");
assert.ok(/line-height:\s*1\.6/.test(draftHtml), "line-height 1.6");
assert.ok(/margin:\s*16mm\s+14mm\s+28mm/.test(draftHtml), "footer margin");
assert.ok(/sheet-root/.test(draftHtml), "sheet-root");
assert.ok(/last-page/.test(draftHtml), "last-page");
assert.ok(/print-running-footer/.test(draftHtml), "running footer");
assert.deepEqual([PLANS.single.price, PLANS.triple.price, PLANS.full.price], [8000, 19000, 29000]);
assert.equal([...bodyOnlyDraft.matchAll(/이어서\s*\d+/g)].length, 0);
assert.ok(!/동양 역학 렌즈/.test(bodyOnlyDraft));
assert.ok(/\d+~\d+월 운세/.test(bodyOnlyDraft));

const { resolveChromePath } = await import("./lib/sellerReportCore.mjs");
const { generateSyncedReportPdf } = await import("./lib/generateReportPdf.mjs");
const puppeteer = (await import("puppeteer")).default;
const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

let longHtml = draftHtml;
let shortHtml = generateProductReportHtml(shortReading, { mode: "single", topicId: "wealth" });
let pdfPages = null;
let shortPages = null;
let tocSynced = false;
let printGaps = [];
let strandedHeads = [];
let footerOverlapRisk = [];
const screenshotFiles = [];

async function shotPages(html, dir) {
  mkdirSync(dir, { recursive: true });
  const chunks = pageChunksOf(html);
  const css = extractStyle(html) || "";
  const page = await browser.newPage();
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
  const files = [];
  try {
    for (let i = 0; i < chunks.length; i += 1) {
      const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><style>
        ${css}
        @media screen {
          body { background:#ccc; margin:0; padding:0; }
          .print-hint, .print-running-footer { display:none !important; }
          .page {
            width:210mm !important; min-height:297mm !important;
            margin:0 auto !important; padding:14mm 14mm 18mm !important;
            background:#f7f1e6 !important; box-shadow:none !important;
          }
          .page.cover-page { padding:0 !important; }
        }
      </style></head><body>${chunks[i]}</body></html>`;
      await page.setContent(doc, { waitUntil: "domcontentloaded", timeout: 120000 });
      const handle = await page.$(".page");
      const file = resolve(dir, `page-${String(i + 1).padStart(3, "0")}.png`);
      if (handle) {
        await handle.screenshot({ path: file, type: "png" });
        await handle.dispose();
        files.push(file);
      }
    }
  } finally {
    await page.close();
  }
  return files;
}

try {
  const full = await generateSyncedReportPdf(browser, longReading, { mode: "full" });
  longHtml = full.html;
  writeFileSync(resolve(outDir, "full-layout.html"), longHtml, "utf8");
  writeFileSync(resolve(outDir, "full-layout.pdf"), full.pdfBytes);
  pdfPages = full.pdfPages;
  tocSynced = full.synced;
  assert.ok(full.pdfBytes.length > 40000, "pdf missing");
  assert.ok(pdfPages >= 70 && pdfPages <= 200, `pdf pages ${pdfPages}`);
  assert.ok(tocSynced, `toc pages ${full.shownTotal} != pdf ${pdfPages}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
  await page.setContent(longHtml, { waitUntil: "domcontentloaded", timeout: 300000 });
  await page.evaluate(() => document.fonts?.ready?.catch?.(() => null));
  await page.emulateMediaType("print");

  const measures = await page.evaluate(() => {
    const mm = 96 / 25.4;
    const contentH = (297 - 44) * mm; // @page 16mm + 28mm
    const footer = document.querySelector(".print-running-footer");
    const footerBox = footer?.getBoundingClientRect();
    return [...document.querySelectorAll(".page")].map((el) => {
      const dense = el.querySelector(".dense") || el;
      const h = dense.getBoundingClientRect().height;
      const gap = Math.max(0, contentH - h);
      const title = el.querySelector("h2")?.textContent?.trim() || "";
      const lastText = [...dense.querySelectorAll("p, h3, td, li")].at(-1);
      const lastBox = lastText?.getBoundingClientRect();
      const overlap = footerBox && lastBox ? lastBox.bottom > footerBox.top - 2 : false;
      return {
        i: 0,
        title: title.slice(0, 48),
        contentPx: Math.round(h),
        gapPx: Math.round(gap),
        gapRatio: Number((gap / contentH).toFixed(3)),
        footerOverlapRisk: Boolean(overlap),
      };
    }).map((row, idx) => ({ ...row, i: idx + 1 }));
  });
  writeFileSync(resolve(outDir, "page-measures.json"), JSON.stringify(measures, null, 2), "utf8");
  printGaps = measures.filter((m) => m.i > 1 && m.gapRatio > 0.55);
  strandedHeads = measures.filter((m) => m.contentPx < 180 && /·|제\d|리포트|대운|월운|운세/.test(m.title));
  footerOverlapRisk = measures.filter((m) => m.footerOverlapRisk);
  await page.close();

  screenshotFiles.push(...(await shotPages(longHtml, imgDir)));

  const short = await generateSyncedReportPdf(browser, shortReading, {
    mode: "single",
    topicId: "wealth",
  });
  shortHtml = short.html;
  writeFileSync(resolve(outDir, "single-wealth-layout.html"), shortHtml, "utf8");
  writeFileSync(resolve(outDir, "single-wealth-layout.pdf"), short.pdfBytes);
  shortPages = short.pdfPages;
  assert.ok(shortPages >= 6, `short pages ${shortPages}`);
  assert.ok(short.synced, `short toc ${short.shownTotal} != pdf ${shortPages}`);

  await shotPages(shortHtml, resolve(outDir, "single-pages"));
} finally {
  await browser.close();
}

const pageChunks = pageChunksOf(longHtml);
const logicalPages = pageChunks.length;
const metas = pageChunks.map((chunk, i) => {
  const title = (chunk.match(/<h2[^>]*>([^<]+)/) || [])[1] || "";
  const text = chunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const chars = text.replace(/천기노트|참고용|안내 자료|\d+/g, "").trim().length;
  return { i: i + 1, title: title.slice(0, 48), weight: estimateBodyWeight(chunk), chars };
});
assert.equal(metas.filter((m) => m.chars < 40).length, 0, "empty pages");
assert.equal(
  metas.filter((m) => m.i > 1 && m.chars < 90 && /·|제\d|운세|대운/.test(m.title)).length,
  0,
  "title-only",
);
const bodyOnly = longHtml.replace(/<style[\s\S]*?<\/style>/gi, "");

const comparePairs = [];
if (existsSync(prevImgDir)) {
  let prevMeasures = [];
  try {
    prevMeasures = JSON.parse(
      readFileSync(resolve(__dirname, "../output/paid-report-layout-v3/page-measures.json"), "utf8"),
    );
  } catch {
    prevMeasures = [];
  }
  const hints = [
    { re: /사업운/, key: "business" },
    { re: /결혼운/, key: "marriage" },
    { re: /궁합/, key: "compat" },
    { re: /1~\d+월 운세/, key: "month-jan" },
    { re: /건강운/, key: "health" },
    { re: /여행운/, key: "travel" },
  ];
  for (const hint of hints) {
    const prevHit = prevMeasures.find((m) => hint.re.test(m.title || ""));
    const v4Hit = metas.find((m) => hint.re.test(m.title || ""));
    if (prevHit) {
      const src = resolve(prevImgDir, `page-${String(prevHit.i).padStart(3, "0")}.png`);
      if (existsSync(src)) {
        const dest = resolve(compareDir, `BEFORE-${hint.key}.png`);
        copyFileSync(src, dest);
        comparePairs.push({ role: "before", key: hint.key, title: prevHit.title, path: dest });
      }
    }
    if (v4Hit) {
      const src = resolve(imgDir, `page-${String(v4Hit.i).padStart(3, "0")}.png`);
      if (existsSync(src)) {
        const dest = resolve(compareDir, `AFTER-${hint.key}.png`);
        copyFileSync(src, dest);
        comparePairs.push({ role: "after", key: hint.key, title: v4Hit.title, page: v4Hit.i, path: dest });
      }
    }
  }
}

const multiH2 = metas.filter((m) => {
  const chunk = pageChunks[m.i - 1] || "";
  return ((chunk.match(/<h2[^>]*>/g) || []).length > 1);
});
const bodyChars = bodyOnly.replace(/\s+/g, "").length;
const shortBodyChars = shortHtml.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/\s+/g, "").length;

const summary = {
  ok: true,
  version: "layout-v4-final-qa",
  person: `${longReading.displayName}(${longReading.hanja || "한자없음"})`,
  logicalPages,
  pdfPages,
  shortPages,
  tocPageSynced: tocSynced,
  pdfLogicalDelta: pdfPages - logicalPages,
  contentChars: bodyChars,
  shortContentChars: shortBodyChars,
  paths: {
    pdf: resolve(outDir, "full-layout.pdf"),
    shortPdf: resolve(outDir, "single-wealth-layout.pdf"),
    screenshotsDir: imgDir,
    screenshotCount: screenshotFiles.length,
    compareDir,
    backupV3: resolve(__dirname, "../output/paid-report-layout-v3-backup"),
  },
  largeGapCount: printGaps.length,
  strandedHeadCount: strandedHeads.length,
  multiH2Count: multiH2.length,
  comparePairs: comparePairs.length,
  prices: [8000, 19000, 29000],
  checks: {
    noContinuationTitles: true,
    noEastLensRepeatLabel: true,
    monthGroupsPresent: true,
    footerClearanceCss: true,
    noMultiH2: multiH2.length === 0,
  },
  pageDeltaExplain:
    "PDF는 논리 .page마다 단독 A4로 인쇄한 뒤 병합합니다. 한 논리 장이 A4를 넘기면 PDF 쪽이 늘어나며, 제목 고립·장 섞임은 병합 방식으로 차단합니다.",
  remainingIssues: {
    largeBottomGaps: printGaps.map((m) => ({ i: m.i, title: m.title, gapRatio: m.gapRatio })),
    possibleStrandedHeads: strandedHeads,
    multiH2: multiH2.map((m) => m.title),
    note: "고정 바닥글은 @page 하단 24mm 여백 안에 배치. footerOverlap 자동 탐지는 전체 DOM 기준이라 참고만 합니다.",
  },
};
writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
