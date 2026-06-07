import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import { LmsMockData } from "@/lib/lms/types";

type AssignmentsPanelProps = {
  data: LmsMockData;
};

export default function AssignmentsPanel({ data }: AssignmentsPanelProps) {
  return (
    <section className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary">과제 등록</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-neutral-50)]">
              <tr className="border-b border-[var(--color-neutral-200)]">
                <th className="px-4 py-3 text-left">과제명</th>
                <th className="px-4 py-3 text-left">유형</th>
                <th className="px-4 py-3 text-left">대상</th>
                <th className="px-4 py-3 text-left">마감</th>
                <th className="px-4 py-3 text-left">제출현황</th>
                <th className="px-4 py-3 text-left">AI 분석상태</th>
                <th className="px-4 py-3 text-left">진행상태</th>
              </tr>
            </thead>
            <tbody>
              {data.assignments.map((a) => (
                <tr key={a.id} className="border-b border-[var(--color-neutral-100)]">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3">{a.kind}</td>
                  <td className="px-4 py-3">{a.target}</td>
                  <td className="px-4 py-3">{a.dueDate}</td>
                  <td className="px-4 py-3">{a.submitStatus}</td>
                  <td className="px-4 py-3">
                    <LmsBadge tone={a.aiStatus === "완료" ? "success" : a.aiStatus === "대기" ? "warning" : "danger"}>
                      {a.aiStatus}
                    </LmsBadge>
                  </td>
                  <td className="px-4 py-3">
                    <LmsBadge tone={a.progress === "진행중" ? "primary" : a.progress === "마감임박" ? "warning" : "neutral"}>
                      {a.progress}
                    </LmsBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2 p-2 md:hidden">
          {data.assignments.map((a) => (
            <div key={a.id} className="rounded-[var(--lms-r)] border border-[var(--color-neutral-200)] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--color-neutral-900)]">{a.title}</p>
                <LmsBadge tone={a.progress === "진행중" ? "primary" : a.progress === "마감임박" ? "warning" : "neutral"}>
                  {a.progress}
                </LmsBadge>
              </div>
              <p className="mt-1 text-xs text-[var(--color-neutral-500)]">{a.kind} · {a.target} · {a.dueDate}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <LmsBadge tone={a.aiStatus === "완료" ? "success" : a.aiStatus === "대기" ? "warning" : "danger"}>
                  AI {a.aiStatus}
                </LmsBadge>
                <span className="text-xs text-[var(--color-neutral-600)]">{a.submitStatus}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
