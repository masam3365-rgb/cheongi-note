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
import { easeSentence } from "./plainTerms.js";

const WEALTH_W = { 정재: 12, 편재: 10, 식신: 8, 정관: 4, 정인: 2, 상관: 3, 편관: -3, 편인: 0, 비견: -4, 겁재: -12 };
const CAREER_W = { 정관: 12, 편관: 8, 정인: 7, 편인: 5, 식신: 6, 상관: 4, 정재: 3, 편재: 2, 비견: -2, 겁재: -6 };
const LOVE_W = { 식신: 8, 상관: 6, 정재: 5, 편재: 7, 정관: 4, 편관: -2, 정인: 3, 편인: 1, 비견: 2, 겁재: -8 };

const WEALTH_TEXT = {
  정재: "들어올 돈을 청구·정산하기 좋은 해입니다. 고정 수입과 장부부터 챙기세요.",
  편재: "소개와 바깥 기회에서 돈이 움직입니다. 작은 거래도 계약서로 남기세요.",
  식신: "만든 결과물이 수입이 됩니다. 시연·포트폴리오를 보여 주세요.",
  상관: "아이디어는 빠른데 지출도 빠릅니다. 견적과 마감을 같이 적으세요.",
  정관: "세금·보험·공식 서류가 돈을 지켜 줍니다. 기한을 먼저 보세요.",
  편관: "급한 일이 수입이 될 수 있습니다. 역할 범위를 글로 남겨 두세요.",
  정인: "자격과 문서가 나중에 돈이 됩니다. 당장의 현금보다 간판을 쌓으세요.",
  편인: "남이 안 보는 자료에서 답이 납니다. 혼자 파는 기술에 시간을 쓰세요.",
  비견: "내 몫을 지키는 해입니다. 같이 하는 돈은 지분을 먼저 적으세요.",
  겁재: "빌려 주기·보증·충동 투자가 새기 쉽습니다. 큰돈은 하루 자고 결정하세요.",
};

const CAREER_TEXT = {
  정재: "실무 정산과 성과 기록이 점수가 됩니다. 숫자로 남기세요.",
  편재: "외부 미팅과 영업이 기회를 엽니다. 한 건만 끝까지 밀어 보세요.",
  식신: "손기술·콘텐츠·결과물이 인정받습니다. 초안을 빨리 보여 주세요.",
  상관: "발표와 제안이 눈에 띕니다. 말투는 한 톤 낮추고 근거를 붙이세요.",
  정관: "지원·면접·승진·계약 도장에 유리합니다. 공식 루트를 타세요.",
  편관: "급한 보직·압박 업무가 옵니다. 권한과 마감을 먼저 확인하세요.",
  정인: "공부·자격·멘토가 다음 자리를 엽니다. 자료만 모으다 끝내지 마세요.",
  편인: "특수 분야·혼자 파는 기술이 맞습니다. 계산은 한 사람에게 보여 주세요.",
  비견: "동료와 역할을 나누면 속도가 납니다. 내 영역을 한 줄로 말해 두세요.",
  겁재: "경쟁이 센 해입니다. 새 판보다 기존 자리를 지키는 쪽이 이득입니다.",
};

const LOVE_TEXT = {
  정재: "약속과 생활비가 관계의 중심입니다. 일정과 돈을 같이 적으세요.",
  편재: "소개와 모임에서 사람이 붙습니다. 다음 약속을 그 자리에서 정하세요.",
  식신: "먹고 나누는 자리가 관계가 됩니다. 식사 한 끼를 먼저 잡으세요.",
  상관: "솔직한 말이 지적처럼 들릴 수 있습니다. 짧은 대화로 끊으세요.",
  정관: "예의를 지키면 윗사람과 인연이 편해집니다. 호칭과 기한을 지키세요.",
  편관: "압박이 말로 나옵니다. 중요한 이야기는 감정이 식은 뒤 하세요.",
  정인: "도와주는 사람이 붙습니다. 감사와 기한을 분명히 하세요.",
  편인: "혼자 있고 싶어집니다. 단톡보다 한 사람과 짧게 만나세요.",
  비견: "비슷한 처지의 동료와 마음이 맞습니다. 비교 말은 줄이세요.",
  겁재: "비교와 서운함이 커지기 쉽습니다. 편 들기 전에 사실부터 들으세요.",
};

function yearGanzhi(year) {
  const eight = Solar.fromYmd(year, 7, 1).getLunar().getEightChar();
  return { gan: eight.getYearGan(), zhi: eight.getYearZhi() };
}

