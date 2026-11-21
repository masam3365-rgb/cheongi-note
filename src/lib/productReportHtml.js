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
  strengthPhrase,
  termChip,
  termSummaryLine,
  topicEvidenceGuide,
} from "./plainTerms.js";
import { buildCareerPlaybook, buildRemedyGuide } from "./careerRemedyGuide.js";
import { BRANCH_ELEMENT, STEM_ELEMENT, koGz, mainStem, tenGod } from "./ganzhi.js";

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
  return `<table class="compare-table">
    <thead><tr><th>구분</th><th>좋은 영향을 주는 것 (용신·희신 보강)</th><th>피하거나 줄여야 할 것 (기신 절제)</th></tr></thead>
    <tbody>${body}</tbody>
  </table>`;
}

function buildCareerGuidePages(reading, partLabel) {
  const chart = reading.chart;
  const play = buildCareerPlaybook(chart);
  const pt = withTopic("career");
  const pages = [];

  pages.push(
    `${head(`${partLabel} · 진로 지침서 1`, "進路 1/2")}
    <div class="evidence"><h3>명리학적 근거 요약</h3>
      ${pt(play.primaryIntro)}
      ${pt(topicEvidenceGuide("career"))}
    </div>
    ${card("1순위 · 최상위 적성 분야 & 현대 추천 직종", renderFieldBlocks(play.primaryFields))}
    ${card("읽는 법", pt("위 직종은 2026년 산업 기준으로 정리한 목록입니다. 한 분야를 고른 뒤, 그 안의 직종 2~3개만 포트폴리오·자격·인턴 후보로 좁히면 실행이 빨라집니다."))}`,
  );

  pages.push(
    `${head(`${partLabel} · 진로 지침서 2`, "進路 2/2")}
    <div class="evidence"><h3>차선책 안내</h3>${pt(play.secondaryIntro)}</div>
    ${card("2순위 · 안정 성취 직종 (중위급)", renderFieldBlocks(play.secondaryFields))}
    ${card("대학 전공 선택 팁", pt(play.majorTipText))}
    ${card("한 줄 실천", pt(`이번 주, 1순위 분야 중 하나와 차선 분야 중 하나를 고르고 ‘관심 직종 3개’만 메모하세요. 사회 태도(월주) ${chart.monthGod || "—"} 결도 함께 보세요.`))}`,
  );

  return pages;
}

function card(title, body) {
  return `<div class="card"><h3>${esc(title)}</h3>${body}</div>`;
}

function footer(n) {
  return `<div class="footer">달빛 사주관 · 四柱精密分析 &nbsp;|&nbsp; ${n}</div>`;
}

const WX_COLOR = {
  목: { bg: "#e8f5e9", fg: "#1b5e20", border: "#66bb6a", label: "木" },
  화: { bg: "#ffebee", fg: "#8b0000", border: "#e57373", label: "火" },
  토: { bg: "#fff8e1", fg: "#7a4f01", border: "#ffb74d", label: "土" },
  금: { bg: "#f5f5f5", fg: "#424242", border: "#c9a227", label: "金" },
  수: { bg: "#e3f2fd", fg: "#0d47a1", border: "#64b5f6", label: "水" },
};

