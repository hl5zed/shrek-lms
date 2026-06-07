import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 관리자 반 상세 — 담당 강사 변경, 학생 배정 관리
export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: cls },
    { data: allTeachers },
    { data: enrolledStudents },
    { data: allStudents },
  ] = await Promise.all([
    supabase.from("classes").select("id, name, description, teacher_id, profiles!teacher_id ( name )").eq("id", id).single(),
    supabase.from("profiles").select("id, name").eq("role", "teacher").order("name"),
    supabase.from("class_students").select("student_id, profiles!student_id ( name, email )").eq("class_id", id),
    supabase.from("profiles").select("id, name, email").eq("role", "student").order("name"),
  ]);

  if (!cls) notFound();

  const enrolledIds = new Set((enrolledStudents ?? []).map((r) => r.student_id));
  const unenrolledStudents = (allStudents ?? []).filter((s) => !enrolledIds.has(s.id));

  // 담당 강사 변경
  async function changeTeacher(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const teacherId = formData.get("teacher_id") as string;
    await supabase.from("classes").update({ teacher_id: teacherId || null }).eq("id", id);
    redirect(`/admin/classes/${id}`);
  }

  // 학생 반 배정 추가
  async function addStudent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const studentId = formData.get("student_id") as string;
    await supabase.from("class_students").upsert({ class_id: id, student_id: studentId });
    redirect(`/admin/classes/${id}`);
  }

  // 학생 반 배정 해제
  async function removeStudent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const studentId = formData.get("student_id") as string;
    await supabase.from("class_students").delete().eq("class_id", id).eq("student_id", studentId);
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
          담당 강사: {(cls.profiles as unknown as { name: string } | null)?.name ?? "미배정"}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 담당 강사 변경 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">담당 강사 변경</h2>
          <form action={changeTeacher} className="flex gap-2">
            <select
              name="teacher_id"
              defaultValue={cls.teacher_id ?? ""}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">미배정</option>
              {(allTeachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              변경
            </button>
          </form>
        </section>

        {/* 학생 배정 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">
            학생 배정{" "}
            <span className="font-normal text-zinc-400">({enrolledStudents?.length ?? 0}명)</span>
          </h2>

          {enrolledStudents && enrolledStudents.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {enrolledStudents.map((r) => {
                const s = r.profiles as unknown as { name: string; email: string } | null;
                return (
                  <li key={r.student_id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{s?.name}</p>
                      <p className="text-xs text-zinc-400">{s?.email}</p>
                    </div>
                    <form action={removeStudent}>
                      <input type="hidden" name="student_id" value={r.student_id} />
                      <button type="submit" className="text-xs font-medium text-red-500 transition hover:text-red-700">
                        해제
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-zinc-400">배정된 학생이 없습니다.</p>
          )}

          {unenrolledStudents.length > 0 && (
            <form action={addStudent} className="flex gap-2">
              <select
                name="student_id"
                required
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="">학생 선택</option>
                {unenrolledStudents.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                ))}
              </select>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                배정
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
