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

/**
 * 리포트 문장에 오행·신유·편관 풀이를 붙입니다.
 * wealth가 true이면 목·화·토는 재물 뜻으로 풉니다.
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

  let sinyuExplained = out.includes("예리하게 다듬어진 쇠");
  out = out.replace(/신유(?!\(辛酉)/g, () => {
    if (sinyuExplained) return "신유(辛酉)";
    sinyuExplained = true;
    return "신유(辛酉, 예리하게 다듬어진 쇠와 결실의 기운으로, 기준이 뚜렷하고 꼼꼼하며 일을 깔끔하게 마무리하는 성향)";
  });

  let officerExplained = out.includes("현장에서 부딪쳐 헤쳐");
  out = out.replace(/편관(?!\(책임감)/g, () => {
    if (officerExplained) return "편관";
    officerExplained = true;
    return "편관(책임감과 추진력, 현장에서 부딪쳐 헤쳐 나가는 힘이자 동시에 스스로에게 주는 압박·긴장감)";
  });

  return out;
}

export function easeLines(lines, options) {
  return (lines || []).map((line) => easeSentence(line, options));
}
