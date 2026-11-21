import { buildChart } from "./chart.js";
import { buildLiuyao, buildTojeong, buildYijing } from "./divination.js";
import { buildDashboard } from "./dashboard.js";
import { buildForecast } from "./forecast.js";
import { buildLifeGuide } from "./lifeGuide.js";
import { readProfile } from "./profile.js";
import { buildPhysiognomy } from "./physiognomy.js";
import { buildReport } from "./report.js";
import { buildTaegil } from "./taegil.js";
import { buildSky } from "./tarotAstro.js";
import { buildWesternAstrology } from "./westernAstrology.js";
import { buildToday } from "./today.js";
import { branchRelation, eul, eun, koGz, levelFromScore, stemRelation } from "./ganzhi.js";
import { buildLiuren } from "./liuren.js";
import { buildNameology, nameScore } from "./nameology.js";
import { buildQimen } from "./qimen.js";
import { buildCustomFortunePack } from "./customFortune.js";
import { buildTenYearFortune } from "./tenYearFortune.js";
import { buildYearFortuneBook } from "./yearFortune.js";
import { buildZiwei } from "./ziwei.js";
import { dayMasterPhrase, easeSentence, favorBundlePhrase, strengthPhrase } from "./plainTerms.js";

function normalizeName(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "");
}

function hanjaChars(value) {
  return [...value].filter((ch) => /\p{Script=Han}/u.test(ch)).join("");
}

function cleanPerson(input, label) {
  const surname = normalizeName(input.surname);
  const given = normalizeName(input.given);
  const surnameHanja = hanjaChars(normalizeName(input.surnameHanja));
  const givenHanja = hanjaChars(normalizeName(input.givenHanja));
  if (!/^[가-힣]{1,5}$/.test(surname) || !/^[가-힣]{1,5}$/.test(given)) {
    throw new Error(`${label} 성과 이름을 한글로 입력해 주세요.`);
  }
  if ((input.surnameHanja || input.givenHanja) && (!surnameHanja || !givenHanja)) {
    throw new Error(`${label} 한자는 성과 이름을 함께 적어 주세요.`);
  }
  if (surnameHanja && ([...surnameHanja].length !== [...surname].length || [...givenHanja].length !== [...given].length)) {
    throw new Error(`${label} 한자 글자 수가 한글과 같지 않습니다.`);
  }
  return { ...input, surname, given, surnameHanja, givenHanja };
}

function baziEngine(chart) {
  const line = chart.pillars.map((pillar) => `${pillar.label} ${pillar.gzKo}·${pillar.shiShen}`).join(" / ");
  return {
    id: "bazi",
    name: "사주명리",
    summary: easeSentence(
      `당신의 기본 본성은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}이고, 지금은 ${strengthPhrase(chart.strength.label)}입니다. 사회생활의 결은 ${chart.monthGod}입니다. 힘이 되는 기운은 ${favorBundlePhrase(chart.strength.favorable.join("·"))}, 과하면 부담이 되는 기운은 ${favorBundlePhrase(chart.strength.unfavorable.join("·"))}입니다. ${line}. 약속이 느슨해지기 쉬운 자리는 ${chart.xunKong}라서, 그 글자가 들어오는 해에는 확인을 한 번 더 하세요.`,
    ),
    points: [
      easeSentence(`10년 운은 ${chart.daYun.forward ? "앞으로" : "뒤로"} 흐르고, ${chart.daYun.startText} 뒤에 첫 큰 운이 시작됩니다.`),
      `야자시는 ${chart.yaja ? "적용해서 23시의 일주를 다음 날로 넘겼습니다." : "적용하지 않아 23시까지 당일 일주를 유지했습니다."}`,
      easeSentence(`공부·서류의 복 ${koGz(chart.specials.munchang)}, 매력·소개의 복 ${koGz(chart.specials.dohwa)}, 이동·출장의 복 ${koGz(chart.specials.yeokma)}.`),
    ],
  };
}

function fengshuiEngine(chart, qimen, ziwei) {
  const door = qimen.doors;
  return {
    id: "fengshui",
    name: "풍수지리",
    summary: `전택궁은 ${ziwei.lookup.전택궁}입니다. 시반의 생문 ${door.생문}에는 금고와 장부, 개문 ${door.개문}에는 출입과 책상 시선, 휴문 ${door.휴문}에는 침대를 둡니다. 사문 ${door.사문}은 막거나 환기만 하고, ${eun(`직부 ${door.직부}`)} 이 명식이 힘을 받는 방위입니다.`,
    points: [
      `재물 배치: 생문 ${door.생문} 벽에 통장과 계약서. 책상은 그 방향을 등지지 않게.`,
      `커리어 동선: 개문 ${door.개문} 쪽 출입과 명함.`,
      `휴식: 휴문 ${door.휴문}. 거울이 침대를 정면으로 보지 않게 합니다.`,
      `금기: 사문 ${door.사문}의 침대, 병상, 오래 두는 쓰레기.`,
      `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · ${strengthPhrase(chart.strength.label)}이라 집 안에 ${favorBundlePhrase(chart.strength.favorable[0])} 소재를 한 가지 들이면 충분합니다.`,
    ],
  };
}

