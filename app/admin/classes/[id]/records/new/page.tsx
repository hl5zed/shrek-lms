import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { getClassById } from "@/lib/lms/queries/classes";
import { createClassRecord, getClassStudentsForRecord } from "@/lib/lms/queries/class-records";

const attendanceOptions = ["출석", "지각", "결석", "보강"] as const;
const participationOptions = ["적극", "보통", "소극"] as const;
const assignmentOptions = ["제출", "미제출", "지연 제출"] as const;

export default async function AdminClassRecordNewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const [cls, classStudents] = await Promise.all([
    getClassById(id),
    getClassStudentsForRecord(id),
  ]);
  if (!cls) notFound();

  async function handleCreateRecord(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const title = (formData.get("title") as string)?.trim();
    const lessonDate = (formData.get("lesson_date") as string)?.trim();
    const lessonGoal = (formData.get("lesson_goal") as string)?.trim();
    const keyConcepts = (formData.get("key_concepts") as string)?.trim();
    const materials = (formData.get("materials") as string)?.trim();
    const classActivities = (formData.get("class_activities") as string)?.trim();
    const assignment = (formData.get("assignment") as string)?.trim();
    const teacherMemo = (formData.get("teacher_memo") as string)?.trim();

    if (!title) {
      redirect(`/admin/classes/${id}/records/new?status=missing`);
    }

    const rows = classStudents.map((student) => {
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

    const created = await createClassRecord({
      classId: id,
      title,
      lessonDate: lessonDate ?? "",
      lessonGoal: lessonGoal ?? "",
      keyConcepts: keyConcepts ?? "",
      materials: materials ?? "",
      classActivities: classActivities ?? "",
      assignment: assignment ?? "",
      teacherMemo: teacherMemo ?? "",
      createdBy: user.id,
      studentRows: rows,
    });

    if (!created.ok || !created.id) {
      redirect(`/admin/classes/${id}/records/new?status=error`);
    }

    redirect(`/admin/classes/${id}/records/${created.id}`);
  }

  return (
    <div className="space-y-4">
      <Link href={`/admin/classes/${id}`} className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700">
        ← 반 상세
      </Link>

      <Card className="p-6">
        <h1 className="text-xl font-bold text-zinc-900">수업기록 추가</h1>
        <p className="mt-1 text-sm text-zinc-500">{cls.name} 반의 수업기록을 작성합니다.</p>

        {status === "missing" ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">수업명은 필수입니다.</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">저장에 실패했습니다.</p>
        ) : null}

        <form action={handleCreateRecord} className="mt-5 space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">수업명</label>
              <input name="title" required className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">수업일</label>
              <input type="date" name="lesson_date" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700">수업 목표</label>
              <input name="lesson_goal" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">핵심 개념</label>
              <input name="key_concepts" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">사용 자료</label>
              <input name="materials" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">수업 활동</label>
              <input name="class_activities" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">과제</label>
              <input name="assignment" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-zinc-700">강사 전체 메모</label>
              <textarea name="teacher_memo" rows={3} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-semibold text-zinc-800">학생별 참여 기록</h2>
            {classStudents.length === 0 ? (
              <p className="text-sm text-zinc-400">현재 반에 배정된 학생이 없습니다.</p>
            ) : (
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
                    {classStudents.map((student) => (
                      <tr key={student.studentId} className="border-t border-zinc-100">
                        <td className="px-3 py-2">
                          <p className="font-medium text-zinc-900">{student.studentName}</p>
                          <p className="text-xs text-zinc-400">{student.studentEmail}</p>
                        </td>
                        <td className="px-3 py-2">
                          <select name={`attendance_${student.studentId}`} className="h-9 rounded border border-zinc-200 px-2">
                            {attendanceOptions.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2"><input type="number" min={1} max={5} defaultValue={3} name={`focus_${student.studentId}`} className="h-9 w-20 rounded border border-zinc-200 px-2" /></td>
                        <td className="px-3 py-2"><input type="number" min={1} max={5} defaultValue={3} name={`understanding_${student.studentId}`} className="h-9 w-20 rounded border border-zinc-200 px-2" /></td>
                        <td className="px-3 py-2">
                          <select name={`presentation_${student.studentId}`} className="h-9 rounded border border-zinc-200 px-2">
                            {participationOptions.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select name={`discussion_${student.studentId}`} className="h-9 rounded border border-zinc-200 px-2">
                            {participationOptions.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select name={`assignment_${student.studentId}`} className="h-9 rounded border border-zinc-200 px-2">
                            {assignmentOptions.map((option) => <option key={option}>{option}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2"><input name={`memo_${student.studentId}`} className="h-9 w-full rounded border border-zinc-200 px-2" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button asChild variant="ghost"><Link href={`/admin/classes/${id}`}>취소</Link></Button>
            <Button type="submit" variant="primary">저장</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
