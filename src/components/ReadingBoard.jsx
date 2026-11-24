import { toPng } from "html-to-image";
import { useMemo, useState } from "react";
import AptitudeCareerPanel from "./AptitudeCareerPanel";
import { CareerGuidePanel, FacePanel, ReportBook, TaegilPanel } from "./DeepReading";
import FortuneDashboard from "./FortuneDashboard";
import { MonthBasisNote, MonthCardTitle } from "./MonthBasisNote";
import { ScoreIndexNote, TraditionEvidence, WuxingPriorityNote } from "./ReadingNotes";
import TodayFortune from "./TodayFortune";
import CustomFortuneSystem from "./CustomFortuneSystem";
import TenYearFortune from "./TenYearFortune";
import YearFortunePane from "./YearFortunePane";
import { buildDaYunLifeFlow } from "../lib/flowCopy";
import { readingToText } from "../lib/plainText";
import { readingToReportHtml } from "../lib/reportHtml";

function buildTabs(profile) {
  const married = profile?.status === "married";
  const loveLabel = married ? "부부·관계" : "연애·궁합";
  const familyLabel = married ? "가족·자녀" : "자녀 인연·가족";
  return [
    ["home", "나의 핵심 요약"],
    ["careerGuide", "진로지침서"],
    ["wealth", "재물·사업"],
    ["career", "적성·직업"],
    ["study", "학업·시험"],
    ["love", loveLabel],
    ["health", "건강"],
    ["family", familyLabel],
    ["move", "이사·풍수"],
    ["today", "오늘의 운세"],
    ["ten", "10년 세운"],
    ["year", "연도·월별"],
    ["taegil", "택일"],
    ["guide", "실천 가이드"],
    ["chart", "명식"],
    ["schools", "분석 근거"],
    ["report", "심층 리포트"],
    ["face", "관상"],
    ["shop", "맞춤 구성"],
  ];
}

const TAB_GROUPS = [
  { id: "all", label: "전체", ids: null },
  { id: "summary", label: "핵심", ids: ["home", "careerGuide"] },
  { id: "fields", label: "분야", ids: ["wealth", "career", "study", "love", "health", "family", "move"] },
  { id: "timing", label: "시기", ids: ["today", "ten", "year", "taegil"] },
  { id: "practice", label: "실천·근거", ids: ["guide", "chart", "schools", "report", "face"] },
  { id: "shop", label: "요금", ids: ["shop"] },
];

function groupForTab(tabId) {
  return TAB_GROUPS.find((group) => group.ids?.includes(tabId))?.id || "all";
}

const ZIWEI_BOARD = [
  ["巳", "午", "未", "申"],
  ["辰", "", "", "酉"],
  ["卯", "", "", "戌"],
  ["寅", "丑", "子", "亥"],
];

