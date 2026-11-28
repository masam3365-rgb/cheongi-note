/**
 * 8,000 / 19,000 / 29,000원 상품 PDF 생성·쪽수·연도 그래프 스팟 검사
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
    opts: { mode: "single", topicId: "wealth", selected: ["wealth"] },
  },
  {
    key: "triple",
    price: PLANS.triple.price,
    file: "triple-layout.pdf",
    opts: { mode: "triple", selected: ["wealth", "career", "marriage"] },
  },
  {
    key: "full",
    price: PLANS.full.price,
    file: "full-layout.pdf",
    opts: { mode: "full" },
  },
];

const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});

const results = [];
try {
  for (const prod of products) {
    const { pdfBytes, html, pdfPages, synced } = await generateSyncedReportPdf(browser, reading, prod.opts);
    const path = resolve(outDir, prod.file);
    writeFileSync(path, pdfBytes);
    const count = (await PDFDocument.load(pdfBytes)).getPageCount();
    const body = String(html || "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const fontOk = /font-size:\s*12\.5pt/.test(html || "");
    const years = [...body.matchAll(/(\d{4})년\s*세운\s*심층/g)].map((m) => Number(m[1]));
    let yearGraphOk = true;
    const yearGraphNotes = [];
    if (prod.key === "full") {
      for (const yr of [2027, 2030]) {
        const hasCaption = body.includes(`${yr}년 월별 종합 지수`);
        const wrongNear = new RegExp(`${yr}년\\s*세운\\s*심층[\\s\\S]{0,12000}?2026년\\s*월별\\s*종합`);
        const bad = wrongNear.test(body);
        if (!hasCaption || bad) yearGraphOk = false;
        yearGraphNotes.push({ year: yr, hasCaption, wrong2026Near: bad });
      }
    }
    results.push({
      key: prod.key,
      price: prod.price,
      path,
      pages: count,
      pdfPages,
      tocSynced: synced,
      fontOk,
      sewoonYears: years,
      yearGraphOk,
      yearGraphNotes,
    });
    console.log(JSON.stringify(results[results.length - 1]));
  }
} finally {
  await browser.close();
}

const summary = {
  prices: results.map((r) => r.price),
  expectedPrices: [8000, 19000, 29000],
  results,
  ok:
    results.length === 3 &&
    results.every((r) => r.fontOk && r.pages > 0) &&
    results.find((r) => r.key === "full")?.yearGraphOk === true &&
    results.every((r) => r.price === PLANS[r.key].price),
};
writeFileSync(resolve(outDir, "qa-all-products.json"), JSON.stringify(summary, null, 2), "utf8");
console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;
