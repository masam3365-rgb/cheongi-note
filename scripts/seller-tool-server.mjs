/**
 * 판매자 PC 전용 로컬 UI — 127.0.0.1 에만 바인딩 (외부 공개 금지)
 *
 *   node scripts/seller-tool-server.mjs
 *   → 브라우저에서 http://127.0.0.1:8787 만 접속
 */
import http from "node:http";
import { generateSellerReport, listSellerOrders, purgeSellerOrder, SELLER_OUT_ROOT } from "./lib/sellerReportCore.mjs";

const HOST = "127.0.0.1";
const PORT = Number(process.env.SELLER_TOOL_PORT || 8787);

function htmlPage(notice = "") {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>달빛 사주관 · 판매자 로컬 도구</title>
  <style>
    :root { color-scheme: dark; font-family: "Malgun Gothic", sans-serif; }
    body { margin: 0; background: #0f1419; color: #f3efe6; }
    main { max-width: 720px; margin: 0 auto; padding: 28px 18px 48px; }
    h1 { font-size: 1.45rem; color: #e6cb8c; }
    .warn { border: 1px solid #e6cb8c55; background: #e6cb8c12; padding: 12px 14px; border-radius: 12px; font-size: 0.92rem; line-height: 1.5; }
    form { display: grid; gap: 12px; margin-top: 18px; }
    label { display: grid; gap: 6px; font-size: 0.88rem; color: #cfc6b4; }
    input, select, button { font: inherit; padding: 10px 12px; border-radius: 10px; border: 1px solid #e6cb8c44; background: #1a222c; color: #f3efe6; }
    button { cursor: pointer; background: #e6cb8c; color: #1a1408; font-weight: 700; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .notice { white-space: pre-wrap; margin-top: 16px; font-size: 0.9rem; color: #9ad0a8; }
    .muted { color: #9aa3ad; font-size: 0.82rem; }
    a { color: #e6cb8c; }
  </style>
</head>
<body>
  <main>
    <h1>달빛 사주관 · 판매자 로컬 보고서</h1>
    <p class="warn">
      이 화면은 <strong>판매자 컴퓨터(127.0.0.1)</strong>에서만 열립니다. 인터넷에 공개되지 않습니다.
      고객 정보는 외부 서버로 보내지 않으며, PDF는 이 PC의 <code>output/seller-orders/</code>에만 저장됩니다.
      크몽·당근에서 결제·주문을 확인한 뒤에만 사용하세요.
    </p>
    <form method="POST" action="/generate">
      <label>주문번호 (필수, 파일명에 사용 · 고객 이름 미포함)
        <input name="orderId" required placeholder="예: KMONG-20261122-01" />
      </label>
      <div class="row">
        <label>성
          <input name="surname" required placeholder="김" maxlength="5" />
        </label>
        <label>이름
          <input name="given" required placeholder="가상" maxlength="5" />
        </label>
      </div>
      <p class="muted">이름은 PDF 본문에만 필요 시 표시됩니다. 저장 파일명에는 넣지 않습니다.</p>
      <div class="row">
        <label>연
          <input name="year" type="number" required min="1900" max="2100" value="1990" />
        </label>
        <label>월
          <input name="month" type="number" required min="1" max="12" value="5" />
        </label>
      </div>
      <div class="row">
        <label>일
          <input name="day" type="number" required min="1" max="31" value="15" />
        </label>
        <label>달력
          <select name="calendar">
            <option value="solar">양력</option>
            <option value="lunar">음력</option>
          </select>
        </label>
      </div>
      <div class="row">
        <label>시 (0–23)
          <input name="hour" type="number" min="0" max="23" value="12" />
        </label>
        <label>분
          <input name="minute" type="number" min="0" max="59" value="0" />
        </label>
      </div>
      <label><input type="checkbox" name="unknownTime" value="1" /> 출생시간 모름 (정오 보정)</label>
      <div class="row">
        <label>성별
          <select name="gender">
            <option value="male">남</option>
            <option value="female">여</option>
          </select>
        </label>
        <label>상품
          <select name="product">
            <option value="full">풀 패키지</option>
            <option value="triple">3종 맞춤</option>
            <option value="single">단품(재물)</option>
          </select>
        </label>
      </div>
      <button type="submit">보고서 생성 · PDF 저장</button>
    </form>
    <form method="POST" action="/purge" style="margin-top:20px">
      <label>개인정보·파일 삭제 (주문번호)
        <input name="orderId" required placeholder="전달 완료한 주문번호" />
      </label>
      <button type="submit">이 주문 폴더 삭제</button>
    </form>
    <p class="muted" style="margin-top:14px">저장 위치: ${SELLER_OUT_ROOT.replace(/\\/g, "/")}</p>
    ${notice ? `<pre class="notice">${notice}</pre>` : ""}
    <p class="muted"><a href="/orders">로컬 주문 목록 JSON</a></p>
  </main>
</body>
</html>`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      const params = new URLSearchParams(raw);
      const obj = Object.fromEntries(params.entries());
      resolve(obj);
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlPage());
      return;
    }

    if (req.method === "GET" && url.pathname === "/orders") {
      const orders = await listSellerOrders();
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ host: HOST, outRoot: SELLER_OUT_ROOT, orders }, null, 2));
      return;
    }

    if (req.method === "POST" && url.pathname === "/generate") {
      const body = await parseBody(req);
      const result = await generateSellerReport({
        orderId: body.orderId,
        surname: body.surname,
        given: body.given,
        year: body.year,
        month: body.month,
        day: body.day,
        hour: body.hour,
        minute: body.minute,
        unknownTime: body.unknownTime === "1" || body.unknownTime === "on",
        gender: body.gender,
        calendar: body.calendar,
        product: body.product || "full",
      });
      const notice = [
        "생성 완료 (외부 전송 없음)",
        `주문: ${result.orderId}`,
        `페이지(DOM): ${result.pages}`,
        `사주: ${result.pillars}`,
        `HTML: ${result.htmlPath}`,
        `PDF: ${result.pdfPath}`,
        "파일명에 고객 이름 없음. 전달 후 아래 삭제를 사용하세요.",
      ].join("\n");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlPage(notice));
      return;
    }

    if (req.method === "POST" && url.pathname === "/purge") {
      const body = await parseBody(req);
      const result = await purgeSellerOrder(body.orderId);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(htmlPage(`삭제 완료: ${result.deleted}`));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
    res.end(htmlPage(`오류: ${error?.message || error}`));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`판매자 로컬 도구: http://${HOST}:${PORT}/  (외부 바인딩 없음)`);
  console.log(`저장 폴더: ${SELLER_OUT_ROOT}`);
});
