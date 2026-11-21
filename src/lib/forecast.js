import { Solar } from "lunar-javascript";
import {
  STEM_ELEMENT,
  branchRelation,
  clamp,
  koGz,
  levelFromScore,
  mainStem,
  stemRelation,
  tenGod,
} from "./ganzhi.js";
import { monthMeta } from "./monthLabel.js";
import { dayMasterPhrase, easeSentence, favorBundlePhrase, strengthPhrase } from "./plainTerms.js";

const TITLES = {
  wealth: "재물운 · 투자와 사업",
  career: "취업 · 직장과 커리어",
  study: "학업 · 자격과 시험",
  love: "연애 · 궁합과 결혼",
  health: "건강 · 체질",
  family: "자녀 · 가족",
  move: "이사 · 풍수와 방위",
};

const GOOD = {
  wealth: { 정재: 18, 편재: 16, 식신: 10, 상관: 4, 정관: 2, 편관: -2, 정인: -2, 편인: -4, 비견: -8, 겁재: -14 },
  career: { 정관: 18, 편관: 12, 정인: 10, 식신: 8, 정재: 6, 편재: 6, 상관: -8, 편인: 2, 비견: -2, 겁재: -10 },
  study: { 정인: 18, 편인: 12, 식신: 8, 정관: 6, 편관: -2, 상관: -4, 정재: -3, 편재: -5, 비견: 2, 겁재: -4 },
  health: { 정인: 10, 식신: 8, 비견: 4, 정관: 2, 편인: 2, 정재: 0, 편재: -2, 상관: -6, 편관: -12, 겁재: -10 },
  move: { 편재: 12, 상관: 8, 편관: 6, 식신: 4, 정재: 4, 정관: 3, 겁재: 1, 비견: 0, 정인: -2, 편인: -2 },
};

const LOVE_MALE = { 정재: 18, 편재: 16, 식신: 8, 상관: 3, 정인: 2, 정관: -2, 편관: -4, 편인: -2, 비견: -4, 겁재: -8 };
const LOVE_FEMALE = { 정관: 18, 편관: 14, 식신: 8, 정인: 6, 정재: 4, 상관: 2, 편재: 2, 편인: 0, 비견: -3, 겁재: -7 };
const CHILD_MALE = { 정관: 16, 편관: 12, 정인: 8, 식신: 4, 정재: 3, 상관: 1, 편재: 0, 비견: 2, 편인: 2, 겁재: -6 };
const CHILD_FEMALE = { 식신: 16, 상관: 12, 정인: 8, 정관: 4, 편관: 2, 정재: 2, 비견: 1, 편재: 0, 편인: 2, 겁재: -6 };

