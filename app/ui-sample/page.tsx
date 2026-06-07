// 논술마루 LMS — 디자인 시스템 갤러리 (정적 샘플)

export default function DesignSystemPage() {
  return (
    <div className="space-y-12 px-8 py-10">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">논술마루 디자인 시스템</h1>
        <p className="mt-1 text-sm text-zinc-500">
          실제 구현 시 참고할 공통 컴포넌트 및 스타일 기준
        </p>
      </header>

      {/* ── 색상 팔레트 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">색상 팔레트</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Blue 600", cls: "bg-blue-600", text: "text-white" },
            { name: "Blue 100", cls: "bg-blue-100", text: "text-blue-700" },
            { name: "Zinc 900", cls: "bg-zinc-900", text: "text-white" },
            { name: "Zinc 700", cls: "bg-zinc-700", text: "text-white" },
            { name: "Zinc 200", cls: "bg-zinc-200", text: "text-zinc-700" },
            { name: "Zinc 50", cls: "bg-zinc-50 border border-zinc-200", text: "text-zinc-500" },
            { name: "Emerald 500", cls: "bg-emerald-500", text: "text-white" },
            { name: "Amber 400", cls: "bg-amber-400", text: "text-white" },
            { name: "Red 500", cls: "bg-red-500", text: "text-white" },
          ].map((c) => (
            <div key={c.name} className={`flex h-14 w-28 items-end rounded-xl p-2 ${c.cls}`}>
              <span className={`text-[10px] font-medium ${c.text}`}>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 버튼 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">버튼</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Primary
          </button>
          <button className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Secondary
          </button>
          <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
            Dark
          </button>
          <button className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
            Danger
          </button>
          <button className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
            Success
          </button>
          <button disabled className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-400 cursor-not-allowed">
            Disabled
          </button>
          <button className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50">
            Outline
          </button>
          <button className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800">
            Text Link
          </button>
        </div>
      </section>

      {/* ── 배지 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">상태 배지</h2>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "제출완료", cls: "bg-emerald-100 text-emerald-700" },
            { label: "미제출", cls: "bg-zinc-100 text-zinc-600" },
            { label: "채점중", cls: "bg-amber-100 text-amber-700" },
            { label: "피드백 완료", cls: "bg-blue-100 text-blue-700" },
            { label: "기간초과", cls: "bg-red-100 text-red-600" },
            { label: "진행중", cls: "bg-indigo-100 text-indigo-700" },
            { label: "강사", cls: "bg-violet-100 text-violet-700" },
            { label: "학생", cls: "bg-sky-100 text-sky-700" },
            { label: "학부모", cls: "bg-pink-100 text-pink-700" },
            { label: "관리자", cls: "bg-zinc-800 text-zinc-100" },
          ].map((b) => (
            <span key={b.label} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── 카드 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">카드 / 통계 박스</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { title: "전체 학생", value: "42명", delta: "+3 이번달", color: "text-blue-600" },
            { title: "진행중인 반", value: "6개", delta: "수요일 기준", color: "text-emerald-600" },
            { title: "미채점 제출", value: "11건", delta: "빠른 처리 필요", color: "text-amber-600" },
            { title: "이번달 과제", value: "28건", delta: "완료율 71%", color: "text-violet-600" },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium text-zinc-500">{c.title}</p>
              <p className={`mt-1 text-3xl font-bold ${c.color}`}>{c.value}</p>
              <p className="mt-1 text-xs text-zinc-400">{c.delta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 테이블 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">테이블</h2>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                {["이름", "학교", "수강반", "등록일", "상태"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { name: "박논술", school: "서울중학교", class: "중등 논술 A", date: "2025-03-02", status: "진행중" },
                { name: "이글쓰기", school: "강남중학교", class: "중등 논술 B", date: "2025-03-10", status: "진행중" },
                { name: "김독서", school: "분당중학교", class: "초등 글쓰기", date: "2025-04-01", status: "휴강" },
              ].map((r) => (
                <tr key={r.name} className="hover:bg-zinc-50">
                  <td className="px-5 py-3.5 font-medium text-zinc-900">{r.name}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{r.school}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{r.class}</td>
                  <td className="px-5 py-3.5 text-zinc-500">{r.date}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      r.status === "진행중" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 폼 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">폼 입력 요소</h2>
        <div className="grid max-w-xl grid-cols-1 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">텍스트 입력</label>
            <input
              type="text"
              placeholder="예: 박논술"
              defaultValue=""
              readOnly
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">드롭다운</label>
            <select className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100">
              <option>중등 논술 A반</option>
              <option>중등 논술 B반</option>
              <option>초등 글쓰기반</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">장문 텍스트</label>
            <textarea
              rows={4}
              readOnly
              placeholder="학생의 글쓰기 내용을 여기에 입력합니다..."
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100 resize-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">오류 상태</label>
            <input
              type="text"
              defaultValue="잘못된 값"
              readOnly
              className="w-full rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700 outline-none"
            />
            <p className="mt-1 text-xs text-red-500">이 필드는 필수입니다.</p>
          </div>
        </div>
      </section>

      {/* ── 빈 상태 / 로딩 ── */}
      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-700">빈 상태 · 로딩 · 오류</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Empty */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white py-10 text-center">
            <div className="mb-3 text-4xl">📂</div>
            <p className="text-sm font-medium text-zinc-700">등록된 항목이 없습니다</p>
            <p className="mt-1 text-xs text-zinc-400">첫 번째 항목을 추가해 보세요</p>
            <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              + 항목 추가
            </button>
          </div>
          {/* Loading */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white py-10">
            <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600" />
            <p className="text-sm text-zinc-500">불러오는 중...</p>
          </div>
          {/* Error */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-10 text-center">
            <div className="mb-3 text-4xl">⚠️</div>
            <p className="text-sm font-medium text-red-700">데이터를 불러올 수 없습니다</p>
            <p className="mt-1 text-xs text-red-400">잠시 후 다시 시도해 주세요</p>
            <button className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
              다시 시도
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
