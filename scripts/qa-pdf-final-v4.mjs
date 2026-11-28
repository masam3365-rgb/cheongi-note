/**
 * 최종 PDF QA: 표지·목차·세운·월운·빈쪽·맺음
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v4");
const rasterDir = resolve(outDir, "pdf-raster");
mkdirSync(rasterDir, { recursive: true });

const fullPdf = readFileSync(resolve(outDir, "full-layout.pdf"));
const shortPdf = readFileSync(resolve(outDir, "single-wealth-layout.pdf"));
const fullDoc = await PDFDocument.load(fullPdf);
const shortDoc = await PDFDocument.load(shortPdf);
const pageCount = fullDoc.getPageCount();
const shortCount = shortDoc.getPageCount();

const chrome = await resolveChromePath();
const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome || undefined,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const page = await browser.newPage();
await page.goto("about:blank");
await page.addScriptTag({
  url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
});
await page.evaluate(() => {
  // eslint-disable-next-line no-undef
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
});

const b64 = fullPdf.toString("base64");
const analysis = await page.evaluate(async (data) => {
  const raw = atob(data);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  // eslint-disable-next-line no-undef
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const pages = [];
  for (let n = 1; n <= doc.numPages; n += 1) {
    const pg = await doc.getPage(n);
    const tc = await pg.getTextContent();
    const text = tc.items.map((it) => it.str).join("");
    const compact = text.replace(/\s+/g, "");
    const body = compact
      .replace(/천기노트\|.*?맞춤리포트/g, "")
      .replace(/천기노트—참고용안내자료/g, "")
      .replace(/천기노트.*?참고용안내자료/g, "");
    pages.push({
      n,
      chars: body.length,
      textPreview: compact.slice(0, 140),
      hasCheongi: /천기노트/.test(compact),
      hasReportTitle: /맞춤운세|명리리포트/.test(compact),
      hasName: /이민수|李珉洙/.test(compact),
      hasDate: /\d{4}/.test(compact) && (/작성|년/.test(compact) || /\d{4}[.\-/년]/.test(compact)),
      looksLikeToc: /제1부/.test(compact) && /제10부/.test(compact),
      tocParts: (compact.match(/제\d+부/g) || []).length,
      yearTitle: (compact.match(/(\d{4})년세운심층리포트/) || [])[1] || null,
      monthTitle: (compact.match(/(\d{4}년\d+~?\d*월운세)/) || [])[1] || null,
    });
  }
  return { pageCount: doc.numPages, pages };
}, b64);

const renderPages = new Set([1, analysis.pageCount]);
for (const p of analysis.pages) {
  if (p.looksLikeToc) renderPages.add(p.n);
  if (p.yearTitle === "2026" || p.yearTitle === "2029" || p.yearTitle === "2035") renderPages.add(p.n);
  if (p.monthTitle && /1~2월|3~4월|11~12월/.test(p.monthTitle)) renderPages.add(p.n);
  if (p.chars < 20) renderPages.add(p.n);
}

for (const n of [...renderPages].sort((a, b) => a - b)) {
  const pngB64 = await page.evaluate(
    async (data, pageNum) => {
      const raw = atob(data);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
      // eslint-disable-next-line no-undef
      const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
      const pg = await doc.getPage(pageNum);
      const viewport = pg.getViewport({ scale: 1.15 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      document.body.innerHTML = "";
      document.body.appendChild(canvas);
      await pg.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      return canvas.toDataURL("image/png").split(",")[1];
    },
    b64,
    n,
  );
  writeFileSync(resolve(rasterDir, `final-${String(n).padStart(3, "0")}.png`), Buffer.from(pngB64, "base64"));
}

const emptyish = analysis.pages.filter((p) => p.chars < 20).map((p) => p.n);
const thin = analysis.pages
  .filter((p) => p.chars >= 20 && p.chars < 80)
  .map((p) => ({ n: p.n, chars: p.chars, preview: p.textPreview }));
const tocPages = analysis.pages.filter((p) => p.looksLikeToc);
const yearRows = analysis.pages
  .filter((p) => p.yearTitle)
  .map((p) => ({
    n: p.n,
    title: `${p.yearTitle}년 세운 심층 리포트`,
    chars: p.chars,
    orphan: p.chars < 80,
  }));
const monthSample = analysis.pages
  .filter((p) => p.monthTitle)
  .map((p) => ({ n: p.n, title: p.monthTitle, chars: p.chars }));
const cover = analysis.pages[0];
const closing = analysis.pages[analysis.pages.length - 1];

const qa = {
  before: { full: 132, single: 17 },
  after: { full: pageCount, single: shortCount },
  cover: {
    page: 1,
    hasCheongi: cover.hasCheongi,
    hasReportTitle: cover.hasReportTitle,
    hasName: cover.hasName,
    hasDate: cover.hasDate,
    preview: cover.textPreview,
  },
  toc: {
    pages: tocPages.map((p) => p.n),
    allPartsOnOnePage: tocPages.length === 1 && (tocPages[0]?.tocParts || 0) >= 10,
    partCount: tocPages[0]?.tocParts || 0,
  },
  years: yearRows,
  yearOrphans: yearRows.filter((y) => y.orphan).length,
  months: monthSample,
  closing: { page: closing.n, chars: closing.chars, preview: closing.textPreview.slice(0, 120) },
  emptyish,
  thin,
};
writeFileSync(resolve(rasterDir, "final-qa.json"), JSON.stringify(qa, null, 2), "utf8");
console.log(JSON.stringify(qa, null, 2));
await browser.close();
