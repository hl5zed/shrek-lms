// LMS 화면 전환에 사용하는 메뉴 키입니다.
export type LmsMenuKey =
  | "dashboard"
  | "students"
  | "class-records"
  | "lessons"
  | "assignments"
  | "submit"
  | "feedback"
  | "growth"
  | "portfolio"
  | "parent-report"
  | "board"
  | "settings";

export type LmsMenuItem = {
  key: LmsMenuKey;
  label: string;
  description: string;
  group: "운영 관리" | "강의 콘텐츠" | "첨삭 & 성장" | "기타";
  badge?: {
    text: string;
    tone: "primary" | "warning" | "danger";
  };
};

export type DashboardStat = {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "success" | "warning" | "danger";
};

export type StudentRow = {
  id: string;
  name: string;
  grade: string;
  className: string;
  teacher: string;
  submissionRate: number;
  attendance: "양호" | "주의" | "위험";
  recentFeedback: string;
  enrollmentStatus: "수강중" | "휴강" | "상담필요";
};

export type ClassRecordRow = {
  studentName: string;
  attendance: "출석" | "지각" | "결석";
  focus: number;
  comprehension: number;
  participation: number;
  assignmentStatus: "완료" | "미완료" | "지연";
  memo: string;
};

export type LessonContent = {
  id: string;
  type: "영상" | "음성" | "PDF";
  title: string;
  visibility: "공개" | "비공개";
  learners: number;
  engagementRate: number;
};

export type AssignmentRow = {
  id: string;
  title: string;
  kind: "논술" | "요약" | "토론";
  target: string;
  dueDate: string;
  submitStatus: string;
  aiStatus: "완료" | "대기" | "실패";
  progress: "진행중" | "마감임박" | "종료";
};

export type FeedbackQueueItem = {
  id: string;
  studentName: string;
  assignmentTitle: string;
  submittedAt: string;
  urgency: "일반" | "높음";
};

export type GrowthMetric = {
  studentName: string;
  logic: number;
  expression: number;
  reading: number;
  consistency: number;
};

export type PortfolioItem = {
  id: string;
  studentName: string;
  assignmentTitle: string;
  month: string;
  score: number;
  feedbackSummary: string;
};

export type ParentReportSummary = {
  studentName: string;
  attendanceRate: number;
  assignmentRate: number;
  feedbackDone: number;
  growthScore: number;
};

export type BoardPost = {
  id: string;
  title: string;
  target: string;
  createdAt: string;
  visibility: "공개" | "비공개";
};

export type LmsMockData = {
  menus: LmsMenuItem[];
  dashboardStats: DashboardStat[];
  careStudents: StudentRow[];
  feedbackQueue: FeedbackQueueItem[];
  weeklySchedules: { id: string; day: string; title: string; teacher: string; room: string }[];
  students: StudentRow[];
  classRecord: {
    classDate: string;
    classTitle: string;
    goal: string;
    assignment: string;
    rows: ClassRecordRow[];
    teacherMemo: string;
  };
  contents: LessonContent[];
  assignments: AssignmentRow[];
  submitGuide: {
    assignmentTitle: string;
    dueDate: string;
    minChars: number;
    maxChars: number;
  };
  feedback: {
    queue: FeedbackQueueItem[];
    manuscript: string;
    aiAnalysis: string[];
  };
  growth: GrowthMetric[];
  portfolio: PortfolioItem[];
  parentReport: ParentReportSummary;
  board: BoardPost[];
};

// Supabase 실데이터 기반 학생 목록 행 타입입니다.
export type LmsStudentPanelRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classLabel: string;
  classIds: string[];
  parentCount: number;
  role: "student" | "admin" | "teacher" | "parent";
  createdAt: string;
};

// 관리자 학생 상세 화면에 필요한 과제/첨삭 요약 타입입니다.
export type StudentRecentSubmission = {
  id: string;
  assignmentTitle: string;
  submittedAt: string;
  status: "submitted" | "reviewed";
  feedbackComment: string | null;
};

export type StudentProfileDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "student" | "admin" | "teacher" | "parent";
  createdAt: string;
};

export type StudentProfileUpdateInput = {
  name: string;
  email: string;
  phone: string | null;
};

export type StudentSearchParams = {
  query?: string;
  classId?: string;
};

export type LmsClassRow = {
  id: string;
  name: string;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  studentCount: number;
  createdAt: string;
};

export type LmsClassDetail = {
  id: string;
  name: string;
  description: string | null;
  teacherId: string | null;
  teacherName: string | null;
  createdAt: string;
};

export type LmsClassStudent = {
  studentId: string;
  name: string;
  email: string;
  role: string;
};

export type ClassSearchParams = {
  query?: string;
};

export type ClassUpsertInput = {
  name: string;
  description: string | null;
  teacherId: string | null;
};

export type AttendanceStatus = "출석" | "지각" | "결석" | "보강";
export type ParticipationLevel = "적극" | "보통" | "소극";
export type AssignmentStatus = "제출" | "미제출" | "지연 제출";

export type ClassRecordStudent = {
  studentId: string;
  studentName: string;
  studentEmail: string;
  attendanceStatus: AttendanceStatus;
  focusLevel: "1" | "2" | "3" | "4" | "5";
  understandingLevel: "1" | "2" | "3" | "4" | "5";
  presentationParticipation: ParticipationLevel;
  discussionParticipation: ParticipationLevel;
  assignmentStatus: AssignmentStatus;
  memo: string;
};

export type ClassRecord = {
  id: string;
  classId: string;
  className: string;
  title: string;
  lessonDate: string;
  lessonGoal: string;
  keyConcepts: string;
  materials: string;
  classActivities: string;
  assignment: string;
  teacherMemo: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  attendanceRate: number | null;
  assignmentSubmitRate: number | null;
  studentRows: ClassRecordStudent[];
};

export type CreateClassRecordInput = {
  classId: string;
  title: string;
  lessonDate: string;
  lessonGoal: string;
  keyConcepts: string;
  materials: string;
  classActivities: string;
  assignment: string;
  teacherMemo: string;
  createdBy: string;
  studentRows: ClassRecordStudent[];
};

export type UpdateClassRecordInput = {
  title?: string;
  lessonDate?: string;
  lessonGoal?: string;
  keyConcepts?: string;
  materials?: string;
  classActivities?: string;
  assignment?: string;
  teacherMemo?: string;
  studentRows?: ClassRecordStudent[];
};
