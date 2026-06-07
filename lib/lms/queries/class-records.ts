import { createClient } from "@/lib/supabase/server";
import {
  AssignmentStatus,
  AttendanceStatus,
  ClassRecord,
  ClassRecordStudent,
  CreateClassRecordInput,
  ParticipationLevel,
  UpdateClassRecordInput,
} from "@/lib/lms/types";

const METADATA_PREFIX = "[[CLASS_RECORD_META_V1]]";

type LegacyLectureJoinRow = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at?: string;
  classes: { name: string } | null;
};

type ClassRecordRow = {
  id: string;
  class_id: string;
  lesson_date: string | null;
  title: string;
  goal: string | null;
  key_concepts: string | null;
  materials: string | null;
  activities: string | null;
  assignment: string | null;
  teacher_memo: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ClassRecordStudentRow = {
  student_id: string;
  attendance_status: string;
  focus_level: string | null;
  understanding_level: string | null;
  presentation_level: string | null;
  discussion_level: string | null;
  assignment_status: string | null;
  memo: string | null;
  profiles: { name: string; email: string } | null;
};

type LegacyClassRecordMeta = {
  lessonDate: string;
  lessonGoal: string;
  keyConcepts: string;
  materials: string;
  classActivities: string;
  assignment: string;
  teacherMemo: string;
  studentRows: ClassRecordStudent[];
};

const defaultMeta: LegacyClassRecordMeta = {
  lessonDate: "",
  lessonGoal: "",
  keyConcepts: "",
  materials: "",
  classActivities: "",
  assignment: "",
  teacherMemo: "",
  studentRows: [],
};

function parseMeta(description: string | null): LegacyClassRecordMeta {
  if (!description?.startsWith(METADATA_PREFIX)) return defaultMeta;
  const jsonText = description.replace(METADATA_PREFIX, "").trim();
  try {
    const parsed = JSON.parse(jsonText) as Partial<LegacyClassRecordMeta>;
    return {
      lessonDate: parsed.lessonDate ?? "",
      lessonGoal: parsed.lessonGoal ?? "",
      keyConcepts: parsed.keyConcepts ?? "",
      materials: parsed.materials ?? "",
      classActivities: parsed.classActivities ?? "",
      assignment: parsed.assignment ?? "",
      teacherMemo: parsed.teacherMemo ?? "",
      studentRows: parsed.studentRows ?? [],
    };
  } catch {
    return defaultMeta;
  }
}

function rateOf(rows: ClassRecordStudent[], matcher: (row: ClassRecordStudent) => boolean): number | null {
  if (!rows.length) return null;
  const hit = rows.filter(matcher).length;
  return Math.round((hit / rows.length) * 100);
}

function parseAttendanceStatus(value: string | null | undefined): AttendanceStatus {
  switch (value) {
    case "late":
      return "지각";
    case "absent":
      return "결석";
    case "makeup":
      return "보강";
    case "출석":
    case "지각":
    case "결석":
    case "보강":
      return value;
    case "present":
    default:
      return "출석";
  }
}

function parseLevel(value: string | null | undefined): "1" | "2" | "3" | "4" | "5" {
  const v = String(value ?? "3").trim();
  if (v === "1" || v === "2" || v === "3" || v === "4" || v === "5") return v;
  return "3";
}

function parseParticipation(value: string | null | undefined): ParticipationLevel {
  if (value === "high" || value === "적극") return "적극";
  if (value === "low" || value === "소극") return "소극";
  return "보통";
}

function parseAssignmentStatus(value: string | null | undefined): AssignmentStatus {
  if (value === "submitted" || value === "제출") return "제출";
  if (value === "late" || value === "지연 제출") return "지연 제출";
  return "미제출";
}

function toDbAttendanceStatus(value: AttendanceStatus): string {
  switch (value) {
    case "지각":
      return "late";
    case "결석":
      return "absent";
    case "보강":
      return "makeup";
    case "출석":
    default:
      return "present";
  }
}

function toDbParticipation(value: ParticipationLevel): string {
  switch (value) {
    case "적극":
      return "high";
    case "소극":
      return "low";
    case "보통":
    default:
      return "medium";
  }
}

function toDbAssignmentStatus(value: AssignmentStatus): string {
  switch (value) {
    case "제출":
      return "submitted";
    case "지연 제출":
      return "late";
    case "미제출":
    default:
      return "not_submitted";
  }
}

function mapStudentRows(rows: ClassRecordStudentRow[]): ClassRecordStudent[] {
  return rows.map((row) => ({
    studentId: row.student_id,
    studentName: row.profiles?.name ?? "이름 없음",
    studentEmail: row.profiles?.email ?? "이메일 없음",
    attendanceStatus: parseAttendanceStatus(row.attendance_status),
    focusLevel: parseLevel(row.focus_level),
    understandingLevel: parseLevel(row.understanding_level),
    presentationParticipation: parseParticipation(row.presentation_level),
    discussionParticipation: parseParticipation(row.discussion_level),
    assignmentStatus: parseAssignmentStatus(row.assignment_status),
    memo: row.memo ?? "",
  }));
}

function normalizedToRecord(
  row: ClassRecordRow,
  className: string,
  studentRows: ClassRecordStudent[],
): ClassRecord {
  return {
    id: row.id,
    classId: row.class_id,
    className,
    title: row.title,
    lessonDate: row.lesson_date ?? "",
    lessonGoal: row.goal ?? "",
    keyConcepts: row.key_concepts ?? "",
    materials: row.materials ?? "",
    classActivities: row.activities ?? "",
    assignment: row.assignment ?? "",
    teacherMemo: row.teacher_memo ?? "",
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attendanceRate: rateOf(studentRows, (studentRow) => studentRow.attendanceStatus === "출석"),
    assignmentSubmitRate: rateOf(studentRows, (studentRow) => studentRow.assignmentStatus === "제출"),
    studentRows,
  };
}

function legacyLectureToRecord(row: LegacyLectureJoinRow): ClassRecord {
  const meta = parseMeta(row.description);
  return {
    id: row.id,
    classId: row.class_id,
    className: row.classes?.name ?? "반 정보 없음",
    title: row.title,
    lessonDate: meta.lessonDate,
    lessonGoal: meta.lessonGoal,
    keyConcepts: meta.keyConcepts,
    materials: meta.materials,
    classActivities: meta.classActivities,
    assignment: meta.assignment,
    teacherMemo: meta.teacherMemo,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    attendanceRate: rateOf(meta.studentRows, (studentRow) => studentRow.attendanceStatus === "출석"),
    assignmentSubmitRate: rateOf(meta.studentRows, (studentRow) => studentRow.assignmentStatus === "제출"),
    studentRows: meta.studentRows,
  };
}

export async function getClassRecords(classId: string): Promise<ClassRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_records")
    .select("id, class_id, lesson_date, title, goal, key_concepts, materials, activities, assignment, teacher_memo, created_by, created_at, updated_at")
    .eq("class_id", classId)
    .order("lesson_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!error && data) {
    const records = data as unknown as ClassRecordRow[];
    const recordIds = records.map((record) => record.id);
    const { data: studentRows } = recordIds.length
      ? await supabase
          .from("class_record_students")
          .select("record_id, student_id, attendance_status, focus_level, understanding_level, presentation_level, discussion_level, assignment_status, memo, profiles!student_id ( name, email )")
          .in("record_id", recordIds)
      : { data: [] as unknown[] };

    const { data: classRow } = await supabase.from("classes").select("name").eq("id", classId).single();
    const className = classRow?.name ?? "반 정보 없음";

    const grouped = new Map<string, ClassRecordStudent[]>();
    (studentRows ?? []).forEach((raw) => {
      const row = raw as unknown as ClassRecordStudentRow & { record_id: string };
      const list = grouped.get(row.record_id) ?? [];
      list.push(...mapStudentRows([row]));
      grouped.set(row.record_id, list);
    });

    return records.map((record) =>
      normalizedToRecord(record, className, grouped.get(record.id) ?? []),
    );
  }

  // 기존 JSON 임시 데이터 fallback (읽기 전용)
  const { data: legacyRows, error: legacyError } = await supabase
    .from("lectures")
    .select("id, class_id, title, description, created_by, created_at, updated_at, classes ( name )")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  if (legacyError || !legacyRows) return [];
  return legacyRows.map((row) => legacyLectureToRecord(row as unknown as LegacyLectureJoinRow));
}

