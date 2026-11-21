import { Solar } from "lunar-javascript";
import { STEM_ELEMENT, branchRelation, clamp, koGz, levelFromScore, tenGod } from "./ganzhi.js";
import { easeSentence } from "./plainTerms.js";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function joinLines(parts) {
  return parts.filter(Boolean).join(" ");
}

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

const DAY_TIP = {
  정재: "받을 돈과 정산을 한 줄 적어두세요.",
  편재: "소개와 외근은 좋지만, 당일 큰 송금은 피하세요.",
  식신: "결과물을 보여 주면 반응이 옵니다.",
  상관: "말은 한 톤 낮추고, 초안을 먼저 보여 주세요.",
  정관: "공식 절차와 기한을 지키면 힘이 됩니다.",
  편관: "급한 일이 와도 역할 범위부터 확인하세요.",
  정인: "공부·서류 정리가 내일의 기회가 됩니다.",
  편인: "혼자 있는 시간이 답을 줍니다. 단톡은 줄이세요.",
  비견: "내 몫을 지키되, 역할은 나누세요.",
  겁재: "보증·충동 구매·비교는 오늘의 금기입니다.",
};

function scoreDay(chart, gan, zhi) {
  const tg = tenGod(chart.dayStem, gan);
  const element = STEM_ELEMENT[gan];
  const weights = { 정재: 10, 편재: 8, 식신: 8, 정관: 6, 정인: 4, 상관: 2, 편관: -4, 편인: 0, 비견: -2, 겁재: -10 };
  let score = 62 + (weights[tg] || 0);
  if (chart.strength.favorable.includes(element)) score += 8;
  if (chart.strength.unfavorable.includes(element)) score -= 6;
  const relDay = branchRelation(chart.dayBranch, zhi);
  if (relDay === "충") score -= 8;
  if (relDay === "합") score += 6;
  if (relDay === "원진") score -= 4;
  score = clamp(score, 18, 96);
  return { score, level: levelFromScore(score), tg, relDay };
}

function buildHundredDays(chart, profile, startDate = new Date(), days = 100) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const lunar = solar.getLunar();
    const eight = lunar.getEightChar();
    const gan = eight.getDayGan();
    const zhi = eight.getDayZhi();
    const meta = scoreDay(chart, gan, zhi);
    const tone =
      meta.score >= 78
        ? "문을 열어도 되는 날입니다. 미뤄 둔 한 가지를 끝내세요."
        : meta.score >= 64
          ? "차근히 쌓는 날입니다. 욕심을 하나 줄이면 더 가볍습니다."
          : meta.score >= 50
            ? "지키는 날입니다. 새 판보다 이미 맡은 일을 정리하세요."
            : "서두르면 새는 날입니다. 큰 결정과 큰돈은 내일로 넘기세요.";
    const rel =
      meta.relDay === "충"
        ? "일정과 말이 부딪히기 쉬우니 서명을 하루 미루세요."
        : meta.relDay === "합"
          ? "사람과 약속이 잘 붙습니다. 안부를 먼저 건네세요."
          : meta.relDay === "원진"
            ? "중요한 말은 짧게, 만나서 하세요."
            : "크게 부딪히는 기운은 약합니다. 호흡만 맞추면 됩니다.";
    return {
      dayNo: index + 1,
      solarText: `${solar.getYear()}년 ${solar.getMonth()}월 ${solar.getDay()}일`,
      weekday: WEEK[date.getDay()],
      lunarText: `음력 ${lunar.getYear()}년 ${lunar.getMonth() < 0 ? "윤" : ""}${Math.abs(lunar.getMonth())}월 ${lunar.getDay()}일`,
      gzKo: koGz(`${gan}${zhi}`),
      level: meta.level,
      score: meta.score,
      headline: tone,
      tip: DAY_TIP[meta.tg] || "오늘 할 일 하나만 고르세요.",
      relation: rel,
      roleNote:
        profile?.role === "owner"
          ? "사업은 입금 확인을 먼저 하세요."
          : profile?.role === "seeker"
            ? "지원·공부 일정 하나를 확정하세요."
            : "업무는 문서 한 장으로 남기세요.",
    };
  });
}

