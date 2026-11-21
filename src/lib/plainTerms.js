import { mainStem, tenGod } from "./ganzhi.js";

/** 오행 한눈에 보기(용어 가이드 표) */
export const WUXING_GUIDE = {
  목: {
    hanja: "木",
    nature: "나무·새싹처럼 자라고 뻗는 힘. 시작·배움·확장을 상징합니다.",
    strength: "새로운 일을 열고, 사람과 기회를 키워 냄",
    caution: "벌리기만 하고 마무리가 약해질 수 있음",
  },
  화: {
    hanja: "火",
    nature: "불·빛처럼 드러내고 연결하는 힘. 열정·표현·인기를 상징합니다.",
    strength: "분위기·말·발표로 사람을 움직임",
    caution: "과열·감정 소모·말의 속도를 조심",
  },
  토: {
    hanja: "土",
    nature: "땅·그릇처럼 담고 버티는 힘. 신뢰·안정·중재를 상징합니다.",
    strength: "약속을 지키고 기반을 단단히 함",
    caution: "변화가 늦거나 고집스러워질 수 있음",
  },
  금: {
    hanja: "金",
    nature: "쇠·칼처럼 다듬고 마감하는 힘. 결단·원칙·정산을 상징합니다.",
    strength: "결과를 맺고 기준을 세움",
    caution: "너무 날카롭거나 계산적으로 보일 수 있음",
  },
  수: {
    hanja: "水",
    nature: "물처럼 흐르고 스며드는 힘. 지혜·유연·타이밍을 상징합니다.",
    strength: "관찰·전략·상황 적응",
    caution: "우유부단하거나 흐름에만 맡기기 쉬움",
  },
};

/** 장 주제별 오행 짧은 풀이 (본문 괄호용) */
const ELEMENT_BY_TOPIC = {
  default: {
    목: "성장과 시작의 힘",
    화: "열정과 표현의 힘",
    토: "안정과 신뢰의 힘",
    금: "결단과 정산으로 결과를 맺는 힘",
    수: "지혜와 유연함의 힘",
  },
  origin: {
    목: "나를 키우는 성장·시작의 힘",
    화: "나를 드러내는 열정·표현의 힘",
    토: "나를 받쳐 주는 안정·신뢰의 힘",
    금: "나를 다듬는 결단·원칙의 힘",
    수: "나를 흐르게 하는 지혜·유연의 힘",
  },
  wealth: {
    목: "새 수입원·판로를 키우는 힘",
    화: "사람과 기회로 돈이 도는 힘",
    토: "모은 돈을 지켜 주는 그릇",
    금: "결단과 정산으로 결과를 맺는 힘",
    수: "흐름·타이밍으로 돈을 읽는 힘",
  },
  career: {
    목: "새 역할·배움을 키우는 힘",
    화: "보고·발표로 티 내는 힘",
    토: "조직 신뢰를 쌓는 힘",
    금: "성과를 마감·평가로 맺는 힘",
    수: "전략과 타이밍으로 자리를 고르는 힘",
  },
  business: {
    목: "사업 판을 키우는 힘",
    화: "홍보·영업으로 판을 밝히는 힘",
    토: "고정비·기반을 지키는 힘",
    금: "계약·정산으로 마감하는 힘",
    수: "시장 흐름을 읽는 힘",
  },
  marriage: {
    목: "관계를 키우고 돌보는 힘",
    화: "온기와 표현으로 가까운 힘",
    토: "생활·약속을 함께 지키는 힘",
    금: "기준과 선을 분명히 하는 힘",
    수: "감정을 유연하게 조율하는 힘",
  },
  compatibility: {
    목: "서로의 성장을 돕는 힘",
    화: "말과 온기로 맞추는 힘",
    토: "생활 리듬을 맞추는 힘",
    금: "역할·경계를 나누는 힘",
    수: "타이밍과 양보로 흐르는 힘",
  },
  children: {
    목: "아이를 키우고 가르치는 힘",
    화: "칭찬·표현으로 북돋는 힘",
    토: "안정된 돌봄의 힘",
    금: "규칙과 책임을 세우는 힘",
    수: "눈높이로 맞춰 주는 힘",
  },
  health: {
    목: "회복·스트레칭처럼 펴는 힘",
    화: "순환·활력을 올리는 힘",
    토: "소화·안정을 지키는 힘",
    금: "정리·절제로 몸을 다스리는 힘",
    수: "휴식·수분·유연함의 힘",
  },
  moving: {
    목: "새 터전을 키우는 힘",
    화: "집의 밝기·인기 동선의 힘",
    토: "집터·기반을 고르는 힘",
    금: "계약·서류로 마감하는 힘",
    수: "이동 타이밍을 보는 힘",
  },
  travel: {
    목: "여행·배움의 확장을 여는 힘",
    화: "사람과 풍경을 즐기는 힘",
    토: "일정·숙소를 안정시키는 힘",
    금: "경비·계획을 다잡는 힘",
    수: "동선과 타이밍을 흐르게 하는 힘",
  },
  year: {
    목: "한 해의 시작·확장을 여는 힘",
    화: "한 해의 표현·인연을 밝히는 힘",
    토: "한 해의 기반을 지키는 힘",
    금: "한 해의 성과를 마감하는 힘",
    수: "한 해의 흐름을 읽는 힘",
  },
  timing: {
    목: "이 달의 시작·확장 기운",
    화: "이 달의 표현·인연 기운",
    토: "이 달의 안정·정리 기운",
    금: "이 달의 결단·마감 기운",
    수: "이 달의 유연·조율 기운",
  },
};

