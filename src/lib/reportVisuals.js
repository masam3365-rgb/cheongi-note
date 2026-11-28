/**
 * 유료 PDF용 직접 제작 SVG 도표·절제 삽화.
 * 수치·좌표는 호출측이 넘긴 계산 결과만 사용한다(임의 생성 금지).
 */

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const WX_ORDER = ["목", "화", "토", "금", "수"];
const WX_STYLE = {
  목: { fill: "#66bb6a", stroke: "#1b5e20", han: "木" },
  화: { fill: "#e57373", stroke: "#8b0000", han: "火" },
  토: { fill: "#ffb74d", stroke: "#7a4f01", han: "土" },
  금: { fill: "#c9a227", stroke: "#5c4a12", han: "金" },
  수: { fill: "#64b5f6", stroke: "#0d47a1", han: "水" },
};

/** 오행 균형 막대 — chart.count 실수치 */
export function svgWuxingBalance(count = {}) {
  const values = WX_ORDER.map((k) => ({ key: k, n: Number(count[k]) || 0, ...WX_STYLE[k] }));
  const max = Math.max(1, ...values.map((v) => v.n));
  const w = 560;
  const rowH = 28;
  const padL = 56;
  const padR = 36;
  const barMax = w - padL - padR;
  const h = 24 + values.length * rowH + 8;
  const bars = values
    .map((v, i) => {
      const y = 16 + i * rowH;
      const bw = Math.max(4, (v.n / max) * barMax);
      return `<text x="8" y="${y + 14}" font-size="13" fill="#14233a" font-family="Batang, Malgun Gothic, serif">${esc(v.han)} ${esc(v.key)}</text>
        <rect x="${padL}" y="${y}" width="${barMax}" height="16" rx="2" fill="#f0e6d4"/>
        <rect x="${padL}" y="${y}" width="${bw.toFixed(1)}" height="16" rx="2" fill="${v.fill}" stroke="${v.stroke}" stroke-width="0.8"/>
        <text x="${padL + bw + 6}" y="${y + 13}" font-size="12" fill="#14233a">${v.n}</text>`;
    })
    .join("");
  return `<div class="visual-slot" data-visual="wuxing">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="오행 균형도">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      ${bars}
    </svg>
    <p class="visual-caption">오행 균형도 · 명식에서 집계된 개수(임의 수치가 아닙니다)</p>
  </div>`;
}

/**
 * 10년 세운 흐름 그래프 — years[].score 실수치
 * @param {{ year:number, score:number, gzKo?:string }[]} years
 */
export function svgTenYearFlow(years = []) {
  const list = (years || []).filter((y) => y && y.year != null);
  if (!list.length) return "";
  const w = 640;
  const h = 200;
  const pad = { l: 40, r: 16, t: 20, b: 36 };
  const scores = list.map((y) => Number(y.score) || 0);
  const min = Math.min(...scores, 40) - 5;
  const max = Math.max(...scores, 90) + 5;
  const span = Math.max(1, max - min);
  const pts = list.map((y, i) => {
    const x = pad.l + (i * (w - pad.l - pad.r)) / Math.max(1, list.length - 1);
    const yv = pad.t + ((max - (Number(y.score) || 0)) / span) * (h - pad.t - pad.b);
    return { x, y: yv, year: y.year, score: y.score, gz: y.gzKo || y.gz || "" };
  });
  const polyline = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${pad.l},${h - pad.b} ${polyline} ${pts[pts.length - 1].x.toFixed(1)},${h - pad.b}`;
  const dots = pts
    .map(
      (p) =>
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="#14233a" stroke="#c9a227" stroke-width="1.4"/>
         <text x="${p.x.toFixed(1)}" y="${(p.y - 9).toFixed(1)}" text-anchor="middle" font-size="10" fill="#5c1a1a">${esc(String(p.score ?? ""))}</text>
         <text x="${p.x.toFixed(1)}" y="${h - 14}" text-anchor="middle" font-size="10" fill="#4a3f32">${esc(String(p.year).slice(2))}</text>`,
    )
    .join("");
  return `<div class="visual-slot" data-visual="tenyear">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="10년 세운 흐름">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      <line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${h - pad.b}" stroke="#d0c0a4"/>
      <line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="#d0c0a4"/>
      <polygon points="${area}" fill="rgba(201,162,39,0.12)"/>
      <polyline fill="none" stroke="#14233a" stroke-width="2.4" points="${polyline}"/>
      <polyline fill="none" stroke="#c9a227" stroke-width="1.2" stroke-dasharray="4 3" points="${polyline}"/>
      ${dots}
    </svg>
    <p class="visual-caption">10년 세운 흐름 · 계산된 연도별 종합 점수</p>
  </div>`;
}

