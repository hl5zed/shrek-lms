import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  addStudentToClass,
  getClassById,
  getClassStudents,
  getStudentsForClassAssign,
  getTeachersForClassForm,
  removeStudentFromClass,
  updateClass,
} from "@/lib/lms/queries/classes";
import { getClassRecords } from "@/lib/lms/queries/class-records";

// 관리자 반 상세 — 담당 강사 변경, 학생 배정 관리
export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cls, allTeachers, enrolledStudents, unassignedStudents, classRecords] = await Promise.all([
    getClassById(id),
    getTeachersForClassForm(),
    getClassStudents(id),
    getStudentsForClassAssign(id),
    getClassRecords(id),
  ]);

  if (!cls) notFound();

  // 담당 강사 변경
  async function changeTeacher(formData: FormData) {
    "use server";
    const teacherId = formData.get("teacher_id") as string;
    const current = await getClassById(id);
    if (!current) {
      redirect("/admin/classes");
    }
    await updateClass(id, {
      name: current.name,
      description: current.description,
      teacherId: teacherId || null,
    });
    redirect(`/admin/classes/${id}`);
  }

  // 학생 반 배정 추가
  async function addStudent(formData: FormData) {
    "use server";
    const studentId = formData.get("student_id") as string;
    await addStudentToClass(id, studentId);
    redirect(`/admin/classes/${id}`);
  }

  // 학생 반 배정 해제
  async function removeStudent(formData: FormData) {
    "use server";
    const studentId = formData.get("student_id") as string;
    await removeStudentFromClass(id, studentId);
    redirect(`/admin/classes/${id}`);
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700">
        ← 반 목록
      </Link>

      {/* 반 헤더 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{cls.name}</h1>
        {cls.description && <p className="mt-1 text-sm text-zinc-500">{cls.description}</p>}
        <p className="mt-1 text-sm text-zinc-400">
          담당 강사: {cls.teacherName ?? "미배정"}
        </p>
        <div className="mt-3">
          <Button asChild variant="ghost">
            <Link href={`/admin/classes/${id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-800">수업기록</h2>
            <Button asChild variant="primary">
              <Link href={`/admin/classes/${id}/records/new`}>수업기록 추가</Link>
            </Button>
          </div>

          {classRecords.length === 0 ? (
            <p className="text-sm text-zinc-400">아직 등록된 수업기록이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {classRecords.slice(0, 5).map((record) => (
                <li key={record.id} className="rounded-xl border border-zinc-200 p-3">
                  <Link href={`/admin/classes/${id}/records/${record.id}`} className="block">
                    <p className="text-sm font-semibold text-zinc-900">{record.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      수업일: {record.lessonDate || "-"} · 출석률: {record.attendanceRate ?? "-"}% · 과제 제출률:{" "}
                      {record.assignmentSubmitRate ?? "-"}%
                    </p>
                    {record.teacherMemo ? (
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-400">{record.teacherMemo}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 담당 강사 변경 */}
        <section>
          <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">담당 강사 변경</h2>
          <form action={changeTeacher} className="flex gap-2">
            <select
              name="teacher_id"
              defaultValue={cls.teacherId ?? ""}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">미배정</option>
              {allTeachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <Button type="submit" variant="primary">변경</Button>
          </form>
          </Card>
        </section>

        {/* 학생 배정 */}
        <section>
          <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">
            학생 배정{" "}
            <span className="font-normal text-zinc-400">({enrolledStudents.length}명)</span>
          </h2>

          {enrolledStudents.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {enrolledStudents.map((s) => (
                  <li key={s.studentId} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{s.name}</p>
                      <p className="text-xs text-zinc-400">{s.email} · role={s.role}</p>
                    </div>
                    <form action={removeStudent}>
                      <input type="hidden" name="student_id" value={s.studentId} />
                      <button type="submit" className="text-xs font-medium text-red-500 transition hover:text-red-700">
                        해제
                      </button>
                    </form>
                  </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-zinc-400">아직 배정된 학생이 없습니다.</p>
          )}

          {unassignedStudents.length > 0 && (
            <form action={addStudent} className="flex gap-2">
              <select
                name="student_id"
                required
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="">학생 선택</option>
                {unassignedStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              <Button type="submit" variant="primary">배정</Button>
            </form>
          )}
          </Card>
        </section>
      </div>
    </div>
  );
}
