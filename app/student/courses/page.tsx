import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import CourseItem from "@/src/components/student/CourseItem";
import { getStudentCoursesByUserId } from "@/src/lib/student/courses";

export default async function StudentCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    redirect("/login");
  }

  const result = await getStudentCoursesByUserId(user.id);

  return (
    <StudentShell title="강의 목록">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">전체 강의</h2>
        {!result.ok ? (
          <p className="mt-3 text-sm text-[#C03232]">
            강의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        ) : result.courses.length === 0 ? (
          <p className="mt-3 text-sm text-[#6470BF]">
            현재 연결된 강의가 없습니다. 담당 선생님 또는 관리자에게 문의해 주세요.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {result.courses.map((course) => (
              <CourseItem key={course.id} {...course} />
            ))}
          </div>
        )}
      </StudentCard>
    </StudentShell>
  );
}

