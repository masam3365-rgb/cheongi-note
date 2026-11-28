import { buildCustomFortunePack } from "./customFortune.js";
import { buildWesternAstrology } from "./westernAstrology.js";
import {
  DISHI_GLOSS,
  SHENSHA_GLOSS,
  TEN_GOD_GLOSS,
  WUXING_GUIDE,
  annotateMyungri,
  collectChartTerms,
  dayMasterPhrase,
  elementPhrase,
  favorBundlePhrase,
  resetPlainTermsState,
  strengthPhrase,
  termChip,
  termSummaryLine,
  topicEvidenceGuide,
} from "./plainTerms.js";
import { buildCareerPlaybook, buildRemedyGuide } from "./careerRemedyGuide.js";
import { buildDaYunLifeFlow } from "./flowCopy.js";
import { BRANCH_ELEMENT, STEM_ELEMENT, koGz, mainStem, tenGod } from "./ganzhi.js";
import {
  LIFE_STAGE_CRITERIA_TEXT,
  daYunDetailTitle,
  decadeAdviceForCycle,
  displayDaYunLabel,
  isPreDaYunCycle,
  lifeStagesOverlappingCycle,
  phasesOfCycles,
} from "./lifeStages.js";
import { buildTopicCounselSections, resetTopicCounselDedupe } from "./topicCounsel.js";
import {
  balanceWrappedPages,
  createVisualBank,
  estimateBodyWeight,
  mergeSparseBodies as mergeSparseBodyList,
} from "./pageBalance.js";
import {
  svgDaYunTimeline,
  svgMonthFlowBars,
  svgMonthThemeBars,
  svgOrnamentLandscape,
  svgOrnamentWave,
  svgShiShenBars,
  svgTenYearFlow,
  svgWuxingBalance,
} from "./reportVisuals.js";

function fortunePack(reading) {
  return buildCustomFortunePack(reading);
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 본문 문단 — 주제별 오행·십신·12운성·신살 괄호 풀이 포함 */
function p(text, options = {}) {
  return `<p>${esc(annotateMyungri(text, options))}</p>`;
}

function withTopic(topic) {
  return (text, options = {}) => p(text, { topic, ...options });
}

function renderFieldBlocks(fields, topic = "career") {
  return (fields || [])
    .map(
      (f) => `<div class="job-block">
      <h4>【${esc(f.name)}】 <span class="quiet">${esc(elementPhrase(f.element, topic))}</span></h4>
      <p class="jobs">${esc((f.jobs || []).join(" · "))}</p>
    </div>`,
    )
    .join("");
}

function renderRemedyCompareTable(rows) {
  const body = (rows || [])
    .map(
      (r) => `<tr>
      <td class="lbl">${esc(r.label)}</td>
      <td class="good">${esc(r.good)}</td>
      <td class="bad">${esc(r.bad)}</td>
    </tr>`,
    )
    .join("");
  return `<div class="table-wrap"><table class="compare-table">
    <thead><tr><th>구분</th><th>좋은 영향을 주는 것 (용신·희신 보강)</th><th>피하거나 줄여야 할 것 (기신 절제)</th></tr></thead>
    <tbody>${body}</tbody>
  </table></div>`;
}

function buildCareerGuidePages(reading, partLabel) {
  const chart = reading.chart;
  const play = buildCareerPlaybook(chart);
  const pt = withTopic("career");
  const pages = [];

  // 지침서·차선·전공을 과밀 없이 나누되, 전공 팁이 혼자 희소 페이지가 되지 않게 차선 장에 붙임
  pages.push(
    sectionBlocks(`${partLabel} · 진로 지침서`, "진로", [
      `<div class="evidence"><h3>명리학적 근거 요약</h3>
      ${pt(play.primaryIntro)}
      ${pt(topicEvidenceGuide("career"))}
    </div>`,
      card("1순위 · 최상위 적성 분야와 현대 추천 직종", renderFieldBlocks(play.primaryFields)),
      card(
        "읽는 법",
        pt(
          "위 직종은 2026년 산업 기준으로 정리한 목록입니다. 한 분야를 고른 뒤, 그 안의 직종 2~3개만 포트폴리오·자격·인턴 후보로 좁히면 실행이 빨라집니다.",
        ),
      ),
    ]),
  );
  pages.push(
    sectionBlocks(`${partLabel} · 진로 차선·전공`, "진로", [
      `<div class="evidence"><h3>차선책 안내</h3>${pt(play.secondaryIntro)}</div>`,
      card("2순위 · 안정 성취 직종 (중위급)", renderFieldBlocks(play.secondaryFields)),
      card("대학 전공 선택 팁", pt(play.majorTipText)),
      card(
        "한 줄 실천",
        pt(
          `이번 주, 1순위 분야 중 하나와 차선 분야 중 하나를 고르고 ‘관심 직종 3개’만 메모하세요. 사회 태도(월주) ${chart.monthGod || "—"} 결도 함께 보세요.`,
        ),
      ),
    ]),
  );

  return mergeSparseBodies(pages, 900);
}

function card(title, body) {
  const heading = title ? `<h3>${esc(title)}</h3>` : "";
  const raw = String(body || "");
  const first = raw.match(/^(\s*<p[\s\S]*?<\/p>)/);
  // 제목+첫 문단만 keep — 카드 전체를 avoid하면 쪽 넘침·공백이 커짐
  if (heading && first) {
    return `<div class="card"><div class="card-keep">${heading}${first[1]}</div><div class="card-body">${raw.slice(first[0].length)}</div></div>`;
  }
  if (heading) {
    return `<div class="card"><div class="card-keep">${heading}</div><div class="card-body">${raw}</div></div>`;
  }
  return `<div class="card"><div class="card-body">${raw}</div></div>`;
}

/** 제목·본문을 한 덩어리로 — 맺음/시작 안내처럼 줄 겹침·고립을 막음 */
function solidCard(title, body, extraClass = "") {
  const cls = ["card", "solid-card", extraClass].filter(Boolean).join(" ");
  const heading = title ? `<h3>${esc(title)}</h3>` : "";
  return `<div class="${cls}">${heading}<div class="card-body">${body || ""}</div></div>`;
}

/** 표 제목과 표를 한 덩어리로 — 인쇄 시 제목만 남지 않게 */
function tableBlock(caption, tableHtml) {
  const cap = caption ? `<div class="table-caption">${esc(caption)}</div>` : "";
  return `<div class="table-block">${cap}${tableHtml}</div>`;
}

/** 제목 + 본문 블록. 모든 섹션 공통 — 제목은 반드시 첫 내용과 한 덩어리(고립 제목 금지) */
function sectionBlocks(title, num, blocks) {
  const list = (blocks || []).filter(Boolean);
  if (!list.length) return keepHead(title, num, "");
  // 첫 블록이 작으면 둘째까지 묶어 제목만 남는 일을 더 줄임
  if (list.length >= 2 && bodyWeight(list[0]) < 360) {
    const pair = `${list[0]}${list[1]}`;
    if (bodyWeight(pair) <= 680) {
      return `${keepHead(title, num, pair)}${list.slice(2).join("")}`;
    }
  }
  // 첫 블록이 커도 제목+첫 블록은 keep — 과대 시 Chromium이 쪼개더라도 제목만 앞장에 남지 않게 CSS break-after:avoid 병행
  return `${keepHead(title, num, list[0])}${list.slice(1).join("")}`;
}

function footer(n) {
  return `<div class="footer">천기노트 — 참고용 안내 자료 &nbsp;|&nbsp; ${n}</div>`;
}

function bodyWeight(html) {
  return estimateBodyWeight(html);
}

/** 내용이 적은 인접 페이지를 자연스럽게 합침(빈 공간 패딩·문장 복붙 없음) */
function mergeSparseBodies(bodies, softLimit = 980) {
  return mergeSparseBodyList(bodies, softLimit);
}

/** 가중치 기준으로 묶어 한 장에 배치 */
function packBodies(bodies, perPage = 2, softLimit = 1100) {
  const list = (bodies || []).filter((b) => b && String(b).trim());
  const out = [];
  let merged = "";
  let count = 0;
  for (const body of list) {
    if (!merged) {
      merged = body;
      count = 1;
      continue;
    }
    if (count >= perPage || bodyWeight(merged) + bodyWeight(body) > softLimit) {
      out.push(merged);
      merged = body;
      count = 1;
    } else {
      merged = `${merged}\n<hr class="rule" />\n${body}`;
      count += 1;
    }
  }
  if (merged) out.push(merged);
  return out;
}

function counselCard(title, lines, pt) {
  // 주제 6단 구조는 전역 문장 중복제거(takeFreshLine)로 지우지 않음 — 주제 안 unique만 적용
  const paras = uniqueParagraphs(lines || []).map((line) => pt(String(line))).filter(Boolean);
  if (!paras.length) return "";
  // 제목 + 첫 1~2문단만 keep
  const keepN = Math.min(2, paras.length);
  const headParas = paras.slice(0, keepN).join("");
  const restParas = paras.slice(keepN).join("");
  return `<div class="card counsel"><div class="card-keep"><h3>${esc(title)}</h3>${headParas}</div>${restParas ? `<div class="card-body">${restParas}</div>` : ""}</div>`;
}

/** 표지·목차·안내의 쪽수 자리표시자 + 바닥글 번호 + 마지막 쪽 break 해제
 * @param {string[]} pageHtmlList
 * @param {number} [totalOverride] 실제 PDF 쪽수(논리 .page 수와 다를 때)
 */
function finalizePageList(pageHtmlList, totalOverride) {
  const logical = pageHtmlList.length;
  const total =
    totalOverride != null && Number.isFinite(Number(totalOverride)) && Number(totalOverride) > 0
      ? Number(totalOverride)
      : logical;
  return pageHtmlList.map((html, idx) => {
    let out = String(html).replace(/__TOTAL_PAGES__/g, String(total));
    out = out.replace(/(천기노트 — 참고용 안내 자료 &nbsp;\|&nbsp; )\d+/g, `$1${idx + 1}`);
    if (idx === logical - 1) {
      out = out.replace(/class="page([^"]*)"/, (m, cls) =>
        /\blast-page\b/.test(cls) ? m : `class="page${cls} last-page"`,
      );
    }
    return out;
  });
}

function reportHeader(reading) {
  return `<div class="report-header">천기노트 | ${esc(reading.displayName)}님 맞춤 리포트</div>`;
}

function formatReportDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

const WX_COLOR = {
  목: { bg: "#e8f5e9", fg: "#1b5e20", border: "#66bb6a", label: "木" },
  화: { bg: "#ffebee", fg: "#8b0000", border: "#e57373", label: "火" },
  토: { bg: "#fff8e1", fg: "#7a4f01", border: "#ffb74d", label: "土" },
  금: { bg: "#f5f5f5", fg: "#424242", border: "#c9a227", label: "金" },
  수: { bg: "#e3f2fd", fg: "#0d47a1", border: "#64b5f6", label: "水" },
};

