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
      </Card>
    </section>
  );
}
