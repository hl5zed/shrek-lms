// 관리자 대시보드 — 더미 UI 샘플

const stats = [
  { label: "전체 학생", value: "42명", delta: "이번달 +3", color: "text-blue-600", bg: "bg-blue-50" },
  { label: "소속 강사", value: "5명", delta: "정규 4 · 보조 1", color: "text-violet-600", bg: "bg-violet-50" },
  { label: "운영중인 반", value: "6개", delta: "요일별 편성", color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "이번달 과제", value: "28건", delta: "완료율 71%", color: "text-amber-600", bg: "bg-amber-50" },
];

const recentStudents = [
  { name: "박논술", school: "서울중 2학년", class: "중등 A", joined: "2025-05-28", status: "활성" },
  { name: "이글쓰기", school: "강남중 1학년", class: "중등 B", joined: "2025-05-20", status: "활성" },
  { name: "김독서", school: "분당초 6학년", class: "초등", joined: "2025-05-15", status: "휴강" },
  { name: "최사고", school: "목동중 3학년", class: "중등 A", joined: "2025-05-10", status: "활성" },
  { name: "정표현", school: "마포중 1학년", class: "중등 C", joined: "2025-05-05", status: "활성" },
];

const quickActions = [
  { label: "학생 등록", icon: "👤", desc: "새 학생 계정을 생성합니다" },
  { label: "강의반 개설", icon: "📚", desc: "새 반을 만들고 강사를 배정합니다" },
  { label: "공지 작성", icon: "📢", desc: "전체 사용자에게 공지를 보냅니다" },
  { label: "데이터 내보내기", icon: "📊", desc: "학생·과제 데이터를 CSV로 내보냅니다" },
];

export default function AdminDashboardSample() {
  return (
    <div className="space-y-8 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">관리자</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">운영 대시보드</h1>
          <p className="mt-0.5 text-sm text-zinc-500">2025년 6월 6일 (금) · 슈렉샘 논술학원</p>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          + 학생 등록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${s.bg}`}>
              <div className="h-4 w-4 rounded-sm bg-current opacity-60" style={{ color: s.color.replace("text-", "") }} />
            </div>
            <p className="text-xs font-medium text-zinc-500">{s.label}</p>
            <p className={`mt-0.5 text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 최근 등록 학생 테이블 */}
        <div className="col-span-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">최근 등록 학생</h2>
            <a href="/ui-sample/admin/students" className="text-xs text-blue-600 hover:underline">
              전체 보기 →
            </a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                {["이름", "학교·학년", "수강반", "등록일", "상태"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentStudents.map((s) => (
                <tr key={s.name} className="hover:bg-zinc-50">
                  <td className="px-5 py-3.5 font-medium text-zinc-900">{s.name}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{s.school}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{s.class}</td>
                  <td className="px-5 py-3.5 text-zinc-400 text-xs">{s.joined}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.status === "활성" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 빠른 작업 */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-zinc-800">빠른 작업</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {quickActions.map((a) => (
              <button
                key={a.label}
                className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-zinc-50 transition"
              >
                <span className="mt-0.5 text-xl">{a.icon}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-800">{a.label}</p>
                  <p className="text-xs text-zinc-400">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 반 현황 요약 */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-zinc-800">반 현황</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "중등 논술 A반", teacher: "김슈렉", students: 8, day: "월·수", time: "16:00", prog: 75 },
            { name: "중등 논술 B반", teacher: "이논술", students: 7, day: "화·목", time: "17:00", prog: 60 },
            { name: "중등 논술 C반", teacher: "김슈렉", students: 6, day: "토", time: "10:00", prog: 45 },
            { name: "초등 글쓰기 A", teacher: "박글쓰기", students: 9, day: "월·목", time: "15:00", prog: 80 },
            { name: "초등 글쓰기 B", teacher: "박글쓰기", students: 7, day: "화·금", time: "16:00", prog: 55 },
            { name: "고등 심화반", teacher: "이논술", students: 5, day: "수·토", time: "18:00", prog: 30 },
          ].map((c) => (
            <div key={c.name} className="rounded-xl border border-zinc-100 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-800">{c.name}</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">진행중</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{c.teacher} · {c.day} {c.time}</p>
              <p className="mt-1 text-xs text-zinc-400">{c.students}명</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${c.prog}%` }} />
              </div>
              <p className="mt-1 text-right text-[10px] text-zinc-400">진도 {c.prog}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