/**
 * 대운 타임라인 — cycles의 startYear~endYear 실구간
 */
export function svgDaYunTimeline(cycles = []) {
  const list = (cycles || []).filter((c) => c && c.startYear != null && c.endYear != null);
  if (!list.length) return "";
  const w = 640;
  const h = 88;
  const pad = { l: 48, r: 16, t: 28, b: 24 };
  const minY = Math.min(...list.map((c) => Number(c.startYear)));
  const maxY = Math.max(...list.map((c) => Number(c.endYear)));
  const span = Math.max(1, maxY - minY);
  const barY = 36;
  const track = `<rect x="${pad.l}" y="${barY}" width="${w - pad.l - pad.r}" height="14" rx="3" fill="#f0e6d4" stroke="#d0c0a4"/>`;
  const segs = list
    .map((c, i) => {
      const x1 = pad.l + ((Number(c.startYear) - minY) / span) * (w - pad.l - pad.r);
      const x2 = pad.l + ((Number(c.endYear) - minY) / span) * (w - pad.l - pad.r);
      const bw = Math.max(6, x2 - x1 - 1);
      const fill = i % 2 === 0 ? "#14233a" : "#c9a227";
      const label = c.gzKo || c.gz || "";
      return `<rect x="${x1.toFixed(1)}" y="${barY}" width="${bw.toFixed(1)}" height="14" rx="2" fill="${fill}" opacity="0.85"/>
        <text x="${(x1 + bw / 2).toFixed(1)}" y="${barY - 6}" text-anchor="middle" font-size="9" fill="#14233a">${esc(label)}</text>`;
    })
    .join("");
  return `<div class="visual-slot" data-visual="dayun">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="대운 타임라인">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      <text x="${pad.l}" y="16" font-size="11" fill="#5c1a1a">${esc(String(minY))}–${esc(String(maxY))} · 대운 구간</text>
      ${track}${segs}
      <text x="${pad.l}" y="${h - 8}" font-size="9" fill="#6a5a4a">${esc(String(minY))}</text>
      <text x="${w - pad.r}" y="${h - 8}" text-anchor="end" font-size="9" fill="#6a5a4a">${esc(String(maxY))}</text>
    </svg>
    <p class="visual-caption">평생 대운 타임라인 · 계산된 연도 구간(임의 배치 아님)</p>
  </div>`;
}

/**
 * 월별 흐름 막대 — months[].score 실수치
 */
