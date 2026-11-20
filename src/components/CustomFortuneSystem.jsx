import { useMemo, useRef, useState } from "react";
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
import { generateProductReportHtml } from "../lib/productReportHtml";

function openLoadingWindow(isFull) {
  let printWin = null;
  try {
    printWin = window.open("", "_blank");
  } catch {
    return null;
  }
  if (!printWin) return null;
  try {
    printWin.document.write(`<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><title>리포트 생성 중</title>
      <style>body{font-family:'Malgun Gothic',sans-serif;background:#1a2e22;color:#f7f4ed;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;text-align:center;padding:24px}
      .box{max-width:440px} .spin{width:40px;height:40px;border:2px solid rgba(212,175,55,.35);border-top-color:#d4af37;border-radius:50%;margin:0 auto 16px;animation:s 1s linear infinite}
      @keyframes s{to{transform:rotate(360deg)}} p{line-height:1.7;color:#d4af37}</style></head>
      <body><div class="box"><div class="spin"></div><p>${isFull ? "120페이지 심층 리포트를 생성 중입니다..." : "리포트를 생성 중입니다..."}</p></div></body></html>`);
    printWin.document.close();
  } catch {
    return null;
  }
  return printWin;
}

function writeReportWindow(printWin, html) {
  if (!printWin || printWin.closed) return false;
  try {
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      try {
        printWin.focus();
        printWin.print();
      } catch {
        /* 인쇄 대화상자는 사용자가 막았을 수 있다 */
      }
    }, 700);
    return true;
  } catch {
    return false;
  }
}

