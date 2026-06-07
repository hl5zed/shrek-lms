import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getClassRecordById } from "@/lib/lms/queries/class-records";

export default async function AdminClassRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  const record = await getClassRecordById(recordId);
  if (!record || record.classId !== id) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/admin/classes/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 반 상세
      </Link>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{record.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              수업일: {record.lessonDate || "-"} · 생성일: {new Date(record.createdAt).toLocaleString("ko-KR")}
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href={`/admin/classes/${id}/records/${recordId}/edit`}>수정</Link>
          </Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 p-3"><p className="text-xs text-zinc-500">수업 목표</p><p className="mt-1 text-sm text-zinc-800">{record.lessonGoal || "-"}</p></div>
          <div className="rounded-lg border border-zinc-200 p-3"><p className="text-xs text-zinc-500">핵심 개념</p><p className="mt-1 text-sm text-zinc-800">{record.keyConcepts || "-"}</p></div>
          <div className="rounded-lg border border-zinc-200 p-3"><p className="text-xs text-zinc-500">사용 자료</p><p className="mt-1 text-sm text-zinc-800">{record.materials || "-"}</p></div>
          <div className="rounded-lg border border-zinc-200 p-3"><p className="text-xs text-zinc-500">수업 활동</p><p className="mt-1 text-sm text-zinc-800">{record.classActivities || "-"}</p></div>
          <div className="rounded-lg border border-zinc-200 p-3 md:col-span-2"><p className="text-xs text-zinc-500">과제</p><p className="mt-1 text-sm text-zinc-800">{record.assignment || "-"}</p></div>
        </div>
      </Card>

      <Card className="border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-700">강사 전체 메모</p>
        <p className="mt-1 text-sm text-blue-900 whitespace-pre-wrap">{record.teacherMemo || "기록 없음"}</p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">학생별 참여 기록</h2>
        {record.studentRows.length === 0 ? (
          <p className="text-sm text-zinc-400">학생별 참여 기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-3 py-2">학생</th>
                  <th className="px-3 py-2">출석</th>
                  <th className="px-3 py-2">집중도</th>
                  <th className="px-3 py-2">이해도</th>
                  <th className="px-3 py-2">발표 참여</th>
                  <th className="px-3 py-2">토론 참여</th>
                  <th className="px-3 py-2">과제 상태</th>
                  <th className="px-3 py-2">메모</th>
                </tr>
              </thead>
              <tbody>
                {record.studentRows.map((row) => (
                  <tr key={row.studentId} className="border-t border-zinc-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-zinc-900">{row.studentName}</p>
                      <p className="text-xs text-zinc-400">{row.studentEmail}</p>
                    </td>
                    <td className="px-3 py-2">{row.attendanceStatus}</td>
                    <td className="px-3 py-2">{row.focusLevel}</td>
                    <td className="px-3 py-2">{row.understandingLevel}</td>
                    <td className="px-3 py-2">{row.presentationParticipation}</td>
                    <td className="px-3 py-2">{row.discussionParticipation}</td>
                    <td className="px-3 py-2">{row.assignmentStatus}</td>
                    <td className="px-3 py-2">{row.memo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
