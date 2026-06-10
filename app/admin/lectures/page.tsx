import Link from "next/link";
import Card from "@/components/ui/Card";
import { Table, TableContainer } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/server";

// URL 필터 파라미터를 안전하게 해석합니다.
function resolveClassFilter(classId: string | undefined): string {
  return typeof classId === "string" ? classId.trim() : "";
}

export default async function AdminLecturesPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const classFilter = resolveClassFilter(classId);
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name").order("name");

  // 관리자 강의 목록은 전체 lectures를 기준으로 조회합니다.
  let lectureQuery = supabase
    .from("lectures")
    .select(`
      id,
      title,
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
      hasVideo: Boolean(lecture.video_url?.trim()),
      createdAtText: lecture.created_at ? new Date(lecture.created_at).toLocaleDateString("ko-KR") : "등록일 정보 없음",
    };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">강의 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">전체 강의 {rows.length}건</p>
      </div>

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-2">
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

      {rows.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">
            {classFilter ? "선택한 반에 등록된 강의가 없습니다." : "아직 등록된 강의가 없습니다."}
          </p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">강의 제목</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">담당 강사</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">대상 반</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">영상 URL</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/lectures/${row.id}`} className="block font-medium text-zinc-900">
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/lectures/${row.id}`} className="block">
                      {row.teacherName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/lectures/${row.id}`} className="block">
                      {row.className}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/lectures/${row.id}`} className="block">
                      {row.hasVideo ? "있음" : "없음"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500">
                    <Link href={`/admin/lectures/${row.id}`} className="block">
                      {row.createdAtText}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