export function svgMonthFlowBars(months = [], yearLabel = "") {
  const list = (months || []).filter((m) => m && m.month != null);
  if (!list.length) return "";
  const w = 640;
  const h = 132;
  const pad = { l: 28, r: 12, t: 16, b: 24 };
  const scores = list.map((m) => Number(m.score) || 0);
  const max = Math.max(80, ...scores);
  const min = Math.min(40, ...scores);
  const span = Math.max(1, max - min);
  const gap = 4;
  const barW = (w - pad.l - pad.r - gap * (list.length - 1)) / list.length;
  const bars = list
    .map((m, i) => {
      const sc = Number(m.score) || 0;
      const bh = ((sc - min) / span) * (h - pad.t - pad.b);
      const x = pad.l + i * (barW + gap);
      const y = h - pad.b - bh;
      const fill = sc >= 74 ? "#1b5e20" : sc >= 58 ? "#c9a227" : "#8b1e1e";
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(6, barW - 1).toFixed(1)}" height="${Math.max(2, bh).toFixed(1)}" fill="${fill}" rx="1.5"/>
        <text x="${(x + barW / 2).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="9" fill="#4a3f32">${esc(String(m.month))}</text>
        <text x="${(x + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#14233a">${esc(String(sc))}</text>`;
    })
    .join("");
  return `<div class="visual-slot" data-visual="month">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="월별 운세 흐름">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      <line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="#d0c0a4"/>
      ${bars}
    </svg>
    <p class="visual-caption">${esc(yearLabel || "")} 월별 길흉 지수 · 계산된 월운 점수</p>
  </div>`;
}

/**
 * 십성(십신) 분포 — pillars[].shiShen 실측 집계
 * @param {{ shiShen?: string, label?: string, gzKo?: string }[]} pillars
 */
export function svgShiShenBars(pillars = []) {
  const counts = new Map();
  for (const p of pillars || []) {
    const key = String(p?.shiShen || "").trim();
    if (!key || key === "—") continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const entries = [...counts.entries()];
  if (!entries.length) return "";
  const w = 560;
  const rowH = 26;
  const padL = 72;
  const padR = 36;
  const barMax = w - padL - padR;
  const max = Math.max(1, ...entries.map(([, n]) => n));
  const h = 20 + entries.length * rowH + 8;
  const bars = entries
    .map(([name, n], i) => {
      const y = 14 + i * rowH;
      const bw = Math.max(6, (n / max) * barMax);
      return `<text x="8" y="${y + 13}" font-size="12" fill="#14233a" font-family="Batang, Malgun Gothic, serif">${esc(name)}</text>
        <rect x="${padL}" y="${y}" width="${barMax}" height="14" rx="2" fill="#f0e6d4"/>
        <rect x="${padL}" y="${y}" width="${bw.toFixed(1)}" height="14" rx="2" fill="${i % 2 ? "#c9a227" : "#14233a"}"/>
        <text x="${padL + bw + 6}" y="${y + 12}" font-size="11" fill="#14233a">${n}</text>`;
    })
    .join("");
  return `<div class="visual-slot" data-visual="shishen">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="십성 분포">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      ${bars}
    </svg>
    <p class="visual-caption">십성(십신) 분포 · 네 기둥에서 집계(임의 수치 아님)</p>
  </div>`;
}

/**
 * 월별 테마 점수 막대 — months 배열의 scoreKey 실수치
 * @param {object[]} months
 * @param {string} scoreKey wealthScore|careerScore|relationScore|score
 * @param {string} caption
 */
export function svgMonthThemeBars(months = [], scoreKey = "score", caption = "월별 점수") {
  const list = (months || []).filter((m) => m && m.month != null && m[scoreKey] != null);
  if (!list.length) return "";
  const w = 640;
  const h = 118;
  const pad = { l: 28, r: 12, t: 14, b: 24 };
  const scores = list.map((m) => Number(m[scoreKey]) || 0);
  const max = Math.max(80, ...scores);
  const min = Math.min(40, ...scores);
  const span = Math.max(1, max - min);
  const gap = 4;
  const barW = (w - pad.l - pad.r - gap * (list.length - 1)) / list.length;
  const bars = list
    .map((m, i) => {
      const sc = Number(m[scoreKey]) || 0;
      const bh = ((sc - min) / span) * (h - pad.t - pad.b);
      const x = pad.l + i * (barW + gap);
      const y = h - pad.b - bh;
      const fill = sc >= 74 ? "#1b5e20" : sc >= 58 ? "#c9a227" : "#8b1e1e";
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(6, barW - 1).toFixed(1)}" height="${Math.max(2, bh).toFixed(1)}" fill="${fill}" rx="1.5"/>
        <text x="${(x + barW / 2).toFixed(1)}" y="${h - 10}" text-anchor="middle" font-size="9" fill="#4a3f32">${esc(String(m.month))}</text>
        <text x="${(x + barW / 2).toFixed(1)}" y="${(y - 3).toFixed(1)}" text-anchor="middle" font-size="8" fill="#14233a">${esc(String(sc))}</text>`;
    })
    .join("");
  const yearTok = (String(caption).match(/(\d{4})/) || [])[1] || "";
  const yearAttr = yearTok ? `-${yearTok}` : "";
  return `<div class="visual-slot" data-visual="theme-${esc(scoreKey)}${yearAttr}" data-year="${esc(yearTok)}">
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(caption)}">
      <rect width="${w}" height="${h}" fill="#fffdf8"/>
      <line x1="${pad.l}" y1="${h - pad.b}" x2="${w - pad.r}" y2="${h - pad.b}" stroke="#d0c0a4"/>
      ${bars}
    </svg>
    <p class="visual-caption">${esc(caption)} · 계산된 월별 지수</p>
  </div>`;
}

/**
 * 10년 테마 점수 — years[].wealth|career|love.score
 */
