/**
 * 관리자 보고서: 무료 요약 없이 명식만으로 유료 full HTML 생성 가능 여부
 */
import assert from "node:assert/strict";
import { buildPaidReport } from "../../server/buildPaidReport.mjs";
import { readingToReportHtml } from "./reportHtml.js";
import { readingToText } from "./plainText.js";
import { createReading } from "./reading.js";
import {
  emptyAdminDraft,
  isAdminDraftReady,
  normalizeAdminPayload,
  resolveAdminForm,
} from "./adminFormFromReading.js";
import { freeExportLeaksCareerDetail } from "./careerFreeSummary.js";
import { PLANS } from "./customFortune.js";

// 1) 무료 요약 없이 draft만으로 ready
const draft = {
  ...emptyAdminDraft(),
  surname: "가",
  given: "상갑",
  year: "1990",
  month: "5",
  day: "15",
  hour: "14",
  minute: "30",
  gender: "female",
  calendar: "solar",
  status: "single",
  role: "employee",
  yaja: true,
  unknownTime: false,
};
assert.equal(isAdminDraftReady(emptyAdminDraft()), false);
assert.equal(isAdminDraftReady(draft), true);
assert.equal(resolveAdminForm(null, null), null);

const payload = normalizeAdminPayload(draft, "full", []);
assert.equal(payload.product, "full");
assert.equal(payload.format, "html");
assert.equal(payload.year, 1990);

// 2) 유료 풀 패키지 = generateProductReportHtml 경로 (페이지·목차·진로 상세)
const paid = buildPaidReport(payload);
assert.ok(paid.pages >= 95 && paid.pages <= 130, `paid pages ${paid.pages}`);
assert.ok(paid.html.includes("풀") || paid.productLabel.includes("풀"), "full label");
assert.ok(paid.html.includes("진로 지침서") || paid.html.includes("직업·진로"), "career part");
assert.ok(paid.html.includes("10년") || paid.html.includes("十年"), "ten year part");
assert.ok(/class="page[\s"]/.test(paid.html), "page shells");
assert.ok(paid.html.includes("데이터 사이언티스트") || /직종|추천/.test(paid.html), "job detail in paid");

// 3) 무료 export 와 유료 HTML 분리
const reading = createReading({
  surname: "가",
  given: "상갑",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: "female",
  calendar: "solar",
  status: "single",
  role: "employee",
  yaja: true,
});
const freeText = readingToText(reading);
const freeHtml = readingToReportHtml(reading, { year: reading.yearFortune?.defaultYear });
assert.equal(freeExportLeaksCareerDetail(freeText).length, 0, "free text no career detail leak");
assert.ok(paid.pages > 40, "paid much longer than free summary UI");
assert.ok(paid.html.length > freeHtml.length * 0.5 || paid.pages >= 50, "paid substantial");

// 4) 가격 유지
assert.deepEqual(
  [PLANS.single.price, PLANS.triple.price, PLANS.full.price],
  [8000, 19000, 29000],
);

console.log(
  JSON.stringify(
    {
      ok: true,
      draftReadyWithoutFreeSummary: true,
      paidPages: paid.pages,
      productLabel: paid.productLabel,
      freeTextLeak: freeExportLeaksCareerDetail(freeText),
      prices: [PLANS.single.price, PLANS.triple.price, PLANS.full.price],
    },
    null,
    2,
  ),
);
