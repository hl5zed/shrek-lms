import { createClient } from "@/lib/supabase/server";

// 학부모 자녀 성장 추이 — 첨삭별 5개 영역 점수를 시간순으로 표시합니다.
export default async function ParentGrowthPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 연결된 자녀 목록
  const { data: parentStudents } = await supabase
    .from("parent_students")
    .select("profiles!student_id ( id, name )")
    .eq("parent_id", user!.id);

  const children = (parentStudents ?? [])
    .map((r) => r.profiles as unknown as { id: string; name: string } | null)
    .filter(Boolean) as { id: string; name: string }[];

  type FeedbackRow = {
    id: string;
    score_reading: number;
    score_thinking: number;
    score_logic: number;
    score_structure: number;
    score_expression: number;
    created_at: string;
    assignmentTitle: string;
  };

  // 자녀별 첨삭 점수 이력 수집
  const childData = await Promise.all(
    children.map(async (child) => {
      const { data: raw } = await supabase
        .from("feedbacks")
        .select(`
          id,
          score_reading,
          score_thinking,
          score_logic,
          score_structure,
          score_expression,
          created_at,
          submissions!inner (
            student_id,
            assignments ( title )
          )
        `)
        .eq("submissions.student_id", child.id)
        .order("created_at", { ascending: true });

      // Supabase 반환 타입을 명확한 타입으로 변환합니다.
      const feedbacks: FeedbackRow[] = (raw ?? []).map((f) => {
        const anyF = f as Record<string, unknown>;
        const subs = anyF["submissions"] as { assignments: { title: string }[] | { title: string } | null } | null;
        const asgnRaw = subs?.assignments;
        const asgnTitle = Array.isArray(asgnRaw)
          ? (asgnRaw[0]?.title ?? "—")
          : ((asgnRaw as { title: string } | null)?.title ?? "—");
        return {
          id: anyF["id"] as string,
          score_reading: (anyF["score_reading"] as number) ?? 0,
          score_thinking: (anyF["score_thinking"] as number) ?? 0,
          score_logic: (anyF["score_logic"] as number) ?? 0,
          score_structure: (anyF["score_structure"] as number) ?? 0,
          score_expression: (anyF["score_expression"] as number) ?? 0,
          created_at: anyF["created_at"] as string,
          assignmentTitle: asgnTitle,
        };
      });

      return { child, feedbacks };
    })
  );

  const scoreLabels = [
    { key: "score_reading", label: "독해력", color: "bg-blue-500" },
    { key: "score_thinking", label: "사고력", color: "bg-purple-500" },
    { key: "score_logic", label: "논리력", color: "bg-orange-500" },
    { key: "score_structure", label: "구성력", color: "bg-green-500" },
    { key: "score_expression", label: "표현력", color: "bg-pink-500" },
  ];

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">성장 추이</h1>
        <p className="mt-1 text-sm text-zinc-500">자녀의 영역별 점수 변화를 확인합니다.</p>
      </div>

      {children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
        </div>
      ) : (
        childData.map(({ child, feedbacks }) => (
          <section key={child.id} className="mb-12">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
                {child.name.charAt(0)}
              </div>
              <h2 className="text-base font-semibold text-zinc-800">{child.name}</h2>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-sm text-zinc-400">아직 첨삭 기록이 없습니다.</p>
            ) : (
              <>
                {/* 평균 점수 요약 카드 */}
                <div className="mb-6 grid grid-cols-5 gap-3">
                  {scoreLabels.map((sl) => {
                    const avg =
                      feedbacks.reduce(
                        (sum, f) => sum + (f[sl.key as keyof typeof f] as number),
                        0
                      ) / feedbacks.length;
                    return (
                      <div
                        key={sl.key}
                        className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm"
                      >
                        <div className={`mx-auto mb-2 h-1.5 w-8 rounded-full ${sl.color}`} />
                        <p className="text-2xl font-bold text-zinc-900">{avg.toFixed(1)}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{sl.label}</p>
                      </div>
                    );
                  })}
                </div>

                {/* 회차별 점수 테이블 */}
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 bg-zinc-50">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">과제</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">날짜</th>
                        {scoreLabels.map((sl) => (
                          <th key={sl.key} className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {sl.label}
                          </th>
                        ))}
                        <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">합계</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {[...feedbacks].reverse().map((f) => {
                        const scores = scoreLabels.map(
                          (sl) => f[sl.key as keyof typeof f] as number
                        );
                        const total = scores.reduce((a, b) => a + b, 0);
                        return (
                          <tr key={f.id} className="transition hover:bg-zinc-50">
                            <td className="px-4 py-3 text-zinc-700">{f.assignmentTitle}</td>
                            <td className="px-4 py-3 text-zinc-400">
                              {new Date(f.created_at).toLocaleDateString("ko-KR")}
                            </td>
                            {scores.map((score, i) => (
                              <td key={i} className="px-4 py-3 text-center">
                                <ScoreDot score={score} />
                              </td>
                            ))}
                            <td className="px-4 py-3 text-center font-bold text-zinc-900">
                              {total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        ))
      )}
    </div>
  );
}

function ScoreDot({ score }: { score: number }) {
  const colorMap: Record<number, string> = {
    1: "text-red-500",
    2: "text-orange-500",
    3: "text-amber-500",
    4: "text-blue-500",
    5: "text-green-600",
  };
  return (
    <span className={`font-semibold ${colorMap[score] ?? "text-zinc-400"}`}>
      {score}
    </span>
  );
}
