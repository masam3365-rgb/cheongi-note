export function MonthBasisNote({ className = "" }) {
  return (
    <p className={`rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm leading-7 text-mist ${className}`}>
      화면의 <span className="font-semibold text-cream">○월</span>은{" "}
      <span className="font-semibold text-cream">양력 달력 월</span> 기준 요약입니다. 같은 칸에 적힌 간지(예: 갑인월)와
      절기 안내는 <span className="font-semibold text-cream">절기·간지 월운</span>이며, 양력 1일과 절기 시작일이 다를 수
      있습니다. 생활 달력은 양력으로, 기운 흐름은 절기 간지로 함께 읽으면 됩니다.
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