function compatibility(a, b) {
  let score = 62;
  const lines = [];
  const stem = stemRelation(a.dayStem, b.dayStem);
  const branch = branchRelation(a.dayBranch, b.dayBranch);
  const year = branchRelation(a.pillars[0].zhi, b.pillars[0].zhi);
  if (stem === "합") {
    score += 12;
    lines.push("일간이 합이라 기본 기질이 서로를 끌어당깁니다.");
  } else if (stem === "충") {
    score -= 10;
    lines.push("일간이 충이라 기준과 자존이 부딪칩니다. 역할을 나누면 충이 경쟁이 아니라 분업이 됩니다.");
  } else {
    lines.push("일간은 합도 충도 아니라, 취향보다 생활 습관이 관계를 좌우합니다.");
  }
  if (branch === "합") {
    score += 10;
    lines.push("일지가 육합이라 한집살이의 결이 맞습니다.");
  } else if (branch === "충") {
    score -= 12;
    lines.push("일지가 충이라 결혼 후 리듬과 잠자리가 크게 흔들립니다.");
  } else if (branch === "원진") {
    score -= 6;
    lines.push("일지가 원진이라 정은 있는데 서운함이 쌓입니다.");
  } else {
    lines.push("일지는 강한 합충이 없어, 일상은 대화량으로 조절됩니다.");
  }
  if (year === "합") {
    score += 4;
    lines.push("년지가 합이라 양가와 친구 자리가 편합니다.");
  }
  if (year === "충") {
    score -= 4;
    lines.push("띠가 충이라 체면과 가족 행사에서 각이 납니다.");
  }
  const produce = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
  const control = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };
  if (produce[a.dayElement] === b.dayElement || produce[b.dayElement] === a.dayElement) {
    score += 6;
    lines.push("오행이 상생이라 한쪽의 일이 다른 쪽의 살이 됩니다.");
  } else if (control[a.dayElement] === b.dayElement || control[b.dayElement] === a.dayElement) {
    score -= 4;
    lines.push("오행이 상극이라 관심이 잔소리로 들릴 수 있습니다. 영역을 나누면 관리가 됩니다.");
  }
  score = Math.max(12, Math.min(97, Math.round(score)));
  return { score, level: levelFromScore(score), lines };
}

function stripChart(chart) {
  const plain = { ...chart };
  delete plain.eight;
  delete plain.lunar;
  return plain;
}

export function createReading(raw) {
  const profile = readProfile(raw);
  const selfInput = cleanPerson(raw, "본인");
  const chart = buildChart(selfInput);
  const name = buildNameology(selfInput.surname, selfInput.given, selfInput.surnameHanja, selfInput.givenHanja);
  const ziwei = buildZiwei(chart);
  const qimen = buildQimen(chart);
  const yijing = buildYijing(chart);
  const liuyao = buildLiuyao(chart);
  const liuren = buildLiuren(chart);
  const tojeong = buildTojeong(chart);
  const fengshui = fengshuiEngine(chart, qimen, ziwei);
  const bazi = baziEngine(chart);

  let partner = null;
  let compat = null;
  if (raw.partner) {
    const partnerInput = cleanPerson(raw.partner, "상대");
    const partnerChart = buildChart(partnerInput);
    const partnerName = buildNameology(
      partnerInput.surname,
      partnerInput.given,
      partnerInput.surnameHanja,
      partnerInput.givenHanja,
    );
    compat = compatibility(chart, partnerChart);
    const gap = nameScore(name) - nameScore(partnerName);
    compat.lines.push(
      gap >= 0
        ? "성명 수리는 본인 격이 더 단정합니다. 호칭과 체면을 맞추면 합이 편해집니다."
        : "성명 수리는 상대 격이 더 단정합니다. 이름을 부르는 예의가 관계의 온도가 됩니다.",
    );
    compat.pair = `${selfInput.surname}${selfInput.given} · ${partnerInput.surname}${partnerInput.given}`;
    partner = {
      displayName: `${partnerInput.surname}${partnerInput.given}`,
      hanja: `${partnerInput.surnameHanja}${partnerInput.givenHanja}`,
      chart: stripChart(partnerChart),
      name: partnerName,
    };
  }

  const engines = [bazi, ziwei, yijing, liuyao, qimen, liuren, fengshui, name, tojeong];
  const forecast = buildForecast(chart, { ziwei, qimen }, compat, profile);
  const guide = buildLifeGuide(chart, { qimen });
  const dashboard = buildDashboard(chart, forecast, guide, profile, ziwei);
  const today = buildToday(stripChart(chart), profile);
  const face = buildPhysiognomy(chart, guide);
  const sky = buildSky(chart);
  const western = buildWesternAstrology(stripChart(chart));
  const taegil = buildTaegil(chart);
  const yearEngines = { ziwei, qimen };
  const plainChart = stripChart(chart);
  const yearFortune = buildYearFortuneBook(plainChart, yearEngines, profile);
  const tenYear = buildTenYearFortune(plainChart, profile);
  const packed = {
    displayName: `${selfInput.surname}${selfInput.given}`,
    hanja: `${selfInput.surnameHanja}${selfInput.givenHanja}`,
    chart: plainChart,
    partner,
    compat,
    engines,
    profile,
    forecast,
    guide,
    dashboard,
    today,
    face,
    sky,
    western,
    taegil,
    yearEngines,
    yearFortune,
    tenYear,
    bridge: easeSentence(
      `사주의 네 기둥(년·월·일·시)은 ${chart.pillars.map((pillar) => pillar.gzKo).join(" ")}입니다. 방위·동선으로 때를 보는 렌즈(기문둔갑)로 보면, 살림·회복은 ${qimen.doors.생문} 쪽을 정돈할 때 숨이 트이고, 일과 만남은 ${qimen.doors.개문}이 수월합니다. 잠자리·휴식은 ${qimen.doors.사문}만 피하면 됩니다. 이 흐름은 ${eul(qimen.meta)}처럼 시계를 겹쳐 읽은 결과입니다.`,
    ),
  };
  packed.customFortune = buildCustomFortunePack(packed);
  packed.report = buildReport(packed);
  return packed;
}
