import { mainStem, tenGod } from "./ganzhi.js";

const GENERAL = {
  목: "목(성장·시작·나무)",
  화: "화(열정·표현·불)",
  토: "토(안정·신뢰·땅)",
  금: "금(결단·정리·쇠)",
  수: "수(지혜·유연함·물)",
};

const MONEY = {
  목: "목(새 일과 판로를 넓히는 힘)",
  화: "화(사람과 기회를 끌어당겨 흐름을 살리는 힘)",
  토: "토(모은 돈을 든든하게 지켜 주는 그릇·땅의 힘)",
};

const PARTICLE = /^(은|는|이|가|을|를|과|와|의|도|만|에|으로|이라|이고|입니다|인|이나|이란)(?![가-힣])/;

/** 십신 10종 — 한자 뜻·비유·강점·주의 */
export const TEN_GOD_GLOSS = {
  비견: {
    hanja: "比肩",
    meaning: "어깨를 나란히 한다",
    short: "나와 같은 쌍둥이·동료 기운",
    detail:
      "나와 똑같은 쌍둥이·동료 같은 기운으로, 주체성·독립심·자존심·수평적 태도를 상징합니다.",
    strength: "추진력과 뚝심",
    caution: "혼자 다 떠안아 지치거나 역할 분담이 모호하면 자존심 싸움이 나기 쉽습니다",
  },
  겁재: {
    hanja: "劫財",
    meaning: "재물을 다투며 돌파한다",
    short: "경쟁자·승부사 기운",
    detail: "경쟁자와 승부사의 기운으로, 목표를 향한 돌파력과 재치를 상징합니다.",
    strength: "위기 돌파와 승부욕",
    caution: "무리한 경쟁이나 충동 지출에 주의하세요",
  },
  식신: {
    hanja: "食神",
    meaning: "복을 먹여 기른다",
    short: "복록·표현·장인 기운",
    detail: "복록과 표현·탐구의 기운으로, 한 우물을 깊게 파는 장인 정신과 여유를 상징합니다.",
    strength: "꾸준한 생산력과 온화한 매력",
    caution: "안주하거나 게을러지기 쉽습니다",
  },
  상관: {
    hanja: "傷官",
    meaning: "틀을 깨고 표현한다",
    short: "재치·언변·창의 기운",
    detail: "재치와 언변, 기존 틀을 깨는 창의력의 기운입니다.",
    strength: "뛰어난 순발력과 기획·표현력",
    caution: "직설적인 말투로 구설에 오르기 쉽습니다",
  },
  편재: {
    hanja: "偏財",
    meaning: "크게 흘러가는 재물",
    short: "사업·유통·큰 판의 기운",
    detail: "큰 판을 굴리는 사업가·유통·공간 감각의 기운입니다.",
    strength: "빠른 기회 포착과 대인 수완",
    caution: "들어오는 만큼 나가는 큰 지출 관리가 필요합니다",
  },
  정재: {
    hanja: "正財",
    meaning: "바르게 쌓는 재물",
    short: "성실·안정 재물 기운",
    detail: "꼼꼼하게 쌓아 올리는 안정적 재물과 성실함의 기운입니다.",
    strength: "알뜰한 자산 관리와 신뢰",
    caution: "지나친 계산이나 소심함에 주의하세요",
  },
  편관: {
    hanja: "偏官",
    meaning: "거친 책임·해결",
    short: "카리스마·해결사 기운",
    detail: "카리스마와 책임감, 어려운 난제를 해결하는 해결사의 기운입니다.",
    strength: "강한 결단력과 돌파력",
    caution: "과도한 스트레스와 압박감에 주의하세요",
  },
  정관: {
    hanja: "正官",
    meaning: "바른 질서·명예",
    short: "원칙·명예·신뢰 기운",
    detail: "원칙과 명예, 합리적인 질서와 신뢰의 기운입니다.",
    strength: "반듯한 조직 적응력과 사회적 신용",
    caution: "체면과 규칙에 얽매여 유연성이 부족해질 수 있습니다",
  },
  편인: {
    hanja: "偏印",
    meaning: "남다른 배움·직관",
    short: "직관·특수 통찰 기운",
    detail: "남다른 직관과 특수 분야 통찰력, 예술·기획 감각의 기운입니다.",
    strength: "독창적 아이디어와 눈치",
    caution: "생각이 너무 많아 실행이 늦어지기 쉽습니다",
  },
  정인: {
    hanja: "正印",
    meaning: "바르게 기르는 배움",
    short: "배움·문서·인덕 기운",
    detail: "배움과 문서, 따뜻한 수용력과 윗사람 복의 기운입니다.",
    strength: "학습 능력과 인덕",
    caution: "의존심이나 결단 지연에 주의하세요",
  },
  일원: {
    hanja: "日主",
    meaning: "하루의 주인",
    short: "나의 중심 기운(일간)",
    detail: "사주의 중심인 나 자신(일간)을 가리킵니다.",
    strength: "자기 기준이 또렷해짐",
    caution: "기준만 세우고 실행이 없으면 공회전하기 쉽습니다",
  },
};

