import { createClient } from "@/lib/supabase/server";

// 학생 강의 목록 — RLS 적용 시 본인 반 강의만 표시됩니다.
export default async function StudentLecturesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lectures } = await supabase
    .from("lectures")
    .select(`
      id,
      title,
      description,
      video_url,
      audio_url,
      created_at,
      classes!inner ( name, class_students!inner ( student_id ) )
    `)
    .eq("classes.class_students.student_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">강의</h1>
        <p className="mt-1 text-sm text-zinc-500">내 반 강의 목록입니다.</p>
      </div>

      {!lectures || lectures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-16 text-center">
          <p className="text-sm text-zinc-400">등록된 강의가 없습니다.</p>
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
                    {new Date(lec.created_at).toLocaleDateString("ko-KR")} 등록
                  </p>
                  {lec.description && (
                    <p className="mt-2 text-sm text-zinc-500">{lec.description}</p>
                  )}
                </div>
                {lec.video_url && (
                  <a
                    href={lec.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                  >
                    강의 영상 보기
                  </a>
                )}
              </div>
              {lec.audio_url && (
                <div className="mt-3">
                  <audio
                    controls
                    src={lec.audio_url}
                    className="w-full rounded-lg"
                    preload="metadata"
                  >
                    브라우저가 오디오 재생을 지원하지 않습니다.
                  </audio>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
