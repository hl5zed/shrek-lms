import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 관리자 학부모 상세 — 자녀 연결 관리
export default async function AdminParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: parent },
    { data: linkedStudents },
    { data: allStudents },
  ] = await Promise.all([
    supabase.from("profiles").select("id, name, email").eq("id", id).eq("role", "parent").single(),
    supabase.from("parent_students").select("student_id, profiles!student_id ( name, email )").eq("parent_id", id),
    supabase.from("profiles").select("id, name, email").eq("role", "student").order("name"),
  ]);

  if (!parent) notFound();

  const linkedIds = new Set((linkedStudents ?? []).map((r) => r.student_id));
  const unlinkableStudents = (allStudents ?? []).filter((s) => !linkedIds.has(s.id));

  async function linkStudent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const studentId = formData.get("student_id") as string;
    await supabase.from("parent_students").upsert({ parent_id: id, student_id: studentId });
    redirect(`/admin/parents/${id}`);
  }

  async function unlinkStudent(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const studentId = formData.get("student_id") as string;
    await supabase.from("parent_students").delete().eq("parent_id", id).eq("student_id", studentId);
    redirect(`/admin/parents/${id}`);
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link href="/admin/parents" className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700">
        ← 학부모 목록
      </Link>

      {/* 학부모 프로필 헤더 */}
      <div className="mt-4 mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-lg font-bold text-amber-700">
          {parent.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{parent.name}</h1>
          <p className="text-sm text-zinc-500">{parent.email}</p>
        </div>
      </div>

      {/* 연결된 자녀 관리 */}
      <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-zinc-800">
          연결된 자녀{" "}
          <span className="font-normal text-zinc-400">({linkedStudents?.length ?? 0}명)</span>
        </h2>

        {linkedStudents && linkedStudents.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {linkedStudents.map((r) => {
              const s = r.profiles as unknown as { name: string; email: string } | null;
              return (
                <li key={r.student_id} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">{s?.name}</p>
                    <p className="text-xs text-zinc-400">{s?.email}</p>
                  </div>
                  <form action={unlinkStudent}>
                    <input type="hidden" name="student_id" value={r.student_id} />
                    <button type="submit" className="text-xs font-medium text-red-500 transition hover:text-red-700">
                      연결 해제
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mb-4 text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
        )}

        {unlinkableStudents.length > 0 && (
          <form action={linkStudent} className="flex gap-2">
            <select
              name="student_id"
              required
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">학생 선택</option>
              {unlinkableStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
              ))}
            </select>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              연결
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
