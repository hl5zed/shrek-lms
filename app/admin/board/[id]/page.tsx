import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";

const CATEGORY_TONE: Record<string, "info" | "warning" | "success" | "danger" | "neutral"> = {
  공지: "info",
  학습자료: "success",
  과제안내: "warning",
  기타: "neutral",
};

const ROLE_LABEL: Record<string, string> = {
  all: "전체",
  student: "학생",
  parent: "학부모",
  teacher: "강사",
};

export default async function AdminBoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  assertAdminSupabaseEnv();
  const { id } = await params;

  const { data: post } = await adminSupabase
    .from("posts")
    .select("*, profiles!author_id ( name )")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // 삭제 Server Action
  async function deletePost() {
    "use server";
    await requireAdmin();
    assertAdminSupabaseEnv();
    await adminSupabase.from("posts").delete().eq("id", id);
    revalidatePath("/admin/board");
    redirect("/admin/board");
  }

  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;

  return (
    <div className="space-y-6">
      {/* 네비게이션 */}
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/board" className="hover:text-zinc-700">게시판</Link>
        <span>/</span>
        <span className="text-zinc-600">{post.title}</span>
      </div>

      <Card className="p-6">
        {/* 메타 정보 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone={CATEGORY_TONE[post.category] ?? "neutral"}>{post.category}</Badge>
          <Badge tone="neutral">{ROLE_LABEL[post.target_role] ?? post.target_role} 대상</Badge>
          <Badge tone={post.visibility === "공개" ? "success" : "neutral"}>{post.visibility}</Badge>
        </div>

        {/* 제목 */}
        <h1 className="text-xl font-bold text-zinc-900">{post.title}</h1>

        {/* 작성자 + 날짜 */}
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
          <span>{(author as { name?: string } | null)?.name ?? "알 수 없음"}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
          {post.updated_at !== post.created_at && (
            <>
              <span>·</span>
              <span>수정됨 {new Date(post.updated_at).toLocaleDateString("ko-KR")}</span>
            </>
          )}
        </div>

        {/* 구분선 */}
        <hr className="my-5 border-zinc-100" />

        {/* 본문 */}
        <div className="min-h-32 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {post.content ?? "내용 없음"}
        </div>

        {/* 하단 버튼 */}
        <div className="mt-8 flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/admin/board">← 목록</Link>
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link href={`/admin/board/${id}/edit`}>수정</Link>
            </Button>
            <form action={deletePost}>
              <DeleteButton className="rounded-lg border border-red-200 px-4 py-2 text-sm text-red-500 hover:bg-red-50" />
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}
