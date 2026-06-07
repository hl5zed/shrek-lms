import Card from "@/components/ui/Card";
import LmsBadge from "@/components/lms/LmsBadge";
import ProgressBar from "@/components/lms/ProgressBar";
import { LmsMockData } from "@/lib/lms/types";

type ClassRecordsPanelProps = {
  data: LmsMockData;
};

export default function ClassRecordsPanel({ data }: ClassRecordsPanelProps) {
  const { classRecord } = data;
  return (
    <section className="space-y-3">
      <Card className="rounded-[var(--lms-rl)] p-4">
        <h3 className="text-[12.5px] font-bold text-[var(--color-neutral-1000)]">6월 2주차 — 중등 기초 A반 수업기록</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
          <p className="text-[var(--color-neutral-700)]"><b className="text-[var(--color-neutral-800)]">수업일</b> {classRecord.classDate}</p>
          <p className="text-[var(--color-neutral-700)]"><b className="text-[var(--color-neutral-800)]">수업명</b> {classRecord.classTitle}</p>
          <p className="text-[var(--color-neutral-700)]"><b className="text-[var(--color-neutral-800)]">수업 목표</b> {classRecord.goal}</p>
          <p className="text-[var(--color-neutral-700)]"><b className="text-[var(--color-neutral-800)]">과제</b> {classRecord.assignment}</p>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[var(--lms-rl)] p-0">
        <table className="w-full table-fixed text-[11.5px]">
          <thead className="bg-[var(--color-neutral-50)]">
            <tr className="border-b border-[var(--color-neutral-200)]">
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">학생</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">출석</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">집중도</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">이해도</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">발표참여</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">과제상태</th>
              <th className="px-2.5 py-1.5 text-left text-[9.5px] uppercase tracking-[0.05em] text-[var(--color-neutral-400)]">관찰메모</th>
            </tr>
          </thead>
          <tbody>
            {classRecord.rows.map((row) => (
              <tr key={row.studentName} className="border-b border-[var(--color-neutral-100)] hover:bg-[var(--color-neutral-50)]">
                <td className="px-2.5 py-2 font-semibold">{row.studentName}</td>
                <td className="px-2.5 py-2">
                  <LmsBadge tone={row.attendance === "출석" ? "success" : row.attendance === "지각" ? "warning" : "danger"}>
                    {row.attendance}
                  </LmsBadge>
                </td>
                <td className="px-2.5 py-2"><ProgressBar value={row.focus} /></td>
                <td className="px-2.5 py-2"><ProgressBar value={row.comprehension} /></td>
                <td className="px-2.5 py-2"><ProgressBar value={row.participation} /></td>
                <td className="px-2.5 py-2">
                  <LmsBadge tone={row.assignmentStatus === "완료" ? "success" : row.assignmentStatus === "지연" ? "warning" : "danger"}>
                    {row.assignmentStatus}
                  </LmsBadge>
                </td>
                <td className="px-2.5 py-2 text-[10.5px] text-[var(--color-neutral-500)]">{row.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="rounded-[var(--lms-r)] border-l-[3px] border-l-[var(--lms-br)] p-3">
        <h4 className="text-[10px] font-bold text-[var(--color-neutral-500)]">강사 전체 메모</h4>
        <p className="mt-1 whitespace-pre-line text-[11.5px] text-[var(--color-neutral-800)]">{classRecord.teacherMemo}</p>
      </Card>
    </section>
  );
}
