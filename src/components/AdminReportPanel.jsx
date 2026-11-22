import { useCallback, useEffect, useMemo, useState } from "react";
import { resolveAdminForm } from "../lib/adminFormFromReading.js";
import { CUSTOM_CATALOG } from "../lib/customFortune.js";

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const type = res.headers.get("content-type") || "";
  if (type.includes("application/pdf")) {
    const blob = await res.blob();
    return { ok: res.ok, status: res.status, pdfBlob: blob, pages: res.headers.get("X-Report-Pages") };
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, ...data };
}

function formToPayload(form, product, selected) {
  const topics = selected.length ? selected : ["wealth"];
  return {
    surname: form.surname,
    given: form.given,
    year: form.year,
    month: form.month,
    day: form.day,
    hour: form.hour,
    minute: form.minute,
    unknownTime: Boolean(form.unknownTime),
    yaja: Boolean(form.yaja),
    gender: form.gender,
    calendar: form.calendar,
    status: form.status,
    role: form.role,
    product: product || "full",
    topicId: topics[0],
    selected: topics,
  };
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 관리자 전용 — 세션은 서버 쿠키로만 확인. 버튼 표시는 UX용이며 생성 API는 서버에서 재검증.
 */
export default function AdminReportPanel({ form = null, reading = null }) {
  const [authed, setAuthed] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [product, setProduct] = useState("full");
  const [selected, setSelected] = useState(() => CUSTOM_CATALOG.map((item) => item.id));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [reportHtml, setReportHtml] = useState("");
  const [meta, setMeta] = useState(null);
  const [tallPreview, setTallPreview] = useState(true);

  const readyForm = useMemo(() => resolveAdminForm(form, reading), [form, reading]);
  const canGenerate = Boolean(readyForm) && !busy;
  const maxTopics = product === "single" ? 1 : product === "triple" ? 3 : CUSTOM_CATALOG.length;

  const selectionHint = useMemo(() => {
    if (product === "full") return "풀 패키지는 9개 운세 항목이 모두 포함됩니다.";
    if (product === "triple") return `3가지 맞춤: ${selected.length}/3 선택`;
    return `개별 운세: ${selected[0] ? CUSTOM_CATALOG.find((t) => t.id === selected[0])?.title || selected[0] : "미선택"}`;
  }, [product, selected]);

  const refreshSession = useCallback(async () => {
    try {
      const data = await api("/api/admin/session");
      setAuthed(Boolean(data.authenticated));
    } catch {
      setAuthed(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  function chooseProduct(next) {
    setProduct(next);
    setMessage("");
    if (next === "full") {
      setSelected(CUSTOM_CATALOG.map((item) => item.id));
      return;
    }
    if (next === "triple") {
      setSelected((prev) => {
        const keep = prev.slice(0, 3);
        return keep.length ? keep : ["wealth", "career", "marriage"];
      });
      return;
    }
    setSelected((prev) => [prev[0] || "wealth"]);
  }

  function toggleTopic(id) {
    if (product === "full") {
      setMessage("풀 패키지에서는 모든 항목이 포함됩니다. 개별·3종을 고르면 항목을 선택할 수 있습니다.");
      return;
    }
    if (product === "single") {
      setSelected([id]);
      return;
    }
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      if (!data.ok) {
        setMessage(data.error || "로그인 실패");
        setAuthed(false);
        return;
      }
      setPassword("");
      setOpenLogin(false);
      setAuthed(true);
      setMessage("관리자 로그인되었습니다. 명식을 푼 뒤 보고서를 생성할 수 있습니다.");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "로그인 요청 실패");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await api("/api/admin/logout", { method: "POST", body: "{}" });
      setAuthed(false);
      setReportHtml("");
      setMeta(null);
      setMessage("로그아웃했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function openPrintWindow(html) {
    const win = window.open("", "_blank");
    if (!win) return false;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      try {
        win.print();
      } catch {
        /* ignore */
      }
    }, 800);
    return true;
  }

  async function generateReport({ asPdf } = {}) {
    if (!readyForm) {
      setMessage("먼저 이름·생년월일 등을 입력하고 「내 흐름 무료 요약 보기」를 실행해 주세요.");
      return;
    }
    if (product !== "full" && selected.length === 0) {
      setMessage("확인할 운세 항목을 하나 이상 선택해 주세요.");
      return;
    }
    if (product === "triple" && selected.length !== 3) {
      setMessage("3종 맞춤은 운세 항목을 정확히 3개 선택해 주세요.");
      return;
    }

    // 이미 열린 보고서로 PDF/인쇄만 할 때는 서버를 다시 치지 않음 (개발 서버 안정성)
    if (asPdf && reportHtml) {
      const opened = openPrintWindow(reportHtml);
      setMessage(
        opened
          ? `인쇄 창을 열었습니다 (${meta?.pages ?? "?"}쪽). 「PDF로 저장」을 선택하세요.`
          : "팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.",
      );
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      // 항상 HTML만 요청 — 서버 Puppeteer PDF는 Vite를 중단시킬 수 있어 사용하지 않음
      const data = await api("/api/admin/report", {
        method: "POST",
        body: JSON.stringify({ ...formToPayload(readyForm, product, selected), format: "html" }),
      });
      if (data.status === 401) {
        setAuthed(false);
        setMessage("세션이 만료되었습니다. 다시 로그인해 주세요.");
        return;
      }
      if (!data.ok || !data.html) {
        setMessage(data.error || "보고서 생성에 실패했습니다.");
        return;
      }
      setReportHtml(data.html);
      setMeta({ pages: data.pages, pillars: data.pillars, productLabel: data.productLabel });
      setMessage(`보고서를 생성했습니다 (${data.pages}쪽 · ${data.pillars}).`);
      document.getElementById("admin-full-report")?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (asPdf) {
        const opened = openPrintWindow(data.html);
        setMessage(
          opened
            ? `보고서 ${data.pages}쪽을 열었습니다. 인쇄 대화상자에서 「PDF로 저장」을 선택하세요. 서버는 그대로 유지됩니다.`
            : `보고서 ${data.pages}쪽을 표시했습니다. 팝업이 막혀 「인쇄·PDF 저장」을 눌러 주세요.`,
        );
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "보고서 요청 실패");
    } finally {
      setBusy(false);
    }
  }

  function printReport() {
    if (!reportHtml) return;
    if (!openPrintWindow(reportHtml)) {
      setMessage("팝업이 차단되었습니다. 팝업을 허용한 뒤 다시 시도해 주세요.");
    }
  }

  function saveHtmlFile() {
    if (!reportHtml) return;
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    downloadBlob(new Blob([reportHtml], { type: "text/html;charset=utf-8" }), `dalbit-report-${stamp}.html`);
  }

  return (
    <section
      id="admin-panel"
      className="scroll-mt-24 rounded-3xl border border-rose/35 bg-rose/5 p-4 sm:p-6"
      aria-label="관리자 전체 보고서"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.22em] text-rose/90">관리자 전용</p>
          <h3 className="mt-1 font-serif text-xl text-cream sm:text-2xl">전체 보고서 보기</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-mist">
            서버에서 관리자 세션을 확인한 뒤에만 단품·3종·풀 패키지 보고서를 생성합니다. 고객 정보는 서버에 저장하지
            않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {authed ? (
            <button
              type="button"
              disabled={busy}
              onClick={logout}
              className="touch-target rounded-full border border-white/20 px-4 py-2 text-sm text-mist"
            >
              로그아웃
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpenLogin((v) => !v)}
              className="touch-target rounded-full border border-rose/40 px-4 py-2 text-sm text-rose"
            >
              관리자 로그인
            </button>
          )}
        </div>
      </div>

      {openLogin && !authed ? (
        <form onSubmit={login} className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-white/10 bg-night/40 p-3">
          <label className="min-w-[12rem] flex-1 text-left text-xs text-mist">
            관리자 비밀번호
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="touch-target rounded-full bg-rose/90 px-4 py-2 text-sm font-medium text-cream"
          >
            로그인
          </button>
        </form>
      ) : null}

      {authed ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="보고서 구성">
            {[
              ["full", "풀 패키지"],
              ["triple", "3가지 맞춤"],
              ["single", "개별 운세"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={product === id}
                onClick={() => chooseProduct(id)}
                className={`touch-target rounded-full px-4 py-2 text-sm ${
                  product === id ? "bg-gold text-night" : "border border-white/15 text-mist"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-sm text-mist">{selectionHint}</p>

          <div className="flex flex-wrap gap-2">
            {CUSTOM_CATALOG.map((topic) => {
              const on = product === "full" || selected.includes(topic.id);
              const disabled = product === "full";
              return (
                <button
                  key={topic.id}
                  type="button"
                  disabled={disabled}
                  aria-pressed={on}
                  onClick={() => toggleTopic(topic.id)}
                  className={`rounded-full px-3 py-1.5 text-xs sm:text-sm ${
                    on ? "bg-rose/80 text-cream" : "border border-white/15 text-mist"
                  } ${disabled ? "opacity-70" : ""}`}
                >
                  {topic.title}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-mist/80">최대 {maxTopics}개 · 기존 사주 엔진·PDF 디자인을 그대로 사용합니다.</p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => generateReport({ asPdf: false })}
              className="touch-target rounded-full bg-gold px-4 py-2 text-sm font-medium text-night disabled:opacity-40"
            >
              보고서 생성·열람
            </button>
            <button
              type="button"
              disabled={!canGenerate}
              onClick={() => generateReport({ asPdf: true })}
              className="touch-target rounded-full border border-gold/50 px-4 py-2 text-sm text-gold disabled:opacity-40"
            >
              인쇄·PDF 저장
            </button>
          </div>
          {readyForm ? (
            <p className="text-sm text-cream">
              명식 준비됨 · {readyForm.surname}
              {readyForm.given} · {readyForm.calendar === "lunar" ? "음력" : "양력"} {readyForm.year}-{readyForm.month}-
              {readyForm.day}
              {readyForm.unknownTime ? " · 시 미상" : ` · ${readyForm.hour}:${String(readyForm.minute).padStart(2, "0")}`}
            </p>
          ) : (
            <p className="text-sm text-mist">위 명식 입력에서 「내 흐름 무료 요약 보기」를 먼저 실행해 주세요.</p>
          )}
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}

      {reportHtml ? (
        <div id="admin-full-report" className="mt-5 scroll-mt-24 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-cream">
              {meta?.productLabel || "보고서"} · {meta?.pages ?? "?"}쪽
              {meta?.pillars ? ` · ${meta.pillars}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTallPreview((v) => !v)}
                className="touch-target rounded-full border border-white/20 px-4 py-2 text-sm text-mist"
              >
                {tallPreview ? "미리보기 축소" : "미리보기 확대"}
              </button>
              <button
                type="button"
                onClick={printReport}
                className="touch-target rounded-full border border-gold/40 px-4 py-2 text-sm text-gold"
              >
                인쇄·PDF 저장
              </button>
              <button
                type="button"
                onClick={saveHtmlFile}
                className="touch-target rounded-full border border-white/20 px-4 py-2 text-sm text-mist"
              >
                HTML 저장
              </button>
              <button
                type="button"
                onClick={() => {
                  setReportHtml("");
                  setMeta(null);
                }}
                className="touch-target rounded-full border border-white/20 px-4 py-2 text-sm text-mist"
              >
                화면에서 닫기
              </button>
            </div>
          </div>
          <iframe
            title="관리자 전체 보고서"
            srcDoc={reportHtml}
            className={`w-full rounded-2xl border border-white/15 bg-white ${
              tallPreview ? "h-[min(92vh,2200px)] min-h-[80vh]" : "h-[70vh]"
            }`}
          />
        </div>
      ) : null}
    </section>
  );
}
