/**
 * 판매자 PC 전용 — 유료 보고서 생성 코어 (로컬만, 외부 전송 없음)
 */
import { mkdir, writeFile, rm, readdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { createReading } from "../../src/lib/reading.js";
import { generateProductReportHtml } from "../../src/lib/productReportHtml.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "../..");
export const SELLER_OUT_ROOT = path.join(ROOT, "output", "seller-orders");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

export function sanitizeOrderId(raw) {
  const id = String(raw || "")
    .trim()
    .replace(/[^\w\-가-힣]/g, "")
    .slice(0, 48);
  if (!id) throw new Error("주문번호가 비어 있거나 사용할 수 없는 문자만 있습니다.");
  return id;
}

export function buildFormFromInput(input) {
  const year = Number(input.year);
  const month = Number(input.month);
  const day = Number(input.day);
  const hour = input.unknownTime || input.hour === "" || input.hour == null ? 12 : Number(input.hour);
  const minute = input.unknownTime || input.minute === "" || input.minute == null ? 0 : Number(input.minute);
  const surname = String(input.surname ?? "").trim() || "고";
  const given = String(input.given ?? "").trim() || "객";
  const gender = input.gender === "female" || input.gender === "여" ? "female" : "male";
  const calendar = input.calendar === "lunar" || input.calendar === "음력" ? "lunar" : "solar";

  if (!Number.isFinite(year) || year < 1900 || year > 2100) throw new Error("출생 연도가 올바르지 않습니다.");
  if (!Number.isFinite(month) || month < 1 || month > 12) throw new Error("출생 월이 올바르지 않습니다.");
  if (!Number.isFinite(day) || day < 1 || day > 31) throw new Error("출생 일이 올바르지 않습니다.");

  return {
    surname,
    given,
    gender,
    calendar,
    year,
    month,
    day,
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
    unknownTime: Boolean(input.unknownTime),
    yaja: Boolean(input.yaja),
    status: input.status === "married" || input.status === "기혼" ? "married" : "single",
    role: input.role === "owner" || input.role === "사업" ? "owner" : "employee",
  };
}

export function productMode(product) {
  const p = String(product || "full").toLowerCase();
  if (p === "single" || p === "단품") return { mode: "single", topicId: "wealth", label: "단품" };
  if (p === "triple" || p === "3종") {
    return { mode: "triple", selected: ["wealth", "career", "marriage"], label: "3종맞춤" };
  }
  return { mode: "full", selected: null, label: "풀패키지" };
}

export function anonymousFileBase(orderId, productLabel) {
  const safeOrder = sanitizeOrderId(orderId);
  const safeLabel = String(productLabel || "리포트")
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "")
    .slice(0, 24);
  return `달빛사주-${safeLabel}-${safeOrder}`;
}

export async function resolveChromePath() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* next */
    }
  }
  return null;
}

/**
 * @returns {Promise<{
 *  orderId: string,
 *  outDir: string,
 *  htmlPath: string,
 *  pdfPath: string|null,
 *  pillars: string,
 *  displayName: string,
 *  pages: number,
 *  metaPath: string
 * }>}
 */
export async function generateSellerReport(input, options = {}) {
  const orderId = sanitizeOrderId(input.orderId || input.order);
  const form = buildFormFromInput(input);
  const prod = productMode(input.product);
  const reading = createReading(form);
  const htmlOptions =
    prod.mode === "full"
      ? { mode: "full" }
      : prod.mode === "triple"
        ? { mode: "triple", selected: prod.selected }
        : { mode: "single", topicId: input.topicId || prod.topicId || "wealth", selected: [input.topicId || "wealth"] };

  const html = generateProductReportHtml(reading, htmlOptions);
  const pages = (html.match(/class="page[\s"]/g) || []).length;
  const pillars = (reading.chart?.pillars || []).map((p) => p.gzKo).join("|");

  const outDir = path.join(SELLER_OUT_ROOT, orderId);
  await mkdir(outDir, { recursive: true });
  const base = anonymousFileBase(orderId, prod.label);
  const htmlPath = path.join(outDir, `${base}.html`);
  const pdfPath = path.join(outDir, `${base}.pdf`);
  const metaPath = path.join(outDir, `meta.json`);

  await writeFile(htmlPath, html, "utf8");

  // meta에는 최소 운영 정보만 — 생년월일 전문은 넣지 않음(삭제 용이)
  const meta = {
    orderId,
    createdAt: new Date().toISOString(),
    product: prod.label,
    mode: prod.mode,
    pages,
    pillars,
    displayNameInBody: reading.displayName,
    birthHint: `${form.calendar}:${form.year}-${form.month}-${form.day}`,
    gender: form.gender,
    files: { html: path.basename(htmlPath), pdf: options.htmlOnly ? null : path.basename(pdfPath) },
    note: "판매자 로컬 전용. 외부 서버 전송 없음. 전달 후 seller-purge로 폴더 삭제 권장.",
  };
  await writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");

  let wrotePdf = null;
  if (!options.htmlOnly) {
    const chrome = await resolveChromePath();
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chrome || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0", timeout: 300000 });
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
      wrotePdf = pdfPath;
    } finally {
      await browser.close();
    }
  }

  return {
    orderId,
    outDir,
    htmlPath,
    pdfPath: wrotePdf,
    pillars,
    displayName: reading.displayName,
    pages,
    metaPath,
  };
}

export async function purgeSellerOrder(orderId) {
  const id = sanitizeOrderId(orderId);
  const dir = path.join(SELLER_OUT_ROOT, id);
  await rm(dir, { recursive: true, force: true });
  return { orderId: id, deleted: dir };
}

export async function listSellerOrders() {
  try {
    await access(SELLER_OUT_ROOT);
  } catch {
    return [];
  }
  const names = await readdir(SELLER_OUT_ROOT, { withFileTypes: true });
  return names.filter((d) => d.isDirectory()).map((d) => d.name);
}
