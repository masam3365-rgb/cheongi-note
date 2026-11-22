import { useEffect, useState } from "react";
import AdminReportPanel from "./components/AdminReportPanel";
import ReadingBoard from "./components/ReadingBoard";
import ReadingForm from "./components/ReadingForm";
import { createReading } from "./lib/reading";

const SCHOOLS = [
  ["사주명리", "일간과 십신, 신강신약, 대운"],
  ["자미두수", "명궁과 재백·관록·부처궁"],
  ["주역", "매화역수의 본괘와 지괘"],
  ["육효", "동효와 세·응"],
  ["기문둔갑", "절기 국수와 시반 구궁"],
  ["육임", "월장과 삼전"],
  ["풍수지리", "생문·개문·사문의 배치"],
  ["성명학", "한글·한자 오격과 81수리"],
  ["토정비결", "음력 세수·월·일의 괘"],
];

const STORAGE_KEY = "dalbit-sajugwan-form";

/** 공개 고객 화면에는 관리자 UI를 두지 않음. 판매자만 #admin 으로 진입 */
function isAdminGateOpen() {
  if (typeof window === "undefined") return false;
  const hash = String(window.location.hash || "").toLowerCase();
  return hash === "#admin" || hash.startsWith("#admin-");
}

function purgeStoredForm() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

purgeStoredForm();

