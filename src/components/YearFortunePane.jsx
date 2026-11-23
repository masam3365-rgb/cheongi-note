import { useEffect, useMemo, useState } from "react";
import PaidPdfCta from "./PaidPdfCta";
import { ScoreIndexNote } from "./ReadingNotes";
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
    onNote?.(`${clamped}년 무료 요약을 다시 계산했습니다.`);
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
        <p className="text-xs tracking-[0.22em] text-gold">연도별 · 월별 · 무료 요약</p>
        <h3 className="mt-2 font-serif text-2xl text-cream">한 해 핵심과 월별 한 줄만 무료로 봅니다</h3>
        <p className="mt-2 text-sm leading-7 text-mist">
          {years[0]}~{years[years.length - 1]}년 중 해를 고르면, 연간 요약과 1~12월의 짧은 핵심만 보여 드립니다. 월별
          재물·직장·대인·주의일·개운법 등 상세 풀이는 유료 맞춤 PDF에서 확인하세요.
        </p>
        <ScoreIndexNote className="mt-4" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="text-sm text-mist">
            연도 선택
            <select
              className="mt-1 block min-h-11 w-full rounded-xl border border-white/15 bg-night px-3 py-3 text-base text-cream sm:w-auto sm:min-h-0 sm:py-2 sm:text-sm"
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
                className="min-h-11 w-28 rounded-xl border border-white/15 bg-night px-3 py-3 text-base text-cream sm:min-h-0 sm:py-2 sm:text-sm"
              />
              <button type="button" className="touch-target rounded-full bg-gold px-4 py-2 text-sm text-night" onClick={() => applyYear(draft)}>
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
              {view.gzKo} · 세는나이 {view.age}세 · {view.level} · 내부 해석 지수 {view.score}
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {view.months.map((month) => (
          <article
            key={month.month}
            id={`year-month-${month.month}`}
            className={`scroll-mt-28 rounded-2xl border p-4 ${
              focusMonth === month.month ? "border-gold bg-gold/10" : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="text-base leading-7 text-cream">{month.month}월</h4>
                <p className={`mt-1 text-sm ${levelClass(month.level)}`}>
                  {month.level} · {month.score}
                </p>
              </div>
              <span className="block h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-gold" style={{ width: `${month.score}%` }} />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-mist">{month.summary}</p>
          </article>
        ))}
      </div>

      <PaidPdfCta context="year" />
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
                해당 달 요약 보기
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
