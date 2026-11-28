/**
 * 관리자 UI: 무료 요약 없이 로그인 → 명식 입력 → 생성 버튼 활성 → 풀 보고서 HTML
 * 일반 고객(/): 관리자 패널 없음
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const base = process.env.ADMIN_VERIFY_BASE || "http://localhost:5173";

function loadAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return null;
  const text = readFileSync(envPath, "utf8");
  const line = text.split(/\r?\n/).find((l) => /^ADMIN_PASSWORD\s*=/.test(l));
  if (!line) return null;
  return line.replace(/^ADMIN_PASSWORD\s*=\s*/, "").replace(/^["']|["']$/g, "").trim();
}

async function clickButtonByText(page, rootSel, text) {
  const handle = await page.evaluateHandle(
    (root, needle) => {
      const scope = document.querySelector(root) || document;
      return [...scope.querySelectorAll("button")].find((b) => (b.textContent || "").includes(needle)) || null;
    },
    rootSel,
    text,
  );
  const el = handle.asElement();
  assert.ok(el, `button not found: ${text}`);
  await el.click();
}

async function main() {
  const password = loadAdminPassword();
  assert.ok(password, ".env ADMIN_PASSWORD 필요");

  const chrome = await resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();

    await page.goto(`${base}/`, { waitUntil: "networkidle0", timeout: 60000 });
    assert.equal(await page.$("#admin-panel"), null, "customer must not see admin panel");

    await page.goto(`${base}/#admin`, { waitUntil: "networkidle0", timeout: 60000 });
    await page.waitForSelector("#admin-panel", { timeout: 15000 });

    await clickButtonByText(page, "#admin-panel", "관리자 로그인");
    await page.waitForSelector('#admin-panel input[type="password"]', { timeout: 10000 });
    await page.type('#admin-panel input[type="password"]', password);
    await page.evaluate(() => {
      document.querySelector("#admin-panel form")?.requestSubmit();
    });
    await page.waitForFunction(
      () => (document.querySelector("#admin-panel")?.innerText || "").includes("보고서용 명식"),
      { timeout: 20000 },
    );

    const beforeReady = await page.evaluate(() => {
      const gen = [...document.querySelectorAll("#admin-panel button")].find((b) =>
        (b.textContent || "").includes("보고서 생성"),
      );
      return { exists: Boolean(gen), disabled: gen?.disabled ?? null };
    });
    assert.equal(beforeReady.exists, true);
    assert.equal(beforeReady.disabled, true, "generate should be disabled before draft");

    // 관리자 패널 내부 입력만 (첫 번째 성/이름/연… 은 메인 폼이므로 패널 스코프 필요)
    await page.evaluate(() => {
      const root = document.querySelector("#admin-panel");
      const byLabel = (starts) => {
        const lab = [...root.querySelectorAll("label")].find((l) =>
          (l.textContent || "").trim().startsWith(starts),
        );
        return lab?.querySelector("input, select") || null;
      };
      const set = (el, value) => {
        if (!el) return;
        const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, "value");
        desc?.set?.call(el, value);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      };
      set(byLabel("성"), "가");
      set(byLabel("이름"), "상갑");
      set(byLabel("연"), "1990");
      set(byLabel("월"), "5");
      set(byLabel("일"), "15");
      set(byLabel("시"), "14");
      set(byLabel("분"), "30");
      set(byLabel("성별"), "female");
    });

    await page.waitForFunction(
      () => {
        const gen = [...document.querySelectorAll("#admin-panel button")].find((b) =>
          (b.textContent || "").includes("보고서 생성"),
        );
        return gen && !gen.disabled;
      },
      { timeout: 10000 },
    );

    await clickButtonByText(page, "#admin-panel", "보고서 생성");
    await page.waitForSelector("#admin-full-report iframe", { timeout: 60000 });

    const meta = await page.evaluate(() => {
      const panel = document.querySelector("#admin-full-report");
      const text = panel?.innerText || "";
      const srcDoc = panel?.querySelector("iframe")?.getAttribute("srcdoc") || "";
      return {
        text,
        htmlLen: srcDoc.length,
        hasFreeTitle: /천기노트 · 무료 요약/.test(srcDoc),
        pagesMatch: text.match(/(\d+)쪽/),
      };
    });
    assert.ok(meta.htmlLen > 50000, `report html short ${meta.htmlLen}`);
    assert.equal(meta.hasFreeTitle, false, "must not be free summary");
    const pages = meta.pagesMatch ? Number(meta.pagesMatch[1]) : 0;
    assert.ok(pages >= 95 && pages <= 130, `pages ${pages}`);

    console.log(
      JSON.stringify(
        {
          ok: true,
          customerAdminHidden: true,
          draftEnabledGenerateWithoutFreeSummary: true,
          paidPages: pages,
          paidHtmlBytes: meta.htmlLen,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
    for (const name of ["_tmp_admin_pw.txt", "_tmp_pw_len.mjs"]) {
      const p = resolve(__dirname, name);
      if (existsSync(p)) unlinkSync(p);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
