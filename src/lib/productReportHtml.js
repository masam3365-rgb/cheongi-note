import { buildCustomFortunePack } from "./customFortune.js";
import { buildWesternAstrology } from "./westernAstrology.js";
import {
  DISHI_GLOSS,
  SHENSHA_GLOSS,
  TEN_GOD_GLOSS,
  collectChartTerms,
  easeSentence,
  termChip,
  termSummaryLine,
} from "./plainTerms.js";
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

function p(text, options) {
  return `<p>${esc(easeSentence(text, options))}</p>`;
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
          <div class="note">${esc(chart.calendarLabel || "")} ${esc(chart.solarText || "")} · ${esc(chart.genderLabel || "")} · 일간 ${esc(chart.dayMasterKo)}${esc(chart.dayElement)} · ${esc(chart.strength?.label || "")}</div>
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
    <div class="lab">천간 십성</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(p.shiShen || stemGod(chart, p.gan) || "—"))}</div>`).join("")}
    <div class="lab">지지 십성</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(branchGodLabel(chart, p) || "—"))}</div>`).join("")}
    <div class="lab">지장간</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc((p.hide || []).join(" ") || "—")}</div>`).join("")}
    <div class="lab">12운성</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(termChip(p.diShi || "—"))}</div>`).join("")}
    <div class="lab">12신살</div>
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
    <div class="meta-box"><div class="k">공망</div><div class="v">${esc(chart.xunKong || "—")}</div></div>
    <div class="meta-box"><div class="k">신강 / 신약</div><div class="v">${esc(chart.strength?.label || "—")}</div></div>
    <div class="meta-box"><div class="k">용신 · 희신</div><div class="v">용 ${esc(ys.yong)} · 희 ${esc(ys.hee)}</div></div>
    <div class="meta-box"><div class="k">기신</div><div class="v">${esc(ys.gi)}</div></div>
  </div>`;

  const character = reading.dashboard?.character?.personality;
  const summaryLines = [
    character?.summary,
    character?.deep,
    `일간 ${chart.dayMasterKo}${chart.dayElement} · ${chart.strength?.label}. 월주의 결은 ${chart.monthGod || "—"}입니다.`,
    `오행 균형 목${chart.count?.목 || 0} 화${chart.count?.화 || 0} 토${chart.count?.토 || 0} 금${chart.count?.금 || 0} 수${chart.count?.수 || 0}. 도움이 되는 기운 ${ys.hee}, 과하면 부담인 기운 ${ys.gi}.`,
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
  { part: "제3부", title: "직업·승진운", blurb: "관성·일의 자리와 승진 타이밍" },
  { part: "제4부", title: "사업운", blurb: "창업·확장·동업의 길흉" },
  { part: "제5부", title: "결혼·애정운", blurb: "배우자궁·도화·관계의 온도" },
  { part: "제6부", title: "정밀 궁합", blurb: "두 사람 명식의 합·충 교차" },
  { part: "제7부", title: "자녀운", blurb: "식상·양육 태도와 인연" },
  { part: "제8부", title: "건강·여행·이사", blurb: "몸·이동·집터의 방위 가이드" },
  { part: "제9부", title: "10년 대운·세운", blurb: "앞으로 10년 상승·하락 곡선" },
  { part: "제10부", title: "12개월 월운·개운", blurb: "올해 달력과 생활 개운법" },
];

function glossRows(names, dict) {
  return names
    .filter((name) => dict[name])
    .map((name) => {
      const e = dict[name];
      return `<tr>
        <td class="term">${esc(name)}<br/><span class="quiet">${esc(e.hanja)}</span></td>
        <td>${esc(e.meaning)} — ${esc(e.detail)}</td>
        <td>${esc(e.strength)}</td>
        <td>${esc(e.caution)}</td>
      </tr>`;
    })
    .join("");
}

/** 내 사주에 실제로 있는 핵심 용어만 쉬운 뜻으로 정리 */
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
    <p class="gloss-note">아래는 ${esc(reading.displayName)} 님 명식에 <strong>실제로 들어 있는</strong> 십신·12운성·신살만 골라, 한자 뜻·쉬운 비유·강점·주의점을 정리한 가이드입니다. 본문에서도 같은 용어가 나오면 뜻이 함께 붙습니다.</p>
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
  const gods = (chart.pillars || []).map((p) => p.shiShen).filter(Boolean);
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
      lines.push(`재성과 연결된 오행은 ${chart.strength?.roles?.wealth || "—"}입니다. 용신 ${ys.yong}이 재물 흐름을 받쳐 줍니다.`);
      break;
    case "career":
      ["정관", "편관", "인성", "비견"].forEach(pushGod);
      lines.push(`관성과 연결된 오행은 ${chart.strength?.roles?.officer || "—"}입니다. 월주 십성 ${chart.monthGod || "—"}이 사회생활의 결을 만듭니다.`);
      break;
    case "business":
      ["식신", "상관", "편재", "편관"].forEach(pushGod);
      lines.push(`식상·재성이 창업·확장의 재료입니다. 역마(${koGz(specials.yeokma || "") || "—"})가 있으면 이동·확장 운이 잘 붙습니다.`);
      break;
    case "marriage":
    case "compatibility":
      ["정관", "편관", "정재", "편재", "도화"].forEach(pushGod);
      lines.push(`배우자궁은 일지 ${chart.pillars?.[2]?.zhiKo || "—"}입니다. 도화(${koGz(specials.dohwa || "") || "—"})·문창(${koGz(specials.munchang || "") || "—"})을 함께 봅니다.`);
      break;
    case "children":
      ["식신", "상관", "인성"].forEach(pushGod);
      lines.push(`자녀·식상 기운은 ${chart.strength?.roles?.child || "—"} 쪽입니다. 양육은 인성·식상의 균형으로 읽습니다.`);
      break;
    case "health":
      lines.push(`신${chart.strength?.label || ""} · 오행 편중을 먼저 봅니다. 기신 ${ys.gi}이 과할 때 몸·수면이 흔들리기 쉽습니다.`);
      chips.push(...Object.entries(chart.count || {}).map(([k, v]) => `${k}${v}`));
      break;
    case "moving":
      lines.push(`역마(${koGz(specials.yeokma || "") || "—"})·공망(${chart.xunKong || "—"})이 이사·문서운의 길잡이입니다. 기문 방위는 본문 해설을 따릅니다.`);
      chips.push("역마", "공망", "기문방위");
      break;
    case "travel":
      lines.push(`역마·공망이 뜨는 해·달에 이동·여행 일정이 잘 맞습니다. 희신 ${ys.hee} 방위를 우선하세요.`);
      chips.push("역마", `희신 ${ys.hee}`);
      break;
    default:
      lines.push(`일간 ${chart.dayMasterKo}${chart.dayElement} · ${chart.strength?.label}. 용신 ${ys.yong} / 희신 ${ys.hee} / 기신 ${ys.gi}.`);
      chips.push(...gods.slice(0, 4));
  }

  if (item.summary) lines.push(item.summary);

  return `<div class="evidence"><h3>명리학적 근거 요약</h3>${lines.map((l) => p(l)).join("")}
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

  pages.push(
    `${head("제1부 · 타고난 본원", "本性 1/10")}${evidenceForTopic({ id: "origin", summary: character?.summary }, chart)}
    ${card("일간 심층", [
      p(`당신의 중심 기운(일간)은 ${chart.dayMasterKo}${chart.dayElement}입니다. 일간은 이름표처럼 ‘내가 세상을 대하는 기본 태도’를 보여 줍니다.`),
      p(`일지(배우자궁·몸·생활 리듬)는 ${chart.pillars?.[2]?.zhiKo || "—"}(${chart.pillars?.[2]?.zhi || ""})이고, 12운성은 ${chart.pillars?.[2]?.diShi || "—"}입니다.`),
      p(character?.summary || reading.guide?.summary || "일간의 결을 생활 언어로 풀면, 선택과 거절의 기준이 또렷해집니다."),
      p(character?.deep || "깊은 층에서는 익숙한 패턴이 반복됩니다. 패턴에 이름을 붙이면 고치기 쉬워집니다."),
    ].join(""))}`,
  );

  pages.push(
    `${head("월주·사회생활의 결", "本性 2/10")}
    ${card("월주 십성", [
      p(`월주는 ${chart.pillars?.[1]?.gzKo || "—"}(${chart.pillars?.[1]?.gz || ""})이며, 월간 십성은 ${chart.monthGod || chart.pillars?.[1]?.shiShen || "—"}입니다.`),
      p("월주는 사회·직장·바깥에서의 ‘첫인상과 일 처리 방식’을 보여 줍니다. 집 안 기운(년주)과 내 중심(일주) 사이에서 번역기 역할을 합니다."),
      p(`납음은 ${chart.pillars?.[1]?.nayin || "—"}, 지장간은 ${(chart.pillars?.[1]?.hide || []).join("·") || "—"}입니다. 지장간이 여러 개면 한 달에 여러 역할이 겹칩니다.`),
      p(character?.balance || "월주의 결을 존중하되, 일간이 무리하지 않는 선에서 속도를 맞추면 평가와 체력이 함께 갑니다."),
    ].join(""))}`,
  );

  const countLines = Object.entries(chart.count || {}).map(([k, v]) => p(`${k} ${v} — ${WX_COLOR[k]?.label || k} 기운의 비중입니다.`));
  pages.push(
    `${head("오행 균형 심층", "本性 3/10")}
    ${card("오행 분포", countLines.join("") || p("오행 분포를 준비 중입니다."))}
    ${card("해석", [
      p(`신${chart.strength?.label || ""} 판정은 비겁·인성(도움) ${chart.strength?.support ?? "—"}대 식상·재·관(소모) ${chart.strength?.drain ?? "—"}의 비교입니다.`),
      p(`도움이 되는 기운(희·용)은 ${ys.hee}, 과하면 부담인 기운(기신)은 ${ys.gi}입니다. 옷·식탁·방위에 희신을 먼저 들이면 선택이 가벼워집니다.`),
      p(character?.tip || "오행이 부족한 쪽은 ‘더 하려는 욕심’보다 ‘한 가지를 규칙으로 넣는 일’이 효과가 큽니다."),
    ].join(""))}`,
  );

  const hideCards = (chart.pillars || [])
    .map((pillar) =>
      card(
        `${pillar.label} 지장간 · ${pillar.gzKo}`,
        [
          p(`지장간: ${(pillar.hide || []).join(" · ") || "—"}. 드러난 글자 아래 숨은 재료입니다.`),
          p(`지지 오행 ${BRANCH_ELEMENT[pillar.zhi] || "—"}, 천간 오행 ${STEM_ELEMENT[pillar.gan] || "—"}, 십성 ${pillar.shiShen || "—"}.`),
          p("지장간이 일간과 같거나 희신이면 그 기둥에서 힘이 나고, 기신이면 그 시기에 소모가 커집니다."),
        ].join(""),
      ),
    )
    .join("");
  pages.push(`${head("지장간 심층", "本性 4/10")}${hideCards}`);

  const diShiCards = (chart.pillars || [])
    .map((pillar) =>
      card(
        `${pillar.label} 12운성 · ${pillar.diShi || "—"}`,
        [
          p(`${pillar.gzKo}의 12운성은 ${pillar.diShi || "—"}입니다. 운성은 ‘그 글자가 내 일간에게 얼마나 힘을 주는지’의 온도입니다.`),
          p("생·왕·묘는 추진이, 쇠·병·사·묘(墓)·절은 정리·휴식이 이득인 리듬으로 읽으면 실전에 가깝습니다."),
        ].join(""),
      ),
    )
    .join("");
  pages.push(`${head("12운성 심층", "本性 5/10")}${diShiCards}`);

  const specials = chart.specials || {};
  pages.push(
    `${head("12신살·공망 심층", "本性 6/10")}
    ${card("문창·도화·역마", [
      p(`문창 ${koGz(specials.munchang || "") || "—"} — 공부·서류·글이 붙기 쉬운 글자입니다.`),
      p(`도화 ${koGz(specials.dohwa || "") || "—"} — 사람·매력·소개가 붙기 쉬운 글자입니다.`),
      p(`역마 ${koGz(specials.yeokma || "") || "—"} — 이동·출장·이사·이직이 붙기 쉬운 글자입니다.`),
      p(`공망 ${chart.xunKong || "—"} — 약속이 느슨해지기 쉬운 자리입니다. 중요한 날짜는 문자로 한 번 더 확인하세요.`),
    ].join(""))}
    ${card("기둥별 신살 배치", (chart.pillars || []).map((pillar) => p(`${pillar.label} ${pillar.gzKo} · ${shenshaForPillar(chart, pillar)}`)).join(""))}`,
  );

  pages.push(
    `${head("신강·신약과 용희기신", "本性 7/10")}
    ${card("신강 / 신약", [
      p(`판정: ${chart.strength?.label || "—"}. ${chart.strength?.strong ? "혼자 버티는 힘이 센 편이라, 방향을 정하면 끝까지 밀 수 있습니다." : "옆에서 채워 줄 사람과 환경이 있어야 편한 편이라, 혼자 욕심내기보다 도움을 받는 쪽이 맞습니다."}`),
      p(`용신(가장 필요한 기운) ${ys.yong}, 희신 ${ys.hee}, 기신 ${ys.gi}. 용신은 ‘이번 분기 우선순위 하나’로 번역하면 실천이 됩니다.`),
      p(`역할 오행 — 비겁 ${chart.strength?.roles?.mine || "—"} · 인성 ${chart.strength?.roles?.parent || "—"} · 식상 ${chart.strength?.roles?.child || "—"} · 재성 ${chart.strength?.roles?.wealth || "—"} · 관성 ${chart.strength?.roles?.officer || "—"}.`),
    ].join(""))}
    ${card("생활 적용", [
      p(reading.guide?.summary || "희신이 들어오는 색·음식·방위를 작은 규칙으로 두면, 운이 막연한 말이 아니라 체크리스트가 됩니다."),
      p(reading.bridge || "사주의 뼈대와 기문·점성술을 같은 메모에 적으면 결정이 빨라집니다."),
    ].join(""))}`,
  );

  pages.push(
    `${head("서양 점성술 · 태양·달·상승", "本性 8/10")}
    ${card("종합", p(western.summary || "점성술 요약을 준비 중입니다."))}
    ${card("태양(삶의 목적)", p(western.sun?.text || ""))}
    ${card("달(속마음·휴식)", p(western.moon?.text || ""))}
    ${card("상승(첫인상)", p(western.rising?.text || ""))}`,
  );

  const planetCards = (western.planets || [])
    .slice(0, 6)
    .map((pl) => card(pl.name || pl.id || "행성", p(pl.text || "")))
    .join("");
  pages.push(
    `${head("주요 행성 심층", "本性 9/10")}
    ${planetCards || card("행성", p("행성 요약을 준비 중입니다."))}
    ${card("교차 읽기", [
      p(`일간 ${chart.dayMasterKo}${chart.dayElement}과 태양 ${western.sun?.name || "—"}자리를 겹치면, 말과 목표가 한 방향으로 모입니다.`),
      p(`달 ${western.moon?.name || "—"}자리는 사주의 일지·공망과 함께 ‘언제 쉴지’를 알려 줍니다.`),
    ].join(""))}`,
  );

  pages.push(
    `${head("동양 역학 엔진 교차 · 본원", "本性 10/10")}
    ${card("사주명리", p(engines.bazi?.summary || `네 기둥 ${(chart.pillars || []).map((x) => x.gzKo).join(" ")} · ${chart.strength?.label}.`))}
    ${card("자미두수", p(engines.ziwei?.summary || reading.dashboard?.character?.ziwei || "자미두수는 명궁·신궁의 별로 성격을 보조 해석합니다."))}
    ${card("기문둔갑", p(engines.qimen?.summary || reading.bridge || "기문은 살림·책상·출입 방위를 생활 동선으로 번역합니다."))}
    ${card("주역", p(engines.yijing?.summary || "주역은 ‘지금 이 선택의 태도’를 한 줄로 짚어 주는 렌즈입니다. 길흉보다 타이밍과 태도를 보세요."))}
    ${card("실천 한 줄", p(character?.tip || "이번 주, 희신 기운을 들이는 작은 규칙 하나만 달력에 적으세요."))}`,
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

  pages.push(
    `${head(`${partLabel} · ${item.title}`, "근거")}${evidenceForTopic(item, chart)}
    ${card("주제 요약", p(item.summary || item.preview || item.blurb || ""))}
    ${card("미리보기", p(item.preview || item.blurb || ""))}`,
  );

  // 동양 심층 — paragraphs를 3개씩
  const eastChunks = parasChunk(east, 3);
  eastChunks.slice(0, 3).forEach((chunk, i) => {
    pages.push(
      `${head(`${item.title} · 동양 역학 심층`, `東 ${i + 1}/${Math.min(3, eastChunks.length)}`)}
      ${card(item.eastern?.title || "사주·명리 풀이", (chunk.length ? chunk : ["동양 역학 풀이를 준비 중입니다."]).map((line) => p(line)).join(""))}
      ${i === 0 ? card("자미두수 관점", p(engines.ziwei?.summary || engines.ziwei?.lookup?.관록궁 || "자미두수의 관련 궁·별로 이 주제의 온도를 보조합니다.")) : ""}
      ${i === 1 ? card("기문둔갑 관점", p(engines.qimen?.summary || "기문의 문·방위로 이 주제의 동선·타이밍을 봅니다.")) : ""}
      ${i === 2 ? card("주역 관점", p(engines.yijing?.summary || "주역은 이 주제에서 ‘밀지/기다릴지’의 태도를 한 줄로 정리합니다.")) : ""}`,
    );
  });
  while (pages.length < 4) {
    pages.push(
      `${head(`${item.title} · 동양 역학 보강`, "東")}
      ${card("명리 보강", [
        p(`일간 ${chart.dayMasterKo}${chart.dayElement} · ${chart.strength?.label}. 이 주제와 맞닿은 십성·오행을 위 근거 박스와 함께 다시 읽습니다.`),
        p(east[pages.length] || east[0] || `${item.title}은 생활 숫자와 약속을 달력에 옮길 때 점수가 됩니다.`),
        p(reading.bridge || ""),
      ].join(""))}`,
    );
  }

  // 섹션 상세
  if (sections.length) {
    sections.slice(0, 2).forEach((section, i) => {
      pages.push(
        `${head(`${item.title} · ${section.title}`, `詳 ${i + 1}`)}
        ${card(section.title, (section.lines || []).map((line) => p(line)).join("") || p("상세 풀이를 준비 중입니다."))}
        ${card("적용", p(`이 장을 한 줄로 줄이면: ${(section.lines || [])[0] || item.summary || ""}`))}`,
      );
    });
  } else {
    pages.push(
      `${head(`${item.title} · 사주 구조 해설`, "詳")}
      ${card("구조", [
        p(`네 기둥 ${(chart.pillars || []).map((x) => `${x.label}${x.gzKo}`).join(" · ")}.`),
        p(`용신 ${yongsinSummary(chart).yong} · 희신 ${yongsinSummary(chart).hee} · 기신 ${yongsinSummary(chart).gi}.`),
        p(east.slice(0, 2).join(" ") || item.summary || ""),
      ].join(""))}`,
    );
  }

  // 서양
  const westChunks = parasChunk(west, 3);
  westChunks.slice(0, 2).forEach((chunk, i) => {
    pages.push(
      `${head(`${item.title} · 서양 점성술 심층`, `西 ${i + 1}`)}
      ${card(item.western?.title || "하우스·행성 풀이", (chunk.length ? chunk : ["서양 점성술 풀이를 준비 중입니다."]).map((line) => p(line)).join(""))}
      ${i === 0 ? card("태양·달·상승 연결", [p(western.sun?.text || ""), p(western.moon?.text || "")].join("")) : card("행성 보조", (western.planets || []).slice(0, 3).map((pl) => p(`${pl.name}: ${pl.text}`)).join("") || p(western.summary || ""))}`,
    );
  });

  pages.push(
    `${head(`${item.title} · 동서양 교차`, "交叉")}
    ${card("교차 종합", (bridge.length ? bridge : [`${item.title}에서 사주의 ‘때’와 점성술의 ‘태도’를 같은 메모에 적으세요.`]).map((line) => p(line)).join(""))}
    ${card("한 줄 실천", p((item.actions && item.actions[0]) || `${item.title}에서 이번 주 할 일 하나만 달력에 적으세요.`))}`,
  );

  // 시기·행동
  const timingBody = [
    ...(item.timing?.lines || []),
    ...(item.taegilGuide?.lines || []),
    ...(item.majors?.lines || []),
  ];
  pages.push(
    `${head(`${item.title} · 시기별 유불리`, "時期")}
    ${card(item.timing?.title || item.taegilGuide?.title || "유리한 시기", (timingBody.length ? timingBody : [`${item.title}의 유리한 달은 월운·세운 표를 함께 보세요.`, `희신 ${yongsinSummary(chart).hee}이 들어오는 해·달이 비교적 수월합니다.`]).map((line) => p(line)).join(""))}
    ${item.months?.length ? card("월별 포인트", item.months.map((m) => p(`${m.month}월 · ${m.body} — ${m.tip}`)).join("")) : ""}`,
  );

  pages.push(
    `${head(`${item.title} · 실전 행동 지침`, "行動")}
    ${card("지금 바로", (item.actions?.length ? item.actions : [`${item.title} 관련 할 일 하나와 하지 않을 일 하나를 적으세요.`]).map((line) => p(line)).join(""))}
    ${card("점검 질문", [
      p("이번 달 숫자·약속·사람을 달력에 옮겼는가?"),
      p("희신을 들이는 작은 규칙이 있는가?"),
      p("기신이 과한 날에는 큰 결정을 하루 미루는가?"),
    ].join(""))}
    ${card("엔진 보조", [
      p(engines.qimen?.summary || "기문 방위로 책상·출입·휴식 동선을 한 번 정리하세요."),
      p(engines.ziwei?.summary || "자미두수 관련 궁의 별을 생활 역할로 번역해 보세요."),
    ].join(""))}`,
  );

  // 주제당 8페이지 전후 유지(전체 110~120p 배분)
  while (pages.length < 8) {
    const idx = pages.length;
    pages.push(
      `${head(`${item.title} · 심화 노트 ${idx - 6}`, "補")}
      ${card("심화", [
        p(east[idx] || west[idx % Math.max(1, west.length)] || `${item.title}은 한 해를 ‘크게 벌리기’보다 ‘기록과 마감’으로 점수를 냅니다.`),
        p(`일간 ${chart.dayMasterKo}${chart.dayElement}, 월주 ${chart.monthGod || "—"}, 공망 ${chart.xunKong || "—"}.`),
        p((item.actions && item.actions[idx % item.actions.length]) || "오늘 하지 않을 일 하나가 내일을 엽니다."),
      ].join(""))}
      ${card("생활 번역", p(bridge[idx % Math.max(1, bridge.length)] || reading.bridge || "동양 역학의 때와 서양 점성술의 태도를 한 메모에 적으세요."))}`,
    );
  }
  return pages.slice(0, 8);
}

