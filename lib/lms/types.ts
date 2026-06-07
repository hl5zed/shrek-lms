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
