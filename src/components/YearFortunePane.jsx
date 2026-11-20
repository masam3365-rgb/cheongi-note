import { useEffect, useMemo, useState } from "react";
import { MonthBasisNote } from "./MonthBasisNote";
import { buildYearFortune, listYearOptions } from "../lib/yearFortune.js";

function levelClass(level) {
  if (level === "대길" || level === "길") return "text-gold";
  if (level === "흉" || level === "신중") return "text-rose";
  return "text-mist";
}

export default function YearFortunePane({ reading, initialYear, onNote }) {
  const book = reading.yearFortune;
  const years = book?.years || listYearOptions();
  const fallbackYear = book?.defaultYear || new Date().getFullYear();
  const [year, setYear] = useState(initialYear || fallbackYear);
  const [draft, setDraft] = useState(String(initialYear || fallbackYear));
  const [openGuide, setOpenGuide] = useState(null);
  const [focusMonth, setFocusMonth] = useState(null);

  const view = useMemo(() => {
    if (book?.byYear?.[year]) return book.byYear[year];
    return buildYearFortune(reading.chart, year, reading.yearEngines || {}, reading.profile);
  }, [book, year, reading]);

  useEffect(() => {
    setDraft(String(year));
  }, [year]);

  function applyYear(next) {
    const value = Number(next);
    if (!Number.isFinite(value)) return;
    const min = years[0];
    const max = years[years.length - 1];
    const clamped = Math.max(min, Math.min(max, Math.round(value)));
    setYear(clamped);
    setFocusMonth(null);
    setOpenGuide(null);
    onNote?.(`${clamped}년 세운·월운을 다시 계산했습니다.`);
  }

  function jumpToMonth(month) {
    setFocusMonth(month);
    setOpenGuide(null);
    requestAnimationFrame(() => {
      document.getElementById(`year-month-${month}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-xs tracking-[0.22em] text-gold">연도별 · 월별 운세</p>
        <h3 className="mt-2 font-serif text-2xl text-cream">원하는 해를 고르면 바로 풀이됩니다</h3>
        <p className="mt-2 text-sm leading-7 text-mist">
          과거 {years[0]}년부터 미래 {years[years.length - 1]}년까지, 한 해의 세운과 1월~12월 월운을 실시간으로 계산합니다. 속은
          만세력·지장간·12운성·신살·공망·신강신약·자미·기문을 쓰되, 화면에는 쉬운 말로만 풀어 드립니다.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm text-mist">
            연도 선택
            <select
              className="mt-1 block rounded-xl border border-white/15 bg-night px-3 py-2 text-cream"
              value={year}
              onChange={(event) => applyYear(event.target.value)}
            >
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}년
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-mist">
            직접 입력
            <span className="mt-1 flex gap-2">
              <input
                type="number"
                min={years[0]}
                max={years[years.length - 1]}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="w-28 rounded-xl border border-white/15 bg-night px-3 py-2 text-cream"
              />
              <button type="button" className="rounded-full bg-gold px-4 py-2 text-sm text-night" onClick={() => applyYear(draft)}>
                이 해 보기
              </button>
            </span>
          </label>
        </div>
      </article>

      <GuideSection
        guides={view.guides}
        openGuide={openGuide}
        onPreview={(id) => setOpenGuide((prev) => (prev === id ? null : id))}
        onConfirm={(guide) => jumpToMonth(guide.targetMonth)}
      />

      <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-cream">{view.title}</h3>
            <p className="mt-1 text-sm text-gold">
              {view.gzKo} · 세는나이 {view.age}세 · {view.level} {view.score}점
            </p>
          </div>
          <span className={`text-sm ${levelClass(view.level)}`}>한 해 온도 {view.score}</span>
        </div>
        <p className="mt-3 text-sm leading-7 text-cream">{view.summary}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-mist">
          {view.focus.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-gold">비교적 밝은 달</p>
            <p className="mt-2 text-sm leading-6 text-cream">
              {view.bestMonths.map((item) => `${item.month}월(${item.level})`).join(" · ")}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-rose">조심할 달</p>
            <p className="mt-2 text-sm leading-6 text-cream">
              {view.hardMonths.map((item) => `${item.month}월(${item.level})`).join(" · ")}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-mist">{view.ziweiEasy}</p>
        <p className="mt-2 text-sm leading-7 text-mist">{view.qimenEasy}</p>
      </article>

      <MonthBasisNote />

      <div className="grid gap-4">
        {view.months.map((month) => (
          <article
            key={month.month}
            id={`year-month-${month.month}`}
            className={`scroll-mt-28 rounded-2xl border p-5 ${
              focusMonth === month.month ? "border-gold bg-gold/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-base leading-7 text-cream">{month.heading}</h4>
                <p className={`mt-1 text-sm ${levelClass(month.level)}`}>
                  {month.level} {month.score}점
                  {month.diShiEasy ? ` · ${month.diShiEasy}` : ""}
                </p>
              </div>
              <span className="block h-2 w-28 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-gold" style={{ width: `${month.score}%` }} />
              </span>
            </div>

            <p className="mt-4 rounded-xl border border-white/10 px-3 py-3 text-sm leading-7 text-cream">
              <span className="text-gold">① 이달의 핵심 · </span>
              {month.summary}
            </p>

            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gold">② 재물 · {month.wealthScore}점</p>
                <p className="mt-2 text-sm leading-6 text-mist">{month.wealth}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gold">② 직장 · {month.careerScore}점</p>
                <p className="mt-2 text-sm leading-6 text-mist">{month.career}</p>
              </div>
              <div className="rounded-xl border border-white/10 p-3">
                <p className="text-xs text-gold">② 대인관계 · {month.relationScore}점</p>
                <p className="mt-2 text-sm leading-6 text-mist">{month.relation}</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-rose/30 bg-rose/5 p-3">
              <p className="text-xs text-rose">③ 주의할 날짜</p>
              <ul className="mt-2 space-y-1 text-sm leading-6 text-mist">
                {month.watchDates.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-6 text-cream">
                <span className="text-gold">개운법 · </span>
                {month.remedy}
              </p>
            </div>
            {month.specialHints?.length ? (
              <p className="mt-3 text-sm leading-6 text-gold">{month.specialHints.join(" ")}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function GuideSection({ guides, openGuide, onPreview, onConfirm }) {
  return (
    <section className="rounded-2xl border border-white/10 p-5">
      <p className="text-xs tracking-[0.22em] text-gold">이런 분께 꼭 필요합니다</p>
      <h3 className="mt-2 font-serif text-2xl text-cream">지금 고민에 바로 답합니다</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {guides.map((guide) => (
          <article key={guide.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-serif text-lg leading-7 text-cream">{guide.question}</p>
            <p className="mt-2 text-sm leading-6 text-mist">{guide.preview}</p>
            {openGuide === guide.id ? <p className="mt-3 text-sm leading-7 text-cream">{guide.answer}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
                onClick={() => onPreview(guide.id)}
              >
                {openGuide === guide.id ? "미리보기 닫기" : "미리보기"}
              </button>
              <button type="button" className="rounded-full bg-gold px-4 py-2 text-sm text-night" onClick={() => onConfirm(guide)}>
                운세 확인하기
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
