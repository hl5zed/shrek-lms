import Link from "next/link";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

// URL 필터 파라미터를 안전하게 해석합니다.
function resolveClassFilter(classId: string | undefined): string {
  return typeof classId === "string" ? classId.trim() : "";
}

type ContentTypeFilter = "all" | "video" | "audio" | "material";

function resolveContentTypeFilter(value: string | undefined): ContentTypeFilter {
  if (value === "video" || value === "audio" || value === "material") return value;
  return "all";
}

function detectVideoProvider(videoUrl: string): string {
  try {
    const hostname = new URL(videoUrl).hostname.toLowerCase();
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("vimeo.com")) return "Vimeo";
    return "Streaming";
  } catch {
    return "Streaming";
  }
}

export default async function AdminLecturesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; contentType?: string }>;
}) {
  const { classId, contentType } = await searchParams;
  const classFilter = resolveClassFilter(classId);
  const contentTypeFilter = resolveContentTypeFilter(contentType);
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name").order("name");

  // 관리자 강의 목록은 전체 lectures를 기준으로 조회합니다.
  let lectureQuery = supabase
    .from("lectures")
    .select(`
      id,
      title,
      material_url,
      video_url,
      created_at,
      class_id,
      classes ( name, teacher_id )
    `)
    .order("created_at", { ascending: false });

  if (classFilter) {
    lectureQuery = lectureQuery.eq("class_id", classFilter);
  }

  const { data: lectures } = await lectureQuery;

  const teacherIds = Array.from(
    new Set(
      (lectures ?? [])
        .map((lecture) => (lecture.classes as { teacher_id?: string } | null)?.teacher_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", teacherIds)
    : { data: [] as Array<{ id: string; name: string | null }> };

  const teacherMap = new Map((teachers ?? []).map((teacher) => [teacher.id, teacher.name ?? "담당 강사 없음"]));

  const rows = (lectures ?? []).map((lecture) => {
    const classInfo = lecture.classes as { name?: string; teacher_id?: string } | null;
    const teacherName = classInfo?.teacher_id
      ? teacherMap.get(classInfo.teacher_id) ?? "담당 강사 없음"
      : "담당 강사 없음";

    return {
      id: lecture.id,
      title: lecture.title?.trim() ? lecture.title : "제목 없음",
      className: classInfo?.name?.trim() ? classInfo.name : "반 정보 없음",
      teacherName,
      videoUrl: lecture.video_url?.trim() ? lecture.video_url : "",
      materialUrl: lecture.material_url?.trim() ? lecture.material_url : "",
      createdAtText: lecture.created_at ? new Date(lecture.created_at).toLocaleDateString("ko-KR") : "등록일 정보 없음",
    };
  });

  // 콘텐츠 타입은 실제 컬럼(video_url, material_url) 기준으로 판별합니다.
  const typedRows = rows.map((row) => {
    const hasVideo = row.videoUrl.length > 0;
    const hasMaterial = row.materialUrl.length > 0;
    const type: Exclude<ContentTypeFilter, "all" | "audio"> = hasVideo ? "video" : "material";
    const provider = hasVideo ? detectVideoProvider(row.videoUrl) : "PDF";

    return {
      ...row,
      hasVideo,
      hasMaterial,
      type,
      provider,
      typeLabel: hasVideo ? "영상" : "PDF/자료",
    };
  });

  const filteredRows = typedRows.filter((row) => {
    if (contentTypeFilter === "all") return true;
    if (contentTypeFilter === "audio") return false;
    return row.type === contentTypeFilter;
  });

  const tabItems: Array<{ key: ContentTypeFilter; label: string }> = [
    { key: "all", label: "전체" },
    { key: "video", label: "영상" },
    { key: "audio", label: "음성" },
    { key: "material", label: "PDF·자료" },
  ];

  function tabHref(nextType: ContentTypeFilter): string {
    const params = new URLSearchParams();
    if (classFilter) params.set("classId", classFilter);
    if (nextType !== "all") params.set("contentType", nextType);
    const query = params.toString();
    return query ? `/admin/lectures?${query}` : "/admin/lectures";
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900">강의 콘텐츠 관리</h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              신규
            </span>
          </div>
          <p className="mt-1 text-sm text-zinc-500">영상 · PDF · 수업자료 및 스트리밍 권한 관리</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/lectures/streaming"
            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            스트리밍 설정
          </Link>
          <Link
            href="/admin/lectures/upload"
            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            콘텐츠 업로드
          </Link>
        </div>
      </div>

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="contentType" value={contentTypeFilter === "all" ? "" : contentTypeFilter} />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">반 필터</label>
            <select
              name="classId"
              defaultValue={classFilter}
              className="h-10 rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="">전체 반</option>
              {(classes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            적용
          </button>
          {classFilter ? (
            <Link
              href="/admin/lectures"
              className="inline-flex h-10 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              초기화
            </Link>
          ) : null}
        </form>
      </Card>

      <Card className="mb-4 p-2">
        <div className="flex flex-wrap gap-1">
          {tabItems.map((tab) => {
            const isActive = contentTypeFilter === tab.key;
            return (
              <Link
                key={tab.key}
                href={tabHref(tab.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-indigo-100 text-indigo-700" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </Card>

      {filteredRows.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">
            {contentTypeFilter === "audio"
              ? "등록된 음성 콘텐츠가 없습니다."
              : classFilter
                ? "선택한 조건에 맞는 강의가 없습니다."
                : "아직 등록된 강의가 없습니다."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => {
            const isVideoCard = row.type === "video";
            const cardTopClass = isVideoCard
              ? "bg-gradient-to-r from-indigo-600 to-indigo-500"
              : "bg-gradient-to-r from-rose-500 to-red-500";
            const content = (
              <Card className="overflow-hidden transition hover:shadow-md">
                <div className={`${cardTopClass} px-4 py-5 text-white`}>
                  <p className="text-xs font-semibold uppercase tracking-wide">{isVideoCard ? row.provider : "PDF 자료"}</p>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{row.title}</h3>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      공개
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {row.className} · {row.typeLabel}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">담당 강사 {row.teacherName}</p>
                  <p className="mt-1 text-xs text-zinc-400">등록일 {row.createdAtText}</p>

                  {isVideoCard ? (
                    <p className="mt-3 text-xs font-medium text-indigo-600">상세 보기 →</p>
                  ) : (
                    <div className="mt-3">
                      {row.materialUrl ? (
                        <a
                          href={row.materialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-rose-600 hover:underline"
                        >
                          열람
                        </a>
                      ) : (
                        <span className="text-xs text-zinc-400">자료 URL이 없습니다.</span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );

            return isVideoCard ? (
              <Link key={row.id} href={`/admin/lectures/${row.id}`}>
                {content}
              </Link>
            ) : (
              <div key={row.id}>{content}</div>
            );
          })}
        </div>
      )}

      <Card className="mt-5 border-indigo-100 bg-indigo-50 p-4">
        <p className="text-sm text-indigo-700">
          모든 콘텐츠는 등록된 URL 방식으로 제공되며 로그인 사용자만 접근할 수 있습니다.
        </p>
      </Card>
    </div>
  );
}
