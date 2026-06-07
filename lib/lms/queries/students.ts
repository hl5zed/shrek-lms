import { createClient } from "@/lib/supabase/server";
import {
  LmsStudentPanelRow,
  StudentProfileDetail,
  StudentProfileUpdateInput,
  StudentRecentSubmission,
  StudentSearchParams,
} from "@/lib/lms/types";

type ClassStudentJoin = {
  class_id: string;
  classes: { name: string } | null;
};

type ParentStudentJoin = {
  parent_id: string;
};

type SubmissionJoin = {
  id: string;
  status: "submitted" | "reviewed";
  submitted_at: string;
  assignments: { title: string } | null;
  feedbacks: { comment: string | null }[] | null;
};

export async function getStudents(): Promise<LmsStudentPanelRow[]> {
  return searchStudents({});
}

export async function searchStudents(params: StudentSearchParams): Promise<LmsStudentPanelRow[]> {
  const supabase = await createClient();
  const queryText = params.query?.trim().toLowerCase() ?? "";

  const { data: students, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, role, created_at")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (error || !students) return [];

  const studentIds = students.map((s) => s.id);
  if (studentIds.length === 0) return [];

  const [{ data: classRows }, { data: parentRows }] = await Promise.all([
    supabase
      .from("class_students")
      .select("student_id, class_id, classes ( name )")
      .in("student_id", studentIds),
    supabase
      .from("parent_students")
      .select("student_id, parent_id")
      .in("student_id", studentIds),
  ]);

  const classMap = new Map<string, string[]>();
  (classRows ?? []).forEach((row) => {
    const r = row as unknown as { student_id: string } & ClassStudentJoin;
    const current = classMap.get(r.student_id) ?? [];
    current.push(r.classes?.name ?? "미지정");
    classMap.set(r.student_id, current);
  });

  const parentCountMap = new Map<string, number>();
  (parentRows ?? []).forEach((row) => {
    const r = row as unknown as { student_id: string } & ParentStudentJoin;
    parentCountMap.set(r.student_id, (parentCountMap.get(r.student_id) ?? 0) + 1);
  });

  const mapped = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    classIds: (classRows ?? [])
      .filter((row) => (row as unknown as { student_id: string }).student_id === s.id)
      .map((row) => (row as unknown as ClassStudentJoin).class_id),
    classLabel: (classMap.get(s.id) ?? []).join(", ") || "미배정",
    parentCount: parentCountMap.get(s.id) ?? 0,
    role: s.role as "student" | "admin" | "teacher" | "parent",
    createdAt: s.created_at,
  }));

  return mapped.filter((s) => {
    const matchQuery =
      !queryText ||
      s.name.toLowerCase().includes(queryText) ||
      s.email.toLowerCase().includes(queryText);
    const matchClass = !params.classId || s.classIds.includes(params.classId);
    return matchQuery && matchClass;
  });
}

export async function getStudentRecentSubmissions(studentId: string): Promise<StudentRecentSubmission[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, status, submitted_at, assignments ( title ), feedbacks ( comment )")
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => {
    const r = row as unknown as SubmissionJoin;
    return {
      id: r.id,
      assignmentTitle: r.assignments?.title ?? "과제명 없음",
      submittedAt: r.submitted_at,
      status: r.status,
      feedbackComment: r.feedbacks?.[0]?.comment ?? null,
    };
  });
}

export async function getStudentById(studentId: string): Promise<StudentProfileDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, phone, role, created_at")
    .eq("id", studentId)
    .eq("role", "student")
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role as "student" | "admin" | "teacher" | "parent",
    createdAt: data.created_at,
  };
}

export async function updateStudentProfile(
  studentId: string,
  input: StudentProfileUpdateInput
): Promise<{ ok: boolean; message?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      name: input.name,
      email: input.email,
      phone: input.phone,
    })
    .eq("id", studentId)
    .eq("role", "student");

  if (error) {
    return { ok: false, message: "학생 정보 저장에 실패했습니다." };
  }

  return { ok: true };
}

export async function getStudentClassLinks(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("class_students")
    .select("class_id, classes ( name )")
    .eq("student_id", studentId);
  return data ?? [];
}

export async function getStudentParentLinks(studentId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("parent_students")
    .select("parent_id, profiles!parent_id ( name, email )")
    .eq("student_id", studentId);
  return data ?? [];
}
