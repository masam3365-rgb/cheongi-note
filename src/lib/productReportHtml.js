import { buildCustomFortunePack } from "./customFortune.js";
import { buildWesternAstrology } from "./westernAstrology.js";
import { easeSentence } from "./plainTerms.js";

function fortunePack(reading) {
  // PDF도 항상 최신 빌더로 생성(캐시된 customFortune 누락 방지)
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
  return `<div class="footer">달빛 사주관 · 동서양 융합 리포트 &nbsp;|&nbsp; - ${n} 페이지 -</div>`;
}

/** 외부 폰트·이미지 없이 즉시 인쇄되도록 시스템 서체만 사용 */
const STYLES = `
@page {
  size: A4;
  margin: 12mm 14mm;
}
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  color-adjust: exact !important;
}
html, body {
  font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
  margin: 0;
  color: #2c2c2c;
  background: #fcfbfa;
}
.page {
  width: 100%;
  min-height: calc(297mm - 24mm);
  padding: 8mm 4mm 14mm;
  box-sizing: border-box;
  position: relative;
  background: #fcfbfa;
  page-break-after: always;
  break-after: page;
  overflow: visible;
}
.page:last-of-type {
  page-break-after: auto;
  break-after: auto;
}
.page.chapter-start {
  page-break-before: always;
  break-before: page;
}
.page.chapter-start:first-of-type {
  page-break-before: auto;
  break-before: auto;
}
.chapter-cover {
  min-height: calc(297mm - 40mm);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 28px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f7f4ed 0%, #ede6d6 100%);
  border: 8px double #d4af37;
  break-inside: avoid;
  page-break-inside: avoid;
}
.chapter-cover.soft {
  background: #fff;
  border: 1px solid #d4af37;
}
.chapter-cover h1 { font-size: 28px; color: #1a2e22; margin: 0 0 12px; line-height: 1.45; break-inside: avoid; }
.chapter-cover h2 { font-size: 22px; color: #1a2e22; margin: 0 0 12px; border: none; break-inside: avoid; }
.chapter-cover p { font-size: 14px; color: #5a6b60; letter-spacing: 1px; line-height: 1.7; margin: 6px 0; }
.lotus {
  width: 58px; height: 58px;
  border: 1.5px solid #d4af37;
  border-radius: 999px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
  background: rgba(255,255,255,.55);
  break-inside: avoid;
  page-break-inside: avoid;
}
.lotus svg { width: 28px; height: 28px; display: block; }
h2 {
  color: #1a2e22;
  border-bottom: 1.5px solid #d4af37;
  padding-bottom: 8px;
  font-size: 18px;
  margin: 0 0 14px;
  break-after: avoid;
  page-break-after: avoid;
}
h3 { color: #1a2e22; font-size: 15px; margin: 0 0 8px; break-after: avoid; page-break-after: avoid; }
.card {
  background: #fff;
  border: 1px solid #e2dac9;
  padding: 16px 18px;
  border-radius: 6px;
  margin-bottom: 12px;
  box-shadow: 0 2px 5px rgba(0,0,0,.02);
  break-inside: avoid;
  page-break-inside: avoid;
}
.card p {
  font-size: 13.5px;
  line-height: 1.85;
  color: #444;
  margin: 0 0 8px;
  orphans: 3;
  widows: 3;
}
.card p:last-child { margin-bottom: 0; }
.block {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 12px;
}
.footer {
  margin-top: 18px;
  text-align: center;
  font-size: 11px;
  color: #8c857b;
  border-top: 1px solid #e2dac9;
  padding-top: 8px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.quiet { color: #7a8b80; font-size: 12px; }
@media print {
  html, body { background: #fcfbfa !important; }
  .page {
    width: auto;
    min-height: auto;
    padding: 0;
    box-shadow: none;
  }
  .no-print { display: none !important; }
  a { color: inherit; text-decoration: none; }
}
@media screen {
  body { background: #e8e2d6; padding: 16px 0 48px; }
  .page {
    width: 210mm;
    max-width: 100%;
    margin: 0 auto 18px;
    padding: 18mm 16mm 20mm;
    box-shadow: 0 8px 24px rgba(0,0,0,.08);
  }
  .print-hint {
    position: sticky; top: 0; z-index: 20;
    background: #1a2e22; color: #f7f4ed;
    text-align: center; padding: 10px 16px;
    font-size: 13px; letter-spacing: .02em;
  }
  .print-hint button {
    margin-left: 10px; border: 1px solid #d4af37; background: #d4af37; color: #1a2e22;
    border-radius: 999px; padding: 4px 12px; cursor: pointer; font-size: 12px;
  }
}
`;