/** 12운성 */
export const DISHI_GLOSS = {
  장생: {
    hanja: "長生",
    meaning: "새로 태어남",
    short: "시작·희망이 붙는 호흡",
    detail: "기운이 막 피어나는 단계로, 새 일과 배움이 잘 붙습니다.",
    strength: "시작의 용기",
    caution: "끝내기 전에 또 벌리기 쉽습니다",
  },
  목욕: {
    hanja: "沐浴",
    meaning: "씻어 단장함",
    short: "매력·노출·예민한 호흡",
    detail: "씻고 단장하는 단계로, 매력과 관심은 커지지만 예민해지기 쉽습니다.",
    strength: "사람·표현의 매력",
    caution: "시선과 평가에 흔들리기 쉽습니다",
  },
  관대: {
    hanja: "冠帶",
    meaning: "관을 쓰고 띠를  Mand",
    short: "단장·준비·격식의 호흡",
    detail: "차려입고 무대에 설 준비를 하는 단계입니다.",
    strength: "준비와 예의",
    caution: "겉치레에 힘을 빼앗길 수 있습니다",
  },
  건록: {
    hanja: "臨官",
    meaning: "자리에 나아가 녹을 받음",
    short: "실무·자리·녹봉의 호흡",
    detail: "실무 자리에 붙어 녹을 받는 단계로, 일과 책임이 또렷합니다.",
    strength: "실무 추진력",
    caution: "과로·과신을 조심하세요",
  },
  제왕: {
    hanja: "帝旺",
    meaning: "가장 왕성한 때",
    short: "정점·추진의 호흡",
    detail: "기운이 가장 센 정점입니다. 밀어붙이면 성과가 큽니다.",
    strength: "폭발적 추진",
    caution: "과속·독단을 조심하세요",
  },
  쇠: {
    hanja: "衰",
    meaning: "기운이 한풀 꺾임",
    short: "속도 조절의 호흡",
    detail: "정점 이후 한풀 꺾이는 단계로, 정리와 위임이 이득입니다.",
    strength: "선택과 집중",
    caution: "무리한 확장은 피하세요",
  },
  병: {
    hanja: "病",
    meaning: "앓으며 점검함",
    short: "점검·회복이 필요한 호흡",
    detail: "몸과 일을 점검해야 하는 단계입니다.",
    strength: "문제 조기 발견",
    caution: "방치하면 커집니다. 휴식·검진을 우선하세요",
  },
  사: {
    hanja: "死",
    meaning: "한 사이클이 끝남",
    short: "마무리·정리의 호흡",
    detail: "한 판이 끝나는 단계로, 마감·정리·이별이 주제입니다.",
    strength: "깔끔한 매듭",
    caution: "질질 끌면 소모만 큽니다",
  },
  묘: {
    hanja: "墓",
    meaning: "창고에 갈무리함",
    short: "저장·잠복의 호흡",
    detail: "창고에 넣어 두는 단계로, 쌓고 지키는 일이 맞습니다.",
    strength: "저축·자료 축적",
    caution: "너무 가두면 기회가 굳습니다",
  },
  절: {
    hanja: "絕",
    meaning: "끊기고 비움",
    short: "비움·전환의 호흡",
    detail: "끊고 비우는 단계로, 새 판을 위해 내려놓는 때입니다.",
    strength: "과감한 정리",
    caution: "감정적인 단절은 피하세요",
  },
  태: {
    hanja: "胎",
    meaning: "씨앗이 맺힘",
    short: "씨앗·구상의 호흡",
    detail: "아직 드러나지 않은 씨앗 단계로, 구상과 계획이 핵심입니다.",
    strength: "기획력",
    caution: "말만 많고 실행이 없을 수 있습니다",
  },
  양: {
    hanja: "養",
    meaning: "품어 기름",
    short: "양육·대기·회복의 호흡",
    detail: "품어 기르는 단계로, 대기와 회복·학습이 맞습니다.",
    strength: "인내와 준비",
    caution: "무기한 대기는 독이 됩니다. 기한을 정하세요",
  },
};

