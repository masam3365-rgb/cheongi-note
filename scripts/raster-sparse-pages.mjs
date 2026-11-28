/** 하단 공백 의심 PDF 쪽을 래스터로 저장해 시각 검사용 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v4/sparse-check");
mkdirSync(outDir, { recursive: true });
const pdf = readFileSync(resolve(__dirname, "../output/paid-report-layout-v4/full-layout.pdf"));
const targets = [3, 4, 5, 6, 25, 37, 50, 62, 85, 96];

const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1.5 });
await page.goto("about:blank");
await page.addScriptTag({
  url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
});
await page.evaluate(() => {
  // eslint-disable-next-line no-undef
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
});

const b64 = pdf.toString("base64");
for (const n of targets) {
  const dataUrl = await page.evaluate(async (data, pageNo) => {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    // eslint-disable-next-line no-undef
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    const pg = await doc.getPage(pageNo);
    const viewport = pg.getViewport({ scale: 1.6 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await pg.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/png");
  }, b64, n);
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  const path = resolve(outDir, `page-${String(n).padStart(3, "0")}.png`);
  writeFileSync(path, buf);
  console.log("wrote", path, buf.length);
}
await browser.close();
