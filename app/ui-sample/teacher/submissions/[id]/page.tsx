// 강사 — 첨삭 상세 — 더미 UI 샘플

const submission = {
  student: "박논술",
  school: "서울중학교 2학년",
  class: "중등 논술 A반",
  assignment: "5월 4주차 — 환경과 인간",
  due: "2025-06-06",
  submitted: "2025-06-04 14:22",
  wordCount: 842,
  essay: `환경 문제는 현대 사회에서 가장 중요한 과제 중 하나이다. 산업 혁명 이후 급격한 경제 발전은 인류에게 풍요로운 삶을 가져다 주었지만, 동시에 환경 파괴라는 심각한 부작용을 낳았다.

지구온난화, 미세먼지, 해양 오염 등의 문제는 더 이상 미래의 이야기가 아니다. 우리는 이미 그 피해를 눈으로 목격하고 있으며, 이에 대한 즉각적인 대처가 필요하다.

첫째, 개인의 노력이 중요하다. 분리수거를 철저히 하고, 대중교통을 이용하며, 에너지 절약을 생활화해야 한다. 작은 실천이 모여 큰 변화를 만들 수 있다.

둘째, 기업의 사회적 책임이 강화되어야 한다. 친환경 생산 방식을 도입하고, 탄소 배출량을 줄이는 노력을 해야 한다. 정부의 규제도 강화될 필요가 있다.

셋째, 국제적인 협력이 필수적이다. 환경 문제는 국경을 넘어서는 문제이기 때문에, 전 세계가 하나 되어 함께 해결해야 한다.

결론적으로, 환경 문제는 개인, 기업, 정부, 국제 사회 모두가 함께 노력해야 해결할 수 있다. 우리 세대의 결정이 미래 세대의 삶을 결정할 것이다.`,
};

const previousFeedback = [
  { assignment: "5월 3주차 — AI의 미래", score: 82, date: "2025-05-27", summary: "다양한 시각 제시. 문단 전환 보완 필요." },
  { assignment: "5월 2주차 — 민주주의", score: 79, date: "2025-05-20", summary: "개념 이해 충분. 의견 더 적극적으로 표현해야." },
];

const feedbackTags = [
  "논지 명확", "근거 탄탄", "구성 양호", "어휘 풍부",
  "문단 전환 보완", "결론 강화", "더 구체적인 예시", "의견 표현 강화",
];

export default function TeacherSubmissionDetailPage() {
  return (
    <div className="space-y-6 px-8 py-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <a href="/ui-sample/teacher/submissions" className="text-xs text-blue-600 hover:underline">
            ← 첨삭 목록
          </a>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">{submission.assignment}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">미채점</span>
            <span className="text-xs text-zinc-400">{submission.class} · {submission.wordCount}자 · {submission.submitted} 제출</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 학생 글 */}
        <div className="col-span-2 space-y-4">
          {/* 학생 정보 */}
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              박
            </div>
            <div>
              <p className="font-semibold text-zinc-900">{submission.student}</p>
              <p className="text-xs text-zinc-500">{submission.school} · {submission.class}</p>
            </div>
            <div className="ml-auto text-right text-xs text-zinc-400">
              <p>마감 {submission.due}</p>
              <p>제출 {submission.submitted}</p>
            </div>
          </div>

          {/* 에세이 */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-800">학생 글 ({submission.wordCount}자)</h2>
            </div>
            <div className="px-6 py-5">
              <div className="max-h-[420px] overflow-y-auto rounded-xl bg-zinc-50 p-5 text-sm leading-8 text-zinc-700 whitespace-pre-line">
                {submission.essay}
              </div>
            </div>
          </div>

          {/* 이전 피드백 */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-zinc-800">이전 피드백 이력</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {previousFeedback.map((f) => (
                <div key={f.assignment} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                    {f.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">{f.assignment}</p>
                    <p className="text-xs text-zinc-500">{f.summary}</p>
                  </div>
                  <p className="ml-auto text-xs text-zinc-400">{f.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 첨삭 입력 */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-violet-200 bg-white shadow-sm">
            <div className="border-b border-violet-100 bg-violet-50 px-6 py-4 rounded-t-2xl">
              <h2 className="text-sm font-semibold text-violet-800">첨삭 작성</h2>
            </div>
            <div className="space-y-4 p-5">
              {/* 점수 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">점수 (0–100)</label>
                <input
                  type="number"
                  defaultValue={88}
                  min={0} max={100}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
                />
              </div>

              {/* 총평 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">총평</label>
                <textarea
                  rows={5}
                  defaultValue="논지가 명확하고 근거 제시가 탄탄합니다. 결론 부분에서 주장을 한 번 더 강화하면 더욱 완성도 높은 글이 될 것 같습니다. 전체적으로 구성이 잘 되어 있습니다."
                  className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100"
                />
              </div>

              {/* 잘한 점 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">잘한 점 태그</label>
                <div className="flex flex-wrap gap-1.5">
                  {feedbackTags.slice(0, 4).map((t) => (
                    <button key={t} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 개선점 */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">개선 필요 태그</label>
                <div className="flex flex-wrap gap-1.5">
                  {feedbackTags.slice(4).map((t) => (
                    <button key={t} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 hover:bg-amber-200">
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* 선택된 태그 미리보기 */}
              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="mb-2 text-[11px] font-semibold text-zinc-500">선택된 태그</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">👍 논지 명확</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700">👍 근거 탄탄</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">💡 결론 강화</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                  피드백 저장
                </button>
                <button className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                  임시 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
