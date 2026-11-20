import { useState } from "react";
import { todayShareText } from "../lib/today";

export default function TodayFortune({ reading, onNote }) {
  const [mode, setMode] = useState("today");
  const pack = reading.today;
  const focus = mode === "tomorrow" ? pack.tomorrow : pack.today;

  async function shareKakao() {
    const text = todayShareText(reading);
    const payload = { title: "달빛 사주관 오늘의 운세", text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        onNote("공유 창을 열었습니다. 카카오톡을 고르면 됩니다.");
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(text);
      onNote("오늘 운세 글을 복사했습니다. 카카오톡 대화창에 붙여 넣으세요.");
    } catch {
      onNote("복사 권한이 없습니다. 브라우저에서 클립보드를 허용해 주세요.");
    }
  }

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      onNote("링크를 복사했습니다.");
    } catch {
      onNote("복사 권한이 없습니다. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-gold/30 bg-white/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.22em] text-gold">오늘의 일진</p>
            <h3 className="mt-2 font-serif text-2xl text-cream">
              {focus.solarText} ({focus.weekday}) · {focus.gzKo}일
            </h3>
            <p className="mt-1 text-sm text-mist">{focus.lunarText}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={shareKakao} className="rounded-full bg-[#FEE500] px-4 py-2 text-sm font-medium text-[#191919]">
              카카오톡
            </button>
            <button type="button" onClick={shareLink} className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
              링크 공유
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="이름" value={`${reading.displayName}${reading.hanja ? ` ${reading.hanja}` : ""}`} />
          <Info label="생년월일시" value={`${reading.chart.solarText} ${reading.chart.clock}`} />
          <Info label="띠" value={`${pack.animal}띠 · ${reading.chart.lunarText}`} />
          <Info label="사주" value={reading.chart.pillars.map((pillar) => pillar.gzKo).join(" ")} />
        </div>
        <p className="mt-3 text-xs leading-5 text-mist">
          {reading.chart.pillars.map((pillar) => `${pillar.label} ${pillar.gzKo}`).join(" · ")} · {reading.profile.statusLabel} · {reading.profile.roleLabel}
        </p>
      </article>

      {mode === "week" ? <WeekView pack={pack} /> : null}
      {mode === "month" ? <MonthView pack={pack} /> : null}
      {mode === "today" || mode === "tomorrow" ? (
        <>
          {mode === "tomorrow" ? <p className="text-sm text-gold">내일 운세 미리보기입니다. 오늘 밤에 가볍게 읽어 두세요.</p> : null}
          <article className="rounded-2xl border border-white/10 p-5">
            <p className="text-xs text-gold">한 줄 핵심</p>
            <p className="mt-2 font-serif text-2xl leading-snug text-cream">{focus.headline}</p>
            <Gauge score={focus.score} level={focus.level} />
          </article>
          {focus.sections.map((section) => (
            <article key={section.id} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-serif text-xl text-cream">{section.title}</h3>
              <div className="mt-3 space-y-2 text-sm leading-7 text-mist">
                {section.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
                <p className="text-xs text-gold">오늘의 지침 · {section.tipTitle}</p>
                <p className="mt-1 text-sm leading-6 text-cream">{section.tip}</p>
              </div>
            </article>
          ))}
          {mode === "today" ? <WeekView pack={pack} /> : null}
        </>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-3">
        {[
          ["tomorrow", "내일 운세 미리보기"],
          ["week", "이번 주 운세 보기"],
          ["month", "이번 달 운세 보기"],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(mode === id ? "today" : id)}
            className={`rounded-full px-4 py-3 text-sm ${mode === id ? "bg-gold text-night" : "border border-white/15 text-cream"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 px-3 py-2">
      <p className="text-xs text-gold">{label}</p>
      <p className="mt-1 text-sm leading-6 text-cream">{value}</p>
    </div>
  );
}

function Gauge({ score, level }) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-mist">
        <span>흉</span>
        <span className="text-gold">
          {level} · {score}점
        </span>
        <span>길</span>
      </div>
      <div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-rose via-mist/40 to-gold">
        <span
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-night bg-cream shadow"
          style={{ left: `calc(${score}% - 10px)` }}
        />
      </div>
    </div>
  );
}

function WeekView({ pack }) {
  const width = 640;
  const height = 200;
  const pad = 28;
  const step = (width - pad * 2) / 6;
  const points = pack.week.map((day, index) => {
    const x = pad + index * step;
    const y = height - pad - ((day.score - 18) / 78) * (height - pad * 2);
    return { ...day, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  return (
    <article className="rounded-2xl border border-white/10 p-5">
      <h3 className="font-serif text-xl text-cream">이번 주 흐름</h3>
      <p className="mt-1 text-sm text-mist">일요일부터 토요일까지입니다. 금색 점이 오늘입니다.</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" role="img" aria-label="일요일부터 토요일까지의 운세 점수">
        <polyline fill="none" stroke="#e6cb8c" strokeWidth="2" points={line} />
        {points.map((point) => (
          <g key={point.key}>
            <circle cx={point.x} cy={point.y} r={point.today ? 7 : 4} fill={point.today ? "#e6cb8c" : "#f6f1e7"} />
            <text x={point.x} y={height - 8} textAnchor="middle" fill="#b9c2de" fontSize="12">
              {point.weekday}
            </text>
            <text x={point.x} y={point.y - 12} textAnchor="middle" fill={point.today ? "#e6cb8c" : "#f6f1e7"} fontSize="11">
              {point.score}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {pack.week.map((day) => (
          <p key={day.key} className={`rounded-xl border px-3 py-2 text-sm leading-6 ${day.today ? "border-gold text-cream" : "border-white/10 text-mist"}`}>
            {day.weekday} {day.gzKo} · {day.level} {day.score}
            <span className="mt-1 block">{day.headline}</span>
          </p>
        ))}
      </div>
    </article>
  );
}

function MonthView({ pack }) {
  return (
    <article className="rounded-2xl border border-white/10 p-5">
      <h3 className="font-serif text-xl text-cream">{pack.monthLabel} 운세</h3>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {pack.month.map((day) => (
          <div key={day.key} className={`rounded-xl border p-2 ${day.today ? "border-gold bg-gold/10" : "border-white/10"}`}>
            <p className="text-sm text-cream">
              {day.day}일 {day.weekday}
            </p>
            <p className={`text-xs ${day.level === "흉" || day.level === "신중" ? "text-rose" : "text-gold"}`}>
              {day.gzKo} {day.level} {day.score}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
