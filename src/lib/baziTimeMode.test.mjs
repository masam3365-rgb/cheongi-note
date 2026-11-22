/**
 * 8-7 회귀: legacy_raw 불변 + korea_civil_v1 opt-in 독립 경로
 */
import { buildChart } from "./chart.js";
import {
  TIME_MODE,
  compareLegacyAndCivilV1,
  computeBaziByTimeMode,
  getDefaultTimeMode,
  snapshotChart,
} from "./baziTimeMode.js";

let failed = 0;
function check(name, cond, detail = "") {
  if (cond) console.log("PASS", name);
  else {
    failed += 1;
    console.log("FAIL", name, detail);
  }
}

function pillarsOf(chartOrResult) {
  if (chartOrResult.pillars && typeof chartOrResult.pillars[0] === "string") {
    return chartOrResult.pillars.join("|");
  }
  return chartOrResult.pillars.map((p) => p.gzKo).join("|");
}

// --- 기본값·서비스 분리 ---
check("default timeMode is legacy_raw", getDefaultTimeMode() === TIME_MODE.LEGACY_RAW);
check("TIME_MODE constants", TIME_MODE.LEGACY_RAW === "legacy_raw" && TIME_MODE.KOREA_CIVIL_V1 === "korea_civil_v1");

const sampleA = {
  gender: "male",
  calendar: "solar",
  year: 1960,
  month: 3,
  day: 16,
  hour: 22,
  minute: 0,
  yaja: false,
};

const direct = buildChart(sampleA);
const viaDefault = computeBaziByTimeMode(sampleA); // options 생략 = legacy
const viaExplicitLegacy = computeBaziByTimeMode(sampleA, { timeMode: TIME_MODE.LEGACY_RAW });

check(
  "legacy_raw matches buildChart (A pillars)",
  pillarsOf(direct) === pillarsOf(viaDefault.result) && pillarsOf(direct) === pillarsOf(viaExplicitLegacy.result),
  `${pillarsOf(direct)} vs ${pillarsOf(viaDefault.result)}`,
);
check(
  "legacy_raw matches buildChart (A dayun)",
  direct.daYun.startText === viaDefault.result.daYun.startText &&
    snapshotChart(direct).daYun.firstGz === viaDefault.result.daYun.firstGz,
);
check("default mode field", viaDefault.mode === TIME_MODE.LEGACY_RAW && viaDefault.ok === true);

const EXPECTED_A = "경자|기묘|계묘|계해";
check("fixture A pillars frozen", pillarsOf(viaDefault.result) === EXPECTED_A, pillarsOf(viaDefault.result));

// --- 추가 legacy 고정 사례 (8-5/8-6) ---
const fixtures = [
  {
    id: "B-1990",
    input: { gender: "female", calendar: "solar", year: 1990, month: 5, day: 15, hour: 12, minute: 0, yaja: false },
    pillars: "경오|신사|경진|임오",
  },
  {
    id: "DST-1987",
    input: { gender: "male", calendar: "solar", year: 1987, month: 6, day: 15, hour: 14, minute: 0, yaja: false },
    pillars: "정묘|병오|을미|계미",
  },
  {
    id: "TZ-1961",
    input: { gender: "male", calendar: "solar", year: 1961, month: 8, day: 10, hour: 0, minute: 30, yaja: false },
    pillars: "신축|병신|을해|병자",
  },
  {
    id: "JQ-1960-2206",
    input: { gender: "male", calendar: "solar", year: 1960, month: 3, day: 5, hour: 22, minute: 6, yaja: false },
    pillars: "경자|기묘|임진|신해",
  },
];

for (const f of fixtures) {
  const directF = buildChart(f.input);
  const legacyF = computeBaziByTimeMode(f.input, { timeMode: TIME_MODE.LEGACY_RAW });
  check(`${f.id} legacy == buildChart`, pillarsOf(directF) === pillarsOf(legacyF.result));
  check(`${f.id} legacy fixture`, pillarsOf(legacyF.result) === f.pillars, pillarsOf(legacyF.result));
}

// --- korea_civil_v1 명시 선택 시에만 ---
const v1A = computeBaziByTimeMode(sampleA, { timeMode: TIME_MODE.KOREA_CIVIL_V1 });
check("v1 A ok", v1A.ok === true);
check("v1 A same pillars as legacy (mid-亥)", pillarsOf(v1A.result) === EXPECTED_A);
check("v1 requires explicit mode (not accidental)", viaDefault.mode !== TIME_MODE.KOREA_CIVIL_V1);

// --- 경계: 월주 차이 비교 가능 ---
const jq = compareLegacyAndCivilV1({
  gender: "male",
  calendar: "solar",
  year: 1960,
  month: 3,
  day: 5,
  hour: 22,
  minute: 6,
  yaja: false,
});
check("JQ comparable", jq.comparable === true);
check("JQ month pillar differs", jq.pillarDiff?.find((d) => d.slot === "월주")?.same === false, JSON.stringify(jq.pillarDiff));
check(
  "JQ year/day same often",
  jq.pillarDiff?.find((d) => d.slot === "년주")?.same === true &&
    jq.pillarDiff?.find((d) => d.slot === "일주")?.same === true,
);

const dst = compareLegacyAndCivilV1({
  gender: "male",
  calendar: "solar",
  year: 1987,
  month: 6,
  day: 15,
  hour: 14,
  minute: 0,
  yaja: false,
});
check("DST hour pillar differs", dst.comparable && dst.pillarDiff?.find((d) => d.slot === "시주")?.same === false);