const STYLES = `
@page { size: A4; margin: 10mm 12mm; }
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
  font-size: 12.5px;
  line-height: 1.65;
}
.page {
  width: 100%;
  min-height: calc(297mm - 20mm);
  padding: 4mm 2mm 10mm;
  position: relative;
  background: #f7f1e6;
  page-break-after: always;
  break-after: page;
}
.page:last-of-type { page-break-after: auto; break-after: auto; }
.page.cover-page {
  padding: 0;
  min-height: calc(297mm - 20mm);
}
.page.flow { page-break-inside: auto; }
h2 {
  color: #1a2e22;
  border-bottom: 1.5px solid #8b1e1e;
  padding-bottom: 5px;
  font-size: 15px;
  margin: 0 0 8px;
  break-after: avoid;
}
h3 { color: #1a2e22; font-size: 13px; margin: 0 0 5px; break-after: avoid; }
.card {
  background: #fffdf8;
  border: 1px solid #d9cbb0;
  padding: 10px 12px;
  border-radius: 3px;
  margin-bottom: 8px;
  break-inside: avoid;
}
.card p { font-size: 12.2px; line-height: 1.7; color: #3a342e; margin: 0 0 5px; }
.card p:last-child { margin-bottom: 0; }
.evidence {
  background: linear-gradient(180deg, #f3ebe0 0%, #fffdf8 100%);
  border: 1px solid #c4a574;
  border-left: 4px solid #8b1e1e;
  padding: 8px 10px;
  margin-bottom: 8px;
  break-inside: avoid;
}
.evidence h3 { color: #8b1e1e; font-size: 12px; margin: 0 0 4px; letter-spacing: .04em; }
.evidence .chips { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.chip {
  display: inline-block;
  border: 1px solid #c4a574;
  background: #fff;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 10.5px;
  color: #4a3f32;
}
.dense { columns: 1; }
.dense .card { margin-bottom: 7px; }
.footer {
  margin-top: 10px;
  text-align: center;
  font-size: 10px;
  color: #8c857b;
  border-top: 1px solid #e2dac9;
  padding-top: 5px;
}
.quiet { color: #7a8b80; font-size: 11px; }
.section-head {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
  margin: 0 0 8px; border-bottom: 2px solid #1a2e22; padding-bottom: 4px;
}
.section-head h2 { border: none; margin: 0; padding: 0; font-size: 16px; }
.section-head .num { color: #8b1e1e; font-size: 11px; letter-spacing: .12em; }

/* —— 선장본 표지 —— */
.book-cover {
  position: relative;
  min-height: calc(297mm - 20mm);
  background:
    radial-gradient(ellipse at 70% 30%, rgba(212,175,55,.12), transparent 55%),
    linear-gradient(160deg, #f4ecd8 0%, #e8dcc4 45%, #d9c9a8 100%);
  border: 10px double #5c1a1a;
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
  position: absolute; left: 70px; right: 110px; top: 38%;
  text-align: center;
}
.cover-center .brand { font-size: 13px; letter-spacing: .4em; color: #8b1e1e; margin-bottom: 10px; }
.cover-center h1 {
  font-size: 34px; margin: 0 0 10px; color: #1a120c; line-height: 1.35;
  border: none;
}
.cover-center .sub { font-size: 13px; color: #5a4a3a; letter-spacing: .08em; }
.cover-foot {
  position: absolute; left: 70px; right: 36px; bottom: 36px;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;
}
.cover-meta { text-align: left; }
.cover-meta .name { font-size: 20px; font-weight: 700; color: #1a120c; margin-bottom: 6px; }
.cover-meta .gz {
  font-size: 18px; letter-spacing: .18em; color: #3a2a1a;
  font-family: 'Batang', 'Malgun Gothic', serif;
}
.cover-meta .note { margin-top: 6px; font-size: 11px; color: #6a5a4a; }
.seal {
  width: 64px; height: 64px; border: 2px solid #b71c1c; border-radius: 6px;
  color: #b71c1c; display: grid; place-items: center;
  font-size: 28px; font-weight: 700; letter-spacing: .05em;
  transform: rotate(-8deg);
  background: rgba(183,28,28,.06);
  box-shadow: inset 0 0 0 3px rgba(183,28,28,.25);
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
  min-height: 160px;
}
.summary-panel h3 {
  margin: 0 0 6px; color: #8b1e1e; font-size: 13px;
  border-bottom: 1px solid #e2dac9; padding-bottom: 4px;
}

/* —— 목차 —— */
.toc { border: 1px solid #c4a574; background: #fffdf8; padding: 8px 0; }
.toc-row {
  display: grid; grid-template-columns: 72px 1fr; gap: 8px;
  padding: 7px 14px; border-bottom: 1px dashed #e2dac9;
  align-items: start;
}
.toc-row:last-child { border-bottom: none; }
.toc-row .part { color: #8b1e1e; font-weight: 700; font-size: 12px; }
.toc-row .topic { font-size: 12.5px; color: #2a2420; }
.toc-row .topic small { display: block; color: #6a5a4a; font-size: 11px; margin-top: 2px; }

/* —— 표·그래프 —— */
.data-table {
  width: 100%; border-collapse: collapse; font-size: 11px; background: #fff;
}
.data-table th, .data-table td {
  border: 1px solid #d0c0a4; padding: 5px 6px; text-align: center; vertical-align: middle;
}
.data-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; }
.data-table td.left { text-align: left; }
.data-table tr:nth-child(even) td { background: #fcf8f0; }
.data-table.month-flow th, .data-table.month-flow td {
  padding: 3px 4px; font-size: 9.2px; line-height: 1.4; vertical-align: top;
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
.year-points { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 10px; }
.year-points li { font-size: 11px; color: #3a342e; margin: 0 0 3px; list-style: none; }
.year-points li strong { color: #8b1e1e; }
.gloss-table { width: 100%; border-collapse: collapse; font-size: 10.5px; background: #fff; margin-bottom: 8px; }
.gloss-table th, .gloss-table td { border: 1px solid #d0c0a4; padding: 5px 6px; vertical-align: top; text-align: left; }
.gloss-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; white-space: nowrap; }
.gloss-table td.term { font-weight: 700; color: #8b1e1e; white-space: nowrap; width: 72px; }
.gloss-note { font-size: 11px; color: #6a5a4a; margin: 0 0 8px; }
.compare-table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin: 6px 0 8px; }
.compare-table th, .compare-table td { border: 1px solid #d9cbb0; padding: 5px 6px; vertical-align: top; line-height: 1.55; }
.compare-table th { background: #f0e6d4; color: #5c1a1a; font-weight: 700; }
.compare-table td.lbl { width: 72px; font-weight: 700; color: #8b1e1e; background: #faf6ee; white-space: nowrap; }
.compare-table td.good { background: #f3f8f1; }
.compare-table td.bad { background: #fbf4f2; }
.job-block { margin: 0 0 8px; padding: 6px 8px; border: 1px solid #e4d7c0; background: #fffdf8; }
.job-block h4 { margin: 0 0 4px; font-size: 12px; color: #8b1e1e; }
.job-block .jobs { margin: 0; font-size: 11px; line-height: 1.65; color: #3a342e; }

@media print {
  html, body { background: #f7f1e6 !important; }
  .page { width: auto; box-shadow: none; min-height: auto; }
  .page.cover-page { min-height: auto; }
  .no-print { display: none !important; }
}
@media screen {
  body { background: #d9d0c0; padding: 16px 0 48px; }
  .page {
    width: 210mm; max-width: 100%; margin: 0 auto 16px;
    padding: 12mm 12mm 14mm; box-shadow: 0 8px 24px rgba(0,0,0,.1);
  }
  .page.cover-page { padding: 0; min-height: 277mm; }
  .print-hint {
    position: sticky; top: 0; z-index: 20;
    background: #1a2e22; color: #f7f4ed;
    text-align: center; padding: 10px 16px; font-size: 13px;
  }
  .print-hint button {
    margin-left: 10px; border: 1px solid #d4af37; background: #d4af37; color: #1a2e22;
    border-radius: 999px; padding: 4px 12px; cursor: pointer; font-size: 12px;
  }
}
`;

function wrap(title, pagesHtml) {
  const hint = `<div class="print-hint no-print">달빛 사주관 · 四柱精密分析 <button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button></div>`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${esc(title)}</title><style>${STYLES}</style></head><body>${hint}${pagesHtml}</body></html>`;
}

function page(inner, pageNo, extraClass = "") {
  return `<div class="page ${extraClass}"><div class="dense">${inner}</div>${footer(pageNo)}</div>`;
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

/** 1. 선장본 표지 */
function traditionalCover(reading) {
  const chart = reading.chart;
  const gz8 = (chart.pillars || []).map((p) => p.gz).join(" ");
  const stitches = [36, 72, 108, 144, 180, 216, 252]
    .map((top) => `<div class="binding-stitch" style="top:${top}px"></div>`)
    .join("");
  return `<div class="page cover-page">
    <div class="book-cover">
      <div class="binding">${stitches}</div>
      <div class="vert-title">四柱精密分析<small>달빛 사주관</small></div>
      <div class="cover-center">
        <div class="brand">DALBIT SAJUGWAN</div>
        <h1>평생운세<br/>정밀분석 책자</h1>
        <p class="sub">동양 역학 × 서양 점성술 · 근거 데이터와 생활 해설</p>
      </div>
      <div class="cover-foot">
        <div class="cover-meta">
          <div class="name">의뢰인 ${esc(reading.displayName)} 님</div>
          <div class="gz">${esc(gz8)}</div>
          <div class="note">${esc(chart.calendarLabel || "")} ${esc(chart.solarText || "")} · ${esc(chart.genderLabel || "")} · ${esc(dayMasterPhrase(chart.dayMasterKo, chart.dayElement))} · ${esc(strengthPhrase(chart.strength?.label))}</div>
        </div>
        <div class="seal" title="낙관">福</div>
      </div>
    </div>
  </div>`;
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

function glossaryGuidePage(reading, pageNo) {
  const terms = collectChartTerms(reading.chart);
  const godRows = glossRows(terms.gods, TEN_GOD_GLOSS);
  const diRows = glossRows(terms.dishi, DISHI_GLOSS);
  const shaRows = glossRows(terms.shensha, SHENSHA_GLOSS);
  const tips = [...terms.gods, ...terms.dishi, ...terms.shensha]
    .slice(0, 6)
    .map((name) => `<li>${esc(termSummaryLine(name))}</li>`)
    .join("");

  return page(
    `<div class="section-head"><h2>내 사주 핵심 용어 한눈에 보기</h2><span class="num">用語指南</span></div>
    <p class="gloss-note">아래는 ${esc(reading.displayName)} 님 명식에 <strong>실제로 들어 있는</strong> 역할(십신)·기운의 호흡(12운성)·특별 신호와, 모든 사주에 공통인 오행을 골라 <strong>쉬운 말을 앞에</strong> 두고 정리한 가이드입니다. 본문에서도 일상어가 먼저 나오고, 필요할 때만 전문 용어를 괄호로 밝힙니다.</p>
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">오행(목·화·토·금·수) 한눈에 보기</h3>
    <table class="gloss-table">
      <thead><tr><th>오행</th><th>자연 비유 · 삶의 의미</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${wuxingGuideRows()}</tbody>
    </table>
    <h3 style="margin:8px 0 4px;color:#8b1e1e;font-size:12px">십신(나와 세상의 관계 역할)</h3>
    <table class="gloss-table">
      <thead><tr><th>용어</th><th>한자 뜻 · 쉬운 설명</th><th>강점</th><th>주의점</th></tr></thead>
      <tbody>${godRows || `<tr><td colspan="4">십신 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>
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
    </div>`,
    pageNo,
  );
}

