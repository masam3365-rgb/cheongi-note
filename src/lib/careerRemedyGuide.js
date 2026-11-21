/**
 * 2026 현대 직종·전공 기반 진로 지침서 + 맞춤 개운 7대 비교표
 */

const GOD_GROUP = {
  식신: "식상",
  상관: "식상",
  정재: "재성",
  편재: "재성",
  정관: "관성",
  편관: "관성",
  정인: "인성",
  편인: "인성",
  비견: "비겁",
  겁재: "비겁",
};

const GROUP_LABEL = {
  식상: "꾸준히 만들고 표현하는 힘(식상)",
  재성: "성실하게 쌓거나 판을 굴리는 재물 감각(재성)",
  관성: "자리·책임·원칙의 힘(관성)",
  인성: "배움·문서·인덕의 힘(인성)",
  비겁: "주체성·승부·동료와 버티는 힘(비겁)",
};

/** 오행별 1순위 핵심 분야 3개 + 현대 직종 */
export const CAREER_FIELDS = {
  목: [
    {
      name: "교육·코칭·기획",
      jobs: [
        "AI 에듀테크 콘텐츠 기획자",
        "기업 교육(L&D) 담당자",
        "커리어·라이프 코치",
        "온라인 강의 크리에이터",
        "HRD·조직문화 컨설턴트",
        "청소년·진로 상담사",
        "교육 스타트업 PM",
        "퍼실리테이터·워크숍 진행자",
        "학습 경험(LX) 디자이너",
        "출판·교재 기획 에디터",
        "브랜딩 스토리텔러",
        "ESG·임팩트 교육 기획자",
      ],
      majors: ["교육학", "교육공학", "인적자원개발", "상담심리", "콘텐츠기획"],
    },
    {
      name: "패션·뷰티·친환경·바이오",
      jobs: [
        "지속가능 패션 머천다이저",
        "뷰티 브랜드 마케터",
        "클린뷰티·비건 제품 기획자",
        "바이오헬스 마케팅",
        "식물성·대체식품 기획자",
        "친환경 패키징 디자이너",
        "라이프스타일 MD",
        "퍼스널 컬러·이미지 컨설턴트",
        "헬스케어 콘텐츠 에디터",
        "농생명·스마트팜 기획",
        "화장품 안전·품질 코디",
        "그린테크 스타트업 운영",
      ],
      majors: ["패션디자인", "화장품과학", "생명과학", "환경공학", "식품생명공학"],
    },
    {
      name: "출판·웹툰·브랜딩",
      jobs: [
        "웹툰·웹소설 에디터",
        "IP 기획·매니지먼트",
        "브랜드 전략 플래너",
        "카피라이터·콘텐츠 라이터",
        "북 디자이너·아트디렉터",
        "디지털 출판 프로듀서",
        "캐릭터·이모티콘 사업",
        "유튜브·숏폼 채널 PD",
        "커뮤니티·팬덤 매니저",
        "스토리텔링 UX 라이터",
        "문화콘텐츠 큐레이터",
        "독립출판·뉴스레터 운영자",
        "광고 크리에이티브",
      ],
      majors: ["문예창작", "디지털콘텐츠디자인", "미디어커뮤니케이션", "시각디자인", "스토리텔링"],
    },
  ],
  화: [
    {
      name: "디지털 콘텐츠·미디어·방송",
      jobs: [
        "숏폼·릴스 콘텐츠 크리에이터",
        "유튜브·팟캐스트 PD",
        "라이브 방송 연출",
        "OTT·웹예능 제작 스태프",
        "디지털 미디어 기자",
        "인플루언서 매니저",
        "영상 편집·모션 디자이너",
        "사운드·뮤직 슈퍼바이저",
        "메타버스·버추얼 이벤트 기획",
        "뉴스룸 소셜 에디터",
        "공연·페스티벌 마케터",
        "방송 기술·스트리밍 엔지니어",
      ],
      majors: ["방송영상", "미디어콘텐츠", "공연예술경영", "디지털미디어디자인", "저널리즘"],
    },
    {
      name: "IT·AI·반도체·첨단기술",
      jobs: [
        "AI 프로덕트 매니저",
        "머신러닝 엔지니어",
        "프롬프트·LLM 응용 개발자",
        "반도체 공정·장비 엔지니어",
        "클라우드·DevOps 엔지니어",
        "로봇·자율주행 소프트웨어",
        "양자·첨단소재 연구지원",
        "사이버보안 분석가",
        "테크 세일즈 엔지니어",
        "스타트업 CTO 트랙 개발자",
        "데이터 인프라 엔지니어",
        "헬스테크·메디테크 개발",
        "IT 컨설턴트",
      ],
      majors: ["컴퓨터공학", "인공지능", "전자공학", "반도체공학", "정보보안"],
    },
    {
      name: "마케팅·광고·엔터테인먼트·라이브커머스",
      jobs: [
        "퍼포먼스 마케터",
        "라이브커머스 PD·쇼호스트",
        "브랜드 캠페인 플래너",
        "광고 AE·크리에이티브",
        "엔터테인먼트 마케터",
        "팬덤·아티스트 매니지먼트",
        "이커머스 그로스 해커",
        "CRM·리텐션 마케터",
        "인플루언서 마케팅 매니저",
        "이벤트·팝업 기획자",
        "PR·커뮤니케이션 매니저",
        "게임·e스포츠 마케터",
      ],
      majors: ["광고홍보", "마케팅", "소비자학", "엔터테인먼트경영", "경영학"],
    },
  ],
  토: [
    {
      name: "부동산·프롭테크·건축·인테리어",
      jobs: [
        "프롭테크 서비스 PM",
        "부동산 자산관리(AM/PM)",
        "건축 설계·감리 코디",
        "인테리어·공간 디자이너",
        "스마트홈·빌딩 IoT 기획",
        "도시재생·커뮤니티 기획",
        "부동산 데이터 분석가",
        "분양·임대 마케팅",
        "건설 안전·품질관리",
        "상업공간 브랜딩",
        "주거 컨설턴트",
        "건축 BIM 전문가",
      ],
      majors: ["건축학", "실내건축", "도시계획", "부동산학", "토목공학"],
    },
    {
      name: "플랫폼 운영·중개·컨설팅",
      jobs: [
        "플랫폼 운영(OP) 매니저",
        "마켓플레이스 카테고리 매니저",
        "비즈니스 컨설턴트",
        "고객성공(CS) 매니저",
        "중개·매칭 서비스 기획",
        "공공·민간 프로젝트 코디",
        "프로세스 개선(PI) 컨설턴트",
        "프랜차이즈 슈퍼바이저",
        "B2B 세일즈 매니저",
        "운영 데이터 애널리스트",
        "커뮤니티·멤버십 운영",
        "아웃소싱·인력중개 매니저",
      ],
      majors: ["경영학", "행정학", "산업공학", "서비스경영", "물류학"],
    },
    {
      name: "농식품·웰니스·동물·케어",
      jobs: [
        "푸드테크·대체식품 기획",
        "웰니스·헬스케어 코디네이터",
        "요양·재가돌봄 서비스 기획",
        "동물병원·펫케어 매니저",
        "스마트팜 운영자",
        "영양·다이어트 코치",
        "시니어케어 서비스 설계",
        "로컬푸드·직거래 플랫폼",
        "카페·베이커리 브랜드 운영",
        "스포츠·재활 케어 트레이너",
        "원예·가든테라피 지도",
        "식품 품질·위생 관리",
      ],
      majors: ["식품영양", "동물보건", "사회복지", "원예생명", "호텔외식경영"],
    },
  ],
  금: [
    {
      name: "금융·핀테크·세무·회계·투자",
      jobs: [
        "핀테크 프로덕트 매니저",
        "세무·회계 컨설턴트",
        "자산관리·PB 어드바이저",
        "투자·리서치 애널리스트",
        "보험·인슈어테크 기획",
        "기업 재무(FP&A)",
        "크립토·디지털자산 컴플라이언스",
        "신용·리스크 분석가",
        "결제·정산 시스템 운영",
        "벤처캐피탈·액셀러레이터 심사",
        "ESG 금융 애널리스트",
        "세무회계 소프트웨어 컨설턴트",
      ],
      majors: ["경영학", "회계학", "세무학", "금융공학", "경제학"],
    },
    {
      name: "법률·공공·보안·품질관리",
      jobs: [
        "기업 법무·컴플라이언스",
        "공공기관·정책 실무",
        "정보보안·개인정보 보호",
        "품질관리(QA/QC)",
        "노무·인사 전문가",
        "계약·지적재산 코디",
        "감사·내부통제",
        "안전보건 관리자",
        "공공조달·입찰 전문가",
        "규제·인허가 컨설턴트",
        "분쟁조정·중재 실무",
        "디지털 포렌식 보조",
      ],
      majors: ["법학", "경찰행정", "산업공학", "정보보호", "행정학"],
    },
    {
      name: "의료·정밀기기·모빌리티·엔지니어링",
      jobs: [
        "의료기기 RA·QA",
        "병원 원무·헬스케어 운영",
        "정밀기계·로봇 엔지니어",
        "전기차·모빌리티 엔지니어",
        "항공·우주 부품 품질",
        "임상시험(CRA) 코디",
        "바이오장비 영업기술",
        "스마트팩토리 엔지니어",
        "CAD/CAE 설계",
        "의료 AI 데이터 라벨·검증",
        "자동차 전장 시스템",
        "설비·플랜트 엔지니어",
      ],
      majors: ["의공학", "기계공학", "전자공학", "자동차공학", "간호·보건행정"],
    },
  ],
  수: [
    {
      name: "데이터·소프트웨어·연구개발(R&D)",
      jobs: [
        "데이터 사이언티스트",
        "백엔드·풀스택 개발자",
        "연구소·R&D 연구원",
        "BI·데이터 분석가",
        "실험설계·통계 분석",
        "소프트웨어 아키텍트",
        "연구기획(R&D PM)",
        "오픈소스·개발자 관계(DevRel)",
        "실험실 자동화 엔지니어",
        "AI 데이터셋 큐레이터",
        "과학 커뮤니케이터",
        "특허·기술이전 코디",
        "클라우드 데이터 엔지니어",
      ],
      majors: ["데이터사이언스", "통계학", "소프트웨어학", "화학·생명과학", "산업공학"],
    },
    {
      name: "무역·물류·글로벌 비즈니스·관광",
      jobs: [
        "글로벌 세일즈·무역 담당",
        "국제물류·포워딩",
        "이커머스 해외판매 운영",
        "관광·호스피탈리티 매니저",
        "FTA·통상 실무",
        "공급망(SCM) 플래너",
        "항공·해운 운송 코디",
        "로컬투어·체험관광 기획",
        "해외법인 관리 보조",
        "통번역·로컬라이제이션",
        "글로벌 CS·고객경험",
        "MICE·컨벤션 기획",
      ],
      majors: ["국제통상", "물류학", "관광학", "무역학", "국제학"],
    },
    {
      name: "심리상담·의료·제약·외식·카페",
      jobs: [
        "심리상담사·멘탈헬스 코치",
        "병원 코디네이터",
        "제약·바이오 마케팅",
        "임상·약사 보조 트랙",
        "카페·베이커리 브랜드 셰프",
        "외식 프랜차이즈 슈퍼바이저",
        "영양·임상영양 상담",
        "웰니스 리트리트 기획",
        "의료관광 코디네이터",
        "펫·동물매개 치유",
        "푸드스타일리스트",
        "디지털 헬스케어 상담",
      ],
      majors: ["심리학", "상담학", "약학·제약", "식품영양", "호텔외식경영"],
    },
  ],
};

