import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import { Table, TableContainer } from "@/components/ui/Table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select(`
      id,
      title,
      description,
      due_date,
      class_id,
      created_by,
      classes ( name, teacher_id )
    `)
    .eq("id", id)
    .single();

  if (!assignment) notFound();

  const classInfo = assignment.classes as { name?: string; teacher_id?: string } | null;
  const teacherId = classInfo?.teacher_id ?? assignment.created_by ?? null;

  const { data: teacher } = teacherId
    ? await supabase.from("profiles").select("id, name").eq("id", teacherId).maybeSingle()
    : { data: null as { id: string; name: string | null } | null };

  const { data: classStudents } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", assignment.class_id);

  const studentIds = (classStudents ?? []).map((item) => item.student_id);
  const { data: students } = studentIds.length
    ? await supabase.from("profiles").select("id, name").in("id", studentIds)
    : { data: [] as Array<{ id: string; name: string | null }> };

  const { data: submissions } = studentIds.length
    ? await supabase
        .from("submissions")
        .select("id, student_id, submitted_at, status")
        .eq("assignment_id", id)
        .in("student_id", studentIds)
    : { data: [] as Array<{ id: string; student_id: string; submitted_at: string | null; status: string | null }> };

  const submissionIds = (submissions ?? []).map((item) => item.id);
  const { data: feedbacks } = submissionIds.length
    ? await supabase.from("feedbacks").select("submission_id").in("submission_id", submissionIds)
    : { data: [] as Array<{ submission_id: string }> };

  const feedbackSubmissionSet = new Set((feedbacks ?? []).map((item) => item.submission_id));

  const studentMap = new Map((students ?? []).map((item) => [item.id, item.name ?? "이름 없음"]));
  const submissionByStudent = new Map((submissions ?? []).map((item) => [item.student_id, item]));

  const studentRows = studentIds
    .map((studentId) => {
      const submission = submissionByStudent.get(studentId);
      const isSubmitted = Boolean(submission);
      const isReviewed = submission ? feedbackSubmissionSet.has(submission.id) || submission.status === "reviewed" : false;

      return {
        studentId,
        studentName: studentMap.get(studentId) ?? "학생 정보 없음",
        isSubmitted,
        submittedAtText: submission?.submitted_at
          ? new Date(submission.submitted_at).toLocaleString("ko-KR")
          : "-",
        feedbackStatus: !submission ? "-" : isReviewed ? "첨삭 완료" : "첨삭 대기",
        feedbackHref: submission ? `/admin/feedback/${submission.id}` : "",
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "ko"));

  const title = assignment.title?.trim() ? assignment.title : "제목 없음";
  const description = assignment.description?.trim() ? assignment.description : "과제 설명이 없습니다.";
  const className = classInfo?.name?.trim() ? classInfo.name : "반 정보 없음";
  const teacherName = teacher?.name?.trim() ? teacher.name : "담당 강사 없음";

  return (
    <div>
      <Link
        href="/admin/assignments"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 과제 관리 목록
      </Link>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{className} · {teacherName}</p>
      </div>

      <Card className="mb-4 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">과제 기본 정보</p>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">마감일</dt>
            <dd className="text-zinc-800">{assignment.due_date}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">대상 반</dt>
            <dd className="text-zinc-800">{className}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-zinc-500">담당 강사</dt>
            <dd className="text-zinc-800">{teacherName}</dd>
          </div>
        </dl>
      </Card>

      <Card className="mb-5 p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">과제 설명</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{description}</p>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-zinc-800">
        학생별 제출 상태 <span className="font-normal text-zinc-400">({studentRows.length}명)</span>
      </h2>

      {studentRows.length === 0 ? (
        <Card className="border-dashed p-12 text-center">
          <p className="text-sm text-zinc-400">이 반에 등록된 학생이 없습니다.</p>
        </Card>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">학생명</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">제출 여부</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">제출일</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">첨삭 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {studentRows.map((row) => (
                <tr key={row.studentId} className="transition hover:bg-zinc-50">
                  <td className="px-5 py-3.5 text-zinc-900">{row.studentName}</td>
                  <td className="px-5 py-3.5">
                    {row.isSubmitted ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">제출</span>
                    ) : (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">미제출</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {row.feedbackHref ? (
                      <Link href={row.feedbackHref} className="text-indigo-600 hover:underline">
                        {row.submittedAtText}
                      </Link>
                    ) : (
                      row.submittedAtText
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {row.feedbackHref ? (
                      <Link href={row.feedbackHref} className="text-indigo-600 hover:underline">
                        {row.feedbackStatus}
                      </Link>
                    ) : (
                      row.feedbackStatus
                    )}
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
