/**
 * 유료 PDF 페이지 분량 균형·공백 채움.
 * 실데이터 SVG만 사용하며, 같은 도표/삽화 반복을 막는다.
 */
import {
  svgDaYunTimeline,
  svgMonthThemeBars,
  svgOrnamentCloud,
  svgOrnamentCrane,
  svgOrnamentLandscape,
  svgOrnamentLotus,
  svgOrnamentPattern,
  svgOrnamentScroll,
  svgOrnamentSeal,
  svgOrnamentWave,
  svgOrnamentTaiji,
  svgOrnamentBagua,
  svgShiShenBars,
  svgTenYearFlow,
  svgWuxingBalance,
  svgYearThemeFlow,
} from "./reportVisuals.js";

export function estimateBodyWeight(html) {
  const raw = String(html || "");
  const cards = (raw.match(/class="card"/g) || []).length;
  const paras = (raw.match(/<p[\s>]/g) || []).length;
  const visuals = (raw.match(/data-visual=/g) || []).length;
  const ornaments = (raw.match(/data-ornament=/g) || []).length;
  const tables = (raw.match(/<table[\s>]/g) || []).length;
  const text = raw.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  // 본문 길이를 자르지 않음 — A4 한 장(~1000px) 초과 과밀을 조기에 감지
  return (
    cards * 36 +
    paras * 16 +
    visuals * 150 +
    ornaments * 44 +
    tables * 130 +
    Math.min(text.length, 2200) * 0.55
  );
}

function topicHint(html) {
  const t = String(html || "");
  if (/재물/.test(t)) return "wealth";
  if (/직업|진로|사업/.test(t)) return "career";
  if (/결혼|인연|궁합|자녀|가족/.test(t)) return "family";
  if (/건강/.test(t)) return "health";
  if (/이사|여행|이동/.test(t)) return "move";
  if (/대운|세운|월운|生涯|大運/.test(t)) return "flow";
  if (/오행|지장간|본원|本性|십성|십신/.test(t)) return "origin";
  return "general";
}

/**
 * 보고서 전역에서 1회씩만 소모하는 시각자료 금고
 */
/** 본문에서 세운·월운 연도 추출 (없으면 null) */
export function extractContextYear(html) {
  const t = String(html || "");
  const sewoon = t.match(/(\d{4})\s*년\s*세운/);
  if (sewoon) return Number(sewoon[1]);
  const monthPack = t.match(/(\d{4})\s*년\s*\d+\s*[~～\-–]\s*\d+\s*월/);
  if (monthPack) return Number(monthPack[1]);
  const labeled = t.match(/(\d{4})\s*년\s*월별/);
  if (labeled) return Number(labeled[1]);
  return null;
}