const TASTE = {
  목: { taste: "신맛", foods: "레몬·매실·식초 드레싱, 새싹·샐러드, 녹차·보리차, 키위·사과" },
  화: { taste: "쓴맛", foods: "토마토·치커리·다크초콜릿(소량), 대추차·국화차, 따뜻한 수프" },
  토: { taste: "단맛(자연당)", foods: "고구마·단호박·잡곡밥, 대추·밤, 따뜻한 죽·미음" },
  금: { taste: "매운맛·맑은 맛", foods: "무·배·도라지, 흰 살 생선, 생강차(과하지 않게), 맑은 국물" },
  수: { taste: "짠맛(절제)", foods: "미역·김·검은콩, 따뜻한 국물, 팥차·둥굴레차(찬 음료↓)" },
};

const COLORS = {
  목: { good: "초록·민트·연두", bad: "탁한 회갈·과도한 원색 충돌" },
  화: { good: "코랄·연분홍·따뜻한 오렌지", bad: "차가운 청회색만 가득한 조합" },
  토: { good: "베이지·머스타드·카키", bad: "형광·과한 네온" },
  금: { good: "화이트·실버·아이보리", bad: "때 탄 듯한 탁한 노랑" },
  수: { good: "네이비·차콜·딥블루", bad: "눈부신 형광 노랑·과도한 레드" },
};

