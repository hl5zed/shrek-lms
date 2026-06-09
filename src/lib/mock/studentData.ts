export type StudentProfile = {
  id: string;
  name: string;
  email: string;
  role: "student";
};

export type StudentCourse = {
  id: string;
  title: string;
  teacherName: string;
  schedule: string;
  progress: number;
  status: "in_progress" | "completed";
};

export type StudentAssignment = {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  status: "submitted" | "pending" | "late";
  score: number | null;
};

export type StudentFeedback = {
  id: string;
  assignmentId: string;
  title: string;
  createdAt: string;
  comment: string;
  reading: number;
  thinking: number;
  logic: number;
  structure: number;
  expression: number;
};

export type StudentSubmission = {
  id: string;
  assignmentId: string;
  title: string;
  submittedAt: string;
  status: "submitted" | "reviewed";
  previewText: string;
};

export const studentData = {
  profile: {
    id: "stu-001",
    name: "홍길동",
    email: "student@test.com",
    role: "student",
  } as StudentProfile,
  today: {
    message: "오늘은 주장-근거 연결을 명확히 쓰는 연습을 합니다.",
    attendance: "출석",
  },
  stats: {
    weeklyAttendanceRate: 92,
    assignmentSubmitRate: 86,
    averageScore: 84,
  },
  courses: [
    {
      id: "class-101",
      title: "고1 논술 심화반",
      teacherName: "김강사",
      schedule: "화/목 19:00",
      progress: 72,
      status: "in_progress",
    },
    {
      id: "class-202",
      title: "독해 집중 트레이닝",
      teacherName: "이강사",
      schedule: "토 10:00",
      progress: 100,
      status: "completed",
    },
  ] as StudentCourse[],
  assignments: [
    {
      id: "asg-001",
      courseId: "class-101",
      title: "찬반 논증문 작성",
      dueDate: "2026-06-12",
      status: "pending",
      score: null,
    },
    {
      id: "asg-002",
      courseId: "class-101",
      title: "자료해석 기반 요약문",
      dueDate: "2026-06-05",
      status: "submitted",
      score: 88,
    },
    {
      id: "asg-003",
      courseId: "class-202",
      title: "비문학 지문 구조화",
      dueDate: "2026-05-29",
      status: "late",
      score: 76,
    },
  ] as StudentAssignment[],
  feedbacks: [
    {
      id: "fb-001",
      assignmentId: "asg-002",
      title: "자료해석 기반 요약문 첨삭",
      createdAt: "2026-06-06",
      comment: "핵심 문장을 잘 추렸지만, 문단 간 연결어가 부족합니다.",
      reading: 4,
      thinking: 4,
      logic: 3,
      structure: 3,
      expression: 4,
    },
    {
      id: "fb-002",
      assignmentId: "asg-003",
      title: "비문학 지문 구조화 첨삭",
      createdAt: "2026-05-31",
      comment: "요약 정확도는 높지만, 근거 문장 인용 방식 개선이 필요합니다.",
      reading: 4,
      thinking: 3,
      logic: 3,
      structure: 3,
      expression: 3,
    },
  ] as StudentFeedback[],
  submissions: [
    {
      id: "sub-001",
      assignmentId: "asg-002",
      title: "자료해석 기반 요약문",
      submittedAt: "2026-06-05 20:14",
      status: "reviewed",
      previewText: "본 글은 통계 자료의 추세 변화가 시사하는 바를...",
    },
    {
      id: "sub-002",
      assignmentId: "asg-003",
      title: "비문학 지문 구조화",
      submittedAt: "2026-05-30 08:40",
      status: "reviewed",
      previewText: "지문은 문제 제기-원인 분석-해결 제안의 구조로...",
    },
  ] as StudentSubmission[],
};

