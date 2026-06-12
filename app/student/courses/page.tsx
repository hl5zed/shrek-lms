import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";

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

export default async function StudentCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") redirect("/login");

  // 수강 중인 반 + 선생님 정보
  const { data: classLinks } = await supabase
    .from("class_students")
    .select(`
      class_id,
      classes (
        id,
        name,
        description,
        teacher_id,
        profiles!teacher_id ( name )
      )
    `)
    .eq("student_id", user.id);

  type ClassRow = {
    id: string;
    name: string;
    description: string | null;
    teacher_id: string | null;
    profiles: { name: string } | null;
  };

  const classes = (classLinks ?? [])
    .map((r) => r.classes as unknown as ClassRow | null)
    .filter((c): c is ClassRow => Boolean(c));

  const classIds = classes.map((c) => c.id);

  // 반별 강의 전체 조회
  type LectureRow = {
    id: string;
    title: string | null;
    description: string | null;
    video_url: string | null;
    material_url: string | null;
    created_at: string;
    class_id: string;
  };

  const { data: allLectures } = classIds.length
    ? await supabase
        .from("lectures")
        .select("id, title, description, video_url, material_url, created_at, class_id")
        .in("class_id", classIds)
        .order("created_at", { ascending: false })
    : { data: [] as LectureRow[] };

  // class_id 별 강의 그룹핑
  const lectureMap = new Map<string, LectureRow[]>();
  (allLectures ?? []).forEach((lec) => {
    if (!lectureMap.has(lec.class_id)) lectureMap.set(lec.class_id, []);
    lectureMap.get(lec.class_id)!.push(lec as LectureRow);
  });

  return (
    <StudentShell title="강의 목록">
      {classes.length === 0 ? (
        <StudentCard>
          <p className="text-sm text-[#6470BF]">
            수강 중인 반이 없습니다. 담당 선생님 또는 관리자에게 문의해 주세요.
          </p>
        </StudentCard>
      ) : (
        classes.map((cls) => {
          const lectures = lectureMap.get(cls.id) ?? [];
          const teacherName = cls.profiles?.name ?? "담당 강사 미배정";
          return (
            <StudentCard key={cls.id}>
              {/* 반 헤더 */}
              <div className="mb-3 border-b border-[#D4D9F5] pb-3">
                <h2 className="text-sm font-bold text-[#06091F]">{cls.name}</h2>
                <p className="text-xs text-[#6470BF]">
                  {teacherName} · 강의 {lectures.length}개
                </p>
                {cls.description && (
                  <p className="mt-1 text-xs text-[#4A55A8]">{cls.description}</p>
                )}
              </div>

              {lectures.length === 0 ? (
                <p className="text-xs text-[#6470BF]">아직 등록된 강의가 없습니다.</p>
              ) : (
                <ul className="space-y-3">
                  {lectures.map((lec) => {
                    const embedUrl = lec.video_url ? getEmbedUrl(lec.video_url) : null;
                    return (
                      <li key={lec.id} className="rounded-xl border border-[#D4D9F5] overflow-hidden">
                        {/* YouTube / Vimeo 임베드 */}
                        {embedUrl && (
                          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
                            <iframe
                              src={embedUrl}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* 일반 영상 URL이면 플레이스홀더 */}
                        {!embedUrl && lec.video_url && (
                          <div className="flex items-center justify-center bg-[#EEF1FF] py-5">
                            <span className="text-3xl">🎬</span>
                          </div>
                        )}

                        <div className="p-3">
                          <p className="text-sm font-semibold text-[#06091F]">
                            {lec.title ?? "제목 없음"}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6470BF]">
                            {new Date(lec.created_at).toLocaleDateString("ko-KR")} 등록
                          </p>
                          {lec.description && (
                            <p className="mt-1 text-xs text-[#4A55A8] line-clamp-2">
                              {lec.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-2">
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
                                className="rounded-lg border border-[#3A4BFF] px-3 py-1.5 text-xs font-semibold text-[#3A4BFF]"
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
                                📄 자료 보기
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
          );
        })
      )}
    </StudentShell>
  );
}
