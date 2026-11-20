const ROLES = {
  employee: {
    label: "직장인",
    wealth: "월급, 성과급, 승진에 묶인 돈이 중심입니다. 부업은 회사 규정을 확인한 뒤에만 여세요.",
    career: "보고, 평가, 팀 역할이 올해 직업운의 본체입니다. 문서로 남긴 성과가 점수가 됩니다.",
    chance: "회의와 평가 전에 성과를 한 장으로 정리하세요.",
    caution: "메신저로만 한 약속은 메일로 한 줄 더 남기세요.",
  },
  owner: {
    label: "사업가",
    wealth: "매출보다 입금일과 미수금이 중심입니다. 판을 키우기 전에 받는 돈부터 잠그세요.",
    career: "사람을 더 쓰기 전에 이번 달 고정비와 역할을 적으세요. 대표의 시간이 곧 사업의 속도입니다.",
    chance: "단골과 기존 계약에서 추가 주문을 만드는 달이 이득입니다.",
    caution: "외상과 재고를 같은 달에 늘리지 마세요.",
  },
  seeker: {
    label: "취업준비생",
    wealth: "합격 전의 재물운은 큰 투자가 아니라 시험·면접 비용과 첫 월급의 시점입니다.",
    career: "많이 지원하기보다 맞는 세 곳에 깊게 쓰세요. 자격과 포트폴리오가 소개를 대신합니다.",
    chance: "서류와 면접 일정을 이번 주에 확정하면 기회가 붙습니다.",
    caution: "결과 대기 중의 충동 소비와 야식 약속을 줄이세요.",
  },
};

const STATUSES = {
  single: {
    label: "미혼",
    love: "새 만남과 관계의 속도를 봅니다. 확정 전에는 한 사람에게 시간을 쓰세요.",
    chance: "소개와 모임에서는 한 사람과 다음 약속을 정하세요.",
    caution: "여러 대화를 동시에 끌면 오해가 커집니다.",
  },
  married: {
    label: "기혼",
    love: "새 인연보다 배우자와 생활의 온도를 봅니다. 돈과 일정은 둘이 같이 적으세요.",
    chance: "배우자와 식사 한 끼, 일정 한 줄을 같이 잡으세요.",
    caution: "집안 돈을 혼자 결정하거나 비교하는 말을 피하세요.",
  },
};

export function readProfile(raw) {
  const role = ROLES[raw?.role];
  const status = STATUSES[raw?.status];
  if (!status) throw new Error("미혼인지 기혼인지 골라 주세요.");
  if (!role) throw new Error("직장인, 사업가, 취업준비생 중에서 골라 주세요.");
  return {
    role: raw.role,
    status: raw.status,
    roleLabel: role.label,
    statusLabel: status.label,
    wealth: role.wealth,
    career: role.career,
    love: status.love,
    wealthChance: role.chance,
    wealthCaution: role.caution,
    careerChance: role.chance,
    careerCaution: role.caution,
    loveChance: status.chance,
    loveCaution: status.caution,
  };
}
