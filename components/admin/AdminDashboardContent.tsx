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
    <section className="space-y-4">
      {/* 웰컴 배너 */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-5 text-white shadow-lg shadow-indigo-200/50">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-16 h-20 w-20 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold">안녕하세요, 관리자님 👋</h3>
            <p className="mt-0.5 text-[11px] text-indigo-100">
              전체 학생 {data.studentCount}명 · 첨삭 대기 {data.pendingFeedbackCount}건
            </p>
          </div>
          <Button
            asChild
            className="w-fit rounded-xl border-0 bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30"
          >
            <Link href="/admin/students/new">+ 학생 추가</Link>
          </Button>
        </div>
      </div>

      {/* 통계 카드 — 모바일 2열, 데스크탑 4열 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="전체 학생" value={String(data.studentCount)} delta="실데이터 연동" tone="primary" />
        <StatCard
          label="첨삭 대기"
          value={String(data.pendingFeedbackCount)}
          delta={data.pendingFeedbackCount > 0 ? "우선 확인 필요" : "대기 없음"}
          tone={data.pendingFeedbackCount > 0 ? "warning" : "success"}
        />
        <StatCard
          label="이번주 제출률"
          value={`${data.weeklySubmissionRate}%`}
          delta="실데이터 연동"
          tone={data.weeklySubmissionRate >= 70 ? "success" : "warning"}
        />
        <StatCard label="출석률" value="—" delta="데이터 준비 중" tone="danger" />
      </div>

      {/* 관리 카드 — 모바일 1열, 태블릿+ 2열 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="rounded-2xl p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">관리 필요 학생</h3>
              <p className="text-[10px] text-[var(--color-neutral-400)]">즉각 조치가 필요한 학생</p>
            </div>
            <Button asChild variant="ghost" className="h-7 rounded-lg px-2.5 text-[11px]">
              <Link href="/admin/students">전체보기 →</Link>
            </Button>
          </div>
          <div className="rounded-xl bg-[var(--color-neutral-50)] px-3 py-3 text-[11px] text-[var(--color-neutral-500)]">
            관리 필요 학생 데이터는 준비 중입니다.
          </div>
        </Card>

        <Card className="rounded-2xl p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">오늘의 첨삭 대기</h3>
              <p className="text-[10px] text-[var(--color-neutral-400)]">미완료 첨삭 목록</p>
            </div>
            <Button asChild variant="ghost" className="h-7 rounded-lg px-2.5 text-[11px]">
              <Link href="/teacher/submissions">첨삭 화면 →</Link>
            </Button>
          </div>
          {data.pendingFeedbackItems.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-3">
              <span className="text-sm">✅</span>
              <p className="text-[11px] font-medium text-emerald-700">첨삭 대기 항목이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-neutral-100)]">
              {data.pendingFeedbackItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/teacher/submissions/${item.id}`}
                  className="-mx-1 flex items-center gap-2.5 rounded-lg px-1 py-2 transition hover:bg-[var(--color-neutral-50)]"
                >
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      item.urgency === "높음"
                        ? "bg-red-500 shadow-sm shadow-red-300"
                        : "bg-zinc-300"
                    }`}
                  />
                  <p className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-neutral-800)]">
                    {item.studentName} · {item.assignmentTitle}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold ${
                      item.urgency === "높음"
                        ? "bg-red-50 text-red-600"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {item.elapsedLabel}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 이번주 수업 일정 */}
      <Card className="rounded-2xl p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">이번주 수업 일정</h3>
            <p className="text-[10px] text-[var(--color-neutral-400)]">주간 수업 스케줄</p>
          </div>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9.5px] font-medium text-zinc-400">
            준비 중
          </span>
        </div>
        <div className="rounded-xl bg-[var(--color-neutral-50)] px-3 py-3 text-[11px] text-[var(--color-neutral-500)]">
          수업 일정 데이터는 준비 중입니다.
        </div>
      </Card>
    </section>
  );
}
