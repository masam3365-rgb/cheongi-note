/**
 * 논리 .page마다 단독 A4 PDF를 만든 뒤 병합.
 * 살짝 넘치는 장은 여백 압축 → 그래도 넘치면 DOM 자식 단위로 균등 분할해
 * 얇은 오버플로 꼬리(하단 50%+ 공백)를 막는다. 본문·글자 크기(12.5pt)는 유지.
 */
import { PDFDocument } from "pdf-lib";

function extractStyle(html) {
  const m = String(html || "").match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : "";
}

function pageChunksOf(html) {
  return String(html || "")
    .split(/(?=<div class="page)/)
    .filter((c) => /class="page/.test(c));
}

function withLastPage(chunk) {
  return String(chunk).replace(/class="page([^"]+)"/, (m, cls) =>
    /\blast-page\b/.test(cls) ? m : `class="page${cls} last-page"`,
  );
}

const A4_CONTENT_PX = (253 * 96) / 25.4;

const COMPACT_CSS = `
  .page, .dense, .card p, .evidence p, .solid-card p, p {
    font-size: 12.5pt !important;
  }
  .card { padding: 7px 9px !important; margin-bottom: 5px !important; }
  .card p, .evidence p, .solid-card p { margin: 0 0 0.35em !important; }
  .section-head { margin: 0 0 5px !important; }
  h2 { margin: 0 0 5px !important; }
  .evidence { padding: 7px 9px !important; margin-bottom: 5px !important; }
  .visual-slot { margin: 3px 0 5px !important; padding: 3px 5px 1px !important; }
  .visual-slot svg { max-height: 130px !important; }
  .ornament { max-height: 44px !important; margin: 6px auto 3px !important; }
  .month-pack .card { margin-bottom: 4px !important; padding: 6px 8px !important; }
  hr.rule { margin: 5px 0 !important; }
`;

/**
 * @param {import('puppeteer').Page} probe
 * @param {Buffer|Uint8Array} pdfBuf
 */
async function usablePageIndices(probe, pdfBuf) {
  const b64 = Buffer.from(pdfBuf).toString("base64");
  return probe.evaluate(async (data) => {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    // eslint-disable-next-line no-undef
    const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
    const out = [];
    for (let n = 1; n <= doc.numPages; n += 1) {
      const pg = await doc.getPage(n);
      const tc = await pg.getTextContent();
      let text = tc.items.map((it) => it.str).join("");
      text = text.replace(/\s+/g, "");
      text = text
        .replace(/천기노트\|.*?맞춤리포트/g, "")
        .replace(/천기노트—참고용안내자료/g, "")
        .replace(/천기노트.*?참고용안내자료/g, "");
      const chartish = /(지수|그래프|월별|대운|오행|원국|십신|운성|신살)/.test(text);
      if (text.length >= 60 || (chartish && text.length >= 16)) out.push(n - 1);
    }
    return out.length ? out : [0];
  }, b64);
}

function wrapPageDoc(style, running, pageInnerHtml) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/><style>${style}</style></head><body><main class="sheet-root">${pageInnerHtml}</main>${running}</body></html>`;
}

/**
 * 오버플로 시 .dense 자식을 A4 한도 안에 균등 분할한 HTML 조각 배열 반환.
 * @param {import('puppeteer').Page} page
 * @returns {Promise<string[]|null>}
 */
async function planBalancedDenseSplits(page) {
  return page.evaluate((limit) => {
    const pageEl = document.querySelector(".page");
    const dense = document.querySelector(".page .dense");
    if (!pageEl || !dense) return null;
    const fit = limit * 0.96;
    // 큰 단일 블록은 손자 단위로 펼쳐 균등 분할 (2자식→얇은 꼬리 방지)
    const units = [];
    for (const kid of dense.children) {
      const kh = kid.getBoundingClientRect().height;
      const sub = [...kid.children].filter((c) => {
        const tag = c.tagName;
        return tag === "DIV" || tag === "P" || tag === "TABLE" || tag === "UL" || tag === "SECTION" || tag === "H2" || tag === "H3";
      });
      if (kh > fit * 0.52 && sub.length >= 2) {
        for (const s of sub) units.push(s);
      } else {
        units.push(kid);
      }
    }
    if (units.length < 2) return null;

    const heights = units.map((el) => el.getBoundingClientRect().height);
    const total = heights.reduce((a, b) => a + b, 0);
    if (total <= limit * 1.02) return null;

    const htmls = units.map((el) => el.outerHTML);

    /** 탐욕 패킹: 인덱스 구간으로 관리해 높이 재계산 가능 */
    const packs = [];
    let start = 0;
    let h = 0;
    for (let i = 0; i < htmls.length; i += 1) {
      const kh = heights[i];
      if (i > start && h + kh > fit) {
        packs.push({ start, end: i, h });
        start = i;
        h = 0;
      }
      h += kh;
    }
    packs.push({ start, end: htmls.length, h });

    // 마지막 묶음이 얇으면 직전에서 자식을 넘겨 균형
    if (packs.length >= 2) {
      for (let guard = 0; guard < 16; guard += 1) {
        const last = packs[packs.length - 1];
        const prev = packs[packs.length - 2];
        const lastCount = last.end - last.start;
        const prevCount = prev.end - prev.start;
        if (last.h >= fit * 0.48 || prevCount <= 1) break;
        const moveIdx = prev.end - 1;
        const moveH = heights[moveIdx];
        if (last.h + moveH > fit * 1.02 && lastCount >= 1 && last.h >= fit * 0.32) break;
        prev.end = moveIdx;
        prev.h -= moveH;
        last.start = moveIdx;
        last.h += moveH;
      }
      // 그래도 마지막이 40% 미만이면 직전에 흡수(여백 압축으로 1장 수납)
      const last = packs[packs.length - 1];
      const prev = packs[packs.length - 2];
      if (last && prev && last.h < fit * 0.4) {
        prev.end = last.end;
        prev.h += last.h;
        packs.pop();
      }
    }

    // 얇은 꼬리 흡수로 1묶음만 남으면 그 1장을 강한 압축으로 재인쇄
    if (packs.length < 1) return null;

    const cls = pageEl.getAttribute("class") || "page";
    const header = pageEl.querySelector(".report-header");
    const footer = pageEl.querySelector(".footer");
    const headerHtml = header ? header.outerHTML : "";
    const footerHtml = footer ? footer.outerHTML : "";

    return packs.map((p, idx) => {
      const pageCls = idx === packs.length - 1 ? `${cls} last-page` : cls.replace(/\blast-page\b/g, "").trim();
      const body = htmls.slice(p.start, p.end).join("");
      return `<div class="${pageCls}">${headerHtml}<div class="dense">${body}</div>${footerHtml}</div>`;
    });
  }, A4_CONTENT_PX);
}

async function pdfOne(page) {
  return page.pdf({
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
}

/**
 * @param {import('puppeteer').Browser} browser
 * @param {string} fullHtml
 * @param {{ runningFooter?: string }} [opts]
 * @returns {Promise<Uint8Array>}
 */
export async function htmlPagesToMergedPdf(browser, fullHtml, opts = {}) {
  const style = extractStyle(fullHtml);
  const chunks = pageChunksOf(fullHtml);
  if (!chunks.length) throw new Error("no .page chunks");
  const running =
    opts.runningFooter ||
    `<div class="print-running-footer">천기노트 — 참고용 안내 자료</div>`;

  const merged = await PDFDocument.create();
  const page = await browser.newPage();
  const probe = await browser.newPage();
  try {
    await probe.goto("about:blank");
    await probe.addScriptTag({
      url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    });
    await probe.evaluate(() => {
      // eslint-disable-next-line no-undef
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    });

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = withLastPage(chunks[i]);
      const isCover = /cover-page/.test(chunk);
      const isToc = /toc-page|目次/.test(chunk);

      await page.setContent(wrapPageDoc(style, running, chunk), {
        waitUntil: "domcontentloaded",
        timeout: 180000,
      });
      await page.emulateMediaType("print");

      let mildOverflow = false;
      if (!isCover) {
        const ratio = await page.evaluate((limit) => {
          const el = document.querySelector(".page .dense") || document.querySelector(".page");
          if (!el) return 1;
          return el.getBoundingClientRect().height / limit;
        }, A4_CONTENT_PX);
        mildOverflow = ratio > 1.01 && ratio <= 1.35;
        if (ratio > 1.01 && ratio < 1.7) {
          await page.addStyleTag({ content: COMPACT_CSS });
        }
        // 轻度 오버플로는 여백·행간 + 필요 시 zoom으로 1장 수납(글자 12.5pt 유지)
        if (mildOverflow) {
          const z = Math.max(0.9, 0.985 / ratio);
          await page.addStyleTag({
            content: `
              .page, .dense, .card p, .evidence p, p { font-size: 12.5pt !important; }
              .card { padding: 5px 7px !important; margin-bottom: 3px !important; }
              .card p, .evidence p, p { margin: 0 0 0.2em !important; line-height: 1.48 !important; }
              .visual-slot svg { max-height: 100px !important; }
              .ornament { max-height: 32px !important; }
              .section-head { margin: 0 0 4px !important; }
              .page { zoom: ${z.toFixed(4)}; }
            `,
          });
        }
      }

      let buf = await pdfOne(page);
      let part = await PDFDocument.load(buf);
      let indices = part.getPageIndices();

      if (!isCover && indices.length > 1) {
        await page.addStyleTag({
          content: `${COMPACT_CSS}
            .card { padding: 4px 6px !important; margin-bottom: 2px !important; }
            .card p, .evidence p { margin: 0 0 0.18em !important; }
            p { margin: 0 0 0.18em !important; line-height: 1.46 !important; }
            .job-block { padding: 4px 6px !important; margin: 0 0 3px !important; }
            .visual-slot svg { max-height: 96px !important; }
            .ornament { max-height: 30px !important; }
          `,
        });
        buf = await pdfOne(page);
        part = await PDFDocument.load(buf);
        indices = part.getPageIndices();
      }

      if (!isCover && indices.length > 1) {
        await page.addStyleTag({
          content: `
            .page, .dense, .card p, .evidence p, p { font-size: 12.5pt !important; }
            .visual-slot { margin: 2px 0 3px !important; padding: 2px 4px 0 !important; }
            .visual-slot svg { max-height: 80px !important; }
            .ornament { max-height: 24px !important; margin: 3px auto 2px !important; }
            .section-head { margin: 0 0 3px !important; }
            hr.rule { margin: 3px 0 !important; }
            .gloss-table th, .gloss-table td { padding: 4px 5px !important; }
          `,
        });
        buf = await pdfOne(page);
        part = await PDFDocument.load(buf);
        indices = part.getPageIndices();
      }

      // 여전히 2쪽+ → DOM 균등 분할(또는 얇은 꼬리 흡수 후 1장 재압축)
      if (!isCover && !isToc && indices.length > 1) {
        const splits = await planBalancedDenseSplits(page);
        if (splits && splits.length >= 1) {
          for (const piece of splits) {
            await page.setContent(wrapPageDoc(style, running, withLastPage(piece)), {
              waitUntil: "domcontentloaded",
              timeout: 180000,
            });
            await page.emulateMediaType("print");
            const ratio = await page.evaluate((limit) => {
              const el = document.querySelector(".page .dense") || document.querySelector(".page");
              if (!el) return 1;
              return el.getBoundingClientRect().height / limit;
            }, A4_CONTENT_PX);
            if (ratio > 1.0) {
              await page.addStyleTag({
                content: `${COMPACT_CSS}
                  .card { padding: 4px 6px !important; margin-bottom: 2px !important; }
                  .card p, .evidence p, p { margin: 0 0 0.16em !important; line-height: 1.45 !important; }
                  .visual-slot svg { max-height: 88px !important; }
                  .ornament { max-height: 26px !important; }
                  .gloss-table th, .gloss-table td { padding: 3px 4px !important; }
                `,
              });
            }
            let pieceBuf = await pdfOne(page);
            let piecePart = await PDFDocument.load(pieceBuf);
            let pieceIdx = piecePart.getPageIndices();
            if (pieceIdx.length > 1) {
              await page.addStyleTag({
                content: `
                  .page, .dense, .card p, p { font-size: 12.5pt !important; }
                  .card { padding: 3px 5px !important; margin-bottom: 2px !important; }
                  p { margin: 0 0 0.12em !important; line-height: 1.42 !important; }
                  .visual-slot svg { max-height: 72px !important; }
                `,
              });
              pieceBuf = await pdfOne(page);
              piecePart = await PDFDocument.load(pieceBuf);
              pieceIdx = piecePart.getPageIndices();
            }
            // 여전히 2쪽이면 Chrome zoom으로 레이아웃 축소(≤8%) — 본문·12.5pt 유지
            if (pieceIdx.length > 1) {
              const r2 = await page.evaluate((limit) => {
                const el = document.querySelector(".page .dense") || document.querySelector(".page");
                if (!el) return 1;
                return el.getBoundingClientRect().height / limit;
              }, A4_CONTENT_PX);
              if (r2 > 1.01 && r2 <= 1.45) {
                const z = Math.max(0.88, 0.975 / r2);
                await page.addStyleTag({
                  content: `
                    .page { zoom: ${z.toFixed(4)}; }
                    .page, .dense, .card p, p { font-size: 12.5pt !important; }
                  `,
                });
                pieceBuf = await pdfOne(page);
                piecePart = await PDFDocument.load(pieceBuf);
                pieceIdx = piecePart.getPageIndices();
              }
            }
            if (pieceIdx.length > 1) {
              pieceIdx = await usablePageIndices(probe, pieceBuf);
            }
            const copied = await merged.copyPages(piecePart, pieceIdx);
            copied.forEach((p) => merged.addPage(p));
          }
          continue;
        }
      }

      if (!isCover && !isToc && indices.length > 1) {
        const rMain = await page.evaluate((limit) => {
          const el = document.querySelector(".page .dense") || document.querySelector(".page");
          if (!el) return 1;
          return el.getBoundingClientRect().height / limit;
        }, A4_CONTENT_PX);
        if (rMain > 1.01 && rMain <= 1.45) {
          const z = Math.max(0.88, 0.975 / rMain);
          await page.addStyleTag({
            content: `
              .page { zoom: ${z.toFixed(4)}; }
              .page, .dense, .card p, p { font-size: 12.5pt !important; }
            `,
          });
          buf = await pdfOne(page);
          part = await PDFDocument.load(buf);
          indices = part.getPageIndices();
        }
      }

      if (isCover && indices.length > 1) {
        indices = [indices[0]];
      } else if (isToc && indices.length > 1) {
        indices = [indices[0]];
      } else if (indices.length > 1) {
        indices = await usablePageIndices(probe, buf);
        // 마지막 쪽이 아주 짧은 꼬리면 원본을 zoom 0.86으로 다시 1장 시도
        if (indices.length > 1) {
          const tailShort = await probe.evaluate(async (data, lastIdx) => {
            const raw = atob(data);
            const bytes = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
            // eslint-disable-next-line no-undef
            const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
            const pg = await doc.getPage(lastIdx + 1);
            const tc = await pg.getTextContent();
            let text = tc.items.map((it) => it.str).join("").replace(/\s+/g, "");
            text = text
              .replace(/천기노트\|.*?맞춤리포트/g, "")
              .replace(/천기노트—참고용안내자료/g, "")
              .replace(/천기노트.*?참고용안내자료/g, "");
            return text.length;
          }, Buffer.from(buf).toString("base64"), indices[indices.length - 1]);
          if (tailShort < 200) {
            await page.addStyleTag({
              content: `
                .page { zoom: 0.86; }
                .page, .dense, .card p, p { font-size: 12.5pt !important; }
              `,
            });
            buf = await pdfOne(page);
            part = await PDFDocument.load(buf);
            indices = part.getPageIndices();
            if (indices.length > 1) indices = await usablePageIndices(probe, buf);
          }
        }
      }
      const copied = await merged.copyPages(part, indices);
      copied.forEach((p) => merged.addPage(p));
    }
  } finally {
    await page.close();
    await probe.close();
  }
  return merged.save();
}
