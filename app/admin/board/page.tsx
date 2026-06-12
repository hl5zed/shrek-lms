import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Table, TableContainer } from "@/components/ui/Table";
import DeleteButton from "@/components/ui/DeleteButton";

// 카테고리별 뱃지 색상
const CATEGORY_TONE: Record<string, "info" | "warning" | "success" | "danger" | "neutral"> = {
  공지: "info",
  학습자료: "success",
  과제안내: "warning",
  기타: "neutral",
};

// 대상 역할 한글 표기
const ROLE_LABEL: Record<string, string> = {
  all: "전체",
  student: "학생",
  parent: "학부모",
  teacher: "강사",
};

export default async function AdminBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; target?: string }>;
}) {
  assertAdminSupabaseEnv();
  const { category, target } = await searchParams;
  const supabase = await createClient();

  // 글 목록 조회 (작성자 이름 포함)
  let query = adminSupabase
    .from("posts")
    .select("id, title, category, target_role, visibility, created_at, author_id, profiles!author_id ( name )")
    .order("created_at", { ascending: false });

  if (category && category !== "all") query = query.eq("category", category);
  if (target && target !== "all")     query = query.eq("target_role", target);

  const { data: posts } = await query;

  // 글 삭제 Server Action
  async function deletePost(formData: FormData) {
    "use server";
    assertAdminSupabaseEnv();
    const id = formData.get("id") as string;
    await adminSupabase.from("posts").delete().eq("id", id);
    revalidatePath("/admin/board");
    redirect("/admin/board");
  }

  const categories = ["all", "공지", "학습자료", "과제안내", "기타"];
  const targets    = ["all", "student", "parent", "teacher"];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">게시판</h1>
          <p className="mt-1 text-sm text-zinc-500">
            총 <span className="font-semibold text-zinc-700">{posts?.length ?? 0}</span>개 게시글
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/board/new">+ 글 작성</Link>
        </Button>
      </div>

      {/* 필터 탭 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/admin/board?category=${c}&target=${target ?? "all"}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              (category ?? "all") === c
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {c === "all" ? "전체" : c}
          </Link>
        ))}
        <span className="mx-1 text-zinc-300">|</span>
        {targets.map((t) => (
          <Link
            key={t}
            href={`/admin/board?category=${category ?? "all"}&target=${t}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              (target ?? "all") === t
                ? "bg-emerald-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {ROLE_LABEL[t]}
          </Link>
        ))}
      </div>

      {/* 목록 */}
      {!posts || posts.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">게시글이 없습니다.</p>
          <Button asChild className="mt-4">
            <Link href="/admin/board/new">첫 글 작성하기</Link>
          </Button>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">카테고리</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">제목</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">대상</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">공개</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">작성자</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">날짜</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {posts.map((post) => {
                const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
                return (
                  <tr key={post.id} className="transition hover:bg-zinc-50">
                    <td className="px-5 py-3.5">
                      <Badge tone={CATEGORY_TONE[post.category] ?? "neutral"}>{post.category}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/board/${post.id}`} className="font-medium text-zinc-900 hover:text-indigo-600">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">{ROLE_LABEL[post.target_role] ?? post.target_role}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={post.visibility === "공개" ? "success" : "neutral"}>{post.visibility}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">
                      {(author as { name?: string } | null)?.name ?? "-"}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Button asChild variant="ghost" className="h-7 px-2 text-xs">
                          <Link href={`/admin/board/${post.id}/edit`}>수정</Link>
                        </Button>
                        <form action={deletePost}>
                          <input type="hidden" name="id" value={post.id} />
                          <DeleteButton className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50" />
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
