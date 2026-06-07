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
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            className="h-8 w-[136px] rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px] outline-none focus:border-[var(--lms-br-2)]"
            placeholder="이름·학교·연락처 검색"
          />
          <select className="h-8 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px]">
            <option>학년 전체</option>
          </select>
          <select className="h-8 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px]">
            <option>반 전체</option>
          </select>
          <select className="h-8 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px]">
            <option>상태 전체</option>
          </select>
          <select className="h-8 rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] px-2.5 text-[11.5px]">
            <option>강사 전체</option>
          </select>
          <div className="ml-auto">
            <Button variant="primary" className="h-8 rounded-[var(--lms-r)] px-3 text-xs">학생 추가</Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[var(--lms-rl)] p-0">
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
      </Card>
    </section>
  );
}