export function svgYearThemeFlow(years = [], theme = "wealth", caption = "10년 테마 흐름") {
  const list = (years || [])
    .map((y) => {
      const block = y?.[theme];
      const score = block && typeof block === "object" ? Number(block.score) : Number(y?.[theme]);
      if (y?.year == null || !Number.isFinite(score)) return null;
      return { year: y.year, score };
    })
    .filter(Boolean);
  if (list.length < 2) return "";
  return svgTenYearFlow(list).replace(
    /data-visual="tenyear"/,
    `data-visual="yeartheme-${esc(theme)}"`,
  ).replace(
    /10년 세운 흐름 · 계산된 연도별 종합 점수/,
    esc(caption),
  ).replace(
    /aria-label="10년 세운 흐름"/,
    `aria-label="${esc(caption)}"`,
  );
}

/** 절제된 산수화 풍 장식 — 장 시작용, 높이 제한 */
export function svgOrnamentLandscape() {
  return `<div class="ornament" data-ornament="landscape" aria-hidden="true">
    <svg viewBox="0 0 420 56" width="100%" height="48" xmlns="http://www.w3.org/2000/svg">
      <rect width="420" height="56" fill="transparent"/>
      <path d="M0 48 C40 44 70 30 110 34 C140 20 170 10 210 18 C250 8 290 16 330 28 C360 22 390 30 420 36 L420 56 L0 56 Z" fill="#e8dcc4" stroke="#c9a227" stroke-width="0.6"/>
      <path d="M20 48 C50 40 80 36 120 40 C150 28 180 24 220 30" fill="none" stroke="#14233a" stroke-width="0.9" opacity="0.55"/>
      <circle cx="360" cy="14" r="5" fill="none" stroke="#c9a227" stroke-width="1"/>
      <path d="M60 48 L68 28 L76 48 Z" fill="#14233a" opacity="0.35"/>
      <path d="M300 48 L308 32 L316 48 Z" fill="#14233a" opacity="0.25"/>
    </svg>
  </div>`;
}

/** 금빛 연꽃 — 장 마무리용 */
export function svgOrnamentLotus() {
  return `<div class="ornament is-lotus" data-ornament="lotus" aria-hidden="true">
    <svg viewBox="0 0 120 52" width="120" height="44" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(60,30)">
        <ellipse cx="0" cy="8" rx="28" ry="6" fill="#e8dcc4" opacity="0.7"/>
        <path d="M0 6 C-8 -2 -14 -10 -6 -16 C-2 -10 0 -4 0 6 Z" fill="#c9a227" stroke="#8b1e1e" stroke-width="0.5"/>
        <path d="M0 6 C8 -2 14 -10 6 -16 C2 -10 0 -4 0 6 Z" fill="#d4af37" stroke="#8b1e1e" stroke-width="0.5"/>
        <path d="M0 6 C-12 0 -16 -8 -10 -14 C-4 -8 0 -2 0 6 Z" fill="#b8860b" opacity="0.9"/>
        <path d="M0 6 C12 0 16 -8 10 -14 C4 -8 0 -2 0 6 Z" fill="#daa520" opacity="0.9"/>
        <circle cx="0" cy="-2" r="3" fill="#fff8e1" stroke="#c9a227" stroke-width="0.6"/>
      </g>
    </svg>
  </div>`;
}

/** 구름·여백 문양 */
export function svgOrnamentCloud() {
  return `<div class="ornament" data-ornament="cloud" aria-hidden="true">
    <svg viewBox="0 0 360 44" width="100%" height="40" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 30 C50 18 70 14 88 20 C96 10 118 8 132 18 C148 8 172 12 180 24 C198 14 230 16 244 28 C260 20 290 22 310 30 C280 34 200 36 40 30 Z" fill="#efe6d4" stroke="#c9a227" stroke-width="0.7"/>
      <path d="M60 28 C72 20 92 18 108 24" fill="none" stroke="#14233a" stroke-width="0.6" opacity="0.4"/>
    </svg>
  </div>`;
}

/** 전통 뇌문(雷紋) 띠 */
export function svgOrnamentPattern() {
  return `<div class="ornament" data-ornament="pattern" aria-hidden="true">
    <svg viewBox="0 0 400 36" width="100%" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="384" height="8" fill="none" stroke="#c9a227" stroke-width="1"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        .map((i) => {
          const x = 20 + i * 32;
          return `<path d="M${x} 18 h10 v-6 h10 v12 h-10 v-6 h-10 z" fill="none" stroke="#8b1e1e" stroke-width="0.8" opacity="0.75"/>`;
        })
        .join("")}
    </svg>
  </div>`;
}

