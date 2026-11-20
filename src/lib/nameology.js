import cncharModule from "cnchar";
import tradModule from "cnchar-trad";

const cnchar = cncharModule.stroke ? cncharModule : cncharModule.default;
const trad = tradModule.install ? tradModule : tradModule.default;
cnchar.use(trad);

const CHO = [1, 2, 1, 2, 4, 3, 3, 4, 8, 2, 4, 1, 2, 4, 3, 2, 3, 4, 3];
const JUNG = [2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 4, 3, 2, 2, 3, 4, 3, 2, 1, 2, 1];
const JONG = [0, 1, 2, 2, 1, 2, 4, 3, 3, 4, 6, 7, 5, 6, 7, 4, 3, 4, 6, 2, 4, 1, 2, 3, 2, 3, 4, 3];

const LUCK = [
  "",
  "길", "흉", "길", "흉", "길", "길", "길", "길", "흉", "흉",
  "길", "흉", "길", "흉", "길", "길", "길", "길", "흉", "흉",
  "길", "흉", "길", "길", "길", "흉", "흉", "흉", "길", "흉",
  "길", "길", "길", "흉", "길", "흉", "길", "반", "길", "흉",
  "길", "흉", "흉", "흉", "길", "흉", "길", "길", "반", "흉",
  "반", "길", "흉", "흉", "반", "흉", "길", "반", "흉", "흉",
  "길", "흉", "길", "흉", "길", "흉", "길", "길", "흉", "흉",
  "반", "흉", "길", "흉", "반", "흉", "반", "반", "흉", "흉",
  "길",
];

const MEANING = [
  "",
  "시작과 독립", "분산과 이별", "명예와 표현", "굴곡", "복과 장수", "안정", "독립된 전진", "발달", "마무리의 공허", "빈 수레",
  "재기", "박약", "지혜와 인기", "흩어짐", "통솔", "덕과 사람", "돌파", "유업", "고난", "허무",
  "우두머리", "중도 좌절", "왕성함", "입신", "영민함", "변혁의 손실", "중상", "파란", "지모", "헛힘",
  "융화", "행운", "상승", "파멸", "평화", "의협의 풍파", "권위", "예술과 고독", "부귀", "침체",
  "명예", "고독", "산란", "파란", "순풍", "패배", "개화", "지혜", "변화", "성패가 갈림",
  "성하고 쇠함", "달의 밝음", "내면의 우환", "파란", "겉의 꽃", "한탄", "노력의 결실", "말년의 기복", "파란", "무모",
  "영화", "쇠퇴", "부귀", "침체", "장수", "실의", "통달", "발명과 기획", "정체", "공허",
  "느린 전진", "후퇴", "평안", "무능", "보수", "이산", "앞뒤가 갈림", "만년의 안온", "종말", "공허",
  "환원과 완성",
];

/** 성명학에서 자주 쓰는 인명용 한자 보정 획수(사전에 없거나 cnchar가 0을 줄 때) */
const EXTRA_STROKES = {
  鍾: 17, 鐘: 20, 麗: 19, 國: 11, 學: 16, 發: 12, 壽: 14, 龍: 16, 黃: 12, 東: 8,
  門: 8, 聖: 13, 義: 13, 禮: 18, 體: 23, 廣: 15, 應: 17, 變: 23, 對: 14, 歲: 13,
  經: 13, 銀: 14, 鐵: 21, 車: 7, 馬: 10, 魚: 11, 鳥: 11, 齊: 14, 奈: 8, 羅: 19,
  那: 6, 娜: 9, 裵: 15, 裴: 14, 鮮: 17, 于: 3, 獨: 16, 孤: 8, 皇: 9, 甫: 7,
  諸: 15, 葛: 12, 司: 5, 空: 8, 卨: 12, 卲: 7, 奭: 15, 姸: 9, 娫: 9, 暻: 16,
  暎: 12, 烻: 10, 珹: 11, 琸: 13, 鋕: 15, 鋹: 16, 鏞: 19,
  勞: 12, 努: 7, 瑙: 13, 盧: 16, 魯: 15, 璟: 16, 瑛: 12, 玹: 9, 奫: 12,
  埈: 10, 儁: 15, 倧: 10, 倞: 10, 旼: 8, 旿: 8, 晥: 11, 濬: 17,
};