const TEN_GOD_TOPIC_SHORT = {
  default: {
    비견: "나와 같은 동료·주체성의 힘",
    겁재: "승부욕과 돌파력",
    식신: "꾸준히 만들어내는 힘",
    상관: "재치와 언변으로 틀을 깨는 힘",
    편재: "큰 판과 기회를 굴리는 힘",
    정재: "성실하게 쌓는 재물 감각",
    편관: "책임감과 돌파력",
    정관: "원칙과 명예·질서의 힘",
    편인: "직관과 특수 통찰의 힘",
    정인: "배움과 인덕을 키우는 힘",
    일원: "나의 중심 기운",
  },
  wealth: {
    비견: "내 몫을 지키는 주체성",
    겁재: "경쟁·충동 지출에 주의할 승부욕",
    식신: "결과물로 수입을 만드는 힘",
    상관: "아이디어는 빠른데 지출도 빠른 힘",
    편재: "소개·거래로 돈이 도는 힘",
    정재: "청구·정산으로 모으는 재물 감각",
    편관: "급한 일도 책임지고 끝내는 힘",
    정관: "세금·서류로 돈을 지키는 힘",
    편인: "남이 안 보는 자료에서 답을 찾는 힘",
    정인: "자격·문서가 나중에 돈이 되는 힘",
  },
  career: {
    비견: "동료와 역할을 나누는 힘",
    겁재: "경쟁이 센 자리의 승부욕",
    식신: "손기술·콘텐츠가 점수가 되는 힘",
    상관: "제안·발표가 눈에 띄는 힘",
    편재: "외부 미팅·영업이 열리는 힘",
    정재: "실무 정산·성과를 쌓는 감각",
    편관: "급한 보직·압박 업무를 뚫는 힘",
    정관: "지원·승진·공식 루트의 힘",
    편인: "특수 분야·혼자 파는 기술",
    정인: "공부·자격·멘토가 자리를 여는 힘",
  },
};

/** 일간(천간+오행) 본성 — 쉬운 말 먼저 */
export const DAY_MASTER_NATURE = {
  갑목: "하늘로 뻗는 큰 나무처럼 곧게 자라는 본성",
  을목: "덩굴처럼 유연하게 기대어 자라는 본성",
  병화: "태양처럼 밝게 비추고 이끄는 본성",
  정화: "촛불처럼 따뜻하게 밝히는 본성",
  무토: "거대한 산과 대지처럼 묵직하고 믿음직스러운 본성",
  기토: "밭과 정원처럼 품고 가꾸는 본성",
  경금: "원석처럼 단단히 다듬고 가르는 본성",
  신금: "보석처럼 섬세하게 빛나는 본성",
  임수: "큰 강처럼 넓게 흐르는 본성",
  계수: "이슬·빗물처럼 스며드는 본성",
};

export const STRENGTH_EASY = {
  신강: "스스로 중심을 잡고 버티며 밀어붙이는 에너지가 강한 체질",
  신약: "주변 흐름과 환경에 섬세하게 반응하며 조율하는 체질",
};