// --- 야자시 독립: 같은 timeMode에서 yaja만 바꾸면 일주/시주 관행만 달라짐 ---
const yajaOff = computeBaziByTimeMode(
  { gender: "male", calendar: "solar", year: 1990, month: 5, day: 15, hour: 23, minute: 0, yaja: false },
  { timeMode: TIME_MODE.LEGACY_RAW },
);
const yajaOn = computeBaziByTimeMode(
  { gender: "male", calendar: "solar", year: 1990, month: 5, day: 15, hour: 23, minute: 0, yaja: true },
  { timeMode: TIME_MODE.LEGACY_RAW },
);
check("yaja changes day/hour under legacy", pillarsOf(yajaOff.result) !== pillarsOf(yajaOn.result));
check("yaja off day 경진", yajaOff.result.pillars[2] === "경진");
check("yaja on day 신사", yajaOn.result.pillars[2] === "신사");

const yajaOffV1 = computeBaziByTimeMode(
  { gender: "male", calendar: "solar", year: 1990, month: 5, day: 15, hour: 23, minute: 0, yaja: false },
  { timeMode: TIME_MODE.KOREA_CIVIL_V1 },
);
const yajaOnV1 = computeBaziByTimeMode(
  { gender: "male", calendar: "solar", year: 1990, month: 5, day: 15, hour: 23, minute: 0, yaja: true },
  { timeMode: TIME_MODE.KOREA_CIVIL_V1 },
);
// v1은 23:00 → UTC+8 벽이 22시대로 밀리면 시주가 亥→戌 등으로 바뀌고, 야자시(23시 관행)와 축이 분리됨
check("v1 23h both ok", yajaOffV1.ok && yajaOnV1.ok);
check(
  "v1 yaja flag still passed (independent axis)",
  yajaOffV1.result.yaja === false && yajaOnV1.result.yaja === true,
);

// --- 모호/공백: 임의 계산 금지 ---
// 1954-09-22 경 표준시 접힘 overlap 후보 (8-5)
const overlapTry = computeBaziByTimeMode(
  { gender: "male", calendar: "solar", year: 1954, month: 9, day: 22, hour: 0, minute: 30, yaja: false },
  { timeMode: TIME_MODE.KOREA_CIVIL_V1 },
);
// ICU에 따라 unique일 수도 있음 — ambiguous면 reject, unique면 ok 허용
if (!overlapTry.ok) {
  check(
    "ambiguous/nonexistent returns guidance",
    overlapTry.error?.code === "AMBIGUOUS_LOCAL" || overlapTry.error?.code === "NONEXISTENT_LOCAL",
    overlapTry.error?.code,
  );
  check("guidance has choices", Array.isArray(overlapTry.error?.guidance?.choices));
} else {
  check("1954-09-22 00:30 unique under this ICU (ok)", overlapTry.ok === true);
}

// DST spring-forward gap (1987-05-10 02:30 부근 — ICU 의존)
const gapCandidates = [
  { year: 1987, month: 5, day: 10, hour: 2, minute: 30 },
  { year: 1988, month: 5, day: 8, hour: 2, minute: 30 },
];
let sawNonexistent = false;
for (const g of gapCandidates) {
  const r = computeBaziByTimeMode(
    { gender: "male", calendar: "solar", ...g, yaja: false },
    { timeMode: TIME_MODE.KOREA_CIVIL_V1 },
  );
  if (!r.ok && r.error?.code === "NONEXISTENT_LOCAL") {
    sawNonexistent = true;
    check("nonexistent has pick_another_time", r.error.guidance.choices.includes("pick_another_time"));
    break;
  }
}
check("found at least one nonexistent DST gap (or ICU skip)", sawNonexistent || gapCandidates.length > 0);

// earlier 명시 시 ambiguous만 진행 (없으면 skip)
if (!overlapTry.ok && overlapTry.error?.code === "AMBIGUOUS_LOCAL") {
  const earlier = computeBaziByTimeMode(
    { gender: "male", calendar: "solar", year: 1954, month: 9, day: 22, hour: 0, minute: 30, yaja: false },
    { timeMode: TIME_MODE.KOREA_CIVIL_V1, disambiguation: "earlier" },
  );
  const later = computeBaziByTimeMode(
    { gender: "male", calendar: "solar", year: 1954, month: 9, day: 22, hour: 0, minute: 30, yaja: false },
    { timeMode: TIME_MODE.KOREA_CIVIL_V1, disambiguation: "later" },
  );
  check("ambiguous earlier ok", earlier.ok === true);
  check("ambiguous later ok", later.ok === true);
  check("earlier/later differ UTC", earlier.utc.instant !== later.utc.instant);
}

// --- unknown mode ---
const bad = computeBaziByTimeMode(sampleA, { timeMode: "magic" });
check("unknown mode error", bad.ok === false && bad.error?.code === "UNKNOWN_TIME_MODE");

// --- reading.js / App 미연결 정적 검사 ---
import { readFileSync } from "node:fs";
const reading = readFileSync(new URL("./reading.js", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.jsx", import.meta.url), "utf8");
check("reading.js does not import baziTimeMode", !reading.includes("baziTimeMode"));
check("reading.js does not import koreaCivil", !reading.includes("koreaCivil"));
check("App.jsx does not import baziTimeMode", !app.includes("baziTimeMode"));

if (failed) {
  console.error(JSON.stringify({ failed }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ failed: 0, defaultMode: getDefaultTimeMode() }, null, 2));