const STYLES = `
/* 상·하 안전 여백 — 제목 잘림·고정 바닥글 겹침 방지 */
@page { size: A4 portrait; margin: 16mm 14mm 28mm 14mm; }
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
  box-sizing: border-box;
}
html, body {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Batang', serif;
  margin: 0;
  color: #2a2420;
  background: #f7f1e6;
  font-size: 12.5pt;
  line-height: 1.6;
  word-break: keep-all;
  overflow-wrap: break-word;
}
p {
  orphans: 4;
  widows: 4;
  margin: 0 0 0.5em;
  break-inside: auto;
  page-break-inside: auto;
}
.page {
  width: 100%;
  min-height: 0;
  padding: 0 0 4mm;
  position: relative;
  background: #f7f1e6;
  page-break-after: always;
  break-after: page;
}
/* footer도 div라 :last-of-type 사용 금지 — sheet-root 마지막 .page만 해제 */
.sheet-root > .page:last-child,
.page.last-page {
  page-break-after: auto;
  break-after: auto;
}
.page.cover-page {
  padding: 0;
  min-height: 0;
}
.page.flow { page-break-inside: auto; }
/* 제목+첫 블록만 묶음 — 과대 keep은 Chromium이 무시하며 고립 제목을 만듦 */
.keep-block {
  break-inside: avoid;
  page-break-inside: avoid;
  break-after: auto;
}
.keep-block > .section-head {
  break-after: avoid;
  page-break-after: avoid;
}
.keep-block > .section-head + * {
  break-before: avoid;
  page-break-before: avoid;
}
.card-keep {
  break-inside: avoid;
  page-break-inside: avoid;
}
h1, h2, h3, h4 {
  break-after: avoid;
  page-break-after: avoid;
  break-inside: avoid;
  page-break-inside: avoid;
}
h2 {
  color: #14233a;
  border-bottom: 1.5px solid #c9a227;
  padding-bottom: 6px;
  font-size: 15.5pt;
  line-height: 1.4;
  margin: 0 0 9px;
}
h3 {
  color: #14233a; font-size: 13.5pt; line-height: 1.4; margin: 0 0 6px;
}
.card {
  background: #fffdf8;
  border: 1px solid #d9cbb0;
  border-left: 3px solid #c9a227;
  padding: 10px 12px;
  border-radius: 2px;
  margin-bottom: 8px;
  break-inside: auto;
  page-break-inside: auto;
}
.card > h3,
.card-keep > h3 {
  break-after: avoid;
  page-break-after: avoid;
}
.card-body { min-height: 0; }
.card-body > p:first-child,
.card-keep + .card-body > p:first-child,
.card-keep .card-body > p:first-child {
  break-before: avoid;
  page-break-before: avoid;
}
.card.counsel {
  break-inside: auto;
  page-break-inside: auto;
}
.card p { font-size: 12.5pt; line-height: 1.6; color: #3a342e; margin: 0 0 0.5em; }
.card p:last-child { margin-bottom: 0; }
/* 맺음·시작 안내 — 줄간격 확보·겹침 방지, 여백은 내용으로 채움 */
.closing-card h3,
.intro-card h3 { margin: 0 0 8px; line-height: 1.4; }
.closing-card .card-body,
.intro-card .card-body { display: block; }
.closing-card p,
.intro-card p {
  font-size: 12.5pt;
  line-height: 1.65;
  margin: 0 0 0.7em;
  padding: 0;
  position: relative;
  z-index: 1;
}
.closing-card p:last-child,
.intro-card p:last-child { margin-bottom: 0; }
.month-pack .card { margin-bottom: 6px; padding: 7px 9px; }
.month-pack .card p { margin: 0 0 0.35em; font-size: 12.5pt; line-height: 1.55; }
.month-pack .card > h3 { margin: 0 0 5px; font-size: 12.5pt; }
.evidence {
  background: linear-gradient(180deg, #f3ebe0 0%, #fffdf8 100%);
  border: 1px solid #c4a574;
  border-left: 4px solid #14233a;
  padding: 10px 12px;
  margin-bottom: 9px;
  break-inside: auto;
  page-break-inside: auto;
}
.evidence > h3 {
  break-after: avoid;
  page-break-after: avoid;
  color: #14233a; font-size: 14pt; margin: 0 0 6px; letter-spacing: .04em;
}
.evidence p { font-size: 12.5pt; line-height: 1.6; }
.rule {
  height: 0; border: none; border-top: 1px solid #d4c4a8; margin: 10px 0 12px;
}
.evidence .chips { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.chip {
  display: inline-block;
  border: 1px solid #c4a574;
  background: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10pt;
  color: #4a3f32;
}
.dense { columns: 1; }
.dense .card { margin-bottom: 8px; }
.report-header {
  margin: 0 0 6px;
  font-size: 9.5pt;
  letter-spacing: .04em;
  color: #8b1e1e;
  border-bottom: 1px solid #e2dac9;
  padding-bottom: 3px;
  break-after: avoid;
  page-break-after: avoid;
}
.footer {
  margin-top: 6px;
  text-align: center;
  font-size: 9pt;
  color: #8c857b;
  border-top: 1px solid #e2dac9;
  padding-top: 4px;
  clear: both;
}
.quiet { color: #7a8b80; font-size: 10.5pt; line-height: 1.45; }
.section-head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  margin: 0 0 8px; border-bottom: 2px solid #14233a; padding-bottom: 4px;
  break-after: avoid; page-break-after: avoid;
  break-inside: avoid; page-break-inside: avoid;
}
.section-head h2 { border: none; margin: 0; padding: 0; font-size: 15.5pt; color: #14233a; line-height: 1.4; break-after: avoid; }
.section-head .num { color: #c9a227; font-size: 11pt; letter-spacing: .12em; font-weight: 700; }
.table-block {
  margin: 0 0 10px;
  break-inside: auto;
  page-break-inside: auto;
}
.table-caption {
  font-size: 12pt;
  font-weight: 700;
  color: #14233a;
  margin: 0 0 6px;
  break-after: avoid;
  page-break-after: avoid;
}

/* —— 선장본 표지(표준) — 붉은 전통 책표지. 금색 연꽃(chapter-cover)와 구분 —— */
.book-cover {
  position: relative;
  min-height: calc(297mm - 32mm);
  background:
    linear-gradient(165deg, #f6eee0 0%, #ebe0c8 42%, #dfd0b0 100%);
  border: 12px double #5c1a1a;
  box-shadow:
    inset 0 0 0 4px #8b1e1e,
    inset 0 0 0 10px rgba(246,238,224,.95);
  overflow: hidden;
}
.binding {
  position: absolute; left: 0; top: 0; bottom: 0; width: 42px;
  background: linear-gradient(90deg, #3d0f0f 0%, #6b1818 40%, #8b1e1e 70%, #5c1a1a 100%);
  box-shadow: inset -4px 0 8px rgba(0,0,0,.25);
}
.binding-stitch {
  position: absolute; left: 14px; width: 14px; height: 14px;
  border: 2px solid #f0d78c; border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(139,30,30,.35);
}
.binding-stitch::after {
  content: ""; position: absolute; left: 5px; top: -18px; width: 2px; height: 18px; background: #f0d78c;
}
.vert-title {
  position: absolute; right: 28px; top: 36px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  border: 2px solid #5c1a1a;
  background: rgba(255,253,248,.92);
  padding: 18px 10px;
  letter-spacing: .35em;
  font-size: 18px;
  font-weight: 700;
  color: #1a2e22;
  box-shadow: 3px 3px 0 rgba(92,26,26,.15);
}
.vert-title small {
  display: block; margin-top: 14px; font-size: 12px; font-weight: 500;
  letter-spacing: .2em; color: #8b1e1e;
}
.cover-center {
  position: absolute; left: 64px; right: 96px; top: 26%;
  text-align: center;
}
.cover-center .brand {
  font-size: 13px; letter-spacing: .42em; color: #8b1e1e; margin-bottom: 14px;
}
.cover-center h1 {
  font-size: 30px; margin: 0; color: #1a120c; line-height: 1.4;
  border: none; font-weight: 700; letter-spacing: .04em;
}
.cover-center .guest-name {
  display: inline-block; margin-top: 22px; padding: 12px 28px;
  min-width: 52%;
  font-size: 26px; font-weight: 700; color: #1a120c; letter-spacing: .16em;
  border-top: 1px solid rgba(139,30,30,.45);
  border-bottom: 1px solid rgba(139,30,30,.45);
  background: rgba(255,253,248,.55);
}
.cover-center .guest-name em {
  font-style: normal; font-size: 14px; letter-spacing: .28em;
  color: #8b1e1e; display: block; margin-bottom: 4px; font-weight: 600;
}
.cover-center .sub {
  margin-top: 16px; font-size: 12.5px; color: #5a4a3a; letter-spacing: .08em; line-height: 1.55;
}
.cover-center .cover-product {
  margin-top: 10px; font-size: 14px; letter-spacing: .14em; color: #8b1e1e; font-weight: 700; line-height: 1.5;
}
.cover-center .cover-meta-lines {
  margin-top: 14px; font-size: 12px; color: #5a4a3a; letter-spacing: .06em; line-height: 1.65;
}
.cover-foot {
  position: absolute; left: 64px; right: 32px; bottom: 32px;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
}
.cover-meta { text-align: left; max-width: 78%; }
.cover-meta .gz {
  font-size: 17px; letter-spacing: .16em; color: #3a2a1a;
  font-family: 'Batang', 'Malgun Gothic', serif;
}
.cover-meta .note { margin-top: 6px; font-size: 11px; color: #6a5a4a; line-height: 1.5; }
.seal {
  width: 64px; height: 64px; border: 2px solid #b71c1c; border-radius: 6px;
  color: #b71c1c; display: grid; place-items: center;
  font-size: 28px; font-weight: 700; letter-spacing: .05em;
  transform: rotate(-8deg);
  background: rgba(183,28,28,.06);
  box-shadow: inset 0 0 0 3px rgba(183,28,28,.25);
  flex-shrink: 0;
}

/* —— 사주 도표 —— */
.overview-grid { display: grid; grid-template-rows: auto 1fr; gap: 10px; }
.pillar-board {
  display: grid;
  grid-template-columns: 54px repeat(4, 1fr);
  gap: 4px;
  border: 1px solid #c4a574;
  background: #fffdf8;
  padding: 6px;
}
.pillar-board .lab {
  display: flex; align-items: center; justify-content: center;
  font-size: 10.5px; color: #6a5a4a; background: #f0e6d4; font-weight: 600;
}
.pillar-col { display: grid; gap: 3px; text-align: center; }
.pillar-col .ptime { font-size: 10px; color: #8b1e1e; font-weight: 700; letter-spacing: .08em; }
.cell {
  border: 1px solid #d0c0a4; border-radius: 3px; padding: 4px 2px; min-height: 28px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 11px; line-height: 1.25;
}
.cell.han {
  font-size: 22px; font-weight: 700; font-family: 'Batang', 'Malgun Gothic', serif;
  min-height: 40px;
}
.cell .sub { font-size: 9.5px; opacity: .85; margin-top: 1px; }
.meta-strip {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 6px;
}
.meta-box {
  border: 1px solid #d0c0a4; background: #fff; padding: 6px 7px; border-radius: 3px;
}
.meta-box .k { font-size: 10px; color: #8b1e1e; font-weight: 700; margin-bottom: 2px; }
.meta-box .v { font-size: 11.5px; color: #2a2420; }
.summary-panel {
  border: 1px solid #8b1e1e; background: #fffdf8; padding: 10px 12px;
  min-height: 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
.summary-panel h3 {
  margin: 0 0 6px; color: #8b1e1e; font-size: 13px;
  border-bottom: 1px solid #e2dac9; padding-bottom: 4px;
}

/* —— 목차 (한 장 압축) —— */
.toc { border: 1px solid #c4a574; background: #fffdf8; padding: 2px 0; }
.toc-row {
  display: grid; grid-template-columns: 64px 1fr; gap: 6px;
  padding: 5px 12px; border-bottom: 1px dashed #e2dac9;
  align-items: start;
}
.toc-row:last-child { border-bottom: none; }
.toc-row .part { color: #8b1e1e; font-weight: 700; font-size: 11.5pt; line-height: 1.35; }
.toc-row .topic { font-size: 11.5pt; color: #2a2420; line-height: 1.4; }
.toc-row .topic small { display: block; color: #6a5a4a; font-size: 9.5pt; margin-top: 1px; line-height: 1.35; }
.toc-page .section-head { margin: 0 0 4px; }
.toc-page .quiet { margin: 0 0 4px !important; font-size: 10pt; line-height: 1.4; }

/* —— 표·그래프 —— */
.data-table {
  width: 100%; border-collapse: collapse; font-size: 10.5pt; background: #fff;
}
.data-table th, .data-table td {
  border: 1px solid #d0c0a4; padding: 6px 7px; text-align: center; vertical-align: middle;
}
.data-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; }
.data-table td.left { text-align: left; }
.data-table tr:nth-child(even) td { background: #fcf8f0; }
.data-table.month-flow th, .data-table.month-flow td {
  padding: 5px 6px; font-size: 10pt; line-height: 1.45; vertical-align: top;
}
.data-table.month-flow td.left {
  text-align: left; word-break: keep-all; overflow-wrap: break-word; hyphens: auto;
}
.data-table.month-flow .col-month { width: 7%; }
.data-table.month-flow .col-gz { width: 14%; }
.data-table.month-flow .col-score { width: 12%; }
.data-table.month-flow .col-key { width: 32%; }
.data-table.month-flow .col-watch { width: 35%; }
.score-good { color: #1b5e20; font-weight: 700; }
.score-mid { color: #7a4f01; font-weight: 700; }
.score-bad { color: #8b0000; font-weight: 700; }
.chart-wrap {
  border: 1px solid #c4a574; background: #fffdf8; padding: 8px 10px 4px; margin-bottom: 8px;
}
.visual-slot {
  margin: 4px 0 6px;
  padding: 4px 6px 2px;
  border: 1px solid #d9cbb0;
  background: #fffdf8;
  break-inside: avoid;
  page-break-inside: avoid;
  overflow: visible;
}
.visual-slot svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 150px;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.visual-caption {
  margin: 4px 0 0;
  font-size: 9pt;
  color: #6a5a4a;
  text-align: center;
  line-height: 1.35;
}
.ornament {
  margin: 4px auto 8px;
  text-align: center;
  max-width: 420px;
  max-height: 52px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.ornament svg {
  display: inline-block;
  width: auto;
  max-width: 100%;
  height: 48px;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
.ornament.is-lotus { margin-top: 10px; margin-bottom: 4px; }
.year-points { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; }
.year-points li { font-size: 12pt; line-height: 1.55; color: #3a342e; margin: 0 0 6px; list-style: none; }
.year-points li strong { color: #8b1e1e; }
.gloss-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; background: #fff; margin-bottom: 8px; }
.gloss-table th, .gloss-table td { border: 1px solid #d0c0a4; padding: 6px 7px; vertical-align: top; text-align: left; }
.gloss-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; white-space: nowrap; }
.gloss-table td.term { font-weight: 700; color: #8b1e1e; white-space: nowrap; width: 72px; }
.gloss-note { font-size: 10.5pt; color: #6a5a4a; margin: 0 0 8px; line-height: 1.45; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 10.5pt; margin: 6px 0 8px; }
.compare-table th, .compare-table td { border: 1px solid #d9cbb0; padding: 5px 6px; vertical-align: top; line-height: 1.55; }
.compare-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; }
.compare-table td.lbl { width: 72px; font-weight: 700; color: #8b1e1e; background: #faf6ee; white-space: nowrap; }
.compare-table td.good { background: #f3f8f1; }
.compare-table td.bad { background: #fbf4f2; }
.job-block {
  margin: 0 0 8px; padding: 6px 8px; border: 1px solid #e4d7c0; background: #fffdf8;
  break-inside: avoid; page-break-inside: avoid;
}
.job-block h4 { margin: 0 0 4px; font-size: 12pt; color: #8b1e1e; break-after: avoid; }
.job-block .jobs { margin: 0; font-size: 11pt; line-height: 1.5; color: #3a342e; }
.table-wrap {
  break-inside: auto;
  page-break-inside: auto;
  overflow: visible;
}
table.data-table, table.gloss-table, table.compare-table {
  break-inside: auto;
  page-break-inside: auto;
  width: 100%;
}
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
/* 행·셀 avoid는 큰 표에서 빈 인쇄 쪽을 만듦 — 자동 분할 허용 */
tr { break-inside: auto; page-break-inside: auto; }
td, th {
  break-inside: auto;
  page-break-inside: auto;
  word-break: keep-all;
  overflow-wrap: break-word;
}

@media print {
  html, body {
    background: #f7f1e6 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 12.5pt !important;
    line-height: 1.6 !important;
  }
  /* 논리 .page 단위로 쪽 나눔 — after+before 이중 강제 시 빈 쪽이 생기므로 before만 사용 */
  .page {
    width: auto !important;
    max-width: none !important;
    box-shadow: none !important;
    min-height: auto !important;
    margin: 0 !important;
    padding: 0 0 2mm !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }
  .page.cover-page {
    min-height: auto !important;
    padding: 0 !important;
  }
  /* 논리 페이지마다 새 시트 (첫 장 제외) */
  .sheet-root > .page + .page {
    page-break-before: always !important;
    break-before: page !important;
  }
  .page {
    page-break-inside: auto !important;
    break-inside: auto !important;
  }
  /* 전통 표지 — A4 본문 영역에 맞춰 1장으로 (빈 표지 꼬리 쪽 방지) */
  .page.cover-page .book-cover {
    min-height: 248mm !important;
    height: 248mm !important;
    max-height: 248mm !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }
  .page.cover-page .report-header,
  .page.cover-page .footer {
    display: none !important;
  }
  /* 상단 헤더는 인쇄에도 유지 — 제목이 판면 상단에 붙어 잘리는 느낌 완화 */
  .report-header {
    display: block !important;
    margin: 0 0 3px !important;
    padding-bottom: 1px !important;
    font-size: 8.5pt !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .card {
    padding: 8px 10px !important;
    margin-bottom: 7px !important;
  }
  .card p {
    font-size: 12.5pt !important;
    line-height: 1.6 !important;
    margin: 0 0 0.5em !important;
  }
  .evidence {
    padding: 9px 11px !important;
    margin-bottom: 7px !important;
  }
  .evidence p {
    font-size: 12.5pt !important;
    line-height: 1.6 !important;
  }
  h2 {
    margin: 0 0 7px !important;
    font-size: 15.5pt !important;
    line-height: 1.4 !important;
  }
  h3 { font-size: 13.5pt !important; line-height: 1.4 !important; }
  .section-head { margin: 0 0 7px !important; }
  .section-head h2 { font-size: 15.5pt !important; }
  .page .footer { display: none !important; }
  .print-running-footer {
    display: block !important;
    position: fixed;
    left: 0; right: 0;
    /* @page bottom 28mm 안쪽 — 본문·월운 카드와 겹치지 않게 */
    bottom: 6mm;
    height: 5mm;
    z-index: 10;
    text-align: center;
    font-size: 7.5pt;
    line-height: 5mm;
    color: #8c857b;
    border-top: none;
    padding: 0;
    margin: 0;
    background: transparent;
    pointer-events: none;
  }
  .no-print { display: none !important; }
  .compare-table { font-size: 10.5pt; }
  .compare-table td.lbl { white-space: normal; }
  /* card-keep/solid-card를 avoid로 두면 살짝 넘치는 장이 빈 꼬리 쪽을 많이 만듦 → auto */
  .visual-slot, .ornament {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .card-keep, .job-block, .solid-card {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
  .solid-card.closing-card,
  .solid-card.intro-card {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
  .solid-card > h3 {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .month-pack .section-head {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  /* keep-block 전체 avoid는 과대 시 Chromium이 무시·공백을 만듦 — 제목만 본문과 묶음 */
  .keep-block {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
  .keep-block > .section-head {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .keep-block > .section-head + * {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }
  .ornament {
    max-height: 48px;
    margin: 8px auto 4px;
    text-align: center;
  }
  .visual-slot svg { max-height: 140px !important; }
  .evidence { break-inside: auto !important; page-break-inside: auto !important; }
  .evidence > h3,
  .card > h3,
  .card-keep > h3,
  .section-head,
  .table-caption,
  h2, h3, h4 {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  /* 절 제목 다음에 오는 첫 카드/근거는 가능한 한 같은 쪽 */
  .section-head + .card,
  .section-head + .evidence,
  .section-head + .table-block,
  .section-head + .visual-slot {
    break-before: avoid !important;
    page-break-before: avoid !important;
  }
  thead { display: table-header-group !important; }
  tr, td, th {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  p { orphans: 4; widows: 4; }
}
.print-running-footer { display: none; }
@media screen {
  body { background: #d9d0c0; padding: 12px 0 56px; }
  .page {
    width: 210mm; max-width: 100%; margin: 0 auto 10px;
    padding: 16mm 15mm; box-shadow: 0 8px 24px rgba(0,0,0,.1);
    min-height: 0;
  }
  /* 화면에서도 PDF와 같은 붉은 선장본 표지(금색 연꽃 표지와 혼동 방지) */
  .page.cover-page { padding: 0; min-height: min(265mm, 92svh); }
  .page.cover-page .book-cover {
    min-height: calc(297mm - 32mm);
    border-color: #5c1a1a !important;
  }
  .print-hint {
    position: sticky; top: 0; z-index: 20;
    background: #1a2e22; color: #f7f4ed;
    text-align: center; padding: 10px 12px; font-size: 13px;
    line-height: 1.55;
  }
  .print-hint button {
    display: inline-block; margin: 6px 4px 0; border: 1px solid #d4af37; background: #d4af37; color: #1a2e22;
    border-radius: 999px; padding: 8px 14px; cursor: pointer; font-size: 13px; min-height: 40px;
  }
  .print-hint .mobile-tip { display: none; margin-top: 6px; font-size: 12px; color: #d8c7a0; }
  .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
  .compare-table { min-width: 520px; }
}
@media screen and (max-width: 720px) {
  body { padding: 0 0 48px; }
  .page {
    width: 100%; margin: 0 0 10px; padding: 18px 14px 22px;
    border-radius: 0; box-shadow: none; border-bottom: 8px solid #cfc3ae;
  }
  .page.cover-page { min-height: auto; padding: 0; }
  .page.cover-page .book-cover { min-height: min(420px, 78svh); }
  h2 { font-size: 16px; }
  .card, .evidence { padding: 10px; }
  .card p { font-size: 13px; line-height: 1.7; word-break: keep-all; overflow-wrap: anywhere; }
  .print-hint { padding: 12px 14px 14px; text-align: left; }
  .print-hint .mobile-tip { display: block; }
  .compare-table { font-size: 12px; }
  .compare-table td.lbl { white-space: normal; width: auto; }
}
`;