/** 서버/클라 공통: reading → PDF 템플릿용 평문 데이터 */
export function buildSajuPdfData(reading, options = {}) {
  const year = options.year || reading.yearFortune?.defaultYear || new Date().getFullYear();
  const chart = reading.chart;
  const character = reading.dashboard?.character;
  const personality = character?.personality;
  const children = character?.children;
  const ancestors = character?.ancestors;
  const yearPack = reading.yearFortune?.byYear?.[year];
  const wealth = reading.forecast?.find((item) => item.id === "wealth");
  const love = reading.forecast?.find((item) => item.id === "love");
  const career = reading.forecast?.find((item) => item.id === "career");
  const health = reading.forecast?.find((item) => item.id === "health");
  const move = reading.forecast?.find((item) => item.id === "move");
  const study = reading.forecast?.find((item) => item.id === "study");
  const dayCount = options.dayCount ?? 100;

  return {
    name: reading.displayName,
    displayName: reading.displayName,
    hanja: reading.hanja || "",
    genderLabel: chart.genderLabel,
    statusLabel: reading.profile?.statusLabel || "",
    roleLabel: reading.profile?.roleLabel || "",
    solarText: chart.solarText,
    lunarText: chart.lunarText,
    clock: chart.clock,
    pillars: easeSentence(chart.pillars.map((pillar) => `${pillar.label} ${pillar.gzKo}`).join(" · ")),
    dayMaster: easeSentence(`${chart.dayMasterKo}${chart.dayElement}`),
    dayMasterDesc: joinLines([
      chart.strength.label,
      personality?.elementName ? `${personality.elementName} 기운` : "",
      personality?.style || "",
    ]),
    strengthLabel: chart.strength.label,
    favorable: easeSentence((chart.strength.favorable || []).join("·")),
    unfavorable: easeSentence((chart.strength.unfavorable || []).join("·")),
    countText: easeSentence(`목 ${chart.count.목}, 화 ${chart.count.화}, 토 ${chart.count.토}, 금 ${chart.count.금}, 수 ${chart.count.수}`),
    personalitySummary: joinLines([personality?.summary, personality?.deep, personality?.balance]),
    personalityCore: personality?.summary || "",
    personalityDeep: personality?.deep || "",
    personalityBalance: personality?.balance || "",
    personalityTip: personality?.tip || "",
    strengths: personality?.strengths || [],
    weaknesses: personality?.weaknesses || [],
    socialBehavior: easeSentence(joinLines([
      personality?.outward,
      `사회생활의 결은 ${chart.monthGod}입니다.`,
      personality?.tip,
      `잘 빛나는 점: ${(personality?.strengths || []).join(", ")}.`,
      `조심하면 좋은 점: ${(personality?.weaknesses || []).join(", ")}.`,
    ])),
    ancestorFortune: joinLines([ancestors?.summary, ancestors?.detail, ancestors?.influence, ancestors?.tip]),
    childrenFortune: joinLines([children?.summary, children?.detail, children?.timing, children?.tip]),
    yearTitle: yearPack?.title || `${year}년 한 해 총정리`,
    yearSummary: yearPack?.summary || "",
    yearBasis: yearPack?.basisNote || "",
    months: (yearPack?.months || []).map((month) => ({
      heading: month.heading,
      level: month.level,
      score: month.score,
      summary: month.summary,
      wealth: month.wealth,
      career: month.career,
      relation: month.relation,
      watch: (month.watchDates || []).join(" / "),
      remedy: month.remedy,
    })),
    wealthSummary: easeSentence(wealth?.summary || "", { wealth: true }),
    loveSummary: love?.summary || "",
    careerSummary: career?.summary || "",
    healthSummary: health?.summary || "",
    moveSummary: move?.summary || "",
    studySummary: study?.summary || "",
    wealthYears: (wealth?.years || []).slice(0, 10).map((item) => easeSentence(`${item.year}년 ${item.gzKo} ${item.level} — ${item.text}`, { wealth: true })),
    loveYears: (love?.years || []).slice(0, 10).map((item) => `${item.year}년 ${item.gzKo} ${item.level} — ${item.text}`),
    engines: (reading.engines || []).map((engine) => ({
      name: engine.name,
      summary: engine.summary,
      points: engine.points || [],
    })),
    reportPages: (reading.report?.pages || []).map((page) => ({
      title: page.title,
      paragraphs: page.paragraphs || [],
    })),
    guide: reading.guide
      ? {
          summary: reading.guide.summary,
          foods: reading.guide.table?.foods?.join(", ") || "",
          habit: reading.guide.table?.habit || "",
          risks: (reading.guide.risks || []).map((risk) => `${risk.title}: ${risk.warning} / 막는 법: ${risk.remedy}`),
        }
      : null,
    hundredDays: buildHundredDays(chart, reading.profile, options.startDate ? new Date(options.startDate) : new Date(), dayCount),
    bridge: reading.bridge || "",
    year,
  };
}

function p(text) {
  return `<p>${esc(text)}</p>`;
}