/** 3. 10부 차례 */
function tocPage(pageNo) {
  const rows = TOC_PARTS.map(
    (row) => `<div class="toc-row"><div class="part">${esc(row.part)}</div><div class="topic">${esc(row.title)}<small>${esc(row.blurb)}</small></div></div>`,
  ).join("");
  return page(
    `<div class="section-head"><h2>目次 · 열 부의 차례</h2><span class="num">CONTENTS</span></div>
    <p class="quiet" style="margin:0 0 8px">전통 목차처럼 큰 흐름을 먼저 잡고, 각 부에서는 ‘명리 근거 → 현대어 풀이’ 순으로 읽습니다.</p>
    <div class="toc">${rows}</div>`,
    pageNo,
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
        `돈과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.wealth || "—", "wealth")} 쪽입니다. 지금 가장 필요한 기운 ${elementPhrase(ys.yong, "wealth")}이 재물 흐름을 받쳐 줍니다.`,
      );
      break;
    case "career":
      ["정관", "편관", "인성", "비견"].forEach(pushGod);
      lines.push(
        `자리·책임과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.officer || "—", "career")} 쪽입니다. 사회에서 자주 드러나는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
      );
      break;
    case "business":
      ["식신", "상관", "편재", "편관"].forEach(pushGod);
      lines.push(
        `꾸준히 만들어내는 힘·큰 판을 굴리는 힘이 창업·확장의 재료입니다. 이동·출장의 복이 보이면(${koGz(specials.yeokma || "") || "—"}) 확장 운이 잘 붙습니다.`,
      );
      break;
    case "marriage":
    case "compatibility":
      ["정관", "편관", "정재", "편재", "도화"].forEach(pushGod);
      lines.push(
        `배우자·생활 리듬의 자리는 일지 ${chart.pillars?.[2]?.zhiKo || "—"}입니다. 매력·소개의 복과 공부·서류의 복을 함께 봅니다.`,
      );
      break;
    case "children":
      ["식신", "상관", "인성"].forEach(pushGod);
      lines.push(
        `자녀·표현과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.child || "—", "children")} 쪽입니다. 가르침과 표현의 균형으로 읽습니다.`,
      );
      break;
    case "health":
      lines.push(
        `${strengthPhrase(chart.strength?.label)} · 오행 편중을 먼저 봅니다. 과하면 부담이 되는 기운 ${favorBundlePhrase(ys.gi, "health")}이 셀 때 몸·수면이 흔들리기 쉽습니다.`,
      );
      chips.push(...Object.entries(chart.count || {}).map(([k, v]) => `${k}${v}`));
      break;
    case "moving":
      lines.push(
        `이동·출장의 복과 약속이 느슨해지기 쉬운 자리(${chart.xunKong || "—"})가 이사·문서운의 길잡이입니다. 방위·동선은 본문 해설을 따릅니다.`,
      );
      chips.push("역마", "공망");
      break;
    case "travel":
      lines.push(
        `이동의 복·느슨한 자리가 뜨는 해·달에 여행 일정이 잘 맞습니다. 도움이 되는 기운 ${favorBundlePhrase(ys.hee, "travel")} 방위를 우선하세요.`,
      );
      chips.push("역마", favorBundlePhrase(ys.hee, "travel"));
      break;
    default:
      lines.push(
        `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength?.label)}. 지금 가장 필요한 기운 ${elementPhrase(ys.yong)} / 도움이 되는 기운 ${favorBundlePhrase(ys.hee)} / 과하면 부담 ${favorBundlePhrase(ys.gi)}.`,
      );
      chips.push(...gods.slice(0, 4));
  }

  if (item.summary) lines.push(item.summary);
  lines.push(topicEvidenceGuide(topic));

  return `<div class="evidence"><h3>명리학적 근거 요약</h3>${lines.map((l) => pt(l)).join("")}
    <div class="chips">${[...new Set(chips)].filter(Boolean).map((c) => `<span class="chip">${esc(termChip(c))}</span>`).join("")}</div>
  </div>`;
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

/** 제1부 · 본원 약 10페이지 */
function buildOriginPages(reading, western) {
  const chart = reading.chart;
  const ys = yongsinSummary(chart);
  const character = reading.dashboard?.character?.personality;
  const engines = engineMap(reading);
  const pages = [];
  const pt = withTopic("origin");

  pages.push(
    `${head("제1부 · 타고난 본원", "本性 1/10")}${evidenceForTopic({ id: "origin", summary: character?.summary }, chart)}
    ${card("나의 중심 기운 심층", [
      pt(`당신의 기본 본성은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}입니다. 이 중심은 이름표처럼 ‘내가 세상을 대하는 기본 태도’를 보여 줍니다.`),
      pt(`배우자·몸·생활 리듬의 자리(일지)는 ${chart.pillars?.[2]?.zhiKo || "—"}(${chart.pillars?.[2]?.zhi || ""})이고, 기운의 호흡은 ${chart.pillars?.[2]?.diShi || "—"}에 가깝습니다.`),
      pt(character?.summary || reading.guide?.summary || "중심 기운의 결을 생활 언어로 풀면, 선택과 거절의 기준이 또렷해집니다."),
      pt(character?.deep || "깊은 층에서는 익숙한 패턴이 반복됩니다. 패턴에 이름을 붙이면 고치기 쉬워집니다."),
    ].join(""))}`,
  );

  pages.push(
    `${head("월주·사회생활의 결", "本性 2/10")}
    ${card("사회에서 드러나는 역할", [
      pt(`월주는 ${chart.pillars?.[1]?.gzKo || "—"}(${chart.pillars?.[1]?.gz || ""})이며, 사회에서 자주 보이는 역할은 ${chart.monthGod || chart.pillars?.[1]?.shiShen || "—"} 결에 가깝습니다.`),
      pt("월주는 사회·직장·바깥에서의 ‘첫인상과 일 처리 방식’을 보여 줍니다. 집 안 기운(년주)과 내 중심(일주) 사이에서 번역기 역할을 합니다."),
      pt(`납음은 ${chart.pillars?.[1]?.nayin || "—"}, 지장간은 ${(chart.pillars?.[1]?.hide || []).join("·") || "—"}입니다. 지장간이 여러 개면 한 달에 여러 역할이 겹칩니다.`),
      pt(character?.balance || "월주의 결을 존중하되, 중심 기운이 무리하지 않는 선에서 속도를 맞추면 평가와 체력이 함께 갑니다."),
    ].join(""))}`,
  );

  const countLines = Object.entries(chart.count || {}).map(([k, v]) =>
    pt(`${elementPhrase(k, "origin")} ${v} — ${WX_COLOR[k]?.label || k} 기운의 비중입니다.`),
  );
  pages.push(
    `${head("오행 균형 심층", "本性 3/10")}
    ${card("오행 분포", countLines.join("") || pt("오행 분포를 준비 중입니다."))}
    ${card("해석", [
      pt(`${strengthPhrase(chart.strength?.label)} 판정은 나를 돕는 기운 ${chart.strength?.support ?? "—"}대 나를 쓰게 하는 기운 ${chart.strength?.drain ?? "—"}의 비교입니다.`),
      pt(`도움이 되는 기운은 ${favorBundlePhrase(ys.hee, "origin")}, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi, "origin")}입니다. 옷·식탁·방위에 도움 기운을 먼저 들이면 선택이 가벼워집니다.`),
      pt(character?.tip || "오행이 부족한 쪽은 ‘더 하려는 욕심’보다 ‘한 가지를 규칙으로 넣는 일’이 효과가 큽니다."),
    ].join(""))}`,
  );

  const hideCards = (chart.pillars || [])
    .map((pillar) =>
      card(
        `${pillar.label} 지장간 · ${pillar.gzKo}`,
        [
          pt(`지장간: ${(pillar.hide || []).join(" · ") || "—"}. 드러난 글자 아래 숨은 재료입니다.`),
          pt(`지지 오행 ${elementPhrase(BRANCH_ELEMENT[pillar.zhi] || "—", "origin")}, 천간 오행 ${elementPhrase(STEM_ELEMENT[pillar.gan] || "—", "origin")}, 역할은 ${pillar.shiShen || "—"}.`),
          pt("지장간이 나의 중심과 같거나 도움이 되는 기운이면 그 기둥에서 힘이 나고, 과하면 부담이 되는 기운이면 그 시기에 소모가 커집니다."),
        ].join(""),
      ),
    )
    .join("");
  pages.push(`${head("지장간 심층", "本性 4/10")}${hideCards}`);

  const diShiCards = (chart.pillars || [])
    .map((pillar) =>
      card(
        `${pillar.label} 기운의 호흡 · ${pillar.diShi || "—"}`,
        [
          pt(`${pillar.gzKo}의 기운 호흡은 ${pillar.diShi || "—"}입니다. 호흡은 ‘그 글자가 내 중심에게 얼마나 힘을 주는지’의 온도입니다.`),
          pt("시작·정점의 호흡은 추진이, 점검·마무리·비움의 호흡은 정리·휴식이 이득인 리듬으로 읽으면 실전에 가깝습니다."),
        ].join(""),
      ),
    )
    .join("");
  pages.push(`${head("기운의 호흡 심층", "本性 5/10")}${diShiCards}`);

  const specials = chart.specials || {};
  pages.push(
    `${head("특별 신호·느슨한 자리 심층", "本性 6/10")}
    ${card("공부·매력·이동의 복", [
      pt(`공부·서류·글이 붙기 쉬운 글자 ${koGz(specials.munchang || "") || "—"}`),
      pt(`사람·매력·소개가 붙기 쉬운 글자 ${koGz(specials.dohwa || "") || "—"}`),
      pt(`이동·출장·이사·이직이 붙기 쉬운 글자 ${koGz(specials.yeokma || "") || "—"}`),
      pt(`약속이 느슨해지기 쉬운 자리 ${chart.xunKong || "—"} — 중요한 날짜는 문자로 한 번 더 확인하세요.`),
    ].join(""))}
    ${card("기둥별 특별 신호", (chart.pillars || []).map((pillar) => pt(`${pillar.label} ${pillar.gzKo} · ${shenshaForPillar(chart, pillar)}`)).join(""))}`,
  );

  pages.push(
    `${head("체질 온도와 필요·도움·부담 기운", "本性 7/10")}
    ${card("체질 온도", [
      pt(`지금은 ${strengthPhrase(chart.strength?.label)}입니다. ${chart.strength?.strong ? "방향을 정하면 끝까지 밀 수 있지만, 주변 몫까지 혼자 지려 하면 관계가 먼저 피곤해질 수 있습니다." : "옆에서 채워 줄 사람과 환경이 있을 때 더 편하고, 혼자 욕심내기보다 도움을 받는 쪽이 맞습니다."}`),
      pt(`지금 가장 필요한 기운은 ${elementPhrase(ys.yong, "origin")}, 도움이 되는 기운은 ${favorBundlePhrase(ys.hee, "origin")}, 과하면 부담인 기운은 ${favorBundlePhrase(ys.gi, "origin")}입니다. ‘이번 분기 우선순위 하나’로 번역하면 실천이 됩니다.`),
      pt(`역할로 본 오행 — 나를 키우는 쪽 ${elementPhrase(chart.strength?.roles?.mine || "—", "origin")} · 배움·돌봄 ${elementPhrase(chart.strength?.roles?.parent || "—", "origin")} · 표현·결과물 ${elementPhrase(chart.strength?.roles?.child || "—", "origin")} · 재물 ${elementPhrase(chart.strength?.roles?.wealth || "—", "origin")} · 자리·책임 ${elementPhrase(chart.strength?.roles?.officer || "—", "origin")}.`),
    ].join(""))}
    ${card("생활 적용", [
      pt(reading.guide?.summary || "도움이 되는 기운이 들어오는 색·음식·방위를 작은 규칙으로 두면, 운이 막연한 말이 아니라 체크리스트가 됩니다."),
      pt(reading.bridge || "사주의 뼈대와 방위·동선·점성술을 같은 메모에 적으면 결정이 빨라집니다."),
    ].join(""))}`,
  );

  pages.push(
    `${head("서양 점성술 · 태양·달·상승", "本性 8/10")}
    ${card("종합", pt(western.summary || "점성술 요약을 준비 중입니다."))}
    ${card("태양(삶의 목적)", pt(western.sun?.text || ""))}
    ${card("달(속마음·휴식)", pt(western.moon?.text || ""))}
    ${card("상승(첫인상)", pt(western.rising?.text || ""))}`,
  );

  const planetCards = (western.planets || [])
    .slice(0, 6)
    .map((pl) => card(pl.name || pl.id || "행성", pt(pl.text || "")))
    .join("");
  pages.push(
    `${head("주요 행성 심층", "本性 9/10")}
    ${planetCards || card("행성", pt("행성 요약을 준비 중입니다."))}
    ${card("교차 읽기", [
      pt(`${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}과 태양 ${western.sun?.name || "—"}자리를 겹치면, 말과 목표가 한 방향으로 모입니다.`),
      pt(`달 ${western.moon?.name || "—"}자리는 생활 리듬·느슨해지기 쉬운 자리와 함께 ‘언제 쉴지’를 알려 줍니다.`),
    ].join(""))}`,
  );

  pages.push(
    `${head("동양 역학 엔진 교차 · 본원", "本性 10/10")}
    ${card("사주명리", pt(engines.bazi?.summary || `네 기둥 ${(chart.pillars || []).map((x) => x.gzKo).join(" ")} · ${strengthPhrase(chart.strength?.label)}.`))}
    ${card("별자리로 성격을 보조해 읽는 렌즈", pt(engines.ziwei?.summary || reading.dashboard?.character?.ziwei || "별자리 렌즈는 명궁·신궁의 별로 성격을 보조 해석합니다."))}
    ${card("방위·동선으로 때를 보는 렌즈", pt(engines.qimen?.summary || reading.bridge || "방위 렌즈는 살림·책상·출입 방위를 생활 동선으로 번역합니다."))}
    ${card("선택의 태도를 짚는 렌즈", pt(engines.yijing?.summary || "선택의 렌즈는 ‘지금 이 선택의 태도’를 한 줄로 짚어 줍니다. 길흉보다 타이밍과 태도를 보세요."))}
    ${card("실천 한 줄", pt(character?.tip || "이번 주, 도움이 되는 기운을 들이는 작은 규칙 하나만 달력에 적으세요."))}`,
  );

  return pages;
}

/** 제2~8부 주제당 8~10페이지 */
function buildTopicPages(item, reading, western, partLabel) {
  const chart = reading.chart;
  const engines = engineMap(reading);
  const pages = [];
  const east = item.eastern?.paragraphs || [];
  const west = item.western?.paragraphs || [];
  const bridge = item.bridge?.paragraphs || [];
  const sections = item.sections || [];
  const pt = withTopic(item.id || "default");

  pages.push(
    `${head(`${partLabel} · ${item.title}`, "근거")}${evidenceForTopic(item, chart)}
    ${card("주제 요약", pt(item.summary || item.preview || item.blurb || ""))}
    ${card("미리보기", pt(item.preview || item.blurb || ""))}`,
  );

  // 직업·진로: 현대 직종 진로 지침서를 앞쪽에 배치
  if (item.id === "career") {
    pages.push(...buildCareerGuidePages(reading, partLabel));
  }

  // 동양 심층 — paragraphs를 3개씩 (진로는 지침서 우선이라 1페이지로 압축)
  const eastChunks = parasChunk(east, 3);
  const eastLimit = item.id === "career" ? 1 : 3;
  eastChunks.slice(0, eastLimit).forEach((chunk, i) => {
    pages.push(
      `${head(`${item.title} · 동양 역학 심층`, `東 ${i + 1}/${Math.min(eastLimit, eastChunks.length)}`)}
      ${card(item.eastern?.title || "사주·명리 풀이", (chunk.length ? chunk : ["동양 역학 풀이를 준비 중입니다."]).map((line) => pt(line)).join(""))}
      ${i === 0 ? card("별자리 렌즈 관점", pt(engines.ziwei?.summary || engines.ziwei?.lookup?.관록궁 || "별자리 렌즈의 관련 궁·별로 이 주제의 온도를 보조합니다.")) : ""}
      ${i === 1 ? card("방위·동선 렌즈 관점", pt(engines.qimen?.summary || "방위·동선 렌즈로 이 주제의 타이밍을 봅니다.")) : ""}
      ${i === 2 ? card("선택 태도 렌즈 관점", pt(engines.yijing?.summary || "선택 태도 렌즈는 이 주제에서 ‘밀지/기다릴지’를 한 줄로 정리합니다.")) : ""}`,
    );
  });
  while (pages.length < (item.id === "career" ? 5 : 4)) {
    pages.push(
      `${head(`${item.title} · 동양 역학 보강`, "東")}
      ${card("명리 보강", [
        pt(`${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength?.label)}. 이 주제와 맞닿은 역할·오행을 위 근거 박스와 함께 다시 읽습니다.`),
        pt(east[pages.length] || east[0] || `${item.title}은 생활 숫자와 약속을 달력에 옮길 때 점수가 됩니다.`),
        pt(reading.bridge || ""),
      ].join(""))}`,
    );
  }

  // 섹션 상세
  if (sections.length) {
    sections.slice(0, item.id === "career" ? 1 : 2).forEach((section, i) => {
      pages.push(
        `${head(`${item.title} · ${section.title}`, `詳 ${i + 1}`)}
        ${card(section.title, (section.lines || []).map((line) => pt(line)).join("") || pt("상세 풀이를 준비 중입니다."))}
        ${card("적용", pt(`이 장을 한 줄로 줄이면: ${(section.lines || [])[0] || item.summary || ""}`))}`,
      );
    });
  } else if (item.id !== "career") {
    pages.push(
      `${head(`${item.title} · 사주 구조 해설`, "詳")}
      ${card("구조", [
        pt(`네 기둥 ${(chart.pillars || []).map((x) => `${x.label}${x.gzKo}`).join(" · ")}.`),
        pt(`지금 가장 필요한 기운 ${elementPhrase(yongsinSummary(chart).yong, item.id)} · 도움이 되는 기운 ${favorBundlePhrase(yongsinSummary(chart).hee, item.id)} · 과하면 부담 ${favorBundlePhrase(yongsinSummary(chart).gi, item.id)}.`),
        pt(east.slice(0, 2).join(" ") || item.summary || ""),
      ].join(""))}`,
    );
  }

  // 직업 파트: 기존 학과 섹션이 있으면 전공 팁과 연결
  if (item.id === "career" && item.majors?.lines?.length) {
    pages.push(
      `${head(`${item.title} · 학과·시험 타이밍`, "詳")}
      ${card(item.majors.title || "맞춤 학과·전공", (item.majors.lines || []).map((line) => pt(line)).join(""))}
      ${item.timing?.lines?.length ? card(item.timing.title || "시기", item.timing.lines.map((line) => pt(line)).join("")) : ""}`,
    );
  }

  // 서양
  const westChunks = parasChunk(west, 3);
  westChunks.slice(0, 2).forEach((chunk, i) => {
    pages.push(
      `${head(`${item.title} · 서양 점성술 심층`, `西 ${i + 1}`)}
      ${card(item.western?.title || "하우스·행성 풀이", (chunk.length ? chunk : ["서양 점성술 풀이를 준비 중입니다."]).map((line) => pt(line)).join(""))}
      ${i === 0 ? card("태양·달·상승 연결", [pt(western.sun?.text || ""), pt(western.moon?.text || "")].join("")) : card("행성 보조", (western.planets || []).slice(0, 3).map((pl) => pt(`${pl.name}: ${pl.text}`)).join("") || pt(western.summary || ""))}`,
    );
  });

  pages.push(
    `${head(`${item.title} · 동서양 교차`, "交叉")}
    ${card("교차 종합", (bridge.length ? bridge : [`${item.title}에서 사주의 ‘때’와 점성술의 ‘태도’를 같은 메모에 적으세요.`]).map((line) => pt(line)).join(""))}
    ${card("한 줄 실천", pt((item.actions && item.actions[0]) || `${item.title}에서 이번 주 할 일 하나만 달력에 적으세요.`))}`,
  );

  // 시기·행동
  const timingBody = [
    ...(item.timing?.lines || []),
    ...(item.taegilGuide?.lines || []),
    ...(item.majors?.lines || []),
  ];
  pages.push(
    `${head(`${item.title} · 시기별 유불리`, "時期")}
    ${card(item.timing?.title || item.taegilGuide?.title || "유리한 시기", (timingBody.length ? timingBody : [`${item.title}의 유리한 달은 월운·세운 표를 함께 보세요.`, `도움이 되는 기운 ${favorBundlePhrase(yongsinSummary(chart).hee, item.id)}이 들어오는 해·달이 비교적 수월합니다.`]).map((line) => pt(line)).join(""))}
    ${item.months?.length ? card("월별 포인트", item.months.map((m) => pt(`${m.month}월 · ${m.body} — ${m.tip}`)).join("")) : ""}`,
  );

  pages.push(
    `${head(`${item.title} · 실전 행동 지침`, "行動")}
    ${card("지금 바로", (item.actions?.length ? item.actions : [`${item.title} 관련 할 일 하나와 하지 않을 일 하나를 적으세요.`]).map((line) => pt(line)).join(""))}
    ${card("점검 질문", [
      pt("이번 달 숫자·약속·사람을 달력에 옮겼는가?"),
      pt("도움이 되는 기운을 들이는 작은 규칙이 있는가?"),
      pt("과하면 부담이 되는 기운이 센 날에는 큰 결정을 하루 미루는가?"),
    ].join(""))}
    ${card("엔진 보조", [
      pt(engines.qimen?.summary || "방위·동선으로 책상·출입·휴식 자리를 한 번 정리하세요."),
      pt(engines.ziwei?.summary || "별자리 렌즈의 관련 궁을 생활 역할로 번역해 보세요."),
    ].join(""))}`,
  );

  // 주제당 8페이지 전후 유지(전체 110~120p 배분)
  while (pages.length < 8) {
    const idx = pages.length;
    pages.push(
      `${head(`${item.title} · 심화 노트 ${idx - 6}`, "補")}
      ${card("심화", [
        pt(east[idx] || west[idx % Math.max(1, west.length)] || `${item.title}은 한 해를 ‘크게 벌리기’보다 ‘기록과 마감’으로 점수를 냅니다.`),
        pt(`${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}, 월주 역할 ${chart.monthGod || "—"}, 느슨해지기 쉬운 자리 ${chart.xunKong || "—"}.`),
        pt((item.actions && item.actions[idx % item.actions.length]) || "오늘 하지 않을 일 하나가 내일을 엽니다."),
      ].join(""))}
      ${card("생활 번역", pt(bridge[idx % Math.max(1, bridge.length)] || reading.bridge || "동양 역학의 때와 서양 점성술의 태도를 한 메모에 적으세요."))}`,
    );
  }
  return pages.slice(0, item.id === "career" ? 10 : 8);
}

function buildDaYunPages(reading) {
  const chart = reading.chart;
  const cycles = chart.daYun?.cycles || [];
  const pages = [];
  const pt = withTopic("year");
  const rows = cycles
    .map(
      (c) =>
        `<tr><td>${esc(c.index)}</td><td>${esc(c.gzKo || c.gz || "—")}</td><td>${esc(c.startYear)}~${esc(c.endYear)}</td><td>${esc(c.startAge)}~${esc(c.endAge)}세</td></tr>`,
    )
    .join("");
  pages.push(
    `${head("제9부 · 평생 대운 흐름표", "大運表")}
    ${card("대운 개요", [
      pt(`대운은 ${chart.daYun?.forward ? "순행" : "역행"}이며, 첫 큰 흐름은 ${chart.daYun?.startText || "—"} 무렵 시작합니다.`),
      pt(reading.tenYear?.summary || "앞으로 10년 세운과 대운을 겹쳐 보면 ‘언제 밀지/기다릴지’가 또렷해집니다."),
    ].join(""))}
    <table class="data-table"><thead><tr><th>순번</th><th>대운</th><th>연도</th><th>세는나이</th></tr></thead><tbody>${rows || "<tr><td colspan='4'>대운 데이터를 준비 중입니다.</td></tr>"}</tbody></table>`,
  );

  cycles.slice(0, 3).forEach((c, i) => {
    const phase = i === 0 ? "초년" : i === 1 ? "중년" : "말년";
    pages.push(
      `${head(`대운 상세 · ${c.gzKo || c.gz || i}`, phase)}
      ${card(`${phase} 대운 ${c.gzKo || ""}`, [
        pt(`${c.startYear}~${c.endYear}년 · 세는나이 ${c.startAge}~${c.endAge}세.`),
        pt(`이 구간의 간지 ${c.gzKo || c.gz || "—"}는 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}과의 역할·합충으로 온도가 갈립니다.`),
        pt(phase === "초년" ? "초년 대운은 공부·첫 직장·인간관계의 뼈대를 만듭니다. 기록과 멘토가 자산입니다." : phase === "중년" ? "중년 대운은 책임·수입·가정의 균형이 핵심입니다. 큰 계약은 서류와 수면을 같이 보세요." : "말년 대운은 정리·전수·건강이 우선입니다. 벌리기보다 지키는 선택이 이득입니다."),
        pt(`도움이 되는 기운 ${favorBundlePhrase(yongsinSummary(chart).hee, "year")}이 대운 글자와 맞으면 기회가, 과하면 부담인 기운 ${favorBundlePhrase(yongsinSummary(chart).gi, "year")}이 겹치면 속도 조절이 답입니다.`),
      ].join(""))}`,
    );
  });
  return pages;
}

function buildYearDetailPages(reading, western) {
  const years = reading.tenYear?.years || [];
  const pt = withTopic("year");
  return years.map(
    (y) =>
      `${head(`${y.year}년 세운 심층 리포트`, y.gzFull || y.gzKo || "")}
      <div class="evidence"><h3>명리학적 근거</h3>
        ${pt(`${y.gzFull || y.gzKo} · 세는나이 ${y.age}세 · 종합 ${y.score}점(${y.level}) · 별점 ${y.stars}/5`)}
        ${pt(topicEvidenceGuide("year"))}
        <div class="chips"><span class="chip">재물 ${y.wealth?.score}</span><span class="chip">직업 ${y.career?.score}</span><span class="chip">관계 ${y.love?.score}</span></div>
      </div>
      ${card("한 해 총평", pt(y.headline || ""))}
      ${card("재물", pt(y.wealth?.text || "", { wealth: true }))}
      ${card("직업·승진", pt(y.career?.text || "", { topic: "career" }))}
      ${card("관계·애정", pt(y.love?.text || "", { topic: "marriage" }))}
      ${card("건강·주의", pt(y.score >= 64 ? "추진하되 수면과 정기 검진 일정은 지키세요." : "속도를 낮추고 서류·몸·관계를 먼저 점검하세요. 큰 약속은 하루 미루는 편이 이득입니다."))}
      ${card("서양 교차", pt(`${y.year}년 세운 점수는 ‘언제 움직일지’, 태양 ${western.sun?.name || "—"}·달 ${western.moon?.name || "—"}자리는 ‘어떤 태도·휴식이 맞는지’를 알려 줍니다.`))}`,
  );
}

function buildMonthDetailPages(reading) {
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  const pt = withTopic("timing");
  return months.map(
    (m) =>
      `${head(`${year}년 ${m.month}월 운세 상세`, m.gzKo || m.gz || "")}
      <div class="evidence"><h3>명리학적 근거</h3>
        ${pt(`${m.shortLabel || `${m.month}월`} · ${m.gz || ""}(${m.gzKo || ""}) · ${m.score}점 ${m.level} · 기운의 호흡 ${m.diShi || "—"}`)}
        ${pt(topicEvidenceGuide("timing"))}
      </div>
      ${card("총평", pt(m.summary || ""))}
      ${card("재물", pt(m.wealth || "", { wealth: true }))}
      ${card("직장", pt(m.career || "", { topic: "career" }))}
      ${card("대인", pt(m.relation || "", { topic: "marriage" }))}
      ${card("주의일·개운", [pt((m.watchDates || []).join(" · ") || "주의일을 달력에 표시하세요."), pt(m.remedy || "")].join(""))}
      ${card("특별 힌트", (m.specialHints || []).map((line) => pt(line)).join("") || pt(m.diShiEasy || "이 달의 호흡에 맞춰 한 가지만 끝까지 하세요."))}`,
  );
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

  return page(
    `<div class="section-head"><h2>${year}년 12개월 월운 흐름표</h2><span class="num">月運表</span></div>
    <p class="quiet" style="margin:0 0 4px">월별 간지·길흉 지수·핵심 키워드·주의점을 한 표로 정리했습니다. 문장은 중간에 자르지 않고 끝까지 적습니다.</p>
    <table class="data-table month-flow">
      <thead><tr>
        <th class="col-month">월</th>
        <th class="col-gz">간지</th>
        <th class="col-score">길흉 지수</th>
        <th class="col-key">핵심 키워드</th>
        <th class="col-watch">주의점</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="5">월운 데이터를 준비 중입니다.</td></tr>`}</tbody>
    </table>`,
    pageNo,
  );
}