function wrap(title, pagesHtml) {
  const hint = `<div class="print-hint no-print"><strong>천기노트 · 맞춤 명리 리포트</strong>
  <div><button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button></div>
  <p class="mobile-tip">스마트폰: 버튼을 누른 뒤 ‘PDF로 저장’ 또는 공유 시트에서 파일을 저장하세요. 화면이 잘리면 가로 보기·확대 없이 인쇄 미리보기를 사용하세요.</p>
  </div>`;
  const running = `<div class="print-running-footer">천기노트 — 참고용 안내 자료</div>`;
  // sheet-root로 감싸 마지막 .page의 page-break-after를 안전하게 해제(고정 footer div와 형제 분리)
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/><title>${esc(title)}</title><style>${STYLES}</style></head><body>${hint}<main class="sheet-root">${pagesHtml}</main>${running}</body></html>`;
}

let reportSubject = null;
/** 풀 리포트 생성 중 동일·유사 문단 1회만 유지 (계산/원국 미변경) */
let reportParagraphSeen = new Set();

function paraKey(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .replace(/[·.,，。、!！?？:：;；"'“”‘’()（）[\]【】]/g, "")
    .slice(0, 56);
}

function resetReportDedupe() {
  reportParagraphSeen = new Set();
  resetPlainTermsState();
  resetTopicCounselDedupe();
}

/** 이미 쓴 긴 문장은 건너뜀. 짧은 라벨·고유 수치는 유지 */
function takeFreshLine(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  const key = paraKey(raw);
  if (key.length < 24) return raw;
  if (reportParagraphSeen.has(key)) return "";
  reportParagraphSeen.add(key);
  return raw;
}

function mapFreshLines(lines, mapFn) {
  return (lines || [])
    .map((line) => {
      const fresh = takeFreshLine(line);
      return fresh ? mapFn(fresh) : "";
    })
    .filter(Boolean)
    .join("");
}

function page(inner, pageNo, extraClass = "") {
  const header = reportSubject ? reportHeader(reportSubject) : "";
  return `<div class="page ${extraClass}">${header}<div class="dense">${inner}</div>${footer(pageNo)}</div>`;
}

/** 큰 장 시작 — 인쇄 시 쪽 구분 */
function chapterPage(inner, pageNo, extraClass = "") {
  return page(inner, pageNo, `chapter ${extraClass}`.trim());
}

function wxStyle(element) {
  const c = WX_COLOR[element] || WX_COLOR.토;
  return `background:${c.bg};color:${c.fg};border-color:${c.border}`;
}

function orderedPillars(chart) {
  // 시·일·월·년 (전통 사주 도표 좌→우)
  const map = Object.fromEntries((chart.pillars || []).map((p) => [p.label, p]));
  return [map["시주"], map["일주"], map["월주"], map["년주"]].filter(Boolean);
}

function stemGod(chart, stem) {
  if (!stem) return "";
  if (stem === chart.dayStem) return "일원";
  return tenGod(chart.dayStem, stem) || "";
}

function shenshaForPillar(chart, pillar) {
  const s = chart.specials || {};
  const tags = [];
  if (s.munchang && (pillar.gan === s.munchang || pillar.zhi === s.munchang || pillar.zhiKo === koGz(s.munchang))) tags.push("문창");
  if (s.dohwa && pillar.zhi === s.dohwa) tags.push("도화");
  if (s.yeokma && pillar.zhi === s.yeokma) tags.push("역마");
  if (String(chart.xunKong || "").includes(pillar.zhiKo) || String(chart.xunKong || "").includes(pillar.zhi)) tags.push("공망");
  return tags.join("·") || "—";
}

function branchGodLabel(chart, pillar) {
  const main = mainStem(pillar.zhi);
  return stemGod(chart, main) || "—";
}

function yongsinSummary(chart) {
  const fav = chart.strength?.favorable || [];
  const unfav = chart.strength?.unfavorable || [];
  return {
    yong: fav[0] || "—",
    hee: fav.slice(0, 2).join("·") || "—",
    gi: unfav.slice(0, 2).join("·") || "—",
  };
}

/** 상품 표지 제목 — 8,000 / 19,000 / 29,000원 구분 (겉표지 디자인은 동일) */
export function coverPlanLabel(mode, detail = "") {
  if (mode === "single") {
    return detail ? `단품(8,000원) · ${detail}` : "단품(8,000원) · 맞춤 운세";
  }
  if (mode === "triple") {
    return detail ? `3종 맞춤(19,000원) · ${detail}` : "3종 맞춤(19,000원)";
  }
  return "평생운세 풀 패키지(29,000원) · 심층 명리";
}

/** 1. 선장본 표지(표준) — 붉은 전통 책표지. HTML·PDF·관리자 다운로드 공통 */
function traditionalCover(reading, planLabel = "맞춤 구성") {
  const chart = reading.chart;
  const gz8 = (chart.pillars || []).map((p) => p.gz).join(" ");
  const hanja = String(reading.hanja || "").trim();
  const nameLine = hanja
    ? `${esc(reading.displayName)} (${esc(hanja)}) 님`
    : `${esc(reading.displayName)} 님`;
  const birthBits = [
    chart.calendarLabel,
    chart.solarText,
    chart.genderLabel,
    chart.clock,
  ]
    .filter(Boolean)
    .map((x) => String(x).trim())
    .filter(Boolean);
  const stitches = [36, 72, 108, 144, 180, 216, 252]
    .map((top) => `<div class="binding-stitch" style="top:${top}px"></div>`)
    .join("");
  return `<div class="page cover-page">
    <div class="book-cover">
      <div class="binding">${stitches}</div>
      <div class="vert-title">맞춤 명리 리포트<small>天機筆記</small></div>
      <div class="cover-center">
        <div class="brand">天機筆記</div>
        <h1>천기노트</h1>
        <p class="sub cover-product">${esc(planLabel)}</p>
        <div class="guest-name"><em>貴人</em>${nameLine}</div>
        <p class="sub cover-meta-lines">
          작성일 ${esc(formatReportDate())}<br/>
          생년월일 ${esc(birthBits.join(" · ") || "—")}<br/>
          총 __TOTAL_PAGES__페이지
        </p>
      </div>
      <div class="cover-foot">
        <div class="cover-meta">
          <div class="gz">${esc(gz8)}</div>
          <div class="note">${esc(dayMasterPhrase(chart.dayMasterKo, chart.dayElement))} · ${esc(strengthPhrase(chart.strength?.label))}</div>
        </div>
        <div class="seal" title="낙관">福</div>
      </div>
    </div>
  </div>`;
}

function reportIntroPage(reading, pageNo) {
  return page(
    sectionBlocks("리포트 시작 안내", "안내", [
      solidCard(
        "이 보고서를 읽는 방법",
        [
          p("이 보고서는 타고난 기질과 시기별 흐름을 이해하는 데 도움을 드리며, 일상과 중요한 결정을 스스로 점검할 때 참고하시면 됩니다."),
          p("전체 분량은 총 __TOTAL_PAGES__페이지입니다. 명식과 선택 구성에 따라 달라지며, 아래 목차와 바닥글 쪽수가 실제 구성과 같습니다."),
          p("풀이 내용은 참고용입니다. 건강·재무·법률처럼 중요한 결정은 해당 분야 전문가의 판단과 함께 살펴 주세요. 건강 장은 생활 리듬 참고이며 질병을 진단하지 않습니다."),
          reading.notices?.hourUnknown
            ? p("출생 시각 정보가 없어 시간대별 세부 풀이는 일부 제한되거나 참고용으로 표시됩니다.")
            : "",
          reading.notices?.hanjaSuggested
            ? p("성명학 항목에 실제 한자 대신 추천 한자가 들어간 경우, 그 결과는 참고용으로만 봐 주세요.")
            : !reading.hanja
              ? p("한자 성명이 입력되지 않아 성명학은 한글 자획만으로 풀이했습니다. 임의의 한자나 획수를 추정하지 않았습니다.")
              : "",
          reading.notices?.birthPlaceAssumed
            ? p(
                `서양 점성술의 상승궁·하우스는 출생지를 따로 넣지 않아 ${reading.notices.birthPlaceLabel || "서울"} 기준의 참고 계산입니다. 자세한 한계는 본원·서양 장에 적어 두었습니다.`,
              )
            : p("서양 점성술 상승궁·하우스의 계산 기준과 한계는 본원 서양 장에 안내합니다."),
        ]
          .filter(Boolean)
          .join(""),
        "intro-card",
      ),
      solidCard(
        "읽기 순서 안내",
        [
          p("① 한눈 보기·핵심 용어로 내 기둥과 말을 익힌 뒤, ② 관심 주제(재물·직업·인연 등) 장을 먼저 읽고, ③ 대운·세운·월운으로 시기를 맞춰 보세요."),
          p("④ 개운·비교표는 ‘이번 주 규칙 3개’만 고르는 용도로 쓰고, ⑤ 맺음의 점검 목록을 달력·메모에 옮기면 한 권이 일상 점검표가 됩니다."),
          p("같은 말이 여러 장에 나와도 관점이 다를 수 있습니다. 단정 예언이 아니라, 준비·휴식·추진의 기준점으로 활용하세요."),
        ].join(""),
        "intro-card",
      ),
      solidCard(
        "활용 팁",
        [
          p("한 번에 다 읽기보다, 이번 주 결정과 맞닿은 장만 펼쳐도 충분합니다. 점수·주의일은 달력에, 한 줄 실천은 메모에 옮기세요."),
          p("바닥글 쪽수와 목차 제목이 실제 구성을 가리킵니다. 표·그래프는 계산 결과를 그대로 보여 주며, 해석 문장과 함께 보시면 흐름이 또렷해집니다."),
        ].join(""),
        "intro-card",
      ),
    ]),
    pageNo,
  );
}

/** 2. 내 사주 한눈에 */
function overviewPage(reading, pageNo) {
  const chart = reading.chart;
  const cols = orderedPillars(chart);
  const head = `<div class="pillar-board">
    <div class="lab">구분</div>
    ${cols.map((p) => `<div class="pillar-col"><div class="ptime">${esc(p.label)}</div></div>`).join("")}
    <div class="lab">천간</div>
    ${cols
      .map((p) => {
        const el = STEM_ELEMENT[p.gan];
        return `<div class="cell han" style="${wxStyle(el)}">${esc(p.gan)}<span class="sub">${esc(p.ganKo)} · ${esc(el)}</span></div>`;
      })
      .join("")}
    <div class="lab">지지</div>
    ${cols
      .map((p) => {
        const el = BRANCH_ELEMENT[p.zhi];
        return `<div class="cell han" style="${wxStyle(el)}">${esc(p.zhi)}<span class="sub">${esc(p.zhiKo)} · ${esc(el)}</span></div>`;
      })
      .join("")}
    <div class="lab">천간 역할</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(p.shiShen || stemGod(chart, p.gan) || "—"))}</div>`).join("")}
    <div class="lab">지지 역할</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(branchGodLabel(chart, p) || "—"))}</div>`).join("")}
    <div class="lab">지장간</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc((p.hide || []).join(" ") || "—")}</div>`).join("")}
    <div class="lab">기운의 호흡</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(p.diShi || "—"))}</div>`).join("")}
    <div class="lab">특별 신호</div>
    ${cols
      .map((p) => {
        const tags = shenshaForPillar(chart, p);
        if (!tags || tags === "—") return `<div class="cell" style="font-size:10px">—</div>`;
        return `<div class="cell" style="font-size:9.5px">${esc(tags.split("·").map((t) => termChip(t)).join(" · "))}</div>`;
      })
      .join("")}
  </div>`;

  const ys = yongsinSummary(chart);
  const meta = `<div class="meta-strip">
    <div class="meta-box"><div class="k">느슨해지기 쉬운 자리</div><div class="v">${esc(termChip("공망"))} ${esc(chart.xunKong || "—")}</div></div>
    <div class="meta-box"><div class="k">체질 온도</div><div class="v">${esc(strengthPhrase(chart.strength?.label))}</div></div>
    <div class="meta-box"><div class="k">필요·도움 기운</div><div class="v">${esc(elementPhrase(ys.yong))} · ${esc(favorBundlePhrase(ys.hee))}</div></div>
    <div class="meta-box"><div class="k">과하면 부담</div><div class="v">${esc(favorBundlePhrase(ys.gi))}</div></div>
  </div>`;

  const character = reading.dashboard?.character?.personality;
  const summaryLines = [
    character?.summary,
    character?.deep,
    `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength?.label)}. 사회에서 자주 드러나는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
    `오행 균형 목${chart.count?.목 || 0} 화${chart.count?.화 || 0} 토${chart.count?.토 || 0} 금${chart.count?.금 || 0} 수${chart.count?.수 || 0}. 도움이 되는 기운은 ${favorBundlePhrase(ys.hee)}, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi)}.`,
    reading.bridge,
    character?.tip || reading.guide?.summary,
  ].filter(Boolean);

  return page(
    `<div class="section-head"><h2>내 사주 한눈에</h2><span class="num">四柱圖表</span></div>
    <div class="overview-grid">
      <div>${head}${meta}</div>
      <div class="summary-panel">
        <h3>핵심 기질과 인생 흐름 총평</h3>
        ${summaryLines.map((line) => p(line)).join("")}
      </div>
    </div>`,
    pageNo,
  );
}