function scoreAxis(chart, gan, zhi, weights) {
  const tg = tenGod(chart.dayStem, gan);
  const branchGod = tenGod(chart.dayStem, mainStem(zhi));
  let score = 60 + (weights[tg] || 0) * 0.7 + (weights[branchGod] || 0) * 0.35;
  const relDay = branchRelation(chart.dayBranch, zhi);
  const stemRel = stemRelation(chart.dayStem, gan);
  if (relDay === "충") score -= 7;
  if (relDay === "합") score += 6;
  if (relDay === "원진") score -= 4;
  if (stemRel === "합") score += 4;
  if (stemRel === "충") score -= 4;
  const element = STEM_ELEMENT[gan];
  if (chart.strength.favorable.includes(element)) score += 5;
  if (chart.strength.unfavorable.includes(element)) score -= 4;
  if (zhi === chart.specials?.dohwa) score += 4;
  if (zhi === chart.specials?.yeokma) score += 3;
  if (zhi === chart.specials?.munchang) score += 3;
  return clamp(Math.round(score), 14, 96);
}

function overallMeta(chart, gan, zhi) {
  const tg = tenGod(chart.dayStem, gan);
  let score = Math.round(
    (scoreAxis(chart, gan, zhi, WEALTH_W) + scoreAxis(chart, gan, zhi, CAREER_W) + scoreAxis(chart, gan, zhi, LOVE_W)) / 3,
  );
  const relDay = branchRelation(chart.dayBranch, zhi);
  if (relDay === "충") score -= 3;
  if (relDay === "합") score += 2;
  score = clamp(score, 14, 96);
  return { tg, score, level: levelFromScore(score), relDay };
}

function starsFromScore(score) {
  if (score >= 85) return 5;
  if (score >= 74) return 4;
  if (score >= 62) return 3;
  if (score >= 50) return 2;
  return 1;
}

function headline(year, gzKo, meta, age) {
  if (meta.score >= 78) {
    return `${year}년(${gzKo}년)은 세는나이 ${age}세, 문을 열어도 되는 해입니다. 미뤄 둔 일을 하나씩 꺼내세요.`;
  }
  if (meta.score >= 64) {
    return `${year}년(${gzKo}년)은 세는나이 ${age}세, 차근히 쌓는 해입니다. 한 가지만 끝까지 하세요.`;
  }
  if (meta.score >= 50) {
    return `${year}년(${gzKo}년)은 세는나이 ${age}세, 지키는 해입니다. 벌리기보다 정리와 확인이 이득입니다.`;
  }
  return `${year}년(${gzKo}년)은 세는나이 ${age}세, 속도를 낮출 해입니다. 큰 약속은 미루고 몸과 서류를 먼저 보세요.`;
}

function loveTextFor(profile, tg) {
  const base = LOVE_TEXT[tg] || "관계는 긴 설명보다 짧은 확인이 도움이 됩니다.";
  if (profile?.status === "married") {
    return `${base} 기혼이라면 배우자와 생활 달력을 같이 쓰는 쪽이 온도를 올립니다.`;
  }
  return `${base} 미혼이라면 한 사람과 다음 약속을 구체적으로 정하세요.`;
}

export function buildTenYearFortune(chart, profile, startYear = new Date().getFullYear()) {
  const years = Array.from({ length: 10 }, (_, index) => startYear + index);
  const rows = years.map((year) => {
    const gz = yearGanzhi(year);
    const gzKo = koGz(`${gz.gan}${gz.zhi}`);
    const meta = overallMeta(chart, gz.gan, gz.zhi);
    const wealthScore = scoreAxis(chart, gz.gan, gz.zhi, WEALTH_W);
    const careerScore = scoreAxis(chart, gz.gan, gz.zhi, CAREER_W);
    const loveScore = scoreAxis(chart, gz.gan, gz.zhi, LOVE_W);
    const age = year - chart.solar.year + 1;
    const tg = meta.tg;

    return {
      year,
      age,
      gan: gz.gan,
      zhi: gz.zhi,
      gz: `${gz.gan}${gz.zhi}`,
      gzKo,
      gzLabel: `${gzKo}년`,
      gzFull: `${gzKo}년(${gz.gan}${gz.zhi})`,
      score: meta.score,
      level: meta.level,
      stars: starsFromScore(meta.score),
      headline: easeSentence(headline(year, gzKo, meta, age)),
      wealth: {
        score: wealthScore,
        level: levelFromScore(wealthScore),
        text: easeSentence(WEALTH_TEXT[tg] || "돈은 크게 벌기보다 새는 구멍을 막는 해가 맞습니다.", { wealth: true }),
      },
      career: {
        score: careerScore,
        level: levelFromScore(careerScore),
        text: easeSentence(CAREER_TEXT[tg] || "일은 새 판보다 맡은 일을 끝까지 마무리하세요."),
      },
      love: {
        score: loveScore,
        level: levelFromScore(loveScore),
        text: easeSentence(loveTextFor(profile, tg)),
      },
    };
  });

  const best = [...rows].sort((a, b) => b.score - a.score)[0];
  const hard = [...rows].sort((a, b) => a.score - b.score)[0];

  return {
    startYear,
    endYear: startYear + 9,
    summary: easeSentence(`${startYear}년부터 ${startYear + 9}년까지 열 번의 세운입니다. 비교적 밝은 해는 ${best.year}년(${best.gzLabel}), 숨을 고를 해는 ${hard.year}년(${hard.gzLabel})입니다.`),
    years: rows,
  };
}