/** 구조 용어 — 쉬운 말(전문용어) */
export const STRUCT_GLOSS = {
  일간: "나의 중심 기운",
  용신: "지금 가장 필요한 기운",
  희신: "도움이 되는 기운",
  기신: "과하면 부담이 되는 기운",
  "12운성": "기운의 호흡·온도",
  자미두수: "별자리로 성격을 보조해 읽는 렌즈",
  기문둔갑: "방위·동선으로 때를 보는 렌즈",
  주역: "선택의 태도를 한 줄로 짚는 렌즈",
  신강: STRENGTH_EASY.신강,
  신약: STRENGTH_EASY.신약,
};

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
    short: "승부욕과 돌파력",
    detail: "경쟁자와 승부사의 기운으로, 목표를 향한 돌파력과 재치를 상징합니다.",
    strength: "위기 돌파와 승부욕",
    caution: "무리한 경쟁이나 충동 지출에 주의하세요",
  },
  식신: {
    hanja: "食神",
    meaning: "복을 먹여 기른다",
    short: "꾸준히 만들어내는 힘",
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
    short: "성실하게 쌓는 재물 감각",
    detail: "꼼꼼하게 쌓아 올리는 안정적 재물과 성실함의 기운입니다.",
    strength: "알뜰한 자산 관리와 신뢰",
    caution: "지나친 계산이나 소심함에 주의하세요",
  },
  편관: {
    hanja: "偏官",
    meaning: "거친 책임·해결",
    short: "책임감과 돌파력",
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
    short: "배움과 인덕을 키우는 힘",
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

/** 쉬운 말(전문용어) 형태 */
export function easyTerm(easy, term) {
  if (!term || term === "—") return easy || term || "—";
  if (!easy) return term;
  return `${easy}(${term})`;
}

/** 신강/신약 → 일상어 우선 */
export function strengthPhrase(label) {
  const raw = String(label || "");
  if (raw.includes("신강")) return easyTerm(STRENGTH_EASY.신강, "신강");
  if (raw.includes("신약")) return easyTerm(STRENGTH_EASY.신약, "신약");
  return raw || "—";
}

/** 일간 갑목/무토 등 → 본성 일상어 우선 */
export function dayMasterPhrase(ko, el) {
  const key = `${ko || ""}${el || ""}`;
  const nature = DAY_MASTER_NATURE[key];
  if (nature) return easyTerm(nature, `일간 ${key}`);
  if (key) return easyTerm("나의 중심 기운", `일간 ${key}`);
  return "나의 중심 기운(일간)";
}

/** 오행 글자 → 주제별 쉬운 말(오행) */
export function elementPhrase(el, topic = "default") {
  if (!el || el === "—") return "—";
  const g = elementGloss(topic, el) || ELEMENT_BY_TOPIC.default[el];
  return g ? easyTerm(g, el) : el;
}

export function favorBundlePhrase(els, topic = "default") {
  return String(els || "")
    .split(/[·,/\s]+/)
    .filter(Boolean)
    .map((el) => elementPhrase(el, topic))
    .join("·");
}

/** 도표·칩용 — 쉬운 말(용어) */
export function termChip(name) {
  if (!name || name === "—") return name || "—";
  if (STRENGTH_EASY[name]) return easyTerm(STRENGTH_EASY[name], name);
  if (STRUCT_GLOSS[name]) return easyTerm(STRUCT_GLOSS[name], name);
  const entry = TEN_GOD_GLOSS[name] || DISHI_GLOSS[name] || SHENSHA_GLOSS[name];
  if (!entry) return name;
  return easyTerm(entry.short, name);
}

/** 용어 가이드 표용 한 줄 요약 (명리 전용) */
export function termSummaryLine(name) {
  const entry = TEN_GOD_GLOSS[name] || DISHI_GLOSS[name] || SHENSHA_GLOSS[name];
  if (!entry) {
    if (STRENGTH_EASY[name]) return `${STRENGTH_EASY[name]}(${name})`;
    if (STRUCT_GLOSS[name]) return `${STRUCT_GLOSS[name]}(${name})`;
    return name;
  }
  return `${entry.short}(${name}·${entry.hanja}) · 강점 ${entry.strength} · 주의 ${entry.caution}`;
}

/**
 * 일반 서술 문장용.
 * 단독 오행·십신·12운성·신살 문자열 치환은 하지 않음
 * (할 수 있습니다 / 태도 / 사람 사이 등 오작동 방지).
 * 천간+오행(예: 갑목)만 안전하게 풀어 줍니다.
 */
export function easeSentence(text, { wealth = false } = {}) {
  if (!text || typeof text !== "string") return text;
  // 본문은 annotateMyungri가 쉬운 말(용어)로 처리. 여기서는 중복 치환만 피하고 원문 유지.
  if (wealth) {
    // wealth 전용 짧은 정리만 유지 (천간+오행, 괄호 밖)
    return String(text).replace(
      /([갑을병정무기경신임계])([목화토금수])(?!\()/g,
      (full, stem, element, offset, source) => {
        if (insideParens(source, offset)) return full;
        const next = source.slice(offset + full.length);
        if (alreadyTold(next, element, wealth)) return full;
        const gloss = glossOf(element, wealth);
        return gloss.startsWith(element) ? `${stem}${gloss}` : full;
      },
    );
  }
  return text;
}

export function easeLines(lines, options) {
  return (lines || []).map((line) => easeSentence(line, options));
}

function elementGloss(topic, element) {
  const map = ELEMENT_BY_TOPIC[topic] || ELEMENT_BY_TOPIC.default;
  return map[element] || ELEMENT_BY_TOPIC.default[element] || "";
}

function tenGodGloss(topic, name) {
  const base = TEN_GOD_TOPIC_SHORT.default || {};
  const extra = TEN_GOD_TOPIC_SHORT[topic] || {};
  return extra[name] || base[name] || TEN_GOD_GLOSS[name]?.short || "";
}

function insideParens(source, offset) {
  const before = source.slice(0, offset);
  return (before.match(/\(/g) || []).length > (before.match(/\)/g) || []).length;
}

function replaceTermEasyFirst(out, term, gloss) {
  if (!term || !gloss) return out;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 이미 쉬운말(용어) 형태·괄호 안이면 건너뜀. 1글자 운성은 어절 중간(태도/병원) 제외
  const re =
    term.length >= 2
      ? new RegExp(`(?<![\\uac00-\\ud7a3(])${escaped}(?!\\()`, "g")
      : new RegExp(`(?<![\\uac00-\\ud7a3(])${escaped}(?![\\uac00-\\ud7a3(])`, "g");
  return out.replace(re, (match, offset, source) => {
    if (insideParens(source, offset)) return match;
    return easyTerm(gloss, term);
  });
}

/**
 * 제1~10부 본문용: 전문용어를 쉬운 말(용어) 형태로 바꿉니다.
 * 이미 괄호가 붙은 용어·한글 어절 중간(태도/할 수/병원 등)은 건드리지 않습니다.
 */
export function annotateMyungri(text, { topic = "default", wealth = false } = {}) {
  if (!text || typeof text !== "string") return text;
  const topicKey = wealth ? "wealth" : topic;
  let out = String(text);

  // 일간 갑목/무토 — 한 덩어리로 먼저
  out = out.replace(/(?<![\uac00-\ud7a3(])일간\s*([갑을병정무기경신임계][목화토금수])(?!\()/g, (_, key) =>
    dayMasterPhrase(key[0], key[1]),
  );

  // 구조 용어(긴 것 먼저) — 일간은 위에서 처리했으므로 단독만
  const structKeys = Object.keys(STRUCT_GLOSS)
    .filter((k) => k !== "일간")
    .sort((a, b) => b.length - a.length);
  for (const term of structKeys) {
    out = replaceTermEasyFirst(out, term, STRUCT_GLOSS[term]);
  }
  out = replaceTermEasyFirst(out, "일간", STRUCT_GLOSS.일간);

  const multi = [
    ...Object.keys(TEN_GOD_GLOSS).sort((a, b) => b.length - a.length),
    ...Object.keys(DISHI_GLOSS).sort((a, b) => b.length - a.length),
    ...Object.keys(SHENSHA_GLOSS).sort((a, b) => b.length - a.length),
  ];

  for (const term of multi) {
    const gloss =
      TEN_GOD_GLOSS[term] != null
        ? tenGodGloss(topicKey, term)
        : DISHI_GLOSS[term]?.short || SHENSHA_GLOSS[term]?.short || "";
    out = replaceTermEasyFirst(out, term, gloss);
  }

  // 일간 갑목/무토 등 — 본성 쉬운 말 먼저
  out = out.replace(/(?<![\uac00-\ud7a3(])([갑을병정무기경신임계][목화토금수])(?!\()/g, (full, _g, offset, source) => {
    if (typeof offset !== "number" || insideParens(source, offset)) return full;
    const nature = DAY_MASTER_NATURE[full];
    if (nature) return easyTerm(nature, full);
    const g = elementGloss(topicKey, full[1]);
    return g ? easyTerm(g, full) : full;
  });

  // "금 기운" → 쉬운 말(금) 기운
  out = out.replace(/(?<![\uac00-\ud7a3(])([목화토금수])(?!\()(?=\s*기운)/g, (match, el, offset, source) => {
    if (insideParens(source, offset)) return match;
    const g = elementGloss(topicKey, el);
    return g ? easyTerm(g, el) : match;
  });

  // "목 2 —" 단독 오행 표기
  out = out.replace(
    /(^|[·・、,/|\s]|—\s*)([목화토금수])(?!\()(?=\s*(?:\d|—|·|・|、|,|$))/gm,
    (full, pre, el, offset, source) => {
      if (typeof offset !== "number" || insideParens(source, offset + pre.length)) return full;
      const g = elementGloss(topicKey, el);
      return g ? `${pre}${easyTerm(g, el)}` : full;
    },
  );

  // 옛 형식 용어(쉬운말) → 쉬운말(용어)로 한 번만 뒤집기
  out = out.replace(
    /(?<![\uac00-\ud7a3])(신강|신약|용신|희신|기신|편관|식신|정재|정인|겁재|비견|상관|편재|정관|편인|문창|도화|역마|공망|관대|장생|건록|제왕|자미두수|기문둔갑|주역)\(([^)]+)\)/g,
    (full, term, inner) => {
      if (inner.includes(term)) return full;
      if (STRUCT_GLOSS[term] && inner === STRUCT_GLOSS[term]) return full;
      // 괄호 안이 이미 쉬운 설명이면 앞뒤로 뒤집기
      if (inner.length >= 4) return easyTerm(inner, term);
      const gloss =
        STRUCT_GLOSS[term] ||
        tenGodGloss(topicKey, term) ||
        DISHI_GLOSS[term]?.short ||
        SHENSHA_GLOSS[term]?.short ||
        "";
      return gloss ? easyTerm(gloss, term) : full;
    },
  );

  return out;
}

/** 근거·요약 박스용 짧은 용어 안내 */
export function topicEvidenceGuide(topicId) {
  const guides = {
    origin:
      "이 장에서는 나를 이루는 다섯 기운(목·화·토·금·수)과, 사람과 시기에 나타나는 역할·호흡의 이름표를 쉬운 말로 먼저 읽습니다.",
    wealth:
      "재물 장에서는 정산·저축의 힘과 판로·인연·흐름의 힘을 먼저 봅니다. 성실하게 쌓는 재물 감각·큰 판을 굴리는 힘·꾸준히 만들어내는 힘이 돈이 들어오는 역할입니다.",
    career:
      "직업 장에서는 자리와 책임의 힘, 배움과 실력을 드러내는 힘을 먼저 봅니다. 오행은 ‘어떤 방식으로 성과를 내는지’를 알려 줍니다.",
    business:
      "사업 장에서는 판을 키우고 파는 힘, 계약·시장 흐름을 다잡는 힘을 쉬운 말로 읽습니다.",
    marriage:
      "연애·결혼 장에서는 인연의 결(매력·소개·역할)을 쉬운 말로 풀고, 오행은 관계를 키우고 지키는 방식의 차이로 봅니다.",
    compatibility:
      "궁합 장에서는 서로의 역할·기운이 ‘맞추면 편한 생활 리듬’의 힌트입니다. 합보다 약속과 속도 맞추기가 먼저입니다.",
    children:
      "자녀 장에서는 아이·표현을 키우는 힘과 가르침·돌봄의 힘을 쉬운 말로 읽습니다.",
    health:
      "건강 장에서는 오행 편중을 몸·수면의 과부족 신호로, 기운의 호흡에서 점검·휴식 리듬을 먼저 봅니다.",
    moving:
      "이사 장에서는 이동·문서의 신호등과 집터·계약의 힘을 쉬운 말로 읽습니다.",
    travel:
      "여행 장에서는 이동의 복과 동선·확장을 돕는 힘을 쉬운 말로 풀어 줍니다.",
    year:
      "세운 장에서는 그해의 기운·역할이 ‘올해 밀지/기다릴지’의 온도계입니다.",
    timing:
      "월운 장에서는 이달의 호흡·결단·조율 타이밍을 쉬운 말로 짧게 번역합니다.",
    default:
      "본문은 쉬운 일상어를 앞에 두고, 필요할 때만 전문 용어를 괄호로 밝힙니다.",
  };
  return guides[topicId] || guides.default;
}

/** 명식에 실제로 등장하는 용어만 수집 (용어 가이드 페이지용) */
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
