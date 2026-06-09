import StudentShell from "@/src/components/student/StudentShell";
import StatCard from "@/src/components/student/StatCard";
import StudentCard from "@/src/components/student/StudentCard";
import TodayBanner from "@/src/components/student/TodayBanner";
import CourseItem from "@/src/components/student/CourseItem";
import { studentData } from "@/src/lib/mock/studentData";

export default function StudentHomePage() {
  return (
    <StudentShell title="학생 홈">
      <TodayBanner
        message={studentData.today.message}
        attendance={studentData.today.attendance}
      />

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="출석률" value={`${studentData.stats.weeklyAttendanceRate}%`} />
        <StatCard label="제출률" value={`${studentData.stats.assignmentSubmitRate}%`} />
        <StatCard label="평균점수" value={`${studentData.stats.averageScore}점`} />
      </div>

      <StudentCard>
        <h2 className="text-sm font-semibold text-[#06091F]">수강 중 강의</h2>
        <div className="mt-3 space-y-2">
          {studentData.courses.map((course) => (
            <CourseItem key={course.id} {...course} />
          ))}
        </div>
      </StudentCard>
    </StudentShell>
  );
}