export function createVisualBank(reading) {
  const chart = reading?.chart || {};
  const defaultYear = reading?.yearFortune?.defaultYear;
  const years = reading?.tenYear?.years || [];
  const cycles = chart.daYun?.cycles || [];
  const byYear = reading?.yearFortune?.byYear || {};

  function monthsFor(y) {
    const yr = Number(y) || defaultYear;
    return byYear?.[yr]?.months || [];
  }

  const dataPool = [
    {
      id: "wuxing",
      hints: ["origin", "general", "health"],
      yearScoped: false,
      html: () => (chart.count ? svgWuxingBalance(chart.count) : ""),
    },
    {
      id: "shishen",
      hints: ["origin", "career", "general"],
      yearScoped: false,
      html: () => svgShiShenBars(chart.pillars || []),
    },
    {
      id: "dayun",
      hints: ["flow", "general"],
      yearScoped: false,
      html: () => svgDaYunTimeline(cycles),
    },
    {
      id: "tenyear",
      hints: ["flow", "general"],
      yearScoped: false,
      html: () => svgTenYearFlow(years),
    },
    {
      id: "wealth-month",
      hints: ["wealth"],
      yearScoped: true,
      html: (forYear) => {
        const y = forYear || defaultYear;
        return svgMonthThemeBars(monthsFor(y), "wealthScore", `${y || ""}년 월별 재물 지수`);
      },
    },
    {
      id: "career-month",
      hints: ["career"],
      yearScoped: true,
      html: (forYear) => {
        const y = forYear || defaultYear;
        return svgMonthThemeBars(monthsFor(y), "careerScore", `${y || ""}년 월별 직장 지수`);
      },
    },
    {
      id: "relation-month",
      hints: ["family"],
      yearScoped: true,
      html: (forYear) => {
        const y = forYear || defaultYear;
        return svgMonthThemeBars(monthsFor(y), "relationScore", `${y || ""}년 월별 대인 지수`);
      },
    },
    {
      id: "month-score",
      hints: ["flow", "move", "general"],
      yearScoped: true,
      html: (forYear) => {
        const y = forYear || defaultYear;
        return svgMonthThemeBars(monthsFor(y), "score", `${y || ""}년 월별 종합 지수`);
      },
    },
    {
      id: "wealth-year",
      hints: ["wealth"],
      yearScoped: false,
      html: () => svgYearThemeFlow(years, "wealth", "10년 재물 지수 흐름"),
    },
    {
      id: "career-year",
      hints: ["career"],
      yearScoped: false,
      html: () => svgYearThemeFlow(years, "career", "10년 직업 지수 흐름"),
    },
    {
      id: "love-year",
      hints: ["family"],
      yearScoped: false,
      html: () => svgYearThemeFlow(years, "love", "10년 관계 지수 흐름"),
    },
  ];

  const ornamentPool = [
    { id: "landscape", html: () => svgOrnamentLandscape() },
    { id: "lotus", html: () => svgOrnamentLotus() },
    { id: "cloud", html: () => svgOrnamentCloud() },
    { id: "pattern", html: () => svgOrnamentPattern() },
    { id: "seal", html: () => svgOrnamentSeal() },
    { id: "wave", html: () => svgOrnamentWave() },
    { id: "crane", html: () => svgOrnamentCrane() },
    { id: "scroll", html: () => svgOrnamentScroll() },
    { id: "taiji", html: () => svgOrnamentTaiji() },
    { id: "bagua", html: () => svgOrnamentBagua() },
  ];

  const usedData = new Set();
  const usedOrnament = new Set();
  let ornamentReuseIdx = 0;

  function usageKey(item, forYear) {
    if (item.yearScoped && forYear) return `${item.id}@${forYear}`;
    return item.id;
  }

  function takeData(hint, { allowReuse = false, forYear = null } = {}) {
    const y = forYear || null;
    const preferred = dataPool.filter((d) => !usedData.has(usageKey(d, y)) && d.hints.includes(hint));
    const fallback = dataPool.filter((d) => !usedData.has(usageKey(d, y)));
    for (const item of [...preferred, ...fallback]) {
      // 세운 연도가 명시된 페이지에는 다른 해 월 도표를 넣지 않음
      const html = item.yearScoped ? item.html(y || defaultYear) : item.html();
      if (!html) continue;
      usedData.add(usageKey(item, y || (item.yearScoped ? defaultYear : null)));
      return html;
    }
    // 희소 keep-apart: 이미 쓴 도표라도 주제·연도에 맞는 재배치 허용
    if (allowReuse) {
      const reuse = dataPool.filter((d) => d.hints.includes(hint));
      const any = reuse.length ? reuse : dataPool;
      for (const item of any) {
        const html = item.yearScoped ? item.html(y || defaultYear) : item.html();
        if (html) return html;
      }
    }
    return "";
  }

  function takeOrnament({ allowReuse = false } = {}) {
    for (const item of ornamentPool) {
      if (usedOrnament.has(item.id)) continue;
      usedOrnament.add(item.id);
      return item.html();
    }
    // 풀이 소진된 뒤에만, 아주 빈 페이지용으로 순환 재사용(전면 동일 반복 방지)
    if (allowReuse && ornamentPool.length) {
      const item = ornamentPool[ornamentReuseIdx % ornamentPool.length];
      ornamentReuseIdx += 1;
      return item.html();
    }
    return "";
  }

  return {
    usedData,
    usedOrnament,
    takeData,
    takeOrnament,
    /** 이미 HTML에 등장한 시각 id를 소모 처리(본문에 직접 넣은 것) */
    markUsedFromHtml(html) {
      const raw = String(html || "");
      for (const m of raw.matchAll(/data-visual="([^"]+)"/g)) {
        const v = m[1];
        if (v === "wuxing") usedData.add("wuxing");
        else if (v === "shishen") usedData.add("shishen");
        else if (v === "dayun") usedData.add("dayun");
        else if (v === "tenyear") usedData.add("tenyear");
        else if (v === "month") usedData.add("month-score");
        else if (v.startsWith("theme-wealthScore")) {
          const yr = (v.match(/theme-wealthScore-(\d{4})/) || [])[1];
          usedData.add(yr ? `wealth-month@${yr}` : "wealth-month");
        } else if (v.startsWith("theme-careerScore")) {
          const yr = (v.match(/theme-careerScore-(\d{4})/) || [])[1];
          usedData.add(yr ? `career-month@${yr}` : "career-month");
        } else if (v.startsWith("theme-relationScore")) {
          const yr = (v.match(/theme-relationScore-(\d{4})/) || [])[1];
          usedData.add(yr ? `relation-month@${yr}` : "relation-month");
        } else if (v.startsWith("theme-score")) {
          const yr = (v.match(/theme-score-(\d{4})/) || [])[1];
          usedData.add(yr ? `month-score@${yr}` : "month-score");
        }
        else if (v.startsWith("yeartheme-wealth")) usedData.add("wealth-year");
        else if (v.startsWith("yeartheme-career")) usedData.add("career-year");
        else if (v.startsWith("yeartheme-love")) usedData.add("love-year");
      }
      for (const m of raw.matchAll(/data-ornament="([^"]+)"/g)) {
        usedOrnament.add(m[1]);
      }
    },
  };
}

