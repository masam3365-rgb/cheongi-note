/**
 * PDF 경로가 개발 서버를 죽이지 않는지 검증 (비밀값 미출력)
 */
import { refreshAdminEnvFromDotenv } from "../server/loadLocalEnv.mjs";

const BASE = process.env.ADMIN_TEST_BASE || "http://localhost:5173";

function cookieFrom(res) {
  const list = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (list?.length) return list.map((c) => c.split(";")[0]).join("; ");
  const one = res.headers.get("set-cookie");
  return one ? one.split(";")[0] : "";
}

async function ping() {
  try {
    const res = await fetch(`${BASE}/`);
    return res.status;
  } catch {
    return -1;
  }
}

async function main() {
  refreshAdminEnvFromDotenv();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();
  const before = await ping();
  if (before !== 200) {
    console.log(JSON.stringify({ ok: false, step: "ping_before", before }));
    process.exit(1);
  }

  const login = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const cookie = cookieFrom(login);
  if (!login.ok || !cookie) {
    console.log(JSON.stringify({ ok: false, step: "login", status: login.status }));
    process.exit(1);
  }

  const virtual = {
    surname: "가",
    given: "상병",
    year: 1988,
    month: 3,
    day: 12,
    hour: 9,
    minute: 30,
    gender: "male",
    calendar: "solar",
    yaja: true,
    status: "married",
    role: "employee",
    product: "full",
  };

  const htmlRes = await fetch(`${BASE}/api/admin/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...virtual, format: "html" }),
  });
  const htmlBody = await htmlRes.json();
  const afterHtml = await ping();

  // format=pdf 를 보내도 서버 Puppeteer를 돌리지 않고 HTML 폴백이어야 함
  const pdfRes = await fetch(`${BASE}/api/admin/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ ...virtual, format: "pdf" }),
  });
  const pdfCt = pdfRes.headers.get("content-type") || "";
  const pdfBody = pdfCt.includes("application/pdf")
    ? { ok: false, unexpectedBinary: true }
    : await pdfRes.json();
  const afterPdf = await ping();

  // 연속 요청 3회
  for (let i = 0; i < 3; i += 1) {
    await fetch(`${BASE}/api/admin/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ ...virtual, format: "html" }),
    });
  }
  const afterBurst = await ping();

  const ok =
    before === 200 &&
    afterHtml === 200 &&
    afterPdf === 200 &&
    afterBurst === 200 &&
    htmlBody.ok &&
    Number(htmlBody.pages) > 20 &&
    pdfBody.ok &&
    pdfBody.pdfAvailable === false &&
    typeof pdfBody.html === "string" &&
    !pdfCt.includes("application/pdf");

  console.log(
    JSON.stringify(
      {
        ok,
        serverBefore: before,
        serverAfterHtml: afterHtml,
        serverAfterPdfRequest: afterPdf,
        serverAfterBurst: afterBurst,
        htmlPages: htmlBody.pages,
        pdfFallbackHtml: Boolean(pdfBody.html),
        pdfAvailable: pdfBody.pdfAvailable,
        noBinaryPdf: !pdfCt.includes("application/pdf"),
      },
      null,
      2,
    ),
  );
  if (!ok) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
