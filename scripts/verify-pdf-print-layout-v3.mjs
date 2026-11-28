/**
 * 인쇄 레이아웃 v3 검증: 주제/월별 패킹·이어서 제거·역학 중복 통합 후
 * full + single PDF, 전 페이지 PNG, 문제 페이지 전후 비교 복사
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync, copyFileSync, readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { estimateBodyWeight } from "../src/lib/pageBalance.js";
import { PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v3");
const imgDir = resolve(outDir, "pages");
const compareDir = resolve(outDir, "compare-before-after");
const prevImgDir = resolve(__dirname, "../output/paid-report-layout-v2/pages");
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

const longReading = person();
const shortReading = person({
  surname: "김",
  given: "서",
  surnameHanja: "",
  givenHanja: "",
  hour: 12,
  unknownTime: true,
});

const longHtml = generateProductReportHtml(longReading, { mode: "full" });
const shortHtml = generateProductReportHtml(shortReading, { mode: "single", topicId: "wealth" });
writeFileSync(resolve(outDir, "full-layout.html"), longHtml, "utf8");
writeFileSync(resolve(outDir, "single-wealth-layout.html"), shortHtml, "utf8");

const bodyOnly = longHtml.replace(/<style[\s\S]*?<\/style>/gi, "");
assert.ok(/keep-block/.test(longHtml), "keep-block missing");
assert.ok(/table-block/.test(longHtml), "table-block missing");
assert.ok(/orphans:\s*3/.test(longHtml), "orphans");
assert.ok(/widows:\s*3/.test(longHtml), "widows");
assert.ok(/font-size:\s*12pt/.test(longHtml), "12pt");
assert.deepEqual([PLANS.single.price, PLANS.triple.price, PLANS.full.price], [8000, 19000, 29000]);

// 기계적 ‘이어서 N’ 제목·반복 역학 렌즈 제거 확인
const contTitles = [...bodyOnly.matchAll(/이어서\s*\d+/g)];
assert.equal(contTitles.length, 0, `mechanical continuation titles: ${contTitles.map((m) => m[0])}`);
assert.ok(!/동양 역학 렌즈/.test(bodyOnly), "동양 역학 렌즈 still present");
assert.ok(/이 주제와 맞닿은 역학 포인트|아홉 갈래|본원/.test(bodyOnly), "topic lens or origin missing");
assert.ok(/\d+~\d+월 운세/.test(bodyOnly), "month groups missing");

const pageChunks = longHtml.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
const logicalPages = pageChunks.length;
const metas = pageChunks.map((chunk, i) => {
  const title = (chunk.match(/<h2[^>]*>([^<]+)/) || [])[1] || "";
  const text = chunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    i: i + 1,
    title: title.slice(0, 48),
    weight: estimateBodyWeight(chunk),
    chars: text.replace(/천기노트|참고용|안내 자료|\d+/g, "").trim().length,
    keepBlocks: (chunk.match(/keep-block/g) || []).length,
  };
});
const empty = metas.filter((m) => m.chars < 40);
const sparse = metas.filter((m) => m.i > 1 && m.i < logicalPages && m.weight < 520 && m.chars < 280);
assert.equal(empty.length, 0, JSON.stringify(empty));
assert.ok(sparse.length <= Math.ceil(logicalPages * 0.1), `sparse ${sparse.length}`);

const { resolveChromePath } = await import("./lib/sellerReportCore.mjs");
const puppeteer = (await import("puppeteer")).default;
const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

let pdfPages = null;
let shortPages = null;
let printGaps = [];
let strandedHeads = [];
const screenshotFiles = [];

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 920, height: 1300, deviceScaleFactor: 1 });
  await page.setContent(longHtml, { waitUntil: "domcontentloaded", timeout: 300000 });
  await page.evaluate(() => document.fonts?.ready?.catch?.(() => null));

  await page.addStyleTag({
    content: `
      @media screen {
        body { background:#ccc !important; padding:0 !important; }
        .print-hint { display:none !important; }
        .page {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto 16px !important;
          padding: 16mm 15mm !important;
          box-shadow: none !important;
          background: #f7f1e6 !important;
        }
        .page.cover-page { padding: 0 !important; }
      }
    `,
  });

  const handles = await page.$$(".page");
  for (let i = 0; i < handles.length; i += 1) {
    const file = resolve(imgDir, `page-${String(i + 1).padStart(3, "0")}.png`);
    await handles[i].screenshot({ path: file, type: "png" });
    screenshotFiles.push(file);
  }

  await page.emulateMediaType("print");
  const measures = await page.evaluate(() => {
    const mm = 96 / 25.4;
    const contentH = (297 - 32) * mm;
    return [...document.querySelectorAll(".page")].map((el, i) => {
      const dense = el.querySelector(".dense") || el;
      const h = dense.getBoundingClientRect().height;
      const gap = Math.max(0, contentH - h);
      const title = el.querySelector("h2")?.textContent?.trim() || "";
      return {
        i: i + 1,
        title: title.slice(0, 48),
        contentPx: Math.round(h),
        gapPx: Math.round(gap),
        gapRatio: Number((gap / contentH).toFixed(3)),
      };
    });
  });
  writeFileSync(resolve(outDir, "page-measures.json"), JSON.stringify(measures, null, 2), "utf8");
  printGaps = measures.filter((m) => m.i > 1 && m.gapRatio > 0.55);
  strandedHeads = measures.filter((m) => m.contentPx < 180 && /·|제\d|리포트|대운|월운|운세/.test(m.title));

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  writeFileSync(resolve(outDir, "full-layout.pdf"), pdf);
  pdfPages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.ok(pdf.length > 40000, "pdf missing");
  assert.ok(pdfPages >= 60 && pdfPages <= 160, `pdf pages ${pdfPages}`);

  // 단품(재물) 리포트
  await page.setContent(shortHtml, { waitUntil: "domcontentloaded", timeout: 180000 });
  await page.evaluate(() => document.fonts?.ready?.catch?.(() => null));
  const shortImgDir = resolve(outDir, "single-pages");
  mkdirSync(shortImgDir, { recursive: true });
  await page.addStyleTag({
    content: `
      @media screen {
        body { background:#ccc !important; padding:0 !important; }
        .print-hint { display:none !important; }
        .page {
          width: 210mm !important;
          min-height: 297mm !important;
          margin: 0 auto 16px !important;
          padding: 16mm 15mm !important;
          box-shadow: none !important;
          background: #f7f1e6 !important;
        }
      }
    `,
  });
  const shortHandles = await page.$$(".page");
  for (let i = 0; i < shortHandles.length; i += 1) {
    await shortHandles[i].screenshot({
      path: resolve(shortImgDir, `page-${String(i + 1).padStart(3, "0")}.png`),
      type: "png",
    });
  }
  const shortPdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  writeFileSync(resolve(outDir, "single-wealth-layout.pdf"), shortPdf);
  shortPages = (Buffer.from(shortPdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.ok(shortPages >= 6 && shortPages < pdfPages, `short pages ${shortPages}`);
} finally {
  await browser.close();
}

// 전후 비교: v2에서 문제로 지목된 패턴 페이지 + 동일 제목 근처 v3
const problemHints = [
  /사업운/,
  /결혼운/,
  /정밀 궁합|궁합/,
  /1\s*~\s*3월|1월 운세/,
  /생활 속 실천/,
  /개인별 해석/,
];
const comparePairs = [];
if (existsSync(prevImgDir)) {
  const prevFiles = readdirSync(prevImgDir).filter((f) => f.endsWith(".png")).sort();
  // v2 page-measures가 있으면 제목 기준으로 매칭, 없으면 휴리스틱 번호 페이지
  let prevMeasures = [];
  try {
    prevMeasures = JSON.parse(
      readFileSync(resolve(__dirname, "../output/paid-report-layout-v2/page-measures.json"), "utf8"),
    );
  } catch {
    prevMeasures = [];
  }
  const v3ByTitle = Object.fromEntries(metas.map((m) => [m.title, m.i]));
  for (const hint of problemHints) {
    const prevHit = prevMeasures.find((m) => hint.test(m.title || ""));
    const v3Hit = metas.find((m) => hint.test(m.title || ""));
    if (prevHit && existsSync(resolve(prevImgDir, `page-${String(prevHit.i).padStart(3, "0")}.png`))) {
      const before = resolve(compareDir, `before-${String(prevHit.i).padStart(3, "0")}-${(prevHit.title || "p").slice(0, 20).replace(/[\\/:*?"<>|]/g, "_")}.png`);
      copyFileSync(resolve(prevImgDir, `page-${String(prevHit.i).padStart(3, "0")}.png`), before);
      comparePairs.push({ role: "before", title: prevHit.title, path: before });
    }
    if (v3Hit && existsSync(resolve(imgDir, `page-${String(v3Hit.i).padStart(3, "0")}.png`))) {
      const after = resolve(compareDir, `after-${String(v3Hit.i).padStart(3, "0")}-${(v3Hit.title || "p").slice(0, 20).replace(/[\\/:*?"<>|]/g, "_")}.png`);
      copyFileSync(resolve(imgDir, `page-${String(v3Hit.i).padStart(3, "0")}.png`), after);
      comparePairs.push({ role: "after", title: v3Hit.title, path: after });
    } else if (!v3Hit && Object.keys(v3ByTitle).length) {
      // no-op
    }
  }
  // 폴백: v2 중간·후반 몇 장
  if (comparePairs.filter((p) => p.role === "before").length < 3 && prevFiles.length) {
    for (const idx of [40, 55, 70, 85, 100]) {
      const name = `page-${String(idx).padStart(3, "0")}.png`;
      if (prevFiles.includes(name)) {
        const dest = resolve(compareDir, `before-fallback-${name}`);
        copyFileSync(resolve(prevImgDir, name), dest);
        comparePairs.push({ role: "before-fallback", path: dest });
      }
    }
  }
}

const remainingIssues = {
  largeBottomGaps: printGaps.map((m) => ({ i: m.i, title: m.title, gapRatio: m.gapRatio })),
  possibleStrandedHeads: strandedHeads,
  note:
    "Chromium은 orphans/widows·일부 break-inside를 완전 보장하지 않을 수 있음. 논리 .page 단위 스크린샷으로 시각 검증. gap>55%는 아래에 남김.",
};

const summary = {
  ok: true,
  version: "layout-v3",
  person: `${longReading.displayName}(${longReading.hanja || "한자없음"})`,
  logicalPages,
  pdfPages,
  shortPages,
  shortCase: "single wealth",
  paths: {
    pdf: resolve(outDir, "full-layout.pdf"),
    html: resolve(outDir, "full-layout.html"),
    shortPdf: resolve(outDir, "single-wealth-layout.pdf"),
    measures: resolve(outDir, "page-measures.json"),
    screenshotsDir: imgDir,
    screenshotCount: screenshotFiles.length,
    compareDir,
    backup: resolve(__dirname, "../output/paid-report-layout-v2-backup"),
    previousV2: resolve(__dirname, "../output/paid-report-layout-v2/full-layout.pdf"),
  },
  sparseCount: sparse.length,
  largeGapCount: printGaps.length,
  strandedHeadCount: strandedHeads.length,
  comparePairs: comparePairs.length,
  prices: [8000, 19000, 29000],
  checks: {
    noContinuationTitles: true,
    noEastLensRepeatLabel: true,
    monthGroupsPresent: true,
  },
  remainingIssues,
};
writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
