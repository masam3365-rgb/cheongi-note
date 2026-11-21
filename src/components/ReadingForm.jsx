import { useState } from "react";
import PersonFields from "./PersonFields";

export function emptyPerson() {
  return {
    surname: "",
    given: "",
    surnameHanja: "",
    givenHanja: "",
    calendar: "solar",
    leap: false,
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "",
    gender: "",
    yaja: false,
    status: "",
    role: "",
  };
}

const STATUSES = [
  ["single", "미혼"],
  ["married", "기혼"],
];

const ROLES = [
  ["employee", "직장인"],
  ["owner", "사업가"],
  ["seeker", "취업준비생"],
];

export default function ReadingForm({ onSubmit, onClear }) {
  const [self, setSelf] = useState(emptyPerson);
  const [withPartner, setWithPartner] = useState(false);
  const [partner, setPartner] = useState(emptyPerson);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const payload = {
        ...self,
        minute: self.minute === "" ? "0" : self.minute,
        partner: withPartner
          ? { ...partner, minute: partner.minute === "" ? "0" : partner.minute }
          : null,
      };
      onSubmit(payload);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "명식을 풀지 못했습니다.");
    }
  }

  function clearAll() {
    setSelf(emptyPerson());
    setPartner(emptyPerson());
    setWithPartner(false);
    setError("");
    onClear?.();
  }

  return (
    <form id="reading" onSubmit={submit} className="min-w-0 scroll-mt-24 rounded-3xl border border-white/10 bg-ink/80 p-4 shadow-2xl shadow-black/30 sm:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.28em] text-gold/80">명식 입력</p>
          <h2 className="mt-2 break-words-tight font-serif text-2xl text-cream sm:text-3xl">아홉 갈래가 같이 읽는 출생 정보</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-mist">
          생시와 이름이 바뀌면 사주, 자미 명궁, 기문 시반, 주역 동효가 함께 다시 깔립니다. 입력 내용은 브라우저에 저장하지
          않습니다.
        </p>
      </div>
      <PersonFields title="본인" value={self} onChange={setSelf} />
      <fieldset className="mt-6 space-y-3">
        <legend className="text-sm text-gold">운세 보기 전, 지금의 자리</legend>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={self.status === id}
              className={`touch-target rounded-full px-4 py-2.5 text-sm ${self.status === id ? "bg-gold text-night" : "border border-white/15 text-mist"}`}
              onClick={() => setSelf({ ...self, status: id })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {ROLES.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={self.role === id}
              className={`touch-target rounded-full px-4 py-2.5 text-sm ${self.role === id ? "bg-gold text-night" : "border border-white/15 text-mist"}`}
              onClick={() => setSelf({ ...self, role: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-8 border-t border-white/10 pt-6">
        <label className="flex items-center gap-3 text-sm text-cream">
          <input type="checkbox" checked={withPartner} onChange={(event) => setWithPartner(event.target.checked)} />
          궁합을 볼 상대가 있습니다
        </label>
        {withPartner ? (
          <div className="mt-5">
            <PersonFields title="상대" value={partner} onChange={setPartner} />
          </div>
        ) : null}
      </div>
      {error ? <p className="mt-5 rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className="w-full rounded-full bg-gold px-6 py-3 font-medium text-night transition hover:bg-gold-deep sm:w-auto">
          내 흐름 무료 요약 보기
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="w-full rounded-full border border-white/20 px-6 py-3 text-sm text-mist transition hover:border-gold/40 hover:text-gold sm:w-auto"
        >
          입력·결과 모두 지우기
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-mist">개인정보 보호를 위해 이름·생년월일은 로컬 스토리지에 남기지 않습니다.</p>
    </form>
  );
}
