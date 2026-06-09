import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

// 강사 대시보드 — 인증/역할 검증은 app/teacher/layout.tsx 에서 처리합니다.
export default async function TeacherDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
