// 학생 — 과제 상세 · 제출 — 더미 UI 샘플

const assignment = {
  title: "6월 1주차 — 기후 위기와 우리의 책임",
  class: "중등 논술 A반",
  teacher: "김슈렉 선생님",
  issued: "2025-06-02",
  due: "2025-06-09",
  dday: "D-3",
  topic: "기후 위기와 우리의 책임",
  description: `다음 주제로 논술문을 작성하시오.

[주제] 기후 위기는 단순한 환경 문제가 아니라 인류의 생존과 직결된 사회적·도덕적 문제이다. 이에 대한 개인과 사회의 책임에 대해 자신의 견해를 논술하시오.

[작성 지침]
• 분량: 700자 이상 1,000자 이내
• 논술문 형식을 갖출 것 (서론·본론·결론)
• 자신의 견해와 그 근거를 명확히 제시할 것
• 구체적인 사례나 통계를 활용하면 좋음

[평가 기준]
① 논지의 명확성 (30점)
② 근거의 타당성 (30점)
③ 글의 구성과 전개 (20점)
④ 어휘와 문장력 (20점)`,
  status: "미제출",
};

const prevFeedback = {
  assignment: "5월 4주차 — 환경과 인간",
  score: 88,
  summary: "논지가 명확하고 근거 제시가 탄탄합니다. 결론 부분에서 주장을 한 번 더 강화하면 더욱 완성도 높은 글이 될 것 같습니다.",
  tags: [
    { type: "positive", label: "논지 명확" },
    { type: "positive", label: "근거 탄탄" },
    { type: "improve", label: "결론 강화" },
  ],
};

export default function StudentAssignmentDetailPage() {
  return (
    <div className="space-y-6 px-8 py-10">
      {/* 헤더 */}
      <div>
        <a href="/ui-sample/student" className="text-xs text-blue-600 hover:underline">← 대시보드</a>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{assignment.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">{assignment.dday}</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">미제출</span>
              <span className="text-xs text-zinc-400">{assignment.class} · 마감 {assignment.due}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 과제 안내 */}
        <div className="col-span-2 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-800">과제 안내</h2>
              <p className="mt-0.5 text-xs text-zinc-400">{assignment.teacher} · 출제일 {assignment.issued}</p>
            </div>
            <div className="px-6 py-5">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-zinc-700">
                {assignment.description}
              </pre>
            </div>
          </div>

          {/* 제출 폼 */}
          <div className="rounded-2xl border border-sky-200 bg-white shadow-sm">
            <div className="rounded-t-2xl border-b border-sky-100 bg-sky-50 px-6 py-4">
              <h2 className="text-sm font-semibold text-sky-800">내 답안 작성</h2>
              <p className="mt-0.5 text-xs text-sky-600">700자 이상 1,000자 이내로 작성해 주세요</p>
            </div>
            <div className="px-6 py-5 space-y-4">
              <textarea
                rows={14}
                placeholder="여기에 논술문을 작성하세요.&#10;&#10;서론: 문제 제기 및 주장&#10;본론: 근거와 사례&#10;결론: 주장 정리 및 강화"
                readOnly
                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-7 text-zinc-700 placeholder-zinc-300 outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-100"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">0 / 1000자</p>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                    임시 저장
                  </button>
                  <button className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-700">
                    최종 제출
                  </button>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                ⚠️ 최종 제출 후에는 수정이 불가합니다. 신중하게 제출해 주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 사이드 패널 */}
        <div className="space-y-4">
          {/* 일정 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">과제 일정</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">출제일</span>
                <span className="font-medium text-zinc-700">{assignment.issued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">마감일</span>
                <span className="font-bold text-red-600">{assignment.due}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">남은 시간</span>
                <span className="font-bold text-red-500">{assignment.dday}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-red-400" style={{ width: "57%" }} />
              </div>
              <p className="text-right text-[10px] text-zinc-400">기간의 57% 경과</p>
            </div>
          </div>

          {/* 작성 가이드 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">✍️ 작성 가이드</h3>
            <div className="space-y-2 text-xs text-zinc-600">
              <p>📌 <span className="font-medium">서론</span>: 주제를 명확히 제시하고 자신의 입장을 밝히세요</p>
              <p>📌 <span className="font-medium">본론</span>: 2–3가지 근거를 구체적 사례와 함께 제시하세요</p>
              <p>📌 <span className="font-medium">결론</span>: 본론 내용을 요약하고 주장을 강화하세요</p>
              <p className="mt-2 text-zinc-400">이전 피드백에서 <span className="text-amber-600 font-medium">결론 강화</span>가 언급되었습니다</p>
            </div>
          </div>

          {/* 이전 피드백 미리보기 */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-800">이전 과제 피드백</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                {prevFeedback.score}
              </div>
              <div>
                <p className="text-xs font-medium text-zinc-700">{prevFeedback.assignment}</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{prevFeedback.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {prevFeedback.tags.map((t) => (
                <span key={t.label} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  t.type === "positive" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {t.type === "positive" ? "👍" : "💡"} {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
