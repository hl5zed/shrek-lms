import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getClassRecordById, updateClassRecord } from "@/lib/lms/queries/class-records";

const attendanceOptions = ["출석", "지각", "결석", "보강"] as const;
const participationOptions = ["적극", "보통", "소극"] as const;
const assignmentOptions = ["제출", "미제출", "지연 제출"] as const;

export default async function AdminClassRecordEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; recordId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id, recordId } = await params;
  const { status } = await searchParams;
  const record = await getClassRecordById(recordId);
  if (!record || record.classId !== id) notFound();

  async function handleUpdateRecord(formData: FormData) {
    "use server";
    const current = await getClassRecordById(recordId);
    if (!current || current.classId !== id) {
      redirect(`/admin/classes/${id}`);
    }
    const title = (formData.get("title") as string)?.trim();
    if (!title) {
      redirect(`/admin/classes/${id}/records/${recordId}/edit?status=missing`);
    }

    const rows = current.studentRows.map((student) => {
      const attendance = formData.get(`attendance_${student.studentId}`) as string;
      const focus = String(formData.get(`focus_${student.studentId}`) ?? "3");
      const understanding = String(formData.get(`understanding_${student.studentId}`) ?? "3");
      const presentation = formData.get(`presentation_${student.studentId}`) as string;
      const discussion = formData.get(`discussion_${student.studentId}`) as string;
      const assignmentStatus = formData.get(`assignment_${student.studentId}`) as string;
      const memo = (formData.get(`memo_${student.studentId}`) as string)?.trim() ?? "";
      const normalizedFocus = ["1", "2", "3", "4", "5"].includes(focus) ? focus : "3";
      const normalizedUnderstanding = ["1", "2", "3", "4", "5"].includes(understanding) ? understanding : "3";

      return {
        ...student,
        attendanceStatus: (attendance || "출석") as "출석" | "지각" | "결석" | "보강",
        focusLevel: normalizedFocus as "1" | "2" | "3" | "4" | "5",
        understandingLevel: normalizedUnderstanding as "1" | "2" | "3" | "4" | "5",
        presentationParticipation: (presentation || "보통") as "적극" | "보통" | "소극",
        discussionParticipation: (discussion || "보통") as "적극" | "보통" | "소극",
        assignmentStatus: (assignmentStatus || "미제출") as "제출" | "미제출" | "지연 제출",
        memo,
      };
    });

    const updated = await updateClassRecord(recordId, {
      title,
      lessonDate: (formData.get("lesson_date") as string)?.trim() ?? "",
      lessonGoal: (formData.get("lesson_goal") as string)?.trim() ?? "",
      keyConcepts: (formData.get("key_concepts") as string)?.trim() ?? "",
      materials: (formData.get("materials") as string)?.trim() ?? "",
      classActivities: (formData.get("class_activities") as string)?.trim() ?? "",
      assignment: (formData.get("assignment") as string)?.trim() ?? "",
      teacherMemo: (formData.get("teacher_memo") as string)?.trim() ?? "",
      studentRows: rows,
    });

    if (!updated.ok) {
      redirect(`/admin/classes/${id}/records/${recordId}/edit?status=error`);
    }
    redirect(`/admin/classes/${id}/records/${recordId}`);
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/classes/${id}/records/${recordId}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 수업기록 상세
      </Link>

      <Card className="p-6">
        <h1 className="text-xl font-bold text-zinc-900">수업기록 수정</h1>
        <p className="mt-1 text-sm text-zinc-500">수업 기본정보와 학생별 참여 기록을 수정합니다.</p>

        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">수업명은 필수입니다.</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">저장에 실패했습니다.</p>
        ) : null}

        <form action={handleUpdateRecord} className="mt-5 space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">수업명</label><input name="title" required defaultValue={record.title} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">수업일</label><input type="date" name="lesson_date" defaultValue={record.lessonDate} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-zinc-700">수업 목표</label><input name="lesson_goal" defaultValue={record.lessonGoal} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">핵심 개념</label><input name="key_concepts" defaultValue={record.keyConcepts} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">사용 자료</label><input name="materials" defaultValue={record.materials} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">수업 활동</label><input name="class_activities" defaultValue={record.classActivities} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div><label className="mb-1 block text-sm font-medium text-zinc-700">과제</label><input name="assignment" defaultValue={record.assignment} className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" /></div>
            <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-zinc-700">강사 전체 메모</label><textarea name="teacher_memo" defaultValue={record.teacherMemo} rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" /></div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-zinc-50 text-left">
                <tr>
                  <th className="px-3 py-2">학생</th>
                  <th className="px-3 py-2">출석</th>
                  <th className="px-3 py-2">집중도(1~5)</th>
                  <th className="px-3 py-2">이해도(1~5)</th>
                  <th className="px-3 py-2">발표 참여</th>
                  <th className="px-3 py-2">토론 참여</th>
                  <th className="px-3 py-2">과제 상태</th>
                  <th className="px-3 py-2">개별 메모</th>
                </tr>
              </thead>
              <tbody>
                {record.studentRows.map((student) => (
                  <tr key={student.studentId} className="border-t border-zinc-100">
                    <td className="px-3 py-2">
                      <p className="font-medium text-zinc-900">{student.studentName}</p>
                      <p className="text-xs text-zinc-400">{student.studentEmail}</p>
                    </td>
                    <td className="px-3 py-2"><select name={`attendance_${student.studentId}`} defaultValue={student.attendanceStatus} className="h-9 rounded border border-zinc-200 px-2">{attendanceOptions.map((option) => <option key={option}>{option}</option>)}</select></td>
                    <td className="px-3 py-2"><input type="number" min={1} max={5} defaultValue={student.focusLevel} name={`focus_${student.studentId}`} className="h-9 w-20 rounded border border-zinc-200 px-2" /></td>
                    <td className="px-3 py-2"><input type="number" min={1} max={5} defaultValue={student.understandingLevel} name={`understanding_${student.studentId}`} className="h-9 w-20 rounded border border-zinc-200 px-2" /></td>
                    <td className="px-3 py-2"><select name={`presentation_${student.studentId}`} defaultValue={student.presentationParticipation} className="h-9 rounded border border-zinc-200 px-2">{participationOptions.map((option) => <option key={option}>{option}</option>)}</select></td>
                    <td className="px-3 py-2"><select name={`discussion_${student.studentId}`} defaultValue={student.discussionParticipation} className="h-9 rounded border border-zinc-200 px-2">{participationOptions.map((option) => <option key={option}>{option}</option>)}</select></td>
                    <td className="px-3 py-2"><select name={`assignment_${student.studentId}`} defaultValue={student.assignmentStatus} className="h-9 rounded border border-zinc-200 px-2">{assignmentOptions.map((option) => <option key={option}>{option}</option>)}</select></td>
                    <td className="px-3 py-2"><input name={`memo_${student.studentId}`} defaultValue={student.memo} className="h-9 w-full rounded border border-zinc-200 px-2" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost"><Link href={`/admin/classes/${id}/records/${recordId}`}>취소</Link></Button>
            <Button type="submit" variant="primary">저장</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
