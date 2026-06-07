// 강사 대시보드 — 더미 UI 샘플

const stats = [
  { label: "담당 학생", value: "14명", delta: "2개 반", color: "text-blue-600" },
  { label: "이번주 강의", value: "4회", delta: "오늘 2회 남음", color: "text-violet-600" },
  { label: "미채점 제출", value: "11건", delta: "처리 필요", color: "text-amber-600" },
  { label: "이번달 과제", value: "8건", delta: "완료율 63%", color: "text-emerald-600" },
];

const todaySchedule = [
  { time: "16:00", name: "중등 논술 A반", students: 8, room: "1강의실", status: "예정" },
  { time: "18:00", name: "고등 심화반", students: 5, room: "온라인", status: "예정" },
];

const pendingSubmissions = [
  { student: "박논술", assignment: "5월 4주차 — 환경과 인간", submitted: "2025-06-04", urgency: "high" },
  { student: "이글쓰기", assignment: "5월 4주차 — 환경과 인간", submitted: "2025-06-04", urgency: "high" },
  { student: "최사고", assignment: "5월 3주차 — AI의 미래", submitted: "2025-05-28", urgency: "medium" },
  { student: "정표현", assignment: "5월 3주차 — AI의 미래", submitted: "2025-05-27", urgency: "medium" },
  { student: "김논리", assignment: "5월 2주차 — 민주주의", submitted: "2025-05-19", urgency: "low" },
];

const recentFeedback = [
  { student: "오독서", assignment: "5월 1주차", score: 88, date: "2025-05-31" },
  { student: "윤주장", assignment: "4월 4주차", score: 92, date: "2025-05-28" },
  { student: "임근거", assignment: "4월 4주차", score: 76, date: "2025-05-27" },
];

export default function TeacherDashboardSample() {
  return (
    <div className="space-y-8 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">강사</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">김슈렉 선생님의 대시보드</h1>
          <p className="mt-0.5 text-sm text-zinc-500">2025년 6월 6일 (금) · 중등 논술 A반 · 고등 심화반</p>
        </div>
        <button className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          + 과제 출제
        </button>
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
        {/* 오늘 일정 */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">오늘 강의 일정</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {todaySchedule.map((t) => (
              <div key={t.time} className="flex items-start gap-4 px-5 py-4">
                <div className="min-w-[44px] rounded-xl bg-violet-50 px-2 py-1.5 text-center">
                  <p className="text-xs font-bold text-violet-700">{t.time}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800">{t.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{t.students}명 · {t.room}</p>
                </div>
                <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                  {t.status}
                </span>
              </div>
            ))}
            <div className="px-5 py-4 text-center text-xs text-zinc-400">
              오늘 2회 강의가 예정되어 있습니다
            </div>
          </div>
        </div>

        {/* 미채점 제출 */}
        <div className="col-span-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-800">미채점 제출</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {pendingSubmissions.length}건
              </span>
            </div>
            <a href="/ui-sample/teacher/submissions" className="text-xs text-blue-600 hover:underline">
              전체 보기 →
            </a>
          </div>
          <div className="divide-y divide-zinc-100">
            {pendingSubmissions.map((s) => (
              <div key={`${s.student}-${s.assignment}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-600">
                  {s.student[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{s.student}</p>
                  <p className="truncate text-xs text-zinc-500">{s.assignment}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">{s.submitted}</p>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    s.urgency === "high" ? "bg-red-100 text-red-600" :
                    s.urgency === "medium" ? "bg-amber-100 text-amber-600" :
                    "bg-zinc-100 text-zinc-500"
                  }`}>
                    {s.urgency === "high" ? "긴급" : s.urgency === "medium" ? "보통" : "여유"}
                  </span>
                </div>
                <button className="ml-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700">
                  채점하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 최근 채점 완료 */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-zinc-800">최근 채점 완료</h2>
        <div className="grid grid-cols-3 gap-4">
          {recentFeedback.map((f) => (
            <div key={`${f.student}-${f.assignment}`} className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-600">
                {f.score}
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800">{f.student}</p>
                <p className="text-xs text-zinc-500">{f.assignment}</p>
                <p className="text-xs text-zinc-400">{f.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