/** 10년 세운 SVG 꺾은선 + 포인트 */
function tenYearChartPage(reading, pageNo) {
  const years = reading.tenYear?.years || [];
  const w = 640;
  const h = 220;
  const pad = { l: 36, r: 16, t: 16, b: 36 };
  const scores = years.map((y) => Number(y.score) || 50);
  const min = Math.min(40, ...scores) - 5;
  const max = Math.max(90, ...scores) + 5;
  const span = Math.max(1, max - min);
  const pts = years.map((y, i) => {
    const x = pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, years.length - 1);
    const yv = pad.t + ((max - (Number(y.score) || 50)) / span) * (h - pad.t - pad.b);
    return { x, y: yv, year: y.year, score: y.score, level: y.level, headline: y.headline, gz: y.gzFull || y.gzKo };
  });
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const circles = pts
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#8b1e1e" stroke="#fff" stroke-width="1.2"/>
         <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" text-anchor="middle" font-size="9" fill="#5c1a1a">${esc(String(p.score ?? ""))}</text>
         <text x="${p.x.toFixed(1)}" y="${h - 12}" text-anchor="middle" font-size="10" fill="#4a3f32">${esc(String(p.year))}</text>`,
    )
    .join("");

  const svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="10년 세운 흐름">
    <rect x="0" y="0" width="${w}" height="${h}" fill="#fffdf8"/>
    <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${h - pad.b}" stroke="#d0c0a4"/>
    <line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="#d0c0a4"/>
    <polyline fill="none" stroke="#8b1e1e" stroke-width="2.2" points="${polyline}"/>
    <polyline fill="none" stroke="#c9a227" stroke-width="1" stroke-dasharray="4 3" points="${polyline}"/>
    ${circles}
  </svg>`;

  const list = pts
    .map(
      (p) =>
        `<li><strong>${esc(String(p.year))}</strong> ${esc(p.gz || "")} · ${esc(p.level || "")} ${esc(String(p.score ?? ""))} — ${esc(String(p.headline || ""))}</li>`,
    )
    .join("");

  return page(
    `<div class="section-head"><h2>앞으로 10년 대운·세운 흐름</h2><span class="num">十年曲線</span></div>
    <div class="chart-wrap">${svg}</div>
    <ul class="year-points">${list || "<li>10년 세운 데이터를 준비 중입니다.</li>"}</ul>`,
    pageNo,
  );
}

