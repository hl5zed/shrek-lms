import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import StatCard from "@/src/components/student/StatCard";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";

function getEmbedUrl(videoUrl: string): string | null {
  try {
    const url = new URL(videoUrl);
    if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
    }
    if (url.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed${url.pathname}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      return `https://player.vimeo.com/video${url.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default async function StudentHomePage() {
  assertAdminSupabaseEnv();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  // 수강 중인 반 목록
  const { data: classLinks } = await supabase
    .from("class_students")
    .select("class_id, classes ( id, name )")
    .eq("student_id", user.id);

  const classIds = (classLinks ?? [])
    .map((r) => r.class_id)
    .filter(Boolean) as string[];

  // 최근 강의 5개
  const { data: recentLectures } = classIds.length
    ? await supabase
        .from("lectures")
        .select("id, title, description, video_url, material_url, created_at, class_id, classes ( name )")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
        .limit(5)
    : { data: [] as any[] };

  const lectures = recentLectures ?? [];

  // 공지사항: 전체 또는 학생 대상 공개 게시글
  const { data: noticePosts } = await adminSupabase
    .from("posts")
    .select("id, title, category, content, created_at")
    .eq("visibility", "공개")
    .or("target_role.eq.all,target_role.eq.student")
    .order("created_at", { ascending: false })
    .limit(5);

  const CATEGORY_COLOR: Record<string, string> = {
    공지: "bg-indigo-100 text-indigo-700",
    학습자료: "bg-emerald-100 text-emerald-700",
    과제안내: "bg-amber-100 text-amber-700",
    기타: "bg-zinc-100 text-zinc-500",
  };

  return (
    <StudentShell title="홈" showGreeting>
      {/* 인사 */}
      <div className="rounded-2xl bg-[#EEF1FF] p-4">
        <p className="text-sm font-medium text-[#161D55]">
          안녕하세요, {profile?.name ?? "학생"}님!
        </p>
        <p className="mt-0.5 text-xs text-[#6470BF]">오늘도 열심히 수강해봐요 🎓</p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="수강 중인 반" value={`${classIds.length}개`} />
        <StatCard label="강의 수" value={`${lectures.length}개`} />
      </div>

      {/* 최근 강의 */}
      <StudentCard>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#06091F]">최근 강의</h2>
          <Link href="/student/courses" className="text-xs text-[#3A4BFF] hover:underline">
            전체 보기 →
          </Link>
        </div>

        {lectures.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">등록된 강의가 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {lectures.map((lec) => {
              const classInfo = lec.classes as { name?: string } | null;
              const embedUrl = lec.video_url ? getEmbedUrl(lec.video_url) : null;
              return (
                <li key={lec.id} className="rounded-xl border border-[#D4D9F5] overflow-hidden">
                  {/* 영상 임베드 (YouTube/Vimeo) */}
                  {embedUrl && (
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        src={embedUrl}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#06091F] line-clamp-2">{lec.title ?? "제목 없음"}</p>
                    <p className="mt-0.5 text-xs text-[#6470BF]">
                      {classInfo?.name ?? "반 정보 없음"} · {new Date(lec.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    {lec.description && (
                      <p className="mt-1 text-xs text-[#4A55A8] line-clamp-2">{lec.description}</p>
                    )}
                    <div className="mt-2 flex gap-2">
                      <Link
                        href={`/student/courses/${lec.id}`}
                        className="rounded-lg bg-[#3A4BFF] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        강의 보기
                      </Link>
                      {!embedUrl && lec.video_url && (
                        <a
                          href={lec.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#D4D9F5] px-3 py-1.5 text-xs font-medium text-[#3A4BFF]"
                        >
                          영상 열기
                        </a>
                      )}
                      {lec.material_url && (
                        <a
                          href={lec.material_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#D4D9F5] px-3 py-1.5 text-xs font-medium text-[#6470BF]"
                        >
                          자료 보기
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </StudentCard>
      {/* 공지사항 */}
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">공지사항</h2>
        {!noticePosts || noticePosts.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">등록된 공지사항이 없습니다.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {noticePosts.map((post) => (
              <li key={post.id} className="border-b border-[#D4D9F5] pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLOR[post.category] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {post.category}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[#06091F]">{post.title}</p>
                {post.content && (
                  <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">{post.content}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </StudentCard>
    </StudentShell>
  );
}