const FOCUS = {
  wealth: {
    정재: "월급, 받을 돈, 계약금처럼 장부에 적히는 재물이 중심입니다. 화려한 투자보다 계약서의 숫자가 이롭습니다.",
    편재: "사업과 유동 자금의 폭이 커집니다. 기회는 많지만 판을 한 번에 키우면 새기 쉽습니다.",
    식신: "손기술과 콘텐츠, 먹는 일과 서비스에서 돈이 따라옵니다.",
    상관: "아이디어는 빠르나 말과 지출이 돈을 먼저 가져갑니다. 만들기 전에 단가를 정하세요.",
    정관: "직위와 규정이 돈을 지키기도, 늦추기도 합니다. 정식 계약이 안전합니다.",
    편관: "압박과 경쟁 속에서 성과와 책임의 돈이 오갑니다. 보증은 피합니다.",
    정인: "자격과 문서가 자산을 지킵니다. 당장의 현금보다 간판과 권리가 먼저입니다.",
    편인: "비주류 기술과 특수 분야에 돈이 숨습니다. 혼자만의 계산은 한 번 더 검증하세요.",
    비견: "내 몫을 지키려다 나누는 돈이 늘어납니다. 동업 지분부터 적으세요.",
    겁재: "새는 돈과 경쟁이 셉니다. 큰 베팅과 연대보증은 이 구간의 금기입니다.",
  },
  career: {
    정관: "채용, 승진, 정식 발령이 열리기 좋은 결입니다. 규정과 평판을 무기 삼으세요.",
    편관: "이직과 힘든 보직, 프로젝트 리더 이야기가 나올 수 있습니다. 권한의 범위를 먼저 적으세요.",
    정인: "자격, 사내 교육, 선배의 추천이 자리를 만듭니다.",
    편인: "연구와 기획 막후, 특수 직무가 맞습니다. 정치적 자리는 실속이 적습니다.",
    식신: "성과물로 인정받습니다. 말보다 결과 파일을 내미는 구간입니다.",
    상관: "개선 제안이 빛나지만, 상사와 각을 세우면 평가가 꺾입니다.",
    정재: "실적과 숫자가 인사에 반영됩니다. 맡은 장부를 깨끗이 하면 신뢰가 됩니다.",
    편재: "영업, 외부 미팅, 겸업의 문이 열립니다.",
    비견: "동료 경쟁이 있습니다. 영역을 분명히 하되 공을 독식하지 마세요.",
    겁재: "자리 다툼과 인수인계의 혼선이 있습니다. 문서 없는 약속은 남기지 마세요.",
  },
  study: {
    정인: "시험과 자격의 정석이 맞습니다. 교재 한 권을 끝까지 가는 힘이 있습니다.",
    편인: "암기와 특수 과목, 남들이 덜 보는 범위에서 점수가 납니다.",
    식신: "이해해서 푸는 과목, 실기와 포트폴리오가 유리합니다.",
    상관: "응용과 논술은 좋으나 기본 틀을 건너뛰면 감점입니다.",
    정관: "감독과 일정이 있는 시험이 맞습니다. 루틴이 점수입니다.",
    편관: "경쟁이 센 고시와 압박 면접의 구간입니다. 체력 없이 달리면 막판에 꺾입니다.",
    정재: "학업 환경은 갖춰지나 마음이 성적보다 돈 계산으로 새기 쉽습니다.",
    편재: "바깥 활동이 많아 책상 시간이 줄어듭니다. 공부 시간을 먼저 못 박으세요.",
    비견: "스터디가 도움이 되기도, 잡담으로 새기도 합니다.",
    겁재: "비교와 자료 분실에 주의합니다. 노트는 직접 정리하세요.",
  },
  love: {
    정재: "돌보고 책임지는 관계가 깊어집니다. 남성이라면 배우자와 생활의 결이 이 흐름과 가깝습니다.",
    편재: "만남과 설렘이 빠릅니다. 마음을 한 사람에게 두는 연습이 이 시기의 숙제입니다.",
    정관: "기준이 분명한 인연이 들어옵니다. 여성이라면 배우자와 약속의 결이 이 흐름과 가깝습니다.",
    편관: "강한 끌림과 긴장이 함께 있습니다. 통제와 사랑을 구분해야 관계가 남습니다.",
    식신: "같이 먹고 만드는 시간이 애정을 키웁니다.",
    상관: "표현은 화려하나 잔소리가 되기 쉽습니다. 솔직함과 비난 사이를 지키세요.",
    정인: "보호받는 느낌은 좋으나 연애보다 공부와 가족이 앞설 수 있습니다.",
    편인: "속마음은 깊고 표현은 느립니다. 오해는 한 문장으로 푸세요.",
    비견: "친구 같은 연애가 됩니다. 역할이 같으면 누가 양보할지 정해야 합니다.",
    겁재: "질투와 애매한 호감이 끼어듭니다. 삼각 구도는 정리하는 편이 낫습니다.",
  },
  health: {
    정인: "먹고 쉬는 리듬이 몸을 살립니다. 과로만 아니면 회복이 빠른 구간입니다.",
    편인: "수면과 신경이 예민합니다. 걱정과 정보를 줄이는 것이 보약입니다.",
    식신: "식욕과 면역이 무난합니다. 즐거움이 과식으로 이어지지만 않으면 됩니다.",
    상관: "화와 염증, 열이 오릅니다. 새벽까지 달구는 일정이 독입니다.",
    정재: "체력은 유지되나 돈 걱정이 소화기를 잡습니다.",
    편재: "바깥 일정이 몸보다 앞섭니다. 이동 중 식사를 거르지 마세요.",
    정관: "규칙적인 생활이 건강을 지킵니다. 의무감으로 진료를 미루지만 않으면 됩니다.",
    편관: "압박이 근골과 혈압, 긴장의 사고로 옵니다. 무리한 운동과 야근을 겹치지 마세요.",
    비견: "체력은 있으나 남을 따라 달리다 한계를 넘깁니다.",
    겁재: "부상과 과로가 겹치기 쉽습니다. 경쟁하듯 몸을 쓰지 마세요.",
  },
  family: {
    정관: "기준과 역할이 도드라집니다. 자녀에게는 원칙을, 부부에게는 의논이 필요합니다.",
    편관: "훈육과 긴장이 세집니다. 목소리를 낮추면 같은 말도 전달됩니다.",
    식신: "식구를 먹이고 돌보는 기쁨이 있습니다. 여성 명식에서는 자녀의 별이기도 합니다.",
    상관: "자녀의 개성이나 내 감정이 식탁에 먼저 올라옵니다.",
    정인: "돌봄과 효도가 두텁습니다. 독립과의 거리를 재야 합니다.",
    편인: "속마음과 편애가 늦게 드러납니다. 편들지 말고 사실을 먼저 말하세요.",
    정재: "생활비가 관계의 성적표가 됩니다. 장부를 공유하면 다툼이 줄어듭니다.",
    편재: "바깥일이 많아 집에 머무는 시간이 줄어듭니다.",
    비견: "형제처럼 가까운 가족이 돕기도 하고 간섭하기도 합니다.",
    겁재: "상속, 동업, 형제 돈 문제가 불씨가 됩니다. 구두 약속은 남기지 마세요.",
  },
  move: {
    편재: "이사, 출장, 점포 이동이 실제로 열립니다.",
    상관: "환경을 바꾸고 싶은 마음이 앞섭니다. 계약 전에 하자와 방향을 보세요.",
    식신: "큰 이사보다 집을 편안하게 고치는 운이 맞습니다.",
    정재: "전세와 매매 자금이 현실적으로 계산됩니다. 무리한 평수는 피하세요.",
    편관: "발령이나 갑작스러운 이동이 있습니다. 선택지가 적어도 계약 조건은 읽으세요.",
    정관: "등기와 서류가 깨끗한 공식적인 이동입니다.",
    정인: "본가와 학교 근처처럼 안정된 동네가 맞습니다. 머무름이 이사가 되기도 합니다.",
    편인: "고립된 구조의 방은 마음을 더 닫습니다. 채광과 출입부터 보세요.",
    비견: "같이 사는 사람과의 공간 분배가 주제입니다.",
    겁재: "이중 계약과 분쟁에 주의합니다. 현장을 보기 전에 송금하지 마세요.",
  },
};

