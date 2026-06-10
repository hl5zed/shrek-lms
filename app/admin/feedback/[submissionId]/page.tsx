import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AreaCommentItem = {
  label: string;
  value: string;
};

function normalizeAreaComments(raw: unknown): AreaCommentItem[] {
  if (!raw || typeof raw !== "object") return [];
  const source = raw as Record<string, unknown>;
  const orderedKeys = ["독해", "사고", "논리", "구성", "표현"];

  return orderedKeys
    .map((label) => {
      const value = typeof source[label] === "string" ? source[label].trim() : "";
      return { label, value };
    })
    .filter((item) => item.value.length > 0);
}

export default async function AdminFeedbackDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { submissionId } = await params;
  const supabase = await createClient();

  const { data: submission } = await supabase
    .from("submissions")
    .select(`
      id,
      content_text,
      file_urls,
      word_count,
      word_count_pure,
      status,
      submitted_at,
      assignments ( title ),
      profiles!student_id ( name )
    `)
    .eq("id", submissionId)
    .single();

  if (!submission) notFound();

  const { data: feedback } = await supabase
    .from("feedbacks")
    .select(`
      comment,
      area_comments,
      score_reading,
      score_thinking,
      score_logic,
      score_structure,
      score_expression,
      teacher_id,
      updated_at
    `)
    .eq("submission_id", submissionId)
    .maybeSingle();

  const teacherName = feedback?.teacher_id
    ? (
        await supabase
          .from("profiles")
          .select("name")
          .eq("id", feedback.teacher_id)
          .maybeSingle()
      ).data?.name ?? "담당 강사 없음"
    : "담당 강사 없음";

  const assignmentTitleRaw = (submission.assignments as { title?: string } | null)?.title;
  const assignmentTitle =
    typeof assignmentTitleRaw === "string" && assignmentTitleRaw.trim().length > 0
      ? assignmentTitleRaw
      : "과제 정보를 불러오지 못했습니다.";

  const studentNameRaw = (submission.profiles as { name?: string } | null)?.name;
  const studentName =
    typeof studentNameRaw === "string" && studentNameRaw.trim().length > 0
      ? studentNameRaw
      : "학생 정보를 불러오지 못했습니다.";

  const submittedAtText = submission.submitted_at
    ? new Date(submission.submitted_at).toLocaleString("ko-KR")
    : "제출일 정보 없음";

  const contentText = typeof submission.content_text === "string" ? submission.content_text : "";
  const hasContent = contentText.trim().length > 0;
  const fileItems = Array.isArray(submission.file_urls) ? submission.file_urls : [];
  const hasFiles = fileItems.length > 0;

  const areaComments = normalizeAreaComments(feedback?.area_comments);
  const hasFeedback = Boolean(feedback);
  const commentText = typeof feedback?.comment === "string" ? feedback.comment.trim() : "";
  const scoreFields = [
    { key: "score_reading", label: "독해력" },
    { key: "score_thinking", label: "사고력" },
    { key: "score_logic", label: "논리력" },
    { key: "score_structure", label: "구성력" },
    { key: "score_expression", label: "표현력" },
  ] as const;

  return (
    <div>
      <Link
        href="/admin/feedback"
        className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
      >
        ← 첨삭 관리 목록
      </Link>

      <div className="mt-4 mb-6">
        <div className="flex items-start gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">{assignmentTitle}</h1>
          <span
            className={`mt-1 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              hasFeedback ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {hasFeedback ? "첨삭 완료" : "첨삭 대기"}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {studentName} · 제출일 {submittedAtText} · {submission.word_count ?? 0}자 (공백 제외{" "}
          {submission.word_count_pure ?? 0}자) · 담당 강사 {teacherName}
        </p>
      </div>

      {!hasContent && !hasFiles ? (
        <div className="mb-5 rounded-2xl border border-[#F4D7A3] bg-[#FFF6E8] p-4">
          <p className="text-sm text-[#A86A00]">
            일부 정보를 불러오지 못했습니다. 필요한 경우 담당 선생님 또는 관리자에게 문의해 주세요.
          </p>
        </div>
      ) : null}

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">학생 답안</p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
          {hasContent ? contentText : "제출 답안이 없습니다."}
        </p>
      </div>

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-zinc-800">첨부 파일</p>
        {hasFiles ? (
          <ul className="space-y-2 text-sm">
            {fileItems.map((item, index) => {
              const typed = item as { name?: string; url?: string };
              const href = typeof typed.url === "string" ? typed.url : "";
              const name = typeof typed.name === "string" && typed.name.trim() ? typed.name : `첨부파일 ${index + 1}`;
              return (
                <li key={`${name}-${index}`}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline-offset-2 hover:underline"
                    >
                      {name}
                    </a>
                  ) : (
                    <span className="text-zinc-500">{name}</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">첨부 파일이 없습니다.</p>
        )}
      </div>

      {!hasFeedback ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-700">첨삭 대기 중입니다.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="mb-5 text-sm font-semibold text-zinc-800">성장지표</p>
            <div className="space-y-4">
              {scoreFields.map((field) => {
                const score = (feedback as Record<string, number | null>)[field.key] ?? 0;
                return (
                  <div key={field.key} className="flex items-center gap-4">
                    <span className="w-16 shrink-0 text-sm text-zinc-600">{field.label}</span>
                    <div className="flex flex-1 gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`h-2.5 flex-1 rounded-full ${n <= score ? "bg-blue-500" : "bg-zinc-100"}`}
                        />
                      ))}
                    </div>
                    <span className="w-8 text-right text-sm font-semibold text-zinc-800">{score}점</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-zinc-800">종합 코멘트</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {commentText || "코멘트가 없습니다."}
            </p>
          </div>

          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-zinc-800">영역별 코멘트</p>
            {areaComments.length > 0 ? (
              <div className="space-y-2">
                {areaComments.map((item) => (
                  <div key={item.label} className="rounded-lg border border-zinc-100 p-3">
                    <p className="text-xs font-semibold text-zinc-500">{item.label}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#A86A00]">영역별 코멘트가 없습니다.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
