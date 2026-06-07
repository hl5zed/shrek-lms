import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 관리자 학생 상세 — 반 배정·학부모 연결 관리
export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: student },
    { data: allClasses },
    { data: enrolledClasses },
    { data: allParents },
    { data: linkedParents },
  ] = await Promise.all([
    supabase.from("profiles").select("id, name, email, phone").eq("id", id).eq("role", "student").single(),
    supabase.from("classes").select("id, name").order("name"),
    supabase.from("class_students").select("class_id, classes ( name )").eq("student_id", id),
    supabase.from("profiles").select("id, name, email").eq("role", "parent").order("name"),
    supabase.from("parent_students").select("parent_id, profiles!parent_id ( name, email )").eq("student_id", id),
  ]);

  if (!student) notFound();

  const enrolledClassIds = new Set((enrolledClasses ?? []).map((r) => r.class_id));
  const linkedParentIds = new Set((linkedParents ?? []).map((r) => r.parent_id));

  // 반 배정 추가
  async function assignClass(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const classId = formData.get("class_id") as string;
    await supabase.from("class_students").upsert({ class_id: classId, student_id: id });
    redirect(`/admin/students/${id}`);
  }

  // 반 배정 해제
  async function removeFromClass(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const classId = formData.get("class_id") as string;
    await supabase.from("class_students").delete().eq("class_id", classId).eq("student_id", id);
    redirect(`/admin/students/${id}`);
  }

  // 학부모 연결
  async function linkParent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const parentId = formData.get("parent_id") as string;
    await supabase.from("parent_students").upsert({ parent_id: parentId, student_id: id });
    redirect(`/admin/students/${id}`);
  }

  // 학부모 연결 해제
  async function unlinkParent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const parentId = formData.get("parent_id") as string;
    await supabase.from("parent_students").delete().eq("parent_id", parentId).eq("student_id", id);
    redirect(`/admin/students/${id}`);
  }

  const unenrolledClasses = (allClasses ?? []).filter((c) => !enrolledClassIds.has(c.id));
  const unlinkedParents = (allParents ?? []).filter((p) => !linkedParentIds.has(p.id));

  return (
    <div>
      {/* 뒤로가기 */}
      <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700">
        ← 학생 목록
      </Link>

      {/* 학생 프로필 헤더 */}
      <div className="mt-4 mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
          {student.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{student.name}</h1>
          <p className="text-sm text-zinc-500">{student.email}{student.phone ? ` · ${student.phone}` : ""}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 반 배정 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">반 배정</h2>

          {enrolledClasses && enrolledClasses.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {enrolledClasses.map((r) => (
                <li key={r.class_id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <span className="text-sm font-medium text-zinc-800">
                    {(r.classes as unknown as { name: string } | null)?.name ?? r.class_id}
                  </span>
                  <form action={removeFromClass}>
                    <input type="hidden" name="class_id" value={r.class_id} />
                    <button type="submit" className="text-xs font-medium text-red-500 transition hover:text-red-700">
                      해제
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-zinc-400">배정된 반이 없습니다.</p>
          )}

          {unenrolledClasses.length > 0 && (
            <form action={assignClass} className="flex gap-2">
              <select
                name="class_id"
                required
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="">반 선택</option>
                {unenrolledClasses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                배정
              </button>
            </form>
          )}
        </section>

        {/* 학부모 연결 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">학부모 연결</h2>

          {linkedParents && linkedParents.length > 0 ? (
            <ul className="mb-4 space-y-2">
              {linkedParents.map((r) => {
                const p = r.profiles as unknown as { name: string; email: string } | null;
                return (
                  <li key={r.parent_id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-zinc-800">{p?.name}</p>
                      <p className="text-xs text-zinc-400">{p?.email}</p>
                    </div>
                    <form action={unlinkParent}>
                      <input type="hidden" name="parent_id" value={r.parent_id} />
                      <button type="submit" className="text-xs font-medium text-red-500 transition hover:text-red-700">
                        해제
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-zinc-400">연결된 학부모가 없습니다.</p>
          )}

          {unlinkedParents.length > 0 && (
            <form action={linkParent} className="flex gap-2">
              <select
                name="parent_id"
                required
                className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              >
                <option value="">학부모 선택</option>
                {unlinkedParents.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                ))}
              </select>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
                연결
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