const BODY = {
  목: "목 일간은 간담과 근육, 눈의 긴장에 민감합니다. 새벽 공기와 과하지 않은 신 맛이 맞습니다.",
  화: "화 일간은 심장과 수면의 열을 살펴야 합니다. 밤을 낮처럼 쓰지 않는 것이 첫 처방입니다.",
  토: "토 일간은 비위와 습기가 주제입니다. 걱정이 곧 체증이 되니 식사 시간을 고정하세요.",
  금: "금 일간은 폐와 피부, 호흡이 먼저 반응합니다. 건조한 공기와 완벽한 척하는 긴장을 낮추세요.",
  수: "수 일간은 신장과 순환, 찬 기운에 약합니다. 밤늦게 걱정을 키우지 마세요.",
};

function tableFor(category, gender) {
  if (category === "love") return gender === "male" ? LOVE_MALE : LOVE_FEMALE;
  if (category === "family") return gender === "male" ? CHILD_MALE : CHILD_FEMALE;
  return GOOD[category];
}

function yearGanzhi(year) {
  const eight = Solar.fromYmd(year, 7, 1).getLunar().getEightChar();
  return { gan: eight.getYearGan(), zhi: eight.getYearZhi() };
}

function monthGanzhi(year, month) {
  const eight = Solar.fromYmd(year, month, 15).getLunar().getEightChar();
  return { gan: eight.getMonthGan(), zhi: eight.getMonthZhi() };
}