function buildDaYunPages(reading) {
  const chart = reading.chart;
  const cycles = chart.daYun?.cycles || [];
  const pages = [];
  const rows = cycles
    .map(
      (c) =>
        `<tr><td>${esc(c.index)}</td><td>${esc(c.gzKo || c.gz || "—")}</td><td>${esc(c.startYear)}~${esc(c.endYear)}</td><td>${esc(c.startAge)}~${esc(c.endAge)}세</td></tr>`,
    )
    .join("");
  pages.push(
    `${head("제9부 · 평생 대운 흐름표", "大運表")}
    ${card("대운 개요", [
      p(`대운은 ${chart.daYun?.forward ? "순행" : "역행"}이며, 첫 큰 흐름은 ${chart.daYun?.startText || "—"} 무렵 시작합니다.`),
      p(reading.tenYear?.summary || "앞으로 10년 세운과 대운을 겹쳐 보면 ‘언제 밀지/기다릴지’가 또렷해집니다."),
    ].join(""))}
    <table class="data-table"><thead><tr><th>순번</th><th>대운</th><th>연도</th><th>세는나이</th></tr></thead><tbody>${rows || "<tr><td colspan='4'>대운 데이터를 준비 중입니다.</td></tr>"}</tbody></table>`,
  );

  cycles.slice(0, 3).forEach((c, i) => {
    const phase = i === 0 ? "초년" : i === 1 ? "중년" : "말년";
    pages.push(
      `${head(`대운 상세 · ${c.gzKo || c.gz || i}`, phase)}
      ${card(`${phase} 대운 ${c.gzKo || ""}`, [
        p(`${c.startYear}~${c.endYear}년 · 세는나이 ${c.startAge}~${c.endAge}세.`),
        p(`이 구간의 간지 ${c.gzKo || c.gz || "—"}는 일간 ${chart.dayMasterKo}${chart.dayElement}과의 십성·합충으로 온도가 갈립니다.`),
        p(phase === "초년" ? "초년 대운은 공부·첫 직장·인간관계의 뼈대를 만듭니다. 기록과 멘토가 자산입니다." : phase === "중년" ? "중년 대운은 책임·수입·가정의 균형이 핵심입니다. 큰 계약은 서류와 수면을 같이 보세요." : "말년 대운은 정리·전수·건강이 우선입니다. 벌리기보다 지키는 선택이 이득입니다."),
        p(`희신 ${yongsinSummary(chart).hee}이 대운 글자와 맞으면 기회가, 기신 ${yongsinSummary(chart).gi}이 겹치면 속도 조절이 답입니다.`),
      ].join(""))}`,
    );
  });
  return pages;
}

