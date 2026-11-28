/**
 * 논리 페이지 중 인쇄 시 2쪽 이상 나는 비율·높이 비율 샘플
 */
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";
import puppeteer from "puppeteer";

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
const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [, ""])[1];
const chunks = html.split(/(?=<div class="page)/).filter((c) => /class="page/.test(c));
const A4 = (253 * 96) / 25.4;

const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
let over = 0;
const samples = [];
for (let i = 0; i < chunks.length; i += 1) {
  if (/cover-page/.test(chunks[i])) continue;
  const doc = `<!DOCTYPE html><html><head><style>${style}</style></head><body><main class="sheet-root">${chunks[i]}</main></body></html>`;
  await page.setContent(doc, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("print");
  const info = await page.evaluate((limit) => {
    const el = document.querySelector(".page .dense");
    if (!el) return { ratio: 0, kids: 0 };
    return {
      ratio: el.getBoundingClientRect().height / limit,
      kids: el.children.length,
      text: el.innerText.replace(/\s+/g, "").slice(0, 40),
    };
  }, A4);
  if (info.ratio > 1.02) {
    over += 1;
    if (samples.length < 15) samples.push({ i: i + 1, ...info });
  }
}
await browser.close();
console.log(JSON.stringify({ logical: chunks.length, overflowLogical: over, samples }, null, 2));