function judge(category, chart, gan, zhi) {
  const table = tableFor(category, chart.gender);
  const tg = tenGod(chart.dayStem, gan);
  const branchGod = tenGod(chart.dayStem, mainStem(zhi));
  let score = 62 + (table[tg] || 0) * 0.75 + (table[branchGod] || 0) * 0.4;
  const relDay = branchRelation(chart.dayBranch, zhi);
  const relYear = branchRelation(chart.pillars[0].zhi, zhi);
  const stemRel = stemRelation(chart.dayStem, gan);
  if (relDay === "충") score += category === "move" ? 8 : category === "health" ? -12 : -6;
  if (relDay === "합") score += category === "love" || category === "family" ? 10 : 4;
  if (relDay === "원진") score -= category === "love" ? 6 : 3;
  if (relYear === "충" && category === "move") score += 8;
  if (stemRel === "합") score += category === "love" || category === "career" ? 6 : 2;
  if (stemRel === "충") score -= 5;
  if (zhi === chart.specials.dohwa && (category === "love" || category === "wealth")) score += 10;
  if (zhi === chart.specials.yeokma && (category === "move" || category === "career")) score += 10;
  if (zhi === chart.specials.munchang && category === "study") score += 14;
  const element = STEM_ELEMENT[gan];
  if (chart.strength.favorable.includes(element)) score += 6;
  if (chart.strength.unfavorable.includes(element)) score -= 4;
  score = clamp(score, 12, 97);
  return { score, level: levelFromScore(score), tg, relDay, stemRel, element, zhi };
}

function prose(category, chart, meta, label) {
  const lines = [`${label} ${FOCUS[category][meta.tg]}`];
  if (meta.relDay === "충") lines.push("내 자리와 부딪히는 때라 몸, 계약, 일정이 흔들립니다. 날짜를 서두르지 마세요.");
  else if (meta.relDay === "합") lines.push("사람과 약속이 자연스럽게 붙는 때입니다.");
  else if (meta.relDay === "원진") lines.push("감정은 남는데 말이 어긋나기 쉽습니다.");
  if (meta.stemRel === "합") lines.push("협력과 계약에 온기가 있습니다.");
  if (meta.stemRel === "충") lines.push("기준을 세울수록 마찰이 나니, 양보할 항목을 하나 정해 두세요.");
  if (category === "study" && meta.zhi === chart.specials.munchang) {
    lines.push("글과 시험, 자격 공부에 불이 켜지는 때입니다.");
  }
  if ((category === "love" || category === "wealth") && meta.zhi === chart.specials.dohwa) {
    lines.push("시선과 만남, 드러나는 기회가 늘어납니다.");
  }
  if ((category === "move" || category === "career") && meta.zhi === chart.specials.yeokma) {
    lines.push("출장, 이사, 자리 바꿈이 실제가 되기 쉽습니다.");
  }
  lines.push(
    chart.strength.favorable.includes(meta.element)
      ? "힘을 써도 되는 구간입니다."
      : "벌리기보다 정리하는 구간입니다.",
  );
  return lines.filter(Boolean).join(" ");
}

