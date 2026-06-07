import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import ProgressBar from "@/components/lms/ProgressBar";
import { LmsMockData } from "@/lib/lms/types";

type StudentsPanelProps = {
  data: LmsMockData;
};

export default function StudentsPanel({ data }: StudentsPanelProps) {
  return (
    <section className="space-y-3">
      <Card className="rounded-[var(--lms-rl)] p-3">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            className="h-9 w-full rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] outline-none focus:border-[var(--lms-br-2)] sm:h-8 sm:w-[136px]"
            placeholder="이름·학교·연락처 검색"
          />
          <select className="h-9 w-full rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] sm:h-8 sm:w-auto">
            <option>학년 전체</option>
          </select>
          <select className="h-9 w-full rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] sm:h-8 sm:w-auto">
            <option>반 전체</option>
          </select>
          <select className="h-9 w-full rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] sm:h-8 sm:w-auto">
            <option>상태 전체</option>
          </select>
          <select className="h-9 w-full rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] sm:h-8 sm:w-auto">
            <option>강사 전체</option>
          </select>
          <div className="sm:ml-auto">
            <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">학생 추가</Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[var(--lms-rl)] p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full table-fixed text-[11.5px]">
            <thead className="bg-[var(--color-neutral-50)]">
              <tr className="border-b border-[var(--color-neutral-200)]">
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">이름</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">학년</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">반</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">담당강사</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">과제 제출률</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">출석상태</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">최근첨삭</th>
                <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">수강상태</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((s) => (
                <tr key={s.id} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]">
                  <td className="px-2.5 py-2 text-[12px] font-semibold text-[var(--color-neutral-1000)]">{s.name}</td>
                  <td className="px-2.5 py-2">{s.grade}</td>
                  <td className="px-2.5 py-2">{s.className}</td>
                  <td className="px-2.5 py-2">{s.teacher}</td>
                  <td className="px-2.5 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-[52px]">
                        <ProgressBar value={s.submissionRate} />
                      </div>
                      <span className="text-[10px]">{s.submissionRate}%</span>
                    </div>
                  </td>
                  <td className="px-2.5 py-2">
                    <LmsBadge tone={s.attendance === "양호" ? "success" : s.attendance === "주의" ? "warning" : "danger"}>
                      {s.attendance}
                    </LmsBadge>
                  </td>
                  <td className="px-2.5 py-2 text-[10px] text-[var(--color-neutral-400)]">{s.recentFeedback}</td>
                  <td className="px-2.5 py-2">
                    <LmsBadge tone={s.enrollmentStatus === "수강중" ? "primary" : s.enrollmentStatus === "휴강" ? "neutral" : "warning"}>
                      {s.enrollmentStatus}
                    </LmsBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 p-2 md:hidden">
          {data.students.map((s) => (
            <div key={s.id} className="rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-neutral-1000)]">{s.name}</p>
                <LmsBadge tone={s.enrollmentStatus === "수강중" ? "primary" : s.enrollmentStatus === "휴강" ? "neutral" : "warning"}>
                  {s.enrollmentStatus}
                </LmsBadge>
              </div>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{s.grade} · {s.className} · {s.teacher}</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <ProgressBar value={s.submissionRate} />
                </div>
                <span className="text-xs text-[var(--color-neutral-700)]">{s.submissionRate}%</span>
                <LmsBadge tone={s.attendance === "양호" ? "success" : s.attendance === "주의" ? "warning" : "danger"}>
                  {s.attendance}
                </LmsBadge>
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-neutral-500)]">최근첨삭: {s.recentFeedback}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
