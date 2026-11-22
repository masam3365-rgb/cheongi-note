/**
 * 관리자 API 로컬 보안·기능 스모크 (Vite dev 서버가 떠 있어야 함)
 *   npm run dev   (다른 터미널)
 *   npm run test:admin-api
 */
import { refreshAdminEnvFromDotenv } from "../server/loadLocalEnv.mjs";

refreshAdminEnvFromDotenv();

const BASE = process.env.ADMIN_TEST_BASE || "http://localhost:5173";
const PASSWORD = process.env.ADMIN_PASSWORD || "";

function parseSetCookie(res) {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (raw?.length) return raw.map((c) => c.split(";")[0]).join("; ");
  const single = res.headers.get("set-cookie");
  return single ? single.split(";")[0] : "";
}

async function main() {
  if (!PASSWORD) {
    console.error("ADMIN_PASSWORD 환경변수가 필요합니다 (.env 로드 후 실행).");
    process.exit(1);
  }

  const results = [];

  // 1) 비로그인 보고서 → 401
  {
    const res = await fetch(`${BASE}/api/admin/report`, {
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
        gender: "male",
        calendar: "solar",
        product: "full",
      }),
    });
    const body = await res.json();
    results.push({
      name: "report_without_auth",
      pass: res.status === 401 && body.ok === false,
      status: res.status,
    });
  }

  // 2) 잘못된 비밀번호 → 401
  {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "definitely-wrong-password" }),
    });
    results.push({ name: "login_wrong_password", pass: res.status === 401, status: res.status });
  }

  // 3) 올바른 로그인 → 쿠키
  let cookie = "";
  {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: PASSWORD }),
    });
    const body = await res.json();
    cookie = parseSetCookie(res);
    results.push({
      name: "login_ok",
      pass: res.status === 200 && body.authenticated === true && cookie.includes("dalbit_admin_session"),
      status: res.status,
      cookie: Boolean(cookie),
    });
  }

  // 4) 세션 확인
  {
    const res = await fetch(`${BASE}/api/admin/session`, { headers: { Cookie: cookie } });
    const body = await res.json();
    results.push({ name: "session_ok", pass: body.authenticated === true, status: res.status });
  }

  // 5) 인증 후 풀 패키지 HTML
  {
    const res = await fetch(`${BASE}/api/admin/report`, {
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
        gender: "male",
        calendar: "solar",
        yaja: true,
        status: "single",
        role: "employee",
        product: "full",
      }),
    });
    const body = await res.json();
    const hasPages = Number(body.pages) > 20;
    const hasHtml = typeof body.html === "string" && body.html.includes("page");
    results.push({
      name: "report_with_auth",
      pass: res.status === 200 && body.ok && hasPages && hasHtml,
      status: res.status,
      pages: body.pages,
      pillars: body.pillars,
    });
  }

  // 6) 로그아웃도 위조 쿠키 → 401
  {
    const res = await fetch(`${BASE}/api/admin/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "dalbit_admin_session=forged.payload",
      },
      body: JSON.stringify({
        surname: "가",
        given: "상",
        year: 1990,
        month: 1,
        day: 1,
        gender: "male",
        calendar: "solar",
        product: "full",
      }),
    });
    results.push({ name: "forged_cookie", pass: res.status === 401, status: res.status });
  }

  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({ base: BASE, results, failed: failed.length }, null, 2));
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
