import { useRef, useState } from "react";
import {
  givenChoices,
  hangulOnly,
  preferredGiven,
  preferredSurname,
  surnameChoices,
} from "../lib/hanjaSuggest";
import { hanjaMeta } from "../lib/nameology";

const FIELD =
  "w-full min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-base text-cream outline-none transition focus-visible:border-gold/70 sm:min-h-0 sm:py-2.5 sm:text-sm";

function setField(value, onChange, key, next) {
  onChange({ ...value, [key]: next });
}

export default function PersonFields({ value, onChange, title }) {
  const auto = useRef({ surname: "", given: "" });
  const composing = useRef({ surname: false, given: false });
  const [givenDraft, setGivenDraft] = useState([]);
  const hour = Number(value.hour);
  const surnameOptions = surnameChoices(value.surname);
  const givenOptions = givenChoices(value.given);
  const canConvert = surnameOptions.length > 0 || givenOptions.some((item) => item.choices.length > 0);

  function commitHangul(key, raw) {
    const text = hangulOnly(raw).slice(0, 5);
    const next = { ...value, [key]: text };
    const hanjaKey = key === "surname" ? "surnameHanja" : "givenHanja";
    const current = value[hanjaKey];
    if (!current || current === auto.current[key]) {
      const suggested = key === "surname" ? preferredSurname(text) : preferredGiven(text);
      next[hanjaKey] = suggested;
      auto.current[key] = suggested;
    }
    if (key === "given") setGivenDraft([]);
    onChange(next);
  }

  function changeHangul(key, event) {
    const raw = event.target.value;
    // 한글 조합(IME composition) 중에는 필터·한자 자동완성·글자수 자르기를 하지 않음
    if (composing.current[key] || event.nativeEvent?.isComposing) {
      onChange({ ...value, [key]: raw });
      return;
    }
    commitHangul(key, raw);
  }

  function startCompose(key) {
    composing.current[key] = true;
  }

  function endCompose(key, event) {
    composing.current[key] = false;
    commitHangul(key, event.target.value);
  }

  function fillSuggested() {
    const surnameHanja = preferredSurname(value.surname) || value.surnameHanja;
    const givenHanja = preferredGiven(value.given) || value.givenHanja;
    auto.current = { surname: surnameHanja, given: givenHanja };
    onChange({ ...value, surnameHanja, givenHanja });
  }

  const hint =
    value.hour === "" || Number.isNaN(hour)
      ? "시각을 모르면 가장 가까운 기억으로 적습니다."
      : `${hour}시는 ${shichen(hour)}시 근처입니다. 23시는 야자시 선택에 따라 일주가 갈립니다.`;

  return (
    <fieldset className="space-y-4">
      <legend className="font-serif text-xl text-gold">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm text-mist">
          한글 성
          <input
            className={FIELD}
            value={value.surname}
            autoComplete="off"
            inputMode="text"
            lang="ko"
            onChange={(event) => changeHangul("surname", event)}
            onCompositionStart={() => startCompose("surname")}
            onCompositionUpdate={() => startCompose("surname")}
            onCompositionEnd={(event) => endCompose("surname", event)}
          />
        </label>
        <label className="space-y-1.5 text-sm text-mist">
          한글 이름
          <input
            className={FIELD}
            value={value.given}
            autoComplete="off"
            inputMode="text"
            lang="ko"
            onChange={(event) => changeHangul("given", event)}
            onCompositionStart={() => startCompose("given")}
            onCompositionUpdate={() => startCompose("given")}
            onCompositionEnd={(event) => endCompose("given", event)}
          />
        </label>
        <label className="space-y-1.5 text-sm text-mist">
          한자 성
          <input
            className={FIELD}
            value={value.surnameHanja}
            lang="zh"
            autoComplete="off"
            placeholder="추천 선택 또는 직접 입력·붙여넣기"
            onChange={(event) => setField(value, onChange, "surnameHanja", keepHanja(event.target.value))}
          />
          <HanjaMetaChips text={value.surnameHanja} />
        </label>
        <label className="space-y-1.5 text-sm text-mist">
          한자 이름
          <input
            className={FIELD}
            value={value.givenHanja}
            lang="zh"
            autoComplete="off"
            placeholder="추천에 없어도 직접 입력·붙여넣기 가능"
            onChange={(event) => setField(value, onChange, "givenHanja", keepHanja(event.target.value))}
          />
          <HanjaMetaChips text={value.givenHanja} />
        </label>
      </div>
      {canConvert ? (
        <div className="space-y-3 rounded-2xl border border-gold/20 bg-white/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs tracking-wide text-gold">추천 한자</p>
            <button type="button" className="rounded-full border border-gold/40 px-3 py-1.5 text-xs text-gold" onClick={fillSuggested}>
              추천 한자로 채우기
            </button>
          </div>
          {surnameOptions.length > 0 ? (
            <ChoiceRow
              label="성"
              choices={surnameOptions}
              selected={value.surnameHanja}
              onPick={(hanja) => {
                auto.current.surname = hanja;
                onChange({ ...value, surnameHanja: hanja });
              }}
            />
          ) : null}
          {givenOptions.map((item, index) =>
            item.choices.length > 0 ? (
              <ChoiceRow
                key={`${item.syllable}-${index}`}
                label={item.syllable}
                choices={item.choices}
                selected={([...value.givenHanja].length === givenOptions.length ? [...value.givenHanja][index] : "") || givenDraft[index] || ""}
                onPick={(hanja) => {
                  const base =
                    [...value.givenHanja].length === givenOptions.length ? [...value.givenHanja] : [...givenDraft];
                  while (base.length < givenOptions.length) base.push("");
                  base[index] = hanja;
                  const parts = base.slice(0, givenOptions.length);
                  if (parts.every(Boolean)) {
                    const next = parts.join("");
                    auto.current.given = next;
                    setGivenDraft([]);
                    onChange({ ...value, givenHanja: next });
                  } else {
                    setGivenDraft(parts);
                  }
                }}
              />
            ) : (
              <p key={`${item.syllable}-${index}`} className="text-xs text-mist">
                {topic(item.syllable)} 추천 목록에 없습니다. 한자 이름 칸에 음절마다 직접 적으면 됩니다.
              </p>
            ),
          )}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {[
          ["solar", "양력"],
          ["lunar", "음력"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value.calendar === id}
            className={`touch-target rounded-full px-4 py-2.5 text-sm ${value.calendar === id ? "bg-gold text-night" : "border border-white/15 text-mist"}`}
            onClick={() => onChange({ ...value, calendar: id, leap: id === "solar" ? false : value.leap })}
          >
            {label}
          </button>
        ))}
        <label className="touch-target inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-mist">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={value.leap}
            disabled={value.calendar !== "lunar"}
            onChange={(event) => setField(value, onChange, "leap", event.target.checked)}
          />
          윤달
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Num label="연" value={value.year} onChange={(next) => setField(value, onChange, "year", next)} className="col-span-2 sm:col-span-1" />
        <Num label="월" value={value.month} onChange={(next) => setField(value, onChange, "month", next)} />
        <Num label="일" value={value.day} onChange={(next) => setField(value, onChange, "day", next)} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Num label="시" value={value.hour} onChange={(next) => setField(value, onChange, "hour", next)} />
        <Num label="분" value={value.minute} onChange={(next) => setField(value, onChange, "minute", next)} />
        <label className="col-span-2 space-y-1.5 text-sm text-mist">
          성별
          <select className={FIELD} value={value.gender} onChange={(event) => setField(value, onChange, "gender", event.target.value)}>
            <option value="">선택</option>
            <option value="female">여성</option>
            <option value="male">남성</option>
          </select>
        </label>
      </div>
      <p className="text-xs leading-5 text-mist/80">{hint}</p>
      <label className="flex items-start gap-3 text-sm leading-6 text-mist">
        <input
          type="checkbox"
          className="mt-1"
          checked={value.yaja}
          onChange={(event) => setField(value, onChange, "yaja", event.target.checked)}
        />
        <span>야자시 적용. 밤 11시부터 자정 전까지의 일주를 다음 날로 넘깁니다. 끄면 자정까지 당일 일주를 유지합니다.</span>
      </label>
    </fieldset>
  );
}

function keepHanja(value) {
  // 추천 목록에 없어도 키보드 한자 변환·복사/붙여넣기 한자는 그대로 허용(공백만 정리)
  return [...String(value || "")]
    .filter((ch) => /\p{Script=Han}/u.test(ch) || ch === " ")
    .join("")
    .replace(/\s+/g, "")
    .slice(0, 6);
}

function HanjaMetaChips({ text }) {
  const chars = [...String(text || "")].filter((ch) => /\p{Script=Han}/u.test(ch));
  if (chars.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {chars.map((ch, index) => {
        const meta = hanjaMeta(ch);
        return (
          <span
            key={`${ch}-${index}`}
            className="rounded-md border border-gold/25 bg-gold/5 px-2 py-0.5 text-[11px] text-cream/90"
            title={`${ch} ${meta.stroke || "?"}획 · ${meta.element || "?"} · ${meta.pole || "?"}`}
          >
            {ch}
            {meta.stroke ? (
              <span className="ml-1 text-mist">
                {meta.stroke}획·{meta.element}·{meta.pole}
              </span>
            ) : (
              <span className="ml-1 text-mist">획 미확정</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function ChoiceRow({ label, choices, selected, onPick }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-8 shrink-0 text-xs text-mist">{label}</span>
      {choices.map((choice) => (
        <button
          key={choice.h}
          type="button"
          title={choice.label}
          aria-pressed={selected === choice.h}
          className={`min-h-10 rounded-full px-3 py-2 text-sm ${selected === choice.h ? "bg-gold text-night" : "border border-white/15 text-cream"}`}
          onClick={() => onPick(choice.h)}
        >
          {choice.h}
          <span className="ml-1 opacity-70">{choice.gloss}</span>
          {choice.stroke ? (
            <span className="ml-1 hidden opacity-60 sm:inline">
              {choice.stroke}획·{choice.element}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function topic(text) {
  const code = text.charCodeAt(text.length - 1);
  const batchim = code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  return `${text}${batchim ? "은" : "는"}`;
}

function Num({ label, value, onChange, className = "" }) {
  return (
    <label className={`space-y-1.5 text-sm text-mist ${className}`}>
      {label}
      <input className={FIELD} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function shichen(hour) {
  const names = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  return names[Math.floor((hour + 1) / 2) % 12];
}
