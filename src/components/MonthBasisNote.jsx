export function MonthBasisNote({ className = "" }) {
  return (
    <p className={`rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm leading-7 text-mist ${className}`}>
      본 월별 운세는 현대인의 편의를 위해 <span className="font-semibold text-cream">양력 월</span>을 기준으로 하되, 사주
      명리학의 정확한 기운 흐름인 <span className="font-semibold text-cream">절기 월(간지)</span>을 함께 적용하여
      분석하였습니다.
    </p>
  );
}

export function MonthCardTitle({ month }) {
  return (
    <div className="min-w-0 flex-1 pr-3">
      <p className="text-sm leading-6 text-cream">{month.heading || `${month.month}월 ${month.gzKo}`}</p>
    </div>
  );
}
