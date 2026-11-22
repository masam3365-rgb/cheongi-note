/**
 * 관리자·판매자 공통 — 유료 보고서 HTML (디스크에 고객정보 저장하지 않음)
 * Puppeteer는 동적 import — Vercel HTML API 번들에 포함되지 않음
 */
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { buildFormFromInput, productMode } from "./reportInput.mjs";

function pickSelected(input, fallback) {
  if (Array.isArray(input.selected) && input.selected.length) {
    return input.selected.map(String);
  }
  return fallback;
}

export function buildPaidReport(input) {
  const form = buildFormFromInput(input);
  const prod = productMode(input.product);
  const reading = createReading(form);
  const customSelected = pickSelected(input, prod.selected || ["wealth", "career", "marriage"]);
  const topicId = String(input.topicId || customSelected[0] || prod.topicId || "wealth");

  const htmlOptions =
    prod.mode === "full"
      ? { mode: "full" }
      : prod.mode === "triple"
        ? { mode: "triple", selected: customSelected.slice(0, 3) }
        : {
            mode: "single",
            topicId,
            selected: [topicId],
          };

  const html = generateProductReportHtml(reading, htmlOptions);
  const pages = (html.match(/class="page[\s"]/g) || []).length;
  const pillars = (reading.chart?.pillars || []).map((p) => p.gzKo).join("|");
  const selectedLabel =
    prod.mode === "full"
      ? prod.label
      : prod.mode === "triple"
        ? `${prod.label}(${customSelected.slice(0, 3).join("+")})`
        : `${prod.label}(${topicId})`;

  return {
    html,
    pages,
    pillars,
    displayName: reading.displayName,
    productLabel: selectedLabel,
    mode: prod.mode,
    selected: prod.mode === "full" ? null : prod.mode === "triple" ? customSelected.slice(0, 3) : [topicId],
  };
}

/**
 * Puppeteer PDF (로컬 전용 옵션). Vercel/Vite 기본 경로에서는 호출하지 않음.
 * @returns {Promise<Buffer>}
 */
export async function renderReportPdfBuffer(html) {
  const puppeteer = (await import("puppeteer")).default;
  const { resolveChromePath } = await import("../scripts/lib/sellerReportCore.mjs");
  const chrome = await resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 300000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
