/**
 * 초년·중년·말년 ↔ 대운 구간 혼동 회귀 방지
 */
import assert from "node:assert/strict";
import { createReading } from "./reading.js";
import { generateProductReportHtml } from "./productReportHtml.js";
import {
  LIFE_STAGE_CRITERIA_TEXT,
  daYunDetailTitle,
  displayDaYunLabel,
  findMislabeledLifeStageInHtml,
  isPreDaYunCycle,
  verifyDaYunAgeYearConsistency,
} from "./lifeStages.js";

function sampleForm(overrides = {}) {
  return {
    surname: "가",
    given: "상갑",
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    unknownTime: false,
    yaja: true,
    gender: "female",
    calendar: "solar",
    status: "single",
    role: "employee",
    ...overrides,
  };
}

// --- unit: detector catches classic bug HTML ---
{
  const bad = `
    <h2>대운 상세 · 초년 (갑자)</h2><p>1990~1995년 · 세는나이 1~6세.</p>
    <h2>대운 상세 · 중년 (을축)</h2><p>1996~2005년 · 세는나이 7~16세.</p>
    <h2>대운 상세 · 말년 (병인)</h2><p>2006~2015년 · 세는나이 17~26세.</p>
  `;
  const issues = findMislabeledLifeStageInHtml(bad);
  assert.ok(issues.some((i) => i.kind === "classic_mid_7_16"), "detect mid 7-16");
  assert.ok(issues.some((i) => i.kind === "classic_late_17_26"), "detect late 17-26");
  assert.ok(issues.some((i) => i.kind === "classic_early_1_6_as_dayun_phase"), "detect early 1-6 as phase");
  assert.ok(issues.some((i) => i.kind === "stage_age_mismatch"), "detect stage/age mismatch");
}

// --- unit: labels ---
{
  assert.equal(displayDaYunLabel({ gz: "", gzKo: "대운 전" }), "대운 시작 전");
  assert.equal(daYunDetailTitle({ gz: "", gzKo: "대운 전" }, 1), "대운 시작 전");
  assert.equal(daYunDetailTitle({ gz: "甲子", gzKo: "갑자", startAge: 7, endAge: 16 }, 1), "제1대운 · 갑자");
  assert.ok(isPreDaYunCycle({ gz: "", gzKo: "대운 전" }));
  assert.ok(!isPreDaYunCycle({ gz: "甲子", gzKo: "갑자" }));
}

const samples = [
  sampleForm(),
  sampleForm({ year: 1985, month: 3, day: 8, gender: "male", hour: 9 }),
  sampleForm({ year: 1998, month: 11, day: 22, gender: "female", hour: 22, minute: 10 }),
];

let reportChecked = 0;
for (const form of samples) {
  const reading = createReading(form);
  const cycles = reading.chart.daYun?.cycles || [];
  assert.ok(cycles.length > 0, "cycles exist");

  // 엔진 대운 연도·세는나이 일치
  for (const c of cycles) {
    const v = verifyDaYunAgeYearConsistency(c, reading.chart.solar.year);
    assert.ok(v.ok, `age/year mismatch ${JSON.stringify({ formYear: form.year, c, v })}`);
  }

  // 첫 빈 간지 구간은 대운 시작 전으로 표시
  const first = cycles[0];
  if (isPreDaYunCycle(first)) {
    assert.equal(displayDaYunLabel(first), "대운 시작 전");
    assert.ok(Number(first.endAge) < 31, "pre-daeun ends before mid-life");
  }

  const html = generateProductReportHtml(reading, { mode: "full" });
  const pageCount = (html.match(/class="page[\s"]/g) || []).length;
  assert.ok(pageCount > 0, "has pages");
  assert.ok(html.includes(LIFE_STAGE_CRITERIA_TEXT.slice(0, 20)), "criteria text present");
  assert.ok(html.includes("대운 시작 전") || !cycles.some(isPreDaYunCycle), "pre-daeun labeled");
  assert.ok(html.includes("생애 단계"), "life stage section");
  assert.ok(html.includes("초년 1~30세") || html.includes("1~30세"), "early criteria");
  assert.ok(html.includes("31~60세"), "mid criteria");
  assert.ok(html.includes("61세"), "late criteria");

  // 잘못된 생애단계 매핑 없어야 함
  const issues = findMislabeledLifeStageInHtml(html);
  assert.equal(issues.length, 0, `mislabeled in report: ${JSON.stringify(issues)}`);

  // 대운 상세 제목에 순번 인덱스로 초년/중년/말년을 붙이지 않음
  assert.ok(!/대운 상세\s*[·・]\s*초년\s*\(/.test(html), "no 초년 as first-cycle title");
  assert.ok(!/대운 상세\s*[·・]\s*중년\s*\(/.test(html), "no 중년 as second-cycle title");
  assert.ok(!/대운 상세\s*[·・]\s*말년\s*\(/.test(html), "no 말년 as third-cycle title");

  // 페이지 수·인쇄 CSS (PDF 인쇄 경로와 동일 HTML)
  assert.ok(pageCount >= 80, `enough pages got ${pageCount}`);
  assert.ok(/@page|@media\s+print/.test(html), "print css present");

  reportChecked += 1;
}

console.log(
  JSON.stringify(
    {
      ok: true,
      reportChecked,
      checks: [
        "detector_classic_bug",
        "pre_daeun_label",
        "age_year_consistency",
        "full_report_no_mislabeled_stages",
        "life_stage_criteria_in_html",
        "print_css",
      ],
    },
    null,
    2,
  ),
);
