import { buildCustomFortunePack } from "./customFortune.js";
import { buildWesternAstrology } from "./westernAstrology.js";
import { easeSentence } from "./plainTerms.js";
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
  padding: 4mm 2mm 8mm;
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

@media print {
  html, body { background: #f7f1e6 !important; }
  .page { width: auto; box-shadow: none; }
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
    ${cols.map((p) => `<div class="cell">${esc(p.shiShen || stemGod(chart, p.gan))}</div>`).join("")}
    <div class="lab">지지 십성</div>
    ${cols.map((p) => `<div class="cell">${esc(branchGodLabel(chart, p))}</div>`).join("")}
    <div class="lab">지장간</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc((p.hide || []).join(" ") || "—")}</div>`).join("")}
    <div class="lab">12운성</div>
    ${cols.map((p) => `<div class="cell">${esc(p.diShi || "—")}</div>`).join("")}
    <div class="lab">12신살</div>
    ${cols.map((p) => `<div class="cell" style="font-size:10px">${esc(shenshaForPillar(chart, p))}</div>`).join("")}
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
    <div class="chips">${[...new Set(chips)].filter(Boolean).map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
  </div>`;
}

/** 밀도 높은 장 본문 — 근거 박스 + 해설, 강제 페이지 남발 줄임 */
function buildDenseChapterHtml(item, chart) {
  const blocks = [];
  blocks.push(`<div class="section-head"><h2>${esc(item.title)}</h2><span class="num">${esc(item.blurb || "")}</span></div>`);
  blocks.push(evidenceForTopic(item, chart));

  if (item.eastern?.paragraphs?.length) {
    blocks.push(card(item.eastern.title || "동양 역학 상세 풀이", item.eastern.paragraphs.map((line) => p(line)).join("")));
  }
  if (item.western?.paragraphs?.length) {
    blocks.push(card(item.western.title || "서양 점성술 상세 풀이", item.western.paragraphs.map((line) => p(line)).join("")));
  }
  if (item.bridge?.paragraphs?.length) {
    blocks.push(card(item.bridge.title || "동서양 교차", item.bridge.paragraphs.map((line) => p(line)).join("")));
  }
  if (item.majors?.lines?.length) {
    blocks.push(card(item.majors.title || "맞춤 학과·전공", item.majors.lines.map((line) => p(line)).join("")));
  }
  if (item.timing?.lines?.length) {
    blocks.push(card(item.timing.title || "유리한 시기", item.timing.lines.map((line) => p(line)).join("")));
  }
  if (item.taegilGuide?.lines?.length) {
    blocks.push(card(item.taegilGuide.title || "택일 가이드", item.taegilGuide.lines.map((line) => p(line)).join("")));
  }
  if (item.actions?.length) {
    blocks.push(card("실전 행동 지침", item.actions.map((line) => p(line)).join("")));
  }
  if (item.months?.length) {
    blocks.push(
      card(
        "월별 포인트",
        item.months.map((m) => p(`${m.month}월 · ${m.body} — ${m.tip}`)).join(""),
      ),
    );
  }
  return blocks.join("\n");
}

