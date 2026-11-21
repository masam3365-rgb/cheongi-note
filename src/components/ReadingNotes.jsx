export function TraditionEvidence({ title = "전통 해석 근거 보기", children, className = "" }) {
  if (!children) return null;
  return (
    <details className={`rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm ${className}`}>
      <summary className="cursor-pointer select-none text-gold">{title}</summary>
      <div className="mt-3 space-y-2 leading-7 text-mist">{children}</div>
    </details>
  );
}

export function ScoreIndexNote({ className = "" }) {
  return (
    <p className={`rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-mist ${className}`}>
      화면의 점수·등급은 확정적 성공 확률이 아니라, 천기노트 <span className="font-semibold text-cream">내부 해석 지수</span>
      입니다. 높을수록 흐름이 수월하다는 <span className="font-semibold text-cream">참고치</span>로만 보세요.
    </p>
  );
}

export function WuxingPriorityNote({ chart, lack, className = "" }) {
  if (!chart?.strength) return null;
  const help = chart.strength.favorable?.join("·") || "—";
  const heavy = chart.strength.unfavorable?.join("·") || "—";
  const fill = lack || chart.strength.favorable?.[0] || "—";
  return (
    <div className={`rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm leading-7 text-mist ${className}`}>
      <p>
        <span className="font-semibold text-cream">우선 도움 기운</span>은 {help}이고, 그중{" "}
        <span className="font-semibold text-cream">생활에서 먼저 채울 기운</span>은 {fill}입니다. 음식·색·방위 개운법은 이
        기준으로 맞춰 두었습니다.
      </p>
      <p className="mt-2">
        <span className="font-semibold text-cream">과하면 부담이 되기 쉬운 기운</span>은 {heavy}입니다. 오행 개수가 가장
        적은 것과 ‘먼저 채울 도움 기운’은 다를 수 있습니다.
      </p>
    </div>
  );
}
