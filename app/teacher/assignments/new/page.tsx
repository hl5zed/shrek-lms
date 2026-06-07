import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 과제 등록 — Server Action으로 assignments 테이블에 INSERT합니다.
export default async function NewAssignmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 강사가 담당하는 반 목록 조회
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", user!.id)
    .order("name");

  async function createAssignment(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("due_date") as string;
    const classId = formData.get("class_id") as string;

    await supabase.from("assignments").insert({
      title,
      description: description || null,
      due_date: dueDate,
      class_id: classId,
      created_by: user.id,
    });

    redirect("/teacher/assignments");
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 과제 목록
      </Link>

      {/* 페이지 헤더 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">과제 등록</h1>
        <p className="mt-1 text-sm text-zinc-500">새 과제를 등록합니다.</p>
      </div>

      <form action={createAssignment} className="max-w-xl space-y-5">
        {/* 반 선택 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            대상 반 <span className="text-red-500">*</span>
          </label>
          <select
            name="class_id"
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">반을 선택하세요</option>
            {(classes ?? []).map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* 과제 제목 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            과제 제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="예: 3월 2주차 논술 과제"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        {/* 과제 안내 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">과제 안내</label>
          <textarea
            name="description"
            rows={4}
            placeholder="과제 주제, 요구사항, 분량 등을 안내해 주세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        {/* 마감일 */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            마감일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="due_date"
            required
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            등록하기
          </button>
          <Link
            href="/teacher/assignments"
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