const TOC_PARTS = [
  { part: "제1부", title: "타고난 본원", blurb: "일간·오행·성격의 뼈대" },
  { part: "제2부", title: "재물운", blurb: "재성·쓸 돈과 모을 돈의 리듬" },
  { part: "제3부", title: "직업·진로 적성", blurb: "현대 직종 진로 지침서와 전공 팁" },
  { part: "제4부", title: "사업운", blurb: "창업·확장·동업의 길흉" },
  { part: "제5부", title: "결혼·애정운", blurb: "배우자궁·도화·관계의 온도" },
  { part: "제6부", title: "정밀 궁합", blurb: "두 사람 명식의 합·충 교차" },
  { part: "제7부", title: "자녀운", blurb: "식상·양육 태도와 인연" },
  { part: "제8부", title: "건강·여행·이사", blurb: "몸·이동·집터의 방위 가이드" },
  { part: "제9부", title: "10년 대운·세운", blurb: "앞으로 10년 상승·하락 곡선" },
  { part: "제10부", title: "12개월 월운·개운", blurb: "월운 달력과 개운 7대 비교표" },
];

function glossRows(names, dict) {
  return names
    .filter((name) => dict[name])
    .map((name) => {
      const e = dict[name];
      return `<tr>
        <td class="term">${esc(e.short)}<br/><span class="quiet">${esc(name)} · ${esc(e.hanja)}</span></td>
        <td>${esc(e.meaning)} — ${esc(e.detail)}</td>
        <td>${esc(e.strength)}</td>
        <td>${esc(e.caution)}</td>
      </tr>`;
    })
    .join("");
}

/** 내 사주에 실제로 있는 핵심 용어만 쉬운 뜻으로 정리 */
function wuxingGuideRows() {
  return ["목", "화", "토", "금", "수"]
    .map((el) => {
      const g = WUXING_GUIDE[el];
      const c = WX_COLOR[el] || {};
      return `<tr>
        <td><strong style="color:${c.fg || "#333"}">${esc(el)}(${esc(g.hanja)})</strong></td>
        <td>${esc(g.nature)}</td>
        <td>${esc(g.strength)}</td>
        <td>${esc(g.caution)}</td>
      </tr>`;
    })
    .join("");
}

/** 용어 가이드 — 표가 A4 1장을 넘기지 않도록 2페이지로 분할 */
function glossaryGuidePages(reading, startNo) {
  const terms = collectChartTerms(reading.chart);
  const godRows = glossRows(terms.gods, TEN_GOD_GLOSS);
  const diRows = glossRows(terms.dishi, DISHI_GLOSS);
  const shaRows = glossRows(terms.shensha, SHENSHA_GLOSS);
  const tips = [...terms.gods, ...terms.dishi, ...terms.shensha]
    .slice(0, 6)
    .map((name) => `<li>${esc(termSummaryLine(name))}</li>`)
    .join("");

  const intro = `<p class="gloss-note">${esc(reading.displayName)} 님 명식에 <strong>실제로 들어 있는</strong> 역할(십신)·기운의 호흡(12운성)·특별 신호와, 공통 오행(목·화·토·금·수)을 골라 <strong>쉬운 말을 앞에</strong> 두고 정리한 가이드입니다. 목은 나무처럼 자라는 힘, 화는 불처럼 드러내는 힘, 토는 땅처럼 담는 힘, 금은 쇠처럼 다듬는 힘, 수는 물처럼 흐르는 힘입니다.</p>`;
  const p1 = page(
    `<div class="section-head"><h2>내 사주 핵심 용어 한눈에 보기</h2><span class="num">用語 1</span></div>
    ${intro}
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">오행(목·화·토·금·수) 한눈에 보기</h3>
    <table class="gloss-table">
      <thead><tr><th>오행</th><th>자연 비유 · 삶의 의미</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${wuxingGuideRows()}</tbody>
    </table>
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">십신(나와 세상의 관계 역할)</h3>
    <table class="gloss-table">
      <thead><tr><th>용어</th><th>한자 뜻 · 쉬운 설명</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${godRows || `<tr><td colspan="4">십신 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>`,
    startNo,
  );
  const p2 = page(
    `<div class="section-head"><h2>핵심 용어 · 12운성·신살</h2><span class="num">用語 2</span></div>
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">12운성(기운의 호흡·온도)</h3>
    <table class="gloss-table">
      <thead><tr><th>용어</th><th>한자 뜻 · 쉬운 설명</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${diRows || `<tr><td colspan="4">12운성 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">신살·공망(특별 신호등)</h3>
    <table class="gloss-table">
      <thead><tr><th>용어</th><th>한자 뜻 · 쉬운 설명</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${shaRows || `<tr><td colspan="4">신살·공망 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>
    <div class="summary-panel" style="min-height:auto;margin-top:8px">
      <h3>이 사주에서 먼저 기억할 키워드</h3>
      <ul class="year-points" style="grid-template-columns:1fr">${tips || "<li>명식 용어를 준비 중입니다.</li>"}</ul>
    </div>
    ${svgWuxingBalance(reading.chart?.count || {})}`,
    startNo + 1,
    "flow",
  );
  return [p1, p2];
}

/** 3. 10부 차례 — 반드시 한 장 */
function tocPage(pageNo) {
  const rows = TOC_PARTS.map(
    (row) => `<div class="toc-row"><div class="part">${esc(row.part)}</div><div class="topic">${esc(row.title)}<small>${esc(row.blurb)}</small></div></div>`,
  ).join("");
  return page(
    `<div class="toc-page">
    <div class="section-head"><h2>目次 · 열 부의 차례</h2><span class="num">CONTENTS</span></div>
    <p class="quiet">전체 __TOTAL_PAGES__페이지(생성된 PDF 기준) · 각 운세는 원인→성향→현황→흐름→주의→실천 순입니다. 브라우저에서 HTML을 직접 인쇄하면 쪽수가 달라질 수 있으니 전달·확인은 PDF 파일을 사용해 주세요.</p>
    <div class="toc">${rows}</div>
    </div>`,
    pageNo,
    "keep-apart",
  );
}

function evidenceForTopic(item, chart) {
  const topic = item.id || "origin";
  const pt = withTopic(topic);
  const gods = (chart.pillars || []).map((pil) => pil.shiShen).filter(Boolean);
  const ys = yongsinSummary(chart);
  const specials = chart.specials || {};
  const chips = [];
  const lines = [];

  const pushGod = (name) => {
    if (gods.includes(name)) chips.push(name);
  };

  switch (item.id) {
    case "wealth":
      ["정재", "편재", "식신", "상관"].forEach(pushGod);
      lines.push(
        `이 명식에서 재물과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.wealth || "—", "wealth")}입니다.`,
      );
      lines.push(
        `지금 우선 도움이 되는 쪽은 ${elementPhrase(ys.yong, "wealth")}이고, 과하면 부담이 되기 쉬운 쪽은 ${elementPhrase(ys.gi?.split?.("·")?.[0] || chart.strength?.unfavorable?.[0] || "—", "wealth")}입니다.`,
      );
      lines.push("아래에서는 수입·지출·계약·저축·리스크만 기준으로 읽습니다. 자세한 풀이는 이어지는 심층 장에서 이어집니다.");
      break;
    case "career":
      ["정관", "편관", "인성", "비견"].forEach(pushGod);
      lines.push(
        `자리·책임과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.officer || "—", "career")} 쪽입니다.`,
      );
      lines.push(
        `사회에서 자주 드러나는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
      );
      lines.push(topicEvidenceGuide("career"));
      break;
    case "business":
      ["식신", "상관", "편재", "편관"].forEach(pushGod);
      lines.push(
        `꾸준히 만들어 내는 힘과 큰 판을 굴리는 힘이 창업·확장의 재료입니다.`,
      );
      lines.push(
        `이동·출장의 복이 보이면(${koGz(specials.yeokma || "") || "—"}) 확장 운이 잘 붙습니다.`,
      );
      lines.push(topicEvidenceGuide("business"));
      break;
    case "marriage":
    case "compatibility":
      ["정관", "편관", "정재", "편재", "도화"].forEach(pushGod);
      lines.push(
        `배우자·생활 리듬의 자리는 일지 ${chart.pillars?.[2]?.zhiKo || "—"}입니다.`,
      );
      lines.push("매력·소개의 복과 공부·서류의 복을 함께 봅니다.");
      lines.push(topicEvidenceGuide(item.id));
      break;
    case "children":
      ["식신", "상관", "인성"].forEach(pushGod);
      lines.push(
        `자녀·표현과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.child || "—", "children")} 쪽입니다.`,
      );
      lines.push("가르침과 표현의 균형으로 읽으면 이해가 쉽습니다.");
      lines.push(topicEvidenceGuide("children"));
      break;
    case "health":
      lines.push(`${strengthPhrase(chart.strength?.label)}. 오행의 치우침을 생활 페이스 참고로 먼저 봅니다.`);
      lines.push(
        `과하면 부담이 되는 기운 ${favorBundlePhrase(ys.gi, "health")}이 셀 때는 수면·식사·쉬는 칸을 먼저 챙기는 편이 안전합니다.`,
      );
      lines.push("이 장은 생활 리듬 참고이며, 사주로 질병이나 신체 상태를 진단하지 않습니다.");
      lines.push(topicEvidenceGuide("health"));
      chips.push(...Object.entries(chart.count || {}).map(([k, v]) => `${k}${v}`));
      break;
    case "moving":
      lines.push(
        `이동·출장의 복과 약속이 느슨해지기 쉬운 자리(${chart.xunKong || "—"})가 이사·문서운의 길잡이입니다.`,
      );
      lines.push("방위·동선은 본문 해설을 따릅니다.");
      lines.push(topicEvidenceGuide("moving"));
      chips.push("역마", "공망");
      break;
    case "travel":
      lines.push("이동의 복·느슨한 자리가 뜨는 해·달에 여행 일정이 잘 맞습니다.");
      lines.push(
        `도움이 되는 기운 ${favorBundlePhrase(ys.hee, "travel")} 방위를 우선하세요.`,
      );
      lines.push(topicEvidenceGuide("travel"));
      chips.push("역마", favorBundlePhrase(ys.hee, "travel"));
      break;
    default:
      lines.push(`${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}. ${strengthPhrase(chart.strength?.label)}.`);
      lines.push(
        `지금 가장 필요한 기운은 ${elementPhrase(ys.yong)}이고, 도움이 되는 기운은 ${favorBundlePhrase(ys.hee)}, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi)}입니다.`,
      );
      lines.push(topicEvidenceGuide(topic === "origin" ? "origin" : "default"));
      chips.push(...gods.slice(0, 4));
  }

  const freshEvidence = uniqueParagraphs(lines)
    .map((l) => takeFreshLine(l))
    .filter(Boolean);
  return `<div class="evidence"><h3>명리학적 근거 요약</h3>${freshEvidence.map((l) => pt(l)).join("")}
    <div class="chips">${[...new Set(chips)].filter(Boolean).map((c) => `<span class="chip">${esc(termChip(c))}</span>`).join("")}</div>
  </div>`;
}

