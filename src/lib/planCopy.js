/**
 * 사업·이사·여행 생활 풀이 — 이미 계산된 chart/guide/forecast/taegil/qimen만 사용.
 * 임의 운세·미래 확정 문구를 만들지 않음.
 */

const LIFE_BY_STEM = {
  갑: "내 중심 기운이 곧은 나무에 가깝습니다. 계획을 크게 잡을 때일수록, 마감과 장부를 같은 주에 닫으면 마음이 편합니다.",
  을: "내 중심 기운이 유연한 줄기에 가깝습니다. 사람·일정과 맞출 때 강점이 있으니, 중요한 일정만 미리 말해 두면 오해가 줄어듭니다.",
  병: "내 중심 기운이 밝은 불에 가깝습니다. 자리를 데우는 힘이 있으니, 제안·미팅 뒤에는 숫자와 날짜만 짧게 남겨 두세요.",
  정: "내 중심 기운이 은은한 등불에 가깝습니다. 꾸준히 챙기는 힘이 있으니, 주간 점검 한 줄이 불안을 줄여 줍니다.",
  무: "내 중심 기운이 산처럼 든든한 편입니다. 기반을 지키는 힘이 있으니, 급한 확장보다 일정·역할을 먼저 나누면 흔들림이 덜합니다.",
  기: "내 중심 기운이 밭을 가꾸는 결에 가깝습니다. 실무를 챙기는 힘이 있으니, 작은 절차를 끝까지 마감하는 편이 신뢰를 만듭니다.",
  경: "내 중심 기운이 잘라 정리하는 결에 가깝습니다. 기준을 세우는 힘이 있으니, 맞는 말도 한 톤 낮추면 협의가 수월합니다.",
  신: "내 중심 기운이 다듬어진 결에 가깝습니다. 품질을 보는 눈이 있으니, 완성도·서류 상태를 먼저 보면 선택이 또렷해집니다.",
  임: "내 중심 기운이 큰 물결에 가깝습니다. 흐름을 읽는 힘이 있으니, 혼자 결론 내기 전에 공유 시점을 정해 두면 좋습니다.",
  계: "내 중심 기운이 가는 물줄기에 가깝습니다. 세밀히 살피는 힘이 있으니, 체크리스트를 짧게 두면 실수가 줄어듭니다.",
};

const LIFE_BY_YONG = {
  목: "지금 도움이 되기 쉬운 쪽은 ‘새 일·배움·확장’입니다. 새 항목은 주 1개만 실행하고 나머지는 대기열에 두세요.",
  화: "지금 도움이 되기 쉬운 쪽은 ‘사람·표현·연결’입니다. 만남이 있는 날에는 다음 할 일을 한 줄로 남겨 두세요.",
  토: "지금 도움이 되기 쉬운 쪽은 ‘운영·안정·정리’입니다. 범위와 비용을 문장으로 적어두면 과부하가 줄어듭니다.",
  금: "지금 도움이 되기 쉬운 쪽은 ‘마감·기준·정산’입니다. 기한과 결과물을 같은 메모에 두면 판단이 선명해집니다.",
  수: "지금 도움이 되기 쉬운 쪽은 ‘전략·정보·타이밍’입니다. 급하게 답하기보다 하루를 자고 회신하는 규칙이 도움이 됩니다.",
};

const DIR = { 목: "동·동남", 화: "남", 토: "중앙·가까운 곳", 금: "서·북서", 수: "북" };

function stemLine(chart) {
  const stem = chart?.dayMasterKo;
  if (stem && LIFE_BY_STEM[stem]) return LIFE_BY_STEM[stem];
  return "중심 기운 값이 충분하지 않아 일반적인 참고로만 말씀드립니다. 큰 결정보다 이번 주 확인할 숫자·일정 하나만 먼저 적어두세요.";
}

function yongLine(chart) {
  const yong = chart?.strength?.favorable?.[0];
  if (yong && LIFE_BY_YONG[yong]) return LIFE_BY_YONG[yong];
  return "도움이 되는 기운 값이 뚜렷하지 않습니다. 이럴 때는 추측보다, 이번 주 점검할 항목 하나만 골라 보세요.";
}

function decadeLine(guide) {
  const decades = (guide?.decades || []).filter(
    (c) => c?.gzKo && c.gzKo !== "대운 전" && c.startYear && c.endYear,
  );
  const focus = decades.find((c) => typeof c.score === "number" && c.score >= 68) || decades[0];
  if (focus) {
    const level = focus.level ? `(${focus.level})` : "";
    return `큰 흐름(대략 10년)으로 ${focus.startYear}–${focus.endYear}년 ${focus.gzKo}${level} 구간이 자료에 있습니다. 이 시기에도 앞날을 단정하지 말고, 장부·일정·휴식을 먼저 맞춰 보시면 됩니다.`;
  }
  return "지금은 대운 구간 자료가 충분하지 않습니다. 추측하기보다 이번 달 할 일 하나만 적어 두세요.";
}

function byId(list, id) {
  return Array.isArray(list) ? list.find((item) => item.id === id) : null;
}

