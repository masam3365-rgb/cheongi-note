import { useMemo, useState } from "react";
import { buildCareerPlaybook, buildRemedyGuide } from "../lib/careerRemedyGuide.js";
import { dayMasterPhrase, favorBundlePhrase, strengthPhrase, termChip } from "../lib/plainTerms.js";

export function ReportBook({ report }) {
  const [pageNo, setPageNo] = useState(1);
  const [spread, setSpread] = useState(false);
  const current = report.pages[pageNo - 1];
  const shown = spread ? report.pages : [current];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.22em] text-gold">심층 리포트</p>
          <h3 className="mt-1 font-serif text-2xl text-cream">
            {current.no} / {current.total}쪽
          </h3>
        </div>
        <button type="button" className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold" onClick={() => setSpread((value) => !value)}>
          {spread ? "한 쪽씩 보기" : "한 권으로 이어 보기"}
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {report.pages.map((page) => (
          <button
            key={page.no}
            type="button"
            onClick={() => {
              setSpread(false);
              setPageNo(page.no);
            }}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${page.no === pageNo && !spread ? "bg-gold text-night" : "border border-white/10 text-mist"}`}
          >
            {page.no}. {page.title}
          </button>
        ))}
      </div>
      {shown.map((page) => (
        <article key={page.no} className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-7">
          <p className="text-xs text-gold">
            {page.no}쪽 / {page.total}
          </p>
          <h3 className="mt-2 font-serif text-2xl text-cream">{page.title}</h3>
          <div className="mt-4 space-y-3 text-sm leading-8 text-mist">
            {page.paragraphs.map((paragraph, index) => (
              <p key={`${page.no}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
      <div className="flex justify-between gap-2">
        <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm text-cream" onClick={() => setPageNo((value) => Math.max(1, value - 1))} disabled={pageNo === 1}>
          이전 쪽
        </button>
        <button
          type="button"
          className="rounded-full bg-gold px-4 py-2 text-sm text-night"
          onClick={() => setPageNo((value) => Math.min(report.pages.length, value + 1))}
          disabled={pageNo === report.pages.length}
        >
          다음 쪽
        </button>
      </div>
    </div>
  );
}

export function FacePanel({ face }) {
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-white/10 p-5">
        <h3 className="font-serif text-2xl text-cream">관상 · 골상</h3>
        <p className="mt-3 text-sm leading-8 text-mist">{face.summary}</p>
        <div className="mt-4 space-y-3 text-sm leading-8 text-mist">
          {face.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </article>
      <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
        <h3 className="font-serif text-xl text-cream">재물복을 부르는 생활</h3>
        <ul className="mt-3 space-y-2 text-sm leading-7 text-cream">
          {face.habits.map((habit) => (
            <li key={habit}>{habit}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}

/** 진로지침서 — PDF 진로·개운 파트와 동일 엔진 */
export function CareerGuidePanel({ reading }) {
  const chart = reading.chart;
  const play = useMemo(() => buildCareerPlaybook(chart), [chart]);
  const remedy = useMemo(() => buildRemedyGuide(chart), [chart]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] text-gold">진로 지침서</p>
        <h3 className="mt-1 font-serif text-3xl text-cream">1순위 적성·현대 직종과 2순위 차선책</h3>
        <p className="mt-3 text-sm leading-7 text-mist">
          {dayMasterPhrase(chart.dayMasterKo, chart.dayElement)} · {strengthPhrase(chart.strength?.label)}. 월주 역할{" "}
          {termChip(chart.monthGod || "—")} · 강점 {play.topGroupLabel}. 도움이 되는 기운{" "}
          {favorBundlePhrase((play.hee || []).join("·") || play.yong, "career")}.
        </p>
      </div>

      <article className="rounded-2xl border border-gold/35 bg-gold/10 p-5 sm:p-6">
        <p className="text-xs text-gold">진로 지침서 1 · 상위급 성취</p>
        <h4 className="mt-2 font-serif text-2xl text-cream">1순위 최상위 적성 분야 &amp; 현대 추천 직종</h4>
        <p className="mt-3 text-sm leading-7 text-mist">{play.primaryIntro}</p>
        <div className="mt-5 space-y-4">
          {play.primaryFields.map((field) => (
            <div key={field.name} className="rounded-xl border border-white/10 bg-night/40 p-4">
              <h5 className="font-serif text-lg text-gold">
                【{field.name}】 <span className="text-sm text-mist">({field.element})</span>
              </h5>
              <p className="mt-2 text-sm leading-7 text-cream">{(field.jobs || []).join(" · ")}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 p-5 sm:p-6">
        <p className="text-xs text-gold">진로 지침서 2 · 중위급 안정 성취</p>
        <h4 className="mt-2 font-serif text-2xl text-cream">2순위 차선책 적성 분야 &amp; 추천 전공</h4>
        <p className="mt-3 text-sm leading-7 text-mist">{play.secondaryIntro}</p>
        <div className="mt-5 space-y-4">
          {play.secondaryFields.map((field) => (
            <div key={field.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h5 className="font-serif text-lg text-cream">
                【{field.name}】 <span className="text-sm text-mist">({field.element})</span>
              </h5>
              <p className="mt-2 text-sm leading-7 text-mist">{(field.jobs || []).join(" · ")}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-gold/25 bg-gold/5 p-4">
          <p className="text-sm font-medium text-gold">대학 전공·자격 방향</p>
          <p className="mt-2 text-sm leading-7 text-cream">{play.majorTipText}</p>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 p-5 sm:p-6">
        <p className="text-xs text-gold">운을 좋게 하는 비법</p>
        <h4 className="mt-2 font-serif text-2xl text-cream">좋은 영향 vs 피할 것 대조표</h4>
        <p className="mt-3 text-sm leading-7 text-mist">{remedy.intro}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gold/30 text-gold">
                <th className="px-2 py-2 font-medium">구분</th>
                <th className="px-2 py-2 font-medium">좋은 영향을 주는 것</th>
                <th className="px-2 py-2 font-medium">피하거나 줄여야 할 것</th>
              </tr>
            </thead>
            <tbody>
              {remedy.rows.map((row) => (
                <tr key={row.label} className="border-b border-white/10 align-top">
                  <td className="whitespace-nowrap px-2 py-3 font-medium text-gold">{row.label}</td>
                  <td className="px-2 py-3 leading-6 text-cream">{row.good}</td>
                  <td className="px-2 py-3 leading-6 text-mist">{row.bad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs leading-6 text-mist">
          PDF 풀 패키지의 「직업·진로 적성」·「맞춤 개운법」 파트와 같은 기준으로 작성되었습니다.
        </p>
      </article>
    </div>
  );
}

/** @deprecated 타로·별자리 탭은 진로지침서로 교체됨 — 호환용 유지 */
export function SkyPanel({ sky }) {
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-white/10 p-5">
        <p className="text-xs text-gold">태양별자리</p>
        <h3 className="mt-2 font-serif text-3xl text-cream">{sky.sign.name}자리</h3>
        <p className="mt-3 text-sm leading-8 text-mist">{sky.sign.trait}</p>
        <p className="mt-3 text-sm leading-8 text-cream">{sky.bridge}</p>
      </article>
      <div className="grid gap-3 lg:grid-cols-3">
        {sky.cards.map((card) => (
          <article key={card.role} className="rounded-2xl border border-gold/30 p-4">
            <p className="text-xs text-gold">{card.role}</p>
            <h3 className="mt-2 font-serif text-2xl text-cream">{card.name}</h3>
            <p className="mt-1 text-sm text-gold">{card.theme}</p>
            <p className="mt-3 text-sm leading-7 text-mist">{card.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function TaegilPanel({ taegil }) {
  const [purpose, setPurpose] = useState(taegil.purposes[0].id);
  const meta = taegil.purposes.find((item) => item.id === purpose);
  const picks = taegil.picks[purpose];
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-2xl text-cream">택일</h3>
        <p className="mt-2 text-sm leading-7 text-mist">내일부터 60일 안에서, 목적에 맞는 날과 두 시각을 고릅니다.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {taegil.purposes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === purpose}
            onClick={() => setPurpose(item.id)}
            className={`rounded-full px-4 py-2 text-sm ${item.id === purpose ? "bg-gold text-night" : "border border-white/15 text-mist"}`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <p className="text-sm text-gold">{meta.hint}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {picks.map((day, index) => {
          const scored = day.purposes[purpose];
          return (
            <article key={day.key} className={`rounded-2xl border p-4 ${index === 0 ? "border-gold" : "border-white/10"}`}>
              <p className="text-sm text-cream">
                {index === 0 ? "가장 길한 날 · " : ""}
                {day.month}월 {day.day}일 ({day.weekday}) {day.gzKo}
              </p>
              <p className="mt-1 text-sm text-gold">
                {scored.level} {scored.score}
              </p>
              <p className="mt-2 text-sm leading-7 text-mist">{scored.note}</p>
              <p className="mt-2 text-sm text-cream">추천 시각 {scored.hours.map((hour) => `${hour.clock} (${hour.branch})`).join(" · ")}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
