import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default async function AdminBoardEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  assertAdminSupabaseEnv();
  const { id } = await params;

  const { data: post } = await adminSupabase
    .from("posts")
    .select("id, title, content, category, target_role, visibility")
    .eq("id", id)
    .single();

  if (!post) notFound();

  async function updatePost(formData: FormData) {
    "use server";
    await requireAdmin();
    assertAdminSupabaseEnv();
    const title      = (formData.get("title") as string)?.trim();
    const content    = (formData.get("content") as string)?.trim();
    const category   = formData.get("category") as string;
    const targetRole = formData.get("target_role") as string;
    const visibility = formData.get("visibility") as string;

    if (!title) redirect(`/admin/board/${id}/edit?status=missing`);

    const { error } = await adminSupabase
      .from("posts")
      .update({ title, content, category, target_role: targetRole, visibility, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) redirect(`/admin/board/${id}/edit?status=error`);
    revalidatePath("/admin/board");
    revalidatePath(`/admin/board/${id}`);
    redirect(`/admin/board/${id}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/board" className="hover:text-zinc-700">게시판</Link>
        <span>/</span>
        <Link href={`/admin/board/${id}`} className="hover:text-zinc-700 truncate max-w-xs">{post.title}</Link>
        <span>/</span>
        <span className="text-zinc-600">수정</span>
      </div>

      <Card className="p-6">
        <h1 className="text-xl font-bold text-zinc-900">게시글 수정</h1>

        <form action={updatePost} className="mt-5 space-y-5">
          {/* 카테고리 + 대상 + 공개여부 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">카테고리</label>
              <select
                name="category"
                defaultValue={post.category}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
              >
                {["공지", "학습자료", "과제안내", "기타"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">대상</label>
              <select
                name="target_role"
                defaultValue={post.target_role}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
              >
                <option value="all">전체</option>
                <option value="student">학생</option>
                <option value="parent">학부모</option>
                <option value="teacher">강사</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">공개 여부</label>
              <select
                name="visibility"
                defaultValue={post.visibility}
                className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
              >
                <option value="공개">공개</option>
                <option value="비공개">비공개</option>
              </select>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">제목 *</label>
            <input
              name="title"
              required
              defaultValue={post.title}
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">내용</label>
            <textarea
              name="content"
              rows={12}
              defaultValue={post.content ?? ""}
              className="w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href={`/admin/board/${id}`}>취소</Link>
            </Button>
            <Button type="submit">저장</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