/** 신살·공망 */
export const SHENSHA_GLOSS = {
  문창: {
    hanja: "文昌",
    meaning: "글과 학문이 빛나는 별",
    short: "공부·서류·글의 복",
    detail: "공부·시험·서류·글이 붙기 쉬운 기운입니다.",
    strength: "학습·문서 성과",
    caution: "자료만 모으다 제출·발표를 미루지 마세요",
  },
  도화: {
    hanja: "桃花",
    meaning: "복숭아꽃처럼 사람을 끈다",
    short: "매력·소개·인연의 복",
    detail: "사람·매력·소개가 붙기 쉬운 기운입니다.",
    strength: "인맥과 호감",
    caution: "가벼운 만남이 오해로 번지지 않게 선을 지키세요",
  },
  역마: {
    hanja: "驛馬",
    meaning: "역참의 말처럼 달린다",
    short: "이동·출장·변화의 복",
    detail: "이동·출장·이사·이직이 붙기 쉬운 기운입니다.",
    strength: "환경 전환·확장",
    caution: "잦은 이동만으로 해결하려 하면 뿌리가 약해집니다",
  },
  공망: {
    hanja: "空亡",
    meaning: "비어 흔들리기 쉬운 자리",
    short: "약속이 느슨해지기 쉬운 자리",
    detail: "비어 있어 약속·계획이 느슨해지기 쉬운 자리입니다. 중요한 날짜는 문자로 한 번 더 확인하세요.",
    strength: "집착을 내려놓는 여유",
    caution: "확인·재약속 없이 넘기면 신뢰가 샌다",
  },
};

function glossOf(element, wealth) {
  if (wealth && MONEY[element]) return MONEY[element];
  return GENERAL[element] || element;
}

function alreadyTold(next, element, wealth) {
  if (element === "목" && next.startsWith("·어깨")) return true;
  const head = next.split(/[.]/)[0].slice(0, 48);
  if (wealth && element === "목" && head.includes("판로를 넓히는")) return true;
  if (wealth && element === "화" && head.includes("흐름을 살리는")) return true;
  if (wealth && element === "토" && head.includes("지켜 주는 그릇")) return true;
  if (element === "목" && head.includes("성장·시작")) return true;
  if (element === "화" && head.includes("열정·표현")) return true;
  if (element === "토" && head.includes("안정·신뢰")) return true;
  if (element === "금" && head.includes("결단·정리")) return true;
  if (element === "수" && head.includes("지혜·유연")) return true;
  return false;
}

function fullInline(entry, name) {
  return `${name}(${entry.hanja}, ${entry.meaning} — ${entry.detail} 강점: ${entry.strength}. 주의: ${entry.caution}.)`;
}

function shortInline(entry, name) {
  return `${name}(${entry.hanja}·${entry.short})`;
}

/** 본문용 짧은 라벨 (도표 셀 등) */
export function termChip(name) {
  if (!name || name === "—") return name || "—";
  const entry = TEN_GOD_GLOSS[name] || DISHI_GLOSS[name] || SHENSHA_GLOSS[name];
  if (!entry) return name;
  return `${name}(${entry.short})`;
}

/** 표/박스용 한 줄 요약 */
export function termSummaryLine(name) {
  const entry = TEN_GOD_GLOSS[name] || DISHI_GLOSS[name] || SHENSHA_GLOSS[name];
  if (!entry) return name;
  return `${name}(${entry.hanja}) · ${entry.short} · 강점 ${entry.strength} · 주의 ${entry.caution}`;
}