function uniqueParagraphs(list) {
  const seen = new Set();
  return (list || []).filter((line) => {
    const key = String(line || "")
      .replace(/\s+/g, "")
      .slice(0, 48);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function topicCoreLine(item) {
  const summary = String(item.summary || "").trim();
  const preview = String(item.preview || item.blurb || "").trim();
  if (summary && preview && summary.replace(/\s+/g, "").slice(0, 36) === preview.replace(/\s+/g, "").slice(0, 36)) {
    return summary;
  }
  return summary || preview || "";
}

function engineMap(reading) {
  const list = reading.engines || [];
  const byName = Object.fromEntries(list.map((e) => [e.name || e.id || e.title, e]));
  return {
    ziwei: list.find((e) => /자미|紫微|ziwei/i.test(String(e.name || e.id || ""))) || byName["자미두수"],
    qimen: list.find((e) => /기문|奇門|qimen/i.test(String(e.name || e.id || ""))) || byName["기문둔갑"],
    yijing: list.find((e) => /주역|周易|역경/i.test(String(e.name || e.id || ""))) || byName["주역"],
    bazi: list.find((e) => /사주|八字|명리/i.test(String(e.name || e.id || ""))) || byName["사주명리"],
  };
}

function parasChunk(paragraphs, size = 3) {
  const list = (paragraphs || []).filter(Boolean);
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out.length ? out : [[]];
}

function head(title, num = "") {
  return `<div class="section-head"><h2>${esc(title)}</h2><span class="num">${esc(num)}</span></div>`;
}

/** 제목과 바로 아래 블록이 페이지 끝에서 갈라지지 않게 */
function keepHead(title, num, firstBlockHtml) {
  return `<div class="keep-block">${head(title, num)}${firstBlockHtml || ""}</div>`;
}

/** 제1부 · 본원 (얇은 장은 아래에서 합침) */
function buildOriginPages(reading, western) {
  const chart = reading.chart;
  const ys = yongsinSummary(chart);
  const character = reading.dashboard?.character?.personality;
  const engines = engineMap(reading);
  const pages = [];
  const pt = withTopic("origin");

  pages.push(
    `${svgOrnamentLandscape()}
    ${sectionBlocks("제1부 · 타고난 본원", "본원", [
      evidenceForTopic({ id: "origin", summary: character?.summary }, chart),
      card("나의 중심 기운", [
        pt(`당신의 기본 본성은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}입니다. 이 중심은 ‘내가 세상을 대하는 기본 태도’를 보여 줍니다.`),
        pt(`배우자·생활 리듬의 자리(일지)는 ${chart.pillars?.[2]?.zhiKo || "—"}(${chart.pillars?.[2]?.zhi || ""})이고, 기운의 호흡은 ${chart.pillars?.[2]?.diShi || "—"}에 가깝습니다.`),
        pt(character?.summary || reading.guide?.summary || "중심 기운의 결을 생활 언어로 풀면, 선택과 거절의 기준이 또렷해집니다."),
        pt(character?.deep || "깊은 층에서는 익숙한 패턴이 반복됩니다. 패턴에 이름을 붙이면 고치기 쉬워집니다."),
      ].join("")),
    ])}`,
  );

  pages.push(
    sectionBlocks("월주·사회생활의 결", "본원", [
      card("사회에서 드러나는 역할", [
        pt(`월주는 ${chart.pillars?.[1]?.gzKo || "—"}(${chart.pillars?.[1]?.gz || ""})이며, 사회에서 자주 보이는 역할은 ${chart.monthGod || chart.pillars?.[1]?.shiShen || "—"} 결에 가깝습니다.`),
        pt("월주는 직장·바깥에서의 첫인상과 일 처리 방식을 보여 줍니다. 집 안 기운(년주)과 내 중심(일주) 사이에서 번역기 역할을 합니다."),
        pt(`납음은 ${chart.pillars?.[1]?.nayin || "—"}, 지장간은 ${(chart.pillars?.[1]?.hide || []).join("·") || "—"}입니다. 지장간이 여러 개면 한 달에 여러 역할이 겹칩니다.`),
        pt(character?.balance || "월주의 결을 존중하되, 중심 기운이 무리하지 않는 선에서 속도를 맞추면 평가와 체력이 함께 갑니다."),
      ].join("")),
    ]),
  );

  const countLines = Object.entries(chart.count || {}).map(([k, v]) =>
    pt(`${elementPhrase(k, "origin")} ${v} — ${WX_COLOR[k]?.label || k} 기운의 비중입니다.`),
  );
  pages.push(
    sectionBlocks("오행 균형", "본원", [
      svgWuxingBalance(chart.count || {}),
      card("오행 분포", countLines.join("") || pt("오행 분포를 준비 중입니다.")),
      card("해석", [
        pt(`${strengthPhrase(chart.strength?.label)} 판정은 나를 돕는 기운 ${chart.strength?.support ?? "—"}대 나를 쓰게 하는 기운 ${chart.strength?.drain ?? "—"}의 비교입니다.`),
        pt(`도움이 되는 기운은 ${favorBundlePhrase(ys.hee, "origin")}, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi, "origin")}입니다. 옷·식탁·방위에 도움 기운을 먼저 들이면 선택이 가벼워집니다.`),
        pt(character?.tip || "오행이 부족한 쪽은 ‘더 하려는 욕심’보다 ‘한 가지를 규칙으로 넣는 일’이 효과가 큽니다."),
      ].join("")),
    ]),
  );

  const hideCards = (chart.pillars || [])
    .map((pillar, idx) =>
      card(
        `${pillar.label} 지장간 · ${pillar.gzKo}`,
        [
          pt(`지장간: ${(pillar.hide || []).join(" · ") || "—"}. 드러난 글자 아래 숨은 재료입니다.`),
          pt(`지지 오행 ${elementPhrase(BRANCH_ELEMENT[pillar.zhi] || "—", "origin")}, 천간 오행 ${elementPhrase(STEM_ELEMENT[pillar.gan] || "—", "origin")}, 역할은 ${pillar.shiShen || "—"}.`),
          idx === 0
            ? pt(
                "지장간이 나의 중심과 같거나 도움이 되는 기운이면 그 기둥에서 힘이 나고, 과하면 부담이 되는 기운이면 그 시기에 소모가 커집니다.",
              )
            : "",
        ].join(""),
      ),
    )
    .join("");
  pages.push(sectionBlocks("지장간 심층", "본원", [hideCards, svgShiShenBars(chart.pillars || [])]));

  const diShiCards = (chart.pillars || [])
    .map((pillar, idx) =>
      card(
        `${pillar.label} 기운의 호흡 · ${pillar.diShi || "—"}`,
        [
          pt(`${pillar.gzKo}의 기운 호흡은 ${pillar.diShi || "—"}입니다. 호흡은 ‘그 글자가 내 중심에게 얼마나 힘을 주는지’의 온도입니다.`),
          idx === 0
            ? pt(
                "시작·정점의 호흡은 추진이, 점검·마무리·비움의 호흡은 정리·휴식이 이득인 리듬으로 읽으면 실전에 가깝습니다.",
              )
            : "",
        ].join(""),
      ),
    )
    .join("");

  const specials = chart.specials || {};
  // 얇은 ‘특별 신호’ 장을 호흡 심층과 한 장으로 묶어 하단 공백을 줄임
  pages.push(
    sectionBlocks("기운의 호흡·특별 신호", "본원", [
      diShiCards,
      card("공부·매력·이동의 복", [
        pt(`공부·서류·글이 붙기 쉬운 글자 ${koGz(specials.munchang || "") || "—"}`),
        pt(`사람·매력·소개가 붙기 쉬운 글자 ${koGz(specials.dohwa || "") || "—"}`),
        pt(`이동·출장·이사·이직이 붙기 쉬운 글자 ${koGz(specials.yeokma || "") || "—"}`),
        pt(`약속이 느슨해지기 쉬운 자리 ${chart.xunKong || "—"} — 중요한 날짜는 문자로 한 번 더 확인하세요.`),
      ].join("")),
      card("기둥별 특별 신호", (chart.pillars || []).map((pillar) => pt(`${pillar.label} ${pillar.gzKo} · ${shenshaForPillar(chart, pillar)}`)).join("")),
    ]),
  );

  pages.push(
    sectionBlocks("체질 온도와 필요·도움·부담 기운", "본원", [
      card("온도·기운 요약", [
        pt(`지금은 ${strengthPhrase(chart.strength?.label)}입니다. ${chart.strength?.strong ? "방향을 정하면 끝까지 밀 수 있지만, 주변 몫까지 혼자 지려 하면 관계가 먼저 피곤해질 수 있습니다." : "옆에서 채워 줄 사람과 환경이 있을 때 더 편하고, 혼자 욕심내기보다 도움을 받는 쪽이 맞습니다."}`),
        pt(`지금 가장 필요한 기운은 ${elementPhrase(ys.yong, "origin")}입니다. 도움이 되는 기운은 ${favorBundlePhrase(ys.hee, "origin")}이고, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi, "origin")}입니다. 이번 분기에는 우선순위 하나만 잡고 실천해 보세요.`),
        pt(`역할로 보면, 나를 키우는 쪽은 ${elementPhrase(chart.strength?.roles?.mine || "—", "origin")}, 배움·돌봄은 ${elementPhrase(chart.strength?.roles?.parent || "—", "origin")}, 표현·결과물은 ${elementPhrase(chart.strength?.roles?.child || "—", "origin")}, 재물은 ${elementPhrase(chart.strength?.roles?.wealth || "—", "origin")}, 자리·책임은 ${elementPhrase(chart.strength?.roles?.officer || "—", "origin")}입니다.`),
      ].join("")),
      card("생활 적용", [
        pt(reading.guide?.summary || "도움이 되는 기운이 들어오는 색·음식·방위를 작은 규칙으로 두면, 운이 막연한 말이 아니라 체크리스트가 됩니다."),
        pt(reading.bridge || "사주의 뼈대와 방위·동선·점성술을 같은 메모에 적으면 결정이 빨라집니다."),
      ].join("")),
    ]),
  );

  pages.push(
    sectionBlocks("서양 점성술 · 태양·달·상승", "본원", [
      card(
        "계산 기준·한계",
        (western.accuracyNotes || [
          "상승궁·하우스는 출생 시각·출생지(미선택 시 서울) 기준 근사 계산이며 참고용입니다.",
        ])
          .map((line) => pt(line))
          .join(""),
      ),
      card("종합", pt(western.summary || "점성술 요약을 준비 중입니다.")),
      card("태양(삶의 목적)", pt(western.sun?.text || "")),
      card("달(속마음·휴식)", pt(western.moon?.text || "")),
      card("상승(첫인상)", pt(western.rising?.text || "")),
    ]),
  );

  const planetCards = (western.planets || [])
    .slice(0, 6)
    .map((pl) => card(pl.name || pl.id || "행성", pt(pl.text || "")))
    .join("");
  pages.push(
    sectionBlocks("행성·동양 렌즈 교차", "본원", [
      planetCards || card("행성", pt("행성 요약을 준비 중입니다.")),
      card("교차 읽기", [
        pt(`${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}과 태양 ${western.sun?.name || "—"}자리를 겹치면, 말과 목표가 한 방향으로 모입니다.`),
        pt(`달 ${western.moon?.name || "—"}자리는 생활 리듬과 함께 ‘언제 쉴지’를 알려 줍니다.`),
      ].join("")),
      card("동양 렌즈 한눈", [
        pt(engines.bazi?.summary || `네 기둥 ${(chart.pillars || []).map((x) => x.gzKo).join(" ")} · ${strengthPhrase(chart.strength?.label)}.`),
        pt(engines.ziwei?.summary || reading.dashboard?.character?.ziwei || "별자리 렌즈는 명궁·신궁의 별로 성격을 보조 해석합니다."),
        pt(engines.qimen?.summary || reading.bridge || "방위 렌즈는 살림·책상·출입 방위를 생활 동선으로 번역합니다."),
        pt(engines.yijing?.summary || "선택의 렌즈는 ‘지금 이 선택의 태도’를 한 줄로 짚어 줍니다. 길흉보다 타이밍과 태도를 보세요."),
      ].join("")),
      card("실천 한 줄", pt(character?.tip || "이번 주, 도움이 되는 기운을 들이는 작은 규칙 하나만 달력에 적으세요.")),
    ]),
  );

  return mergeSparseBodies(pages, 1020);
}

/** 제2~8부 주제 — 핵심 결과 → 개인별 해석 → 생활 실천 (기계적 ‘이어서 N’ 제목 없음) */
function buildTopicPages(item, reading, western, partLabel) {
  const chart = reading.chart;
  const pages = [];
  const pt = withTopic(item.id || "default");
  const core = topicCoreLine(item);
  const counsel = buildTopicCounselSections(item, reading, western);
  const year = reading.yearFortune?.defaultYear;
  const months = reading.yearFortune?.byYear?.[year]?.months || [];

  const topicVisual =
    item.id === "wealth"
      ? svgMonthThemeBars(months, "wealthScore", `${year || ""}년 월별 재물 지수`)
      : item.id === "career"
        ? svgMonthThemeBars(months, "careerScore", `${year || ""}년 월별 직장 지수`)
        : item.id === "marriage"
          ? svgMonthThemeBars(months, "relationScore", `${year || ""}년 월별 대인 지수`)
          : "";

  const byTitle = (re) => counsel.filter((s) => re.test(s.title));
  const resultSecs = byTitle(/원인|성향|핵심/);
  const interpretSecs = byTitle(/현재|향후|주의|역학 포인트|서양/);
  const practiceSecs = byTitle(/실천/);
  // 분류에 안 잡힌 나머지
  const used = new Set([...resultSecs, ...interpretSecs, ...practiceSecs]);
  interpretSecs.push(...counsel.filter((s) => !used.has(s)));

  const toCards = (secs) => secs.map((s) => counselCard(s.title, s.lines, pt)).filter(Boolean);

  // 1) 핵심 결과 + 성향·도표를 가능한 한 같은 흐름으로 (소제목은 강제 새 쪽 금지)
  const resultCards = [
    evidenceForTopic(item, chart),
    core ? counselCard("주제 핵심", [core], pt) : "",
    ...toCards(resultSecs),
  ].filter(Boolean);
  const leadBlocks = [...resultCards];
  if (topicVisual) {
    // 도표는 본문과 함께 — 단독 희소 페이지 방지. 앞이 과하면 성향 블록 앞으로.
    if (bodyWeight(leadBlocks.join("")) < 720) leadBlocks.push(topicVisual);
    else leadBlocks.splice(Math.min(2, leadBlocks.length), 0, topicVisual);
  }
  const leadPacked = packBodies(leadBlocks, 3, 880);
  leadPacked.forEach((chunk, idx) => {
    const parts = String(chunk).split(/(?=<div class="card[\s"]|<div class="visual-slot|<div class="evidence)/).filter(Boolean);
    const title =
      idx === 0 ? `${partLabel} · ${item.title}` : `${item.title} · 타고난 성향·보완`;
    const next = sectionBlocks(title, idx === 0 ? "핵심" : "보완", parts.length ? parts : [chunk]);
    if (
      pages.length &&
      idx > 0 &&
      bodyWeight(pages[pages.length - 1]) + bodyWeight(next) <= 900
    ) {
      pages[pages.length - 1] = `${pages[pages.length - 1]}\n<hr class="rule" />\n${next}`;
    } else {
      pages.push(next);
    }
  });

  if (item.id === "career") {
    pages.push(...buildCareerGuidePages(reading, partLabel));
  }

  // 2) 개인별 해석 — 소제목을 유지한 채 이어 붙이되 A4 오버플로는 피함
  const interpretCards = toCards(interpretSecs);
  const interpretPacked = packBodies(interpretCards, 3, 880);
  while (interpretPacked.length >= 2) {
    const last = interpretPacked[interpretPacked.length - 1];
    const prev = interpretPacked[interpretPacked.length - 2];
    if (bodyWeight(last) < 700 && bodyWeight(prev) + bodyWeight(last) <= 900) {
      interpretPacked[interpretPacked.length - 2] = `${prev}\n${last}`;
      interpretPacked.pop();
    } else break;
  }
  const deferredInterpretCards = [];
  interpretPacked.forEach((chunk, idx) => {
    const parts = String(chunk).split(/(?=<div class="card[\s"])/).filter(Boolean);
    const title =
      idx === 0 ? `${item.title} · 개인별 해석` : `${item.title} · 흐름·주의`;
    const next = sectionBlocks(title, "해석", parts.length ? parts : [chunk]);
    if (pages.length && bodyWeight(pages[pages.length - 1]) + bodyWeight(next) <= 900) {
      pages[pages.length - 1] = `${pages[pages.length - 1]}\n<hr class="rule" />\n${next}`;
    } else if (idx > 0 && bodyWeight(next) < 680) {
      deferredInterpretCards.push(...(parts.length ? parts : [chunk]));
    } else {
      pages.push(next);
    }
  });

  // 3) 생활 속 실천 (+ 학과·월별 포인트)
  const practiceCards = [...deferredInterpretCards, ...toCards(practiceSecs)];
  if (item.id === "career" && (item.majors?.lines?.length || item.timing?.lines?.length)) {
    if (item.majors?.lines?.length) {
      practiceCards.push(counselCard(item.majors.title || "맞춤 학과·전공", item.majors.lines, pt));
    }
    if (item.timing?.lines?.length) {
      practiceCards.push(counselCard(item.timing.title || "진학·시험·이직 시기", item.timing.lines, pt));
    }
  }
  if (item.months?.length) {
    const mid = Math.ceil(item.months.length / 2);
    practiceCards.push(
      counselCard(
        "월별 리듬 (전반)",
        item.months.slice(0, mid).map((m) => `${m.month}월 · ${m.body}${m.tip ? ` — ${m.tip}` : ""}`),
        pt,
      ),
    );
    if (item.months.length > mid) {
      practiceCards.push(
        counselCard(
          "월별 리듬 (후반)",
          item.months.slice(mid).map((m) => `${m.month}월 · ${m.body}${m.tip ? ` — ${m.tip}` : ""}`),
          pt,
        ),
      );
    }
  }
  if (practiceCards.length) {
    const practicePacked = packBodies(practiceCards, 3, 880);
    practicePacked.forEach((chunk, idx) => {
      const parts = String(chunk).split(/(?=<div class="card[\s"])/).filter(Boolean);
      const title = idx === 0 ? `${item.title} · 생활 속 실천` : `${item.title} · 실천·리듬`;
      const next = sectionBlocks(title, "실천", parts.length ? parts : [chunk]);
      if (pages.length && bodyWeight(pages[pages.length - 1]) + bodyWeight(next) <= 900) {
        pages[pages.length - 1] = `${pages[pages.length - 1]}\n<hr class="rule" />\n${next}`;
      } else {
        pages.push(next);
      }
    });
  }

  return mergeSparseBodies(pages, 900);
}

