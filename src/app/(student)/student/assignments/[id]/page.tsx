import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AssignmentSubmitClient from "@/src/components/student/AssignmentSubmitClient";
import { submitFileAction, submitTextAction } from "./actions";

export default async function StudentAssignmentDetailPage({
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

  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, due_date, classes(name)")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const { data: submission } = await supabase
    .from("submissions")
    .select("status, content_text, submitted_at")
    .eq("assignment_id", id)
    .eq("student_id", user.id)
    .maybeSingle();

  const classes = assignment.classes as { name?: string } | null;
  const submittedAtFormatted = submission?.submitted_at
    ? (() => {
        const d = new Date(submission.submitted_at);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hour}:${minute}`;
      })()
    : null;

  return (
    <AssignmentSubmitClient
      assignmentId={assignment.id}
      title={assignment.title ?? "제목 없음"}
      description={assignment.description ?? ""}
      className={classes?.name ?? "반 정보 없음"}
      dday={assignment.due_date}
      minLen={300}
      maxLen={3000}
      submissionStatus={submission?.status ?? null}
      initialText={submission?.content_text ?? ""}
      submittedAtFormatted={submittedAtFormatted}
      serverStatus={null}
      textAction={submitTextAction.bind(null, id)}
      fileAction={submitFileAction.bind(null, id)}
    />
  );
}

