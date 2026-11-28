/**
 * 실제 PDF 기준 본문 점유율·하단 공백 검사
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
const fullCount = (await PDFDocument.load(fullPdf)).getPageCount();
const shortCount = (await PDFDocument.load(shortPdf)).getPageCount();

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
    const viewport = pg.getViewport({ scale: 1 });
    const tc = await pg.getTextContent();
    const items = tc.items.filter((it) => String(it.str || "").trim());
    let minY = Infinity;
    let maxY = -Infinity;
    let text = "";
    const pageH = viewport.height;
    const headerBand = pageH * 0.08; // top ~8%
    const footerBand = pageH * 0.08; // bottom ~8%
    for (const it of items) {
      const y = it.transform?.[5] ?? 0;
      const str = it.str || "";
      text += str;
      if (!str.trim()) continue;
      // pdf.js y: bottom-up. skip running header/footer bands
      const fromTop = pageH - y;
      if (fromTop < headerBand) continue;
      if (fromTop > pageH - footerBand) continue;
      if (/참고용\s*안내|천기노트\s*[—\-|]/.test(str) && str.length < 40) continue;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const compact = text.replace(/\s+/g, "");
    const body = compact
      .replace(/천기노트\|.*?맞춤리포트/g, "")
      .replace(/천기노트—참고용안내자료/g, "")
      .replace(/천기노트.*?참고용안내자료/g, "");
    // content from top: topY = pageH - maxY, bottom of content from top = pageH - minY
    const contentTop = Number.isFinite(maxY) ? pageH - maxY : 0;
    const contentBottom = Number.isFinite(minY) ? pageH - minY : 0;
    const contentSpan = Math.max(0, contentBottom - contentTop);
    const usable = pageH - headerBand - footerBand;
    const occupy = usable > 0 ? contentSpan / usable : 0;
    const bottomGap = Math.max(0, (pageH - footerBand - contentBottom) / pageH);
    const title =
      (compact.match(/제\d+부[^|]{0,24}|(\d{4}년(?:세운심층리포트|\d+~?\d*월운세))|目次|맺음|타고난|생활 속 실천|개인별 해석|흐름·주의/) || [])[0] ||
      body.slice(0, 28);
    pages.push({
      n,
      chars: body.length,
      occupy: Number(occupy.toFixed(3)),
      bottomGap: Number(bottomGap.toFixed(3)),
      title,
      looksLikeToc: /제1부/.test(compact) && /제10부/.test(compact),
      isCover: n === 1 && /천기노트/.test(compact) && /맞춤운세/.test(compact),
      yearTitle: (compact.match(/(\d{4})년세운심층리포트/) || [])[1] || null,
      monthTitle: (compact.match(/(\d{4}년\d+~?\d*월운세)/) || [])[1] || null,
    });
  }
  return pages;
}, b64);

const halfEmpty = analysis.filter((p) => p.n > 1 && !p.looksLikeToc && p.bottomGap >= 0.5);
const sparse60 = analysis.filter((p) => p.n > 1 && !p.looksLikeToc && p.bottomGap >= 0.6);
const lowOccupy = analysis.filter((p) => p.n > 1 && !p.isCover && !p.looksLikeToc && p.occupy < 0.45);

function causeOf(p) {
  if (p.yearTitle) return "연도별 세운(새 장 유지)";
  if (p.monthTitle) return "월별 묶음(새 장 유지)";
  if (/제\d+부/.test(p.title || "")) return "부 시작 장(새 장 유지)";
  if (p.chars < 80) return "도표/짧은 잔여";
  if (/맺음/.test(p.title || "")) return "맺음";
  return "일반 본문 희소(병합 대상)";
}

const report = {
  before: { full: 129, single: 17 },
  after: { full: fullCount, single: shortCount },
  halfEmptyCount: halfEmpty.length,
  sparse60Count: sparse60.length,
  lowOccupyCount: lowOccupy.length,
  halfEmpty: halfEmpty.map((p) => ({
    n: p.n,
    bottomGap: p.bottomGap,
    occupy: p.occupy,
    title: p.title,
    chars: p.chars,
    cause: causeOf(p),
  })),
  coverOk: analysis[0]?.isCover,
  tocOk: analysis.some((p) => p.looksLikeToc),
  yearOrphans: analysis.filter((p) => p.yearTitle && p.chars < 80).length,
};
writeFileSync(resolve(rasterDir, "occupancy-qa.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
await browser.close();