function buildDaYunPages(reading) {
  const chart = reading.chart;
  const cycles = chart.daYun?.cycles || [];
  const birthYear = chart.solar?.year;
  const pages = [];
  const pt = withTopic("year");
  let daYunOrdinal = 0;
  const rows = cycles
    .map((c) => {
      const pre = isPreDaYunCycle(c);
      if (!pre) daYunOrdinal += 1;
      const label = displayDaYunLabel(c);
      const stageBits = lifeStagesOverlappingCycle(c)
        .map((s) => s.shortTitle)
        .join("·");
      return `<tr><td>${esc(pre ? "—" : daYunOrdinal)}</td><td>${esc(label)}</td><td>${esc(c.startYear)}~${esc(c.endYear)}</td><td>${esc(c.startAge)}~${esc(c.endAge)}세</td><td>${esc(pre ? "대운 시작 전" : stageBits || "—")}</td></tr>`;
    })
    .join("");
  pages.push(
    sectionBlocks("제9부 · 평생 대운 흐름표", "대운", [
      card("대운 개요", [
        pt(`대운은 ${chart.daYun?.forward ? "순행" : "역행"}이며, 첫 큰 흐름은 ${chart.daYun?.startText || "—"} 무렵 시작합니다.`),
        pt(LIFE_STAGE_CRITERIA_TEXT),
        pt("아래 표의 10년 대운 순번·간지는 계산 엔진 값 그대로이며, 초년·중년·말년은 오른쪽 생애 단계 참고란에만 표시합니다."),
        pt(reading.tenYear?.summary || "앞으로 10년 세운과 대운을 겹쳐 보면 ‘언제 밀지/기다릴지’가 또렷해집니다."),
        birthYear
          ? pt(`출생 양력 ${birthYear}년 기준, 세는나이와 대운 연도는 ‘연도 ≈ 출생연도 + 세는나이 − 1’로 서로 맞는지 맞춰 읽습니다.`)
          : "",
      ]
        .filter(Boolean)
        .join("")),
      svgDaYunTimeline(cycles),
    ]),
  );
  pages.push(
    sectionBlocks("제9부 · 대운 일람·10년 흐름", "대운", [
      svgTenYearFlow(reading.tenYear?.years || []),
      tableBlock(
        "대운 구간 일람",
        `<table class="data-table"><thead><tr><th>대운순</th><th>구간</th><th>연도</th><th>세는나이</th><th>겹치는 생애단계</th></tr></thead><tbody>${rows || "<tr><td colspan='5'>대운 데이터를 준비 중입니다.</td></tr>"}</tbody></table>`,
      ),
    ]),
  );

  const ys = yongsinSummary(chart);
  const detailBodies = [];
  daYunOrdinal = 0;
  cycles.forEach((c, ci) => {
    const pre = isPreDaYunCycle(c);
    if (!pre) daYunOrdinal += 1;
    const title = daYunDetailTitle(c, daYunOrdinal);
    const headTag = pre ? "시작전" : displayDaYunLabel(c);
    const gzLine = pre
      ? pt("이 구간에는 아직 대운 간지가 배정되지 않습니다. 표기: 대운 시작 전.")
      : pt(`이 구간의 간지 ${displayDaYunLabel(c)}는 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}과의 역할·합충으로 온도가 갈립니다.`);
    const stages = lifeStagesOverlappingCycle(c)
      .map((s) => `${s.shortTitle || s.title}`)
      .join("·");
    // 반복 안내 문장은 첫 상세에만 — 이후에는 구간 고유 해석만
    detailBodies.push(
      sectionBlocks(`대운 상세 · ${title}`, headTag, [
        card("구간 개요", [
          pt(`${c.startYear}~${c.endYear}년 · 세는나이 ${c.startAge}~${c.endAge}세.`),
          gzLine,
          stages ? pt(`겹치는 생애 단계 참고: ${stages}.`) : "",
          ci === 0 && birthYear
            ? pt(`출생 양력 ${birthYear}년 기준, 연도 ≈ 출생연도 + 세는나이 − 1로 맞춰 읽습니다.`)
            : "",
        ]
          .filter(Boolean)
          .join("")),
        card("흐름 해석", [
          pt(decadeAdviceForCycle(c)),
          pre
            ? pt("대운 시작 전에는 세운·월운의 점수와 서류·수면 준비를 더 세밀히 보세요.")
            : ci === 0
              ? pt(
                  `도움이 되는 기운 ${favorBundlePhrase(ys.hee, "year")}이 대운 글자와 맞으면 기회가, 과하면 부담인 기운 ${favorBundlePhrase(ys.gi, "year")}이 겹치면 속도 조절이 답입니다.`,
                )
              : pt(
                  `${c.startYear}~${c.endYear}년 구간에서는 세운 점수와 준비·관계를 같은 메모에 두고 ‘밀지/기다릴지’만 고르세요.`,
                ),
        ]
          .filter(Boolean)
          .join("")),
        card("실천 포인트", [
          pt(
            `이 구간에서 직업·재물·관계 중 우선순위 하나를 정하세요. (역할 참고: ${
              reading.profile?.role === "owner" ? "사업" : reading.profile?.role === "seeker" ? "취업·진학" : "직장"
            })`,
          ),
          ci === 0 ? pt("10년 안에서도 세운 점수가 낮은 해에는 확장보다 정리·자격·휴식을 우선하세요.") : "",
        ]
          .filter(Boolean)
          .join("")),
      ]),
    );
  });
  // 대운 상세는 1구간=1장 기준으로 두되, 얇으면 인접 구간과 합침
  pages.push(...mergeSparseBodies(detailBodies, 900));

  const lifePhases = phasesOfCycles(cycles, reading.profile || {});
  const lifeFlow = buildDaYunLifeFlow(chart, reading.guide);
  pages.push(
    `${head("생애 단계 · 초년·중년·말년", "생애")}
    ${card("구분 기준", [
      pt("초년·중년·말년은 10년 대운 순번(1번째·2번째·3번째)과 같지 않습니다. 어린 나이의 대운을 중년·말년으로 부르지 않습니다."),
    ].join(""))}
    ${lifePhases
      .map((phase) =>
        card(
          `${phase.title} (${phase.from}~${phase.to === 120 ? "이후" : phase.to}세)`,
          [pt(`${phase.summary}${phase.roleNote || ""}`)].join(""),
        ),
      )
      .join("")}
    ${
      lifeFlow?.lines?.length
        ? card(lifeFlow.title || "생활 속 운의 흐름", lifeFlow.lines.map((line) => pt(line)).join(""))
        : ""
    }`,
  );

  return mergeSparseBodies(pages, 1000);
}

