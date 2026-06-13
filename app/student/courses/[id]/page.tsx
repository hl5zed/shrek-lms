import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import { getEmbedUrl } from "@/lib/lectures/video-url";

export default async function StudentLectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 강의 조회 + 해당 반에 학생이 등록되어 있는지 검증
  const { data: lecture } = await supabase
    .from("lectures")
    .select(`
      id,
      title,
      description,
      video_url,
      audio_url,
      material_url,
      created_at,
      class_id,
      classes (
        id,
        name,
        teacher_id,
        profiles!teacher_id ( name ),
        class_students ( student_id )
      )
    `)
    .eq("id", id)
    .single();

  if (!lecture) notFound();

  // 수강 권한 확인 (해당 반 소속 학생인지)
  const classInfo = lecture.classes as unknown as {
    id: string;
    name: string;
    teacher_id: string | null;
    profiles: { name: string } | null;
    class_students: { student_id: string }[];
  } | null;

  const isEnrolled = (classInfo?.class_students ?? []).some(
    (cs) => cs.student_id === user.id
  );

  if (!isEnrolled) redirect("/student/courses");

  const title = lecture.title?.trim() || "제목 없음";
  const description = lecture.description?.trim() || null;
  const teacherName = classInfo?.profiles?.name ?? "담당 강사 없음";
  const className = classInfo?.name ?? "반 정보 없음";
  const videoUrl = lecture.video_url?.trim() || null;
  const audioUrl = lecture.audio_url?.trim() || null;
  const materialUrl = lecture.material_url?.trim() || null;
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  const createdAt = new Date(lecture.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <StudentShell title={title} backHref="/student/courses">
      {/* 영상 플레이어 */}
      {embedUrl && (
        <div className="overflow-hidden rounded-2xl border border-[#D4D9F5]">
          <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* 일반 영상 URL (임베드 불가) */}
      {!embedUrl && videoUrl && (
        <StudentCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#06091F]">강의 영상</p>
              <p className="mt-0.5 text-xs text-[#6470BF]">외부 링크로 열립니다.</p>
            </div>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#3A4BFF] px-4 py-2 text-xs font-semibold text-white"
            >
              영상 보기 →
            </a>
          </div>
        </StudentCard>
      )}

      {/* 영상 없음 */}
      {!videoUrl && (
        <StudentCard>
          <p className="text-sm text-[#6470BF]">아직 영상이 등록되지 않은 강의입니다.</p>
        </StudentCard>
      )}

      {/* 강의 음성 파일 */}
      {audioUrl && (
        <StudentCard>
          <p className="text-xs text-[#6470BF]">🎧 강의 음성</p>
          <audio controls className="mt-2 w-full">
            <source src={audioUrl} />
            브라우저가 오디오 재생을 지원하지 않습니다.
          </audio>
        </StudentCard>
      )}

      {/* 강의 정보 */}
      <StudentCard>
        <h1 className="text-base font-bold text-[#06091F]">{title}</h1>
        <p className="mt-1 text-xs text-[#6470BF]">
          {className} · {teacherName}
        </p>
        <p className="mt-0.5 text-xs text-[#9AA0D4]">{createdAt} 등록</p>

        {description && (
          <>
            <hr className="my-3 border-[#D4D9F5]" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#4A55A8]">
              {description}
            </p>
          </>
        )}
      </StudentCard>

      {/* 학습 자료 */}
      {materialUrl && (
        <StudentCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#06091F]">📄 학습 자료</p>
              <p className="mt-0.5 text-xs text-[#6470BF]">PDF 또는 첨부 파일을 확인하세요.</p>
            </div>
            <a
              href={materialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#D4D9F5] px-4 py-2 text-xs font-semibold text-[#3A4BFF]"
            >
              자료 열기 →
            </a>
          </div>
        </StudentCard>
      )}

      {/* 강의 목록으로 */}
      <div className="pb-2 text-center">
        <Link href="/student/courses" className="text-xs text-[#6470BF] hover:text-[#3A4BFF]">
          ← 강의 목록으로 돌아가기
        </Link>
      </div>
    </StudentShell>
  );
}
