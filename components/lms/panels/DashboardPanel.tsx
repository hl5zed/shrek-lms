import Card from "@/components/ui/Card";
import StatCard from "@/components/lms/StatCard";
import LmsBadge from "@/components/lms/LmsBadge";
import Button from "@/components/ui/Button";
import { LmsMockData } from "@/lib/lms/types";

type DashboardPanelProps = {
  data: LmsMockData;
};

export default function DashboardPanel({ data }: DashboardPanelProps) {
  return (
    <section className="space-y-3 md:space-y-4">
      <div className="mb-1 flex flex-col items-start justify-between gap-2 sm:flex-row">
        <div>
          <h3 className="text-base font-bold text-[var(--color-neutral-1000)]">안녕하세요, 관리자님</h3>
          <p className="mt-0.5 text-[11px] text-[var(--color-neutral-400)]">오늘 수업 3건 · 첨삭 대기 5건 · 리포트 발행 대기 2건</p>
        </div>
        <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">학생 추가</Button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {data.dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="rounded-[var(--lms-rl)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">관리 필요 학생</h3>
            <Button variant="ghost" className="h-6 rounded-[var(--lms-r)] px-2 text-[11px]">전체보기</Button>
          </div>
          <div className="space-y-1.5">
            {data.careStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-2 border-b border-[var(--color-neutral-100)] py-1.5 last:border-b-0">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--lms-er-l)] text-[10px] font-bold text-[var(--lms-er-d)]">
                  {student.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[var(--color-neutral-1000)]">{student.name}</p>
                  <p className="truncate text-[10px] text-[var(--color-neutral-400)]">
                    {student.recentFeedback}
                  </p>
                </div>
                <LmsBadge tone={student.submissionRate <= 45 ? "danger" : "warning"}>
                  {student.submissionRate <= 45 ? "즉시 연락" : "점검 필요"}
                </LmsBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[var(--lms-rl)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">오늘의 첨삭 대기</h3>
            <Button variant="ghost" className="h-6 rounded-[var(--lms-r)] px-2 text-[11px]">첨삭 화면으로</Button>
          </div>
          <div className="space-y-1">
            {data.feedbackQueue.map((item) => (
              <div key={item.id} className="flex items-center gap-2 border-b border-[var(--color-neutral-100)] py-1.5 last:border-b-0">
                <div
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.urgency === "높음" ? "bg-[var(--lms-er)]" : "bg-[var(--color-neutral-300)]"}`}
                />
                <p className="min-w-0 flex-1 truncate text-[11.5px] text-[var(--color-neutral-800)]">
                  {item.studentName} · {item.assignmentTitle}
                </p>
                <p className={`text-[10px] font-bold ${item.urgency === "높음" ? "text-[var(--lms-er)]" : "text-[var(--color-neutral-400)]"}`}>{item.submittedAt}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-[var(--lms-rl)] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">이번주 수업 일정</h3>
          <span className="text-[10px] text-[var(--color-neutral-400)]">2026년 6월 2주차</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.weeklySchedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`rounded-[var(--lms-r)] border p-2.5 ${
                  schedule.id === "w-01"
                    ? "border-[var(--lms-br-3)] bg-[var(--lms-br-l)]"
                    : schedule.id === "w-02"
                      ? "border-[#9FE1CB] bg-[var(--lms-ok-l)]"
                      : "border-[#FAC775] bg-[var(--lms-wa-l)]"
                }`}
              >
                <p className="text-[10px] font-bold text-[var(--color-neutral-700)]">{schedule.day}</p>
                <p className="mt-1 text-[12px] font-semibold text-[var(--color-neutral-1000)]">{schedule.title}</p>
                <p className="mt-0.5 text-[10px] text-[var(--color-neutral-500)]">
                  {schedule.teacher} · {schedule.room}
                </p>
                <div className="mt-1.5 flex gap-1">
                  <LmsBadge tone={schedule.id === "w-03" ? "neutral" : "success"}>
                    {schedule.id === "w-03" ? "예정 12" : "출석"}
                  </LmsBadge>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </section>
  );
}
