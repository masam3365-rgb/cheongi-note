/**
 * 가상 명식 → 관리자 보고서 HTML 생성 검증 (비밀값·고객정보 미출력)
 */
import { refreshAdminEnvFromDotenv } from "../server/loadLocalEnv.mjs";

const BASE = process.env.ADMIN_TEST_BASE || "http://localhost:5173";

function cookieFrom(res) {
  const list = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (list?.length) return list.map((c) => c.split(";")[0]).join("; ");
  const one = res.headers.get("set-cookie");
  return one ? one.split(";")[0] : "";
}

async function main() {
  refreshAdminEnvFromDotenv();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!password) {
    console.log(JSON.stringify({ ok: false, error: "ADMIN_PASSWORD missing in .env" }));
    process.exit(1);
  }

  const login = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const loginBody = await login.json().catch(() => ({}));
  const cookie = cookieFrom(login);
  if (!login.ok || !loginBody.authenticated || !cookie) {
    console.log(JSON.stringify({ ok: false, step: "login", status: login.status }));
    process.exit(1);
  }

  const virtual = {
    surname: "가",
    given: "상을",
    year: 1992,
    month: 8,
    day: 20,
    hour: 10,
    minute: 15,
    gender: "female",
    calendar: "solar",
    yaja: true,
    status: "single",
    role: "employee",
    product: "full",
  };

  const report = await fetch(`${BASE}/api/admin/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(virtual),
  });
  const body = await report.json().catch(() => ({}));
  const htmlOk = typeof body.html === "string" && body.html.includes("class=\"page");
  const pagesOk = Number(body.pages) > 20;

  console.log(
    JSON.stringify(
      {
        ok: report.status === 200 && body.ok && htmlOk && pagesOk,
        login: true,
        reportStatus: report.status,
        pages: body.pages,
        pillars: body.pillars,
        productLabel: body.productLabel,
        htmlBytes: body.html ? Buffer.byteLength(body.html, "utf8") : 0,
        hasPrintCss: Boolean(body.html?.includes("@page") || body.html?.includes("page")),
      },
      null,
      2,
    ),
  );

  if (!(report.status === 200 && body.ok && htmlOk && pagesOk)) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