export default function ReadingBoard({ reading, requestedTab = "home", requestId = 0, onPartnerSubmit }) {
  const [tab, setTab] = useState(requestedTab);
  const [stamp, setStamp] = useState(requestId);
  const [year, setYear] = useState(reading.forecast[0].years[0].year);
  const [note, setNote] = useState("");
  const [tabGroup, setTabGroup] = useState(() => groupForTab(requestedTab));

  if (stamp !== requestId) {
    setStamp(requestId);
    setTab(requestedTab);
    setTabGroup(groupForTab(requestedTab));
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(readingToText(reading));
      setNote("전체 풀이를 복사했습니다.");
    } catch {
      setNote("복사 권한이 없습니다. 브라우저에서 클립보드를 허용해 주세요.");
    }
  }

  async function savePng() {
    const node = document.getElementById("reading-sheet");
    try {
      const url = await toPng(node, { pixelRatio: 2, backgroundColor: "#07091c", cacheBust: true });
      download(url, fileName(reading));
      setNote("지금 보고 있는 탭을 이미지로 저장했습니다.");
    } catch {
      download(paintFallback(reading), fileName(reading));
      setNote("화면 캡처가 막혀 풀이 원문을 이미지로 저장했습니다.");
    }
  }

  function savePdfHtml() {
    // 무료 화면 요약 HTML만 저장 (유료 심층 productReportHtml 과 분리)
    const html = readingToReportHtml(reading, { year: reading.yearFortune?.defaultYear });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    download(url, `달빛사주-무료요약-${stamp}.html`);
    URL.revokeObjectURL(url);
    setNote(
      "무료 화면 요약 HTML을 저장했습니다(이름 없는 파일명). 유료 심층 PDF는 사이트에서 내려받을 수 없으며, 크몽·당근 주문 후 판매자가 전달합니다.",
    );
  }

  const category = reading.forecast.find((item) => item.id === tab);
  const tabs = useMemo(() => buildTabs(reading.profile), [reading.profile]);
  const visibleTabs = useMemo(() => {
    const group = TAB_GROUPS.find((item) => item.id === tabGroup);
    if (!group?.ids) return tabs;
    return tabs.filter(([id]) => group.ids.includes(id));
  }, [tabs, tabGroup]);

  function selectTab(id) {
    setTab(id);
    setTabGroup(groupForTab(id));
  }

  function selectGroup(id) {
    setTabGroup(id);
    const group = TAB_GROUPS.find((item) => item.id === id);
    if (group?.ids && !group.ids.includes(tab)) {
      setTab(group.ids[0]);
    }
  }

  return (
    <section id="reading-sheet" className="min-w-0 scroll-mt-24 rounded-3xl border border-gold/30 bg-[#0c1228] p-3 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs tracking-[0.28em] text-gold/80">천기노트</p>
          <h2 className="mt-2 break-words-tight font-serif text-2xl text-cream sm:text-3xl">
            {reading.displayName}님의 천기노트 요약
            {reading.hanja ? <span className="ml-2 text-lg text-gold sm:text-xl">{reading.hanja}</span> : null}
          </h2>
          <p className="mt-2 break-words-tight text-sm leading-6 text-mist">
            {reading.chart.genderLabel} · {reading.profile.statusLabel} · {reading.profile.roleLabel} · {reading.chart.clock} · 양력 {reading.chart.solarText} · {reading.chart.lunarText} · 야자시{" "}
            {reading.chart.yaja ? "적용" : "미적용"}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button type="button" onClick={copyText} className="touch-target rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
            텍스트 복사
          </button>
          <button type="button" onClick={savePdfHtml} className="touch-target rounded-full border border-gold/40 px-4 py-2 text-sm text-gold">
            무료 요약 HTML
          </button>
          <button type="button" onClick={savePng} className="touch-target rounded-full bg-gold px-4 py-2 text-sm font-medium text-night">
            PNG 저장
          </button>
        </div>
      </div>
      <p className="mt-4 text-sm leading-7 text-cream">
        입력하신 정보를 바탕으로 핵심 성향과 흐름을 먼저 정리했습니다. 필요한 항목은 아래에서 차근차근 확인해 보세요.
      </p>
      {reading.notices?.hourUnknown ? (
        <p className="mt-3 rounded-2xl border border-rose/30 bg-rose/5 px-4 py-3 text-sm leading-7 text-mist">
          출생 시각 정보가 없어 시간대별 세부 풀이는 일부 제한되거나 참고용으로 표시됩니다. 서양 점성술 상승궁·하우스는
          정오(12:00) 기준 참고값입니다.
        </p>
      ) : null}
      {reading.notices?.birthPlaceAssumed ? (
        <p className="mt-3 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm leading-7 text-mist">
          출생지를 선택하지 않아 서양 점성술 상승궁·하우스는{" "}
          <span className="text-cream">{reading.notices.birthPlaceLabel || "서울"}</span> 경도·시간대 기준 근사/참고
          계산입니다. 명식 입력의 ‘서양 점성술 옵션’에서 지역을 고르면 기준이 바뀝니다.
        </p>
      ) : null}
      {reading.notices?.hanjaSuggested ? (
        <p className="mt-3 rounded-2xl border border-gold/25 bg-gold/5 px-4 py-3 text-sm leading-7 text-mist">
          실제 한자 대신 추천 한자가 반영된 성명학 항목은 참고용 결과로 안내됩니다.
        </p>
      ) : null}
      <p className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-mist">
        {reading.notices?.reportHint ||
          "오늘의 운세는 전체 무료입니다. 1년·월별과 10년 세운은 핵심 요약만 무료이며, 상세 분석은 유료 맞춤 PDF(8,000·19,000·29,000원)로 크몽·당근 주문 후 판매자가 전달합니다."}
      </p>
      <p className="mt-4 text-sm leading-7 text-cream/90">{reading.bridge}</p>
      <TraditionEvidence className="mt-3">{reading.bridgeEvidence}</TraditionEvidence>
      <p className="mt-3 text-xs leading-6 text-mist/80">
        읽기 흐름 · 나의 핵심 요약 → 분야별 풀이 → 시기별 흐름 → 실천 가이드 → 분석 근거
      </p>
      <p className="mt-2 rounded-2xl border border-gold/20 bg-gold/5 px-3 py-2 text-xs leading-6 text-mist sm:hidden">
        스마트폰에서는 아래 그룹을 고른 뒤 탭을 좌우로 밀어 이동하세요. 무료 요약은 ‘무료 요약 HTML’로 저장할 수 있습니다.
      </p>
      {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="메뉴 그룹">
        {TAB_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            aria-pressed={tabGroup === group.id}
            className={`touch-target rounded-full px-3 py-2 text-xs sm:text-sm ${
              tabGroup === group.id ? "bg-gold/90 text-night" : "border border-white/15 text-mist"
            }`}
            onClick={() => selectGroup(group.id)}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="tab-scroll mt-3 flex gap-2 overflow-x-auto pb-2" role="tablist">
        {visibleTabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`touch-target shrink-0 rounded-full px-4 py-2.5 text-sm ${tab === id ? "bg-gold text-night" : "border border-white/10 text-mist"}`}
            onClick={() => selectTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6" role="tabpanel">
        {tab === "shop" ? <CustomFortuneSystem reading={reading} onPartnerSubmit={onPartnerSubmit} onNote={setNote} /> : null}
        {tab === "today" ? <TodayFortune reading={reading} onNote={setNote} /> : null}
        {tab === "ten" ? <TenYearFortune reading={reading} /> : null}
        {tab === "year" ? <YearFortunePane reading={reading} onNote={setNote} /> : null}
        {tab === "report" ? <ReportBook report={reading.report} /> : null}
        {tab === "face" ? <FacePanel face={reading.face} /> : null}
        {tab === "careerGuide" ? <CareerGuidePanel reading={reading} /> : null}
        {tab === "career" ? <AptitudeCareerPanel reading={reading} /> : null}
        {tab === "taegil" ? <TaegilPanel taegil={reading.taegil} /> : null}
        {tab === "home" ? <FortuneDashboard reading={reading} /> : null}
        {tab === "chart" ? <ChartPane reading={reading} /> : null}
        {tab === "guide" ? <GuidePane guide={reading.guide} chart={reading.chart} /> : null}
        {tab === "schools" ? <SchoolPane reading={reading} /> : null}
        {category && tab !== "career" ? (
          <ForecastPane category={category} year={year} onYear={setYear} compat={reading.compat} />
        ) : null}
      </div>
    </section>
  );
}

function ChartPane({ reading }) {
  const { chart } = reading;
  const max = Math.max(...Object.values(chart.count));
  const year = reading.guide.year;
  return (
    <div className="space-y-6">
      <p className="text-sm leading-7 text-cream/90">{reading.guide.summary}</p>
      <WuxingPriorityNote chart={chart} lack={reading.guide.lack} />
      <div className="grid gap-3 md:grid-cols-4">
        {chart.pillars.map((pillar) => (
          <article key={pillar.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gold">{pillar.label}</p>
            <p className="mt-2 font-serif text-3xl text-cream">{pillar.gzKo}</p>
            <p className="mt-2 text-sm text-mist">{pillar.shiShen}</p>
            <p className="text-sm text-mist">{pillar.nayin} · {pillar.diShi}</p>
            <TraditionEvidence className="mt-2" title="전통 해석 근거 보기">
              십신 {pillar.shiShen} · 납음 {pillar.nayin} · 12운성 {pillar.diShi} · 지장간 {pillar.hide.join(" ")}
            </TraditionEvidence>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 p-4">
          <h3 className="font-serif text-xl text-cream">오행과 신강신약</h3>
          <p className="mt-2 text-sm leading-6 text-mist">
            일간 {chart.dayMasterKo}
            {chart.dayElement} · {chart.strength.label} · 우선 도움 기운 {chart.strength.favorable.join("·")} · 먼저 채울 기운{" "}
            {reading.guide.lack}
          </p>
          <TraditionEvidence className="mt-3">
            희신 {chart.strength.favorable.join("·")} · 기신 {chart.strength.unfavorable.join("·")} · 공망 {chart.xunKong}
          </TraditionEvidence>
          <div className="mt-4 space-y-2">
            {Object.entries(chart.count).map(([element, count]) => (
              <div key={element} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2 text-sm">
                <span>{element}</span>
                <span className="h-1.5 rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-gold" style={{ width: `${(count / max) * 100}%` }} />
                </span>
                <span className="text-mist">{count}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-white/10 p-4">
          <h3 className="font-serif text-xl text-cream">대운 {chart.daYun.forward ? "순행" : "역행"}</h3>
          <p className="mt-2 text-sm text-mist">{chart.daYun.startText} 뒤 본 대운</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {chart.daYun.cycles.map((cycle) => {
              const current = year >= cycle.startYear && year <= cycle.endYear;
              return (
                <span
                  key={`${cycle.startYear}-${cycle.gzKo}`}
                  className={`rounded-2xl border px-3 py-2 text-sm ${current ? "border-gold bg-gold/10" : "border-white/10"}`}
                >
                  <b className="text-gold">{cycle.gzKo}</b>
                  <span className="mt-1 block text-xs text-mist">
                    {cycle.startYear}–{cycle.endYear} · {cycle.startAge}–{cycle.endAge}세
                    {current ? " · 지금" : ""}
                  </span>
                </span>
              );
            })}
          </div>
        </article>
      </div>
    </div>
  );
}

function GuidePane({ guide, chart }) {
  const current = guide.decades.find((cycle) => guide.year >= cycle.startYear && guide.year <= cycle.endYear);
  const lifeFlow = chart ? buildDaYunLifeFlow(chart, guide) : null;
  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-serif text-2xl text-cream">10년마다 바뀌는 삶의 결</h3>
        <p className="mt-3 text-sm leading-7 text-mist">{guide.summary}</p>
        {chart ? <WuxingPriorityNote className="mt-4" chart={chart} lack={guide.lack} /> : null}
        <ScoreIndexNote className="mt-3" />
        {current ? <p className="mt-3 text-sm leading-7 text-gold">올해가 속한 10년은 {current.gzKo}, {current.level}입니다. {current.text}</p> : null}
      </article>
      <div className="grid gap-3 lg:grid-cols-2">
        {guide.decades.map((cycle) => (
          <article
            key={`${cycle.startYear}-${cycle.gzKo}`}
            className={`rounded-2xl border p-4 ${cycle.turning ? "border-rose/50" : "border-white/10"} ${guide.year >= cycle.startYear && guide.year <= cycle.endYear ? "bg-gold/10" : ""}`}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-cream">
                {cycle.gzKo} · {cycle.startYear}–{cycle.endYear}
              </span>
              <span className={levelClass(cycle.level)}>
                {cycle.turning ? "전환 " : ""}
                {cycle.level} {cycle.score}
              </span>
            </div>
            <p className="mt-2 text-xs text-mist">{cycle.startAge}–{cycle.endAge}세</p>
            <span className="mt-3 block h-1.5 rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${cycle.score}%` }} />
            </span>
            <p className="mt-3 text-sm leading-6 text-mist">{cycle.text}</p>
          </article>
        ))}
      </div>
      {lifeFlow?.lines?.length ? (
        <article className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
          <h3 className="font-serif text-xl text-cream">{lifeFlow.title || "생활 속 운의 흐름"}</h3>
          <p className="mt-1 text-xs text-gold/80">전체 설명 · 맞춤 풀패키지 화면에는 요약만 표시됩니다</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-cream">
            {lifeFlow.lines.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </article>
      ) : null}
      <article className="rounded-2xl border border-white/10 p-5">
        <h3 className="font-serif text-2xl text-cream">{guide.year}년, 1월부터 12월</h3>
        <p className="mt-2 text-sm leading-7 text-mist">막대는 그달의 온도입니다. 각 달 아래에는 잡을 기회와 미리 피할 일을 나눠 적었습니다.</p>
        <MonthBasisNote className="mt-4" />
      </article>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {guide.months.map((month) => (
          <article key={month.month} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-2 text-sm">
              <MonthCardTitle month={month} />
              <span className={`shrink-0 ${levelClass(month.level)}`}>
                {month.level} {month.score}
              </span>
            </div>
            <span className="mt-3 block h-1.5 rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${month.score}%` }} />
            </span>
            <p className="mt-3 text-sm leading-6 text-gold">기회 · {month.chance}</p>
            <p className="mt-2 text-sm leading-6 text-rose">조심 · {month.caution}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 p-5">
          <h3 className="font-serif text-xl text-cream">행운의 음식</h3>
          <p className="mt-2 text-sm text-gold">
            우선 채울 {guide.table.element} · {guide.table.name}
          </p>
          <p className="mt-1 text-xs leading-6 text-mist">도움 기운 중 가장 모자란 기운 기준입니다.</p>
          <p className="mt-3 text-sm leading-7 text-cream">{guide.table.foods.join(", ")}</p>
          <p className="mt-2 text-sm leading-7 text-mist">{guide.table.habit}</p>
        </article>
        <article className="rounded-2xl border border-white/10 p-5">
          <h3 className="font-serif text-xl text-cream">입으면 힘이 되는 색</h3>
          <div className="mt-4 space-y-4">
            {guide.palette.items.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-2">
                  {item.swatches.map((color) => (
                    <span key={color} className="h-5 w-5 rounded-full border border-white/20" style={{ background: color }} />
                  ))}
                  <span className="text-sm text-gold">
                    {item.title} · {item.name}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-mist">{item.text}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {guide.risks.map((risk) => (
          <article key={risk.id} className="rounded-2xl border border-rose/40 p-5">
            <h3 className="font-serif text-xl text-rose">{risk.title}</h3>
            <p className="mt-2 text-sm leading-7 text-mist">{risk.warning}</p>
            <p className="mt-3 text-sm leading-7 text-cream">막는 법 · {risk.remedy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ForecastPane({ category, year, onYear, compat }) {
  const months = category.months[year] || [];
  return (
    <div className="space-y-5">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="font-serif text-2xl text-cream">{category.title}</h3>
        <p className="mt-3 text-sm leading-7 text-mist">{category.summary}</p>
        <TraditionEvidence className="mt-3">{category.traditionNote}</TraditionEvidence>
        <ScoreIndexNote className="mt-3" />
        {category.timingNote ? <p className="mt-3 text-sm leading-7 text-gold">{category.timingNote}</p> : null}
        {category.id === "love" && compat ? (
          <div className="mt-4 rounded-2xl border border-gold/30 p-4">
            <p className="text-sm text-gold">
              {compat.pair} · 내부 해석 지수 {compat.score}점 · {compat.level}
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-mist">
              {compat.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
      <div className="tab-scroll flex gap-2 overflow-x-auto pb-1">
        {category.years.map((item) => (
          <button
            key={item.year}
            type="button"
            onClick={() => onYear(item.year)}
            className={`touch-target shrink-0 rounded-2xl border px-3 py-2 text-left text-sm ${item.year === year ? "border-gold bg-gold/10" : "border-white/10"}`}
          >
            <span className="block text-cream">{item.year}</span>
            <span className={levelClass(item.level)}>
              {item.gzKo} {item.level}
            </span>
          </button>
        ))}
      </div>
      <article className="rounded-2xl border border-white/10 p-4">
        <h4 className="text-sm text-gold">{year}년 흐름</h4>
        <p className="mt-2 text-sm leading-7 text-mist">{category.years.find((item) => item.year === year)?.text}</p>
        <MonthBasisNote className="mt-4" />
      </article>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {months.map((month) => (
          <article key={month.month} className="rounded-2xl border border-white/10 p-4">
            <div className="flex items-start justify-between gap-2 text-sm">
              <MonthCardTitle month={month} />
              <span className={`shrink-0 ${levelClass(month.level)}`}>
                {month.level} {month.score}
              </span>
            </div>
            <span className="mt-3 block h-1.5 rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-gold" style={{ width: `${month.score}%` }} />
            </span>
            <p className="mt-3 text-sm leading-6 text-mist">{month.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SchoolPane({ reading }) {
  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-gold/25 bg-gold/5 p-4">
        <p className="text-xs tracking-[0.18em] text-gold">분석 근거</p>
        <p className="mt-2 text-sm leading-7 text-mist">
          일반 풀이 화면에는 생활 언어를 먼저 쓰고, 명리·자미두수·기문둔갑 등 전문 용어와 격자·국수 근거는 이 탭에서 확인합니다.
        </p>
      </article>
      {reading.engines.map((engine) => (
        <article key={engine.id} className="rounded-2xl border border-white/10 p-4 sm:p-5">
          <h3 className="font-serif text-2xl text-gold">{engine.name}</h3>
          <p className="mt-2 text-sm leading-7 text-mist">{engine.summary}</p>
          <TraditionEvidence className="mt-3" title="전통 해석 포인트 펼치기">
            <ul className="space-y-1">
              {engine.points.map((point) => (
                <li key={point}>· {point}</li>
              ))}
            </ul>
          </TraditionEvidence>
          {engine.id === "ziwei" ? <ZiweiGrid cells={engine.cells} bureau={engine.bureau} /> : null}
          {engine.id === "qimen" ? <QimenGrid cells={engine.cells} meta={engine.meta} /> : null}
          {engine.id === "yijing" || engine.id === "liuyao" ? (
            <Hexagram lines={engine.lines} moving={engine.moving} title={`${engine.original} → ${engine.changed}`} />
          ) : null}
          {engine.id === "name" ? <NameGrids name={engine} /> : null}
        </article>
      ))}
    </div>
  );
}

function ZiweiGrid({ cells, bureau }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-gold">{bureau} · 명궁은 금색 테두리, 신궁은 신 표시</p>
      <p className="mb-2 text-xs text-mist sm:hidden">표를 좌우로 밀어 전체를 볼 수 있습니다.</p>
      <div className="table-scroll">
        <div className="grid min-w-[22rem] grid-cols-4 gap-2">
          {ZIWEI_BOARD.flat().map((branch, index) => {
            if (!branch) {
              return (
                <div key={`empty-${index}`} className="grid min-h-24 place-items-center rounded-xl text-xs text-mist/50">
                  {index === 5 ? "자미" : ""}
                </div>
              );
            }
            const cell = cells.find((item) => item.branch === branch);
            return (
              <div key={branch} className={`min-h-24 rounded-xl border p-2 ${cell.ming ? "border-gold" : "border-white/10"}`}>
                <p className="text-xs text-gold">
                  {cell.branchKo} · {cell.palace}
                  {cell.shen ? " · 신" : ""}
                </p>
                <p className="mt-1 text-xs leading-5 text-cream">
                  {cell.stars.length ? cell.stars.map((star) => `${star.name}${star.hua ? `(${star.hua})` : ""}`).join(" ") : "공궁"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QimenGrid({ cells, meta }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-gold">{meta} · 위쪽이 남</p>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((cell) => (
          <div key={cell.id} className={`rounded-xl border p-2 ${cell.zhifu ? "border-gold" : "border-white/10"}`}>
            <p className="text-xs text-gold">
              {cell.dir} {cell.name}
              {cell.zhishi ? " · 직사" : ""}
            </p>
            <p className="mt-1 text-sm text-cream">
              {cell.star} · {cell.earth}
            </p>
            <p className="text-xs text-mist">
              {cell.door || "중궁"} {cell.god}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hexagram({ lines, moving, title }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-gold">{title}</p>
      <div className="mt-2 space-y-1 font-mono text-sm text-cream">
        {[...lines].reverse().map((bit, index) => {
          const position = lines.length - index;
          return (
            <p key={position}>
              {bit ? "━━━━━━" : "━━  ━━"} {position}효{position === moving ? " 동" : ""}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function NameGrids({ name }) {
  const blocks = [name.hanja ? ["한자", name.hanja] : null, ["한글", name.hangul]].filter(Boolean);
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {blocks.map(([label, block]) => (
        <div key={label} className="rounded-xl border border-white/10 p-3">
          <p className="text-xs text-gold">{label} 획수</p>
          <p className="mt-1 text-sm text-cream">
            {block.syllables.map((item) => `${item.ch}${item.stroke ?? "?"}${item.pole}`).join(" ")}
          </p>
          {block.grids ? (
            <ul className="mt-2 space-y-1 text-sm text-mist">
              {block.grids.map((grid) => (
                <li key={grid.name}>
                  {grid.name} {grid.number}수 {grid.luck} · {grid.meaning}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-mist">획수를 확정하지 못한 글자 {block.missing.join(" ")}는 한글 자획으로 이어서 풀었습니다.</p>
          )}
        </div>
      ))}
    </div>
  );
}

function levelClass(level) {
  if (level === "대길" || level === "길") return "text-gold";
  if (level === "흉" || level === "신중") return "text-rose";
  return "text-mist";
}

function fileName(reading) {
  return `천기노트-${reading.displayName}.png`;
}

function download(url, name) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
}

function paintFallback(reading) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07091c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e6cb8c";
  ctx.font = "48px serif";
  ctx.fillText("천기노트", 64, 100);
  ctx.fillStyle = "#f6f1e7";
  ctx.font = "28px sans-serif";
  wrapText(ctx, readingToText(reading), 64, 170, 950, 40);
  return canvas.toDataURL("image/png");
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  text.split("\n").forEach((paragraph) => {
    let line = "";
    [...paragraph].forEach((ch) => {
      const next = line + ch;
      if (ctx.measureText(next).width > maxWidth) {
        ctx.fillText(line, x, y);
        line = ch;
        y += lineHeight;
      } else {
        line = next;
      }
    });
    ctx.fillText(line, x, y);
    y += lineHeight;
  });
}
