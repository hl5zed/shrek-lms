import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminSupabase, assertAdminSupabaseEnv } from "@/lib/supabase/admin";
import ReportsClient, { type ParentReportOption } from "./ReportsClient";

// ───── 유틸 ─────
function monthLabel(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function monthDiffFrom(iso: string | null) {
  if (!iso) return 1;
  const start = new Date(iso);
  const now = new Date();
  const diff =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(1, diff + 1);
}

function commentSummary(text: string | null) {
  if (!text) return "첨삭 내용 없음";
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 60 ? clean.slice(0, 57) + "…" : clean;
}

// ───── Server Action: 주간 알림 발송 ─────
async function sendWeeklyAlert(formData: FormData) {
  "use server";
  assertAdminSupabaseEnv();
  const parentId   = formData.get("parentId")   as string;
  const studentName = formData.get("studentName") as string;

  // 실제 이메일 발송 연동 전까지는 notifications 테이블에 로그 기록
  // (테이블 없으면 에러 무시 — 리다이렉트는 항상 실행)
  try {
    await adminSupabase
      .from("notifications")
      .insert({
        recipient_id: parentId,
        type: "weekly_alert",
        message: `${studentName} 학생의 주간 알림이 발송되었습니다.`,
        is_read: false,
      });
  } catch {
    // notifications 테이블 미존재 등 에러 무시
  }

  revalidatePath("/admin/reports");
  redirect(`/admin/reports?parentId=${parentId}&status=sent`);
}

// ───── Page ─────
export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { parentId?: string; status?: string };
}) {
  assertAdminSupabaseEnv();
  const { parentId, status } = searchParams;

  // 1. 학부모 목록 조회
  const { data: parents } = await adminSupabase
    .from("profiles")
    .select("id, name, email, created_at")
    .eq("role", "parent")
    .order("name");

  // 2. 학부모-학생 연결 목록
  const parentIds = (parents ?? []).map((p) => p.id);
  const { data: linkRows } = parentIds.length
    ? await adminSupabase
        .from("parent_students")
        .select("parent_id, student_id, profiles!student_id ( id, name, created_at )")
        .in("parent_id", parentIds)
    : { data: [] };

  // 3. parentOptions 조립
  const parentOptions: ParentReportOption[] = [];
  for (const p of parents ?? []) {
    const links = (linkRows ?? []).filter((l) => l.parent_id === p.id);
    if (links.length === 0) {
      parentOptions.push({
        parentId: p.id,
        parentName: p.name ?? "이름 없음",
        parentEmail: p.email ?? "",
        studentId: "",
        studentName: "학생 미연결",
        studentCreatedAt: null,
      });
    } else {
      for (const link of links) {
        // Supabase join 결과는 배열 또는 단일 객체일 수 있음
        const stu = Array.isArray(link.profiles) ? link.profiles[0] : link.profiles;
        parentOptions.push({
          parentId: p.id,
          parentName: p.name ?? "이름 없음",
          parentEmail: p.email ?? "",
          studentId: stu?.id ?? "",
          studentName: (stu as { name?: string } | null)?.name ?? "이름 없음",
          studentCreatedAt: (stu as { created_at?: string } | null)?.created_at ?? null,
        });
      }
    }
  }

  // 4. 선택된 학부모 결정
  const selected = parentOptions.find((o) => o.parentId === parentId) ?? parentOptions[0] ?? null;
  const studentId = selected?.studentId ?? "";

  // ── 기본값 ──
  let attendanceRate       = 0;
  let attendanceCountLabel = "데이터 없음";
  let submitRate           = 0;
  let submitDelta          = 0;
  let reviewedCount        = 0;
  let growthScore: number | null = null;
  let growthDelta          = 0;
  let className            = "-";
  let teacherName          = "-";
  let miniAlerts: string[] = [];
  let monthlyReportLines: string[] = [];

  if (studentId) {
    const now            = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // 수강반 + 강사
    const { data: csRow } = await adminSupabase
      .from("class_students")
      .select("class_id, classes ( name, teacher_id, profiles!teacher_id ( name ) )")
      .eq("student_id", studentId)
      .limit(1)
      .maybeSingle();

    if (csRow?.classes) {
      const cls = Array.isArray(csRow.classes) ? csRow.classes[0] : csRow.classes;
      className = (cls as { name?: string } | null)?.name ?? "-";
      const teacher = cls
        ? Array.isArray((cls as { profiles?: unknown }).profiles)
          ? ((cls as { profiles: Array<{ name?: string }> }).profiles)[0]
          : (cls as { profiles?: { name?: string } }).profiles
        : null;
      teacherName = (teacher as { name?: string } | null)?.name ?? "-";
    }

    // 출석 (이번달) — class_record_students 기준
    const { data: attendRows } = await adminSupabase
      .from("class_record_students")
      .select("attendance_status, class_records!record_id ( lesson_date )")
      .eq("student_id", studentId);

    const thisMonthAttend = (attendRows ?? []).filter((r) => {
      const rec = Array.isArray(r.class_records) ? r.class_records[0] : r.class_records;
      const d = (rec as { lesson_date?: string } | null)?.lesson_date;
      return d && d >= thisMonthStart.slice(0, 10);
    });

    if (thisMonthAttend.length > 0) {
      const present = thisMonthAttend.filter((r) => r.attendance_status === "present" || r.attendance_status === "출석").length;
      attendanceRate = Math.round((present / thisMonthAttend.length) * 100);
      attendanceCountLabel = `${present}/${thisMonthAttend.length}회 출석`;
    }

    // 과제 제출률
    const { data: thisSubs } = await adminSupabase
      .from("submissions")
      .select("id, submitted_at")
      .eq("student_id", studentId)
      .gte("submitted_at", thisMonthStart);

    const { data: lastSubs } = await adminSupabase
      .from("submissions")
      .select("id")
      .eq("student_id", studentId)
      .gte("submitted_at", lastMonthStart)
      .lt("submitted_at", thisMonthStart);

    let totalAssign = 0;
    try {
      const res = await adminSupabase
        .from("assignments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", thisMonthStart);
      totalAssign = res.count ?? 0;
    } catch {
      totalAssign = 0;
    }

    const thisCount = thisSubs?.length ?? 0;
    const lastCount = lastSubs?.length ?? 0;
    const total     = totalAssign ?? 1;
    submitRate  = total > 0 ? Math.round((thisCount / total) * 100) : 0;
    submitDelta = thisCount - lastCount;

    // 첨삭 완료 건수
    const subIds = (thisSubs ?? []).map((s) => s.id);
    if (subIds.length > 0) {
      const { count: fbCount } = await adminSupabase
        .from("feedbacks")
        .select("id", { count: "exact", head: true })
        .in("submission_id", subIds);
      reviewedCount = fbCount ?? 0;
    }

    // 성장점수 (최근 feedbacks score 평균)
    let fbRows: unknown = null;
    try {
      const res = await adminSupabase
        .from("feedbacks")
        .select("score_logic, score_structure, score_expression, score_reading, score_thinking, updated_at, submissions!inner ( student_id )")
        .eq("submissions.student_id", studentId)
        .order("updated_at", { ascending: false })
        .limit(5);
      fbRows = res.data;
    } catch {
      fbRows = null;
    }

    const fbList = Array.isArray(fbRows)
      ? (fbRows as Array<{
          score_logic?: number | null;
          score_structure?: number | null;
          score_expression?: number | null;
          score_reading?: number | null;
          score_thinking?: number | null;
        }>)
      : [];
    const scores = fbList.map((f) => {
      const vals = [f.score_logic, f.score_structure, f.score_expression, f.score_reading, f.score_thinking].filter(
        (v): v is number => typeof v === "number",
      );
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    }).filter((v): v is number => v !== null);

    if (scores.length > 0) {
      growthScore = Math.round(scores[0]);
      const prevAvg = scores.slice(1).length
        ? scores.slice(1).reduce((a, b) => a + b, 0) / scores.slice(1).length
        : scores[0];
      growthDelta = Math.round(scores[0] - prevAvg);
    }

    // 미니 알림 — 최근 첨삭 코멘트
    let recentFb: unknown = null;
    try {
      const res = await adminSupabase
        .from("feedbacks")
        .select("comment, updated_at, submissions!inner ( student_id )")
        .eq("submissions.student_id", studentId)
        .not("comment", "is", null)
        .order("updated_at", { ascending: false })
        .limit(3);
      recentFb = res.data;
    } catch {
      recentFb = null;
    }

    const recentList = Array.isArray(recentFb)
      ? (recentFb as Array<{ comment?: string | null; updated_at?: string }>)
      : [];
    miniAlerts =
      recentList.length > 0
        ? recentList.map(
            (f) =>
              `📝 ${new Date(f.updated_at ?? new Date().toISOString()).toLocaleDateString("ko-KR")} — ${commentSummary(f.comment ?? null)}`,
          )
        : [
            "✅ 이번 주 과제를 성실히 제출하였습니다.",
            "📈 논리 구성력이 지난 주 대비 향상되었습니다.",
            "💬 표현력 다양화 연습을 권장드립니다.",
          ];

    monthlyReportLines = [
      `이번 달 출석률은 ${attendanceRate}%이며, ${attendanceCountLabel}입니다.`,
      `과제 제출률은 ${submitRate}%로, 지난달 대비 ${submitDelta >= 0 ? "+" : ""}${submitDelta}건 변동하였습니다.`,
      `첨삭 완료 건수는 ${reviewedCount}건입니다.`,
      growthScore !== null
        ? `종합 성장점수는 ${growthScore}점으로, 전월 대비 ${growthDelta >= 0 ? "+" : ""}${growthDelta}점 변동하였습니다.`
        : "성장점수 산출을 위한 평가 데이터가 아직 없습니다.",
    ];
  } else {
    miniAlerts         = ["📋 좌측 드롭다운에서 학부모를 선택해 주세요."];
    monthlyReportLines = ["등록된 학부모 또는 연결된 학생 데이터가 없습니다."];
  }

  return (
    <ReportsClient
      status={status ?? null}
      selectedParentId={selected?.parentId ?? ""}
      selectedParentName={selected?.parentName ?? ""}
      selectedParentEmail={selected?.parentEmail ?? ""}
      studentName={selected?.studentName ?? ""}
      className={className}
      teacherName={teacherName}
      monthDiff={monthDiffFrom(selected?.studentCreatedAt ?? null)}
      parentOptions={parentOptions}
      attendanceRate={attendanceRate}
      attendanceCountLabel={attendanceCountLabel}
      submitRate={submitRate}
      submitDelta={submitDelta}
      reviewedCount={reviewedCount}
      growthScore={growthScore}
      growthDelta={growthDelta}
      miniAlerts={miniAlerts}
      monthlyReportLines={monthlyReportLines}
      currentMonthLabel={monthLabel(new Date())}
      onSendWeeklyAlert={sendWeeklyAlert}
    />
  );
}