function opening(category, chart, engines, compat, profile) {
  const fav = chart.strength.favorable.join("·");
  if (category === "wealth") {
    return `당신은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}이고, 지금은 ${strengthPhrase(chart.strength.label)}입니다. 살림에 힘이 되는 기운은 ${favorBundlePhrase(fav, "wealth")}입니다. 집에서는 밝은·정리된 쪽을 정돈할 때 돈이 덜 새기 쉽습니다. 목은 새 일과 판로를 넓히는 힘, 화는 사람과 기회를 끌어당겨 흐름을 살리는 힘, 토는 모은 돈을 든든하게 지켜 주는 그릇(땅)의 힘입니다. 한 번에 키우기보다, 그 기운이 들어오는 해에 정산과 계약을 먼저 하세요.`;
  }
  if (category === "career") {
    return `사회생활의 기본 결은 ${chart.monthGod}입니다. 취업과 승진은 자리와 자격이 열리는 해를 보고, 이직은 이동이 실제로 붙는 해를 따로 보세요. 나가서 사람을 만나는 동선은 집의 열린 쪽을 밝게 두면 도움이 됩니다.`;
  }
  if (category === "study") {
    return `글·시험·서류가 힘을 받기 쉬운 흐름이 들어오는 달과 해에 자격과 점수 운이 열리기 쉽습니다. 루틴을 먼저 잡고, 제출·발표 날짜를 달력에 박아 두세요.`;
  }
  if (category === "love") {
    const base = chart.gender === "male"
      ? "남성에게는 생활과 책임을 나누는 인연이 배우자 운과 가깝게 읽힙니다."
      : "여성에게는 기준이 분명하고 약속이 있는 인연이 배우자 운과 가깝게 읽힙니다.";
    const married = profile?.status === "married";
    const match = compat
      ? ` 상대와의 궁합은 내부 해석 지수 ${compat.score}점(${compat.level})입니다. ${compat.lines[0]}`
      : " 상대의 생일을 넣으면 두 사람을 겹친 궁합이 여기에 붙습니다.";
    const relation = married
      ? "기혼이라면 새 혼담보다 부부 소통과 가정 화목, 가족 행사·기념일·집안 대소사를 조율하기 좋은 때를 봅니다."
      : base;
    return `${relation} 사람 운이 살아나기 쉬운 시기와 부부·관계 자리를 함께 보면 흐름이 또렷해집니다.${match}`;
  }
  if (category === "health") {
    return `${BODY[chart.dayElement]} 내부 해석 지수가 낮아지는 해에는 검진·휴식 일정을 먼저 잡아 두세요. 진료·수술 일정은 운세가 아니라 의료진의 판단에 따르세요.`;
  }
  if (category === "family") {
    const rule = chart.gender === "male" ? "남성에게는 원칙과 역할이 자녀·가족 운과 가깝게 읽힙니다." : "여성에게는 먹이고 돌보는 시간이 자녀·가족 운과 가깝게 읽힙니다.";
    return `${rule} 가족 분위기는 내 자리 ${chart.pillars[2].gzKo}와 부딪히거나 맞을 때를 같이 보면 됩니다. 자녀 성향은 확정이 아니라 전통 해석의 경향으로만 참고하세요.`;
  }
  return `집에서는 살림·장부는 밝은 쪽, 출입·책상은 열린 쪽, 휴식은 조용한 쪽에 두면 동선이 편해지기 쉽습니다. 잠자리 앞에는 버리는 물건을 오래 쌓아 두지 마세요.`;
}

function traditionEvidence(id, chart, engines) {
  const zi = engines.ziwei.lookup;
  const door = engines.qimen.doors;
  if (id === "wealth") return `자미 재백궁 · ${zi.재백궁} / 기문 생문 · ${door.생문}`;
  if (id === "career") return `자미 관록궁 · ${zi.관록궁} / 기문 개문 · ${door.개문}`;
  if (id === "study") return `문창 · ${koGz(chart.specials.munchang)} / 자미 명궁 · ${zi.명궁}`;
  if (id === "love") return `도화 · ${koGz(chart.specials.dohwa)} / 자미 부처궁 · ${zi.부처궁}`;
  if (id === "health") return `자미 질액궁 · ${zi.질액궁}`;
  if (id === "family") return `자미 자녀궁 · ${zi.자녀궁}`;
  return `자미 전택궁 · ${zi.전택궁} / 생문 ${door.생문} · 개문 ${door.개문} · 휴문 ${door.휴문} · 사문 ${door.사문} · 직부 ${door.직부}`;
}

