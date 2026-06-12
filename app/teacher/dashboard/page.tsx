import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

// 강사 대시보드 — 인증/역할 검증은 app/teacher/layout.tsx 에서 처리합니다.
export default async function TeacherDashboardPage() {
  assertAdminSupabaseEnv();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 공지사항: 전체 또는 강사 대상 공개 게시글
  const { data: noticePosts } = await adminSupabase
    .from("posts")
    .select("id, title, category, content, created_at")
    .eq("visibility", "공개")
    .or("target_role.eq.all,target_role.eq.teacher")
    .order("created_at", { ascending: false })
    .limit(5);

  const CATEGORY_COLOR: Record<string, string> = {
    공지: "bg-indigo-100 text-indigo-700",
    학습자료: "bg-emerald-100 text-emerald-700",
    과제안내: "bg-amber-100 text-amber-700",
    기타: "bg-zinc-100 text-zinc-500",
  };

  // 첨삭 대기 제출물 목록 (최근 10건)
  const { data: pendingSubmissions } = await supabase
    .from("submissions")
    .select(`
      id,
      submitted_at,
      assignments!inner (
        title,
        classes!inner ( teacher_id )
      ),
      profiles ( name )
    `)
    .eq("status", "submitted")
    .eq("assignments.classes.teacher_id", user!.id)
    .order("submitted_at", { ascending: false })
    .limit(10);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">강사 대시보드</h1>
            <p className="mt-1 text-sm text-zinc-500">첨삭 대기 제출물을 확인합니다.</p>
          </div>
          <LogoutButton />
        </div>
      </div>

      {/* 공지사항 */}
      <div className="mb-8">
        <h2 className="mb-4 text-base font-semibold text-zinc-800">공지사항</h2>
        {!noticePosts || noticePosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
            <p className="text-sm text-zinc-400">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {noticePosts.map((post) => (
              <li key={post.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[post.category] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-medium text-zinc-900">{post.title}</p>
                {post.content && (
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-2">{post.content}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 첨삭 대기 섹션 */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold text-zinc-800">첨삭 대기</h2>
          {pendingSubmissions && pendingSubmissions.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pendingSubmissions.length}건
            </span>
          )}
        </div>

        {!pendingSubmissions || pendingSubmissions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-400">대기 중인 제출물이 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {pendingSubmissions.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/teacher/submissions/${sub.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {(sub.assignments as unknown as { title: string } | null)?.title ?? "과제"}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {(sub.profiles as unknown as { name: string } | null)?.name ?? "학생"} ·{" "}
                      {new Date(sub.submitted_at).toLocaleDateString("ko-KR")} 제출
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    첨삭 대기
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <Link
            href="/teacher/submissions"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            전체 제출함 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
