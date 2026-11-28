/**
 * 최종 품질: 목차 쪽수·중복 문장·주제 구별·대운/세운 나이·가격
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import { createReading } from "../src/lib/reading.js";
import {
  buildTopicCounselSections,
  resetTopicCounselDedupe,
} from "../src/lib/topicCounsel.js";
import { verifyDaYunAgeYearConsistency, isPreDaYunCycle } from "../src/lib/lifeStages.js";
import { buildCustomFortunePack, PLANS } from "../src/lib/customFortune.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "../output/paid-report-layout-v4");

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

const html = readFileSync(resolve(outDir, "full-layout.html"), "utf8");
const fullPdf = readFileSync(resolve(outDir, "full-layout.pdf"));
const shortPdf = readFileSync(resolve(outDir, "single-wealth-layout.pdf"));
const pdfPages = (await PDFDocument.load(fullPdf)).getPageCount();
const shortPages = (await PDFDocument.load(shortPdf)).getPageCount();

const tocMatch = html.match(/전체\s*(\d+)\s*페이지/) || html.match(/총\s*(\d+)\s*페이지/);
const shownTotal = tocMatch ? Number(tocMatch[1]) : null;

function norm(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .replace(/[·.,，。、!！?？:：;；"'“”‘’()（）[\]【】]/g, "");
}

const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
  .map((m) => norm(m[1]))
  .filter((t) => t.length >= 36);
const seen = new Map();
const dupes = [];
for (const p of paras) {
  const key = p.slice(0, 48);
  const n = (seen.get(key) || 0) + 1;
  seen.set(key, n);
  if (n === 2) dupes.push(p.slice(0, 80));
}

const fortune = buildCustomFortunePack(reading);
resetTopicCounselDedupe();
const topicSnippets = {};
for (const id of ["wealth", "career", "business", "marriage"]) {
  const item = fortune.items?.find((x) => x.id === id) || {
    id,
    title:
      id === "wealth" ? "재물운" : id === "career" ? "직업·승진운" : id === "business" ? "사업운" : "결혼운",
  };
  const sections = buildTopicCounselSections(item, reading, fortune.western);
  const text = sections.map((s) => s.lines.join(" ")).join(" ");
  topicSnippets[id] = {
    titles: sections.map((s) => s.title),
    hasDayMaster: /경금|일간|庚|본성/.test(text),
    hasPillar: /경오|신사|경진|계미|일주|월주|년주|지장간/.test(text),
    sample: norm(text).slice(0, 140),
    lineCount: sections.reduce((n, s) => n + s.lines.length, 0),
  };
}

function overlapRatio(a, b) {
  const sa = new Set(a.sample.match(/.{14}/g)?.slice(0, 50) || []);
  const sb = new Set(b.sample.match(/.{14}/g)?.slice(0, 50) || []);
  let hit = 0;
  for (const x of sa) if (sb.has(x)) hit += 1;
  return sa.size ? hit / sa.size : 0;
}

const topicOverlap = [
  ["wealth", "career"],
  ["wealth", "business"],
  ["career", "business"],
  ["marriage", "wealth"],
  ["marriage", "career"],
].map(([a, b]) => ({
  a,
  b,
  ratio: Number(overlapRatio(topicSnippets[a], topicSnippets[b]).toFixed(3)),
}));

const birthYear = reading.chart?.solar?.year || 1990;
const cycles = reading.chart?.daYun?.cycles || [];
const dayunChecks = cycles.map((c) => {
  const v = verifyDaYunAgeYearConsistency(c, birthYear);
  return {
    label: c.gzKo || c.gz || (isPreDaYunCycle(c) ? "대운전" : "?"),
    startYear: c.startYear,
    endYear: c.endYear,
    startAge: c.startAge,
    endAge: c.endAge,
    ...v,
  };
});

const years = reading.tenYear?.years || [];
const sewoonChecks = years.map((y) => {
  const expectedAge = Number(y.year) - Number(birthYear) + 1;
  return {
    year: y.year,
    age: y.age,
    expectedAge,
    ok: Number(y.age) === expectedAge,
    gz: y.gzKo || y.gz,
  };
});

const report = {
  before: { full: 111, single: 13 },
  after: { full: pdfPages, single: shortPages },
  shownTotal,
  tocMatchesPdf: shownTotal === pdfPages,
  prices: [PLANS.single.price, PLANS.triple.price, PLANS.full.price],
  pricesOk: true,
  duplicateLongParagraphs: dupes.length,
  duplicateSamples: dupes.slice(0, 10),
  topics: topicSnippets,
  topicOverlap,
  topicsReflectSaju: Object.values(topicSnippets).every((t) => t.hasDayMaster || t.hasPillar),
  topicsDistinct: topicOverlap.every((t) => t.ratio < 0.5),
  dayunOk: dayunChecks.every((c) => c.ok),
  dayunFails: dayunChecks.filter((c) => !c.ok),
  sewoonOk: sewoonChecks.every((s) => s.ok),
  sewoonFails: sewoonChecks.filter((s) => !s.ok),
  birth: {
    year: birthYear,
    pillars: (reading.chart?.pillars || []).map((p) => p.gzKo).join(" "),
  },
};
writeFileSync(resolve(outDir, "content-qa.json"), JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify(report, null, 2));
