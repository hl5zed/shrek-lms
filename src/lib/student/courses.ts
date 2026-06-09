import { createClient } from "@/lib/supabase/server";

export type StudentCourseView = {
  id: string;
  title: string;
  teacherName: string;
  schedule: string;
  progress: number;
  status: "in_progress" | "completed";
  lessonCount: number;
  description: string;
};

export async function getStudentCoursesByUserId(userId: string): Promise<{
  ok: boolean;
  courses: StudentCourseView[];
}> {
  const supabase = await createClient();

  const { data: classLinks, error: classError } = await supabase
    .from("class_students")
    .select("class_id, classes ( id, name, description, teacher_id, profiles!teacher_id ( name ) )")
    .eq("student_id", userId);

  if (classError || !classLinks) {
    return { ok: false, courses: [] };
  }

  const classRows = classLinks
    .map((row) => row.classes as unknown as {
      id: string;
      name: string;
      description: string | null;
      teacher_id: string | null;
      profiles: { name: string } | null;
    } | null)
    .filter(Boolean) as {
    id: string;
    name: string;
    description: string | null;
    teacher_id: string | null;
    profiles: { name: string } | null;
  }[];

  if (classRows.length === 0) {
    return { ok: true, courses: [] };
  }

  const classIds = classRows.map((item) => item.id);
  const { data: lectures, error: lectureError } = await supabase
    .from("lectures")
    .select("id, class_id")
    .in("class_id", classIds);

  if (lectureError) {
    return { ok: false, courses: [] };
  }

  const lectureCountMap = new Map<string, number>();
  (lectures ?? []).forEach((lecture) => {
    lectureCountMap.set(
      lecture.class_id,
      (lectureCountMap.get(lecture.class_id) ?? 0) + 1,
    );
  });

  const courses: StudentCourseView[] = classRows.map((item) => {
    const lessonCount = lectureCountMap.get(item.id) ?? 0;
    const progress = lessonCount > 0 ? Math.min(100, 30 + lessonCount * 10) : 0;
    return {
      id: item.id,
      title: item.name,
      teacherName: item.profiles?.name ?? "담당 강사 미배정",
      schedule: "시간표 정보 준비중",
      progress,
      status: lessonCount > 0 ? "in_progress" : "completed",
      lessonCount,
      description: item.description ?? "반 설명이 아직 등록되지 않았습니다.",
    };
  });

  return { ok: true, courses };
}

