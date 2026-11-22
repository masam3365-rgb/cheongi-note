import { writeFileSync } from "fs";
import { createReading } from "../src/lib/reading.js";
import { generateProductReportHtml } from "../src/lib/productReportHtml.js";

const reading = createReading({
  surname: "김",
  given: "민수",
  surnameHanja: "金",
  givenHanja: "民洙",
  gender: "male",
  status: "single",
  role: "employee",
  calendar: "solar",
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
});

const html = generateProductReportHtml(reading, { mode: "full" });
writeFileSync("tmp-report-check.html", html, "utf8");

const pages = (html.match(/class="page/g) || []).length;
const doubles = html.match(/\([^)]{0,50}\([^)]{0,50}\)/g) || [];
const samples = {
  dayMaster: (html.match(/거대한 산[^<]{0,60}/) || [])[0],
  strength: (html.match(/스스로 중심을 잡고[^<]{0,80}/) || [])[0],
  pyeongwan: (html.match(/책임감과 돌파력[^<]{0,30}/) || [])[0],
  heesin: (html.match(/도움이 되는 기운[^<]{0,80}/) || [])[0],
  ziwei: (html.match(/별자리로 성격을 보조해 읽는 렌즈[^<]{0,40}/) || [])[0],
};

const awkward = [];
for (const t of ["지금은 신강", "지금은 신약", ">용신 ", "자미두수는", "기문둔갑으로"]) {
  if (html.includes(t)) awkward.push(t);
}

console.log(
  JSON.stringify(
    {
      pages,
      htmlKB: Math.round(html.length / 1024),
      doubleParen: doubles.length,
      doubleEx: doubles.slice(0, 5),
      samples,
      awkward,
      name: reading.displayName,
      day: `${reading.chart.dayMasterKo}${reading.chart.dayElement}`,
      strength: reading.chart.strength.label,
    },
    null,
    2,
  ),
);