/**
 * 리포트 문장에 오행·십신·12운성·신살 풀이를 붙입니다.
 * 같은 용어는 첫 등장에 자세히, 이후에는 짧게 표기합니다.
 */
export function easeSentence(text, { wealth = false } = {}) {
  if (!text || typeof text !== "string") return text;
  let out = text.replace(/오행\(목·화·토·금·수\)/g, "오행");

  out = out.replace(/([갑을병정무기경신임계])([목화토금수])(?!\()/g, (full, stem, element, offset, source) => {
    const next = source.slice(offset + full.length);
    if (alreadyTold(next, element, wealth)) return full;
    const gloss = glossOf(element, wealth);
    return gloss.startsWith(element) ? `${stem}${gloss}` : full;
  });

  out = out.replace(/(^|[^가-힣])([목화토금수])(?!\()/g, (full, pre, element, offset, source) => {
    const next = source.slice(offset + pre.length + element.length);
    if (alreadyTold(next, element, wealth)) return full;
    if (/^[가-힣]/.test(next) && !PARTICLE.test(next)) return full;
    return `${pre}${glossOf(element, wealth)}`;
  });

  const seen = new Set();
  const PARTICLE_AFTER =
    /^(은|는|이|가|을|를|과|와|의|도|만|에|으로|이라|이고|인|이나|이란|처럼|같은|이며|부터|까지|보다|하고|하여|해서|하면|하며|입니다|인가|인지|에가|에도|에서는|으로도)(?![가-힣])/;

  const replaceTerm = (source, name, replacer) => {
    let i = 0;
    let result = "";
    while (i < source.length) {
      const idx = source.indexOf(name, i);
      if (idx < 0) {
        result += source.slice(i);
        break;
      }
      const before = idx > 0 ? source[idx - 1] : "";
      const afterStart = idx + name.length;
      const after = source.slice(afterStart);
      const beforeOk = !before || !/[가-힣]/.test(before);
      if (after.startsWith("(")) {
        result += source.slice(i, afterStart);
        i = afterStart;
        continue;
      }
      const afterOk = after.length === 0 || !/^[가-힣]/.test(after) || PARTICLE_AFTER.test(after);
      // 태도·태양 등 단어 중간 글자(태) 오치환 방지
      if (beforeOk && afterOk) {
        result += source.slice(i, idx) + replacer();
        i = afterStart;
      } else {
        result += source.slice(i, afterStart);
        i = afterStart;
      }
    }
    return result;
  };

  const applyDict = (dict) => {
    const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const name of keys) {
      const entry = dict[name];
      out = replaceTerm(out, name, () => {
        if (seen.has(name)) return shortInline(entry, name);
        seen.add(name);
        return fullInline(entry, name);
      });
    }
  };

  applyDict(TEN_GOD_GLOSS);
  applyDict(DISHI_GLOSS);
  applyDict(SHENSHA_GLOSS);

  return out;
}

export function easeLines(lines, options) {
  return (lines || []).map((line) => easeSentence(line, options));
}

/** 명식에 실제로 등장하는 용어만 수집 */
export function collectChartTerms(chart) {
  const gods = new Set();
  const dishi = new Set();
  const shensha = new Set();

  (chart?.pillars || []).forEach((pillar) => {
    if (pillar.shiShen && TEN_GOD_GLOSS[pillar.shiShen]) gods.add(pillar.shiShen);
    if (pillar.diShi && DISHI_GLOSS[pillar.diShi]) dishi.add(pillar.diShi);
    if (chart?.dayStem && pillar.zhi) {
      const branchGod = tenGod(chart.dayStem, mainStem(pillar.zhi));
      if (branchGod && TEN_GOD_GLOSS[branchGod]) gods.add(branchGod);
    }
  });
  if (chart?.monthGod && TEN_GOD_GLOSS[chart.monthGod]) gods.add(chart.monthGod);

  const specials = chart?.specials || {};
  if (specials.munchang) shensha.add("문창");
  if (specials.dohwa) shensha.add("도화");
  if (specials.yeokma) shensha.add("역마");
  if (chart?.xunKong) shensha.add("공망");

  return {
    gods: [...gods],
    dishi: [...dishi],
    shensha: [...shensha],
  };
}
