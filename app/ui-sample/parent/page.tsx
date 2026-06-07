// 학부모 대시보드 — 더미 UI 샘플

const childInfo = {
  name: "박논술",
  school: "서울중학교 2학년",
  class: "중등 논술 A반",
  teacher: "김슈렉 선생님",
  enrolled: "2025-03-02",
  avgScore: 84,
  attendance: "100%",
};

const recentFeedback = [
  {
    assignment: "5월 4주차 — 환경과 인간",
    score: 88,
    date: "2025-06-03",
    summary: "논지가 명확하고 근거 제시가 탄탄합니다. 결론 강화를 권장합니다.",
    positive: ["논지 명확", "근거 탄탄"],
    improve: ["결론 강화"],
  },
  {
    assignment: "5월 3주차 — AI의 미래",
    score: 82,
    date: "2025-05-27",
    summary: "다양한 시각을 제시했습니다. 문단 전환이 급작스러운 부분을 보완하면 좋겠습니다.",
    positive: ["다양한 시각"],
    improve: ["문단 전환"],
  },
];

const upcomingDeadlines = [
  { title: "6월 1주차 과제", due: "2025-06-09", dday: "D-3", submitted: false },
  { title: "6월 2주차 과제", due: "2025-06-16", dday: "D-10", submitted: false },
];

const notices = [
  { title: "6월 모의고사 일정 안내", date: "2025-06-03", important: true },
  { title: "여름방학 집중반 모집", date: "2025-05-28", important: false },
  { title: "5월 성장 리포트 발송", date: "2025-05-25", important: false },
];

export default function ParentDashboardSample() {
  return (
    <div className="space-y-8 px-8 py-10">
      {/* 헤더 */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-pink-600">학부모</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">자녀 학습 현황</h1>
        <p className="mt-0.5 text-sm text-zinc-500">2025년 6월 6일 기준</p>
      </div>

      {/* 자녀 정보 카드 */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-3xl font-bold text-pink-600">
            박
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-zinc-900">{childInfo.name}</h2>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-700">학생</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">{childInfo.school} · {childInfo.class}</p>
            <p className="text-sm text-zinc-500">담당 강사: {childInfo.teacher}</p>
          </div>
          <a href="/ui-sample/parent/growth" className="rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700">
            성장 리포트 보기 →
          </a>
        </div>

        {/* 요약 지표 */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          {[
            { label: "이번달 평균", value: `${childInfo.avgScore}점`, color: "text-blue-600" },
            { label: "출석률", value: childInfo.attendance, color: "text-emerald-600" },
            { label: "제출 과제", value: "6건", color: "text-violet-600" },
            { label: "받은 피드백", value: "6건", color: "text-amber-600" },
          ].map((m) => (
            <div key={m.label} className="rounded-xl bg-zinc-50 p-4 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 최근 피드백 */}
        <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">최근 첨삭 피드백</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentFeedback.map((f) => (
              <div key={f.assignment} className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-600">
                    {f.score}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-semibold text-zinc-800">{f.assignment}</p>
                      <p className="text-xs text-zinc-400">{f.date}</p>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">{f.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.positive.map((t) => (
                        <span key={t} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                          👍 {t}
                        </span>
                      ))}
                      {f.improve.map((t) => (
                        <span key={t} className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          💡 {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 다가오는 마감 */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-zinc-800">다가오는 과제 마감</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {upcomingDeadlines.map((d) => (
                <div key={d.title} className="flex items-center gap-3 px-5 py-3.5">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                    d.dday === "D-3" ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
                  }`}>{d.dday}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-zinc-700">{d.title}</p>
                    <p className="text-xs text-zinc-400">{d.due}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    d.submitted ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {d.submitted ? "제출완료" : "미제출"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 학원 공지 */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-3.5">
              <h2 className="text-sm font-semibold text-zinc-800">학원 공지</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {notices.map((n) => (
                <div key={n.title} className="flex items-start gap-2 px-5 py-3.5">
                  {n.important && (
                    <span className="mt-0.5 shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      중요
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-zinc-700">{n.title}</p>
                    <p className="text-xs text-zinc-400">{n.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
