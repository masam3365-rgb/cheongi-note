function levelClass(level) {
  if (level === "대길" || level === "길") return "text-gold";
  if (level === "흉" || level === "신중") return "text-rose";
  return "text-mist";
}

function Stars({ count }) {
  return (
    <span className="inline-flex gap-0.5 text-gold" aria-label={`${count}점 만점에 ${count}별`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < count ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

function ScoreBar({ score, label }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-mist">{label}</span>
        <span className="text-cream">{score}%</span>
      </div>
      <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full bg-gold" style={{ width: `${score}%` }} />
      </span>
    </div>
  );
}

export default function TenYearFortune({ reading }) {
  const pack = reading.tenYear;
  if (!pack?.years?.length) {
    return (
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-mist">10년 세운을 아직 계산하지 못했습니다. 명식을 다시 풀어 주세요.</p>
      </article>
    );
  }

  const now = new Date().getFullYear();

  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5 sm:p-6">
        <p className="text-xs tracking-[0.22em] text-gold">세운 · 앞으로 10년</p>
        <h3 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">
          {pack.startYear}년 ~ {pack.endYear}년 연도별 운세
        </h3>
        <p className="mt-3 text-sm leading-7 text-mist">{pack.summary}</p>
        <p className="mt-2 text-sm leading-7 text-cream">
          각 해의 간지(세운)를 기준으로, 재물·직장·애정을 쉬운 말로 풀어 두었습니다. 점수는 높을수록 움직임이 수월한
          해입니다.
        </p>
      </article>

      <div className="grid gap-4">
        {pack.years.map((item) => {
          const isCurrent = item.year === now;
          return (
            <article
              key={item.year}
              className={`rounded-2xl border p-5 ${
                isCurrent ? "border-gold bg-gold/10" : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-2xl text-cream">{item.year}년</h4>
                    {isCurrent ? (
                      <span className="rounded-full border border-gold/50 px-2.5 py-0.5 text-xs text-gold">올해</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-gold">
                    {item.gzFull} · 세는나이 {item.age}세 · {item.level}
                  </p>
                </div>
                <div className="text-right">
                  <Stars count={item.stars} />
                  <p className={`mt-1 text-sm ${levelClass(item.level)}`}>종합 {item.score}%</p>
                </div>
              </div>

              <span className="mt-4 block h-2 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-gold" style={{ width: `${item.score}%` }} />
              </span>

              <p className="mt-4 text-sm leading-7 text-cream">{item.headline}</p>

              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-night/30 p-4">
                  <ScoreBar score={item.wealth.score} label={`재물 · ${item.wealth.level}`} />
                  <p className="mt-3 text-sm leading-6 text-mist">{item.wealth.text}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-night/30 p-4">
                  <ScoreBar score={item.career.score} label={`직장 · ${item.career.level}`} />
                  <p className="mt-3 text-sm leading-6 text-mist">{item.career.text}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-night/30 p-4">
                  <ScoreBar score={item.love.score} label={`애정 · ${item.love.level}`} />
                  <p className="mt-3 text-sm leading-6 text-mist">{item.love.text}</p>
                </div>
              </div>

              {item.lifeFlow?.lines?.length ? (
                <div className="mt-4 rounded-xl border border-gold/25 bg-gold/5 p-4">
                  <p className="text-sm text-gold">{item.lifeFlow.title || "생활 속 운의 흐름"}</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-cream">
                    {item.lifeFlow.lines.map((line) => (
                      <li key={line}>· {line}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