function buildYearDetailPages(reading, western) {
  const years = reading.tenYear?.years || [];
  return years.map(
    (y) =>
      `${head(`${y.year}년 세운 심층 리포트`, y.gzFull || y.gzKo || "")}
      <div class="evidence"><h3>명리학적 근거</h3>
        ${p(`${y.gzFull || y.gzKo} · 세는나이 ${y.age}세 · 종합 ${y.score}점(${y.level}) · 별점 ${y.stars}/5`)}
        <div class="chips"><span class="chip">재물 ${y.wealth?.score}</span><span class="chip">직업 ${y.career?.score}</span><span class="chip">관계 ${y.love?.score}</span></div>
      </div>
      ${card("한 해 총평", p(y.headline || ""))}
      ${card("재물", p(y.wealth?.text || "", { wealth: true }))}
      ${card("직업·승진", p(y.career?.text || ""))}
      ${card("관계·애정", p(y.love?.text || ""))}
      ${card("건강·주의", p(y.score >= 64 ? "추진하되 수면과 정기 검진 일정은 지키세요." : "속도를 낮추고 서류·몸·관계를 먼저 점검하세요. 큰 약속은 하루 미루는 편이 이득입니다."))}
      ${card("서양 교차", p(`${y.year}년 세운 점수는 ‘언제 움직일지’, 태양 ${western.sun?.name || "—"}·달 ${western.moon?.name || "—"}자리는 ‘어떤 태도·휴식이 맞는지’를 알려 줍니다.`))}`,
  );
}