function buildYearDetailPages(reading, western) {
  const years = reading.tenYear?.years || [];
  const chart = reading.chart;
  const ys = yongsinSummary(chart);
  const pt = withTopic("year");
  const yearGuide = topicEvidenceGuide("year");
  // 연도=1장: 카드 수를 줄여 얇은 꼬리 장·하단 공백이 생기지 않게 함(개인 점수·문장은 유지)
  const bodies = years.map((y, yi) => {
    // 제목+근거 요약을 keep — 첫 해만 가이드를 총평에 녹여 한 장을 넘기지 않음
    const evidenceLead = `<div class="evidence"><h3>명리학적 근거</h3>
        ${pt(`${y.gzFull || y.gzKo || ""} · 세는나이 ${y.age}세 · 종합 ${y.score}점(${y.level || ""}) · 별점 ${y.stars || "—"}/5 · 일간 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} × 세운 ${y.gzKo || y.gz || ""} · 재물 ${y.wealth?.score ?? "—"} · 직업 ${y.career?.score ?? "—"} · 관계 ${y.love?.score ?? "—"}`)}
      </div>`;
    const pace =
      Number(y.score) >= 64
        ? "점수가 비교적 높은 해입니다. 추진하되 수면·쉬는 일정을 지키세요."
        : "점수가 높지 않은 해입니다. 속도를 낮추고 서류·휴식·관계를 먼저 점검하세요.";
    const lifeLines = uniqueParagraphs(y.lifeFlow?.lines || []).slice(0, 2);
    const summaryExtra =
      yi === 0
        ? pt(
            `${yearGuide} 도움 기운 ${favorBundlePhrase(ys.hee, "year")}이 세운과 맞닿으면 기회가, 과하면 부담인 기운 ${favorBundlePhrase(ys.gi, "year")}이 겹치면 속도 조절이 답입니다.`,
          )
        : pt(`${y.year}년은 종합 ${y.score ?? "—"}점 기준으로 추진·정리의 비중만 조절하세요.`);
    const yearMonths = reading.yearFortune?.byYear?.[y.year]?.months || [];
    const yearMonthChart = yearMonths.length
      ? svgMonthThemeBars(yearMonths, "score", `${y.year}년 월별 종합 지수`)
      : "";
    return `${keepHead(`${y.year}년 세운 심층 리포트`, y.gzFull || y.gzKo || "", evidenceLead)}
      ${card("한 해 총평", [
        pt(y.headline || `${y.year}년 세운 · ${y.level || "흐름"} ${y.score ?? ""}점.`),
        summaryExtra,
      ].join(""))}
      ${card("재물·직업·관계", [
        pt(`재물 ${y.wealth?.score ?? "—"}점(${y.wealth?.level || ""}) · ${y.wealth?.text || "수입·지출·계약 페이스를 점검하세요."}`),
        pt(`직업 ${y.career?.score ?? "—"}점(${y.career?.level || ""}) · ${y.career?.text || "보고·마감·협업 페이스를 점검하세요."}`),
        pt(`관계 ${y.love?.score ?? "—"}점(${y.love?.level || ""}) · ${y.love?.text || "대화·소개·가족 일정을 점검하세요."}`),
      ].join(""))}
      ${card("페이스·실천", [
        pt(pace),
        ...lifeLines.map((line) => pt(line)),
        yi === 0
          ? pt(
              `서양 교차: 세운 점수는 ‘언제 움직일지’, 태양 ${western.sun?.name || "—"}·달 ${western.moon?.name || "—"}은 ‘어떤 태도·휴식이 맞는지’ 참고입니다.`,
            )
          : "",
      ]
        .filter(Boolean)
        .join(""))}
      ${yearMonthChart}`;
  });
  return bodies;
}

/** 월운 상세 — 3개월 단위로 묶어 마지막 한 달만 다음 장으로 가는 일을 막음 */
function buildMonthDetailPages(reading) {
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  const pt = withTopic("timing");
  const timingGuide = topicEvidenceGuide("timing");
  const ys = yongsinSummary(reading.chart);
  const GROUP = 2; // 기본 2개월 묶음(요구사항)
  // A4 한 장에 제목+본문이 함께 들어가도록 — 글자 크기는 유지하고 문단 묶음·쪽 분할로 조절
  // 너무 낮으면 1개월만 남아 하단 공백이 커지므로, 인쇄 추가 분할(~1000↑)만 피함
  // 하단 28mm 여백·바닥글과 겹치지 않게 월 묶음 한도를 보수적으로
  const PAGE_SOFT = 820;

  function monthCardCompact(m, showGuide) {
    // 개인별 월운 문장은 자르지 않음 — 문단만 묶어 세로 여백을 줄임
    const watch = (m.watchDates || []).join(" · ") || "주의일을 달력에 표시하세요.";
    const check = (m.checkDates || []).join(" · ");
    const hints = uniqueParagraphs([...(m.specialHints || []), m.traditionNote].filter(Boolean));
    return card(
      `${m.month}월 · ${m.gzKo || m.gz || ""} · ${m.score ?? "—"}점(${m.level || ""})`,
      [
        showGuide ? pt(timingGuide) : "",
        pt(m.summary || `${m.month}월 월운.`),
        pt(
          `호흡 ${m.diShi || "—"}(${m.diShiEasy || ""}) · 재물 ${m.wealthScore ?? "—"} · 직장 ${m.careerScore ?? "—"} · 대인 ${m.relationScore ?? "—"}`,
        ),
        pt(`재물: ${m.wealth || "—"} / 직장: ${m.career || "—"} / 대인: ${m.relation || "—"}`),
        pt(`주의: ${watch}${check ? ` · 점검: ${check}` : ""}`),
        m.remedy
          ? pt(`개운: ${m.remedy}`)
          : pt(`개운: 부담 기운(${favorBundlePhrase(ys.gi, "timing")})이 센 주에는 일정을 하나 줄이세요.`),
        hints.length ? pt(hints.join(" ")) : "",
        pt(`${m.month}월 실천: 할 일 하나 · 하지 않을 일 하나를 달력에 적으세요.`),
      ]
        .filter(Boolean)
        .join(""),
    );
  }

  // 가중치에 맞춰 2개월씩 묶되, A4를 넘기면 1개월로 나눠 제목·본문 분리를 막음
  const bodies = [];
  let i = 0;
  let groupIndex = 0;
  while (i < months.length) {
    const remain = months.length - i;
    let take = Math.min(GROUP, remain);
    // 마지막 고립 1개월 방지: 3남으면 3 시도, 4→2+2, 5→2+3
    if (remain === 3) take = 3;
    else if (remain === 4) take = 2;
    else if (remain === 5) take = 2;
    const titleOf = (n) =>
      n === 1
        ? `${year}년 ${months[i].month}월 운세`
        : `${year}년 ${months[i].month}~${months[i + n - 1].month}월 운세`;
    // 제목은 항상 첫 월 카드와 한 덩어리 — 과대 카드여도 제목만 다음 장으로 가지 않게
    const packOf = (n, cards) =>
      `<div class="month-pack">${keepHead(titleOf(n), "월운", cards[0])}${cards.slice(1).join("")}</div>`;
    let trialTake = take;
    let cards = months.slice(i, i + trialTake).map((m, j) => monthCardCompact(m, groupIndex === 0 && j === 0));
    let trial = packOf(trialTake, cards);
    while (trialTake > 1 && bodyWeight(trial) > PAGE_SOFT) {
      trialTake -= 1;
      // 뒤에 1개월만 고립되면 한 장 더 줄여 2+2 형태로
      if (remain - trialTake === 1 && trialTake > 1) trialTake -= 1;
      cards = months.slice(i, i + trialTake).map((m, j) => monthCardCompact(m, groupIndex === 0 && j === 0));
      trial = packOf(trialTake, cards);
    }
    bodies.push(trial);
    i += trialTake;
    groupIndex += 1;
  }
  return bodies;
}

function scoreClass(score) {
  if (score >= 74) return "score-good";
  if (score >= 58) return "score-mid";
  return "score-bad";
}

