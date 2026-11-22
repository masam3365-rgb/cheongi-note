/**
 * .env 의 ADMIN_PASSWORD 로 로그인 API를 검증한다. 비밀값은 출력하지 않는다.
 */
import { refreshAdminEnvFromDotenv } from "../server/loadLocalEnv.mjs";
import { verifyAdminPassword } from "../server/adminAuth.mjs";

const BASE = process.env.ADMIN_TEST_BASE || "http://localhost:5173";

async function main() {
  const loaded = refreshAdminEnvFromDotenv();
  const fromFile = String(process.env.ADMIN_PASSWORD || "").trim();
  const localOk = fromFile.length > 0 && verifyAdminPassword(fromFile);

  let httpStatus = null;
  let httpOk = false;
  try {
    const res = await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: fromFile }),
    });
    httpStatus = res.status;
    const body = await res.json().catch(() => ({}));
    httpOk = res.status === 200 && body.authenticated === true;
  } catch (cause) {
    httpStatus = -1;
    httpOk = false;
    console.log(
      JSON.stringify({
        envKeysPresent: loaded.present,
        localVerify: localOk,
        httpReachable: false,
        error: cause instanceof Error ? cause.message : "fetch failed",
      }),
    );
    process.exit(1);
  }

  // 잘못된 비밀번호는 거부되는지
  const badRes = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: "__definitely_not_the_password__" }),
  });

  console.log(
    JSON.stringify(
      {
        envKeysPresent: loaded.present,
        passwordLength: fromFile.length,
        localVerifyMatchesEnv: localOk,
        httpLoginWithEnvPassword: httpOk,
        httpStatus,
        wrongPasswordRejected: badRes.status === 401,
      },
      null,
      2,
    ),
  );

  if (!localOk || !httpOk || badRes.status !== 401) process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
