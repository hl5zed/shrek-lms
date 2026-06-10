import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Table, TableContainer } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/server";

function resolveClassFilter(classId: string | undefined): string {
  return typeof classId === "string" ? classId.trim() : "";
}

function summarizeContent(row: {
  goal: string | null;
  activities: string | null;
  teacher_memo: string | null;
}): string {
  const summary = row.goal?.trim() || row.activities?.trim() || row.teacher_memo?.trim() || "";
  return summary.length > 0 ? summary : "수업 내용 요약이 없습니다.";
}

function sortByLatest(a: { lessonDate: string | null; createdAt: string }, b: { lessonDate: string | null; createdAt: string }) {
  const aTime = a.lessonDate ? new Date(a.lessonDate).getTime() : new Date(a.createdAt).getTime();
  const bTime = b.lessonDate ? new Date(b.lessonDate).getTime() : new Date(b.createdAt).getTime();
  return bTime - aTime;
}

export default async function AdminRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const classFilter = resolveClassFilter(classId);
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name, teacher_id").order("name");
  const filteredClassIds = classFilter ? [classFilter] : (classes ?? []).map((item) => item.id);

  // 전체 반 기준 수업기록을 조회하고, 필요 시 classId 필터를 적용합니다.
  const { data: records } = filteredClassIds.length
    ? await supabase
        .from("class_records")
        .select("id, class_id, lesson_date, title, goal, activities, teacher_memo, created_at")
        .in("class_id", filteredClassIds)
    : { data: [] as Array<{
        id: string;
        class_id: string;
        lesson_date: string | null;
        title: string;
        goal: string | null;
        activities: string | null;
        teacher_memo: string | null;
        created_at: string;
      }> };

  const teacherIds = Array.from(
    new Set((classes ?? []).map((item) => item.teacher_id).filter((id): id is string => Boolean(id)))
  );
  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", teacherIds)
    : { data: [] as Array<{ id: string; name: string | null }> };

  const classMap = new Map((classes ?? []).map((item) => [item.id, item]));
  const teacherMap = new Map((teachers ?? []).map((item) => [item.id, item.name ?? "담당 강사 없음"]));

  const rows = (records ?? [])
    .map((record) => {
      const classInfo = classMap.get(record.class_id);
      const className = classInfo?.name?.trim() ? classInfo.name : "반 정보 없음";
      const teacherName = classInfo?.teacher_id
        ? teacherMap.get(classInfo.teacher_id) ?? "담당 강사 없음"
        : "담당 강사 없음";
      const lessonDateText = record.lesson_date
        ? new Date(record.lesson_date).toLocaleDateString("ko-KR")
        : "수업일 미지정";

      return {
        id: record.id,
        classId: record.class_id,
        title: record.title?.trim() ? record.title : "수업명 없음",
        lessonDate: record.lesson_date,
        lessonDateText,
        createdAt: record.created_at,
        className,
        teacherName,
        summary: summarizeContent(record),
      };
    })
    .sort(sortByLatest);

  const canCreate = classFilter.length > 0;
  const createHref = canCreate ? `/admin/classes/${classFilter}/records/new` : "/admin/records";

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">수업기록</h1>
          <p className="mt-1 text-sm text-zinc-500">전체 반 수업기록 {rows.length}건</p>
        </div>
        {canCreate ? (
          <Button asChild variant="primary">
            <Link href={createHref}>기록 작성</Link>
          </Button>
        ) : (
          <Button variant="ghost" disabled title="반을 먼저 선택해 주세요.">
            기록 작성
          </Button>
        )}
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
              href="/admin/records"
              className="inline-flex h-10 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              초기화
            </Link>
          ) : null}
        </form>
        {!canCreate ? (
          <p className="mt-2 text-xs text-amber-700">기록 작성은 반을 선택한 뒤 진행할 수 있습니다.</p>
        ) : null}
      </Card>

      {rows.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">
            {classFilter ? "선택한 반에 등록된 수업기록이 없습니다." : "아직 등록된 수업기록이 없습니다."}
          </p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">수업일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">반 이름</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">담당 강사</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">수업 내용 요약</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/classes/${row.classId}/records/${row.id}`} className="block">
                      {row.lessonDateText}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-900">
                    <Link href={`/admin/classes/${row.classId}/records/${row.id}`} className="block font-medium">
                      {row.className}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/classes/${row.classId}/records/${row.id}`} className="block">
                      {row.teacherName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link
                      href={`/admin/classes/${row.classId}/records/${row.id}`}
                      className="block max-w-[560px] truncate"
                      title={row.summary}
                    >
                      {row.summary}
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
