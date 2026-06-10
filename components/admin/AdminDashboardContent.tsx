import Card from "@/components/ui/Card";
import StatCard from "@/components/lms/StatCard";
import Button from "@/components/ui/Button";
import Link from "next/link";

export type AdminDashboardData = {
  studentCount: number;
  pendingFeedbackCount: number;
  weeklySubmissionRate: number;
  pendingFeedbackItems: Array<{
    id: string;
    studentName: string;
    assignmentTitle: string;
    elapsedLabel: string;
    urgency: "일반" | "높음";
  }>;
};

type AdminDashboardContentProps = {
  data: AdminDashboardData;
};

export default function AdminDashboardContent({ data }: AdminDashboardContentProps) {
  return (
    <section className="space-y-3 md:space-y-4">
      <div className="mb-1 flex flex-col items-start justify-between gap-2 sm:flex-row">
        <div>
          <h3 className="text-base font-bold text-[var(--color-neutral-1000)]">안녕하세요, 관리자님</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-400)]">
            전체 학생 {data.studentCount}명 · 첨삭 대기 {data.pendingFeedbackCount}건
          </p>
        </div>
        <Button asChild variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">
          <Link href="/admin/students/new">학생 추가</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="전체 학생" value={String(data.studentCount)} delta="실데이터 연동" tone="primary" />
        <StatCard
          label="첨삭 대기"
          value={String(data.pendingFeedbackCount)}
          delta={data.pendingFeedbackCount > 0 ? "우선 확인 필요" : "대기 없음"}
          tone={data.pendingFeedbackCount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="이번주 과제 제출률"
          value={`${data.weeklySubmissionRate}%`}
          delta="실데이터 연동"
          tone={data.weeklySubmissionRate >= 70 ? "success" : "warning"}
        />
        <StatCard label="출석률" value="—" delta="데이터 준비 중" tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="rounded-[var(--lms-rl)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">관리 필요 학생</h3>
            <Button asChild variant="ghost" className="h-6 rounded-[var(--lms-r)] px-2 text-[11px]">
              <Link href="/admin/students">전체보기</Link>
            </Button>
          </div>
          <p className="rounded-[var(--lms-r)] bg-[var(--color-neutral-50)] px-3 py-2 text-[11px] text-[var(--color-neutral-500)]">
            관리 필요 학생 데이터는 준비 중입니다.
          </p>
        </Card>

        <Card className="rounded-[var(--lms-rl)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">오늘의 첨삭 대기</h3>
            <Button asChild variant="ghost" className="h-6 rounded-[var(--lms-r)] px-2 text-[11px]">
              <Link href="/teacher/submissions">첨삭 화면으로</Link>
            </Button>
          </div>
          {data.pendingFeedbackItems.length === 0 ? (
            <p className="rounded-[var(--lms-r)] bg-[var(--color-neutral-50)] px-3 py-2 text-[11px] text-[var(--color-neutral-500)]">
              첨삭 대기 항목이 없습니다.
            </p>
          ) : (
            <div className="space-y-1">
              {data.pendingFeedbackItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/teacher/submissions/${item.id}`}
                  className="flex items-center gap-2 border-b border-[var(--color-neutral-100)] py-1.5 transition hover:bg-[var(--color-neutral-50)] last:border-b-0"
                >
                  <div
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.urgency === "높음" ? "bg-[var(--lms-er)]" : "bg-[var(--color-neutral-300)]"}`}
                  />
                  <p className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-neutral-800)]">
                    {item.studentName} · {item.assignmentTitle}
                  </p>
                  <p
                    className={`text-[10px] font-bold ${
                      item.urgency === "높음" ? "text-[var(--lms-er)]" : "text-[var(--color-neutral-400)]"
                    }`}
                  >
                    {item.elapsedLabel}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="rounded-[var(--lms-rl)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">이번주 수업 일정</h3>
          <span className="text-[10px] text-[var(--color-neutral-400)]">데이터 준비 중</span>
        </div>
        <p className="rounded-[var(--lms-r)] bg-[var(--color-neutral-50)] px-3 py-2 text-[11px] text-[var(--color-neutral-500)]">
          수업 일정 데이터는 준비 중입니다.
        </p>
      </Card>
    </section>
  );
}
