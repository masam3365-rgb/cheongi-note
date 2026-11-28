/**
 * 107쪽 백업 대비 현재 HTML/PDF의 분석 항목·연도·주제 누락 검사
 * (분석 결과 임의 삭제가 아닌 레이아웃 압축만 허용)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";

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

const html = generateProductReportHtml(reading, { mode: "full" });
const body = html.replace(/<style[\s\S]*?<\/style>/gi, "");

function markers(text) {
  const t = String(text || "");
  return {
    parts: [...t.matchAll(/제([1-9]|10)부/g)].map((m) => m[0]),
    sewoonYears: [...t.matchAll(/(\d{4})년\s*세운\s*심층/g)].map((m) => Number(m[1])),
    monthGroups: [...t.matchAll(/(\d{4}년\s*\d+\s*[~～\-–]\s*\d+\s*월\s*운세)/g)].map((m) => m[1].replace(/\s+/g, "")),
    topics: ["재물", "직업", "사업", "결혼", "궁합", "자녀", "건강", "이사", "여행"].filter((k) =>
      t.includes(k),
    ),
    dayun: /평생\s*대운|대운\s*상세/.test(t),
    glossary: /핵심\s*용어|12운성|신살/.test(t),
    closing: /맺음/.test(t),
    pricesMention: false,
  };
}

const now = markers(body);
const expectedYears = (reading.tenYear?.years || []).map((y) => y.year);
const missingYears = expectedYears.filter((y) => !now.sewoonYears.includes(y));
const uniqueParts = [...new Set(now.parts)];

/** 반복 문장(동일 문단 3회+) — 분석 삭제가 아니라 중복만 보고 */
const paras = [...body.matchAll(/<p[^>]*>([^<]{40,220})<\/p>/g)].map((m) => m[1].replace(/\s+/g, " ").trim());
const freq = new Map();
for (const p of paras) freq.set(p, (freq.get(p) || 0) + 1);
const heavyDupes = [...freq.entries()]
  .filter(([, n]) => n >= 4)
  .map(([text, n]) => ({ n, text: text.slice(0, 80) }))
  .slice(0, 12);

/** 백업 PDF 텍스트와 현재 PDF 텍스트의 핵심 토큰 비교 */
async function pdfText(path) {
  if (!existsSync(path)) return null;
  const buf = readFileSync(path);
  const chrome = await resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
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
  const text = await page.evaluate(async (data) => {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    // eslint-disable-next-line no-undef
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    let all = "";
    for (let n = 1; n <= doc.numPages; n += 1) {
      const pg = await doc.getPage(n);
      const tc = await pg.getTextContent();
      all += tc.items.map((it) => it.str).join("") + "\n";
    }
    return all;
  }, buf.toString("base64"));
  const count = (await PDFDocument.load(buf)).getPageCount();
  await browser.close();
  return { text, count };
}

const backupCandidates = [
  resolve(__dirname, "../output/paid-report-layout-v4-backup-fill-20261128-222907/full-layout.pdf"),
  resolve(__dirname, "../output/paid-report-qa-backup-20261128-231205/full-layout.pdf"),
];
const backupPath = backupCandidates.find((p) => existsSync(p));
const currentPath = resolve(outDir, "full-layout.pdf");

let pdfCompare = null;
if (backupPath && existsSync(currentPath)) {
  const before = await pdfText(backupPath);
  const after = await pdfText(currentPath);
  const beforeM = markers(before.text);
  const afterM = markers(after.text);
  const lostYears = beforeM.sewoonYears.filter((y) => !afterM.sewoonYears.includes(y));
  const lostTopics = beforeM.topics.filter((t) => !afterM.topics.includes(t));
  pdfCompare = {
    beforePages: before.count,
    afterPages: after.count,
    beforeYears: beforeM.sewoonYears,
    afterYears: afterM.sewoonYears,
    lostYears,
    lostTopics,
    beforeParts: [...new Set(beforeM.parts)],
    afterParts: [...new Set(afterM.parts)],
  };
}

const report = {
  html: {
    uniqueParts,
    sewoonYears: now.sewoonYears,
    missingYears,
    monthGroupCount: now.monthGroups.length,
    topics: now.topics,
    dayun: now.dayun,
    glossary: now.glossary,
    closing: now.closing,
    heavyDupes,
  },
  pdfCompare,
  ok:
    missingYears.length === 0 &&
    uniqueParts.length >= 8 &&
    now.dayun &&
    now.glossary &&
    now.closing &&
    (!pdfCompare || (pdfCompare.lostYears.length === 0 && pdfCompare.lostTopics.length === 0)),
};

writeFileSync(resolve(outDir, "qa-content-coverage.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