/** 12개월 월운 표 */
function monthTablePage(reading, pageNo) {
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  const rows = months
    .map((m) => {
      // 문장 중간 자르기 금지 — 종결어미까지 그대로 출력
      const keyword = String(m.summary || m.level || "월운 요약을 준비 중입니다.").replace(/\s+/g, " ").trim();
      const watch = String(
        (m.watchDates && m.watchDates.length ? m.watchDates.join(" · ") : "") ||
          m.watch ||
          m.remedy ||
          "주의일을 달력에 표시하세요.",
      )
        .replace(/\s+/g, " ")
        .trim();
      const gz = m.gz ? `${m.gz} (${m.gzKo || ""})` : m.gzKo || "—";
      return `<tr>
        <td class="col-month">${esc(m.month || "")}월</td>
        <td class="col-gz">${esc(gz)}</td>
        <td class="col-score ${scoreClass(Number(m.score) || 0)}">${esc(m.score ?? "—")} · ${esc(m.level || "")}</td>
        <td class="left col-key">${esc(keyword)}</td>
        <td class="left col-watch">${esc(watch)}</td>
      </tr>`;
    })
    .join("");

  const half = Math.ceil((months.length || 12) / 2);
  const rowList = rows ? rows.split(/(?=<tr>)/).filter((r) => /<tr>/.test(r)) : [];
  const tableHtml = (sliceRows, caption) =>
    tableBlock(
      caption,
      `<table class="data-table month-flow">
      <thead><tr>
        <th class="col-month">월</th>
        <th class="col-gz">간지</th>
        <th class="col-score">길흉 지수</th>
        <th class="col-key">핵심 키워드</th>
        <th class="col-watch">주의점</th>
      </tr></thead>
      <tbody>${sliceRows.join("") || `<tr><td colspan="5">월운 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>`,
    );

  // 그래프+상반기 표 한 장 / 하반기 표 한 장 — 그래프 아래 공백을 표로 채움
  return [
    page(
      sectionBlocks(`${year}년 월운 흐름·상반기`, "월운", [
        `<p class="quiet" style="margin:0 0 2px">월별 길흉 그래프와 1~${half}월 키워드·주의점입니다. 다음 장에서 하반기 표를 이어서 보세요.</p>`,
        svgMonthFlowBars(months, `${year}년`),
        `<div style="margin-top:2px">${tableHtml(rowList.slice(0, half), `1~${half}월 길흉·주의점`)}</div>`,
      ]),
      pageNo,
      "chapter keep-apart",
    ),
    page(
      sectionBlocks(`${year}년 ${half + 1}~12월 길흉·주의점`, "월운", [
        tableHtml(rowList.slice(half), "하반기 월별 길흉·주의점"),
        // 큰 도표는 상반기 장에 있음 — 하반기는 소형 장식으로 하단만 보완(오버플로 방지)
        svgOrnamentWave(),
      ]),
      pageNo + 1,
      "keep-apart",
    ),
  ];
}

/** 10년 세운 연도별 요약 — 그래프는 제9부 평생 대운 장에 1회만 배치(중복 방지) */
function tenYearChartPage(reading, pageNo) {
  const years = reading.tenYear?.years || [];
  const list = years
    .map(
      (y) =>
        `<li><strong>${esc(String(y.year))}</strong> ${esc(y.gzFull || y.gzKo || "")} · ${esc(y.level || "")} ${esc(String(y.score ?? ""))} — ${esc(String(y.headline || ""))}</li>`,
    )
    .join("");

  return page(
    `<div class="section-head"><h2>10년 세운 연도별 요약</h2><span class="num">十年要點</span></div>
    ${card("읽는 법", [
      p("제9부 그래프의 꺾은선은 세운 종합 점수의 상대 흐름입니다. 높은 해는 추진·낮은 해는 정리·휴식의 참고이며, 단정적 예언이 아닙니다."),
      p(reading.tenYear?.summary || "대운 구간과 겹쳐 보면 ‘언제 밀지/기다릴지’가 또렷해집니다."),
    ].join(""))}
    <ul class="year-points">${list || "<li>10년 세운 데이터를 준비 중입니다.</li>"}</ul>
    ${card("활용", p("점수와 한 줄 요약을 달력·업무 메모에 옮긴 뒤, 뒤이어지는 연도별 심층 장을 함께 보세요."))}`,
    pageNo,
    "flow",
  );
}

function closingPage(reading, pageNo) {
  const chart = reading.chart;
  const ys = yongsinSummary(chart);
  const engines = engineMap(reading);
  const pillars = (chart.pillars || []).map((x) => x.gzKo).filter(Boolean).join(" · ") || "—";
  const checklist = [
    reading.guide?.summary,
    reading.bridge,
    `도움 기운 ${favorBundlePhrase(ys.hee)}을 들이는 작은 규칙 하나`,
    `과하면 부담인 기운 ${favorBundlePhrase(ys.gi)}이 센 날의 ‘하지 않을 일’ 하나`,
    engines.qimen?.summary ? `방위·동선: ${engines.qimen.summary}` : null,
  ].filter(Boolean);
  return page(
    `${head("맺음", "맺음")}
    ${solidCard(
      "한 권의 정리",
      [
        p(
          `${reading.displayName} 님의 천기노트 맞춤 리포트를 마칩니다. 네 기둥 ${pillars}. ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}. ${strengthPhrase(chart.strength?.label)}.`,
        ),
        p(
          "본 자료는 참고용 안내이며 의료·투자·법률 판단을 대신하지 않습니다. 단정적 예언이 아니라 점검 기준으로 쓰세요.",
        ),
      ].join(""),
      "closing-card",
    )}
    ${solidCard(
      "가져갈 점검 목록",
      checklist.map((line) => p(line)).join("") ||
        p("좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다."),
      "closing-card",
    )}
    ${solidCard(
      "다음 한 달",
      [
        p("월운 표의 주의일·점검일을 달력에 옮기고, 세운 점수와 대운 구간을 한 줄로 메모하세요."),
        p("도움 기운을 들이는 규칙 하나와, 부담이 센 날의 ‘하지 않을 일’ 하나를 이번 주 메모에 함께 적으세요."),
        p("흐름을 점검할 기준을 메모에 남기면 일상의 선택이 한결 또렷해집니다."),
      ].join(""),
      "closing-card",
    )}
    ${svgWuxingBalance(chart.count || {})}`,
    pageNo,
  );
}

function appendBodies(pages, bodies, startNo, { chapterFirst = false, chapterEach = false, keepApart = false } = {}) {
  let n = startNo;
  const out = [];
  bodies.forEach((html, idx) => {
    n += 1;
    const parts = [];
    if (chapterEach || (chapterFirst && idx === 0)) parts.push("chapter");
    if (keepApart) parts.push("keep-apart");
    else parts.push("flow");
    out.push(page(html, n, parts.join(" ")));
  });
  return { pages: out, nextNo: n };
}

/** 단품 — 표지·한눈·주제 심층(약 8~10p) */
export function generateSingleProductHtml(reading, topicId, options = {}) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const item = pack.items.find((row) => row.id === topicId) || pack.items[0];
  const planLabel = coverPlanLabel("single", item.title);
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading, planLabel));
  n = 1;
  pages.push(reportIntroPage(reading, ++n));
  pages.push(overviewPage(reading, ++n));
  // 단품은 용어 안내 1장만 — 불필요한 쪽수 증가 완화
  pages.push(glossaryGuidePages(reading, ++n)[0]);
  const topic = appendBodies(pages, buildTopicPages(item, reading, western, "심층"), n);
  pages.push(...topic.pages);
  n = topic.nextNo;
  pages.push(closingPage(reading, ++n));
  const bank = createVisualBank(reading);
  const balanced = balanceWrappedPages(pages, bank);
  return wrap(
    `${reading.displayName} · ${item.title} 천기노트`,
    finalizePageList(balanced, options.totalPagesOverride).join("\n"),
  );
}

/** 3종 */
export function generateTripleProductHtml(reading, selectedIds = [], options = {}) {
  const ids = selectedIds.length ? selectedIds.slice(0, 3) : ["wealth", "career", "marriage"];
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const titles = ids.map((id) => pack.items.find((row) => row.id === id)?.title).filter(Boolean);
  const planLabel = coverPlanLabel("triple", titles.join(" · ") || "선택 구성");
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading, planLabel));
  n = 1;
  pages.push(reportIntroPage(reading, ++n));
  pages.push(overviewPage(reading, ++n));
  pages.push(...glossaryGuidePages(reading, ++n));
  n += 1;
  pages.push(tocPage(++n));
  ids.forEach((id, index) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const topic = appendBodies(pages, buildTopicPages(item, reading, western, `제${index + 2}부`), n);
    pages.push(...topic.pages);
    n = topic.nextNo;
  });
  pages.push(closingPage(reading, ++n));
  return wrap(
    `${reading.displayName} · 3가지 맞춤 천기노트`,
    finalizePageList(pages, options.totalPagesOverride).join("\n"),
  );
}

/**
 * 풀 패키지 — 자연 분량(강제 패딩·절삭 없음)
 */
export function generateFullProductHtml(reading, options = {}) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let n = 0;

  pages.push(traditionalCover(reading, coverPlanLabel("full")));
  n = 1;
  pages.push(reportIntroPage(reading, ++n));
  pages.push(overviewPage(reading, ++n));
  pages.push(...glossaryGuidePages(reading, ++n));
  n += 1;
  pages.push(tocPage(++n));

  const origin = appendBodies(pages, buildOriginPages(reading, western), n, { chapterFirst: true });
  pages.push(...origin.pages);
  n = origin.nextNo;

  {
    const list = reading.engines || [];
    const mid = Math.ceil(list.length / 2);
    const mk = (slice, title, num, chapter) =>
      page(
        `${head(title, num)}
        ${card(
          "계산 결과 안내",
          p("아래는 입력 명식으로 계산된 엔진 요약입니다. 없는 결과는 만들지 않으며, 참고용으로만 읽습니다."),
        )}
        ${slice
          .map((e) => {
            const isName = e.id === "name" || /성명/.test(String(e.name || ""));
            let extra = "";
            if (isName && reading.hanja) {
              const syllables = (e.hanja?.syllables || [])
                .map((s) => `${s.ch}${s.stroke != null ? `${s.stroke}획` : ""}`)
                .join(" · ");
              extra = p(
                `적용 한자 성명: ${esc(reading.hanja)}${syllables ? ` (${esc(syllables)})` : ""}. 관리자·고객이 확인한 한자만 성명학에 반영했습니다.`,
              );
            } else if (isName && !reading.hanja) {
              extra = p("한자 성명 미입력 — 한글 자획만 사용했으며, 임의의 한자나 획수를 만들지 않았습니다.");
            }
            return card(
              e.name || e.id || "역학",
              `${extra}${p(e.summary || "이 엔진의 상세 요약은 주제 장·본원 장에서 이어서 확인하세요.")}`,
            );
          })
          .join("")}`,
        ++n,
        chapter ? "flow chapter" : "flow",
      );
    if (list.length) {
      pages.push(mk(list.slice(0, mid), "아홉 갈래 역학 렌즈 · 1", "역학1", true));
      pages.push(mk(list.slice(mid), "아홉 갈래 역학 렌즈 · 2", "역학2", false));
    }
  }

  const order = ["wealth", "career", "business", "marriage", "compatibility", "children", "health", "moving", "travel"];
  const partNos = ["제2부", "제3부", "제4부", "제5부", "제6부", "제7부", "제8부", "제8부", "제8부"];
  order.forEach((id, index) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const label = partNos[index] || `제${index + 2}부`;
    const topic = appendBodies(pages, buildTopicPages(item, reading, western, label), n, {
      chapterFirst: true,
    });
    pages.push(...topic.pages);
    n = topic.nextNo;
  });

  const dayun = appendBodies(pages, buildDaYunPages(reading), n, { chapterFirst: true });
  pages.push(...dayun.pages);
  n = dayun.nextNo;

  {
    const tenChart = tenYearChartPage(reading, ++n);
    pages.push(String(tenChart).replace(/class="page(\s|")/, 'class="page chapter$1'));
  }

  // 세운 연도마다 새 장 시작 + keep-apart (제목 고립·합침 방지)
  const years = appendBodies(pages, buildYearDetailPages(reading, western), n, {
    chapterEach: true,
    keepApart: true,
  });
  pages.push(...years.pages);
  n = years.nextNo;

  {
    const monthTablePages = monthTablePage(reading, ++n);
    const list = Array.isArray(monthTablePages) ? monthTablePages : [monthTablePages];
    pages.push(...list);
    n += list.length - 1;
  }
  // 월별 묶음(1~2월 등)마다 새 장 시작
  const months = appendBodies(pages, buildMonthDetailPages(reading), n, {
    chapterEach: true,
    keepApart: true,
  });
  pages.push(...months.pages);
  n = months.nextNo;

  if (reading.guide) {
    const ys = yongsinSummary(reading.chart);
    const qimen = engineMap(reading).qimen;
    const remedy = buildRemedyGuide(reading.chart);
    pages.push(
      page(
        `${keepHead(
          "운을 좋게 하는 비법 · 7대 비교표",
          "개운1",
          `<div class="evidence"><h3>명리학적 근거 요약</h3>
          ${p(remedy.intro)}
          ${p(`도움이 되는 기운 ${favorBundlePhrase(ys.hee)}을 식탁·색·방위에 먼저 들이고, 과하면 부담인 기운 ${favorBundlePhrase(ys.gi)}은 줄입니다.`)}
        </div>`,
        )}
        ${card("좋은 영향과 줄일 영향", tableBlock("비교표", renderRemedyCompareTable(remedy.rows)))}`,
        ++n,
        "flow chapter",
      ),
    );
    pages.push(
      page(
        `${keepHead(
          "맞춤 개운법 · 생활 적용 체크",
          "개운2",
          card("음식·습관", [p(reading.guide.table?.foods?.join(", ")), p(reading.guide.table?.habit)].join("")),
        )}
        ${card("색", (reading.guide.palette?.items || []).map((item) => p(`${item.title} · ${item.name} — ${item.text}`)).join(""))}
        ${card("방위", p(qimen?.summary || reading.bridge || "생문·개문 쪽을 밝히고 사문만 피하세요."))}
        ${card("오늘부터 하나", p("위 비교표에서 ‘좋은 영향’ 칸 중 음식·색깔·숫자만 골라 이번 주 규칙 3개로 적으세요."))}`,
        ++n,
        "flow",
      ),
    );
    pages.push(
      page(
        `${head("관재·사고·갈등 예방 개운", "개운3")}
        ${(reading.guide.risks || []).map((risk) => card(risk.title, [p(risk.warning), p(`막는 법 · ${risk.remedy}`)].join(""))).join("") || card("예방", p("큰 송금·감정적인 장문·수면 부족을 피하는 것이 가장 싼 개운입니다."))}
        ${card("택일 원칙", [p("좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다."), p(pack.lifetime?.summary || "평생 총운의 큰 물줄기를 기억하고, 월운·세운으로 미세 조정하세요.")].join(""))}`,
        ++n,
        "flow",
      ),
    );
  }

  const lifetime = pack.lifetime;
  if (lifetime?.sections?.length) {
    lifetime.sections.forEach((section, si) => {
      const body = card("구간 풀이", (section.lines || []).map((line) => p(line)).join(""));
      pages.push(
        page(
          `${keepHead(`평생 총운 · ${section.title}`, "총운", body)}
          ${si === 0 && lifetime.summary ? card("한 줄 연결", p(lifetime.summary)) : ""}`,
          ++n,
          si === 0 ? "flow chapter" : "flow",
        ),
      );
    });
  }

  pages.push(closingPage(reading, ++n));

  // 전체 페이지: 얇은 장 병합·실데이터 도표/삽화로 하단 공백 보정(임의 수치·반복 삽화 금지)
  const bank = createVisualBank(reading);
  const balanced = balanceWrappedPages(pages, bank);
  return wrap(
    `${reading.displayName} · 천기노트 풀 패키지`,
    finalizePageList(balanced, options.totalPagesOverride).join("\n"),
  );
}

export function generateProductReportHtml(reading, options = {}) {
  reportSubject = reading;
  resetReportDedupe();
  try {
    const mode = options.mode || "full";
    if (mode === "single") {
      return generateSingleProductHtml(
        reading,
        options.topicId || options.selected?.[0] || "wealth",
        options,
      );
    }
    if (mode === "triple") {
      return generateTripleProductHtml(reading, options.selected || [], options);
    }
    return generateFullProductHtml(reading, options);
  } finally {
    reportSubject = null;
    resetReportDedupe();
  }
}
