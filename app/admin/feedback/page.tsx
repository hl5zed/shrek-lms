import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import { Table, TableContainer } from "@/components/ui/Table";

type FeedbackFilter = "all" | "pending" | "reviewed";

function toFilter(value: string | undefined): FeedbackFilter {
  if (value === "pending" || value === "reviewed") return value;
  return "all";
}

function formatElapsed(submittedAt: string): string {
  const submitted = new Date(submittedAt).getTime();
  if (Number.isNaN(submitted)) return "-";

  const diffMs = Date.now() - submitted;
  const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 1) return "1시간 미만";
  if (diffHours < 24) return `${diffHours}시간`;

  const days = Math.floor(diffHours / 24);
  if (days < 7) return `${days}일`;

  const weeks = Math.floor(days / 7);
  return `${weeks}주`;
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const currentFilter = toFilter(status);
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(`
      id,
      submitted_at,
      status,
      student_id,
      assignments ( title ),
      profiles!student_id ( name )
    `)
    .order("submitted_at", { ascending: false });

  const submissionIds = (submissions ?? []).map((item) => item.id);
  const { data: feedbacks } = submissionIds.length
    ? await supabase
        .from("feedbacks")
        .select("submission_id, teacher_id")
        .in("submission_id", submissionIds)
    : { data: [] as Array<{ submission_id: string; teacher_id: string | null }> };

  const teacherIds = Array.from(
    new Set((feedbacks ?? []).map((item) => item.teacher_id).filter((id): id is string => Boolean(id)))
  );
  const { data: teachers } = teacherIds.length
    ? await supabase.from("profiles").select("id, name").in("id", teacherIds)
    : { data: [] as Array<{ id: string; name: string | null }> };

  const feedbackMap = new Map((feedbacks ?? []).map((item) => [item.submission_id, item]));
  const teacherMap = new Map((teachers ?? []).map((item) => [item.id, item.name ?? "담당 강사 없음"]));

  const rows = (submissions ?? []).map((submission) => {
    const typed = submission as unknown as {
      id: string;
      submitted_at: string;
      status: string | null;
      assignments: { title?: string } | null;
      profiles: { name?: string } | null;
    };
    const feedback = feedbackMap.get(typed.id);
    const isReviewed = Boolean(feedback) || typed.status === "reviewed";
    const teacherName = feedback?.teacher_id ? teacherMap.get(feedback.teacher_id) ?? "담당 강사 없음" : "담당 강사 없음";

    return {
      id: typed.id,
      studentName: typed.profiles?.name?.trim() ? typed.profiles.name : "학생 정보 없음",
      assignmentTitle: typed.assignments?.title?.trim() ? typed.assignments.title : "과제 정보 없음",
      submittedAt: typed.submitted_at,
      submittedAtText: typed.submitted_at
        ? new Date(typed.submitted_at).toLocaleString("ko-KR")
        : "제출일 정보 없음",
      elapsed: typed.submitted_at ? formatElapsed(typed.submitted_at) : "-",
      isReviewed,
      teacherName: isReviewed ? teacherName : "-",
    };
  });

  const filteredRows = rows.filter((row) => {
    if (currentFilter === "pending") return !row.isReviewed;
    if (currentFilter === "reviewed") return row.isReviewed;
    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    if (currentFilter === "pending") {
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    }
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });

  const pendingCount = rows.filter((row) => !row.isReviewed).length;
  const reviewedCount = rows.filter((row) => row.isReviewed).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">첨삭 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">
          전체 {rows.length}건 · 첨삭 대기 {pendingCount}건 · 첨삭 완료 {reviewedCount}건
        </p>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/feedback?status=all"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              currentFilter === "all"
                ? "bg-indigo-50 text-indigo-700"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            전체
          </Link>
          <Link
            href="/admin/feedback?status=pending"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              currentFilter === "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            첨삭 대기
          </Link>
          <Link
            href="/admin/feedback?status=reviewed"
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              currentFilter === "reviewed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            첨삭 완료
          </Link>
        </div>
      </Card>

      {sortedRows.length === 0 ? (
        <Card className="border-dashed p-16 text-center">
          <p className="text-sm text-zinc-400">조건에 맞는 제출물이 없습니다.</p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">학생</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">과제</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">제출일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">첨삭 상태</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">경과 시간</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">담당 강사</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {sortedRows.map((row) => (
                <tr key={row.id} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block text-zinc-900">
                      {row.studentName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block text-zinc-700">
                      {row.assignmentTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block text-zinc-500">
                      {row.submittedAtText}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.isReviewed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {row.isReviewed ? "첨삭 완료" : "첨삭 대기"}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block text-zinc-500">
                      {row.isReviewed ? "-" : row.elapsed}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/feedback/${row.id}`} className="block text-zinc-600">
                      {row.teacherName}
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
