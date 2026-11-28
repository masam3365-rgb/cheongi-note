/**
 * 인쇄 레이아웃 전면 검증: 실데이터 PDF/HTML 재생성, 전 페이지 PNG, 잘림·공백 검사
 * 기존 output 파일은 덮어쓰지 않고 layout-v2 폴더에 저장
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { estimateBodyWeight } from "../src/lib/pageBalance.js";
import { PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v2");
const imgDir = resolve(outDir, "pages");
mkdirSync(imgDir, { recursive: true });

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
assert.ok(/table-caption/.test(longHtml), "table-caption missing");
assert.ok(/card-body/.test(longHtml), "card-body missing");
assert.ok(/thead\s*\{[^}]*table-header-group/.test(longHtml), "thead repeat css");
assert.ok(/orphans:\s*3/.test(longHtml), "orphans");
assert.ok(/widows:\s*3/.test(longHtml), "widows");
assert.ok(!/overflow:\s*hidden/.test(longHtml.match(/\.visual-slot\s*\{[^}]+\}/)?.[0] || ""), "visual overflow hidden");
assert.ok(/font-size:\s*12pt/.test(longHtml), "12pt");
assert.ok(/margin:\s*16mm\s+15mm/.test(longHtml), "margins");
assert.deepEqual([PLANS.single.price, PLANS.triple.price, PLANS.full.price], [8000, 19000, 29000]);

// 어색한 영문 섹션 라벨(본문 쪽) — 스타일/스크립트 제외
const awkward = [...bodyOnly.matchAll(/\b(INTRO|本性|諮|大運表|改運|總運|九流|進路|開始前)\b/g)].map((m) => m[1]);
assert.equal(awkward.length, 0, `awkward labels ${awkward}`);

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
    visuals: (chunk.match(/data-visual=/g) || []).length,
    ornaments: (chunk.match(/data-ornament=/g) || []).length,
  };
});
const empty = metas.filter((m) => m.chars < 40);
const sparse = metas.filter((m) => m.i > 1 && m.i < logicalPages && m.weight < 520 && m.chars < 280);
assert.equal(empty.length, 0, JSON.stringify(empty));
assert.ok(sparse.length <= Math.ceil(logicalPages * 0.08), `sparse ${sparse.length}`);

const visualIds = [...bodyOnly.matchAll(/data-visual="([^"]+)"/g)].map((m) => m[1]);
const ornamentIds = [...bodyOnly.matchAll(/data-ornament="([^"]+)"/g)].map((m) => m[1]);
const dupV = visualIds.filter((id, i) => visualIds.indexOf(id) !== i);
const dupO = ornamentIds.filter((id, i) => ornamentIds.indexOf(id) !== i);
assert.equal(dupV.length, 0, `dup visuals ${dupV}`);
assert.equal(dupO.length, 0, `dup ornaments ${dupO}`);

const { resolveChromePath } = await import("./lib/sellerReportCore.mjs");
const puppeteer = (await import("puppeteer")).default;
const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

let pdfPages = null;
let printGaps = [];
let strandedHeads = [];
const screenshotFiles = [];

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 920, height: 1300, deviceScaleFactor: 1 });
  await page.setContent(longHtml, { waitUntil: "domcontentloaded", timeout: 300000 });
  await page.evaluate(() => document.fonts?.ready?.catch?.(() => null));

  // 논리 페이지 A4 스크린샷 (시각 검수용)
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
  const maxShot = Math.min(handles.length, 130);
  for (let i = 0; i < maxShot; i += 1) {
    const file = resolve(imgDir, `page-${String(i + 1).padStart(3, "0")}.png`);
    await handles[i].screenshot({ path: file, type: "png" });
    screenshotFiles.push(file);
  }

  // 인쇄 미디어 기준 본문 높이·공백
  await page.emulateMediaType("print");
  const measures = await page.evaluate(() => {
    const mm = 96 / 25.4;
    const contentH = (297 - 32) * mm;
    return [...document.querySelectorAll(".page")].map((el, i) => {
      const dense = el.querySelector(".dense") || el;
      const h = dense.getBoundingClientRect().height;
      const gap = Math.max(0, contentH - h);
      const title = el.querySelector("h2")?.textContent?.trim() || "";
      const keep = el.querySelectorAll(".keep-block").length;
      const tables = el.querySelectorAll("table").length;
      const visuals = el.querySelectorAll("[data-visual]").length;
      const ornaments = el.querySelectorAll("[data-ornament]").length;
      return {
        i: i + 1,
        title: title.slice(0, 40),
        contentPx: Math.round(h),
        gapPx: Math.round(gap),
        gapRatio: Number((gap / contentH).toFixed(3)),
        keep,
        tables,
        visuals,
        ornaments,
      };
    });
  });
  writeFileSync(resolve(outDir, "page-measures.json"), JSON.stringify(measures, null, 2), "utf8");
  printGaps = measures.filter((m) => m.i > 1 && m.gapRatio > 0.55);

  // 고립 제목 후보: keep-block 없이 section-head만 있고 다음 형제 카드가 거의 없는 경우(휴리스틱)
  strandedHeads = measures.filter((m) => m.contentPx < 160 && /·|제\d|리포트|대운|월운/.test(m.title));

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  const pdfPath = resolve(outDir, "full-layout.pdf");
  writeFileSync(pdfPath, pdf);
  pdfPages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.ok(existsSync(pdfPath) && pdf.length > 40000, "pdf missing");
  assert.ok(pdfPages >= 90 && pdfPages <= 170, `pdf pages ${pdfPages}`);

  // 단문(짧은) 케이스
  await page.setContent(shortHtml, { waitUntil: "domcontentloaded", timeout: 180000 });
  await page.evaluate(() => document.fonts?.ready?.catch?.(() => null));
  const shortPdf = await page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  writeFileSync(resolve(outDir, "single-wealth-layout.pdf"), shortPdf);
  const shortPages = (Buffer.from(shortPdf).toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length;
  assert.ok(shortPages >= 8 && shortPages < pdfPages, `short pages ${shortPages}`);
} finally {
  await browser.close();
}

const remainingIssues = {
  largeBottomGaps: printGaps.map((m) => ({ i: m.i, title: m.title, gapRatio: m.gapRatio })),
  possibleStrandedHeads: strandedHeads,
  note:
    "Chromium은 orphans/widows·일부 break-after를 완전 보장하지 않을 수 있음. keep-block·thead·tr avoid로 완화했으며, gap>55% 페이지는 아래에 남김.",
};

const summary = {
  ok: true,
  person: `${longReading.displayName}(${longReading.hanja || "한자없음"})`,
  logicalPages,
  pdfPages,
  shortCase: "single wealth",
  paths: {
    pdf: resolve(outDir, "full-layout.pdf"),
    html: resolve(outDir, "full-layout.html"),
    shortPdf: resolve(outDir, "single-wealth-layout.pdf"),
    measures: resolve(outDir, "page-measures.json"),
    screenshotsDir: imgDir,
    screenshotCount: screenshotFiles.length,
    previousPdfKept: resolve(__dirname, "../output/paid-report-balance/full-balanced.pdf"),
  },
  visuals: visualIds,
  ornaments: ornamentIds,
  sparseCount: sparse.length,
  largeGapCount: printGaps.length,
  keepBlockPages: metas.filter((m) => m.keepBlocks > 0).length,
  prices: [8000, 19000, 29000],
  remainingIssues,
};
writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
