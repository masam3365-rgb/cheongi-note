/**
 * HTML 생성 → (필요 시 페이지별 print zoom 주입) → 크롬 전체 인쇄 PDF
 * → 표지·목차 총 페이지를 실제 인쇄 쪽수와 동기화.
 *
 * HTML을 크롬에서 "PDF로 저장"해도 표기 쪽수와 같도록, zoom을 HTML에 인라인으로 남긴다.
 */
import { PDFDocument } from "pdf-lib";
import { generateProductReportHtml } from "../../src/lib/productReportHtml.js";
import { htmlPagesToMergedPdf } from "./htmlPagesToPdf.mjs";

const A4_CONTENT_PX = (253 * 96) / 25.4;

function shownTotalPages(html) {
  const m =
    String(html || "").match(/전체\s*(\d+)\s*페이지/) ||
    String(html || "").match(/총\s*(\d+)\s*페이지/);
  return m ? Number(m[1]) : null;
}

function logicalPageCount(html) {
  return (String(html || "").match(/class="page[\s"]/g) || []).length;
}

/**
 * 각 논리 .page 높이를 재 크롬 인쇄용 zoom을 HTML에 인라인 주입
 * @param {import('puppeteer').Browser} browser
 * @param {string} html
 */
export async function injectPrintFitZoom(browser, html) {
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 300000 });
    await page.emulateMediaType("print");
    const zooms = await page.evaluate((limit) => {
      return [...document.querySelectorAll(".page")].map((el) => {
        if (/cover-page/.test(el.className)) return 1;
        const dense = el.querySelector(".dense") || el;
        const ratio = dense.getBoundingClientRect().height / limit;
        if (ratio > 1.01 && ratio <= 1.5) {
          return Math.max(0.86, Math.min(0.99, 0.98 / ratio));
        }
        return 1;
      });
    }, A4_CONTENT_PX);

    let idx = 0;
    const out = String(html).replace(/<div class="page([^"]*)"/g, (m, cls) => {
      const z = zooms[idx] ?? 1;
      idx += 1;
      if (!z || z >= 0.999) return m;
      // 기존 style 있으면 zoom만 갱신
      return `<div class="page${cls}" style="zoom:${z.toFixed(4)}"`;
    });
    return out;
  } finally {
    await page.close();
  }
}

/**
 * @param {import('puppeteer').Browser} browser
 * @param {string} html
 */
export async function chromePrintHtmlToPdf(browser, html) {
  const page = await browser.newPage();
  try {
    const running = `<div class="print-running-footer">천기노트 — 참고용 안내 자료</div>`;
    const hasRunning = /print-running-footer/.test(html);
    const doc = hasRunning ? html : String(html).replace(/<\/body>/i, `${running}</body>`);
    await page.setContent(doc, { waitUntil: "domcontentloaded", timeout: 300000 });
    await page.emulateMediaType("print");
    const buf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return buf;
  } finally {
    await page.close();
  }
}

/**
 * @param {import('puppeteer').Browser} browser
 * @param {object} reading
 * @param {object} [htmlOptions]
 * @param {{ preferMerged?: boolean }} [pdfOpts]
 */
export async function generateSyncedReportPdf(browser, reading, htmlOptions = {}, pdfOpts = {}) {
  // 기본: 논리 .page 단독 병합 PDF(빈 꼬리·쪽수 폭증 방지).
  // preferChromePrint=true 이면 크롬 전체인쇄(검수용).
  const useChrome = Boolean(pdfOpts.preferChromePrint);
  const useMerged = !useChrome;

  let html = generateProductReportHtml(reading, htmlOptions);
  if (useChrome) {
    html = await injectPrintFitZoom(browser, html);
  }

  const renderPdf = (docHtml) =>
    useMerged ? htmlPagesToMergedPdf(browser, docHtml) : chromePrintHtmlToPdf(browser, docHtml);

  let pdfBytes = await renderPdf(html);
  let pdfPages = (await PDFDocument.load(pdfBytes)).getPageCount();
  let logicalPages = logicalPageCount(html);
  let shown = shownTotalPages(html);
  let synced = shown === pdfPages;

  for (let pass = 0; pass < 3 && !synced; pass += 1) {
    html = generateProductReportHtml(reading, { ...htmlOptions, totalPagesOverride: pdfPages });
    if (!useMerged) {
      html = await injectPrintFitZoom(browser, html);
    }
    pdfBytes = await renderPdf(html);
    pdfPages = (await PDFDocument.load(pdfBytes)).getPageCount();
    logicalPages = logicalPageCount(html);
    shown = shownTotalPages(html);
    synced = shown === pdfPages;
  }

  return { html, pdfBytes, pdfPages, logicalPages, synced, shownTotal: shown };
}