function hangulStroke(ch) {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  return CHO[cho] + JUNG[jung] + JONG[jong];
}

function isHanChar(ch) {
  return /\p{Script=Han}/u.test(ch);
}

function rawStroke(ch) {
  try {
    const n = Number(cnchar?.stroke?.(ch));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** 추천 목록에 없어도 키보드 변환·붙여넣기 한자를 획수로 해석 */
export function strokeOfHanja(ch) {
  if (!ch) return null;
  if (EXTRA_STROKES[ch] != null) return EXTRA_STROKES[ch];
  let n = rawStroke(ch);
  if (n > 0) return n;
  try {
    const traditional = cnchar.convert?.traditional?.(ch);
    if (traditional && traditional !== ch) {
      n = rawStroke(traditional);
      if (n > 0) return n;
    }
    const simple = cnchar.convert?.simple?.(ch);
    if (simple && simple !== ch) {
      n = rawStroke(simple);
      if (n > 0) return n;
    }
  } catch {
    /* ignore convert errors */
  }
  if (!isHanChar(ch)) return null;
  // 마지막 수단: 유니코드 영역별 대략 획(완전 미지 한자도 격 계산이 끊기지 않게)
  const code = ch.codePointAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return 8 + (code % 7);
  if (code >= 0x3400 && code <= 0x4dbf) return 10 + (code % 5);
  return 8;
}

/** 획수 끝자리 기준 성명학 오행 */
export function elementOfStroke(stroke) {
  if (stroke == null || stroke <= 0) return "";
  const digit = stroke % 10;
  if (digit === 1 || digit === 2) return "목";
  if (digit === 3 || digit === 4) return "화";
  if (digit === 5 || digit === 6) return "토";
  if (digit === 7 || digit === 8) return "금";
  return "수";
}

export function hanjaMeta(ch) {
  const stroke = strokeOfHanja(ch);
  return {
    ch,
    stroke,
    element: elementOfStroke(stroke),
    pole: stroke == null ? "" : stroke % 2 === 1 ? "양" : "음",
  };
}

function normalize(n) {
  let value = n;
  while (value > 81) value -= 80;
  return value;
}

function repair(n) {
  const value = normalize(n);
  return {
    raw: n,
    number: value,
    luck: LUCK[value],
    meaning: MEANING[value],
  };
}

function strokesOf(text, mode) {
  return [...text].map((ch) => (mode === "hanja" ? strokeOfHanja(ch) : hangulStroke(ch)));
}

function grids(surname, given) {
  const all = [...surname, ...given];
  const total = all.reduce((sum, n) => sum + n, 0);
  let cheon;
  let hyeong;
  let i;
  let jeong = total;
  let oe;
  if (surname.length === 1 && given.length >= 2) {
    cheon = surname[0] + 1;
    hyeong = surname[0] + given[0];
    i = given.reduce((sum, n) => sum + n, 0);
    oe = total - hyeong + 1;
  } else if (surname.length === 1 && given.length === 1) {
    cheon = surname[0] + 1;
    hyeong = surname[0] + given[0];
    i = given[0] + 1;
    oe = 2;
  } else if (surname.length >= 2 && given.length >= 1) {
    cheon = surname.reduce((sum, n) => sum + n, 0);
    hyeong = surname[surname.length - 1] + given[0];
    i = given.reduce((sum, n) => sum + n, 0);
    oe = total - hyeong;
  } else {
    cheon = total;
    hyeong = total;
    i = total;
    oe = total;
  }
  return [
    ["원격", "초년·가문", cheon],
    ["형격", "주운·성격", hyeong],
    ["이격", "기반·초반", i],
    ["정격", "총운", jeong],
    ["외격", "사회·대인", oe],
  ].map(([name, role, raw]) => ({ name, role, ...repair(raw) }));
}

function analyze(surname, given, mode, hangulPair = null) {
  const full = `${surname}${given}`;
  const hangulFull = hangulPair ? `${hangulPair.surname}${hangulPair.given}` : "";
  const hangulChars = hangulFull ? [...hangulFull] : [];
  const counts = strokesOf(full, mode);
  const missing = [];
  const syllables = [...full].map((ch, index) => {
    let stroke = counts[index];
    // 한자 획을 못 읽으면 같은 자리 한글 자획으로 보완해 계산이 끊기지 않게 함
    if (stroke == null && mode === "hanja" && hangulChars[index]) {
      stroke = hangulStroke(hangulChars[index]);
    }
    if (stroke == null) missing.push(ch);
    return {
      ch,
      stroke,
      element: elementOfStroke(stroke),
      pole: stroke == null ? "" : stroke % 2 === 1 ? "양" : "음",
    };
  });
  const surnameCounts = counts.slice(0, [...surname].length).map((n, i) => {
    if (n != null) return n;
    return syllables[i]?.stroke;
  });
  const givenCounts = counts.slice([...surname].length).map((n, i) => {
    if (n != null) return n;
    return syllables[[...surname].length + i]?.stroke;
  });
  const usableSurname = surnameCounts.every((n) => n != null && n > 0);
  const usableGiven = givenCounts.every((n) => n != null && n > 0);
  return {
    mode,
    syllables,
    missing,
    grids: usableSurname && usableGiven ? grids(surnameCounts, givenCounts) : null,
  };
}

export function buildNameology(surname, given, surnameHanja, givenHanja) {
  const hangul = analyze(surname, given, "hangul");
  if (!hangul.grids) throw new Error("한글 이름의 획수를 계산하지 못했습니다.");
  const hanja =
    surnameHanja && givenHanja
      ? analyze(surnameHanja, givenHanja, "hanja", { surname, given })
      : null;
  const main = hanja?.grids ? hanja : hangul;
  const lead = main.grids.find((item) => item.name === "형격");
  const total = main.grids.find((item) => item.name === "정격");
  const poles = main.syllables.map((item) => item.pole).join("");
  const elements = main.syllables
    .map((item) => item.element)
    .filter(Boolean)
    .join("·");
  const fallback =
    hanja && !hanja.grids
      ? `${hanja.missing.join(" ")} 획수를 확정하지 못해 한글 자획으로 격을 이어서 풀었습니다.`
      : hanja?.missing?.length
        ? `${hanja.missing.join(" ")}는 한자 획 보정이 어려워 같은 자리 한글 자획을 섞어 계산했습니다.`
        : "";
  const summary =
    `${main === hanja ? "한자 획수" : "한글 자획"}로 본 형격은 ${lead.number}수(${lead.luck}, ${lead.meaning})이고 정격은 ${total.number}수(${total.luck}, ${total.meaning})입니다. 음양은 ${poles} 순서${elements ? `, 오행은 ${elements}` : ""}입니다. ${fallback}`.trim();
  return {
    id: "name",
    name: "성명학",
    title: "성명학",
    summary,
    points: main.grids.map(
      (item) => `${item.name} ${item.raw}획 → ${item.number}수 ${item.luck}. ${item.role}, ${item.meaning}.`,
    ),
    hangul,
    hanja,
    main,
  };
}

export function nameScore(nameology) {
  if (!nameology) return 0;
  const weights = { 길: 8, 반: 2, 흉: -8 };
  return nameology.main.grids.reduce((sum, item) => sum + (weights[item.luck] || 0), 0);
}
