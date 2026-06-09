import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import StatCard from "@/src/components/student/StatCard";
import PortfolioItem from "@/src/components/student/PortfolioItem";
import { getStudentPortfolioByUserId } from "@/src/lib/student/portfolio";

export default async function StudentPortfolioPage() {
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

  const result = await getStudentPortfolioByUserId(user.id);
  const data = result.data;

  return (
    <StudentShell title="포트폴리오">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">포트폴리오 요약</h2>
        {!result.ok ? (
          <p className="mt-3 text-sm text-[#C03232]">
            포트폴리오 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : data.totalSubmissions === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">
            아직 포트폴리오에 표시할 제출물이 없습니다. 과제를 제출하면 여기에 자동으로 모입니다.
          </p>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <StatCard label="총 제출 수" value={`${data.totalSubmissions}건`} />
              <StatCard label="첨삭 완료 수" value={`${data.reviewedCount}건`} />
              <StatCard label="수정 제출 수" value={`${data.revisedCount}건`} />
            </div>

            <div className="rounded-xl border border-[#EAEDFA] p-3">
              <p className="text-xs font-semibold text-[#4A55A8]">대표 작품 후보</p>
              {data.representative ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-semibold text-[#06091F]">
                    {data.representative.assignmentTitle}
                  </p>
                  <p className="truncate text-xs text-[#6470BF]">
                    {data.representative.className}
                    {" · "}
                    제출{" "}
                    {data.representative.submittedAt
                      ? new Date(data.representative.submittedAt).toLocaleDateString("ko-KR")
                      : "-"}
                  </p>
                  <p className="text-sm text-[#4A55A8]">
                    평균 점수{" "}
                    <span className="font-semibold text-[#06091F]">
                      {data.representative.score === null ? "-" : `${data.representative.score}점`}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-[#6470BF]">
                  아직 대표 작품으로 표시할 첨삭 완료 답안이 없습니다.
                </p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-[#4A55A8]">제출물 목록</p>
              <div className="mt-2 space-y-2">
                {data.items.map((item) => (
                  <PortfolioItem
                    key={item.submissionId}
                    assignmentTitle={item.assignmentTitle}
                    className={item.className}
                    submittedAt={item.submittedAt}
                    reviewStatus={item.reviewStatus}
                    score={item.score}
                    previewText={item.previewText}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}

