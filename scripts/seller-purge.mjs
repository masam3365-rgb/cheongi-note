/**
 * 판매자 로컬 주문 폴더 삭제 (개인정보·PDF 최소화)
 *
 *   node scripts/seller-purge.mjs --order=KMONG-1001
 *   node scripts/seller-purge.mjs --all   (seller-orders 전체)
 */
import { rm } from "node:fs/promises";
import { purgeSellerOrder, listSellerOrders, SELLER_OUT_ROOT } from "./lib/sellerReportCore.mjs";

function arg(name, fallback = "") {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

async function main() {
  if (hasFlag("all")) {
    await rm(SELLER_OUT_ROOT, { recursive: true, force: true });
    console.log(JSON.stringify({ ok: true, purgedRoot: SELLER_OUT_ROOT }, null, 2));
    return;
  }

  const order = arg("order") || arg("orderId");
  if (!order) {
    const orders = await listSellerOrders();
    console.error("필수: --order=주문번호  또는 --all");
    console.error("현재 로컬 주문 폴더:", orders.join(", ") || "(없음)");
    process.exit(1);
  }

  const result = await purgeSellerOrder(order);
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
