import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!reading) return;
    document.getElementById("reading-sheet")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reading]);

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

  return (
    <div id="top" className="stars min-h-svh">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="font-serif text-lg tracking-wide text-cream">
            달빛 사주관
          </a>
          <div className="flex gap-2">
            <a href="#today" onClick={openToday} className="rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
              오늘의 운세
            </a>
            <a href="#year-fortune" onClick={openYear} className="hidden rounded-full border border-gold/40 px-4 py-2 text-sm text-gold sm:inline-flex">
              연도·월별
            </a>
            <a href="#reading" className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-night">
              명식 풀기
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-14 px-5 py-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs tracking-[0.32em] text-gold">NINE SCHOOLS</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-cream sm:text-6xl">
          아홉가지 동양철학으로 읽는 운명
              <br />
              
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-mist">
              생년월일과 시각, 음양력과 야자시, 한글·한자 이름, 그리고 상대의 명식까지 넣으면 사주 원국과 기문 시반이 재물, 일, 시험, 연애, 건강, 가족, 이사의 연·월 풀이로 이어집니다.
            </p>
          </div>
          <div className="moon-drift relative mx-auto grid h-64 w-64 place-items-center">
            <span className="absolute inset-6 rounded-full bg-gold/20 blur-2xl" />
            <span className="relative h-40 w-40 rounded-full bg-gradient-to-br from-cream via-gold to-gold-deep shadow-[0_0_80px_rgba(230,203,140,0.35)]" />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[
            ["오늘의 운세", "매일 바뀌는 일진과 한 주", "#today", openToday],
            ["맞춤 요금제", "1·3·풀 패키지 선택 결제", "#reading", openShop],
            ["10년 세운", "올해부터 앞으로 10년", "#reading", openTen],
            ["연도·월별 운세", "원하는 해의 세운과 12개월", "#year-fortune", openYear],
            ["2027 신년", "열두 달의 기회와 위기", "#year-fortune", openYear],
            ["재물운", "하는 일에 맞춘 돈의 흐름", "#reading", null],
            ["애정운", "미혼·기혼에 맞춘 관계", "#reading", null],
            ["종합운", "초년, 중년, 말년", "#reading", null],
            ["적성·직업", "성격과 지금 하는 일", "#reading", null],
            ["심층 리포트", "스무 쪽을 잇는 한 권", "#reading", null],
            ["관상", "오행이 남긴 인상과 습관", "#reading", null],
            ["타로·별자리", "세 장의 카드와 태양별자리", "#reading", null],
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
        달빛 사주관은 명식과 시반의 규칙으로 엮은 참고용 풀이입니다. 진료, 투자, 법률 판단을 대신하지 않습니다.
      </footer>
    </div>
  );
}