export async function getClassRecordById(recordId: string): Promise<ClassRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_records")
    .select("id, class_id, lesson_date, title, goal, key_concepts, materials, activities, assignment, teacher_memo, created_by, created_at, updated_at")
    .eq("id", recordId)
    .single();

  if (!error && data) {
    const record = data as unknown as ClassRecordRow;
    const [{ data: classRow }, { data: students }] = await Promise.all([
      supabase.from("classes").select("name").eq("id", record.class_id).single(),
      supabase
        .from("class_record_students")
        .select("student_id, attendance_status, focus_level, understanding_level, presentation_level, discussion_level, assignment_status, memo, profiles!student_id ( name, email )")
        .eq("record_id", recordId),
    ]);

    return normalizedToRecord(
      record,
      classRow?.name ?? "반 정보 없음",
      mapStudentRows((students ?? []) as unknown as ClassRecordStudentRow[]),
    );
  }

  // 기존 JSON 임시 데이터 fallback (읽기 전용)
  const { data: legacyData, error: legacyError } = await supabase
    .from("lectures")
    .select("id, class_id, title, description, created_by, created_at, updated_at, classes ( name )")
    .eq("id", recordId)
    .single();

  if (legacyError || !legacyData) return null;
  return legacyLectureToRecord(legacyData as unknown as LegacyLectureJoinRow);
}

