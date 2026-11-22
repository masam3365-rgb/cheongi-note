/**
 * 로컬 .env 의 관리자 키를 process.env 에 즉시 반영 (값은 로그하지 않음)
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ADMIN_KEYS = new Set(["ADMIN_PASSWORD", "ADMIN_PASSWORD_HASH", "ADMIN_SESSION_SECRET"]);

function stripQuotes(value) {
  const v = String(value ?? "");
  if (
    (v.startsWith('"') && v.endsWith('"') && v.length >= 2) ||
    (v.startsWith("'") && v.endsWith("'") && v.length >= 2)
  ) {
    return v.slice(1, -1);
  }
  return v;
}

/** @returns {{ updated: string[], present: Record<string, boolean> }} */
export function refreshAdminEnvFromDotenv(root = process.cwd()) {
  const envPath = path.join(root, ".env");
  const present = {
    ADMIN_PASSWORD: false,
    ADMIN_PASSWORD_HASH: false,
    ADMIN_SESSION_SECRET: false,
  };
  const updated = [];
  if (!existsSync(envPath)) return { updated, present };

  const text = readFileSync(envPath, "utf8").replace(/^\uFEFF/, "");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!ADMIN_KEYS.has(key)) continue;
    const value = stripQuotes(trimmed.slice(eq + 1));
    process.env[key] = value;
    present[key] = value.length > 0;
    updated.push(key);
  }
  return { updated, present };
}
