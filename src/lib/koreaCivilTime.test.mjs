/**
 * koreaCivilTime 독립 테스트 — chart.js / 사주 엔진 미연결
 */
import {
  classifyKoreaCivil,
  getKoreaTimeRuntimeInfo,
  koreaCivilToUtc,
  legacyNaiveUtcPlus9,
  roundTripKoreaCivil,
  utcToKoreaCivil,
} from "./koreaCivilTime.js";

let passed = 0;
let failed = 0;
const failures = [];
const unverified = [];

function assert(name, cond, detail = "") {
  if (cond) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    failures.push({ name, detail });
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function assertThrows(name, fn, code) {
  try {
    fn();
    assert(name, false, "오류가 나지 않음");
  } catch (e) {
    assert(name, e.code === code, `code=${e.code} message=${e.message}`);
  }
}

console.log("=== runtime ===");
const runtime = getKoreaTimeRuntimeInfo();
console.log(JSON.stringify(runtime, null, 2));
assert("1960 sample offset +08:30", runtime.sample1960Offset === "+08:30");
assert("2020 sample offset +09:00", runtime.sample2020Offset === "+09:00");
unverified.push("ICU/IANA 데이터 ↔ 관보·법령 원문 전수 대조");
unverified.push("경도·진태양시·야자시 (이번 단계 미구현)");

console.log("\n=== case A 1960-03-16 22:00 (부천=민정시만, 경도 미적용) ===");
const caseA = koreaCivilToUtc({ year: 1960, month: 3, day: 16, hour: 22, minute: 0 });
assert("A offset +08:30", caseA.offset === "+08:30", caseA.offset);
assert("A UTC 13:30Z", caseA.instant === "1960-03-16T13:30:00Z", caseA.instant);
const legacyA = legacyNaiveUtcPlus9({ year: 1960, month: 3, day: 16, hour: 22, minute: 0 });
assert(
  "A vs legacy+9 차이 30분",
  caseA.epochMs - legacyA.epochMs === 30 * 60 * 1000,
  `deltaMs=${caseA.epochMs - legacyA.epochMs}`,
);
const rtA = roundTripKoreaCivil({ year: 1960, month: 3, day: 16, hour: 22, minute: 0 });
assert("A round-trip", rtA.ok);

console.log("\n=== 표준시 변경일 ===");
assertThrows(
  "1954-03-20 23:30 ambiguous (시계 되돌림 겹침)",
  () => koreaCivilToUtc({ year: 1954, month: 3, day: 20, hour: 23, minute: 30 }),
  "AMBIGUOUS_LOCAL",
);
const after1954 = koreaCivilToUtc({ year: 1954, month: 3, day: 21, hour: 0, minute: 0 });
assert("1954-03-21 00:00 +08:30", after1954.offset === "+08:30", after1954.offset);

const before1961 = koreaCivilToUtc({ year: 1961, month: 8, day: 9, hour: 23, minute: 30 });
assert("1961-08-09 23:30 +08:30", before1961.offset === "+08:30", before1961.offset);
assertThrows(
  "1961-08-10 00:00 nonexistent (30분 점프 공백)",
  () => koreaCivilToUtc({ year: 1961, month: 8, day: 10, hour: 0, minute: 0 }),
  "NONEXISTENT_LOCAL",
);
const after1961 = koreaCivilToUtc({ year: 1961, month: 8, day: 10, hour: 0, minute: 30 });
assert("1961-08-10 00:30 +09:00", after1961.offset === "+09:00", after1961.offset);

console.log("\n=== 서머타임 경계 ===");
assertThrows(
  "1960-05-01 00:30 nonexistent (DST 시작 공백)",
  () => koreaCivilToUtc({ year: 1960, month: 5, day: 1, hour: 0, minute: 30 }),
  "NONEXISTENT_LOCAL",
);
const dst1960 = koreaCivilToUtc({ year: 1960, month: 5, day: 1, hour: 1, minute: 0 });
assert("1960-05-01 01:00 +09:30", dst1960.offset === "+09:30", dst1960.offset);

assertThrows(
  "1987-05-10 02:30 nonexistent",
  () => koreaCivilToUtc({ year: 1987, month: 5, day: 10, hour: 2, minute: 30 }),
  "NONEXISTENT_LOCAL",
);
assertThrows(
  "1987-10-11 02:30 ambiguous (DST 종료 겹침)",
  () => koreaCivilToUtc({ year: 1987, month: 10, day: 11, hour: 2, minute: 30 }),
  "AMBIGUOUS_LOCAL",
);

console.log("\n=== 명시 정책 earlier/later (모호 시각만) ===");
const amb = classifyKoreaCivil({ year: 1954, month: 3, day: 20, hour: 23, minute: 30 });
assert("classify ambiguous", amb.status === "ambiguous", amb.status);
const early = koreaCivilToUtc(
  { year: 1954, month: 3, day: 20, hour: 23, minute: 30 },
  { disambiguation: "earlier" },
);
const late = koreaCivilToUtc(
  { year: 1954, month: 3, day: 20, hour: 23, minute: 30 },
  { disambiguation: "later" },
);
assert("earlier ≠ later", early.epochMs !== late.epochMs);
assert("earlier +09:00", early.offset === "+09:00", early.offset);
assert("later +08:30", late.offset === "+08:30", late.offset);

console.log("\n=== 왕복 (유일 시각) ===");
for (const p of [
  { year: 1990, month: 5, day: 15, hour: 12, minute: 0 },
  { year: 1960, month: 3, day: 16, hour: 22, minute: 0 },
  { year: 2020, month: 6, day: 1, hour: 0, minute: 0 },
  { year: 1960, month: 5, day: 1, hour: 1, minute: 0 },
]) {
  const rt = roundTripKoreaCivil(p);
  assert(
    `round-trip ${p.year}-${p.month}-${p.day} ${p.hour}:${String(p.minute).padStart(2, "0")}`,
    rt.ok,
  );
}

console.log("\n=== utc→civil ===");
const back = utcToKoreaCivil(caseA.instant);
assert("utcToKoreaCivil matches A", back.hour === 22 && back.offset === "+08:30");

console.log("\n=== 기존 앱과의 차이 (엔진 미호출, 개념 비교) ===");
console.log(
  JSON.stringify(
    {
      caseA_module: caseA,
      caseA_legacyFixedPlus9: legacyA,
      deltaMinutes: (caseA.epochMs - legacyA.epochMs) / 60000,
      note: "chart.js는 민정시 숫자를 그대로 Solar에 넣음(오프셋 없음). 모듈은 Asia/Seoul로 UTC를 만듦.",
    },
    null,
    2,
  ),
);

console.log("\n=== summary ===");
console.log(JSON.stringify({ passed, failed, unverified, failures }, null, 2));
if (failed > 0) process.exit(1);
