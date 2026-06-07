// 학생 대시보드 — 더미 UI 샘플

const stats = [
  { label: "수강중인 강의", value: "1개반", delta: "중등 논술 A반", color: "text-blue-600" },
  { label: "미제출 과제", value: "2건", delta: "기한 임박!", color: "text-red-500" },
  { label: "받은 피드백", value: "8건", delta: "이번달 3건", color: "text-emerald-600" },
  { label: "평균 점수", value: "84점", delta: "지난달 +4점", color: "text-violet-600" },
];

const upcomingAssignments = [
  { id: "1", title: "6월 1주차 — 기후 위기와 우리의 책임", due: "2025-06-09", dday: "D-3", urgent: true },
  { id: "2", title: "6월 2주차 — 디지털 리터러시", due: "2025-06-16", dday: "D-10", urgent: false },
];

const feedbackHistory = [
  {
    assignment: "5월 4주차 — 환경과 인간",
    score: 88,
    date: "2025-06-03",
    preview: "논지가 명확하고 근거 제시가 탄탄합니다. 결론 부분에서 주장을 한 번 더 강화하면 좋겠습니다.",
    tags: ["논지 명확", "근거 탄탄"],
  },
  {
    assignment: "5월 3주차 — AI의 미래",
    score: 82,
    date: "2025-05-27",
    preview: "다양한 시각을 제시한 점이 좋습니다. 다만 문단 전환이 다소 급작스러운 부분이 있습니다.",
    tags: ["다양한 시각", "문단 전환 보완"],
  },
  {
    assignment: "5월 2주차 — 민주주의란 무엇인가",
    score: 79,
    date: "2025-05-20",
    preview: "개념 이해는 충분하지만 본인의 의견을 더 적극적으로 표현해 보세요.",
    tags: ["개념 이해", "의견 표현 강화"],
  },
];

const scoreHistory = [79, 82, 88];

export default function StudentDashboardSample() {
  const maxScore = 100;

  return (
    <div className="space-y-8 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">학생</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">안녕하세요, 박논술 학생 👋</h1>
          <p className="mt-0.5 text-sm text-zinc-500">서울중학교 2학년 · 중등 논술 A반</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-zinc-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 다가오는 과제 */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">다가오는 과제</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-800 leading-snug">{a.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    a.urgent ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
                  }`}>{a.dday}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">마감 {a.due}</p>
                <a
                  href={`/ui-sample/student/assignments/${a.id}`}
                  className="mt-3 inline-block rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  제출하기
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 점수 추이 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">점수 추이</h2>
          <div className="flex items-end justify-around gap-3 h-36">
            {[
              { label: "5월 2주", score: 79 },
              { label: "5월 3주", score: 82 },
              { label: "5월 4주", score: 88 },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-bold text-zinc-700">{item.score}</span>
                <div className="w-full rounded-t-lg bg-blue-500" style={{ height: `${(item.score / maxScore) * 120}px` }} />
                <span className="text-[10px] text-zinc-400 text-center">{item.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-zinc-400">최근 3주 기준 · 평균 83점</p>
        </div>

        {/* 내 강의 정보 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">내 강의 정보</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">반 이름</span>
              <span className="font-medium text-zinc-800">중등 논술 A반</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">담당 강사</span>
              <span className="font-medium text-zinc-800">김슈렉 선생님</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">수업 요일</span>
              <span className="font-medium text-zinc-800">월 · 수 16:00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">수업 장소</span>
              <span className="font-medium text-zinc-800">1강의실</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">진도율</span>
              <span className="font-bold text-blue-600">75%</span>
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full w-3/4 rounded-full bg-blue-500" />
          </div>
        </div>
      </div>

      {/* 최근 피드백 */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-800">최근 받은 피드백</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {feedbackHistory.map((f) => (
            <div key={f.assignment} className="px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600">
                  {f.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-800">{f.assignment}</p>
                    <p className="shrink-0 text-xs text-zinc-400">{f.date}</p>
                  </div>
                  <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{f.preview}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {f.tags.map((t) => (
                      <span key={t} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