export default function App() {
  const [reading, setReading] = useState(null);
  const [lastForm, setLastForm] = useState(null);
  const [requestedTab, setRequestedTab] = useState("home");
  const [requestId, setRequestId] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [hint, setHint] = useState("");
  const [adminGate, setAdminGate] = useState(isAdminGateOpen);

  useEffect(() => {
    const sync = () => setAdminGate(isAdminGateOpen());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (!reading) return;
    // 관리자 패널이 열려 있으면 보고서 생성으로, 아니면 무료 요약 보드로 이동
    const adminTarget = adminGate ? document.getElementById("admin-panel") : null;
    const preferAdmin = Boolean(adminTarget?.querySelector('[aria-label="보고서 구성"]'));
    const target = preferAdmin ? adminTarget : document.getElementById("reading-sheet");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reading, adminGate]);

  function submit(form) {
    purgeStoredForm();
    setHint("");
    setLastForm(form);
    setRequestedTab("shop");
    setRequestId((value) => value + 1);
    setReading(createReading(form));
  }

  function updatePartner(partner) {
    if (!lastForm) throw new Error("본인 명식을 먼저 풀어 주세요.");
    const next = { ...lastForm, partner };
    setLastForm(next);
    setReading(createReading(next));
    setRequestedTab("shop");
    setRequestId((value) => value + 1);
  }

  function clearPrivacy() {
    purgeStoredForm();
    setReading(null);
    setLastForm(null);
    setRequestedTab("home");
    setFormKey((value) => value + 1);
    setHint("입력하신 사주 정보와 풀이 결과를 화면에서 모두 지웠습니다. 브라우저에도 남겨 두지 않습니다.");
    document.getElementById("reading")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openTab(event, tab, emptyHint) {
    event.preventDefault();
    if (!reading) {
      setHint(emptyHint);
      document.getElementById("reading")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setRequestedTab(tab);
    setRequestId((value) => value + 1);
    document.getElementById("reading-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openToday(event) {
    openTab(event, "today", "생년월일을 입력해 풀면 오늘의 운세가 열립니다. 입력 내용은 저장되지 않습니다.");
  }

  function openYear(event) {
    openTab(event, "year", "생년월일을 먼저 풀면, 원하는 연도의 세운과 월별 운세가 바로 열립니다.");
  }

  function openTen(event) {
    openTab(event, "ten", "생년월일을 먼저 풀면, 올해부터 앞으로 10년 세운이 열립니다.");
  }

  function openShop(event) {
    openTab(event, "shop", "생년월일을 먼저 풀면, 맞춤형 운세 선택과 요금제가 열립니다.");
  }

  function openCareerGuide(event) {
    openTab(event, "careerGuide", "생년월일을 먼저 풀면, 1·2순위 적성 직종과 개운 대조표가 열립니다.");
  }

  return (
    <div id="top" className="stars min-h-svh">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/80 backdrop-blur-md">
        <div className="safe-px mx-auto flex max-w-6xl min-w-0 items-center justify-between gap-3 py-3 sm:py-4">
          <a href="#top" className="min-w-0 shrink font-serif text-base tracking-wide text-cream sm:text-lg">
            천기노트
          </a>
          <div className="flex shrink-0 gap-2">
            <a
              href="#today"
              onClick={openToday}
              className="touch-target inline-flex items-center rounded-full border border-gold/40 px-3 py-2 text-xs text-gold sm:px-4 sm:text-sm"
            >
              오늘
            </a>
            <a
              href="#year-fortune"
              onClick={openYear}
              className="touch-target hidden items-center rounded-full border border-gold/40 px-4 py-2 text-sm text-gold sm:inline-flex"
            >
              연도·월별
            </a>
            <a
              href="#reading"
              className="touch-target inline-flex items-center rounded-full bg-gold px-3 py-2 text-xs font-medium text-night sm:px-4 sm:text-sm"
            >
              무료 요약
            </a>
          </div>
        </div>
      </header>
      <main className="page-shell mx-auto flex max-w-6xl min-w-0 flex-col gap-10 px-4 py-8 sm:gap-14 sm:px-5 sm:py-12">
        <section className="grid min-w-0 items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.32em] text-gold">CHEONGI NOTE</p>
            <h1 className="mt-4 break-words-tight font-serif text-[2rem] leading-tight text-cream sm:text-5xl lg:text-6xl">
              천기노트
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-mist sm:mt-6 sm:text-base sm:leading-8">
              생년월일과 현재 고민을 바탕으로 흐름과 선택지를 차분히 풀어보는 맞춤형 명리 노트
            </p>
            <ul className="mt-6 max-w-xl space-y-3 text-sm leading-7 text-cream/90">
              <li>
                <span className="text-gold">· 쉬운 생활 풀이</span> — 어려운 용어 대신 직장·관계·돈·생활 행동으로 이어지는
                현실적인 조언 제공
              </li>
              <li>
                <span className="text-gold">· 맞춤형 리포트</span> — 선택한 구성에 맞춘 상세 풀이와 PDF/인쇄용 리포트 제공
              </li>
              <li>
                <span className="text-gold">· 차분한 기록 형태</span> — 한 번에 훑어보기 쉬운 구성으로 내 흐름과 점검 포인트를
                정리
              </li>
            </ul>
            <a
              href="#reading"
              className="mt-7 inline-flex touch-target items-center rounded-full bg-gold px-6 py-3 text-sm font-medium text-night"
            >
              내 흐름 무료 요약 보기
            </a>
          </div>
          <div className="moon-drift relative mx-auto grid h-48 w-48 place-items-center sm:h-64 sm:w-64">
            <span className="absolute inset-6 rounded-full bg-gold/20 blur-2xl" />
            <span className="relative h-32 w-32 rounded-full bg-gradient-to-br from-cream via-gold to-gold-deep shadow-[0_0_80px_rgba(230,203,140,0.35)] sm:h-40 sm:w-40" />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["오늘의 운세", "매일 바뀌는 일진과 한 주", "#today", openToday],
            ["맞춤 요금제", "1·3·풀 패키지 · 마켓 주문", "#reading", openShop],
            ["10년 세운", "올해부터 앞으로 10년", "#reading", openTen],
            ["연도·월별 운세", "원하는 해의 세운과 12개월", "#year-fortune", openYear],
            ["2027 신년", "열두 달의 기회와 위기", "#year-fortune", openYear],
            ["재물운", "하는 일에 맞춘 돈의 흐름", "#reading", null],
            ["애정운", "미혼·기혼에 맞춘 관계", "#reading", null],
            ["종합운", "초년, 중년, 말년", "#reading", null],
            ["적성·직업", "성격과 지금 하는 일", "#reading", null],
            ["심층 리포트", "스무 쪽을 잇는 한 권", "#reading", null],
            ["관상", "오행이 남긴 인상과 습관", "#reading", null],
            ["진로지침서", "1순위 적성·현대 직종과 2순위 차선책", "#reading", openCareerGuide],
            ["택일", "이사·계약·결혼의 길한 날", "#reading", null],
          ].map(([name, copy, href, handler]) => (
            <a
              key={name}
              href={href}
              onClick={handler || undefined}
              className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-4 transition hover:border-gold"
            >
              <h2 className="font-serif text-lg text-gold">{name}</h2>
              <p className="mt-1 text-sm text-mist">{copy}</p>
            </a>
          ))}
        </section>

        <section id="year-fortune" className="scroll-mt-24 rounded-3xl border border-gold/30 bg-white/5 p-5 sm:p-7">
          <p className="text-xs tracking-[0.28em] text-gold">이런 분께 꼭 필요합니다</p>
          <h2 className="mt-2 font-serif text-3xl text-cream">고민을 고르면, 그해의 답이 열립니다</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-mist">
            다른 사이트처럼 올해·내년만 보여주는 게 아니라, 원하는 연도를 고르면 세운과 1~12월 월운이 바로 나옵니다. 어려운
            한자 용어는 숨기고, 생활 문장으로만 풀어 드립니다.
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {[
              ["올해 이직이나 창업을 고민 중이신가요?", "일이 움직이기 쉬운 달과 속도를 늦출 달을 바로 보여 드립니다."],
              ["묶인 자금이 언제 풀릴지 답답하신가요?", "청구·정산·회수에 맞는 달을 쉬운 말로 짚어 드립니다."],
              ["사람 문제로 마음이 무거운가요?", "소개·대화·관계 정리가 수월한 달을 골라 드립니다."],
              ["몸과 일정이 자꾸 겹쳐 지치시나요?", "주의할 날짜와 쉬는 개운법을 달마다 적어 드립니다."],
            ].map(([question, preview]) => (
              <article key={question} className="rounded-2xl border border-white/10 bg-night/40 p-4">
                <p className="font-serif text-lg leading-7 text-cream">{question}</p>
                <p className="mt-2 text-sm leading-6 text-mist">{preview}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href="#reading" className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
                    미리보기
                  </a>
                  <button type="button" onClick={openYear} className="rounded-full bg-gold px-4 py-2 text-sm text-night">
                    운세 확인하기
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SCHOOLS.map(([name, copy]) => (
            <article key={name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <h2 className="font-serif text-lg text-gold">{name}</h2>
              <p className="mt-1 text-sm text-mist">{copy}</p>
            </article>
          ))}
        </section>

        {hint ? <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">{hint}</p> : null}
        <ReadingForm key={formKey} onSubmit={submit} onClear={clearPrivacy} />
        {adminGate ? <AdminReportPanel form={lastForm} reading={reading} /> : null}
        {reading ? (
          <ReadingBoard
            key={`${reading.displayName}-${reading.chart.solarText}-${reading.chart.clock}-${reading.chart.yaja}-${reading.profile.status}-${reading.profile.role}`}
            reading={reading}
            requestedTab={requestedTab}
            requestId={requestId}
            onPartnerSubmit={updatePartner}
          />
        ) : null}
      </main>
      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs leading-6 text-mist">
        <p>본 서비스의 풀이는 참고용 안내이며, 의료·투자·법률 판단을 대신하지 않습니다.</p>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-gold/90" aria-label="정책 안내">
          <a href="#terms" className="hover:text-gold">
            이용약관
          </a>
          <span aria-hidden="true">·</span>
          <a href="#privacy" className="hover:text-gold">
            개인정보처리방침
          </a>
          <span aria-hidden="true">·</span>
          <a href="#refund" className="hover:text-gold">
            환불/취소 정책
          </a>
          <span aria-hidden="true">·</span>
          <a href="#contact" className="hover:text-gold">
            문의 안내
          </a>
        </nav>
        <div className="mx-auto mt-6 max-w-2xl space-y-4 text-left text-mist/90">
          <section id="terms" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-sm text-gold">이용약관</h2>
            <p className="mt-2">천기노트의 풀이와 리포트는 참고용 명리 안내이며, 특정 결과나 이익을 보장하지 않습니다.</p>
          </section>
          <section id="privacy" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-sm text-gold">개인정보처리방침</h2>
            <p className="mt-2">입력하신 이름·생년월일 등은 브라우저 화면에만 사용되며, 서버에 자동 저장하지 않습니다.</p>
          </section>
          <section id="refund" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-sm text-gold">환불/취소 정책</h2>
            <p className="mt-2">
              이 사이트에서는 카드·간편결제로 유료 PDF를 판매하지 않습니다. 크몽·당근 등 마켓에서 주문·결제한 경우의
              환불·취소는 해당 플랫폼 정책과 상품 안내를 따릅니다. 디지털 콘텐츠 특성상 단순 변심 환불이 제한될 수
              있으니 구매 전 상품 설명을 확인해 주세요.
            </p>
          </section>
          <section id="contact" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <h2 className="text-sm text-gold">문의 안내</h2>
            <p className="mt-2">서비스·리포트 관련 문의는 운영 채널을 통해 남겨 주세요. 천기노트 팀에서 확인 후 안내드립니다.</p>
          </section>
        </div>
      </footer>
    </div>
  );
}
