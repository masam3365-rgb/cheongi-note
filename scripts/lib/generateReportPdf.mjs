/**
 * HTML 생성 → PDF → 실제 쪽수를 표지·목차에 반영(최대 2패스)
 */
import { PDFDocument } from "pdf-lib";
import { generateProductReportHtml } from "../../src/lib/productReportHtml.js";
import { htmlPagesToMergedPdf } from "./htmlPagesToPdf.mjs";

function shownTotalPages(html) {
  const m =
    String(html || "").match(/전체\s*(\d+)\s*페이지/) ||
    String(html || "").match(/총\s*(\d+)\s*페이지/);
  return m ? Number(m[1]) : null;
}

/**
 * @param {import('puppeteer').Browser} browser
 * @param {object} reading
 * @param {object} [htmlOptions]
 * @returns {Promise<{ html: string, pdfBytes: Uint8Array, pdfPages: number, logicalPages: number, synced: boolean }>}
 */
export async function generateSyncedReportPdf(browser, reading, htmlOptions = {}) {
  let html = generateProductReportHtml(reading, htmlOptions);
  let pdfBytes = await htmlPagesToMergedPdf(browser, html);
  let pdfPages = (await PDFDocument.load(pdfBytes)).getPageCount();
  let logicalPages = (html.match(/class="page[\s"]/g) || []).length;
  let shown = shownTotalPages(html);
  let synced = shown === pdfPages;

  if (!synced) {
    html = generateProductReportHtml(reading, { ...htmlOptions, totalPagesOverride: pdfPages });
    pdfBytes = await htmlPagesToMergedPdf(browser, html);
    pdfPages = (await PDFDocument.load(pdfBytes)).getPageCount();
    logicalPages = (html.match(/class="page[\s"]/g) || []).length;
    shown = shownTotalPages(html);
    synced = shown === pdfPages;
    // 쪽수 스탬프가 레이아웃을 미세하게 바꿀 때 한 번 더
    if (!synced) {
      html = generateProductReportHtml(reading, { ...htmlOptions, totalPagesOverride: pdfPages });
      pdfBytes = await htmlPagesToMergedPdf(browser, html);
      pdfPages = (await PDFDocument.load(pdfBytes)).getPageCount();
      shown = shownTotalPages(html);
      synced = shown === pdfPages;
    }
  }

  return { html, pdfBytes, pdfPages, logicalPages, synced, shownTotal: shown };
}
