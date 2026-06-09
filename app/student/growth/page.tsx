import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StatCard from "@/src/components/student/StatCard";
import StudentCard from "@/src/components/student/StudentCard";
import FeedbackScoreGrid from "@/src/components/student/FeedbackScoreGrid";
import { getStudentGrowthSummaryByUserId } from "@/src/lib/student/growth";

export default async function StudentGrowthPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    redirect("/login");
  }

  const result = await getStudentGrowthSummaryByUserId(user.id);
  const summary = result.summary;
  const hasAnyScore =
    summary.readingAvg !== null ||
    summary.thinkingAvg !== null ||
    summary.logicAvg !== null ||
    summary.structureAvg !== null ||
    summary.expressionAvg !== null;

  return (
    <StudentShell title="성장 리포트">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">성장 요약</h2>

        {!result.ok ? (
          <p className="mt-3 text-sm text-[#C03232]">
            성장 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : summary.totalSubmissions === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">
            아직 제출한 과제가 없습니다. 과제를 제출하면 성장 리포트가 자동으로 채워집니다.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="총 제출 수" value={`${summary.totalSubmissions}건`} />
              <StatCard label="첨삭 완료 수" value={`${summary.reviewedCount}건`} />
              <StatCard
                label="평균 점수"
                value={summary.averageScore === null ? "-" : `${summary.averageScore.toFixed(1)}점`}
              />
              <StatCard
                label="최근 제출일"
                value={
                  summary.recentSubmittedAt
                    ? new Date(summary.recentSubmittedAt).toLocaleDateString("ko-KR")
                    : "-"
                }
              />
            </div>

            <div className="rounded-xl border border-[#EAEDFA] p-3">
              <p className="text-xs font-semibold text-[#4A55A8]">최근 첨삭 업데이트</p>
              <p className="mt-1 text-sm text-[#06091F]">
                {summary.recentFeedbackAt
                  ? new Date(summary.recentFeedbackAt).toLocaleString("ko-KR")
                  : "첨삭 이력이 없습니다."}
              </p>
            </div>

            {!hasAnyScore ? (
              <p className="text-sm text-[#6470BF]">아직 성장 데이터를 계산할 첨삭 결과가 없습니다.</p>
            ) : (
              <FeedbackScoreGrid
                reading={summary.readingAvg}
                thinking={summary.thinkingAvg}
                logic={summary.logicAvg}
                structure={summary.structureAvg}
                expression={summary.expressionAvg}
              />
            )}
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}

