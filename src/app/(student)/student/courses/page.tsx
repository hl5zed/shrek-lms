import StudentShell from "@/src/components/student/StudentShell";
import StudentCard from "@/src/components/student/StudentCard";
import CourseItem from "@/src/components/student/CourseItem";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentCoursesPage() {
  return (
    <StudentShell title="강의 목록">
      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">전체 강의</h2>
        <div className="mt-3 space-y-2">
          {studentData.courses.map((course) => (
            <CourseItem key={course.id} {...course} />
          ))}
        </div>
      </StudentCard>
    </StudentShell>
  );
}