/** 이 미만이면 도표·장식으로 하단 공백 보완 (12.5pt 기준) */
const SPARSE_SOFT = 680;
const TARGET_FILL = 800;
/** 일반 본문 병합 한도 — A4에 안전하게 들어가는 선 */
const MERGE_SOFT = 820;
/** 이보다 무거우면 카드 단위 분할 — 12.5pt에서 ~1.0 A4에 맞추면 인쇄 꼬리 감소 */
const HEAVY_SOFT = 700;
/** 인쇄 한 장 병합 상한(오버플로·빈 꼬리 방지) */
const PRINT_FIT = 740;

function sectionHeadCount(html) {
  return (String(html || "").match(/class="section-head"/g) || []).length;
}

/** 인접 얇은 본문을 합침. 소제목(h2)은 유지한 채 같은 장에 이어 붙인다. */
export function mergeSparseBodies(bodies, softLimit = MERGE_SOFT) {
  const out = [];
  for (const body of bodies || []) {
    if (!body || !String(body).trim()) continue;
    if (!out.length) {
      out.push(body);
      continue;
    }
    const prev = out[out.length - 1];
    const pw = estimateBodyWeight(prev);
    const bw = estimateBodyWeight(body);
    const combined = pw + bw;
    // 둘 중 하나가 얇거나, 합쳐도 한 장 한도면 소제목을 유지한 채 병합
    if (combined <= softLimit && (pw < softLimit * 0.78 || bw < softLimit * 0.72 || combined <= softLimit * 0.92)) {
      out[out.length - 1] = `${prev}\n<hr class="rule" />\n${body}`;
    } else {
      out.push(body);
    }
  }
  return out;
}

function extractSectionHead(html) {
  const m = String(html || "").match(/<div class="section-head">[\s\S]*?<\/div>/);
  return m ? m[0] : "";
}

