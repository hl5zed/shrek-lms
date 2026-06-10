import Link from "next/link";
import Card from "@/components/ui/Card";
import { Table, TableContainer } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/server";

function resolveClassFilter(classId: string | undefined): string {
  return typeof classId === "string" ? classId.trim() : "";
}

function getDueState(dueDate: string): "past" | "soon" | "upcoming" {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(dueDate);
  const dueOnly = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffDays = Math.floor((dueOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "past";
  if (diffDays <= 3) return "soon";
  return "upcoming";
}

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const classFilter = resolveClassFilter(classId);
  const supabase = await createClient();

  const { data: classes } = await supabase.from("classes").select("id, name").order("name");

  // 관리자 과제 목록은 전체 assignments를 기준으로 조회합니다.
  let assignmentQuery = supabase
    .from("assignments")
    .select(`
      id,
      title,
      due_date,
      class_id,
      created_by,
      classes ( name, teacher_id )
    `)
    .order("due_date", { ascending: true });

  if (classFilter) {
    assignmentQuery = assignmentQuery.eq("class_id", classFilter);
  }

  const { data: assignments } = await assignmentQuery;

  const assignmentIds = (assignments ?? []).map((item) => item.id);
  const classIds = Array.from(new Set((assignments ?? []).map((item) => item.class_id).filter(Boolean)));

  const { data: submissions } = assignmentIds.length
    ? await supabase.from("submissions").select("id, assignment_id").in("assignment_id", assignmentIds)
    : { data: [] as Array<{ id: string; assignment_id: string }> };

  const { data: classStudents } = classIds.length
    ? await supabase.from("class_students").select("class_id, student_id").in("class_id", classIds)
    : { data: [] as Array<{ class_id: string; student_id: string }> };

  const teacherIds = Array.from(
    new Set(
      (assignments ?? [])
        .flatMap((item) => {
          const classInfo = item.classes as { teacher_id?: string } | null;
          return [classInfo?.teacher_id, item.created_by];
        })
        .filter((id): id is string => Boolean(id))
    )
  );

  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", teacherIds)
    : { data: [] as Array<{ id: string; name: string | null }> };

  const submissionCountMap = new Map<string, number>();
  (submissions ?? []).forEach((item) => {
    const current = submissionCountMap.get(item.assignment_id) ?? 0;
    submissionCountMap.set(item.assignment_id, current + 1);
  });

  const classStudentCountMap = new Map<string, number>();
  (classStudents ?? []).forEach((item) => {
    const current = classStudentCountMap.get(item.class_id) ?? 0;
    classStudentCountMap.set(item.class_id, current + 1);
  });

  const teacherMap = new Map((teachers ?? []).map((item) => [item.id, item.name ?? "담당 강사 없음"]));

  const rows = (assignments ?? []).map((item) => {
    const classInfo = item.classes as { name?: string; teacher_id?: string } | null;
    const teacherId = classInfo?.teacher_id ?? item.created_by ?? null;
    const dueState = getDueState(item.due_date);
    return {
      id: item.id,
      title: item.title?.trim() ? item.title : "제목 없음",
      className: classInfo?.name?.trim() ? classInfo.name : "반 정보 없음",
      teacherName: teacherId ? teacherMap.get(teacherId) ?? "담당 강사 없음" : "담당 강사 없음",
      dueDate: item.due_date,
      dueState,
      submittedCount: submissionCountMap.get(item.id) ?? 0,
      studentCount: classStudentCountMap.get(item.class_id) ?? 0,
    };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">과제 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">전체 과제 {rows.length}건</p>
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
              href="/admin/assignments"
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
            {classFilter ? "선택한 반에 등록된 과제가 없습니다." : "아직 등록된 과제가 없습니다."}
          </p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">과제 제목</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">대상 반</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">담당 강사</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">마감일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">제출 현황</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/assignments/${row.id}`} className="block font-medium text-zinc-900">
                      {row.title}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/assignments/${row.id}`} className="block">
                      {row.className}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/assignments/${row.id}`} className="block">
                      {row.teacherName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/assignments/${row.id}`} className="block">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600">{row.dueDate}</span>
                        {row.dueState === "past" ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                            지난 과제
                          </span>
                        ) : row.dueState === "soon" ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                            마감 임박
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    <Link href={`/admin/assignments/${row.id}`} className="block">
                      {row.submittedCount}/{row.studentCount}
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
