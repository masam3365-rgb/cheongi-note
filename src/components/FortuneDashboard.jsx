import { useState } from "react";
import { MonthBasisNote, MonthCardTitle } from "./MonthBasisNote";
import { ScoreIndexNote, TraditionEvidence, WuxingPriorityNote } from "./ReadingNotes";

const ICONS = {
  newyear: "M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  wealth: "M12 3v18M7 7.5c0-1.5 2-2.5 5-2.5s5 1 5 2.5-2 2.5-5 2.5-5 1-5 2.5 2 2.5 5 2.5 5-1 5-2.5",
  love: "M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z",
  life: "M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6",
  aptitude: "M12 3l2.2 4.6L19 8.2l-3.5 3.4.8 4.9L12 14.8 7.7 16.5l.8-4.9L5 8.2l4.8-.6L12 3z",
};

export default function FortuneDashboard({ reading }) {
  const [cardId, setCardId] = useState("newyear");
  const { dashboard, guide } = reading;
  const card = dashboard.cards.find((item) => item.id === cardId) || dashboard.cards[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-xs text-gold">
        <span className="rounded-full border border-gold/40 px-3 py-1">{dashboard.profile.statusLabel}</span>
        <span className="rounded-full border border-gold/40 px-3 py-1">{dashboard.profile.roleLabel}</span>
      </div>
      {dashboard.character ? (
        <CharacterTop character={dashboard.character} chart={reading.chart} lack={guide.lack} />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {dashboard.cards.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === card.id}
            onClick={() => setCardId(item.id)}
            className={`rounded-2xl border px-4 py-4 text-left ${item.id === card.id ? "border-gold bg-gold/15" : "border-white/10 bg-white/5"}`}
          >
            <Icon name={item.id} />
            <p className="mt-3 font-serif text-lg text-cream">{item.title}</p>
            <p className="mt-1 text-xs text-mist">{item.kicker}</p>
          </button>
        ))}
      </div>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-serif text-2xl text-cream">{card.title}</h3>
        <p className="mt-3 text-sm leading-7 text-mist">{card.summary}</p>
      </article>
      {card.phases ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {card.phases.map((phase) => (
            <article key={phase.id} className="rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between text-sm">
                <h4 className="font-serif text-xl text-cream">{phase.title}</h4>
                <span className={levelClass(phase.level)}>
                  {phase.level} {phase.score || ""}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-mist">{phase.summary}</p>
              <div className="mt-3 space-y-2">
                {phase.cycles.map((cycle) => (
                  <p key={`${cycle.startYear}-${cycle.gzKo}`} className="text-xs leading-5 text-cream/80">
                    <span className="text-gold">{cycle.gzKo}</span> {cycle.startYear}–{cycle.endYear} · {cycle.level}
                    {cycle.turning ? " · 전환" : ""}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {card.nature ? (
        <article className="rounded-2xl border border-rose/30 p-4 text-sm leading-7 text-mist">
          조심할 습관 · {card.nature.slip}. 맞는 일의 결은 {card.nature.fit}입니다.
        </article>
      ) : null}
      {card.years?.length ? (
        <div className="tab-scroll flex gap-2 overflow-x-auto pb-1">
          {card.years.map((item) => (
            <span key={item.year} className="shrink-0 rounded-2xl border border-white/10 px-3 py-2 text-sm">
              <span className="block text-cream">{item.year}</span>
              <span className={levelClass(item.level)}>
                {item.gzKo} {item.level}
              </span>
            </span>
          ))}
        </div>
      ) : null}
      {card.months ? <MonthBoard card={card} /> : null}
      <RemedyStrip card={card} guide={guide} />
    </div>
  );
}

function CharacterTop({ character, chart, lack }) {
  const { personality, children, ancestors } = character;
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-gold/35 bg-gold/10 p-5 sm:p-6">
        <p className="text-xs tracking-[0.22em] text-gold">가장 먼저 보는 나</p>
        <h3 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">{personality.title}</h3>
        <p className="mt-1 text-sm text-gold">{personality.kicker}</p>
        <p className="mt-4 text-sm leading-7 text-cream">{personality.summary}</p>
        <p className="mt-3 text-sm leading-7 text-mist">{personality.outward}</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-night/30 p-4">
            <p className="text-xs text-gold">{personality.deepTitle}</p>
            <p className="mt-2 text-sm leading-7 text-mist">{personality.deep}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night/30 p-4">
            <p className="text-xs text-gold">오행으로 보는 균형</p>
            <p className="mt-2 text-sm leading-7 text-mist">{personality.balance}</p>
            {chart ? <WuxingPriorityNote className="mt-3" chart={chart} lack={lack || personality.lack} /> : null}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-gold">잘 빛나는 점</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-cream">
              {personality.strengths.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs text-rose">조심하면 좋은 점</p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-mist">
              {personality.weaknesses.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 rounded-xl border border-white/10 px-4 py-3 text-sm leading-7 text-cream">
          <span className="text-gold">나를 돕는 한 줄 · </span>
          {personality.tip}
        </p>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs tracking-[0.18em] text-gold">{children.kicker}</p>
          <h4 className="mt-2 font-serif text-2xl text-cream">{children.title}</h4>
          <p className="mt-3 text-sm leading-7 text-cream">{children.summary}</p>
          <p className="mt-3 text-sm leading-7 text-mist">{children.detail}</p>
          <TraditionEvidence className="mt-3">{children.traditionNote}</TraditionEvidence>
          <p className="mt-3 text-sm leading-7 text-gold">{children.timing}</p>
          <p className="mt-3 rounded-xl border border-white/10 px-3 py-3 text-sm leading-6 text-mist">
            <span className="text-cream">생활 팁 · </span>
            {children.tip}
          </p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs tracking-[0.18em] text-gold">{ancestors.kicker}</p>
          <h4 className="mt-2 font-serif text-2xl text-cream">{ancestors.title}</h4>
          <p className="mt-3 text-sm leading-7 text-cream">{ancestors.summary}</p>
          <p className="mt-3 text-sm leading-7 text-mist">{ancestors.detail}</p>
          <p className="mt-3 text-sm leading-7 text-mist">{ancestors.influence}</p>
          <p className="mt-3 rounded-xl border border-white/10 px-3 py-3 text-sm leading-6 text-mist">
            <span className="text-cream">뿌리 돌보기 · </span>
            {ancestors.tip}
          </p>
        </article>
      </div>
    </div>
  );
}

function MonthBoard({ card }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-7 text-gold">{card.head.line}</p>
      <MonthBasisNote />
      <ScoreIndexNote />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {card.months.map((month) => (
          <article key={month.month} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-2 text-sm">
              <MonthCardTitle month={month} />
              <span className={`shrink-0 ${levelClass(month.level)}`}>
                {month.level} {month.score}
              </span>
            </div>
            <span className="mt-3 block h-1.5 rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${month.score}%` }} />
            </span>
            <p className="mt-3 text-sm leading-6 text-gold">기회 · {month.chance}</p>
            <p className="mt-2 text-sm leading-6 text-rose">위기 · {month.caution}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function RemedyStrip({ card, guide }) {
  const showFood = card.remedies === true;
  const colorId = card.remedies === "people" ? "people" : card.remedies === "money" ? "money" : card.remedies === true ? "wear" : "";
  const color = guide.palette.items.find((item) => item.id === colorId);
  const shownRisks =
    card.remedies === "money"
      ? guide.risks.filter((risk) => risk.id === "money" || risk.id === "law")
      : card.remedies === "people"
        ? guide.risks.filter((risk) => risk.id === "people")
        : card.remedies === true
          ? guide.risks
          : [];
  if (!showFood && !color && shownRisks.length === 0) return null;
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {showFood ? (
        <article className="rounded-2xl border border-white/10 p-4">
          <h4 className="font-serif text-xl text-cream">행운의 음식</h4>
          <p className="mt-2 text-sm text-gold">
            우선 채울 {guide.table.element} · {guide.table.name}
          </p>
          <p className="mt-1 text-xs leading-6 text-mist">도움 기운 중 가장 모자란 기운 기준입니다.</p>
          <p className="mt-2 text-sm leading-6 text-cream">{guide.table.foods.join(", ")}</p>
          <p className="mt-2 text-sm leading-6 text-mist">{guide.table.habit}</p>
        </article>
      ) : null}
      {color ? (
        <article className="rounded-2xl border border-white/10 p-4">
          <h4 className="font-serif text-xl text-cream">{color.title}</h4>
          <div className="mt-3 flex items-center gap-2">
            {color.swatches.map((swatch) => (
              <span key={swatch} className="h-5 w-5 rounded-full border border-white/20" style={{ background: swatch }} />
            ))}
            <span className="text-sm text-gold">{color.name}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-mist">{color.text}</p>
        </article>
      ) : null}
      {shownRisks.map((risk) => (
        <article key={risk.id} className="rounded-2xl border border-rose/40 p-4">
          <h4 className="font-serif text-xl text-rose">{risk.title}</h4>
          <p className="mt-2 text-sm leading-6 text-mist">{risk.warning}</p>
          <p className="mt-2 text-sm leading-6 text-cream">막는 법 · {risk.remedy}</p>
        </article>
      ))}
    </div>
  );
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d={ICONS[name]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function levelClass(level) {
  if (level === "대길" || level === "길") return "text-gold";
  if (level === "흉" || level === "신중") return "text-rose";
  return "text-mist";
}
