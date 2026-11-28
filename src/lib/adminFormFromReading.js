/**
 * 관리자 보고서용 명식 입력 복원·정규화.
 * 무료 요약 실행 없이도 관리자 패널 자체 입력으로 생성 가능해야 한다.
 */

export function emptyAdminDraft() {
  return {
    surname: "",
    given: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    unknownTime: false,
    yaja: true,
    gender: "",
    calendar: "solar",
    status: "single",
    role: "employee",
  };
}

/** 무료 요약(reading)에서 관리자 명식 초안 복원 */
export function adminFormFromReading(reading) {
  if (!reading?.chart || !reading?.profile) return null;
  const displayName = String(reading.displayName || "").trim();
  const surname = displayName.slice(0, 1) || "고";
  const given = displayName.slice(1) || "객";
  const solar = reading.chart.solar || {};
  const unknownTime = Boolean(reading.chart.hourUnknown || reading.notices?.hourUnknown);
  let hour = "";
  let minute = "";
  const clock = String(reading.chart.clock || "");
  const match = clock.match(/^(\d{1,2}):(\d{2})$/);
  if (!unknownTime && match) {
    hour = String(Number(match[1]));
    minute = String(Number(match[2]));
  }
  return {
    surname,
    given,
    year: solar.year != null ? String(solar.year) : "",
    month: solar.month != null ? String(solar.month) : "",
    day: solar.day != null ? String(solar.day) : "",
    hour,
    minute,
    unknownTime,
    yaja: Boolean(reading.chart.yaja),
    gender: reading.chart.gender === "female" ? "female" : "male",
    calendar: "solar",
    status: reading.profile.status === "married" ? "married" : "single",
    role: reading.profile.role === "owner" ? "owner" : reading.profile.role === "seeker" ? "seeker" : "employee",
  };
}

/** lastForm(무료 제출값) 또는 reading 에서 초안 */
export function resolveAdminForm(lastForm, reading) {
  if (lastForm?.year && lastForm?.month && lastForm?.day && lastForm?.gender) {
    return {
      ...emptyAdminDraft(),
      ...lastForm,
      year: String(lastForm.year ?? ""),
      month: String(lastForm.month ?? ""),
      day: String(lastForm.day ?? ""),
      hour: lastForm.unknownTime ? "" : String(lastForm.hour ?? ""),
      minute: lastForm.unknownTime ? "" : String(lastForm.minute ?? lastForm.minute === 0 ? "0" : ""),
      unknownTime: Boolean(lastForm.unknownTime || lastForm.hour === "" || lastForm.hour == null),
      surname: String(lastForm.surname || ""),
      given: String(lastForm.given || ""),
      gender: lastForm.gender,
      calendar: lastForm.calendar === "lunar" ? "lunar" : "solar",
      status: lastForm.status === "married" ? "married" : "single",
      role: lastForm.role === "owner" ? "owner" : lastForm.role === "seeker" ? "seeker" : "employee",
      yaja: Boolean(lastForm.yaja),
    };
  }
  return adminFormFromReading(reading);
}

/** API·생성 가능 여부 (무료 요약 여부 무관) */
export function isAdminDraftReady(draft) {
  if (!draft) return false;
  const year = Number(draft.year);
  const month = Number(draft.month);
  const day = Number(draft.day);
  const surname = String(draft.surname || "").trim();
  const given = String(draft.given || "").trim();
  if (!/^[가-힣]{1,5}$/.test(surname) || !/^[가-힣]{1,5}$/.test(given)) return false;
  if (!Number.isFinite(year) || year < 1900 || year > 2100) return false;
  if (!Number.isFinite(month) || month < 1 || month > 12) return false;
  if (!Number.isFinite(day) || day < 1 || day > 31) return false;
  if (draft.gender !== "female" && draft.gender !== "male") return false;
  if (!draft.unknownTime) {
    const hour = Number(draft.hour);
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) return false;
  }
  return true;
}

/** /api/admin/report 용 페이로드 정규화 */
export function normalizeAdminPayload(draft, product, selected) {
  const unknownTime = Boolean(draft.unknownTime || draft.hour === "" || draft.hour == null);
  const topics = Array.isArray(selected) && selected.length ? selected : ["wealth"];
  return {
    surname: String(draft.surname || "").trim(),
    given: String(draft.given || "").trim(),
    year: Number(draft.year),
    month: Number(draft.month),
    day: Number(draft.day),
    hour: unknownTime ? 12 : Number(draft.hour),
    minute: unknownTime
      ? 0
      : Number(draft.minute === "" || draft.minute == null ? 0 : draft.minute),
    unknownTime,
    yaja: Boolean(draft.yaja),
    gender: draft.gender === "female" ? "female" : "male",
    calendar: draft.calendar === "lunar" ? "lunar" : "solar",
    status: draft.status === "married" ? "married" : "single",
    role: draft.role === "owner" ? "owner" : draft.role === "seeker" ? "seeker" : "employee",
    product: product || "full",
    topicId: topics[0],
    selected: topics,
    format: "html",
  };
}
