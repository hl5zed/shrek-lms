// 강사 — 첨삭 목록 — 더미 UI 샘플

const submissions = [
  { id: "1", student: "박논술", assignment: "5월 4주차 — 환경과 인간", submitted: "2025-06-04 14:22", status: "미채점", wordCount: 842, class: "중등 A" },
  { id: "2", student: "이글쓰기", assignment: "5월 4주차 — 환경과 인간", submitted: "2025-06-04 16:05", status: "미채점", wordCount: 776, class: "중등 A" },
  { id: "3", student: "최사고", assignment: "5월 3주차 — AI의 미래", submitted: "2025-05-28 11:30", status: "미채점", wordCount: 910, class: "중등 A" },
  { id: "4", student: "정표현", assignment: "5월 3주차 — AI의 미래", submitted: "2025-05-27 19:45", status: "미채점", wordCount: 688, class: "중등 C" },
  { id: "5", student: "김논리", assignment: "5월 2주차 — 민주주의란 무엇인가", submitted: "2025-05-19 20:11", status: "미채점", wordCount: 754, class: "중등 A" },
  { id: "6", student: "오독서", assignment: "5월 1주차 — 독서의 가치", submitted: "2025-05-13 15:00", status: "채점완료", wordCount: 820, class: "중등 B", score: 88 },
  { id: "7", student: "윤주장", assignment: "4월 4주차 — 환경 문제", submitted: "2025-05-06 13:22", status: "채점완료", wordCount: 932, class: "고등", score: 92 },
  { id: "8", student: "임근거", assignment: "4월 4주차 — 환경 문제", submitted: "2025-05-05 21:30", status: "채점완료", wordCount: 701, class: "중등 B", score: 76 },
];

const tabs = ["전체", "미채점", "채점완료"];

export default function TeacherSubmissionsPage() {
  const pending = submissions.filter((s) => s.status === "미채점").length;
  const done = submissions.filter((s) => s.status === "채점완료").length;

  return (
    <div className="space-y-6 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">강사</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">첨삭 목록</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            미채점 <span className="font-semibold text-amber-600">{pending}건</span> · 채점완료 {done}건
          </p>
        </div>
      </div>

      {/* 탭 + 필터 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          {tabs.map((t, i) => (
            <button key={t} className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
              i === 0 ? "bg-violet-600 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-50"
            }`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <select className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none">
            <option>전체 반</option>
            <option>중등 논술 A반</option>
            <option>중등 논술 C반</option>
            <option>고등 심화반</option>
          </select>
          <select className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none">
            <option>전체 과제</option>
            <option>5월 4주차</option>
            <option>5월 3주차</option>
          </select>
        </div>
      </div>

      {/* 미채점 섹션 */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          미채점
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{pending}</span>
        </h2>
        <div className="space-y-2">
          {submissions.filter((s) => s.status === "미채점").map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm hover:border-violet-200 hover:shadow-md transition">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-base font-bold text-violet-700">
                {s.student[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-900">{s.student}</p>
                <p className="truncate text-sm text-zinc-500">{s.assignment}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-zinc-400">{s.submitted}</p>
                <p className="text-xs text-zinc-500">{s.wordCount}자 · {s.class}반</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                미채점
              </span>
              <a
                href={`/ui-sample/teacher/submissions/${s.id}`}
                className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition"
              >
                채점하기
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 채점완료 섹션 */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">채점완료</h2>
        <div className="space-y-2">
          {submissions.filter((s) => s.status === "채점완료").map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white px-5 py-4 opacity-80 hover:opacity-100 transition">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">
                {s.score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-700">{s.student}</p>
                <p className="truncate text-sm text-zinc-400">{s.assignment}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-zinc-400">{s.submitted}</p>
                <p className="text-xs text-zinc-400">{s.wordCount}자 · {s.class}반</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                채점완료
              </span>
              <a
                href={`/ui-sample/teacher/submissions/${s.id}`}
                className="shrink-0 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
              >
                다시 보기
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
