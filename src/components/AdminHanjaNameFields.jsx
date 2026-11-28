import { useRef, useState } from "react";
import { givenChoices, hangulOnly, surnameChoices } from "../lib/hanjaSuggest";
import { hanjaMeta } from "../lib/nameology";

const FIELD =
  "mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream outline-none focus-visible:border-gold/70";

function keepHanja(value) {
  return [...String(value || "")]
    .filter((ch) => /\p{Script=Han}/u.test(ch) || ch === " ")
    .join("")
    .replace(/\s+/g, "")
    .slice(0, 6);
}

/**
 * 관리자 명식용 한글·한자 성명.
 * 같은 발음 한자는 후보만 보여 주고 자동 확정하지 않는다.
 */
export default function AdminHanjaNameFields({ value, onChange }) {
  const composing = useRef({ surname: false, given: false });
  const [givenDraft, setGivenDraft] = useState([]);
  const surnameOptions = surnameChoices(value.surname);
  const givenOptions = givenChoices(value.given);
  const canConvert = surnameOptions.length > 0 || givenOptions.some((item) => item.choices.length > 0);

  function commitHangul(key, raw) {
    const text = hangulOnly(raw).slice(0, 5);
    const next = { ...value, [key]: text };
    // 한글이 바뀌면 길이가 맞지 않는 한자만 비움 — 추천 한자로 채우지 않음
    if (key === "surname") {
      const chars = [...String(value.surnameHanja || "")];
      if (chars.length && chars.length !== [...text].length) next.surnameHanja = "";
    } else {
      const chars = [...String(value.givenHanja || "")];
      if (chars.length && chars.length !== [...text].length) next.givenHanja = "";
      setGivenDraft([]);
    }
    onChange(next);
  }

  function changeHangul(key, event) {
    const raw = event.target.value;
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

  function clearHanja() {
    setGivenDraft([]);
    onChange({ ...value, surnameHanja: "", givenHanja: "" });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs text-mist">
          성 (한글)
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
        <label className="text-xs text-mist">
          이름 (한글)
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
        <label className="text-xs text-mist">
          성 (한자)
          <input
            className={FIELD}
            value={value.surnameHanja || ""}
            lang="zh"
            autoComplete="off"
            placeholder="후보 선택 또는 직접 입력"
            onChange={(event) => onChange({ ...value, surnameHanja: keepHanja(event.target.value) })}
          />
          <HanjaMetaChips text={value.surnameHanja} />
        </label>
        <label className="text-xs text-mist">
          이름 (한자)
          <input
            className={FIELD}
            value={value.givenHanja || ""}
            lang="zh"
            autoComplete="off"
            placeholder="음절마다 선택·확인"
            onChange={(event) => onChange({ ...value, givenHanja: keepHanja(event.target.value) })}
          />
          <HanjaMetaChips text={value.givenHanja} />
        </label>
      </div>

      {canConvert ? (
        <div className="space-y-3 rounded-2xl border border-gold/20 bg-white/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs leading-5 text-gold">
              한자 후보 · 같은 발음이 여러 개일 수 있으니 관리자가 선택·확인하세요. 자동으로 확정하지 않습니다.
            </p>
            <button
              type="button"
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-mist"
              onClick={clearHanja}
            >
              한자 비우기
            </button>
          </div>
          {surnameOptions.length > 0 ? (
            <ChoiceRow
              label="성"
              choices={surnameOptions}
              selected={value.surnameHanja || ""}
              onPick={(hanja) => onChange({ ...value, surnameHanja: hanja })}
            />
          ) : value.surname ? (
            <p className="text-xs text-mist">성에 대한 후보가 없습니다. 한자 성 칸에 직접 입력하세요.</p>
          ) : null}
          {givenOptions.map((item, index) =>
            item.choices.length > 0 ? (
              <ChoiceRow
                key={`${item.syllable}-${index}`}
                label={item.syllable}
                choices={item.choices}
                selected={
                  ([...(value.givenHanja || "")].length === givenOptions.length
                    ? [...(value.givenHanja || "")][index]
                    : "") ||
                  givenDraft[index] ||
                  ""
                }
                onPick={(hanja) => {
                  const base =
                    [...(value.givenHanja || "")].length === givenOptions.length
                      ? [...(value.givenHanja || "")]
                      : [...givenDraft];
                  while (base.length < givenOptions.length) base.push("");
                  base[index] = hanja;
                  const parts = base.slice(0, givenOptions.length);
                  if (parts.every(Boolean)) {
                    setGivenDraft([]);
                    onChange({ ...value, givenHanja: parts.join("") });
                  } else {
                    setGivenDraft(parts);
                  }
                }}
              />
            ) : (
              <p key={`${item.syllable}-${index}`} className="text-xs text-mist">
                「{item.syllable}」 후보가 없습니다. 한자 이름 칸에 직접 적으세요.
              </p>
            ),
          )}
          {givenDraft.some(Boolean) && givenDraft.some((ch) => !ch) ? (
            <p className="text-xs text-rose/90">이름 한자는 모든 음절을 선택한 뒤에 반영됩니다.</p>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-mist/80">
          한자를 넣지 않으면 성명학은 한글 자획만 사용합니다. 임의의 한자·획수를 만들지 않습니다.
        </p>
      )}
    </div>
  );
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
          className={`min-h-10 rounded-full px-3 py-2 text-sm ${
            selected === choice.h ? "bg-gold text-night" : "border border-white/15 text-cream"
          }`}
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
