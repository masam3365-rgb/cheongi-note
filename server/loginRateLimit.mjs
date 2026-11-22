/**
 * 관리자 로그인 시도 제한 (인스턴스 메모리 — 서버리스에서도 기본 방어)
 * 비밀값·비밀번호는 저장하지 않음
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const buckets = new Map();

function clientKey(req) {
  const xf = String(req.headers?.["x-forwarded-for"] || req.headers?.["X-Forwarded-For"] || "")
    .split(",")[0]
    .trim();
  const ip = xf || req.socket?.remoteAddress || req.headers?.["x-real-ip"] || "unknown";
  return String(ip);
}

function prune(now) {
  for (const [key, row] of buckets) {
    if (row.resetAt <= now) buckets.delete(key);
  }
}

/** @returns {{ ok: true } | { ok: false, retryAfterSec: number }} */
export function checkLoginRateLimit(req) {
  const now = Date.now();
  prune(now);
  const key = clientKey(req);
  const row = buckets.get(key);
  if (!row || row.resetAt <= now) {
    buckets.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (row.count >= MAX_ATTEMPTS) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((row.resetAt - now) / 1000)) };
  }
  return { ok: true };
}

export function recordLoginFailure(req) {
  const now = Date.now();
  const key = clientKey(req);
  const row = buckets.get(key);
  if (!row || row.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  row.count += 1;
}

export function clearLoginFailures(req) {
  buckets.delete(clientKey(req));
}
