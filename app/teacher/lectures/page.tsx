import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 강사 강의 목록 — 본인이 담당하는 반의 강의만 표시됩니다.
export default async function TeacherLecturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 생성자(created_by) 기준이 아니라 담당 반(classes.teacher_id) 기준으로 조회합니다.
  const { data: lectures } = await supabase
    .from("lectures")
    .select(`
      id,
      title,
      description,
      video_url,
      created_at,
      classes!inner ( name, teacher_id )
    `)
    .eq("classes.teacher_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">강의</h1>
          <p className="mt-1 text-sm text-zinc-500">등록한 강의 목록입니다.</p>
        </div>
        <Link
          href="/teacher/lectures/new"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + 강의 등록
        </Link>
      </div>

      {!lectures || lectures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 강의가 없습니다.</p>
          <Link
            href="/teacher/lectures/new"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            첫 강의 등록하기 →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {lectures.map((lec) => (
            <li
              key={lec.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-base font-semibold text-zinc-900">{lec.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {(lec.classes as unknown as { name: string } | null)?.name ?? "반 정보 없음"} ·{" "}
                    {new Date(lec.created_at).toLocaleDateString("ko-KR")} 등록
                  </p>
                  {lec.description && (
                    <p className="mt-2 text-sm text-zinc-500 line-clamp-2">{lec.description}</p>
                  )}
                </div>
                {lec.video_url && (
                  <a
                    href={lec.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    영상 보기
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