const DECOR = {
  목: { good: "관엽식물, 원목 트레이, 세로형 조명, 책·노트 정리함", bad: "날카로운 금속만 잔뜩, 마른 식물·먼지 쌓인 화분" },
  화: { good: "따뜻한 간접조명, 캔들(안전), 사진·포스터, 따뜻한 패브릭", bad: "차갑고 어두운 방만 유지, 빛 없는 구석" },
  토: { good: "도자기·스톤 소품, 안정감 있는 낮은 수납, 러그", bad: "흔들리는 선반·어지러운 더미" },
  금: { good: "금속·유리 정리함, 미니멀 데스크, 시계·알람", bad: "녹슨 금속·깨진 거울 방치" },
  수: { good: "어항(관리 가능 시), 가습기, 곡선 소품, 흐르는 물 이미지", bad: "물때·곰팡이, 찬바람 직접 닿는 자리" },
};

const DIR = {
  목: { good: "동·동남", bad: "서" },
  화: { good: "남", bad: "북" },
  토: { good: "동남·서남·중앙 안정", bad: "지속적인 북풍 자리" },
  금: { good: "서·북서", bad: "동" },
  수: { good: "북", bad: "남쪽 과열·직사광만 있는 자리" },
};

const SEASON = {
  목: { good: "봄(3~5월), 새 프로젝트·학습 시작", bad: "가을 말·무리한 마감 몰아치기" },
  화: { good: "초여름(5~7월), 발표·런칭", bad: "한겨울 과로·수면 부족" },
  토: { good: "환절기 정리 달, 분기 마감·정산", bad: "급작스러운 이사·계약 동시 진행" },
  금: { good: "가을(9~11월), 계약·평가·정산", bad: "감정만으로 큰 계약 밀어붙이기" },
  수: { good: "겨울~초봄, 연구·전략·해외 일정", bad: "한여름 탈진·일정 과밀" },
};

