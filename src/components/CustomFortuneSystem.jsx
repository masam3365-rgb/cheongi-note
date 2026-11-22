import { useMemo, useState } from "react";
import PersonFields from "./PersonFields";
import { emptyPerson } from "./ReadingForm";
import {
  CUSTOM_CATALOG,
  PLAN_DETAILS,
  PLANS,
  buildCustomFortunePack,
  formatWon,
  toggleCustomSelection,
} from "../lib/customFortune.js";

/**
 * 공개 사이트용 맞춤 운세 안내.
 * 유료 PDF 생성·테스트 결제·generateProductReportHtml 호출은 포함하지 않음.
 * 심층 PDF는 판매자 PC 도구(scripts/seller-report.mjs)에서만 생성.
 */
export default function CustomFortuneSystem({ reading, onPartnerSubmit, onNote }) {
  const pack = useMemo(() => buildCustomFortunePack(reading), [reading]);
  const [planId, setPlanId] = useState("full");
  const [selected, setSelected] = useState(() => CUSTOM_CATALOG.map((item) => item.id));
  const [notice, setNotice] = useState("");
  const [partner, setPartner] = useState(emptyPerson);
  const [partnerError, setPartnerError] = useState("");

  const plan = PLANS[planId];
  const planDetail = PLAN_DETAILS[planId] || PLAN_DETAILS.full;
  const selectedMeta = selected.map((id) => CUSTOM_CATALOG.find((item) => item.id === id)).filter(Boolean);
  const showCompatForm = selected.includes("compatibility");

  function choosePlan(nextId) {
    setPlanId(nextId);
    setNotice("");
    if (nextId === "full") {
      setSelected(CUSTOM_CATALOG.map((item) => item.id));
      setNotice("풀 패키지 구성입니다. 실제 PDF는 크몽·당근 주문 후 판매자가 전달합니다.");
      return;
    }
    if (nextId === "single" && selected.length > 1) {
      setSelected(selected.slice(0, 1));
      setNotice("1가지 구성을 미리 보는 중입니다. 웹에서 PDF를 즉시 받을 수는 없습니다.");
      return;
    }
    if (nextId === "triple" && selected.length > 3) {
      setSelected(selected.slice(-3));
      setNotice("3가지 구성을 미리 보는 중입니다. 웹에서 PDF를 즉시 받을 수는 없습니다.");
    }
  }

  function toggleItem(id) {
    if (planId === "full") {
      setNotice("풀 패키지에서는 9개가 모두 포함됩니다. 구성만 살펴 보려면 1·3가지 모드로 바꿔 주세요.");
      return;
    }
    const result = toggleCustomSelection(selected, id, planId);
    setSelected(result.selected);
    setNotice(result.notice || "관심 주제를 골랐습니다. 구매·PDF 전달은 마켓 주문 후 진행됩니다.");
  }

  function submitPartner(event) {
    event.preventDefault();
    setPartnerError("");
    try {
      const payload = {
        ...partner,
        minute: partner.minute === "" ? "0" : partner.minute,
      };
      onPartnerSubmit?.(payload);
      setNotice("상대 정보로 화면 궁합 미리보기를 다시 계산했습니다. (유료 PDF와는 별개)");
      onNote?.("정밀 궁합 미리보기 재계산");
    } catch (cause) {
      setPartnerError(cause instanceof Error ? cause.message : "상대 명식을 풀지 못했습니다.");
    }
  }

  return (
    <div className="space-y-5 pb-28">
      <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5 sm:p-6">
        <p className="text-xs tracking-[0.22em] text-gold">맞춤형 운세 · 마켓 주문 안내</p>
        <h3 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">구성만 미리 살펴보세요</h3>
        <p className="mt-3 text-sm leading-7 text-mist">
          {reading.displayName} 님 명식 기준으로 어떤 주제가 담기는지 안내합니다.{" "}
          <strong className="text-cream">심층 PDF(통상 약 140페이지 전후·분량 미보장)는 이 사이트에서 결제·다운로드되지 않습니다.</strong> 크몽·당근에서
          주문·결제하시면 판매자가 확인 후 PDF로 전달합니다.
        </p>
      </article>

      <div className="grid gap-3 sm:grid-cols-3">
        {Object.values(PLANS).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choosePlan(item.id)}
            aria-pressed={planId === item.id}
            className={`rounded-2xl border p-4 text-left transition ${
              planId === item.id ? "border-gold bg-gold/15 ring-1 ring-gold/40" : "border-white/10 bg-white/5 hover:border-gold/35"
            }`}
          >
            <p className="font-serif text-lg text-cream">{item.label}</p>
            <p className="mt-1 text-sm text-gold">참고가 {formatWon(item.price)}</p>
            <p className="mt-2 text-xs leading-5 text-mist">{item.desc}</p>
            {planId === item.id ? <p className="mt-3 text-xs text-gold">선택됨 · 포함 내역 확인</p> : null}
          </button>
        ))}
      </div>

      <PlanDetailBox plan={plan} detail={planDetail} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pack.items.map((item) => {
          const on = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                on ? "border-gold bg-gold/10" : "border-white/10 bg-white/5 hover:border-gold/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-serif text-lg text-cream">{item.title}</p>
                  <p className="mt-1 text-xs text-gold">{item.blurb}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    on ? "bg-gold text-night" : "border border-white/15 text-mist"
                  }`}
                >
                  {on ? "포함" : "미포함"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-mist">{item.preview}</p>
            </button>
          );
        })}
      </div>

      {showCompatForm ? (
        <form onSubmit={submitPartner} className="rounded-2xl border border-gold/30 bg-white/5 p-5">
          <h4 className="font-serif text-xl text-cream">정밀 궁합 · 상대 미리보기</h4>
          <p className="mt-2 text-sm leading-6 text-mist">
            화면에서 궁합 요약을 보려면 상대 정보를 입력하세요. 유료 PDF 본문은 마켓 주문 후 판매자가 생성합니다.
            {reading.compat ? ` 현재: ${reading.compat.pair} · ${reading.compat.score}점` : ""}
          </p>
          <div className="mt-4">
            <PersonFields title="상대" value={partner} onChange={setPartner} />
          </div>
          {partnerError ? <p className="mt-3 text-sm text-rose">{partnerError}</p> : null}
          <button type="submit" className="mt-4 rounded-full bg-gold px-5 py-2.5 text-sm text-night">
            궁합 미리보기 계산
          </button>
        </form>
      ) : null}

      {notice ? <p className="rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">{notice}</p> : null}

      <article className="rounded-2xl border border-dashed border-gold/40 bg-night/40 p-5 text-sm leading-7 text-mist">
        <p className="text-xs tracking-[0.18em] text-gold">구매·전달 안내</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-cream/95">
          <li>크몽 또는 당근에서 상품을 주문하고 결제를 완료합니다.</li>
          <li>주문 메시지에 출생 정보(양력/음력, 생년월일, 시각, 성별)를 남깁니다.</li>
          <li>판매자가 결제·주문을 확인한 뒤, 판매자 PC에서 심층 PDF를 생성합니다.</li>
          <li>익명 파일명으로 플랫폼 채팅·작업물 발송을 통해 전달받습니다.</li>
        </ol>
        <p className="mt-4 text-xs text-mist">
          관심 구성: {selectedMeta.map((item) => item.title).join(" · ") || "없음"} ({selected.length}/{plan.max}) · 참고가{" "}
          {formatWon(plan.price)}
        </p>
      </article>

      <div className="shop-dock safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-gold/30 bg-night/95 px-3 py-3 backdrop-blur-md sm:px-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-gold">{plan.label} · 사이트 내 결제 없음</p>
            <p className="truncate text-sm text-cream">
              {selectedMeta.length ? selectedMeta.map((item) => item.title).join(" · ") : "구성을 살펴 보세요"}
            </p>
          </div>
          <p className="shrink-0 text-sm text-mist">PDF는 마켓 주문 후 판매자가 전달합니다</p>
        </div>
      </div>
    </div>
  );
}

function PlanDetailBox({ plan, detail }) {
  return (
    <article className="rounded-2xl border border-gold/35 bg-gradient-to-br from-gold/10 via-white/5 to-transparent p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-gold">상세 구성 및 포함 내역</p>
          <h4 className="mt-2 font-serif text-xl text-cream sm:text-2xl">{detail.headline}</h4>
        </div>
        <div className="text-right">
          <span className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">{detail.badge}</span>
          <p className="mt-2 font-serif text-2xl text-gold">참고가 {formatWon(plan.price)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-7 text-mist">{detail.lead}</p>
      <p className="mt-2 rounded-xl border border-white/10 bg-night/40 px-3 py-2 text-sm text-cream">{detail.pages}</p>
      <ul className="mt-4 space-y-2.5">
        {detail.includes.map((line) => (
          <li key={line} className="flex gap-2 text-sm leading-6 text-mist">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
            <span className="text-cream/95">{line}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-6 text-gold">{detail.tip}</p>
    </article>
  );
}