function packChapterPages(html, startNo) {
  // 짧은 장은 1페이지, 긴 장만 카드 경계에서 2페이지로 나눠 하단 공백을 줄임
  if (html.length < 4200) {
    return { pages: [page(html, startNo + 1, "flow")], nextNo: startNo + 1 };
  }
  const marker = '</div>\n<div class="card">';
  const mid = Math.floor(html.length * 0.55);
  let cut = html.lastIndexOf(marker, mid);
  if (cut < 800) cut = html.indexOf(marker, mid);
  if (cut < 800) {
    return { pages: [page(html, startNo + 1, "flow")], nextNo: startNo + 1 };
  }
  const first = html.slice(0, cut + 6);
  const second = html.slice(cut + 6);
  return {
    pages: [page(first, startNo + 1, "flow"), page(second, startNo + 2, "flow")],
    nextNo: startNo + 2,
  };
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

function originChapter(reading, western, pageNoStart) {
  const chart = reading.chart;
  const character = reading.dashboard?.character?.personality;
  const ys = yongsinSummary(chart);
  const html = `
    <div class="section-head"><h2>제1부 · 타고난 본원</h2><span class="num">本性</span></div>
    <div class="evidence"><h3>명리학적 근거 요약</h3>
      ${p(`일간 ${chart.dayMasterKo}${chart.dayElement} · ${chart.strength?.label}. 월주 십성 ${chart.monthGod || "—"}. 용신 ${ys.yong} · 희신 ${ys.hee} · 기신 ${ys.gi}.`)}
      <div class="chips">${(chart.pillars || []).map((p) => `<span class="chip">${esc(p.label)} ${esc(p.shiShen)}</span>`).join("")}</div>
    </div>
    ${card("성격 · 동양", [character?.summary, character?.deep, character?.balance, character?.tip, reading.guide?.summary].filter(Boolean).map((l) => p(l)).join("") || p("성격 풀이를 준비 중입니다."))}
    ${card("태양·달·상승", [p(western.summary), p(western.sun?.text), p(western.moon?.text), p(western.rising?.text)].join(""))}
    ${card("동서양 교차", [p(`일간 ${chart.dayMasterKo}${chart.dayElement}과 태양 ${western.sun?.name}자리를 겹쳐 읽습니다.`), p(reading.bridge)].join(""))}
  `;
  return { pages: [page(html, pageNoStart + 1, "flow")], nextNo: pageNoStart + 1 };
}

function closingPage(reading, pageNo) {
  return page(
    `<div class="section-head"><h2>맺음</h2><span class="num">跋</span></div>
    ${card("참고 안내", [
      p(`${reading.displayName} 님의 四柱精密分析 책자를 마칩니다. 본 리포트는 참고용 해석이며 진료·투자·법률 판단을 대신하지 않습니다.`),
      p("좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다. 동양 역학의 ‘때’와 서양 점성술의 ‘태도’를 같은 메모에 적으면 운이 생활 습관으로 번역됩니다."),
    ].join(""))}`,
    pageNo,
  );
}

/** 단품 */
export function generateSingleProductHtml(reading, topicId) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const item = pack.items.find((row) => row.id === topicId) || pack.items[0];
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  const ch = packChapterPages(buildDenseChapterHtml(item, reading.chart), n);
  pages.push(...ch.pages);
  n = ch.nextNo;
  pages.push(closingPage(reading, ++n));
  return wrap(`${reading.displayName} · ${item.title} 정밀분석`, pages.join("\n"));
}

/** 3종 */
export function generateTripleProductHtml(reading, selectedIds = []) {
  const ids = selectedIds.length ? selectedIds.slice(0, 3) : ["wealth", "career", "marriage"];
  const pack = fortunePack(reading);
  const pages = [];
  let n = 0;
  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  pages.push(tocPage(++n));
  ids.forEach((id) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const ch = packChapterPages(buildDenseChapterHtml(item, reading.chart), n);
    pages.push(...ch.pages);
    n = ch.nextNo;
  });
  pages.push(closingPage(reading, ++n));
  return wrap(`${reading.displayName} · 3가지 맞춤 정밀분석`, pages.join("\n"));
}

/** 풀 패키지 */
export function generateFullProductHtml(reading) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let n = 0;

  pages.push(traditionalCover(reading));
  n = 1;
  pages.push(overviewPage(reading, ++n));
  pages.push(tocPage(++n));

  const origin = originChapter(reading, western, n);
  pages.push(...origin.pages);
  n = origin.nextNo;

  const order = ["wealth", "career", "business", "marriage", "compatibility", "children", "health", "moving", "travel"];
  order.forEach((id) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    const ch = packChapterPages(buildDenseChapterHtml(item, reading.chart), n);
    pages.push(...ch.pages);
    n = ch.nextNo;
  });

  pages.push(tenYearChartPage(reading, ++n));
  pages.push(monthTablePage(reading, ++n));

  if (reading.guide) {
    const guideHtml = `
      <div class="section-head"><h2>제10부 · 맞춤 개운법</h2><span class="num">改運</span></div>
      <div class="evidence"><h3>명리학적 근거 요약</h3>
        ${p(`희신 ${yongsinSummary(reading.chart).hee}을 식탁·색·방위에 먼저 들이고, 기신 ${yongsinSummary(reading.chart).gi}은 과하지 않게 줄입니다.`)}
      </div>
      ${card("음식·습관", [p(reading.guide.table?.foods?.join(", ")), p(reading.guide.table?.habit)].join(""))}
      ${card("색", (reading.guide.palette?.items || []).map((item) => p(`${item.title} · ${item.name} — ${item.text}`)).join(""))}
      ${(reading.guide.risks || []).map((risk) => card(risk.title, [p(risk.warning), p(`막는 법 · ${risk.remedy}`)].join(""))).join("")}
    `;
    pages.push(page(guideHtml, ++n, "flow"));
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