/** 병합 시 앞에 붙는 중복 절 제목(keep-block/section-head) 제거 */
function stripLeadingSectionHead(html) {
  return String(html || "")
    .replace(/^\s*<div class="keep-block">\s*<div class="section-head">[\s\S]*?<\/div>\s*<\/div>\s*/i, "")
    .replace(/^\s*<div class="section-head">[\s\S]*?<\/div>\s*/i, "")
    .replace(/^\s*<hr class="rule"\s*\/?>\s*/i, "");
}

/** 한 카드가 과대면 문단 단위로 쪼갬 */
function splitOversizedCard(cardHtml, heavyLimit) {
  if (estimateBodyWeight(cardHtml) <= heavyLimit) return [cardHtml];
  const paras = String(cardHtml).split(/(?=<p[\s>])/).filter(Boolean);
  if (paras.length < 3) return [cardHtml];
  const headBits = [];
  const bodyBits = [];
  for (const bit of paras) {
    if (/class="card|card-keep|<h3/.test(bit) && !bodyBits.length) headBits.push(bit);
    else bodyBits.push(bit);
  }
  if (bodyBits.length < 2) return [cardHtml];
  const prefix = headBits.join("");
  const chunks = [];
  let bucket = "";
  for (const bit of bodyBits) {
    const trial = bucket + bit;
    if (bucket && estimateBodyWeight(prefix + trial) > heavyLimit) {
      chunks.push(prefix + bucket);
      bucket = bit;
    } else {
      bucket = trial;
    }
  }
  if (bucket) chunks.push(prefix + bucket);
  return chunks.length ? chunks : [cardHtml];
}

/** 과밀 본문을 카드·표·비주얼·문단 단위로 분할 */
export function splitHeavyBodies(bodies, heavyLimit = 1350) {
  const out = [];
  for (const body of bodies || []) {
    if (!body || estimateBodyWeight(body) <= heavyLimit) {
      if (body) out.push(body);
      continue;
    }
    let parts = String(body).split(
      /(?=<div class="card[\s"]|<div class="table-block|<div class="visual-slot|<div class="evidence|<div class="job-block)/,
    );
    // 카드가 1개뿐인데 과대면 문단 분할
    if (parts.length < 2) {
      out.push(...splitOversizedCard(body, heavyLimit));
      continue;
    }
    // 개별 과대 카드 선분해
    parts = parts.flatMap((part, idx) => {
      if (idx === 0) return [part];
      if (estimateBodyWeight(part) > heavyLimit * 0.9) return splitOversizedCard(part, heavyLimit * 0.9);
      return [part];
    });
    const sectionHead = extractSectionHead(parts[0]);
    let head = parts[0];
    let bucket = "";
    for (let i = 1; i < parts.length; i += 1) {
      const next = parts[i];
      const trial = bucket ? `${bucket}${next}` : `${head}${next}`;
      if (estimateBodyWeight(trial) > heavyLimit && bucket) {
        out.push(bucket.includes(head) || !head ? bucket : `${head}${bucket}`);
        // 이어지는 장은 본문만 — 같은 h2 복제 금지(병합 시 중복 제목 방지)
        head = "";
        bucket = next;
      } else {
        bucket = trial;
      }
    }
    if (bucket) out.push(bucket);
  }
  // 얇은 꼬리 조각은 직전 장에 되돌림(반쪽 빈 장·제목 고립 예방)
  const compacted = [];
  for (const part of out) {
    const pw = compacted.length ? estimateBodyWeight(compacted[compacted.length - 1]) : 0;
    const w = estimateBodyWeight(part);
    const noHead = !/<div class="section-head">/.test(part);
    const thinTail = w < 520 || (noHead && w < 680);
    if (compacted.length && thinTail && pw + w <= heavyLimit * 1.12) {
      compacted[compacted.length - 1] = `${compacted[compacted.length - 1]}\n${part}`;
    } else {
      compacted.push(part);
    }
  }
  // 제목만 남거나 keep-block/section-head만 있는 조각은 다음 장 앞으로 합쳐 고립 제목 방지
  for (let i = 0; i < compacted.length - 1; ) {
    const cur = compacted[i];
    const textLen = String(cur)
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "").length;
    const hasHead = /section-head/.test(cur);
    const hasBodyCard =
      /<div class="card[\s"]/.test(cur) ||
      /class="evidence"/.test(cur) ||
      /class="table-block"/.test(cur) ||
      /class="visual-slot"/.test(cur);
    const onlyHead =
      hasHead &&
      (!hasBodyCard || estimateBodyWeight(cur) < 280 || textLen < 80);
    if (onlyHead) {
      // 다음 조각에 제목이 또 있으면 중복 h2를 제거하고 본문만 붙임
      const next = /section-head/.test(compacted[i + 1])
        ? stripLeadingSectionHead(compacted[i + 1])
        : compacted[i + 1];
      compacted[i] = `${cur}${next}`;
      compacted.splice(i + 1, 1);
      continue;
    }
    // 앞장 끝에 제목만 남기고 본문이 다음 조각인 경우 — 제목을 본문 쪽으로 이동
    const next = compacted[i + 1];
    const curTailHead =
      hasHead &&
      hasBodyCard &&
      estimateBodyWeight(cur) > heavyLimit * 0.85 &&
      next &&
      !/section-head/.test(next) &&
      estimateBodyWeight(next) > 200;
    if (curTailHead) {
      // keep-block이 과대면 제목+첫 블록만 남기고 나머지를 다음으로 — 이미 split된 상태면 패스
      i += 1;
      continue;
    }
    i += 1;
  }
  return compacted;
}

