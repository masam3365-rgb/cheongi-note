/**
 * 보고서 입력 정규화 — Puppeteer 비의존 (Vercel HTML API용)
 */

export function buildFormFromInput(input) {
  const year = Number(input.year);
  const month = Number(input.month);
  const day = Number(input.day);
  const hour = input.unknownTime || input.hour === "" || input.hour == null ? 12 : Number(input.hour);
  const minute = input.unknownTime || input.minute === "" || input.minute == null ? 0 : Number(input.minute);
  const surname = String(input.surname ?? "").trim() || "고";
  const given = String(input.given ?? "").trim() || "객";
  const gender = input.gender === "female" || input.gender === "여" ? "female" : "male";
  const calendar = input.calendar === "lunar" || input.calendar === "음력" ? "lunar" : "solar";

  if (!Number.isFinite(year) || year < 1900 || year > 2100) throw new Error("출생 연도가 올바르지 않습니다.");
  if (!Number.isFinite(month) || month < 1 || month > 12) throw new Error("출생 월이 올바르지 않습니다.");
  if (!Number.isFinite(day) || day < 1 || day > 31) throw new Error("출생 일이 올바르지 않습니다.");

  return {
    surname,
    given,
    gender,
    calendar,
    year,
    month,
    day,
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
    unknownTime: Boolean(input.unknownTime),
    yaja: Boolean(input.yaja),
    status: input.status === "married" || input.status === "기혼" ? "married" : "single",
    role: input.role === "owner" || input.role === "사업" ? "owner" : "employee",
  };
}

export function productMode(product) {
  const p = String(product || "full").toLowerCase();
  if (p === "single" || p === "단품") return { mode: "single", topicId: "wealth", label: "단품" };
  if (p === "triple" || p === "3종") {
    return { mode: "triple", selected: ["wealth", "career", "marriage"], label: "3종맞춤" };
  }
  return { mode: "full", selected: null, label: "풀패키지" };
}
