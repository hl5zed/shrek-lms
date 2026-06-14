import { redirect } from "next/navigation";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewAssignmentPage() {
  assertAdminSupabaseEnv();

  // 전체 반 목록 조회 (teacher 필터 없이)
  const { data: classes } = await adminSupabase
    .from("classes")
    .select("id, name")
    .order("name");

  async function createAssignment(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const title       = (formData.get("title") as string).trim();
    const description = (formData.get("description") as string).trim();
    const dueDate     = formData.get("due_date") as string;
    const classId     = formData.get("class_id") as string;

    if (!title || !dueDate || !classId) redirect("/admin/assignments/new");

    await adminSupabase.from("assignments").insert({
      title,
      description: description || null,
      due_date: dueDate,
      class_id: classId,
      created_by: user.id,
    });

    redirect("/admin/assignments");
  }

  return (
    <div>
      <Link
        href="/admin/assignments"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 과제 목록
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="text-2xl font-bold text-zinc-900">과제 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">새 과제를 등록합니다.</p>
      </div>

      <form action={createAssignment} className="max-w-xl space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            대상 반 <span className="text-red-500">*</span>
          </label>
          <select
            name="class_id"
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400"
          >
            <option value="">반을 선택하세요</option>
            {(classes ?? []).map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            과제 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="예: 3월 2주차 논술 과제"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">과제 안내</label>
          <textarea
            name="description"
            rows={4}
            placeholder="과제 주제, 요구사항, 분량 등을 안내해 주세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            마감일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            등록하기
          </button>
          <Link
            href="/admin/assignments"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