function appendFillers(html, fillers) {
  const extra = (fillers || []).filter(Boolean).join("\n");
  if (!extra) return html;
  return `${html}\n${extra}`;
}

/**
 * 얇은 본문에 주제 맞는 도표·삽화를 채워 하단 공백을 줄인다.
 * 데이터가 없으면 도표를 만들지 않고 삽화만(1회) 사용.
 */
export function fillSparseBody(html, bank, { minWeight = SPARSE_SOFT, target = TARGET_FILL } = {}) {
  if (!html || !bank) return html;
  bank.markUsedFromHtml(html);
  let out = html;
  let w = estimateBodyWeight(out);
  if (w >= minWeight) return out;

  const hint = topicHint(out);
  const forYear = extractContextYear(out);
  // 도표 우선 — 인쇄 한도를 넘기지 않음(페이지 팽창 방지)
  // 세운 연도가 있으면 그 해 월 실데이터만 사용
  while (estimateBodyWeight(out) < target) {
    const before = estimateBodyWeight(out);
    const chart = bank.takeData(hint, { forYear });
    if (!chart) break;
    const next = appendFillers(out, [chart]);
    if (estimateBodyWeight(next) > PRINT_FIT - 30) break;
    out = next;
    if (estimateBodyWeight(out) <= before) break;
  }
  // 여전히 얇으면 미사용 삽화 1개
  if (estimateBodyWeight(out) < Math.min(minWeight + 80, 640)) {
    const orn = bank.takeOrnament();
    if (orn) {
      const next = appendFillers(out, [orn]);
      if (estimateBodyWeight(next) <= PRINT_FIT) out = next;
    }
  }
  return out;
}

/** 본문 목록: 과밀 분할 → 얇은 병합 → 공백 채움 */
export function balanceBodyList(bodies, bank, opts = {}) {
  const split = splitHeavyBodies(bodies, opts.heavyLimit || HEAVY_SOFT);
  const merged = mergeSparseBodies(split, opts.mergeSoft || MERGE_SOFT);
  return merged.map((body) => {
    bank.markUsedFromHtml(body);
    return fillSparseBody(body, bank, opts);
  });
}

function rebuildPage(shellHtml, body) {
  const cls = (shellHtml.match(/class="page([^"]*)"/) || [, ""])[1];
  const header = (shellHtml.match(/<div class="report-header">[\s\S]*?<\/div>/) || [""])[0];
  const footer = (shellHtml.match(/<div class="footer">[\s\S]*?<\/div>/) || [""])[0];
  return `<div class="page${cls}">${header}<div class="dense">${body}</div>${footer}</div>`;
}

