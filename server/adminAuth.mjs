/**
 * 관리자 세션 — 비밀번호·시크릿은 환경변수만 사용 (소스/저장소에 두지 않음)
 */
import { createHmac, timingSafeEqual, randomBytes, scryptSync } from "node:crypto";

export const COOKIE_NAME = "dalbit_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function requireEnv(name) {
  const value = String(process.env[name] || "").trim();
  if (!value) {
    const err = new Error(`${name} 환경변수가 없습니다. .env 또는 호스팅 환경에 설정해 주세요.`);
    err.status = 503;
    throw err;
  }
  return value;
}

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(str) {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(payloadB64, secret) {
  return b64url(createHmac("sha256", secret).update(payloadB64).digest());
}

function safeEqualStr(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return timingSafeEqual(aa, bb);
}

/** 평문 비밀번호 비교 (ADMIN_PASSWORD) 또는 scrypt 해시 (ADMIN_PASSWORD_HASH = salt:hash hex) */
export function verifyAdminPassword(password) {
  const submitted = String(password ?? "").trim();
  const plain = String(process.env.ADMIN_PASSWORD || "").trim();
  const hashSpec = String(process.env.ADMIN_PASSWORD_HASH || "").trim();
  if (!plain && !hashSpec) {
    const err = new Error("ADMIN_PASSWORD 또는 ADMIN_PASSWORD_HASH 환경변수가 필요합니다.");
    err.status = 503;
    throw err;
  }
  if (hashSpec) {
    const [saltHex, hashHex] = hashSpec.split(":");
    if (!saltHex || !hashHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(submitted, salt, expected.length);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
  return safeEqualStr(submitted, plain);
}

export function createSessionToken() {
  const secret = requireEnv("ADMIN_SESSION_SECRET");
  const payload = b64url(
    JSON.stringify({
      v: 1,
      exp: Date.now() + SESSION_TTL_MS,
      n: randomBytes(8).toString("hex"),
    }),
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  let secret;
  try {
    secret = requireEnv("ADMIN_SESSION_SECRET");
  } catch {
    return false;
  }
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload, secret);
  if (!safeEqualStr(sig, expected)) return false;
  try {
    const data = JSON.parse(fromB64url(payload).toString("utf8"));
    if (!data?.exp || Date.now() > Number(data.exp)) return false;
    return true;
  } catch {
    return false;
  }
}

export function parseCookies(header) {
  const out = {};
  String(header || "")
    .split(";")
    .forEach((part) => {
      const idx = part.indexOf("=");
      if (idx < 0) return;
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key) out[key] = decodeURIComponent(val);
    });
  return out;
}

export function readSessionFromRequest(req) {
  const cookies = parseCookies(req.headers?.cookie || req.headers?.Cookie);
  return verifySessionToken(cookies[COOKIE_NAME]);
}

export function sessionCookieHeader(token, { clear = false } = {}) {
  const secure = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  if (clear) {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? "; Secure" : ""}`;
  }
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${
    secure ? "; Secure" : ""
  }`;
}

/** 로컬 테스트용 해시 생성 헬퍼 */
export function hashPasswordForEnv(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(String(password), salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}