function card(title, bodyHtml) {
  return `
                <div class="card">
                    <h3>${esc(title)}</h3>
                    ${bodyHtml}
                </div>`;
}

function footer(pageNo) {
  return `<div class="footer">천기노트 — 참고용 안내 자료 &nbsp;|&nbsp; - ${pageNo} 페이지 -</div>`;
}

function coverPage(inner) {
  return `
            <div class="page">
                <div class="chapter-cover">
                    ${inner}
                </div>
            </div>`;
}

function contentPage(inner, pageNo) {
  return `
            <div class="page content-page">
                ${inner}
                ${footer(pageNo)}
            </div>`;
}

const LOTUS_STYLES = `
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600&display=swap');
                @page { size: A4; margin: 0; }
                * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                body { font-family: 'Noto Serif KR', 'Malgun Gothic', serif; margin: 0; padding: 0; color: #2c2c2c; background-color: #fcfbfa; }
                .page {
                    page-break-after: always;
                    width: 210mm;
                    min-height: 297mm;
                    height: 297mm;
                    padding: 60px 50px;
                    box-sizing: border-box;
                    position: relative;
                    background: #fcfbfa;
                    overflow: hidden;
                }
                .page:last-of-type { page-break-after: auto; }
                .chapter-cover {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    min-height: 900px;
                    background: linear-gradient(135deg, #f7f4ed 0%, #ede6d6 100%);
                    border: 8px double #d4af37;
                    box-sizing: border-box;
                    padding: 40px;
                }
                .chapter-cover.soft {
                    background: #ffffff;
                    border: 1px solid #d4af37;
                }
                .chapter-cover h1 { font-size: 30px; color: #1a2e22; margin: 0 0 15px; font-weight: 600; line-height: 1.4; }
                .chapter-cover h2 { font-size: 24px; color: #1a2e22; margin: 0 0 15px; border: none; padding: 0; }
                .chapter-cover p { font-size: 15px; color: #5a6b60; letter-spacing: 1.5px; margin: 8px 0; line-height: 1.7; }
                .lotus-icon {
                    width: 64px; height: 64px; margin-bottom: 20px;
                    border: 1.5px solid #d4af37; border-radius: 999px;
                    display: flex; align-items: center; justify-content: center;
                    color: #1a2e22; font-size: 28px; font-weight: 600; letter-spacing: 0;
                    background: rgba(255,255,255,0.55);
                }
                .content-page h2 {
                    color: #1a2e22; border-bottom: 1.5px solid #d4af37;
                    padding-bottom: 8px; font-size: 20px; margin: 0 0 18px; font-weight: 600;
                }
                .content-page h3 {
                    color: #1a2e22; font-size: 16px; margin: 0 0 10px; font-weight: 600;
                    border: none; padding: 0;
                }
                .card {
                    background: #ffffff; border: 1px solid #e2dac9; padding: 22px 24px;
                    border-radius: 6px; margin-bottom: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }
                .card p, .content-page > p { font-size: 14.5px; line-height: 1.85; color: #444; margin: 0 0 10px; overflow-wrap: anywhere; word-break: keep-all; }
                .card p:last-child { margin-bottom: 0; }
                .footer {
                    position: absolute; bottom: 30px; left: 50px; right: 50px;
                    text-align: center; font-size: 12px; color: #8c857b;
                    border-top: 1px solid #e2dac9; padding-top: 10px;
                }
                .quiet { color: #7a8b80; font-size: 13px; letter-spacing: 1px; }
                .day-grid { display: grid; gap: 14px; }
                .print-hint {
                    position: sticky; top: 0; z-index: 20; background: #1a2e22; color: #f7f4ed;
                    padding: 12px 14px; font-size: 13px; line-height: 1.55;
                }
                .print-hint button {
                    display: inline-block; margin-top: 8px; border: 1px solid #d4af37; background: #d4af37;
                    color: #1a2e22; border-radius: 999px; padding: 8px 14px; min-height: 40px; cursor: pointer;
                }
                @media screen and (max-width: 720px) {
                    body { background: #e8e2d6; }
                    .page {
                        width: 100%; height: auto; min-height: auto; padding: 24px 16px 48px;
                        overflow: visible; margin-bottom: 10px; border-bottom: 8px solid #d9d0c0;
                    }
                    .chapter-cover { min-height: auto; height: auto; padding: 28px 16px; border-width: 4px; }
                    .chapter-cover h1 { font-size: 22px; }
                    .chapter-cover h2 { font-size: 18px; }
                    .content-page h2 { font-size: 18px; }
                    .card { padding: 16px; }
                    .footer { position: static; margin-top: 24px; left: auto; right: auto; }
                }
                @media print {
                    .print-hint { display: none !important; }
                    .page { width: auto !important; height: auto !important; min-height: auto !important; overflow: visible !important; box-shadow: none !important; }
                    .chapter-cover { min-height: auto; height: auto; }
                    .footer { position: static; margin-top: 20px; }
                }
`;

