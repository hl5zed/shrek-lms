import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default async function AdminBoardNewPage() {
  // 글 작성 Server Action
  async function createPost(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const title      = formData.get("title") as string;
    const content    = formData.get("content") as string;
    const category   = formData.get("category") as string;
    const targetRole = formData.get("target_role") as string;
    const visibility = formData.get("visibility") as string;

    if (!title.trim()) return;

    const { data: post } = await adminSupabase
      .from("posts")
      .insert({
        title,
        content,
        category,
        target_role: targetRole,
        visibility,
        author_id: user?.id ?? null,
      })
      .select("id")
      .single();

    redirect(post ? `/admin/board/${post.id}` : "/admin/board");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/board" className="text-sm text-zinc-400 hover:text-zinc-700">← 게시판</Link>
        <h1 className="text-2xl font-bold text-zinc-900">글 작성</h1>
      </div>

      <Card className="p-6">
        <form action={createPost} className="space-y-5">
          {/* 카테고리 + 대상 + 공개여부 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">카테고리</label>
              <select name="category" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400">
                {["공지", "학습자료", "과제안내", "기타"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">대상</label>
              <select name="target_role" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400">
                <option value="all">전체</option>
                <option value="student">학생</option>
                <option value="parent">학부모</option>
                <option value="teacher">강사</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-zinc-700">공개 여부</label>
              <select name="visibility" className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400">
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
              placeholder="제목을 입력하세요"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-700">내용</label>
            <textarea
              name="content"
              rows={12}
              placeholder="내용을 입력하세요"
              className="w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button asChild variant="ghost">
              <Link href="/admin/board">취소</Link>
            </Button>
            <Button type="submit">등록</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
