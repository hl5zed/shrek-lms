import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lecture } = await supabase
    .from("lectures")
    .select(`
      id,
      title,
      description,
      video_url,
      material_url,
      created_at,
      created_by,
      classes ( name, teacher_id )
    `)
    .eq("id", id)
    .single();

  if (!lecture) notFound();

  const classInfo = lecture.classes as { name?: string; teacher_id?: string } | null;
  const teacherId = classInfo?.teacher_id ?? lecture.created_by ?? null;
  const { data: teacher } = teacherId
    ? await supabase.from("profiles").select("name").eq("id", teacherId).maybeSingle()
    : { data: null as { name?: string } | null };

  const title = lecture.title?.trim() ? lecture.title : "제목 없음";
  const description = lecture.description?.trim() ? lecture.description : "설명이 없습니다.";
  const className = classInfo?.name?.trim() ? classInfo.name : "반 정보 없음";
  const teacherName = teacher?.name?.trim() ? teacher.name : "담당 강사 없음";
  const createdAtText = lecture.created_at
    ? new Date(lecture.created_at).toLocaleString("ko-KR")
    : "등록일 정보 없음";
  const videoUrl = lecture.video_url?.trim() ? lecture.video_url : "";
  const materialUrl = lecture.material_url?.trim() ? lecture.material_url : "";

  return (
    <div>
      <Link
        href="/admin/lectures"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 강의 관리 목록
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{className} · {teacherName}</p>
      </div>

      <Card className="mb-4 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">강의 설명</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{description}</p>
      </Card>

      <Card className="mb-4 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">영상 URL</p>
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
          >
            {videoUrl}
          </a>
        ) : (
          <p className="text-sm text-zinc-500">영상 URL이 없습니다.</p>
        )}
      </Card>

      <Card className="mb-4 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">자료 파일</p>
        {materialUrl ? (
          <a
            href={materialUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-indigo-600 underline-offset-2 hover:underline"
          >
            자료 파일 열기
          </a>
        ) : (
          <p className="text-sm text-zinc-500">등록된 자료 파일이 없습니다.</p>
        )}
      </Card>

      <Card className="p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">기본 정보</p>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">대상 반</dt>
            <dd className="text-zinc-800">{className}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">담당 강사</dt>
            <dd className="text-zinc-800">{teacherName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">등록일</dt>
            <dd className="text-zinc-800">{createdAtText}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
