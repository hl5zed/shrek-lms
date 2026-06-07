// 학부모 — 성장 리포트 — 더미 UI 샘플

const child = { name: "박논술", class: "중등 논술 A반", teacher: "김슈렉 선생님" };

const monthlyScores = [
  { month: "3월", score: 72, feedback: 2 },
  { month: "4월", score: 76, feedback: 4 },
  { month: "5월", score: 82, feedback: 6 },
  { month: "6월", score: 88, feedback: 3 },
];

const strengths = ["논지 명확", "근거 탄탄", "어휘력 풍부", "구성 체계적"];
const improvements = ["결론 강화", "문단 전환 매끄럽게", "더 구체적인 사례"];

const feedbackTimeline = [
  {
    date: "2025-06-03",
    assignment: "5월 4주차 — 환경과 인간",
    score: 88,
    summary: "논지가 명확하고 근거 제시가 탄탄합니다. 결론 부분을 보강하면 더 좋은 글이 될 것입니다.",
    positive: ["논지 명확", "근거 탄탄"],
    improve: ["결론 강화"],
  },
  {
    date: "2025-05-27",
    assignment: "5월 3주차 — AI의 미래",
    score: 82,
    summary: "다양한 시각을 제시한 점이 좋습니다. 문단 간 전환이 다소 급작스러운 부분이 있었습니다.",
    positive: ["다양한 시각"],
    improve: ["문단 전환"],
  },
  {
    date: "2025-05-20",
    assignment: "5월 2주차 — 민주주의란 무엇인가",
    score: 79,
    summary: "개념 이해는 충분합니다. 본인의 의견을 더 적극적으로 표현해 보면 좋겠습니다.",
    positive: ["개념 이해"],
    improve: ["의견 표현 강화"],
  },
  {
    date: "2025-05-13",
    assignment: "5월 1주차 — 독서의 가치",
    score: 76,
    summary: "주제에 대한 접근이 다양합니다. 결론 부분이 다소 약하여 보완이 필요합니다.",
    positive: ["다양한 접근"],
    improve: ["결론 보완"],
  },
];

export default function ParentGrowthPage() {
  const maxScore = 100;
  const avg = Math.round(monthlyScores.reduce((s, m) => s + m.score, 0) / monthlyScores.length);
  const latest = monthlyScores[monthlyScores.length - 1].score;
  const first = monthlyScores[0].score;
  const growth = latest - first;

  return (
    <div className="space-y-8 px-8 py-10">
      {/* 헤더 */}
      <div>
        <a href="/ui-sample/parent" className="text-xs text-pink-600 hover:underline">← 대시보드</a>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-pink-600">학부모</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900">{child.name} 학생 성장 리포트</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{child.class} · {child.teacher} · 2025년 3월 ~ 현재</p>
          </div>
          <button className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
            PDF 저장
          </button>
        </div>
      </div>

      {/* 요약 지표 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-500">최근 점수</p>
          <p className="mt-1 text-4xl font-bold text-blue-600">{latest}점</p>
          <p className="mt-1 text-xs text-zinc-400">5월 4주차 기준</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-500">3개월 평균</p>
          <p className="mt-1 text-4xl font-bold text-violet-600">{avg}점</p>
          <p className="mt-1 text-xs text-zinc-400">3~6월 전체 평균</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm text-center">
          <p className="text-xs font-medium text-zinc-500">성장 폭</p>
          <p className="mt-1 text-4xl font-bold text-emerald-600">+{growth}점</p>
          <p className="mt-1 text-xs text-zinc-400">3월 대비 6월</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 월별 점수 차트 */}
        <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-sm font-semibold text-zinc-800">월별 점수 추이</h2>
          <div className="flex items-end justify-around gap-4 h-48">
            {monthlyScores.map((m) => (
              <div key={m.month} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-sm font-bold text-zinc-800">{m.score}점</span>
                <div
                  className="w-full max-w-16 rounded-t-xl transition-all"
                  style={{
                    height: `${(m.score / maxScore) * 180}px`,
                    background: m.month === "6월" ? "#2563eb" : "#bfdbfe",
                  }}
                />
                <span className="text-xs font-medium text-zinc-500">{m.month}</span>
                <span className="text-[10px] text-zinc-400">피드백 {m.feedback}건</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" />최근월
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-200" />이전월
            </span>
          </div>
        </div>

        {/* 강점 · 개선 */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-emerald-800">💪 현재 강점</h3>
            <div className="flex flex-wrap gap-2">
              {strengths.map((s) => (
                <span key={s} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <h3 className="mb-3 text-sm font-semibold text-amber-800">💡 보완할 점</h3>
            <div className="flex flex-wrap gap-2">
              {improvements.map((s) => (
                <span key={s} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-700 shadow-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-zinc-800">📊 출석 현황</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">출석</span><span className="font-bold text-emerald-600">24회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">결석</span><span className="font-bold text-zinc-700">0회</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">출석률</span><span className="font-bold text-emerald-600">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 첨삭 피드백 타임라인 */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-800">첨삭 피드백 히스토리</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {feedbackTimeline.map((f, i) => (
            <div key={f.date} className="relative flex gap-5 px-6 py-5">
              {/* 타임라인 점 */}
              <div className="flex flex-col items-center">
                <div className={`h-5 w-5 rounded-full border-2 border-white shadow ring-2 ${
                  i === 0 ? "bg-blue-600 ring-blue-200" : "bg-zinc-300 ring-zinc-100"
                }`} />
                {i < feedbackTimeline.length - 1 && (
                  <div className="mt-1 flex-1 w-px bg-zinc-200" />
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">{f.assignment}</p>
                    <p className="text-xs text-zinc-400">{f.date}</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                    {f.score}
                  </div>
                </div>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{f.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {f.positive.map((t) => (
                    <span key={t} className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      👍 {t}
                    </span>
                  ))}
                  {f.improve.map((t) => (
                    <span key={t} className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                      💡 {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
