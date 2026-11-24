import { useMemo } from "react";
import { buildAptitudeJobFreeLines } from "../lib/careerFreeSummary.js";
import PaidPdfCta from "./PaidPdfCta";

/**
 * 적성·직업 무료 요약 — 지금 하는 일·일의 방식.
 * 직종 목록·시기별 상세는 유료 PDF / 진로지침서와 목적을 분리.
 */
export default function AptitudeCareerPanel({ reading }) {
  const lines = useMemo(() => buildAptitudeJobFreeLines(reading), [reading]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs tracking-[0.22em] text-gold">적성·직업 · 무료 요약</p>
        <h3 className="mt-1 font-serif text-3xl text-cream">지금 하는 일과 잘 맞는 방식</h3>
        <p className="mt-3 text-sm leading-7 text-mist">
          직장·업무 성향과 잘 맞는 일의 결만 짧게 보여 드립니다. 중장기 진로 방향은 「진로지침서」, 직종별 상세
          적합성과 시기별 지침은 유료 맞춤 PDF에서 확인하세요.
        </p>
      </div>

      <article className="rounded-2xl border border-gold/35 bg-gold/10 p-5 sm:p-6">
        <ul className="space-y-3 text-sm leading-7 text-cream">
          {lines.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
      </article>

      <PaidPdfCta context="detail" />
    </div>
  );
}