function extractDense(html) {
  const m = String(html || "").match(/<div class="dense">([\s\S]*)<\/div>\s*<div class="footer">/);
  return m ? m[1] : null;
}

/**
 * 이미 page()로 감싼 HTML 목록을 균형 조정.
 * cover 유지 → 인접 얇은 장 병합 → 희소 페이지부터 도표/삽화 채움.
 */
export function balanceWrappedPages(pageHtmlList, bank) {
  const pages = [...(pageHtmlList || [])];
  for (const html of pages) bank.markUsedFromHtml(html);

  // 0) 과밀 본문을 카드 단위로 먼저 쪼개 A4 한 장에 맞게 (keep-apart는 유지)
  const preSplit = [];
  for (const cur of pages) {
    if (/cover-page/.test(cur)) {
      preSplit.push(cur);
      continue;
    }
    const body = extractDense(cur);
    if (body == null) {
      preSplit.push(cur);
      continue;
    }
    if (/keep-apart/.test(cur) || estimateBodyWeight(body) <= HEAVY_SOFT) {
      preSplit.push(cur);
      continue;
    }
    const parts = splitHeavyBodies([body], HEAVY_SOFT);
    parts.forEach((part, pi) => {
      preSplit.push(rebuildPage(cur, part));
      if (pi > 0) {
        const last = preSplit[preSplit.length - 1];
        preSplit[preSplit.length - 1] = last.replace(/\bchapter\b/g, "").replace(/class="page\s+"/g, 'class="page "');
      }
    });
  }

  // 1) 인접 sparse 병합
  const merged = [];
  for (let i = 0; i < preSplit.length; i += 1) {
    let cur = preSplit[i];
    if (/cover-page/.test(cur)) {
      merged.push(cur);
      continue;
    }
    let body = extractDense(cur);
    if (body == null) {
      merged.push(cur);
      continue;
    }
    let weight = estimateBodyWeight(body);
    const curIsTocOrIntro = /目次|목차|리포트 시작/.test(body);
    const curKeepApart = /keep-apart/.test(cur);
    // 일반 flow: 소제목 장을 앞 본문에 이어 붙여 하단 60~80% 공백을 줄임
    while (!curIsTocOrIntro && !curKeepApart && weight < SPARSE_SOFT && i + 1 < preSplit.length) {
      const next = preSplit[i + 1];
      if (/cover-page/.test(next)) break;
      // 다음이 새 장(부/세운/월운)이면 합치지 않음
      if (/\bchapter\b/.test(next) || /keep-apart/.test(next)) break;
      const nextBody = extractDense(next);
      if (nextBody == null) break;
      if (/目次|목차|리포트 시작/.test(nextBody)) break;
      const nextW = estimateBodyWeight(nextBody);
      const combined = weight + nextW;
      if (combined > PRINT_FIT) break;
      // 소제목(section-head)은 유지한 채 같은 페이지에 연결
      body = `${body}\n<hr class="rule" />\n${nextBody}`;
      weight = estimateBodyWeight(body);
      i += 1;
    }
    merged.push(rebuildPage(cur, body));
  }

  // 1b) 뒤에서 앞으로: 얇은 flow·무제목 말미 흡수 (chapter/keep-apart는 유지)
  for (let i = merged.length - 1; i >= 1; i -= 1) {
    const cur = merged[i];
    const prev = merged[i - 1];
    if (/cover-page/.test(cur) || /cover-page/.test(prev)) continue;
    if (/\bchapter\b/.test(cur) || /keep-apart/.test(cur) || /keep-apart/.test(prev)) continue;
    const body = extractDense(cur);
    const prevBody = extractDense(prev);
    if (body == null || prevBody == null) continue;
    const w = estimateBodyWeight(body);
    const pw = estimateBodyWeight(prevBody);
    const subHeadFlow =
      /타고난 성향|개인별 해석|흐름·주의|생활 속 실천|실천·리듬|진로|전공|핵심 보완/.test(body) &&
      w < 720;
    const noHead = !/<div class="section-head">/.test(body);
    const onlyHead = w < 260 && /section-head/.test(body) && !/<div class="card[\s"]/.test(body);
    if (onlyHead) {
      if (i + 1 < merged.length) {
        const next = merged[i + 1];
        const nextBody = extractDense(next);
        if (nextBody != null && !/cover-page/.test(next) && !/\bchapter\b/.test(next) && !/keep-apart/.test(next)) {
          merged[i] = rebuildPage(cur, `${body}\n${nextBody}`);
          merged.splice(i + 1, 1);
          continue;
        }
      }
      if (pw + w <= PRINT_FIT) {
        merged[i - 1] = rebuildPage(prev, `${prevBody}\n${body}`);
        merged.splice(i, 1);
      }
      continue;
    }
    // 소제목·짧은 잔여는 제거하지 않고 이어 붙임 (아주 짧은 꼬리는 한도 소폭 초과 허용)
    const fit = w < 320 || noHead ? PRINT_FIT * 1.1 : PRINT_FIT;
    if ((w < 640 || subHeadFlow || noHead) && pw + w <= fit) {
      merged[i - 1] = rebuildPage(prev, `${prevBody}\n<hr class="rule" />\n${body}`);
      merged.splice(i, 1);
    }
  }

  // 2) 희소한 페이지부터 채움(앞장에 도표가 몰리지 않게)
  const indexed = merged.map((html, idx) => {
    const body = extractDense(html);
    return {
      idx,
      html,
      body,
      weight: body != null ? estimateBodyWeight(body) : 9999,
      cover: /cover-page/.test(html),
    };
  });
  const fillOrder = indexed
    .filter((row) => !row.cover && row.body != null)
    .sort((a, b) => a.weight - b.weight);

  for (const row of fillOrder) {
    if (row.weight >= SPARSE_SOFT) continue;
    const body = row.body || "";
    // 목차·월운 팩(본문 카드 자체)은 도표로 부풀리지 않음
    const isToc = /目次|toc-page/.test(body) || /toc-page/.test(row.html);
    const isMonthPack = /month-pack/.test(body);
    if (isToc) continue;
    // 세운·월운 keep-apart·일반 flow 모두: 실데이터 도표 우선, 없으면 소형 장식
    if (isMonthPack) {
      let filled = body;
      const forYear = extractContextYear(filled);
      if (row.weight < 640 && !/data-visual=/.test(filled)) {
        const chart = bank.takeData("flow", { allowReuse: true, forYear });
        if (chart) filled = `${filled}\n${chart}`;
      }
      if (estimateBodyWeight(filled) < 560 && !/data-ornament=/.test(filled)) {
        const orn = bank.takeOrnament({ allowReuse: true });
        if (orn) filled = `${filled}\n${orn}`;
      }
      if (filled !== body) {
        indexed[row.idx].html = rebuildPage(row.html, filled);
        indexed[row.idx].body = filled;
        indexed[row.idx].weight = estimateBodyWeight(filled);
      }
      continue;
    }
    const filled = fillSparseBody(body, bank, { minWeight: SPARSE_SOFT, target: TARGET_FILL });
    indexed[row.idx].html = rebuildPage(row.html, filled);
    indexed[row.idx].body = filled;
    indexed[row.idx].weight = estimateBodyWeight(filled);
  }

  // 3) 채움 후 과밀 분할 (keep-apart 제외)
  const finalPages = [];
  for (const row of indexed) {
    if (row.cover || row.body == null || row.weight <= HEAVY_SOFT || /keep-apart/.test(row.html)) {
      finalPages.push(row.html);
      continue;
    }
    const parts = splitHeavyBodies([row.body], HEAVY_SOFT);
    parts.forEach((part) => finalPages.push(rebuildPage(row.html, part)));
  }

  // 4) 무제목·얇은 꼬리를 직전 장에 되돌림
  for (let i = finalPages.length - 1; i >= 1; i -= 1) {
    const cur = finalPages[i];
    const prev = finalPages[i - 1];
    if (/cover-page/.test(cur) || /cover-page/.test(prev)) continue;
    if (/\bchapter\b/.test(cur)) continue;
    const body = extractDense(cur);
    const prevBody = extractDense(prev);
    if (body == null || prevBody == null) continue;
    const w = estimateBodyWeight(body);
    const pw = estimateBodyWeight(prevBody);
    const textLen = String(body)
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "").length;
    const noHead = !/<div class="section-head">/.test(body);
    if ((/keep-apart/.test(cur) || /keep-apart/.test(prev)) && !noHead) continue;
    const micro = textLen < 260 || w < 420;
    const tooThin = noHead || w < 720 || textLen < 300 || micro;
    const fit = micro ? PRINT_FIT * 1.18 : PRINT_FIT;
    if (tooThin && pw + w <= fit) {
      // 소제목 유지
      finalPages[i - 1] = rebuildPage(prev, `${prevBody}\n<hr class="rule" />\n${body}`);
      finalPages.splice(i, 1);
    }
  }

  // 5) 제목만 남은 장 + 다음 본문 → 고립 제목 제거
  for (let i = 0; i < finalPages.length - 1; ) {
    const cur = finalPages[i];
    const next = finalPages[i + 1];
    if (/cover-page/.test(cur) || /cover-page/.test(next) || /\bchapter\b/.test(next)) {
      i += 1;
      continue;
    }
    const body = extractDense(cur);
    const nextBody = extractDense(next);
    if (body == null || nextBody == null) {
      i += 1;
      continue;
    }
    const w = estimateBodyWeight(body);
    const textLen = String(body)
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, "").length;
    const onlyHead =
      /section-head/.test(body) &&
      w < 280 &&
      textLen < 80 &&
      !/<div class="card[\s"]/.test(body) &&
      !/class="evidence"/.test(body);
    if (!onlyHead) {
      i += 1;
      continue;
    }
    const combined = `${body}\n${stripLeadingSectionHead(nextBody)}`;
    if (estimateBodyWeight(combined) <= PRINT_FIT) {
      finalPages[i] = rebuildPage(cur, combined);
      finalPages.splice(i + 1, 1);
      continue;
    }
    i += 1;
  }

  // 6) 남은 희소 장(부 시작·월운 표·짧은 잔여): 실데이터 도표 우선 → 소형 전통 장식
  for (let i = 0; i < finalPages.length; i += 1) {
    const cur = finalPages[i];
    if (/cover-page|toc-page|目次/.test(cur)) continue;
    const body = extractDense(cur);
    if (body == null) continue;
    const w = estimateBodyWeight(body);
    const chapterish = /\bchapter\b|keep-apart|month-flow|用語/.test(cur) || /month-flow|제\d+부/.test(body);
    // 이미 도표+장식이면 스킵. 희소·장 시작만 보완
    if (/data-visual=/.test(body) && /data-ornament=/.test(body)) continue;
    if (!chapterish && w >= 620) continue;
    if (chapterish && w >= 780) continue;
    let next = body;
    const hint = topicHint(next);
    if (!/data-visual=/.test(next) && (w < 680 || (chapterish && w < 780))) {
      const forYear = extractContextYear(next);
      const chart = bank.takeData(hint, { allowReuse: w < 560 || chapterish, forYear });
      if (chart) {
        const trial = `${next}\n${chart}`;
        if (estimateBodyWeight(trial) <= PRINT_FIT + (chapterish ? 80 : 40)) next = trial;
      }
    }
    if (!/data-ornament=/.test(next) && estimateBodyWeight(next) < 600) {
      const orn = bank.takeOrnament({ allowReuse: estimateBodyWeight(next) < 420 });
      if (orn) {
        const trial = `${next}\n${orn}`;
        if (estimateBodyWeight(trial) <= PRINT_FIT + 60) next = trial;
      }
    }
    if (next !== body) finalPages[i] = rebuildPage(cur, next);
  }

  return finalPages;
}
