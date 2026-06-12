import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

// 학부모 대시보드 — 인증/역할 검증은 app/parent/layout.tsx 에서 처리합니다.
export default async function ParentDashboardPage() {
  assertAdminSupabaseEnv();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 공지사항: 전체 또는 학부모 대상 공개 게시글
  const { data: noticePosts } = await adminSupabase
    .from("posts")
    .select("id, title, category, content, created_at")
    .eq("visibility", "공개")
    .or("target_role.eq.all,target_role.eq.parent")
    .order("created_at", { ascending: false })
    .limit(5);

  const CATEGORY_COLOR: Record<string, string> = {
    공지: "bg-indigo-100 text-indigo-700",
    학습자료: "bg-emerald-100 text-emerald-700",
    과제안내: "bg-amber-100 text-amber-700",
    기타: "bg-zinc-100 text-zinc-500",
  };

  // 연결된 자녀 목록 조회
  const { data: children } = await supabase
    .from("parent_students")
    .select("profiles!student_id ( id, name )")
    .eq("parent_id", user!.id);

  const childList = (children ?? [])
    .map((row) => row.profiles as unknown as { id: string; name: string } | null)
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">학부모 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">자녀의 학습 현황을 확인합니다.</p>
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

      {/* 자녀 목록 */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">자녀 목록</h2>

        {childList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
            <p className="mt-1 text-xs text-zinc-400">관리자에게 문의하여 자녀 계정을 연결해주세요.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {childList.map((child) => (
              <li
                key={child.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                  {child.name.charAt(0)}
                </div>
                <p className="text-sm font-medium text-zinc-900">{child.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "과제 현황", href: "/parent/assignments", desc: "제출·첨삭 상태" },
          { label: "첨삭 결과", href: "/parent/feedback", desc: "완료된 첨삭 확인" },
          { label: "성장 추이", href: "/parent/growth", desc: "성장지표 변화" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-zinc-800">{item.label}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
