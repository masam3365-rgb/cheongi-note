import { PLANS, formatWon } from "../lib/customFortune.js";

/**
 * 공개 무료 요약 하단 — 유료 맞춤 PDF·마켓(당근·크몽) 안내.
 * 사이트 내 결제·PDF 생성은 하지 않음.
 */
export default function PaidPdfCta({ context = "detail" }) {
  const lead =
    context === "year"
      ? "월별 재물·직장·대인 풀이, 주의일·개운법 등 상세 분석은 유료 맞춤 PDF에 담깁니다."
      : context === "ten"
        ? "연도별 재물·직장·애정 상세와 생활 흐름 전문은 유료 맞춤 PDF에 담깁니다."
        : "화면의 무료 요약 밖의 심층 분석은 유료 맞춤 PDF로 받아 보실 수 있습니다.";

  return (
    <article className="rounded-2xl border border-gold/35 bg-gold/10 p-5 sm:p-6" aria-label="유료 맞춤 PDF 안내">
      <p className="text-xs tracking-[0.22em] text-gold">유료 · 맞춤 PDF</p>
      <h3 className="mt-2 font-serif text-2xl text-cream">상세 분석은 마켓에서 주문하세요</h3>
      <p className="mt-3 text-sm leading-7 text-mist">{lead}</p>
      <p className="mt-2 text-sm leading-7 text-mist">
        이 사이트에서는 결제·PDF 다운로드가 되지 않습니다.{" "}
        <strong className="text-cream">당근 채팅 문의</strong> 또는{" "}
        <strong className="text-cream">크몽</strong>에서 주문·결제하시면, 판매자가 확인 후 심층 PDF를 전달합니다.
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <li key={plan.id} className="rounded-2xl border border-white/10 bg-night/40 px-4 py-4">
            <p className="font-serif text-lg text-cream">{plan.label}</p>
            <p className="mt-1 text-sm text-gold">{formatWon(plan.price)}</p>
            <p className="mt-2 text-xs leading-5 text-mist">{plan.desc}</p>
          </li>
        ))}
      </ul>

      <ol className="mt-5 list-decimal space-y-1 pl-5 text-sm leading-7 text-mist">
        <li>당근 채팅 또는 크몽에서 상품을 고르고 결제합니다.</li>
        <li>생년월일·출생시간·원하는 구성(1종·3종·풀)을 알려 주세요.</li>
        <li>판매자가 주문을 확인한 뒤 심층 PDF를 전달합니다.</li>
      </ol>
    </article>
  );
}