const LUCKY_NUM = {
  목: { good: "3·8", bad: "7·9" },
  화: { good: "2·7", bad: "1·6" },
  토: { good: "0·5", bad: "3·4" },
  금: { good: "4·9", bad: "2·3" },
  수: { good: "1·6", bad: "5·7" },
};

const LUCKY_CHO = {
  목: { good: "ㄱ·ㅋ·ㅇ (키움·성장 느낌)", bad: "ㅅ·ㅆ만 연속" },
  화: { good: "ㅂ·ㅍ·ㅎ (밝힘·표현)", bad: "ㅁ·ㅇ만 무거운 조합" },
  토: { good: "ㄷ·ㅌ·ㄴ (담음·안정)", bad: "ㄹ·ㅎ만 가벼운 남발" },
  금: { good: "ㅈ·ㅊ·ㅅ (정리·기준)", bad: "ㅂ·ㅍ만 과한 자극" },
  수: { good: "ㅁ·ㅇ·ㄹ (흐름·연결)", bad: "ㄱ·ㄲ만 딱딱한 연속" },
};

function countGods(chart) {
  const counts = {};
  (chart.pillars || []).forEach((p) => {
    const g = p.shiShen;
    if (!g || !GOD_GROUP[g]) return;
    const group = GOD_GROUP[g];
    counts[group] = (counts[group] || 0) + 1;
    counts[g] = (counts[g] || 0) + 1;
  });
  if (chart.monthGod && GOD_GROUP[chart.monthGod]) {
    const g = chart.monthGod;
    const group = GOD_GROUP[g];
    counts[group] = (counts[group] || 0) + 1.5;
    counts[g] = (counts[g] || 0) + 1.5;
  }
  return counts;
}