/** 인라인 SVG 연꽃 간지 — 외부 이미지 로딩 없음 */
const LOTUS_SVG = `<div class="lotus" aria-hidden="true"><svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="32" cy="32" r="30" stroke="#d4af37" stroke-width="1.5"/><path d="M32 46c-7-6-14-12-14-20a14 14 0 1 1 28 0c0 8-7 14-14 20Z" fill="#1a2e22" opacity=".12"/><path d="M32 44c-5-5-10-10-10-16a10 10 0 1 1 20 0c0 6-5 11-10 16Z" stroke="#1a2e22" stroke-width="1.4"/><path d="M22 28c4 2 7 3 10 3s6-1 10-3M32 18v26" stroke="#d4af37" stroke-width="1.2" stroke-linecap="round"/></svg></div>`;

function wrap(title, pagesHtml) {
  const hint = `<div class="print-hint no-print">달빛 사주관 리포트 · 인쇄 시 여백·골드 포인트가 유지됩니다. <button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button></div>`;
  // DOMContentLoaded에서 바로 인쇄( window.onload / 외부 리소스 대기 없음 )
  const autoPrint = `<script>(function(){function go(){try{window.focus();window.print();}catch(e){}}if(document.readyState==="complete"||document.readyState==="interactive"){setTimeout(go,30);}else{document.addEventListener("DOMContentLoaded",function(){setTimeout(go,30);});}})();<\/script>`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${esc(title)}</title><style>${STYLES}</style></head><body>${hint}${pagesHtml}${autoPrint}</body></html>`;
}

function coverPage(inner, soft = false) {
  return `<div class="page chapter-start"><div class="chapter-cover${soft ? " soft" : ""}">${inner}</div></div>`;
}

function contentPage(inner, pageNo) {
  return `<div class="page"><div class="block">${inner}</div>${footer(pageNo)}</div>`;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function parasToCards(title, paragraphs, perPage = 4) {
  return chunk(paragraphs.filter(Boolean), perPage).map(
    (group, index) =>
      `<div class="block"><h2>${esc(title)}${group.length && paragraphs.length > perPage ? ` (${index + 1})` : ""}</h2>${card(title, group.map((line) => p(line)).join(""))}</div>`,
  );
}

function buildTriadPages(item, startNo) {
  const pages = [];
  let n = startNo;
  const push = (html) => {
    n += 1;
    pages.push(contentPage(html, n));
  };

  push(`<h2>핵심 요약</h2>${card(item.title, p(item.summary || ""))}`);

  parasToCards(item.eastern?.title || "상세 원인 풀이 · 동양 역학", item.eastern?.paragraphs || [], 5).forEach((html) =>
    push(html),
  );
  parasToCards(item.western?.title || "상세 원인 풀이 · 서양 점성술", item.western?.paragraphs || [], 5).forEach((html) =>
    push(html),
  );
  if (item.bridge?.paragraphs?.length) {
    parasToCards(item.bridge.title || "동서양 교차 한 줄", item.bridge.paragraphs, 5).forEach((html) => push(html));
  }

  if (item.id === "career" || item.majors?.lines?.length) {
    const title = item.id === "career" ? "맞춤 학과·전공 추천" : item.majors.title;
    const lines = item.majors?.lines?.length ? item.majors.lines : ["추천 학과·전공을 준비 중입니다."];
    push(`<h2>${esc(title)}</h2>${card("학과·전공", lines.map((line) => p(line)).join(""))}`);
  }
  if (item.id === "career" || item.timing?.lines?.length) {
    const title =
      item.id === "career" ? "진학·입시·시험·이직 유리한 시기 및 주의점" : item.timing.title;
    const lines = item.timing?.lines?.length ? item.timing.lines : ["진학·시험·이직 시기를 준비 중입니다."];
    push(`<h2>${esc(title)}</h2>${card("시기", lines.map((line) => p(line)).join(""))}`);
  }
  if (item.taegilGuide?.lines?.length) {
    push(
      `<h2>${esc(item.taegilGuide.title)}</h2>${card("택일", item.taegilGuide.lines.map((line) => p(line)).join(""))}`,
    );
  }

  if (item.actions?.length) {
    push(`<h2>실전 행동 지침</h2>${card("지금 바로", item.actions.map((line) => p(line)).join(""))}${
      item.months?.length
        ? card(
            "월별 포인트",
            item.months
              .slice(0, 6)
              .map((m) => p(`${m.month}월 · ${m.body} — ${m.tip}`))
              .join(""),
          )
        : ""
    }`);
  }
  if (item.months?.length > 6) {
    push(
      `<h2>월별 상세 (이어쓰기)</h2>${card(
        "7~12월",
        item.months
          .slice(6)
          .map((m) => p(`${m.month}월 · ${m.body} — ${m.tip}`))
          .join(""),
      )}`,
    );
  }

  return { pages, nextNo: n };
}

/** 단품 개별운 ~10페이지 */
export function generateSingleProductHtml(reading, topicId) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const item = pack.items.find((row) => row.id === topicId) || pack.items[0];
  const pages = [];
  let pageNo = 0;

  pages.push(
    coverPage(`
      ${LOTUS_SVG}
      <h1>달빛 사주관 심층 단품 리포트</h1>
      <p>${esc(item.title)} · 동양 역학 + 서양 점성술 융합</p>
      <p>수신자: ${esc(reading.displayName)} 님</p>
      <p class="quiet" style="margin-top:28px;">약 10페이지 분량의 주제 집중 분석</p>
    `),
  );
  pageNo = 1;

  pages.push(
    coverPage(
      `
      ${LOTUS_SVG}
      <h2>${esc(item.title)}</h2>
      <p>고요한 연못 위의 연꽃처럼, 한 가지 주제를 깊게 비춥니다.</p>
      <p class="quiet">${esc(item.blurb)}</p>
    `,
      true,
    ),
  );
  pageNo = 2;

  pageNo += 1;
  pages.push(
    contentPage(
      `<h2>명식과 별자리 요약</h2>
      ${card("사주", [p(`네 기둥 ${reading.chart.pillars.map((x) => x.gzKo).join(" ")}`), p(`일간 ${reading.chart.dayMasterKo}${reading.chart.dayElement} · ${reading.chart.strength.label}`), p(reading.bridge)].join(""))}
      ${card("서양 점성술", [p(western.summary), p(western.sun.text), p(western.moon.text), p(western.rising.text)].join(""))}`,
      pageNo,
    ),
  );

  const triad = buildTriadPages(item, pageNo);
  pages.push(...triad.pages);
  pageNo = triad.nextNo;

  pages.push(
    coverPage(`
      ${LOTUS_SVG}
      <h1>연꽃이 진 자리에도 향기는 남습니다</h1>
      <p>${esc(item.title)} 단품 리포트 · 약 ${pageNo + 1}페이지</p>
      <p class="quiet">참고용 해석이며 진료·투자·법률 판단을 대신하지 않습니다.</p>
    `),
  );

  return wrap(`${reading.displayName} · ${item.title} 단품 리포트`, pages.join("\n"));
}

/** 평생운 풀 패키지 ~120페이지 */
export function generateFullProductHtml(reading) {
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let pageNo = 0;
  const bumpCover = (inner, soft = false) => {
    pages.push(coverPage(inner, soft));
    pageNo += 1;
  };
  const bump = (inner) => {
    pageNo += 1;
    pages.push(contentPage(inner, pageNo));
  };

  bumpCover(`
    ${LOTUS_SVG}
    <h1>달빛 사주관 평생운세 풀 패키지</h1>
    <p>동양 역학 × 서양 점성술 · 약 120페이지 심층 리포트</p>
    <p>수신자: ${esc(reading.displayName)} 님</p>
    <p class="quiet" style="margin-top:28px;">마음의 평화와 지혜를 담은 명상적 사주 가이드</p>
  `);

  bumpCover(
    `
    ${LOTUS_SVG}
    <h2>제1장. 타고난 본원과 별자리</h2>
    <p>사주의 뼈대와 태양·달·상승의 렌즈를 먼저 맞춥니다.</p>
  `,
    true,
  );

  const character = reading.dashboard?.character?.personality;
  bump(
    `<h2>본원 성격 · 동양</h2>${card(
      "성격",
      [character?.summary, character?.deep, character?.balance, character?.tip, reading.guide?.summary]
        .filter(Boolean)
        .map((line) => p(line))
        .join("") || p("성격 풀이를 준비 중입니다."),
    )}`,
  );
  bump(`<h2>본원 성격 · 서양</h2>${card("태양·달·상승", [p(western.summary), p(western.sun?.text), p(western.moon?.text), p(western.rising?.text)].join(""))}${card("주요 행성", (western.planets || []).map((pl) => p(pl.text)).join("") || p("행성 요약을 준비 중입니다."))}`);
  bump(`<h2>동서양 교차 · 나</h2>${card("종합", [
    p(`사주의 일간(나의 중심 기운) ${reading.chart.dayMasterKo}${reading.chart.dayElement}과, 서양 점성술의 태양 ${western.sun.name}자리(삶의 목표 감각)를 겹쳐 읽습니다. 둘이 비슷하면 말과 선택이 한 방향으로 잘 맞고, 다르면 소개할 때 겉모습과 속마음을 나눠 설명하면 오해가 줄어듭니다.`),
    p(reading.bridge),
    p("서양의 상승(첫인상)·태양(목적)·달(속마음·휴식)을, 사주의 년·월·일·시처럼 ‘겉과 안’으로 나눠 보면 자기소개와 결정이 훨씬 쉬워집니다."),
  ].join(""))}`);

  pack.items.forEach((item, index) => {
    bumpCover(
      `
      ${LOTUS_SVG}
      <h2>제${index + 2}장. ${esc(item.title)}</h2>
      <p>${esc(item.blurb)}</p>
      <p class="quiet">동양 역학 · 서양 점성술 · 교차 종합</p>
    `,
      true,
    );
    const triad = buildTriadPages(item, pageNo);
    pages.push(...triad.pages);
    pageNo = triad.nextNo;
  });

  bumpCover(
    `
    ${LOTUS_SVG}
    <h2>제11장. 평생 총운과 10년 세운</h2>
    <p>큰 물줄기를 따라, 앞으로의 열 해를 고요히 읽습니다.</p>
  `,
    true,
  );

  bump(`<h2>평생 총운</h2>${card("동양", (pack.lifetime?.sections || []).flatMap((s) => [p(`[${s.title}]`), ...(s.lines || []).map((l) => p(l))]).join("") || p("평생 총운을 준비 중입니다."))}`);
  bump(`<h2>10년 세운 요약</h2>${card("흐름", [p(pack.tenYearSummary || "10년 세운 요약을 준비 중입니다."), p((pack.tenYearPeaks || []).join(" · "))].join(""))}`);

  (reading.tenYear?.years || []).forEach((year) => {
    bump(`<h2>${year.year}년 세운 · ${esc(easeSentence(year.gzFull))}</h2>
      ${card("종합", [p(year.headline), p(`별점 ${year.stars}/5 · ${year.level} ${year.score}%`)].join(""))}
      ${card("재물", p(year.wealth.text, { wealth: true }))}
      ${card("직장", p(year.career.text))}
      ${card("애정", p(year.love.text))}
      ${card("서양 교차", p(`${year.year}년 세운(그해의 흐름) 점수는 ‘언제 움직일지’를 알려 주고, 태양 ${western.sun.name}자리·달 ${western.moon.name}자리는 ‘그때 어떤 태도·휴식·말투가 맞는지’를 알려 줍니다. 둘을 같은 메모에 적으면 점수가 생활 습관으로 번역됩니다.`))}`);
  });

  bumpCover(
    `
    ${LOTUS_SVG}
    <h2>제12장. 열두 달 월운</h2>
    <p>양력 달력과 절기 간지를 함께 비춥니다.</p>
  `,
    true,
  );

  const year = reading.yearFortune?.defaultYear || new Date().getFullYear();
  const months = reading.yearFortune?.byYear?.[year]?.months || [];
  months.forEach((month) => {
    bump(`<h2>${esc(month.heading)}</h2>
      ${card("핵심", p(`${month.level} ${month.score}점 · ${month.summary}`))}
      ${card("재물·직장·대인", [p(month.wealth, { wealth: true }), p(month.career), p(month.relation)].join(""))}
      ${card("주의·개운", [p(month.watchDates?.join(" / ") || month.watch || ""), p(month.remedy)].join(""))}
      ${card("서양 한 줄", p(`이 달 월운 점수가 낮을수록, 태양 ${western.sun.name}자리의 목표보다 달 ${western.moon.name}자리(${western.moon.easy || "속마음과 쉬는 방식"})가 가리키는 휴식을 우선하세요. 몸이 회복되면 다음 달의 기회도 잘 잡힙니다.`))}`);
  });

  bumpCover(
    `
    ${LOTUS_SVG}
    <h2>제13장. 맞춤 개운법</h2>
    <p>음식·색·액땜을 생활의 작은 의식으로 바꿉니다.</p>
  `,
    true,
  );

  if (reading.guide) {
    bump(`<h2>개운 · 식탁과 색</h2>${card("음식", [p(reading.guide.table?.foods?.join(", ")), p(reading.guide.table?.habit)].join(""))}${card(
      "색",
      (reading.guide.palette?.items || []).map((item) => p(`${item.title} · ${item.name} — ${item.text}`)).join(""),
    )}`);
    bump(`<h2>액땜</h2>${(reading.guide.risks || []).map((risk) => card(risk.title, [p(risk.warning), p(`막는 법 · ${risk.remedy}`)].join(""))).join("")}`);
  }

  const meditations = [
    "서두르지 않는 달이 사람을 남깁니다. 후보 날짜를 하나 더 적어 두면 운이 새지 않습니다.",
    "합(서로 잘 맞는 기운)은 약속을 만들고, 충(부딪히기 쉬운 기운)은 경계를 가르칩니다. 둘 다 생활의 나침반입니다.",
    "태양(삶의 목표)이 할 일을 가리키면, 달(속마음·휴식)은 잠을 지키라고 합니다. 둘을 같이 챙기세요.",
    "좋은 날짜보다 준비된 서류·수면·관계가 먼저입니다. 준비가 된 날이 곧 길일입니다.",
    "개운은 거창한 의식이 아니라, 이번 주 할 일 하나와 하지 않을 일 하나를 적는 작은 선택입니다.",
    "동양 역학의 ‘때’와 서양 점성술의 ‘태도’가 만날 때, 운은 막연한 말이 아니라 생활 체크리스트가 됩니다.",
    "오늘 하지 않을 일 하나—당일 큰 송금, 감정적인 장문, 수면 줄이기—가 내일을 엽니다.",
    "직장에서의 자리(10하우스)든 매일의 건강(6하우스)이든, 이름 붙인 작은 실천이 성취를 남깁니다.",
  ];
  while (pageNo < 110) {
    const line = meditations[pageNo % meditations.length];
    bumpCover(
      `
      ${LOTUS_SVG}
      <h2>달빛 명상 간지</h2>
      <p>${esc(line)}</p>
      <p class="quiet">${esc(reading.displayName)} 님의 리포트 · ${pageNo + 1}페이지 부근</p>
    `,
      true,
    );
  }

  bumpCover(`
    ${LOTUS_SVG}
    <h1>연꽃이 진 자리에도 향기는 남습니다</h1>
    <p>평생운세 풀 패키지 · 총 ${pageNo + 1}페이지</p>
    <p class="quiet">참고용 해석이며 진료·투자·법률 판단을 대신하지 않습니다.</p>
  `);

  return wrap(`${reading.displayName} · 평생운세 풀 패키지`, pages.join("\n"));
}

export function generateTripleProductHtml(reading, selectedIds = []) {
  const ids = selectedIds.length ? selectedIds.slice(0, 3) : ["wealth", "career", "marriage"];
  const pack = fortunePack(reading);
  const western = pack.western || reading.western || buildWesternAstrology(reading.chart);
  const pages = [];
  let pageNo = 0;
  pages.push(
    coverPage(`
      ${LOTUS_SVG}
      <h1>달빛 사주관 3가지 맞춤 리포트</h1>
      <p>동양 역학 × 서양 점성술</p>
      <p>수신자: ${esc(reading.displayName)} 님</p>
    `),
  );
  pageNo = 1;
  pageNo += 1;
  pages.push(
    contentPage(
      `<h2>명식·별자리 요약</h2>${card("사주", p(`일간 ${reading.chart.dayMasterKo}${reading.chart.dayElement} · ${reading.chart.strength.label}`))}${card("점성술", p(western.summary))}`,
      pageNo,
    ),
  );
  ids.forEach((id) => {
    const item = pack.items.find((row) => row.id === id);
    if (!item) return;
    pages.push(
      coverPage(
        `${LOTUS_SVG}<h2>${esc(item.title)}</h2><p>${esc(item.blurb)}</p>`,
        true,
      ),
    );
    pageNo += 1;
    const triad = buildTriadPages(item, pageNo);
    pages.push(...triad.pages);
    pageNo = triad.nextNo;
  });
  pages.push(
    coverPage(`
      ${LOTUS_SVG}
      <h1>맞춤 세 갈래를 닫으며</h1>
      <p>총 ${pageNo + 1}페이지 · 참고용 해석입니다.</p>
    `),
  );
  return wrap(`${reading.displayName} · 3가지 맞춤 리포트`, pages.join("\n"));
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
