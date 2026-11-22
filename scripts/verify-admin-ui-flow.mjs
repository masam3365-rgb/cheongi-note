/**
 * Puppeteer로 관리자 UI 흐름 검증. 비밀값은 출력하지 않는다.
 */
import puppeteer from "puppeteer";
import { refreshAdminEnvFromDotenv } from "../server/loadLocalEnv.mjs";
import { resolveChromePath } from "./lib/sellerReportCore.mjs";

const BASE = process.env.ADMIN_TEST_BASE || "http://localhost:5173";

async function clickButton(page, text) {
  return page.evaluate((t) => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === t);
    if (!btn) return false;
    btn.click();
    return true;
  }, text);
}

async function fillLabeledInput(page, labelText, value) {
  return page.evaluate(
    (label, val) => {
      const labels = [...document.querySelectorAll("label")];
      for (const lab of labels) {
        if (!lab.textContent?.includes(label)) continue;
        const input = lab.querySelector("input, textarea");
        if (!input) continue;
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(input, String(val));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      }
      return false;
    },
    labelText,
    value,
  );
}

async function main() {
  refreshAdminEnvFromDotenv();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();
  if (!password) {
    console.log(JSON.stringify({ ok: false, error: "ADMIN_PASSWORD missing" }));
    process.exit(1);
  }

  const chrome = await resolveChromePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chrome || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const result = {
    ok: false,
    login: false,
    freeSummary: false,
    buttonEnabled: false,
    reportVisible: false,
    pagesText: null,
    printButton: false,
  };

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(60000);
    await page.goto(`${BASE}/#admin-panel`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForSelector("#admin-panel");

    await clickButton(page, "관리자 로그인");
    await page.waitForSelector('#admin-panel input[type="password"]');
    await page.focus('#admin-panel input[type="password"]');
    await page.keyboard.type(password, { delay: 5 });
    await clickButton(page, "로그인");
    await page.waitForFunction(() => document.body.innerText.includes("보고서 생성·열람"), { timeout: 15000 });
    result.login = true;

    await fillLabeledInput(page, "한글 성", "가");
    await fillLabeledInput(page, "한글 이름", "상을");
    await fillLabeledInput(page, "연", "1992");
    await fillLabeledInput(page, "월", "8");
    await fillLabeledInput(page, "일", "20");
    await fillLabeledInput(page, "시", "10");
    await fillLabeledInput(page, "분", "15");

    await page.evaluate(() => {
      const select = [...document.querySelectorAll("select")].find((el) =>
        [...el.options].some((o) => o.value === "female"),
      );
      if (!select) return;
      select.value = "female";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await clickButton(page, "미혼");
    await clickButton(page, "직장인");
    await clickButton(page, "내 흐름 무료 요약 보기");

    await page.waitForFunction(() => document.body.innerText.includes("명식 준비됨"), { timeout: 30000 });
    result.freeSummary = true;

    result.buttonEnabled = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes("보고서 생성·열람"));
      return Boolean(btn && !btn.disabled);
    });

    if (result.buttonEnabled) {
      await clickButton(page, "보고서 생성·열람");
      await page.waitForSelector("#admin-full-report iframe", { timeout: 90000 });
      const meta = await page.evaluate(() => {
        const root = document.querySelector("#admin-full-report");
        const text = root?.innerText || "";
        const print = [...document.querySelectorAll("#admin-full-report button, #admin-panel button")].some((b) =>
          b.textContent?.includes("인쇄·PDF 저장"),
        );
        const iframe = document.querySelector("#admin-full-report iframe");
        return {
          text,
          print,
          hasIframe: Boolean(iframe),
          srcDocLen: iframe?.srcdoc?.length || 0,
        };
      });
      result.reportVisible = meta.hasIframe && meta.srcDocLen > 1000;
      result.pagesText = (meta.text.match(/(\d+)\s*쪽/) || [])[1] || null;
      result.printButton = meta.print;
    }

    result.ok =
      result.login && result.freeSummary && result.buttonEnabled && result.reportVisible && result.printButton;
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exit(1);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