function downloadHtmlFile(html, fileName) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function CustomFortuneSystem({ reading, onPartnerSubmit, onNote }) {
  // 항상 최신 빌더로 재생성(캐시된 customFortune에 majors/timing이 빠져 있어도 화면에 보이게)
  const pack = useMemo(() => buildCustomFortunePack(reading), [reading]);
  const [planId, setPlanId] = useState("single");
  const [selected, setSelected] = useState([]);
  const [notice, setNotice] = useState("");
  const [unlocked, setUnlocked] = useState([]);
  const [fullUnlocked, setFullUnlocked] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [partner, setPartner] = useState(emptyPerson);
  const [partnerError, setPartnerError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [reportView, setReportView] = useState(null);
  const pdfLock = useRef(false);
  const frameRef = useRef(null);

  const plan = PLANS[planId];
  const planDetail = PLAN_DETAILS[planId] || PLAN_DETAILS.single;
  const price = plan.price;
  const selectedMeta = selected.map((id) => CUSTOM_CATALOG.find((item) => item.id === id)).filter(Boolean);
  const showCompatForm = selected.includes("compatibility") || unlocked.includes("compatibility");

  function choosePlan(nextId) {
    setPlanId(nextId);
    setNotice("");
    if (nextId === "full") {
      setSelected(CUSTOM_CATALOG.map((item) => item.id));
      setNotice("전체운·평생운 풀 패키지 — 9개 항목이 모두 선택되었습니다.");
      return;
    }
    if (nextId === "single" && selected.length > 1) {
      setSelected(selected.slice(0, 1));
      setNotice("1가지 모드로 바꿔, 가장 최근 선택 1개만 남겼습니다.");
      return;
    }
    if (nextId === "triple" && selected.length > 3) {
      setSelected(selected.slice(-3));
      setNotice("3가지 모드로 바꿔, 최근 선택 3개만 남겼습니다.");
    }
  }

  function toggleItem(id) {
    if (planId === "full") {
      setNotice("풀 패키지에서는 9개가 모두 포함됩니다. 개별 해제는 1·3가지 모드로 바꿔 주세요.");
      return;
    }
    const result = toggleCustomSelection(selected, id, planId);
    setSelected(result.selected);
    setNotice(result.notice);
  }

  function confirmPay() {
    if (!selected.length) {
      setNotice("결제할 운세 항목을 먼저 골라 주세요.");
      return;
    }
    if (planId !== "full" && selected.includes("compatibility") && !reading.compat) {
      setNotice("정밀 궁합은 상대 정보를 입력한 뒤 결제해 주세요.");
      setPayOpen(false);
      return;
    }
    const printWin = openLoadingWindow(planId === "full");
    setUnlocked((prev) => Array.from(new Set([...prev, ...selected])));
    if (planId === "full") setFullUnlocked(true);
    setPayOpen(false);
    setPdfError("");
    setNotice(
      planId === "full"
        ? "풀 패키지 잠금을 해제했습니다. 120페이지 PDF 리포트를 바로 엽니다."
        : `${plan.label} 결제가 완료되었습니다. 리포트를 바로 엽니다. (테스트 잠금 해제)`,
    );
    onNote?.(`${plan.label} ${formatWon(price)} 테스트 결제 완료`);
    requestAnimationFrame(() => {
      document.getElementById("custom-unlocked")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    void downloadPdf(planId, printWin);
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
      setNotice("상대 정보로 정밀 궁합을 다시 계산했습니다.");
    } catch (cause) {
      setPartnerError(cause instanceof Error ? cause.message : "상대 명식을 풀지 못했습니다.");
    }
  }

  function yieldToUi() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 40);
      });
    });
  }

  function openReportFromClick(mode = planId) {
    const printWin = openLoadingWindow(mode === "full");
    void downloadPdf(mode, printWin);
  }

  async function downloadPdf(mode = planId, existingWin = null) {
    if (pdfLock.current) return;
    pdfLock.current = true;
    const isFull = mode === "full";
    const label = isFull ? "풀패키지" : mode === "triple" ? "3종맞춤" : selectedMeta[0]?.title || "단품";
    const printWin = existingWin && !existingWin.closed ? existingWin : null;

    setPdfBusy(true);
    setPdfError("");
    setPdfMessage(isFull ? "120페이지 리포트를 구성하고 있습니다. 명식과 9종 풀이를 모으는 중입니다..." : `${label} 리포트를 구성하고 있습니다...`);
    await yieldToUi();

    try {
      setPdfMessage(isFull ? "120페이지 분량을 한 권으로 묶는 중입니다..." : "리포트 페이지를 묶는 중입니다...");
      await yieldToUi();
      const html = await new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            const next = generateProductReportHtml(reading, {
              mode: isFull ? "full" : mode === "triple" ? "triple" : "single",
              selected,
              topicId: selected[0],
            });
            resolve(next);
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
      if (!html || html.length < 800) {
        throw new Error("리포트 내용이 비어 있습니다. 잠시 뒤 다시 눌러 주세요.");
      }

      setPdfMessage(isFull ? "120페이지 인쇄·PDF 저장 화면을 여는 중입니다..." : "인쇄·PDF 저장 화면을 여는 중입니다...");
      await yieldToUi();

      const fileName = `${reading.displayName || "사주"}-${label}-동서양리포트.html`;
      downloadHtmlFile(html, fileName);
      const opened = writeReportWindow(printWin, html);
      if (!opened) {
        setReportView({
          html,
          title: isFull ? "120페이지 PDF 리포트" : `${label} PDF 리포트`,
        });
        setNotice("팝업이 막혀 이 화면에서 리포트를 열었습니다. ‘PDF 저장 / 인쇄’를 누르면 저장할 수 있습니다.");
      } else {
        setReportView(null);
        setNotice(
          isFull
            ? "120페이지 리포트를 열었습니다. 인쇄 창에서 대상을 ‘PDF로 저장’으로 고르세요."
            : `${label} 리포트를 열었습니다. 인쇄 창에서 대상을 ‘PDF로 저장’으로 고르세요.`,
        );
      }
      onNote?.(
        isFull
          ? "평생운 풀 패키지(~120p) 리포트 생성·인쇄 창을 열었습니다."
          : mode === "triple"
            ? "3가지 맞춤 리포트 생성·인쇄 창을 열었습니다."
            : "단품 심층 리포트(~10p) 생성·인쇄 창을 열었습니다.",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "리포트 생성에 실패했습니다.";
      if (printWin && !printWin.closed) {
        try {
          printWin.close();
        } catch {
          /* ignore */
        }
      }
      setPdfError(message);
      setNotice(message);
    } finally {
      pdfLock.current = false;
      setPdfBusy(false);
      setPdfMessage("");
    }
  }

  function printEmbeddedReport() {
    const frame = frameRef.current;
    const win = frame?.contentWindow;
    if (!win) {
      setPdfError("이 화면의 인쇄 뷰를 찾지 못했습니다. 버튼을 한 번 더 눌러 주세요.");
      return;
    }
    try {
      win.focus();
      win.print();
      setPdfError("");
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "인쇄 창을 열지 못했습니다.");
    }
  }

  const unlockedItems = pack.items.filter((item) => unlocked.includes(item.id));

  return (
    <div className="space-y-5 pb-28">
      <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5 sm:p-6">
        <p className="text-xs tracking-[0.22em] text-gold">맞춤형 운세 · 차등 요금</p>
        <h3 className="mt-2 font-serif text-2xl text-cream sm:text-3xl">원하는 운세만 골라 풀기</h3>
        <p className="mt-3 text-sm leading-7 text-mist">
          {reading.displayName} 님의 명식을 바탕으로, 필요한 항목만 선택해 결제(테스트 잠금 해제)하면 심층 풀이가 바로
          열립니다.
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
            <p className="mt-1 text-sm text-gold">{formatWon(item.price)}</p>
            <p className="mt-2 text-xs leading-5 text-mist">{item.desc}</p>
            {planId === item.id ? <p className="mt-3 text-xs text-gold">선택됨 · 아래 포함 내역 확인</p> : null}
          </button>
        ))}
      </div>

      <PlanDetailBox plan={plan} detail={planDetail} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pack.items.map((item) => {
          const on = selected.includes(item.id);
          const open = unlocked.includes(item.id);
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
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${on ? "bg-gold text-night" : "border border-white/15 text-mist"}`}>
                  {open ? "해제됨" : on ? "선택" : "잠금"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-mist">{item.preview}</p>
            </button>
          );
        })}
      </div>

      {showCompatForm ? (
        <form onSubmit={submitPartner} className="rounded-2xl border border-gold/30 bg-white/5 p-5">
          <h4 className="font-serif text-xl text-cream">정밀 궁합 · 상대 정보</h4>
          <p className="mt-2 text-sm leading-6 text-mist">
            상대방의 이름·생년월일시·성별을 입력하면 2인 궁합이 다시 계산됩니다.
            {reading.compat ? ` 현재: ${reading.compat.pair} · ${reading.compat.score}점` : ""}
          </p>
          <div className="mt-4">
            <PersonFields title="상대" value={partner} onChange={setPartner} />
          </div>
          {partnerError ? <p className="mt-3 text-sm text-rose">{partnerError}</p> : null}
          <button type="submit" className="mt-4 rounded-full bg-gold px-5 py-2.5 text-sm text-night">
            궁합 다시 계산
          </button>
        </form>
      ) : null}

      {notice ? <p className="rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm text-gold">{notice}</p> : null}
      {pdfError ? (
        <p className="rounded-2xl border border-rose-400/40 bg-rose-950/50 px-4 py-3 text-sm leading-6 text-rose-100" role="alert">
          리포트를 열지 못했습니다. {pdfError}
        </p>
      ) : null}

      <div id="custom-unlocked" className="scroll-mt-28 space-y-4">
        {fullUnlocked ? (
          <article className="rounded-2xl border-2 border-gold bg-gold/15 p-5 shadow-lg">
            <p className="text-xs tracking-[0.18em] text-gold">풀 패키지 결제 완료</p>
            <h4 className="mt-2 font-serif text-2xl text-cream">120페이지 PDF 리포트</h4>
            <p className="mt-2 text-sm leading-7 text-cream">
              잠금이 해제되었습니다. 아래 버튼으로 120페이지 리포트를 바로 열 수 있습니다. 인쇄 창에서 대상을 ‘PDF로 저장’으로 고르세요.
            </p>
            <button
              type="button"
              disabled={pdfBusy}
              onClick={() => openReportFromClick("full")}
              className="mt-4 w-full rounded-full bg-gold px-5 py-3 text-base font-medium text-night disabled:opacity-60 sm:w-auto"
            >
              {pdfBusy ? "120페이지 생성 중..." : "120페이지 PDF 리포트 다운로드 / 인쇄"}
            </button>
          </article>
        ) : null}
        {unlockedItems.length ? (
          <>
            {unlockedItems.map((item) => (
              <UnlockedCard key={item.id} item={item} />
            ))}
            {!fullUnlocked ? (
              <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h4 className="font-serif text-xl text-cream">선택 상품 PDF 리포트</h4>
                <p className="mt-2 text-sm leading-6 text-mist">
                  {planId === "triple"
                    ? "선택한 3가지 주제의 동서양 융합 리포트 HTML을 받을 수 있습니다."
                    : "단품 주제 약 10페이지 분량의 동서양 융합 리포트 HTML을 받을 수 있습니다."}
                </p>
                <button
                  type="button"
                  disabled={pdfBusy}
                  onClick={() => openReportFromClick(planId)}
                  className="mt-4 rounded-full bg-gold px-5 py-2.5 text-sm text-night disabled:opacity-60"
                >
                  {pdfBusy ? "생성 중..." : "PDF 저장·인쇄"}
                </button>
              </article>
            ) : null}
          </>
        ) : (
          <article className="rounded-2xl border border-dashed border-white/15 p-5 text-sm leading-7 text-mist">
            결제(테스트 잠금 해제) 후, 선택한 항목의 심층 풀이 카드가 이곳에 펼쳐집니다.
          </article>
        )}

        {fullUnlocked ? (
          <div className="space-y-4">
            <article className="rounded-2xl border border-gold/35 bg-gold/10 p-5">
              <p className="text-xs tracking-[0.18em] text-gold">풀 패키지 보너스</p>
              <h4 className="mt-2 font-serif text-2xl text-cream">평생 총운</h4>
              <p className="mt-3 text-sm leading-7 text-cream">{pack.lifetime.summary}</p>
              {pack.lifetime.sections.map((section) => (
                <div key={section.title} className="mt-4">
                  <p className="text-sm text-gold">{section.title}</p>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-mist">
                    {section.lines.map((line) => (
                      <li key={line}>· {line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="font-serif text-xl text-cream">10년 세운 요약</h4>
              <p className="mt-3 text-sm leading-7 text-mist">{pack.tenYearSummary}</p>
              <p className="mt-2 text-sm text-gold">{pack.tenYearPeaks.join(" · ")}</p>
              <p className="mt-3 text-sm text-mist">자세한 연도별 카드는 ‘10년 세운’ 탭에서도 볼 수 있습니다.</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h4 className="font-serif text-xl text-cream">120페이지 PDF 리포트 다운로드 / 인쇄</h4>
              <p className="mt-2 text-sm leading-6 text-mist">
                동양 역학 + 서양 점성술 융합, 9종 개별운·10년 세운·12개월 월운·개운법·명상 간지가 포함된 풀 패키지입니다. 팝업이 막히면 이 페이지에서 바로 인쇄·PDF 저장이 열립니다.
              </p>
              <button
                type="button"
                disabled={pdfBusy}
                onClick={() => openReportFromClick("full")}
                className="mt-4 rounded-full bg-gold px-5 py-2.5 text-sm text-night disabled:opacity-60"
              >
                {pdfBusy ? "120페이지 생성 중..." : "120페이지 PDF 리포트 다운로드 / 인쇄"}
              </button>
            </article>
          </div>
        ) : null}
      </div>

      {pdfBusy ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-night/80 px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-md rounded-2xl border border-gold/40 bg-night px-6 py-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
            <p className="font-serif text-xl text-cream">리포트 생성</p>
            <p className="mt-3 text-sm leading-7 text-gold">{pdfMessage || "리포트를 생성 중입니다..."}</p>
            <p className="mt-2 text-xs leading-6 text-mist">
              {pdfError ? pdfError : "잠시만 기다려 주세요. 생성이 끝나면 인쇄·PDF 저장 창이 열립니다."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/30 bg-night/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gold">{plan.label}</p>
            <p className="text-sm text-cream">
              {selectedMeta.length
                ? `${selectedMeta.map((item) => item.title).join(" · ")}`
                : "항목을 선택해 주세요"}
              <span className="ml-2 text-mist">({selected.length}/{plan.max})</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="font-serif text-xl text-gold">{formatWon(price)}</p>
            {fullUnlocked ? (
              <button
                type="button"
                disabled={pdfBusy}
                onClick={() => openReportFromClick("full")}
                className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-night disabled:opacity-60"
              >
                {pdfBusy ? "120페이지 생성 중..." : "120페이지 PDF 리포트 다운로드 / 인쇄"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPayOpen(true)}
                className="rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-night"
              >
                결제하기(테스트 잠금 해제)
              </button>
            )}
          </div>
        </div>
      </div>

      {payOpen ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl border border-gold/40 bg-[#0c1228] p-6">
            <h4 className="font-serif text-2xl text-cream">테스트 결제</h4>
            <p className="mt-3 text-sm leading-7 text-mist">
              {planId === "full"
                ? "실제 결제는 연결되지 않습니다. 결제 완료를 누르면 풀 패키지 잠금이 풀리고, 120페이지 PDF 리포트가 바로 열립니다."
                : "실제 결제는 연결되지 않습니다. 확인을 누르면 선택한 운세의 잠금이 해제되고 리포트가 바로 열립니다."}
            </p>
            <p className="mt-3 text-sm text-gold">
              {plan.label} · {formatWon(price)}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-cream">
              {selectedMeta.map((item) => (
                <li key={item.id}>· {item.title}</li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <button type="button" className="flex-1 rounded-full border border-white/20 py-2.5 text-sm text-mist" onClick={() => setPayOpen(false)}>
                취소
              </button>
              <button type="button" className="flex-1 rounded-full bg-gold py-2.5 text-sm text-night" onClick={confirmPay}>
                결제 완료
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {reportView ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-night">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/40 bg-[#0c1228] px-4 py-3">
            <div>
              <p className="font-serif text-lg text-cream">{reportView.title}</p>
              <p className="text-xs leading-5 text-gold">팝업이 막혀 이 화면에서 열었습니다. 인쇄 창의 대상을 ‘PDF로 저장’으로 고르세요.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={printEmbeddedReport} className="rounded-full bg-gold px-4 py-2 text-sm text-night">
                PDF 저장 / 인쇄
              </button>
              <button
                type="button"
                onClick={() => setReportView(null)}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-mist"
              >
                닫기
              </button>
            </div>
          </div>
          <iframe
            ref={frameRef}
            title={reportView.title}
            srcDoc={reportView.html}
            className="min-h-0 w-full flex-1 bg-white"
            onLoad={() => {
              window.setTimeout(() => printEmbeddedReport(), 500);
            }}
          />
        </div>
      ) : null}
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
          <p className="mt-2 font-serif text-2xl text-gold">{formatWon(plan.price)}</p>
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

function SectionBlock({ title, lines, tone = "mist" }) {
  if (!lines?.length) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/10 p-4">
      <p className="text-sm text-gold">{title}</p>
      <div className={`mt-2 space-y-2 text-sm leading-7 ${tone === "cream" ? "text-cream" : "text-mist"}`}>
        {lines.map((line, index) => (
          <p key={`${title}-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function UnlockedCard({ item }) {
  return (
    <article className="rounded-2xl border border-gold/30 bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-gold">{item.blurb}</p>
          <h4 className="mt-1 font-serif text-2xl text-cream">{item.title}</h4>
        </div>
        <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">동서양 융합 · 해제</span>
      </div>

      <SectionBlock title="핵심 요약" lines={[item.summary]} tone="cream" />
      <SectionBlock title={item.eastern?.title || "상세 원인 풀이 · 동양 역학"} lines={item.eastern?.paragraphs} />
      <SectionBlock title={item.western?.title || "상세 원인 풀이 · 서양 점성술"} lines={item.western?.paragraphs} />
      <SectionBlock title={item.bridge?.title || "동서양 교차 한 줄"} lines={item.bridge?.paragraphs} />
      {item.id === "career" ? (
        <>
          <SectionBlock
            title="맞춤 학과·전공 추천"
            lines={item.majors?.lines?.length ? item.majors.lines : ["추천 학과·전공을 준비 중입니다."]}
          />
          <SectionBlock
            title="진학·입시·시험·이직 유리한 시기 및 주의점"
            lines={item.timing?.lines?.length ? item.timing.lines : ["진학·시험·이직 시기를 준비 중입니다."]}
          />
        </>
      ) : (
        <>
          <SectionBlock title={item.majors?.title} lines={item.majors?.lines} />
          <SectionBlock title={item.timing?.title} lines={item.timing?.lines} />
        </>
      )}
      <SectionBlock title={item.taegilGuide?.title} lines={item.taegilGuide?.lines} />

      {item.actions?.length ? (
        <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-4">
          <p className="text-sm text-gold">실전 행동 지침</p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-cream">
            {item.actions.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {item.months?.length ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {item.months.map((month) => (
            <div key={month.month} className="rounded-xl border border-white/10 p-3">
              <p className="text-xs text-gold">
                {month.month}월 · {month.body}
              </p>
              <p className="mt-1 text-xs leading-5 text-mist">{month.tip}</p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