function buildMonthDetailPages(reading) {
  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  return months.map(
    (m) =>
      `${head(`${year}년 ${m.month}월 운세 상세`, m.gzKo || m.gz || "")}
      <div class="evidence"><h3>명리학적 근거</h3>
        ${p(`${m.shortLabel || `${m.month}월`} · ${m.gz || ""}(${m.gzKo || ""}) · ${m.score}점 ${m.level} · 12운성 ${m.diShi || "—"}`)}
      </div>
      ${card("총평", p(m.summary || ""))}
      ${card("재물", p(m.wealth || "", { wealth: true }))}
      ${card("직장", p(m.career || ""))}
      ${card("대인", p(m.relation || ""))}
      ${card("주의일·개운", [p((m.watchDates || []).slice(0, 3).join(" / ") || "주의일을 달력에 표시하세요."), p(m.remedy || "")].join(""))}
      ${card("특별 힌트", (m.specialHints || []).map((line) => p(line)).join("") || p(m.diShiEasy || "이 달의 호흡에 맞춰 한 가지만 끝까지 하세요."))}`,
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
      const keyword = String(m.summary || m.level || "")
        .replace(/\s+/g, " ")
        .slice(0, 28);
      const watch = (m.watchDates?.join(", ") || m.watch || m.remedy || "—").toString().slice(0, 36);
      const gz = m.gz ? `${m.gz} (${m.gzKo || ""})` : m.gzKo || "—";
      return `<tr>
        <td>${esc(m.month || "")}월</td>
        <td>${esc(gz)}</td>
        <td class="${scoreClass(Number(m.score) || 0)}">${esc(m.score ?? "—")} · ${esc(m.level || "")}</td>
        <td class="left">${esc(keyword)}</td>
        <td class="left">${esc(watch)}</td>
      </tr>`;
    })
    .join("");

  return page(
    `<div class="section-head"><h2>${year}년 12개월 월운 흐름표</h2><span class="num">月運表</span></div>
    <p class="quiet" style="margin:0 0 6px">월별 간지·길흉 지수·핵심 키워드·주의점을 한 표로 정리했습니다.</p>
    <table class="data-table">
      <thead><tr><th>월</th><th>간지</th><th>길흉 지수</th><th>핵심 키워드</th><th>주의점</th></tr></thead>
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
        `<li><strong>${esc(String(p.year))}</strong> ${esc(easeSentence(p.gz || ""))} · ${esc(p.level || "")} ${esc(String(p.score ?? ""))} — ${esc(easeSentence(String(p.headline || "").slice(0, 42)))}</li>`,
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
    pages.push(
      page(
        `${head("맞춤 개운법 · 오행·방위·색·식습관", "改運 1")}
        <div class="evidence"><h3>명리학적 근거 요약</h3>
          ${p(`희신 ${ys.hee}을 식탁·색·방위에 먼저 들이고, 기신 ${ys.gi}은 과하지 않게 줄입니다.`)}
        </div>
        ${card("음식·습관", [p(reading.guide.table?.foods?.join(", ")), p(reading.guide.table?.habit)].join(""))}
        ${card("색", (reading.guide.palette?.items || []).map((item) => p(`${item.title} · ${item.name} — ${item.text}`)).join(""))}
        ${card("방위", p(qimen?.summary || reading.bridge || "생문·개문 쪽을 밝히고 사문만 피하세요."))}`,
        ++n,
        "flow",
      ),
    );
    pages.push(
      page(
        `${head("관재·사고·갈등 예방 개운", "改運 2")}
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
      ${card("적용", p(`일간 ${reading.chart.dayMasterKo}${reading.chart.dayElement} · ${reading.chart.strength?.label}. 희신 ${yongsinSummary(reading.chart).hee}을 이번 주 규칙 하나로 만드세요.`))}
      ${card("점검", [p("청구·정산 날짜를 달력에 옮겼는가?"), p("수면 7시간을 지켰는가?"), p("하지 않을 일 하나를 정했는가?")].join(""))}`,
      `${head("역학 심화 · 자미두수", "補")}
      ${card("요약", p(engines.ziwei?.summary || "자미두수는 명궁의 별로 성향을 보조합니다."))}
      ${card("생활 번역", p("별 이름보다 ‘역할·숫자·약속’으로 바꾸면 실천이 됩니다."))}`,
      `${head("역학 심화 · 기문둔갑", "補")}
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