function audience(id, profile) {
  if (!profile) return "";
  if (id === "wealth") return `${profile.roleLabel}으로 보면 ${profile.wealth}`;
  if (id === "love") return `${profile.statusLabel}으로 보면 ${profile.love}`;
  if (id === "career" || id === "study") return `${profile.roleLabel}에게 ${profile.career}`;
  if (id === "family" && profile.status === "married") return "기혼이라면 배우자와 자녀의 일정을 한 달력에 두세요.";
  if (id === "family") return "미혼이라면 가족운은 부모, 형제와의 거리와 독립 시점을 봅니다.";
  return "";
}

export function buildForecast(chart, engines, compat, profile) {
  const now = new Date().getFullYear();
  const start = Math.max(now, chart.solar.year);
  const years = Array.from({ length: 12 }, (_, index) => start + index);
  const ids = ["wealth", "career", "study", "love", "health", "family", "move"];

  return ids.map((id) => {
    const yearRows = years.map((year) => {
      const gz = yearGanzhi(year);
      const meta = judge(id, chart, gz.gan, gz.zhi);
      return {
        year,
        age: year - chart.solar.year + 1,
        gzKo: koGz(`${gz.gan}${gz.zhi}`),
        score: meta.score,
        level: meta.level,
        text: easeSentence(prose(id, chart, meta, `${year}년 ${koGz(`${gz.gan}${gz.zhi}`)}.`), { wealth: id === "wealth" }),
      };
    });
    const months = {};
    years.forEach((year) => {
      months[year] = Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const gz = monthGanzhi(year, month);
        const meta = judge(id, chart, gz.gan, gz.zhi);
        const label = monthMeta(year, month, gz.gan, gz.zhi);
        return {
          ...label,
          score: meta.score,
          level: meta.level,
          text: easeSentence(prose(id, chart, meta, `${year}년 ${month}월 ${label.jieqiLabel}.`), { wealth: id === "wealth" }),
        };
      });
    });
    const married = profile?.status === "married";
    let title = TITLES[id];
    if (id === "love") title = married ? "부부 · 가정 화목" : "연애 · 궁합과 관계";
    if (id === "family") title = married ? "가족 · 자녀 돌봄" : "자녀 인연 · 가족";
    const category = {
      id,
      title,
      summary: easeSentence([audience(id, profile), opening(id, chart, engines, compat, profile)].filter(Boolean).join(" "), {
        wealth: id === "wealth",
      }),
      traditionNote: traditionEvidence(id, chart, engines),
      years: yearRows,
      months,
    };
    if (id === "love") {
      const picked = [...yearRows].sort((a, b) => b.score - a.score).slice(0, 3);
      category.timing = picked.filter((item) => item.score >= 74);
      category.timingNote = easeSentence(
        category.timing.length
          ? married
            ? `부부 소통과 가정 화목이 무난한 시기는 ${category.timing.map((item) => `${item.year}년(${item.level})`).join(", ")}입니다. 가족 행사·기념일·집안 대소사를 조율하기 좋은 해로 읽으면 됩니다.`
            : `혼담을 열기 좋은 해는 ${category.timing.map((item) => `${item.year}년(${item.level})`).join(", ")}입니다. 점수가 높아도 상대의 10년 흐름과 겹쳐야 날짜가 됩니다.`
          : married
            ? `앞으로 12년 안에 확 밝아지는 해는 드뭅니다. 가장 높은 ${picked[0].year}년에도 부부 소통과 생활 리듬을 다듬는 쪽이 맞습니다.`
            : `앞으로 12년 안에 확 밝아지는 해는 드뭅니다. 가장 높은 ${picked[0].year}년에도 관계를 다듬는 쪽이 맞습니다.`,
      );
    }
    return category;
  });
}
