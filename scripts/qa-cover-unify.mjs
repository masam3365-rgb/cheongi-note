/**
 * 표지 통일 QA — 전통 선장본 · 실데이터 · 상품별 제목 · 중복/빈쪽
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import { createReading } from "../src/lib/reading.js";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";
import { generateSyncedReportPdf } from "./lib/generateReportPdf.mjs";
import { htmlPagesToMergedPdf } from "./lib/htmlPagesToPdf.mjs";

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

const products = [
  {
    key: "single",
    file: "single-wealth-layout.pdf",
    htmlFile: "single-wealth-layout.html",
    opts: { mode: "single", topicId: "wealth", selected: ["wealth"] },
    expectProduct: /단품\(8,000원\)/,
  },
  {
    key: "triple",
    file: "triple-layout.pdf",
    htmlFile: "triple-layout.html",
    opts: { mode: "triple", selected: ["wealth", "career", "marriage"] },
    expectProduct: /3종 맞춤\(19,000원\)/,
  },
  {
    key: "full",
    file: "full-layout.pdf",
    htmlFile: "full-layout.html",
    opts: { mode: "full" },
    expectProduct: /평생운세 풀 패키지\(29,000원\)/,
  },
];

function extractCover(html) {
  const main = String(html).split(/<main[^>]*>/i)[1] || String(html);
  const start = main.indexOf('<div class="page cover-page">');
  if (start < 0) return "";
  // 표지 블록 끝 = 다음 논리 .page 시작 직전
  const rest = main.slice(start + 1);
  const next = rest.search(/<div class="page[\s"]/);
  return next < 0 ? main.slice(start) : main.slice(start, start + 1 + next);
}

function countClass(html, cls) {
  const re = new RegExp(`class="[^"]*\\b${cls}\\b[^"]*"`, "g");
  return (String(html).match(re) || []).length;
}

async function countBlankishPages(pdfBytes) {
  // pdf-lib alone can't measure ink; use page count + cover uniqueness from HTML.
  const doc = await PDFDocument.load(pdfBytes);
  return doc.getPageCount();
}

const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const results = [];
try {
  for (const prod of products) {
    const synced = await generateSyncedReportPdf(browser, reading, prod.opts);
    const pdfPath = resolve(outDir, prod.file);
    const htmlPath = resolve(outDir, prod.htmlFile);
    writeFileSync(pdfPath, synced.pdfBytes);
    writeFileSync(htmlPath, synced.html, "utf8");

    const cover = extractCover(synced.html);
    const coverPages = countClass(synced.html, "cover-page");
    const bookCovers = countClass(synced.html, "book-cover");
    const chapterCovers = countClass(synced.html, "chapter-cover");
    const pdfPages = await countBlankishPages(synced.pdfBytes);

    // Chrome whole-HTML print page count (비교용 — 전달 PDF와 다를 수 있음)
    let chromePrintPages = null;
    try {
      const page = await browser.newPage();
      await page.setContent(synced.html, { waitUntil: "domcontentloaded", timeout: 300000 });
      await page.emulateMediaType("print");
      const buf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      chromePrintPages = (await PDFDocument.load(buf)).getPageCount();
      await page.close();
    } catch {
      chromePrintPages = null;
    }

    const mergedAgain = await htmlPagesToMergedPdf(browser, synced.html);
    const mergedPages = (await PDFDocument.load(mergedAgain)).getPageCount();

    const row = {
      key: prod.key,
      coverPages,
      bookCovers,
      chapterCovers,
      duplicateCover: coverPages !== 1 || bookCovers !== 1,
      hasTraditionalCover: /book-cover/.test(cover) && /binding/.test(cover),
      hasName: /이민수/.test(cover),
      hasHanja: /李珉洙/.test(cover) || (/李/.test(cover) && /珉洙/.test(cover)),
      hasBirthLabel: /생년월일/.test(cover),
      hasBirthYear: /1990/.test(cover),
      hasWriteDate: /작성일/.test(cover),
      hasProductTitle: prod.expectProduct.test(cover),
      productSnippet: (cover.match(/cover-product[^>]*>[\s\S]*?<\/p>/) || [""])[0].replace(/<[^>]+>/g, "").trim(),
      shownInHtml: synced.shownTotal,
      logicalPages: synced.logicalPages,
      pdfPages,
      mergedPages,
      chromePrintPages,
      htmlMatchesPdf: synced.shownTotal === pdfPages,
      tocSynced: synced.synced,
      noLotusCover: chapterCovers === 0,
    };
    results.push(row);
    console.log(JSON.stringify(row));
  }
} finally {
  await browser.close();
}

const summaryPath = resolve(outDir, "cover-unify-qa.json");
writeFileSync(summaryPath, JSON.stringify({ at: new Date().toISOString(), results }, null, 2), "utf8");
console.log("wrote", summaryPath);

const failed = results.filter(
  (r) =>
    r.duplicateCover ||
    !r.hasTraditionalCover ||
    !r.hasName ||
    !r.hasHanja ||
    !r.hasBirthLabel ||
    !r.hasBirthYear ||
    !r.hasWriteDate ||
    !r.hasProductTitle ||
    !r.htmlMatchesPdf ||
    !r.noLotusCover,
);
process.exit(failed.length ? 1 : 0);
