import { useCallback, useEffect, useMemo, useState } from "react";
import {
  emptyAdminDraft,
  isAdminDraftReady,
  normalizeAdminPayload,
  resolveAdminForm,
} from "../lib/adminFormFromReading.js";
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 관리자 전용 — 세션은 서버 쿠키로만 확인.
 * 무료 요약 실행 없이도 명식 입력 후 유료 generateProductReportHtml 보고서를 생성한다.
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
  const [draft, setDraft] = useState(emptyAdminDraft);

  const seed = useMemo(() => resolveAdminForm(form, reading), [form, reading]);
  const draftReady = isAdminDraftReady(draft);
  const canGenerate = Boolean(authed && draftReady && !busy);
  const maxTopics = product === "single" ? 1 : product === "triple" ? 3 : CUSTOM_CATALOG.length;

  useEffect(() => {
    if (!seed) return;
    setDraft((prev) => {
      // 이미 관리자가 직접 입력 중이면 덮어쓰지 않음 (빈 초안일 때만 시드)
      const prevEmpty = !prev.year && !prev.surname && !prev.given;
      if (!prevEmpty && (prev.surname || prev.year)) return prev;
      return { ...emptyAdminDraft(), ...seed };
    });
  }, [seed]);

  const selectionHint = useMemo(() => {
    if (product === "full") return "풀 패키지는 9개 운세·평생 총운·10년 세운·12개월 월운이 모두 포함됩니다.";
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

  function patchDraft(patch) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

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
      setMessage("관리자 로그인되었습니다. 아래 명식을 입력한 뒤 전체 보고서를 생성할 수 있습니다. (무료 요약 불필요)");
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
    if (!authed) {
      setMessage("관리자 로그인이 필요합니다.");
      return;
    }
    if (!draftReady) {
      setMessage("보고서용 명식(한글 성·이름, 생년월일, 성별)을 입력해 주세요. 무료 요약은 필요하지 않습니다.");
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
      const payload = normalizeAdminPayload(draft, product, selected);
      const data = await api("/api/admin/report", {
        method: "POST",
        body: JSON.stringify(payload),
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
      // 유료 HTML만 사용 — 무료 readingToReportHtml 과 분리
      setReportHtml(data.html);
      setMeta({ pages: data.pages, pillars: data.pillars, productLabel: data.productLabel });
      setMessage(`유료 전체 보고서를 생성했습니다 (${data.pages}쪽 · ${data.productLabel} · ${data.pillars}).`);
      document.getElementById("admin-full-report")?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (asPdf) {
        const opened = openPrintWindow(data.html);
        setMessage(
          opened
            ? `보고서 ${data.pages}쪽을 열었습니다. 인쇄 대화상자에서 「PDF로 저장」을 선택하세요.`
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
    downloadBlob(new Blob([reportHtml], { type: "text/html;charset=utf-8" }), `dalbit-paid-report-${stamp}.html`);
  }

  function applySeedFromFreeReading() {
    if (!seed) {
      setMessage("아직 무료 요약 결과가 없습니다. 아래 명식을 직접 입력해도 됩니다.");
      return;
    }
    setDraft({ ...emptyAdminDraft(), ...seed });
    setMessage("무료 요약 명식을 불러왔습니다. 바로 전체 보고서를 생성할 수 있습니다.");
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
            서버에서 관리자 세션을 확인한 뒤에만 단품·3종·풀 패키지 <strong className="text-cream">유료 전체 보고서</strong>를
            생성합니다. 무료 요약 실행은 필요하지 않으며, 고객 정보는 서버에 저장하지 않습니다.
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
          <div className="rounded-2xl border border-white/10 bg-night/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs tracking-[0.18em] text-gold">보고서용 명식 (무료 요약 불필요)</p>
              {seed ? (
                <button
                  type="button"
                  onClick={applySeedFromFreeReading}
                  className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold"
                >
                  무료 요약 명식 불러오기
                </button>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs text-mist">
                성
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.surname}
                  onChange={(e) => patchDraft({ surname: e.target.value })}
                />
              </label>
              <label className="text-xs text-mist">
                이름
                <input
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.given}
                  onChange={(e) => patchDraft({ given: e.target.value })}
                />
              </label>
              <label className="text-xs text-mist">
                성별
                <select
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.gender}
                  onChange={(e) => patchDraft({ gender: e.target.value })}
                >
                  <option value="">선택</option>
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                </select>
              </label>
              <label className="text-xs text-mist">
                력
                <select
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.calendar}
                  onChange={(e) => patchDraft({ calendar: e.target.value })}
                >
                  <option value="solar">양력</option>
                  <option value="lunar">음력</option>
                </select>
              </label>
              <label className="text-xs text-mist">
                연
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.year}
                  onChange={(e) => patchDraft({ year: e.target.value })}
                />
              </label>
              <label className="text-xs text-mist">
                월
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.month}
                  onChange={(e) => patchDraft({ month: e.target.value })}
                />
              </label>
              <label className="text-xs text-mist">
                일
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.day}
                  onChange={(e) => patchDraft({ day: e.target.value })}
                />
              </label>
              <label className="flex items-end gap-2 text-xs text-mist pb-2">
                <input
                  type="checkbox"
                  checked={Boolean(draft.unknownTime)}
                  onChange={(e) => patchDraft({ unknownTime: e.target.checked, hour: "", minute: "" })}
                />
                출생 시각 모름
              </label>
              {!draft.unknownTime ? (
                <>
                  <label className="text-xs text-mist">
                    시
                    <input
                      type="number"
                      min={0}
                      max={23}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                      value={draft.hour}
                      onChange={(e) => patchDraft({ hour: e.target.value })}
                    />
                  </label>
                  <label className="text-xs text-mist">
                    분
                    <input
                      type="number"
                      min={0}
                      max={59}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                      value={draft.minute}
                      onChange={(e) => patchDraft({ minute: e.target.value })}
                    />
                  </label>
                </>
              ) : null}
              <label className="flex items-end gap-2 text-xs text-mist pb-2">
                <input
                  type="checkbox"
                  checked={Boolean(draft.yaja)}
                  onChange={(e) => patchDraft({ yaja: e.target.checked })}
                />
                야자시 적용
              </label>
              <label className="text-xs text-mist">
                혼인
                <select
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.status}
                  onChange={(e) => patchDraft({ status: e.target.value })}
                >
                  <option value="single">미혼</option>
                  <option value="married">기혼</option>
                </select>
              </label>
              <label className="text-xs text-mist">
                역할
                <select
                  className="mt-1 w-full rounded-xl border border-white/15 bg-night px-3 py-2 text-sm text-cream"
                  value={draft.role}
                  onChange={(e) => patchDraft({ role: e.target.value })}
                >
                  <option value="employee">직장인</option>
                  <option value="owner">사업가</option>
                  <option value="seeker">취업준비생</option>
                </select>
              </label>
            </div>
          </div>

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
          <p className="text-xs text-mist/80">최대 {maxTopics}개 · 기존 사주 엔진·유료 PDF 디자인을 그대로 사용합니다.</p>

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
              disabled={busy || !authed || (!draftReady && !reportHtml)}
              onClick={() => generateReport({ asPdf: true })}
              className="touch-target rounded-full border border-gold/50 px-4 py-2 text-sm text-gold disabled:opacity-40"
            >
              인쇄·PDF 저장
            </button>
          </div>
          {draftReady ? (
            <p className="text-sm text-cream">
              명식 준비됨 · {draft.surname}
              {draft.given} · {draft.calendar === "lunar" ? "음력" : "양력"} {draft.year}-{draft.month}-{draft.day}
              {draft.unknownTime ? " · 시 미상" : ` · ${draft.hour}:${String(draft.minute || 0).padStart(2, "0")}`}
            </p>
          ) : (
            <p className="text-sm text-mist">성·이름·생년월일·성별을 입력하면 생성 버튼이 활성화됩니다.</p>
          )}
        </div>
      ) : null}

      {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}

      {reportHtml ? (
        <div id="admin-full-report" className="mt-5 scroll-mt-24 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-cream">
              {meta?.productLabel || "유료 보고서"} · {meta?.pages ?? "?"}쪽
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
