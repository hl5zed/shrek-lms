import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// 과제 제출 화면 — 텍스트 논술 입력 + 글자 수 카운트 후 Server Action으로 INSERT합니다.
export default async function SubmitAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, due_date")
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  // 이미 제출한 경우 상세 페이지로 리다이렉트
  const { data: existing } = await supabase
    .from("submissions")
    .select("id")
    .eq("assignment_id", id)
    .eq("student_id", user!.id)
    .single();

  if (existing) redirect(`/student/assignments/${id}`);

  async function submitAssignment(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const contentText = formData.get("content_text") as string;
    const wordCount = contentText.length;
    const wordCountPure = contentText.replace(/\s/g, "").length;

    await supabase.from("submissions").insert({
      assignment_id: id,
      student_id: user.id,
      content_text: contentText,
      word_count: wordCount,
      word_count_pure: wordCountPure,
      status: "submitted",
    });

    redirect(`/student/assignments/${id}`);
  }

  return (
    <div>
      {/* 뒤로가기 */}
      <Link
        href={`/student/assignments/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 과제 상세
      </Link>

      {/* 과제 헤더 */}
      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{assignment.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">마감: {assignment.due_date}</p>
      </div>

      <form action={submitAssignment} className="max-w-2xl space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            답안 작성 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content_text"
            rows={18}
            required
            placeholder="논술 답안을 작성하세요."
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
          <p className="mt-1.5 text-xs text-zinc-400">
            제출 후에는 수정이 불가합니다. 최종 확인 후 제출하세요.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            제출하기
          </button>
          <Link
            href={`/student/assignments/${id}`}
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
