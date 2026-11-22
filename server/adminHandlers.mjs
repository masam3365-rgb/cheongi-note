/**
 * /api/admin/* 핸들러 — Vercel·Vite 미들웨어 공통
 */
import {
  createSessionToken,
  readSessionFromRequest,
  sessionCookieHeader,
  verifyAdminPassword,
} from "./adminAuth.mjs";
import { buildPaidReport, renderReportPdfBuffer } from "./buildPaidReport.mjs";
import { refreshAdminEnvFromDotenv } from "./loadLocalEnv.mjs";
import { checkLoginRateLimit, clearLoginFailures, recordLoginFailure } from "./loginRateLimit.mjs";

/** Vite/Vercel에서는 브라우저 인쇄·PDF 저장이 기본. 서버 Puppeteer는 명시적 옵트인만 */
function serverPdfAllowed() {
  return process.env.DALBIT_ALLOW_SERVER_PDF === "1";
}

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [k, v] of Object.entries(extraHeaders)) {
    if (v != null) res.setHeader(k, v);
  }
  res.end(payload);
}

function sendBinary(res, status, buffer, contentType, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Length", String(buffer.length));
  for (const [k, v] of Object.entries(extraHeaders)) {
    if (v != null) res.setHeader(k, v);
  }
  res.end(buffer);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

function requireAdmin(req, res) {
  if (!readSessionFromRequest(req)) {
    sendJson(res, 401, { ok: false, error: "관리자 로그인이 필요합니다." });
    return false;
  }
  return true;
}

export async function handleAdminSession(req, res) {
  if (req.method !== "GET") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  refreshAdminEnvFromDotenv();
  const authenticated = readSessionFromRequest(req);
  sendJson(res, 200, { ok: true, authenticated });
}

export async function handleAdminLogin(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  try {
    refreshAdminEnvFromDotenv();
    const limited = checkLoginRateLimit(req);
    if (!limited.ok) {
      sendJson(
        res,
        429,
        {
          ok: false,
          error: `로그인 시도가 너무 많습니다. ${limited.retryAfterSec}초 후 다시 시도해 주세요.`,
        },
        { "Retry-After": String(limited.retryAfterSec) },
      );
      return;
    }
    const body = await readJsonBody(req);
    const password = body.password ?? body.adminPassword ?? "";
    if (!verifyAdminPassword(password)) {
      recordLoginFailure(req);
      sendJson(res, 401, { ok: false, error: "비밀번호가 올바르지 않습니다." });
      return;
    }
    clearLoginFailures(req);
    const token = createSessionToken();
    sendJson(
      res,
      200,
      { ok: true, authenticated: true },
      { "Set-Cookie": sessionCookieHeader(token) },
    );
  } catch (cause) {
    const status = cause?.status || 500;
    sendJson(res, status, { ok: false, error: cause instanceof Error ? cause.message : "로그인 실패" });
  }
}

export async function handleAdminLogout(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  sendJson(res, 200, { ok: true, authenticated: false }, { "Set-Cookie": sessionCookieHeader("", { clear: true }) });
}

export async function handleAdminReport(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }
  refreshAdminEnvFromDotenv();
  if (!requireAdmin(req, res)) return;

  try {
    const body = await readJsonBody(req);
    const wantPdf = body.format === "pdf" || body.pdf === true;
    const report = buildPaidReport({
      surname: body.surname,
      given: body.given,
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      minute: body.minute,
      unknownTime: body.unknownTime,
      yaja: body.yaja,
      gender: body.gender,
      calendar: body.calendar,
      status: body.status,
      role: body.role,
      product: body.product || "full",
      topicId: body.topicId,
      selected: body.selected,
    });

    // 고객 원문·보고서를 서버 디스크에 쓰지 않음
    // 기본: HTML만 반환 → 브라우저 인쇄/PDF 저장 (Vite 프로세스 보호)
    if (wantPdf && serverPdfAllowed()) {
      try {
        const pdf = await renderReportPdfBuffer(report.html);
        const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const filename = `dalbit-full-${stamp}.pdf`;
        sendBinary(res, 200, pdf, "application/pdf", {
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Report-Pages": String(report.pages),
          "X-Report-Pillars": report.pillars,
        });
        return;
      } catch (pdfErr) {
        sendJson(res, 200, {
          ok: true,
          pdfAvailable: false,
          pdfError: pdfErr instanceof Error ? pdfErr.message : "PDF 생성 실패",
          pages: report.pages,
          pillars: report.pillars,
          productLabel: report.productLabel,
          mode: report.mode,
          html: report.html,
          hint: "서버 PDF 엔진을 쓸 수 없습니다. HTML을 연 뒤 브라우저 인쇄(PDF 저장)를 사용해 주세요.",
        });
        return;
      }
    }

    if (wantPdf) {
      sendJson(res, 200, {
        ok: true,
        pdfAvailable: false,
        pages: report.pages,
        pillars: report.pillars,
        productLabel: report.productLabel,
        mode: report.mode,
        html: report.html,
        hint: "개발 서버에서는 브라우저 인쇄(PDF로 저장)를 사용합니다. 서버 Puppeteer PDF는 비활성입니다.",
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      pdfAvailable: null,
      pages: report.pages,
      pillars: report.pillars,
      productLabel: report.productLabel,
      mode: report.mode,
      html: report.html,
    });
  } catch (cause) {
    const status = cause?.status || (cause?.message?.includes("올바르지") ? 400 : 500);
    sendJson(res, status, {
      ok: false,
      error: cause instanceof Error ? cause.message : "보고서 생성 실패",
    });
  }
}

export async function routeAdminApi(req, res, pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/api/admin/session") return handleAdminSession(req, res);
  if (path === "/api/admin/login") return handleAdminLogin(req, res);
  if (path === "/api/admin/logout") return handleAdminLogout(req, res);
  if (path === "/api/admin/report") return handleAdminReport(req, res);
  sendJson(res, 404, { ok: false, error: "Not found" });
}