/**
 * 연꽃·명상 테마 100일 심층 리포트 HTML
 */
export function generateLotusReportHtml(sajuData) {
  const d = sajuData;
  const pages = [];
  let pageNo = 0;

  const pushCover = (html) => {
    pages.push(html);
    pageNo += 1;
  };
  const pushContent = (inner) => {
    pageNo += 1;
    pages.push(contentPage(inner, pageNo));
  };

  // 표지
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <p class="quiet" style="letter-spacing:0.2em;">천기노트</p>
                    <h1>${esc(d.name || d.displayName)}님을 위한 맞춤 운세·명리 리포트</h1>
                    <p>작성일: ${esc(new Date().toISOString().slice(0, 10).replace(/-/g, "."))} · 선택 구성: 100일 심층 리포트(HTML/PDF)</p>
                    <p class="quiet" style="margin-top: 28px;">이 노트는 타고난 기질과 시기별 흐름을 이해하고, 일상과 결정에서 스스로 점검할 기준을 세우기 위해 작성되었습니다.</p>
                    <p class="quiet">풀이 내용은 참고용이며, 중요한 건강·재무·법률 결정은 각 분야의 전문가 판단과 함께 고려하시기 바랍니다.</p>
                    <p class="quiet">${esc(d.solarText)} ${esc(d.clock)} · ${esc(d.lunarText)}</p>
                `),
  );

  // 제1장 간지
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제1장. 타고난 본원 성향과 기질</h2>
                    <p>고요한 연못 위에 피어난 연꽃처럼, 당신의 본질을 깊이 있게 조명합니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  pushContent(`
                <h2>1. 본원 성격 및 오행 분석</h2>
                ${card(
                  "일간 기운",
                  [
                    p(`일간 기운: ${d.dayMaster} — ${d.dayMasterDesc}`),
                    p(`힘의 방향: ${d.strengthLabel} · 도움이 되는 기운 ${d.favorable} · 과하면 부담인 기운 ${d.unfavorable}`),
                    p(`오행 개수: ${d.countText}`),
                    p(d.personalityCore),
                  ].join(""),
                )}
                ${card("심층 기질", p(d.personalityDeep))}
                ${card("오행으로 보는 균형", p(d.personalityBalance))}
            `);

  pushContent(`
                <h2>2. 대인관계 및 사회적 성격</h2>
                ${card("밖으로 보이는 결", p(d.socialBehavior))}
                ${card(
                  "잘 빛나는 점",
                  `<p>${esc((d.strengths || []).map((item) => `· ${item}`).join(" "))}</p>`,
                )}
                ${card(
                  "조심하면 좋은 점",
                  `<p>${esc((d.weaknesses || []).map((item) => `· ${item}`).join(" "))}</p>`,
                )}
                ${card("나를 돕는 한 줄", p(d.personalityTip))}
            `);

  // 제2장
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제2장. 가문의 기운과 자녀 인연</h2>
                    <p>뿌리의 물과 새싹의 빛 — 조상운과 자녀운을 나란히 읽습니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  pushContent(`
                <h2>조상운 · 자녀운</h2>
                ${card("조상운 (뿌리와 가문의 음덕)", p(d.ancestorFortune))}
                ${card("자녀운 (자식과의 인연 및 성향)", p(d.childrenFortune))}
            `);

  // 제3장 월별
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제3장. ${esc(String(d.year))}년 월별 운세</h2>
                    <p>양력의 달력과 절기 간지 월을 함께 비춥니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  pushContent(`
                <h2>${esc(d.yearTitle)}</h2>
                ${card("한 해의 결", p(d.yearSummary))}
                ${card("읽는 기준", p(d.yearBasis))}
            `);

  (d.months || []).forEach((month) => {
    pushContent(`
                <h2>${esc(month.heading)}</h2>
                ${card("이달의 핵심", p(`${month.level} ${month.score}점 · ${month.summary}`))}
                ${card(
                  "재물 · 직장 · 대인",
                  [p(`재물: ${month.wealth}`), p(`직장: ${month.career}`), p(`대인: ${month.relation}`)].join(""),
                )}
                ${card("주의와 개운", [p(`주의: ${month.watch}`), p(`개운: ${month.remedy}`)].join(""))}
            `);
  });

  // 제4장
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제4장. 재물 · 애정 · 일과 몸</h2>
                    <p>생활의 네 갈래를 부드러운 문장으로 이어 읽습니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  pushContent(`
                <h2>재물운과 애정운</h2>
                ${card("재물운", [p(d.wealthSummary), ...d.wealthYears.slice(0, 5).map((line) => p(line))].join(""))}
                ${card("애정운", [p(d.loveSummary), ...d.loveYears.slice(0, 5).map((line) => p(line))].join(""))}
            `);

  pushContent(`
                <h2>일 · 학업 · 건강 · 이사</h2>
                ${card("직업·적성", p(d.careerSummary))}
                ${card("학업·시험", p(d.studySummary))}
                ${card("건강", p(d.healthSummary))}
                ${card("이사·풍수", p(d.moveSummary))}
            `);

  // 제5장 9대 역학
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제5장. 아홉 갈래의 동양철학</h2>
                    <p>사주에서 자미·기문·주역까지, 한 사람을 둘러싼 거울들입니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  (d.engines || []).forEach((engine) => {
    pushContent(`
                <h2>${esc(engine.name)}</h2>
                ${card("요약", p(engine.summary))}
                ${card("포인트", engine.points.map((point) => p(point)).join("") || p("이 갈래의 세부는 생활 문장으로 이미 녹여 두었습니다."))}
            `);
  });

  if (d.guide) {
    pushContent(`
                <h2>개운 · 음식 · 액땜</h2>
                ${card("생활 운세", p(d.guide.summary))}
                ${card("식탁", [p(d.guide.foods), p(d.guide.habit)].join(""))}
                ${card("막는 법", d.guide.risks.map((line) => p(line)).join(""))}
            `);
  }

  // 심층 리포트 이어쓰기
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제6장. 심층 리포트 이어쓰기</h2>
                    <p>한 권의 이야기로 이어지는 명식의 속살입니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  (d.reportPages || []).forEach((page) => {
    pushContent(`
                <h2>${esc(page.title)}</h2>
                ${card(page.title, page.paragraphs.map((paragraph) => p(paragraph)).join(""))}
            `);
  });

  // 제7장 100일
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h2>제7장. 앞으로의 100일 일운</h2>
                    <p>오늘부터 백 번의 해가 뜨는 동안, 하루를 고요히 고르는 법입니다.</p>
                `).replace('class="chapter-cover"', 'class="chapter-cover soft"'),
  );

  const days = d.hundredDays || [];
  for (let i = 0; i < days.length; i += 2) {
    const pair = days.slice(i, i + 2);
    pushContent(`
                <h2>100일 일운 · ${pair[0].dayNo}${pair[1] ? `–${pair[1].dayNo}` : ""}일차</h2>
                <div class="day-grid">
                ${pair
                  .map(
                    (day) =>
                      card(
                        `${day.dayNo}일차 · ${day.solarText} (${day.weekday}) · ${day.gzKo}`,
                        [
                          p(`${day.lunarText} · ${day.level} ${day.score}점`),
                          p(day.headline),
                          p(`관계: ${day.relation}`),
                          p(`지침: ${day.tip}`),
                          p(day.roleNote),
                        ].join(""),
                      ),
                  )
                  .join("")}
                </div>
            `);
  }

  // 닫는 간지
  pushCover(
    coverPage(`
                    <div class="lotus-icon" aria-hidden="true">蓮</div>
                    <h1>연꽃이 진 자리에도 향기는 남습니다</h1>
                    <p>이 글은 참고용 해석입니다. 진료·투자·법률 판단을 대신하지 않습니다.</p>
                    <p class="quiet" style="margin-top: 28px;">천기노트 — 참고용 안내 자료 · 총 ${pageNo + 1}페이지</p>
                `),
  );

  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${esc(d.name || d.displayName)} · 천기노트 100일 심층 리포트</title>
    <style>${LOTUS_STYLES}</style>
</head>
<body>
<div class="print-hint no-print">천기노트 | ${esc(d.name || d.displayName)}님 맞춤 리포트
<button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button>
<p style="margin:8px 0 0;font-size:12px;color:#d8c7a0;">스마트폰에서는 인쇄 미리보기의 ‘PDF로 저장’ 또는 공유로 파일을 남기세요. HTML로 보관 후 PDF로 저장할 수 있습니다.</p>
</div>
${pages.join("\n")}
</body>
</html>`;
}

/** 하위 호환: 기존 이름도 연꽃 템플릿 사용 */
export function generateReportHtml(sajuData) {
  return generateLotusReportHtml(sajuData);
}

export function readingToReportHtml(reading, options) {
  return generateLotusReportHtml(buildSajuPdfData(reading, options));
}
