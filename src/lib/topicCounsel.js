/**
 * 유료 PDF 주제별 상담 본문 — 실제 reading/chart/engines 데이터만 사용.
 * 6단: 원인 분석 · 타고난 성향 · 현재 상황 · 향후 흐름 · 주의할 점 · 생활 속 실천
 */
import { koGz } from "./ganzhi.js";
import {
  dayMasterPhrase,
  elementPhrase,
  favorBundlePhrase,
  strengthPhrase,
  topicEvidenceGuide,
} from "./plainTerms.js";

function uniq(lines) {
  const seen = new Set();
  return (lines || []).filter((line) => {
    const key = String(line || "")
      .replace(/\s+/g, "")
      .slice(0, 48);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** 습관·색 등 공통 실천 팁은 리포트당 1회만 */
let sharedPracticeTipsEmitted = false;
/** 성격 요약·공통 주의는 리포트당 1회만 — 주제 간 동일 문장 반복 방지 */
let sharedCharacterEmitted = false;
let sharedLineKeys = new Set();

export function resetTopicCounselDedupe() {
  sharedPracticeTipsEmitted = false;
  sharedCharacterEmitted = false;
  sharedLineKeys = new Set();
}

function lineKey(text) {
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[·.,，。、!！?？:：;；"'“”‘’()（）[\]【】]/g, "")
    .slice(0, 52);
}

/** 이미 쓴 긴 공통 문장은 건너뜀(주제 고유·짧은 라벨은 유지) */
function takeSharedFresh(line) {
  const raw = String(line || "").trim();
  if (!raw) return "";
  const key = lineKey(raw);
  if (key.length < 28) return raw;
  if (sharedLineKeys.has(key)) return "";
  sharedLineKeys.add(key);
  return raw;
}

function uniqFresh(lines) {
  return uniq((lines || []).map(takeSharedFresh).filter(Boolean));
}

function yongsin(chart) {
  return {
    yong: chart.strength?.favorable?.[0] || "—",
    hee: (chart.strength?.favorable || []).join("·") || "—",
    gi: (chart.strength?.unfavorable || []).join("·") || "—",
  };
}

function engineBy(reading, pattern) {
  return (reading.engines || []).find((e) => pattern.test(String(e.name || e.id || "")));
}

function pillarSketch(chart) {
  return (chart.pillars || [])
    .map((p) => {
      const god = p.shiShen ? ` · ${p.shiShen}` : "";
      const breath = p.diShi ? ` · 호흡 ${p.diShi}` : "";
      return `${p.label}${p.gzKo || p.gz || ""}${god}${breath}`;
    })
    .join(" / ");
}

/**
 * 주제와 맞닿은 역학 포인트만 — 전체 엔진 요약은 본원 ‘아홉 갈래 역학’에 1회만 둔다.
 */
function pickEngineLines(reading, topicId) {
  const lines = [];
  const ziwei = engineBy(reading, /자미|紫微|ziwei/i);
  const qimen = engineBy(reading, /기문|奇門|qimen/i);
  const fengshui = engineBy(reading, /풍수|風水|fengshui/i);
  const name = engineBy(reading, /성명|姓名|name/i);

  if (ziwei?.lookup) {
    const palace =
      topicId === "wealth"
        ? ziwei.lookup.재백궁
        : topicId === "career" || topicId === "business"
          ? ziwei.lookup.관록궁
          : topicId === "marriage" || topicId === "compatibility"
            ? ziwei.lookup.부처궁
            : topicId === "children"
              ? ziwei.lookup.자녀궁
              : topicId === "health"
                ? ziwei.lookup.질액궁
                : topicId === "moving"
                  ? ziwei.lookup.전택궁
                  : topicId === "travel"
                    ? ziwei.lookup.복덕궁 || ziwei.lookup.명궁
                    : null;
    if (palace) lines.push(`이 주제와 맞닿은 자미 궁: ${palace}`);
  }
  if ((topicId === "moving" || topicId === "travel" || topicId === "business") && qimen?.doors) {
    lines.push(
      `방위 참고: 생문 ${qimen.doors.생문 || "—"}, 개문 ${qimen.doors.개문 || "—"}, 사문 ${qimen.doors.사문 || "—"}`,
    );
  } else if (topicId === "wealth" && fengshui?.summary) {
    lines.push(`재물·배치 참고: ${(fengshui.points || [])[0] || fengshui.summary.slice(0, 80)}`);
  } else if ((topicId === "marriage" || topicId === "compatibility") && name?.summary) {
    lines.push(`성명 수리 참고: ${name.summary}`);
  }
  return uniq(lines).slice(0, 3);
}

/** 주제 전용 서양 문장만 — 태양·달·상승 전문은 본원 서양 장에 1회 */
function westernLines(western, topicId, item) {
  const fromItem = (item.western?.paragraphs || []).filter(Boolean);
  const bits = [...fromItem];
  if (!bits.length && western?.summary && (topicId === "wealth" || topicId === "career" || topicId === "marriage")) {
    bits.push(`서양 교차 한 줄: ${String(western.summary).slice(0, 120)}`);
  }
  return uniq(bits).slice(0, 6);
}

function causeLines(item, chart) {
  const ys = yongsin(chart);
  const topic = item.id || "default";
  const lines = [];
  lines.push(topicEvidenceGuide(topic));
  lines.push(`명식 뼈대: ${pillarSketch(chart)}.`);
  lines.push(
    `오행 비중은 ${
      Object.entries(chart.count || {})
        .map(([k, v]) => `${elementPhrase(k, topic)} ${v}`)
        .join(", ") || "—"
    }입니다.`,
  );

  if (topic === "wealth") {
    lines.push(
      `재물과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.wealth || "—", "wealth")}입니다. 우선 도움이 되는 쪽은 ${elementPhrase(ys.yong, "wealth")}, 과하면 부담인 쪽은 ${favorBundlePhrase(ys.gi, "wealth")}입니다.`,
    );
    lines.push(
      `표현·결과물(식상) 기운 ${elementPhrase(chart.strength?.roles?.child || "—", "wealth")}이 재물을 만드는 통로가 되는지, 자리·책임(관) 기운 ${elementPhrase(chart.strength?.roles?.officer || "—", "wealth")}이 수입의 규칙을 만드는지 함께 봅니다.`,
    );
  } else if (topic === "career") {
    lines.push(
      `직장·승진과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.officer || "—", "career")}이고, 사회에서 자주 보이는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
    );
    lines.push(
      `나를 키우는 기운 ${elementPhrase(chart.strength?.roles?.mine || "—", "career")}과 배움·돌봄 ${elementPhrase(chart.strength?.roles?.parent || "—", "career")}의 균형이 이직·승진·평가의 페이스를 가릅니다.`,
    );
  } else if (topic === "business") {
    lines.push(
      `창업·확장과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.officer || "—", "business")}·재성 ${elementPhrase(chart.strength?.roles?.wealth || "—", "business")}이고, 바깥에서 보이는 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
    );
    lines.push(
      `식상(표현·상품) ${elementPhrase(chart.strength?.roles?.child || "—", "business")}이 매출 통로가 되는지, 동업·계약은 관·재의 규칙이 잡힌 뒤에 여는 편이 안전합니다.`,
    );
  } else if (topic === "marriage" || topic === "compatibility") {
    lines.push(
      `배우자·생활 리듬의 자리(일지)는 ${chart.pillars?.[2]?.zhiKo || "—"}이고, 기운의 호흡은 ${chart.pillars?.[2]?.diShi || "—"}에 가깝습니다.`,
    );
    lines.push("매력·소개의 복과 서류·약속의 복을 같은 달력에 두면, ‘사람’과 ‘준비’가 엇갈리는 실수를 줄일 수 있습니다.");
  } else if (topic === "children") {
    lines.push(
      `자녀·표현과 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.child || "—", "children")} 쪽입니다. 가르침(인성)과 표현의 균형으로 읽으면 훈육이 부드러워집니다.`,
    );
  } else if (topic === "health") {
    lines.push(
      `${strengthPhrase(chart.strength?.label)}. 과하면 부담인 기운 ${favorBundlePhrase(ys.gi, "health")}이 셀 때는 수면·식사·쉬는 칸을 먼저 챙기세요.`,
    );
    lines.push("이 장은 생활 리듬 참고이며, 사주로 질병이나 신체 상태를 진단·단정하지 않습니다.");
  } else if (topic === "moving" || topic === "travel") {
    lines.push(
      `이동·출장의 복과 느슨한 자리(공망 ${chart.xunKong || "—"}, 역마 ${koGz(chart.specials?.yeokma || "") || "—"})가 이사·여행 타이밍의 길잡이입니다.`,
    );
    lines.push(`도움이 되는 기운 ${favorBundlePhrase(ys.hee, topic)} 방위·동선을 우선하면 일정 피로가 덜합니다.`);
  } else {
    lines.push(
      `${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}. 지금 가장 필요한 기운은 ${elementPhrase(ys.yong)}, 도움은 ${favorBundlePhrase(ys.hee)}, 과하면 부담은 ${favorBundlePhrase(ys.gi)}입니다.`,
    );
  }
  (item.eastern?.paragraphs || []).slice(0, 4).forEach((line) => lines.push(line));
  return uniq(lines);
}

function innateLines(item, reading) {
  const chart = reading.chart;
  const character = reading.dashboard?.character?.personality;
  const topic = item.id || "default";
  const ys = yongsin(chart);
  const lines = [
    `${item.title}을 볼 때 기본 본성은 ${dayMasterPhrase(chart.dayMasterKo, chart.dayElement)}이고, 지금은 ${strengthPhrase(chart.strength?.label)}입니다.`,
    `네 기둥 ${(chart.pillars || []).map((p) => `${p.label}${p.gzKo}`).join(" · ")}에서 사회 태도(월주)는 ${chart.monthGod || "—"} 결에 가깝습니다.`,
    `납음·지장간이 겹치면 한 달에 역할이 여러 겹으로 보이므로, ${item.title}에서도 ‘한 가지 페이스’를 정해 두는 편이 안전합니다.`,
  ];
  if (topic === "wealth") {
    lines.push(
      `재물 그릇과 맞닿는 역할 기운은 ${elementPhrase(chart.strength?.roles?.wealth || "—", "wealth")}입니다. 도움 기운 ${favorBundlePhrase(ys.hee, "wealth")}을 저축·정산 규칙에 먼저 들이면 체감이 빨라집니다.`,
    );
  } else if (topic === "career") {
    lines.push(
      `직장·평가와 맞닿는 역할 기운은 ${elementPhrase(chart.strength?.roles?.officer || "—", "career")}입니다. 혼자 밀어붙이기보다 월주(${chart.monthGod || "—"}) 결에 맞는 보고·협업 방식이 평가를 안정시킵니다.`,
    );
  } else if (topic === "business") {
    lines.push(
      `사업·확장과 맞닿는 역할은 재성 ${elementPhrase(chart.strength?.roles?.wealth || "—", "business")}·식상 ${elementPhrase(chart.strength?.roles?.child || "—", "business")}입니다. 채용·광고·동업은 한 번에 하나만 여는 페이스가 맞습니다.`,
    );
  } else if (topic === "marriage" || topic === "compatibility") {
    lines.push(
      `배우자·생활 리듬 자리(일지)는 ${chart.pillars?.[2]?.zhiKo || "—"}입니다. 갈등이 커질 때는 말보다 일정·수면·돈 이야기를 짧게 맞추는 편이 이득입니다.`,
    );
  } else if (topic === "children") {
    lines.push(
      `표현·자녀와 맞닿는 기운은 ${elementPhrase(chart.strength?.roles?.child || "—", "children")}입니다. 양육자 본인의 수면이 먼저일 때 훈계가 짧아집니다.`,
    );
  } else if (topic === "health") {
    lines.push(
      `체질 판정은 나를 돕는 기운 ${chart.strength?.support ?? "—"}대 나를 쓰게 하는 기운 ${chart.strength?.drain ?? "—"}의 비교입니다. 생활 페이스 참고로만 쓰세요.`,
    );
  }
  // 성격 요약은 리포트당 1회만 — 이후 주제에서는 주제 고유 문장만 유지
  if (!sharedCharacterEmitted) {
    sharedCharacterEmitted = true;
    if (character?.summary) lines.push(character.summary);
    if (character?.deep) lines.push(character.deep);
    if (character?.balance) lines.push(character.balance);
  } else if (character?.tip) {
    lines.push(`${item.title} 관점: ${character.tip}`);
  }
  if (item.summary) lines.push(item.summary);
  else if (item.preview) lines.push(item.preview);
  return uniq(lines);
}

function currentLines(item, reading) {
  const sectionLines = (item.sections || []).flatMap((s) => {
    const title = s.title ? `[${s.title}] ` : "";
    return (s.lines || []).map((line) => `${title}${line}`);
  });
  const life = item.lifePlain?.lines || [];
  const lines = [...sectionLines.slice(0, 8), ...life.slice(0, 5)];
  const years = reading.tenYear?.years || [];
  years.slice(0, 2).forEach((ten) => {
    if (!ten) return;
    const tip =
      item.id === "wealth"
        ? ten.wealth?.text
        : item.id === "career" || item.id === "business"
          ? ten.career?.text
          : item.id === "marriage" || item.id === "compatibility"
            ? ten.love?.text
            : ten.headline;
    if (tip) {
      lines.push(
        `${ten.year}년 세운(${ten.gzKo || ten.gz || ""} · ${ten.level || ""} ${ten.score ?? ""}점): ${tip}`,
      );
    }
  });
  if (reading.profile?.role) {
    lines.push(
      `현재 역할 설정은 ${reading.profile.role === "owner" ? "사업가" : reading.profile.role === "seeker" ? "취업준비" : "직장인"} 기준으로 읽어, 실행 단위를 그에 맞게 잡습니다.`,
    );
  }
  return uniq(lines);
}

function futureLines(item, reading) {
  const lines = [];
  (item.timing?.lines || []).forEach((l) => lines.push(l));
  (item.taegilGuide?.lines || []).forEach((l) => lines.push(l));
  (item.majors?.lines || []).forEach((l) => lines.push(l));
  (item.months || []).slice(0, 6).forEach((m) => {
    if (m?.body) lines.push(`${m.month}월 · ${m.body}${m.tip ? ` — ${m.tip}` : ""}`);
  });
  const decades = reading.guide?.decades || reading.chart?.daYun?.cycles || [];
  decades.slice(0, 4).forEach((d) => {
    const label = d.gzKo || d.gz || "";
    const span = d.startYear && d.endYear ? `${d.startYear}–${d.endYear}` : "";
    const text = d.text || d.level || "";
    if (label || text) lines.push(`대운 ${label} ${span}: ${text}`.trim());
  });
  (reading.tenYear?.years || []).slice(0, 3).forEach((y) => {
    if (y?.headline) lines.push(`세운 ${y.year}: ${y.headline}`);
  });
  if (!lines.length) {
    const ys = yongsin(reading.chart);
    lines.push(
      `도움이 되는 기운 ${favorBundlePhrase(ys.hee, item.id)}이 들어오는 해·달에 ${item.title} 관련 일정이 비교적 수월합니다. 월운·세운 표를 함께 보세요.`,
    );
  }
  lines.push(
    `${item.title}의 ‘좋은 때’는 점수가 높은 해만이 아니라, 서류·수면·관계가 준비된 날입니다. 단정적 예언이 아니라 점검 기준으로 쓰세요.`,
  );
  return uniq(lines);
}

function cautionLines(item, reading) {
  const chart = reading.chart;
  const ys = yongsin(chart);
  const lines = [
    `과하면 부담이 되기 쉬운 기운 ${favorBundlePhrase(ys.gi, item.id)}이 센 날에는 큰 결정을 하루 미루는 편이 안전합니다.`,
    `공망(${chart.xunKong || "—"})이 뜨는 구간에서는 약속·계약 문구를 한 번 더 확인하세요.`,
  ];
  if (item.id === "health") {
    lines.push("컨디션이 떨어지면 일정을 하나 줄이는 것이 가장 싼 개운입니다. 사주로 질병을 진단하지 않습니다.");
  }
  if (item.id === "wealth") {
    lines.push("보증·당일 큰 송금·비교 소비는 ‘하지 않을 일’로 메모해 두세요.");
    lines.push("흥분이 큰 날과 장부를 맞추는 날을 하루 이상 나누면 실수가 줄어듭니다.");
  }
  if (item.id === "business") {
    lines.push("동업·대출·대규모 재고는 계약서와 현금흐름표를 같은 날에 맞추지 마세요.");
    lines.push("확장·채용·광고 중 하나만 고르고, 나머지는 한 분기 미루는 편이 안전합니다.");
  }
  if (item.id === "moving") {
    lines.push("현장 확인 날과 계약·등기 날을 하루 이상 나누고, 계약금은 확인 전에 보내지 마세요.");
  }
  if (item.id === "travel") {
    lines.push("점수 낮은 달에는 장거리보다 근교 회복을 고르고, 출국 전 이틀 수면을 지키세요.");
  }
  if (item.id === "marriage" || item.id === "compatibility") {
    lines.push("감정적인 장문·즉흥 약속은 하루 미루고, 양가·주거·예산 메모를 먼저 맞추세요.");
  }
  (reading.guide?.risks || []).slice(0, 3).forEach((risk) => {
    if (risk?.warning) lines.push(`${risk.title || "주의"}: ${risk.warning}`);
    if (risk?.remedy) lines.push(`막는 법 · ${risk.remedy}`);
  });
  return uniq(lines);
}

function practiceLines(item, reading) {
  const actions = item.actions?.length ? item.actions : [];
  const life = item.lifePlain?.lines || [];
  const bridge = item.bridge?.paragraphs || [];
  // 주제 고유 실천만 — 공통 습관/색 팁은 리포트당 1회
  const lines = [...actions, ...life.slice(-3), ...bridge.slice(0, 2)];
  const ys = yongsin(reading.chart);
  lines.push(
    `이번 주 ${item.title} 점검: 할 일 하나 · 하지 않을 일 하나 · 도움 기운(${favorBundlePhrase(ys.hee, item.id)})을 들이는 작은 규칙 하나를 달력에 적으세요.`,
  );
  if (!sharedPracticeTipsEmitted) {
    sharedPracticeTipsEmitted = true;
    if (reading.guide?.table?.habit) lines.push(`생활 습관 참고(공통): ${reading.guide.table.habit}`);
    if (reading.guide?.palette?.items?.length) {
      const colors = reading.guide.palette.items
        .slice(0, 3)
        .map((c) => `${c.title || ""} ${c.name || ""}`.trim())
        .filter(Boolean)
        .join(", ");
      if (colors) lines.push(`색·분위기 참고(공통·도움이 되는 기운): ${colors}`);
    }
  }
  if (!actions.length && !life.length) {
    lines.push(`${item.title}에서 숫자·약속·사람을 같은 달력에 옮기는 것부터 시작하세요.`);
  }
  return uniq(lines);
}

/**
 * @returns {{ title: string, lines: string[] }[]}
 */
export function buildTopicCounselSections(item, reading, western) {
  const chart = reading.chart;
  const sections = [
    { title: "원인 분석", lines: causeLines(item, chart) },
    { title: "타고난 성향", lines: innateLines(item, reading) },
    { title: "현재 상황", lines: currentLines(item, reading) },
    { title: "향후 흐름", lines: futureLines(item, reading) },
    { title: "주의할 점", lines: cautionLines(item, reading) },
    { title: "생활 속 실천 조언", lines: practiceLines(item, reading) },
  ];

  // 짧은 교차 렌즈는 별도 장으로 고립되지 않게 주의/실천에 흡수
  const engines = pickEngineLines(reading, item.id);
  const west = westernLines(western, item.id, item);
  const caution = sections.find((s) => s.title === "주의할 점");
  const practice = sections.find((s) => s.title === "생활 속 실천 조언");
  if (engines.length && caution) {
    caution.lines = uniq([...caution.lines, ...engines.map((l) => `역학 포인트 · ${l}`)]);
  } else if (engines.length) {
    sections.push({ title: "이 주제와 맞닿은 역학 포인트", lines: engines });
  }
  if (west.length && practice) {
    practice.lines = uniq([...west.map((l) => `서양 교차 · ${l}`), ...practice.lines]);
  } else if (west.length) {
    sections.push({ title: "서양 점성술 · 주제 교차", lines: west });
  }

  // 주제 간 동일·유사 긴 문장만 1회 유지(섹션 내부는 이미 uniq)
  return sections
    .map((s) => ({
      ...s,
      lines: (s.lines || []).map(takeSharedFresh).filter(Boolean),
    }))
    .filter((s) => s.lines.length > 0);
}