function strongestGroup(counts) {
  const groups = ["식상", "재성", "관성", "인성", "비겁"];
  return groups.sort((a, b) => (counts[b] || 0) - (counts[a] || 0))[0] || "식상";
}

function pickElements(chart) {
  const fav = [...(chart.strength?.favorable || [])];
  const yong = fav[0] || chart.dayElement || "토";
  const hee = fav.filter((e) => e !== yong);
  const day = chart.dayElement;
  const primary = yong;
  const secondary = [];
  hee.forEach((e) => {
    if (!secondary.includes(e)) secondary.push(e);
  });
  if (day && day !== primary && !secondary.includes(day)) secondary.push(day);
  ["목", "화", "토", "금", "수"].forEach((e) => {
    if (secondary.length >= 3) return;
    if (e !== primary && !secondary.includes(e) && !(chart.strength?.unfavorable || []).includes(e)) {
      secondary.push(e);
    }
  });
  return { primary, secondary: secondary.slice(0, 3), fav, yong, hee: hee.length ? hee : fav.slice(0, 2) };
}

function fieldsFor(el, take = 3) {
  return (CAREER_FIELDS[el] || CAREER_FIELDS.토).slice(0, take).map((f) => ({
    element: el,
    name: f.name,
    jobs: f.jobs.slice(0, 15),
    majors: f.majors,
  }));
}

/** 진로 지침서 데이터 */
export function buildCareerPlaybook(chart) {
  const { primary, secondary, yong, hee } = pickElements(chart);
  const godCounts = countGods(chart);
  const topGroup = strongestGroup(godCounts);
  const primaryFields = fieldsFor(primary, 3);
  const secondaryFields = [];
  const used = new Set(primaryFields.map((f) => f.name));
  for (const el of secondary) {
    for (const f of fieldsFor(el, 3)) {
      if (used.has(f.name)) continue;
      secondaryFields.push(f);
      used.add(f.name);
      if (secondaryFields.length >= 4) break;
    }
    if (secondaryFields.length >= 4) break;
  }
  while (secondaryFields.length < 3) {
    const fallback = fieldsFor("토", 3).find((f) => !used.has(f.name));
    if (!fallback) break;
    secondaryFields.push(fallback);
    used.add(fallback.name);
  }

  const majorTips = [
    ...primaryFields.flatMap((f) => f.majors || []),
    ...secondaryFields.flatMap((f) => f.majors || []),
  ];
  const uniqueMajors = [...new Set(majorTips)].slice(0, 8);

  return {
    primaryElement: primary,
    secondaryElements: secondary,
    yong,
    hee,
    topGroup,
    topGroupLabel: GROUP_LABEL[topGroup],
    primaryIntro: `지금 가장 필요한 기운(용신) ${yong}과 도움이 되는 기운(희신) ${hee.join("·") || yong}, 그리고 사주에서 가장 강하게 드러나는 ${GROUP_LABEL[topGroup]}을 기준으로, 타고난 적성을 살려 상위급 성취를 노릴 수 있는 핵심 분야 3가지입니다.`,
    secondaryIntro:
      "1순위 분야로 진출하기 어려운 환경이라면, 차선책으로 안정적인 성취를 이룰 수 있는 분야와 직종은 다음과 같습니다.",
    primaryFields,
    secondaryFields: secondaryFields.slice(0, 4),
    majorTips: uniqueMajors,
    majorTipText: `대학·전공 선택 팁: ${uniqueMajors.map((m) => `${m}과(전공)`).join(", ")}처럼 2026년형 학과명을 우선 후보에 두세요. 성적표보다 ‘수업·실습·포트폴리오를 버티는 방식’이 본인 적성과 맞는지가 최종 기준입니다.`,
  };
}