function closingPage(reading, pageNo) {
  return page(
    `${head("맺음", "跋")}
    ${card("참고 안내", [
      p(`${reading.displayName} 님의 四柱精密分析 책자(약 110~120페이지 구성)를 마칩니다. 본 리포트는 참고용 해석이며 진료·투자·법률 판단을 대신하지 않습니다.`),
      p("좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다. 동양 역학의 ‘때’와 서양 점성술의 ‘태도’를 같은 메모에 적으면 운이 생활 습관으로 번역됩니다."),
    ].join(""))}`,
    pageNo,
  );
}

function appendBodies(pages, bodies, startNo) {
  let n = startNo;
  const out = [];
  bodies.forEach((html) => {
    n += 1;
    out.push(page(html, n, "flow"));
  });
  return { pages: out, nextNo: n };
}

/** 단품 — 표지·한눈·주제 심층(약 8~10p) */
export function generateSingleProductHtml(reading, topicId) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const item = pack.items.find((row) => row.id === topicId) || pack.items[0];
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  pages.push(glossaryGuidePage(reading, ++n));
  const topic = appendBodies(pages, buildTopicPages(item, reading, western, "심층"), n);
  pages.push(...topic.pages);
  n = topic.nextNo;
  pages.push(closingPage(reading, ++n));
  return wrap(`${reading.displayName} · ${item.title} 정밀분석`, pages.join("\n"));
}

