/**
 * 로컬 Vite 관리자 API: 미인증 401, 로그인 후 full HTML, 무료 export와 분리
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readingToReportHtml } from "../src/lib/reportHtml.js";
import { createReading } from "../src/lib/reading.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const base = process.env.ADMIN_VERIFY_BASE || "http://127.0.0.1:5173";

function loadAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, "utf8");
  const line = text.split(/\r?\n/).find((l) => /^ADMIN_PASSWORD\s*=/.test(l));
  if (!line) return null;
  return line.replace(/^ADMIN_PASSWORD\s*=\s*/, "").replace(/^["']|["']$/g, "").trim();
}

function cookieFrom(res) {
  const raw = res.headers.getSetCookie?.() || [];
  if (raw.length) return raw.map((c) => c.split(";")[0]).join("; ");
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

async function main() {
  const password = loadAdminPassword();
  assert.ok(password, ".env ADMIN_PASSWORD 필요");

  // 1) 미인증 report → 401
  const unauth = await fetch(`${base}/api/admin/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      surname: "가",
      given: "상갑",
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      gender: "female",
      calendar: "solar",
      product: "full",
      format: "html",
    }),
  });
  assert.equal(unauth.status, 401, `unauth status ${unauth.status}`);

  // 2) 로그인
  const login = await fetch(`${base}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const loginBody = await login.json();
  assert.equal(login.status, 200, `login ${login.status} ${JSON.stringify(loginBody)}`);
  assert.equal(loginBody.ok, true);
  const cookie = cookieFrom(login);
  assert.ok(cookie.includes("dalbit_admin_session"), `cookie missing: ${cookie}`);

  // 3) 인증 후 full 보고서 (무료 요약 없이)
  const reportRes = await fetch(`${base}/api/admin/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      surname: "가",
      given: "상갑",
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      gender: "female",
      calendar: "solar",
      status: "single",
      role: "employee",
      yaja: true,
      product: "full",
      format: "html",
    }),
  });
  const report = await reportRes.json();
  assert.equal(reportRes.status, 200, `report ${reportRes.status} ${report.error || ""}`);
  assert.equal(report.ok, true);
  assert.ok(report.html && report.html.length > 50000, `html too short ${report.html?.length}`);
  assert.ok(report.pages >= 95 && report.pages <= 130, `pages ${report.pages}`);
  assert.ok(/풀/.test(report.productLabel || report.html), "full package label");
  assert.ok(/class="page[\s"]/.test(report.html), "page shells");
  assert.ok(/목차|표지/.test(report.html), "cover/toc");
  assert.ok(/10년|세운/.test(report.html), "ten year");
  assert.ok(/월별|월운/.test(report.html), "monthly");
  assert.ok(/평생|총운/.test(report.html), "lifetime");

  // 4) 고객 무료 HTML은 짧고 유료와 다름
  const freeReading = createReading({
    surname: "가",
    given: "상갑",
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    gender: "female",
    calendar: "solar",
    status: "single",
    role: "employee",
    yaja: true,
  });
  const freeHtml = readingToReportHtml(freeReading, { year: freeReading.yearFortune?.defaultYear });
  assert.ok(report.html.length > freeHtml.length, "paid html longer than free");
  assert.ok(!/천기노트 · 무료 요약/.test(report.html), "paid html not free summary title");

  console.log(
    JSON.stringify(
      {
        ok: true,
        unauthStatus: unauth.status,
        loginOk: true,
        paidPages: report.pages,
        paidHtmlBytes: report.html.length,
        freeHtmlBytes: freeHtml.length,
        productLabel: report.productLabel,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
