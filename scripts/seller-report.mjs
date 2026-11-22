/**
 * 판매자 PC 전용 — 크몽·당근 주문 확인 후 심층 PDF 생성 (localhost/오프라인)
 *
 * 예:
 *   node scripts/seller-report.mjs --order=KMONG-1001 --name=가상갑 --year=1990 --month=5 --day=15 --hour=14 --minute=30 --gender=male --calendar=solar --product=full
 *   node scripts/seller-report.mjs --order=DANG-2002 --surname=이 --given=가상을 --year=1988 --month=3 --day=8 --unknown-time --gender=female --calendar=lunar --product=full
 *
 * 삭제:
 *   node scripts/seller-purge.mjs --order=KMONG-1001
 */
import {
  generateSellerReport,
  listSellerOrders,
  SELLER_OUT_ROOT,
} from "./lib/sellerReportCore.mjs";

function arg(name, fallback = "") {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function splitName(full) {
  const n = String(full || "").trim().replace(/\s+/g, "");
  if (!n) return { surname: "", given: "" };
  if (n.length === 1) return { surname: n, given: "고객" };
  return { surname: n.slice(0, 1), given: n.slice(1) };
}

async function main() {
  if (hasFlag("list")) {
    const orders = await listSellerOrders();
    console.log(JSON.stringify({ outRoot: SELLER_OUT_ROOT, orders }, null, 2));
    return;
  }

  const order = arg("order") || arg("orderId");
  if (!order) {
    console.error(
      [
        "필수: --order=주문번호",
        "예: node scripts/seller-report.mjs --order=KMONG-1001 --name=김가상 --year=1990 --month=5 --day=15 --hour=12 --minute=0 --gender=male --calendar=solar --product=full",
        "옵션: --surname --given (--name 대신), --unknown-time, --yaja, --status=single|married, --role=employee|owner, --html-only, --topic=wealth",
      ].join("\n"),
    );
    process.exit(1);
  }

  const nameParts = splitName(arg("name"));
  const surname = arg("surname") || nameParts.surname || "고";
  const given = arg("given") || nameParts.given || "객";

  const result = await generateSellerReport(
    {
      orderId: order,
      surname,
      given,
      year: arg("year"),
      month: arg("month"),
      day: arg("day"),
      hour: arg("hour", "12"),
      minute: arg("minute", "0"),
      unknownTime: hasFlag("unknown-time"),
      yaja: hasFlag("yaja"),
      gender: arg("gender", "male"),
      calendar: arg("calendar", "solar"),
      status: arg("status", "single"),
      role: arg("role", "employee"),
      product: arg("product", "full"),
      topicId: arg("topic", "wealth"),
    },
    { htmlOnly: hasFlag("html-only") },
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        orderId: result.orderId,
        pages: result.pages,
        pillars: result.pillars,
        displayNameInBodyOnly: result.displayName,
        outDir: result.outDir,
        htmlPath: result.htmlPath,
        pdfPath: result.pdfPath,
        note: "파일명에 고객 이름 없음. 외부 서버 전송 없음. 전달 후 npm run seller:purge -- --order=... 로 삭제.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
