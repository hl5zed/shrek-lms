// 관리자 — 학생 목록 — 더미 UI 샘플

const students = [
  { id: "1", name: "박논술", school: "서울중학교", grade: "2학년", class: "중등 논술 A반", teacher: "김슈렉", joined: "2025-03-02", status: "활성", role: "학생" },
  { id: "2", name: "이글쓰기", school: "강남중학교", grade: "1학년", class: "중등 논술 B반", teacher: "이논술", joined: "2025-03-10", status: "활성", role: "학생" },
  { id: "3", name: "김독서", school: "분당초등학교", grade: "6학년", class: "초등 글쓰기 A반", teacher: "박글쓰기", joined: "2025-04-01", status: "휴강", role: "학생" },
  { id: "4", name: "최사고", school: "목동중학교", grade: "3학년", class: "중등 논술 A반", teacher: "김슈렉", joined: "2025-03-15", status: "활성", role: "학생" },
  { id: "5", name: "정표현", school: "마포중학교", grade: "1학년", class: "중등 논술 C반", teacher: "김슈렉", joined: "2025-04-10", status: "활성", role: "학생" },
  { id: "6", name: "오독서", school: "강동중학교", grade: "2학년", class: "중등 논술 B반", teacher: "이논술", joined: "2025-03-20", status: "활성", role: "학생" },
  { id: "7", name: "윤주장", school: "서초중학교", grade: "3학년", class: "고등 심화반", teacher: "김슈렉", joined: "2025-02-15", status: "활성", role: "학생" },
  { id: "8", name: "임근거", school: "용산중학교", grade: "1학년", class: "초등 글쓰기 B반", teacher: "박글쓰기", joined: "2025-05-01", status: "활성", role: "학생" },
];

export default function AdminStudentsPage() {
  return (
    <div className="space-y-6 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">관리자</p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900">학생 목록</h1>
          <p className="mt-0.5 text-sm text-zinc-500">전체 {students.length}명 등록</p>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
          + 학생 등록
        </button>
      </div>

      {/* 검색 + 필터 바 */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">🔍</span>
          <input
            type="text"
            placeholder="이름, 학교로 검색..."
            readOnly
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
        <select className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-blue-500">
          <option>전체 반</option>
          <option>중등 논술 A반</option>
          <option>중등 논술 B반</option>
          <option>중등 논술 C반</option>
          <option>초등 글쓰기 A반</option>
          <option>고등 심화반</option>
        </select>
        <select className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-blue-500">
          <option>전체 상태</option>
          <option>활성</option>
          <option>휴강</option>
          <option>탈퇴</option>
        </select>
        <select className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-blue-500">
          <option>전체 강사</option>
          <option>김슈렉</option>
          <option>이논술</option>
          <option>박글쓰기</option>
        </select>
      </div>

      {/* 요약 배지 */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "전체", count: 8, active: true },
          { label: "활성", count: 7 },
          { label: "휴강", count: 1 },
        ].map((f) => (
          <button key={f.label} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            f.active ? "bg-blue-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}>
            {f.label} {f.count}
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <tr>
              {["이름", "학교·학년", "수강반", "담당 강사", "등록일", "상태", "관리"].map((h) => (
                <th key={h} className="px-5 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-50 transition">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {s.name[0]}
                    </div>
                    <span className="font-medium text-zinc-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-zinc-500">{s.school} {s.grade}</td>
                <td className="px-5 py-4 text-zinc-700">{s.class}</td>
                <td className="px-5 py-4 text-zinc-600">{s.teacher}</td>
                <td className="px-5 py-4 text-zinc-400 text-xs">{s.joined}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    s.status === "활성" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}>{s.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    <button className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50">
                      상세
                    </button>
                    <button className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50">
                      편집
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3.5">
          <p className="text-xs text-zinc-400">1–8 / 전체 42명</p>
          <div className="flex gap-1">
            {["←", "1", "2", "3", "4", "5", "→"].map((p) => (
              <button key={p} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                p === "1" ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-zinc-100"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