/** 개운 7대 비교표 행 */
export function buildRemedyCompareRows(chart) {
  const fav = chart.strength?.favorable?.length ? chart.strength.favorable : [chart.dayElement || "토"];
  const unfav = chart.strength?.unfavorable?.length
    ? chart.strength.unfavorable
    : ["목", "화", "토", "금", "수"].filter((e) => !fav.includes(e)).slice(0, 2);
  const goodEl = fav[0];
  const badEl = unfav[0] || "화";

  const tasteGood = fav.map((e) => `${TASTE[e].taste}(${e}): ${TASTE[e].foods}`).join(" · ");
  const tasteBad = unfav.map((e) => `${TASTE[e].taste} 과다·${e} 기운 과한 메뉴`).join(" · ");

  const colorGood = fav.map((e) => COLORS[e].good).join(" · ");
  const colorBad = unfav.map((e) => COLORS[e].good).join(" · ") + "를 과하게 쓰지 않기";

  const decorGood = fav.map((e) => DECOR[e].good).slice(0, 2).join(" / ");
  const decorBad = unfav.map((e) => DECOR[e].bad).slice(0, 2).join(" / ");

  const dirGood = fav.map((e) => DIR[e].good).join(" · ");
  const dirBad = unfav.map((e) => DIR[e].bad).join(" · ");

  const seasonGood = fav.map((e) => SEASON[e].good).slice(0, 2).join(" / ");
  const seasonBad = unfav.map((e) => SEASON[e].bad).slice(0, 2).join(" / ");

  const numGood = [...new Set(fav.flatMap((e) => LUCKY_NUM[e].good.split("·")))].slice(0, 4).join("·");
  const numBad = [...new Set(unfav.flatMap((e) => LUCKY_NUM[e].good.split("·")))].slice(0, 4).join("·");

  const choGood = fav.map((e) => LUCKY_CHO[e].good).slice(0, 2).join(" / ");
  const choBad = unfav.map((e) => LUCKY_CHO[e].bad).slice(0, 2).join(" / ");

  return [
    { label: "음식 & 맛", good: tasteGood, bad: tasteBad || "과식·야식·찬 음료 남용" },
    {
      label: "색깔",
      good: `옷·지갑·폰케이스·침구: ${colorGood}`,
      bad: `피할 색 기운: ${colorBad}`,
    },
    { label: "인테리어·소품", good: decorGood, bad: decorBad },
    {
      label: "방향",
      good: `잠자리 머리·책상·이사 길방: ${dirGood}`,
      bad: `흉방·피하면 좋은 쪽: ${dirBad}`,
    },
    { label: "계절·시기", good: seasonGood, bad: seasonBad },
    {
      label: "행운의 숫자",
      good: `비밀번호·일정 끝자리로 쓰기 좋은 수: ${numGood} (용신·희신 ${goodEl} 계열)`,
      bad: `피하거나 덜 쓸 끝자리: ${numBad} (기신 ${badEl} 계열)`,
    },
    {
      label: "행운의 초성",
      good: `브랜드·상호·아이디에 유리: ${choGood}`,
      bad: `피할 초성 습관: ${choBad}`,
    },
  ];
}

export function buildRemedyGuide(chart) {
  const fav = chart.strength?.favorable || [];
  const unfav = chart.strength?.unfavorable || [];
  return {
    intro: `도움이 되는 기운(용신·희신) ${fav.join("·") || "—"}을 생활에서 보강하고, 과하면 부담이 되는 기운(기신) ${unfav.join("·") || "—"}은 줄이는 것이 맞춤 개운의 핵심입니다.`,
    rows: buildRemedyCompareRows(chart),
  };
}