function uniqueLines(lines) {
  const seen = new Set();
  const out = [];
  for (const line of lines.filter(Boolean)) {
    const key = String(line).replace(/\s+/g, "").slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

/** @param {"business"|"moving"|"travel"} topic */
export function buildPlanLifePlain(topic, reading) {
  const chart = reading?.chart;
  const guide = reading?.guide;
  const lines = [];
  lines.push(stemLine(chart));
  lines.push(yongLine(chart));

  if (topic === "business") {
    const wealth = byId(reading?.forecast, "wealth");
    const strong = chart?.strength?.strong;
    lines.push(
      strong
        ? "사업·확장을 볼 때: 자료를 기준으로 보면 혼자 밀고 가는 힘이 있는 편입니다. 다만 장부·세무처럼 숫자로 잠그는 부분은 한 사람에게 더 보여 주세요. 성공·실패를 단정하지는 않습니다."
        : "사업·협업을 볼 때: 자료를 기준으로 보면 역할을 나눌 때 숨이 트이기 쉬운 편입니다. 시작 전에 지분·역할·종료 조건을 적어 두면 좋습니다. 성패를 단정하지는 않습니다.",
    );
    if (wealth?.summary) {
      lines.push(`재물·현금 흐름 참고: ${wealth.summary}`);
    } else {
      lines.push("재물 요약 값이 부족하면, ‘팔렸다’보다 ‘통장에 들어왔는지’만 이번 주 기준으로 확인해 보세요.");
    }
    lines.push(
      "지금 실천할 일 한 가지: 확장·채용·광고 중 하나만 고르거나, 이번 주 장부 확인일을 달력에 한 칸 비워 두세요.",
    );
  } else if (topic === "moving") {
    const move = byId(reading?.forecast, "move");
    const qimen = (reading?.engines || []).find((x) => x.id === "qimen");
    const picks = reading?.taegil?.picks?.move?.slice?.(0, 2) || [];
    const fill = chart?.strength?.favorable?.[0];
    lines.push(
      move?.summary
        ? `이사·매매 참고: ${move.summary}`
        : "이사·매매는 ‘좋은 집’보다 서류·등기가 깔끔히 열리는지를 먼저 보면 판단이 쉬워집니다. 길흉을 단정하지는 않습니다.",
    );
    if (picks.length) {
      lines.push(
        `택일 자료에 가까운 후보일이 있습니다: ${picks.map((item) => `${item.month}월 ${item.day}일`).join(", ")}. 후보일이어도 현장 확인 전에는 계약금을 보내지 마세요.`,
      );
    } else {
      lines.push(
        "가까운 택일 후보가 비어 있으면, 현장 확인 날과 계약 날을 하루 이상 나누는 것부터 적용해 보세요.",
      );
    }
    if (qimen?.doors) {
      lines.push(
        `방위·동선 자료: 숨이 트이기 쉬운 쪽 ${qimen.doors.생문}, 일과 만남 쪽 ${qimen.doors.개문}. 배치를 단정하지 말고 채광·소음과 함께 참고하세요.`,
      );
    } else if (fill) {
      lines.push(
        `도움이 되기 쉬운 기운 ${fill} 쪽(${DIR[fill] || "밝은 쪽"}) 채광·통풍을 우선해 보시면 됩니다.`,
      );
    }
    lines.push(
      "지금 실천할 일 한 가지: 계약금·등기 서류 체크리스트를 한 장으로 만들고, 현장 확인 전 송금은 하지 않기로 메모하세요.",
    );
  } else if (topic === "travel") {
    const fill = chart?.strength?.favorable?.[0];
    const qimen = (reading?.engines || []).find((x) => x.id === "qimen");
    const year = reading?.yearFortune?.defaultYear;
    const months = (reading?.yearFortune?.byYear?.[year]?.months || [])
      .filter((item) => item.score >= 70)
      .slice(0, 3)
      .map((item) => `${item.month}월`);
    lines.push(
      fill
        ? `여행·출장 방향을 자료로 보면, 도움이 되기 쉬운 기운은 ${fill}이라 ${DIR[fill] || "채광 좋은 쪽"}을 우선해 볼 수 있습니다. 반드시 그쪽으로만 가야 한다는 뜻은 아닙니다.`
        : "방향 값이 부족하면, 같은 거리라도 숙소의 채광·수면부터 고르는 편이 회복에 도움이 됩니다.",
    );
    if (qimen?.doors) {
      lines.push(
        `방위·동선 참고: 일과 만남 ${qimen.doors.개문}, 휴식 ${qimen.doors.휴문}. 숙소·일정을 고를 때 보조로만 쓰세요.`,
      );
    }
    if (months.length) {
      lines.push(
        `월운 점수 자료상 비교적 수월해 보이는 달: ${months.join(", ")}. 목적이 하나인 짧은 일정부터 잡아 보세요.`,
      );
    } else {
      lines.push(
        "점수 높은 달 목록이 비어 있으면, 장거리보다 2박 이내·근교부터 회복 일정으로 잡아 보세요.",
      );
    }
    lines.push(
      "지금 실천할 일 한 가지: 출국·출발 전 이틀 수면만 지키기로 달력에 표시해 두세요.",
    );
  }

  lines.push(decadeLine(guide));
  if (topic === "business") {
    lines.push("이 안내는 사업·현금 흐름 참고용이며, 성패·수익을 예언하거나 단정하지 않습니다.");
  } else if (topic === "moving") {
    lines.push("이 안내는 이사·주거 일정 참고용이며, 부동산 손익·길흉을 예언하거나 단정하지 않습니다.");
  } else {
    lines.push("이 안내는 여행·출장 일정 참고용이며, 길흉을 예언하거나 단정하지 않습니다.");
  }

  const title =
    topic === "business"
      ? "생활 속 사업운 풀이"
      : topic === "moving"
        ? "생활 속 이사·주거 풀이"
        : "생활 속 여행·출장 풀이";

  return { title, lines: uniqueLines(lines) };
}
