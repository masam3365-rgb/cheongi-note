/**
 * 무료 요약(reading)에서 관리자 보고서 API용 명식 입력을 복원.
 * lastForm 이 없을 때도 보고서 생성이 가능하도록 한다.
 */
export function adminFormFromReading(reading) {
  if (!reading?.chart || !reading?.profile) return null;
  const displayName = String(reading.displayName || "").trim();
  const surname = displayName.slice(0, 1) || "고";
  const given = displayName.slice(1) || "객";
  const solar = reading.chart.solar || {};
  const unknownTime = Boolean(reading.chart.hourUnknown || reading.notices?.hourUnknown);
  let hour = 12;
  let minute = 0;
  const clock = String(reading.chart.clock || "");
  const match = clock.match(/^(\d{1,2}):(\d{2})$/);
  if (!unknownTime && match) {
    hour = Number(match[1]);
    minute = Number(match[2]);
  }
  return {
    surname,
    given,
    year: solar.year,
    month: solar.month,
    day: solar.day,
    hour,
    minute,
    unknownTime,
    yaja: Boolean(reading.chart.yaja),
    gender: reading.chart.gender === "female" ? "female" : "male",
    calendar: "solar",
    status: reading.profile.status,
    role: reading.profile.role === "owner" ? "owner" : "employee",
  };
}

export function resolveAdminForm(lastForm, reading) {
  if (lastForm?.year && lastForm?.month && lastForm?.day && lastForm?.gender) {
    return lastForm;
  }
  return adminFormFromReading(reading);
}
