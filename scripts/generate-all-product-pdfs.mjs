/**
 * 8,000 / 19,000 / 29,000원 상품 PDF+HTML 생성
 * HTML 표기 쪽수 = 크롬 인쇄 쪽수 동기화 검사
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import { createReading } from "../src/lib/reading.js";
import { PLANS } from "../src/lib/customFortune.js";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";
import { generateSyncedReportPdf } from "./lib/generateReportPdf.mjs";

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
    price: PLANS.single.price,
    file: "single-wealth-layout.pdf",
    htmlFile: "single-wealth-layout.html",
    opts: { mode: "single", topicId: "wealth", selected: ["wealth"] },
  },
  {
    key: "triple",
    price: PLANS.triple.price,
    file: "triple-layout.pdf",
    htmlFile: "triple-layout.html",
    opts: { mode: "triple", selected: ["wealth", "career", "marriage"] },
  },
  {
    key: "full",
    price: PLANS.full.price,
    file: "full-layout.pdf",
    htmlFile: "full-layout.html",
    opts: { mode: "full" },
  },
];

function shownTotal(html) {
  const m = String(html).match(/전체\s*(\d+)\s*페이지/) || String(html).match(/총\s*(\d+)\s*페이지/);
  return m ? Number(m[1]) : null;
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
    // 전달 PDF = 논리장 병합(표기 쪽수와 동일). HTML 직접 크롬인쇄는 오버플로로 쪽수가 늘어나 비권장.
    const synced = await generateSyncedReportPdf(browser, reading, prod.opts);
    const pdfPath = resolve(outDir, prod.file);
    const htmlPath = resolve(outDir, prod.htmlFile);
    writeFileSync(pdfPath, synced.pdfBytes);
    writeFileSync(htmlPath, synced.html, "utf8");

    const shown = shownTotal(synced.html);
    const count = (await PDFDocument.load(synced.pdfBytes)).getPageCount();

    results.push({
      key: prod.key,
      price: prod.price,
      pdfPath,
      htmlPath,
      shownInHtml: shown,
      pdfPages: count,
      tocSynced: synced.synced,
      htmlMatchesPdf: shown === count,
      fontOk: /font-size:\s*12\.5pt/.test(synced.html),
      logicalPages: synced.logicalPages,
      sewoonYears: [...synced.html.matchAll(/(\d{4})년\s*세운\s*심층/g)].map((m) => Number(m[1])),
    });
    console.log(JSON.stringify(results[results.length - 1]));
  }
} finally {
  await browser.close();
}

const summary = {
  prices: results.map((r) => r.price),
  results,
  ok: results.every((r) => r.htmlMatchesPdf && r.fontOk && r.pdfPages === r.shownInHtml && r.tocSynced),
};
writeFileSync(resolve(outDir, "qa-pagesync-all.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;