export async function createClassRecord(input: CreateClassRecordInput): Promise<{ ok: boolean; id?: string }> {
  const supabase = await createClient();
  const { data: header, error: headerError } = await supabase
    .from("class_records")
    .insert({
      class_id: input.classId,
      lesson_date: input.lessonDate || null,
      title: input.title,
      goal: input.lessonGoal || null,
      key_concepts: input.keyConcepts || null,
      materials: input.materials || null,
      activities: input.classActivities || null,
      assignment: input.assignment || null,
      teacher_memo: input.teacherMemo || null,
      created_by: input.createdBy,
    })
    .select("id")
    .single();

  if (headerError || !header) return { ok: false };

  const insertRows = input.studentRows.map((row) => ({
    record_id: header.id,
    student_id: row.studentId,
    attendance_status: toDbAttendanceStatus(row.attendanceStatus),
    focus_level: row.focusLevel,
    understanding_level: row.understandingLevel,
    presentation_level: toDbParticipation(row.presentationParticipation),
    discussion_level: toDbParticipation(row.discussionParticipation),
    assignment_status: toDbAssignmentStatus(row.assignmentStatus),
    memo: row.memo || null,
  }));

  if (insertRows.length > 0) {
    const { error: rowError } = await supabase.from("class_record_students").insert(insertRows);
    if (rowError) return { ok: false };
  }

  return { ok: true, id: header.id };
}

export async function updateClassRecord(recordId: string, input: UpdateClassRecordInput): Promise<{ ok: boolean }> {
  const current = await getClassRecordById(recordId);
  if (!current) return { ok: false };
  const supabase = await createClient();
  const lessonDate = input.lessonDate ?? current.lessonDate;
  const lessonGoal = input.lessonGoal ?? current.lessonGoal;
  const keyConcepts = input.keyConcepts ?? current.keyConcepts;
  const materials = input.materials ?? current.materials;
  const classActivities = input.classActivities ?? current.classActivities;
  const assignment = input.assignment ?? current.assignment;
  const teacherMemo = input.teacherMemo ?? current.teacherMemo;

  const { error: headerError } = await supabase
    .from("class_records")
    .update({
      lesson_date: lessonDate || null,
      title: input.title ?? current.title,
      goal: lessonGoal || null,
      key_concepts: keyConcepts || null,
      materials: materials || null,
      activities: classActivities || null,
      assignment: assignment || null,
      teacher_memo: teacherMemo || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", recordId);

  if (headerError) return { ok: false };
  if (!input.studentRows) return { ok: true };
  return upsertClassRecordStudentRows(recordId, input.studentRows);
}

export async function getClassRecordStudents(recordId: string): Promise<ClassRecordStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_record_students")
    .select("student_id, attendance_status, focus_level, understanding_level, presentation_level, discussion_level, assignment_status, memo, profiles!student_id ( name, email )")
    .eq("record_id", recordId);
  if (error || !data) return [];
  return mapStudentRows(data as unknown as ClassRecordStudentRow[]);
}

export async function upsertClassRecordStudentRows(
  recordId: string,
  rows: ClassRecordStudent[],
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const payload = rows.map((row) => ({
    record_id: recordId,
    student_id: row.studentId,
    attendance_status: toDbAttendanceStatus(row.attendanceStatus),
    focus_level: row.focusLevel,
    understanding_level: row.understandingLevel,
    presentation_level: toDbParticipation(row.presentationParticipation),
    discussion_level: toDbParticipation(row.discussionParticipation),
    assignment_status: toDbAssignmentStatus(row.assignmentStatus),
    memo: row.memo || null,
  }));
  const { error } = await supabase
    .from("class_record_students")
    .upsert(payload, { onConflict: "record_id,student_id" });
  return { ok: !error };
}

export async function getClassStudentsForRecord(classId: string): Promise<ClassRecordStudent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("class_students")
    .select("student_id, profiles!student_id ( name, email )")
    .eq("class_id", classId);

  if (error || !data) return [];
  return data.map((row) => {
    const typed = row as unknown as {
      student_id: string;
      profiles: { name: string; email: string } | null;
    };
    return {
      studentId: typed.student_id,
      studentName: typed.profiles?.name ?? "이름 없음",
      studentEmail: typed.profiles?.email ?? "이메일 없음",
      attendanceStatus: "출석" as AttendanceStatus,
      focusLevel: "3",
      understandingLevel: "3",
      presentationParticipation: "보통" as ParticipationLevel,
      discussionParticipation: "보통" as ParticipationLevel,
      assignmentStatus: "미제출" as AssignmentStatus,
      memo: "",
    };
  });
}