/** 원형 낙관 문양 */
export function svgOrnamentSeal() {
  return `<div class="ornament" data-ornament="seal" aria-hidden="true">
    <svg viewBox="0 0 80 80" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="28" fill="none" stroke="#b71c1c" stroke-width="2"/>
      <circle cx="40" cy="40" r="22" fill="none" stroke="#b71c1c" stroke-width="1"/>
      <text x="40" y="46" text-anchor="middle" font-size="18" fill="#b71c1c" font-family="Batang, serif">吉</text>
    </svg>
  </div>`;
}

/** 물결·여백 */
export function svgOrnamentWave() {
  return `<div class="ornament" data-ornament="wave" aria-hidden="true">
    <svg viewBox="0 0 400 40" width="100%" height="36" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 22 C40 8 80 36 120 22 C160 8 200 36 240 22 C280 8 320 36 360 22 L400 22 L400 40 L0 40 Z" fill="#e8dcc4" stroke="#c9a227" stroke-width="0.6"/>
      <path d="M0 18 C50 30 90 6 140 18 C190 30 230 6 280 18" fill="none" stroke="#14233a" stroke-width="0.7" opacity="0.45"/>
    </svg>
  </div>`;
}

/** 학·산 실루엣(절제) */
export function svgOrnamentCrane() {
  return `<div class="ornament" data-ornament="crane" aria-hidden="true">
    <svg viewBox="0 0 200 56" width="160" height="44" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 48 C50 40 70 28 90 32 C110 20 140 16 170 28" fill="none" stroke="#c9a227" stroke-width="1"/>
      <path d="M118 30 L130 18 L142 28 L134 30 L148 42 L128 34 Z" fill="#14233a" opacity="0.55"/>
      <circle cx="132" cy="16" r="2" fill="#8b1e1e"/>
    </svg>
  </div>`;
}

/** 책·서권 문양 */
export function svgOrnamentScroll() {
  return `<div class="ornament" data-ornament="scroll" aria-hidden="true">
    <svg viewBox="0 0 220 48" width="180" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="14" width="160" height="22" rx="3" fill="#fffdf8" stroke="#c9a227" stroke-width="1"/>
      <path d="M30 16 C22 16 22 34 30 34" fill="#e8dcc4" stroke="#8b1e1e" stroke-width="0.8"/>
      <path d="M190 16 C198 16 198 34 190 34" fill="#e8dcc4" stroke="#8b1e1e" stroke-width="0.8"/>
      <line x1="50" y1="22" x2="170" y2="22" stroke="#d0c0a4"/>
      <line x1="50" y1="28" x2="150" y2="28" stroke="#d0c0a4"/>
    </svg>
  </div>`;
}

/** 음양 태극 — 여백 보완용 */
export function svgOrnamentTaiji() {
  return `<div class="ornament" data-ornament="taiji" aria-hidden="true">
    <svg viewBox="0 0 72 72" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="30" fill="#fffdf8" stroke="#c9a227" stroke-width="1.2"/>
      <path d="M36 6 A30 30 0 0 1 36 66 A15 15 0 0 1 36 36 A15 15 0 0 0 36 6 Z" fill="#14233a"/>
      <circle cx="36" cy="21" r="5" fill="#fffdf8"/>
      <circle cx="36" cy="51" r="5" fill="#14233a"/>
    </svg>
  </div>`;
}

/** 팔괘 간략 문양 */
export function svgOrnamentBagua() {
  return `<div class="ornament" data-ornament="bagua" aria-hidden="true">
    <svg viewBox="0 0 200 48" width="180" height="40" xmlns="http://www.w3.org/2000/svg">
      ${[0, 1, 2, 3]
        .map((i) => {
          const x = 16 + i * 48;
          return `<g transform="translate(${x},10)">
            <rect x="0" y="0" width="28" height="3" fill="#8b1e1e"/>
            <rect x="0" y="8" width="12" height="3" fill="#c9a227"/>
            <rect x="16" y="8" width="12" height="3" fill="#c9a227"/>
            <rect x="0" y="16" width="28" height="3" fill="#14233a"/>
            <rect x="0" y="24" width="12" height="3" fill="#c9a227"/>
            <rect x="16" y="24" width="12" height="3" fill="#c9a227"/>
          </g>`;
        })
        .join("")}
    </svg>
  </div>`;
}
