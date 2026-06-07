import { createClient } from "@/lib/supabase/server";
import {
  ClassSearchParams,
  ClassUpsertInput,
  LmsClassDetail,
  LmsClassRow,
  LmsClassStudent,
} from "@/lib/lms/types";

type ClassJoinRow = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  teacher_id: string | null;
  profiles: { name: string } | null;
};

export async function getClasses(): Promise<LmsClassRow[]> {
  return searchClasses({});
}

export async function searchClasses(params: ClassSearchParams): Promise<LmsClassRow[]> {
  const supabase = await createClient();
  const queryText = params.query?.trim().toLowerCase() ?? "";

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id, name, description, created_at, teacher_id, profiles!teacher_id ( name )")
    .order("created_at", { ascending: false });

  if (error || !classes) return [];

  const classIds = classes.map((c) => c.id);
  const { data: links } = await supabase
    .from("class_students")
    .select("class_id, student_id")
    .in("class_id", classIds);

  const countMap = new Map<string, number>();
  (links ?? []).forEach((row) => {
    const classId = (row as { class_id: string }).class_id;
    countMap.set(classId, (countMap.get(classId) ?? 0) + 1);
  });

  const rows = classes.map((row) => {
    const cls = row as unknown as ClassJoinRow;
    return {
      id: cls.id,
      name: cls.name,
      description: cls.description,
      teacherId: cls.teacher_id,
      teacherName: cls.profiles?.name ?? null,
      studentCount: countMap.get(cls.id) ?? 0,
      createdAt: cls.created_at,
    };
  });

  return rows.filter((row) => !queryText || row.name.toLowerCase().includes(queryText));
}

export async function getClassById(classId: string): Promise<LmsClassDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, description, created_at, teacher_id, profiles!teacher_id ( name )")
    .eq("id", classId)
    .single();

  if (error || !data) return null;
  const row = data as unknown as ClassJoinRow;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    teacherId: row.teacher_id,
    teacherName: row.profiles?.name ?? null,
    createdAt: row.created_at,
  };
}

export async function createClass(input: ClassUpsertInput): Promise<{ ok: boolean; id?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: input.name,
      description: input.description,
      teacher_id: input.teacherId,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false };
  return { ok: true, id: data.id };
}

export async function updateClass(classId: string, input: ClassUpsertInput): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("classes")
    .update({
      name: input.name,
      description: input.description,
      teacher_id: input.teacherId,
    })
    .eq("id", classId);

  return { ok: !error };
}

export async function getClassStudents(classId: string): Promise<LmsClassStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_students")
    .select("student_id, profiles!student_id ( name, email, role )")
    .eq("class_id", classId);

  if (error || !data) return [];
  return data.map((row) => {
    const r = row as unknown as {
      student_id: string;
      profiles: { name: string; email: string; role: string } | null;
    };
    return {
      studentId: r.student_id,
      name: r.profiles?.name ?? "이름 없음",
      email: r.profiles?.email ?? "이메일 없음",
      role: r.profiles?.role ?? "student",
    };
  });
}

export async function addStudentToClass(classId: string, studentId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("class_students")
    .upsert({ class_id: classId, student_id: studentId });
  return { ok: !error };
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("class_students")
    .delete()
    .eq("class_id", classId)
    .eq("student_id", studentId);
  return { ok: !error };
}

export async function getTeachersForClassForm() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("role", "teacher")
    .order("name");
  return data ?? [];
}

export async function getStudentsForClassAssign(classId: string) {
  const supabase = await createClient();
  const [{ data: students }, { data: links }] = await Promise.all([
    supabase.from("profiles").select("id, name, email").eq("role", "student").order("name"),
    supabase.from("class_students").select("student_id").eq("class_id", classId),
  ]);

  const assignedIds = new Set((links ?? []).map((r) => r.student_id));
  return (students ?? []).filter((s) => !assignedIds.has(s.id));
}

export async function getClassByIdOrThrow(classId: string) {
  const cls = await getClassById(classId);
  if (!cls) {
    throw new Error("class_not_found");
  }
  return cls;
}
