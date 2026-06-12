import Link from "next/link";
import Card from "@/components/ui/Card";
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
  searchParams: Promise<{ classId?: string; tab?: string; q?: string }>;
}) {
  const { classId, tab } = await searchParams;
  const classFilter = resolveClassFilter(classId);
  const tabValue = tab === "active" || tab === "closed" ? tab : "all";
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

  const today = new Date().toISOString().slice(0, 10);
  if (tabValue === "active") {
    assignmentQuery = assignmentQuery.gte("due_date", today);
  } else if (tabValue === "closed") {
    assignmentQuery = assignmentQuery.lt("due_date", today);
  }

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

  const inProgressCount = rows.filter((row) => row.dueState !== "past").length;
  const totalSubmitted = rows.reduce((sum, row) => sum + row.submittedCount, 0);
  const totalStudents = rows.reduce((sum, row) => sum + row.studentCount, 0);
  const totalSubmitRate = totalStudents > 0 ? Math.round((totalSubmitted / totalStudents) * 100) : 0;

  const tabBaseParams = new URLSearchParams();
  if (classFilter) tabBaseParams.set("classId", classFilter);

  const allTabParams = new URLSearchParams(tabBaseParams);
  const activeTabParams = new URLSearchParams(tabBaseParams);
  activeTabParams.set("tab", "active");
  const closedTabParams = new URLSearchParams(tabBaseParams);
  closedTabParams.set("tab", "closed");

  const allTabHref = `/admin/assignments${allTabParams.toString() ? `?${allTabParams.toString()}` : ""}`;
  const activeTabHref = `/admin/assignments${activeTabParams.toString() ? `?${activeTabParams.toString()}` : ""}`;
  const closedTabHref = `/admin/assignments${closedTabParams.toString() ? `?${closedTabParams.toString()}` : ""}`;

  const clearClassParams = new URLSearchParams();
  if (tabValue !== "all") clearClassParams.set("tab", tabValue);
  const clearClassHref = `/admin/assignments${clearClassParams.toString() ? `?${clearClassParams.toString()}` : ""}`;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">과제 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">전체 {rows.length}건</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            name="q"
            placeholder="과제, 반, 강사 검색"
            className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-indigo-400 sm:w-64"
          />
          <Link
            href="/teacher/assignments/new"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            과제 생성
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-zinc-100 bg-white p-4">
          <p className="text-xs text-zinc-500">전체 과제</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{rows.length}건</p>
        </Card>
        <Card className="border border-zinc-100 bg-white p-4">
          <p className="text-xs text-zinc-500">진행 중</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{inProgressCount}건</p>
        </Card>
        <Card className="border border-zinc-100 bg-white p-4">
          <p className="text-xs text-zinc-500">전체 제출률</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{totalSubmitRate}%</p>
        </Card>
      </div>

      <Card className="mb-4 p-0">
        <div className="flex items-center gap-5 border-b border-zinc-100 px-4 pt-3">
          <Link
            href={allTabHref}
            className={`pb-2 text-sm font-medium ${
              tabValue === "all" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            전체
          </Link>
          <Link
            href={activeTabHref}
            className={`pb-2 text-sm font-medium ${
              tabValue === "active" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            진행중
          </Link>
          <Link
            href={closedTabHref}
            className={`pb-2 text-sm font-medium ${
              tabValue === "closed" ? "border-b-2 border-indigo-600 text-indigo-700" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            마감됨
          </Link>
        </div>
      </Card>

      <Card className="mb-4 p-4">
        <form className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="tab" value={tabValue} />
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
              href={clearClassHref}
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
            {tabValue === "active"
              ? "현재 진행 중인 과제가 없습니다."
              : tabValue === "closed"
                ? "마감된 과제가 없습니다."
                : classFilter
                  ? "선택한 반에 등록된 과제가 없습니다."
                  : "아직 등록된 과제가 없습니다."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {rows.map((row) => {
            const dueDate = new Date(row.dueDate);
            const todayOnly = new Date();
            todayOnly.setHours(0, 0, 0, 0);
            const dueOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
            const diffDays = Math.floor((dueOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24));
            const dLabel = diffDays >= 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
            const progressPercent =
              row.studentCount > 0 ? Math.min(100, Math.round((row.submittedCount / row.studentCount) * 100)) : 0;

            return (
              <Link
                key={row.id}
                href={`/admin/assignments/${row.id}`}
                className="block overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:shadow-sm"
              >
                <div
                  className={`px-4 py-2 text-xs font-medium text-white ${
                    row.dueState === "past" ? "bg-zinc-400" : row.dueState === "soon" ? "bg-amber-500" : "bg-indigo-500"
                  }`}
                >
                  {row.className} · {row.teacherName}
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-zinc-900">{row.title}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.dueState === "past"
                          ? "bg-zinc-100 text-zinc-700"
                          : row.dueState === "soon"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {row.dueState === "past" ? "마감됨" : `${dLabel}일`}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600">마감일: {row.dueDate}</p>
                  <div>
                    <div className="h-2 w-full rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      {row.submittedCount}/{row.studentCount}명 제출 ({progressPercent}%)
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