/** 3종 */
export function generateTripleProductHtml(reading, selectedIds = []) {
  const ids = selectedIds.length ? selectedIds.slice(0, 3) : ["wealth", "career", "marriage"];
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  pages.push(glossaryGuidePage(reading, ++n));
  pages.push(tocPage(++n));
  ids.forEach((id, index) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const topic = appendBodies(pages, buildTopicPages(item, reading, western, `제${index + 2}부`), n);
    pages.push(...topic.pages);
    n = topic.nextNo;
  });
  pages.push(closingPage(reading, ++n));
  return wrap(`${reading.displayName} · 3가지 맞춤 정밀분석`, pages.join("\n"));
}

/**
 * 풀 패키지 ~110–120페이지
 * 1 표지 + 1 한눈 + 1 목차 + 10 본원 + 9×8~10 주제 + 대운 + 그래프 + 10년 + 월표 + 12월 + 개운 + 맺음
 */
export function generateFullProductHtml(reading) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let n = 0;

  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  pages.push(glossaryGuidePage(reading, ++n));
  pages.push(tocPage(++n));

  const origin = appendBodies(pages, buildOriginPages(reading, western), n);
  pages.push(...origin.pages);
  n = origin.nextNo;

  const order = ["wealth", "career", "business", "marriage", "compatibility", "children", "health", "moving", "travel"];
  const partNos = ["제2부", "제3부", "제4부", "제5부", "제6부", "제7부", "제8부", "제8부", "제8부"];
  order.forEach((id, index) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const label = partNos[index] || `제${index + 2}부`;
    const topic = appendBodies(pages, buildTopicPages(item, reading, western, label), n);
    pages.push(...topic.pages);
    n = topic.nextNo;
  });

  // 제9부
  const dayun = appendBodies(pages, buildDaYunPages(reading), n);
  pages.push(...dayun.pages);
  n = dayun.nextNo;
  pages.push(tenYearChartPage(reading, ++n));
  const years = appendBodies(pages, buildYearDetailPages(reading, western), n);
  pages.push(...years.pages);
  n = years.nextNo;

  // 제10부
  pages.push(monthTablePage(reading, ++n));
  const months = appendBodies(pages, buildMonthDetailPages(reading), n);
  pages.push(...months.pages);
  n = months.nextNo;

  if (reading.guide) {
    const ys = yongsinSummary(reading.chart);
    const qimen = engineMap(reading).qimen;
    const remedy = buildRemedyGuide(reading.chart);
    pages.push(
      page(
        `${head("운을 좋게 하는 비법 · 7대 비교표", "改運 1")}
        <div class="evidence"><h3>명리학적 근거 요약</h3>
          ${p(remedy.intro)}
          ${p(`도움이 되는 기운 ${favorBundlePhrase(ys.hee)}을 식탁·색·방위에 먼저 들이고, 과하면 부담인 기운 ${favorBundlePhrase(ys.gi)}은 줄입니다.`)}
        </div>
        ${card("좋은 영향 vs 나쁜 영향", renderRemedyCompareTable(remedy.rows))}`,
        ++n,
        "flow",
      ),
    );
    pages.push(
      page(
        `${head("맞춤 개운법 · 생활 적용 체크", "改運 2")}
        ${card("음식·습관", [p(reading.guide.table?.foods?.join(", ")), p(reading.guide.table?.habit)].join(""))}
        ${card("색", (reading.guide.palette?.items || []).map((item) => p(`${item.title} · ${item.name} — ${item.text}`)).join(""))}
        ${card("방위", p(qimen?.summary || reading.bridge || "생문·개문 쪽을 밝히고 사문만 피하세요."))}
        ${card("오늘부터 하나", p("위 비교표에서 ‘좋은 영향’ 칸 중 음식·색깔·숫자만 골라 이번 주 규칙 3개로 적으세요."))}`,
        ++n,
        "flow",
      ),
    );
    pages.push(
      page(
        `${head("관재·사고·갈등 예방 개운", "改運 3")}
        ${(reading.guide.risks || []).map((risk) => card(risk.title, [p(risk.warning), p(`막는 법 · ${risk.remedy}`)].join(""))).join("") || card("예방", p("큰 송금·감정적인 장문·수면 부족을 피하는 것이 가장 싼 개운입니다."))}
        ${card("택일 원칙", [p("좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다."), p(pack.lifetime?.summary || "평생 총운의 큰 물줄기를 기억하고, 월운·세운으로 미세 조정하세요.")].join(""))}`,
        ++n,
        "flow",
      ),
    );
  }

  // 110~120페이지 맞추기: 부족분만 평생 총운·역학 심화로 채움(빈 줄 패딩 금지)
  const lifetime = pack.lifetime;
  if (lifetime?.sections?.length && n < 112) {
    lifetime.sections.forEach((section) => {
      if (n >= 116) return;
      pages.push(
        page(
          `${head(`평생 총운 · ${section.title}`, "總運")}
          ${card(section.title, (section.lines || []).map((line) => p(line)).join(""))}
          ${card("연결", p(lifetime.summary || ""))}`,
          ++n,
          "flow",
        ),
      );
    });
  }

  while (n < 110) {
    const engines = engineMap(reading);
    const fillers = [
      `${head("역학 심화 · 사주명리", "補")}
      ${card("요약", p(engines.bazi?.summary || reading.bridge || ""))}
      ${card("적용", p(`${dayMasterPhrase(reading.chart.dayMasterKo, reading.chart.dayElement)} · ${strengthPhrase(reading.chart.strength?.label)}. 도움이 되는 기운 ${favorBundlePhrase(yongsinSummary(reading.chart).hee)}을 이번 주 규칙 하나로 만드세요.`))}
      ${card("점검", [p("청구·정산 날짜를 달력에 옮겼는가?"), p("수면 7시간을 지켰는가?"), p("하지 않을 일 하나를 정했는가?")].join(""))}`,
      `${head("역학 심화 · 별자리 렌즈", "補")}
      ${card("요약", p(engines.ziwei?.summary || "별자리 렌즈는 명궁의 별로 성향을 보조합니다."))}
      ${card("생활 번역", p("별 이름보다 ‘역할·숫자·약속’으로 바꾸면 실천이 됩니다."))}`,
      `${head("역학 심화 · 방위·동선 렌즈", "補")}
      ${card("요약", p(engines.qimen?.summary || reading.bridge || ""))}
      ${card("동선", p("생문·개문을 밝히고, 사문만 피하면 집과 책상의 운이 안정됩니다."))}`,
    ];
    pages.push(page(fillers[n % fillers.length], ++n, "flow"));
  }

  if (n > 119) {
    // 상한 초과 시 맺음 직전 여분만 잘라 120p 전후로 맞춤
    const keep = 119;
    pages.splice(keep);
    n = keep;
  }

  pages.push(closingPage(reading, ++n));
  return wrap(`${reading.displayName} · 四柱精密分析 풀 패키지`, pages.join("\n"));
}

export function generateProductReportHtml(reading, options = {}) {
  const mode = options.mode || "full";
  if (mode === "single") {
    return generateSingleProductHtml(reading, options.topicId || options.selected?.[0] || "wealth");
  }
  if (mode === "triple") {
    return generateTripleProductHtml(reading, options.selected || []);
  }
  return generateFullProductHtml(reading);
}
