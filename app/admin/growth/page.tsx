import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import GrowthClient, {
  type GrowthMetricItem,
  type GrowthMonthlyPoint,
  type GrowthStudentOption,
} from "./GrowthClient";

type FeedbackWithSubmission = {
  score_reading: number | null;
  score_thinking: number | null;
  score_logic: number | null;
  score_structure: number | null;
  score_expression: number | null;
  created_at: string;
  submissions: {
    submitted_at: string | null;
  } | null;
};

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toHundred(value: number | null) {
  if (value === null) return null;
  return Math.round(value * 20);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminGrowthPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const { studentId } = await searchParams;

  try {
    assertAdminSupabaseEnv();
  } catch {
    return <p className="text-sm text-red-600">관리자 Supabase 환경변수가 설정되지 않았습니다.</p>;
  }

  const { data: students } = await adminSupabase
    .from("profiles")
    .select("id, name")
    .eq("role", "student")
    .order("name");

  const studentOptions: GrowthStudentOption[] =
    students?.map((student) => ({ id: student.id, name: student.name ?? "이름 없음" })) ?? [];

  const selectedStudentId =
    studentOptions.find((student) => student.id === studentId)?.id ??
    studentOptions[0]?.id ??
    "";

  if (!selectedStudentId) {
    return <p className="text-sm text-zinc-500">학생 데이터가 없습니다.</p>;
  }

  const { data: classRows } = await adminSupabase
    .from("class_students")
    .select("class_id, classes(name)")
    .eq("student_id", selectedStudentId);

  const className = ((classRows?.[0]?.classes as { name?: string } | null)?.name ?? "반 정보 없음").trim();

  const { data: submissions } = await adminSupabase
    .from("submissions")
    .select("id, submitted_at")
    .eq("student_id", selectedStudentId);
  const submissionIds = (submissions ?? []).map((submission) => submission.id);

  const { data: feedbackRaw } = submissionIds.length
    ? await adminSupabase
        .from("feedbacks")
        .select(`
          score_reading,
          score_thinking,
          score_logic,
          score_structure,
          score_expression,
          created_at,
          submissions!inner ( submitted_at )
        `)
        .in("submission_id", submissionIds)
    : { data: [] as FeedbackWithSubmission[] };

  const feedbacks = (feedbackRaw ?? []) as FeedbackWithSubmission[];

  const readingAvg = average(feedbacks.map((feedback) => feedback.score_reading).filter((v): v is number => v !== null));
  const thinkingAvg = average(feedbacks.map((feedback) => feedback.score_thinking).filter((v): v is number => v !== null));
  const logicAvg = average(feedbacks.map((feedback) => feedback.score_logic).filter((v): v is number => v !== null));
  const structureAvg = average(feedbacks.map((feedback) => feedback.score_structure).filter((v): v is number => v !== null));
  const expressionAvg = average(feedbacks.map((feedback) => feedback.score_expression).filter((v): v is number => v !== null));

  const creativityAvg = average(
    feedbacks
      .map((feedback) =>
        average([feedback.score_expression, feedback.score_thinking].filter((v): v is number => v !== null)),
      )
      .filter((v): v is number => v !== null),
  );

  const discussionAvg = average(
    feedbacks
      .map((feedback) =>
        average([feedback.score_reading, feedback.score_logic].filter((v): v is number => v !== null)),
      )
      .filter((v): v is number => v !== null),
  );

  const submissionCount = submissions?.length ?? 0;
  const feedbackCount = feedbacks.length;
  const estimatedMissed = Math.max(0, submissionCount - feedbackCount);
  const diligenceScore =
    submissionCount + estimatedMissed > 0
      ? Math.min(100, Math.round((submissionCount / (submissionCount + estimatedMissed)) * 100))
      : null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const thisMonthRows = feedbacks.filter((feedback) => {
    const date = new Date(feedback.created_at);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });
  const prevMonthRows = feedbacks.filter((feedback) => {
    const date = new Date(feedback.created_at);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return date.getFullYear() === prevYear && date.getMonth() === prevMonth;
  });

  const toFeedbackAvg = (rows: FeedbackWithSubmission[]) =>
    average(
      rows
        .flatMap((row) => [row.score_reading, row.score_thinking, row.score_logic, row.score_structure, row.score_expression])
        .filter((v): v is number => v !== null),
    );
  const monthDeltaRaw = (() => {
    const current = toFeedbackAvg(thisMonthRows);
    const previous = toFeedbackAvg(prevMonthRows);
    if (current === null || previous === null) return null;
    return Math.round((current - previous) * 20);
  })();

  const metrics: GrowthMetricItem[] = [
    { label: "독해력", score: toHundred(readingAvg), delta: monthDeltaRaw, color: "blue" },
    { label: "논리력", score: toHundred(logicAvg), delta: monthDeltaRaw, color: "green" },
    { label: "구성력", score: toHundred(structureAvg), delta: monthDeltaRaw, color: "yellow" },
    { label: "표현력", score: toHundred(expressionAvg), delta: monthDeltaRaw, color: "orange" },
    { label: "사고력", score: toHundred(thinkingAvg), delta: monthDeltaRaw, color: "green" },
    { label: "창의성", score: toHundred(creativityAvg), delta: monthDeltaRaw, color: "blue" },
    { label: "성실도", score: diligenceScore, delta: monthDeltaRaw, color: "blue" },
    { label: "발표·토론력", score: toHundred(discussionAvg), delta: monthDeltaRaw, color: "blue" },
  ];

  const monthlyMap = new Map<string, number[]>();
  feedbacks.forEach((feedback) => {
    const createdAt = new Date(feedback.created_at);
    const key = monthKey(createdAt);
    const values = [
      feedback.score_reading,
      feedback.score_thinking,
      feedback.score_logic,
      feedback.score_structure,
      feedback.score_expression,
    ].filter((value): value is number => value !== null);
    if (!values.length) return;
    const list = monthlyMap.get(key) ?? [];
    list.push(...values);
    monthlyMap.set(key, list);
  });

  const monthlyPoints: GrowthMonthlyPoint[] = [];
  for (let offset = 3; offset >= 0; offset -= 1) {
    const date = new Date(currentYear, currentMonth - offset, 1);
    const key = monthKey(date);
    const values = monthlyMap.get(key) ?? [];
    const avg = average(values);
    monthlyPoints.push({
      monthLabel: `${date.getMonth() + 1}월`,
      score: avg === null ? 0 : Math.round(avg * 20),
    });
  }

  const readingRubricLevel =
    readingAvg === null ? 0 : readingAvg >= 4.5 ? 5 : readingAvg >= 3.5 ? 4 : readingAvg >= 2.5 ? 3 : 2;

  return (
    <GrowthClient
      students={studentOptions}
      selectedStudentId={selectedStudentId}
      selectedStudentLabel={studentOptions.find((student) => student.id === selectedStudentId)?.name ?? "학생"}
      selectedClassLabel={className}
      metrics={metrics}
      monthlyPoints={monthlyPoints}
      readingRubricLevel={readingRubricLevel}
    />
  );
}
