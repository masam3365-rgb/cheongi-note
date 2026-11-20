/**
 * 사용법:
 *   node scripts/export-pdf.mjs
 *   node scripts/export-pdf.mjs --year 2027 --out ./output/report.pdf
 *
 * 브라우저에서 저장한 reading JSON이 있으면:
 *   node scripts/export-pdf.mjs --input ./reading.json
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { createReading } from "../src/lib/reading.js";
import { readingToReportHtml } from "../src/lib/reportHtml.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function arg(name, fallback = "") {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const sampleForm = {
  surname: "김",
  given: "민수",
  gender: "male",
  calendar: "solar",
  year: 1990,
  month: 5,
  day: 15,
  hour: 12,
  minute: 0,
  unknownTime: false,
  status: "single",
  role: "employee",
  yaja: false,
};

async function main() {
  const year = Number(arg("year", String(new Date().getFullYear())));
  const inputPath = arg("input");
  const outPath = path.resolve(root, arg("out", `output/${year}-dalbit-report.pdf`));
  const htmlOnly = hasFlag("html-only");

  let reading;
  if (inputPath) {
    const raw = JSON.parse(await readFile(path.resolve(root, inputPath), "utf8"));
    reading = raw.chart && raw.forecast ? raw : createReading(raw);
  } else {
    reading = createReading(sampleForm);
  }

  const html = readingToReportHtml(reading, { year });
  await mkdir(path.dirname(outPath), { recursive: true });

  const htmlPath = outPath.replace(/\.pdf$/i, ".html");
  await writeFile(htmlPath, html, "utf8");
  console.log(`HTML 저장: ${htmlPath}`);

  if (htmlOnly) return;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
    });
    console.log(`PDF 저장: ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
