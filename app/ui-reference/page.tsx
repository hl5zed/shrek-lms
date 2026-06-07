import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Reference | 논술마루 LMS",
  description: "논술마루 LMS 전체 참고용 정적 UI 샘플",
};

type RoleKey = "admin" | "teacher" | "student" | "parent";
type StatusTone = "blue" | "green" | "amber" | "red" | "zinc";

const roles: {
  key: RoleKey;
  label: string;
  title: string;
  focus: string;
  accent: string;
}[] = [
  {
    key: "admin",
    label: "관리자",
    title: "운영 현황",
    focus: "강사, 학생, 반, 학부모 연결을 빠르게 점검합니다.",
    accent: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    key: "teacher",
    label: "강사",
    title: "수업 운영",
    focus: "오늘 수업, 과제, 첨삭 대기 제출물을 중심으로 배치합니다.",
    accent: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    key: "student",
    label: "학생",
    title: "학습 홈",
    focus: "다가오는 과제, 제출 상태, 피드백 확인 흐름을 단순하게 보여줍니다.",
    accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    key: "parent",
    label: "학부모",
    title: "자녀 성장",
    focus: "자녀의 주간 현황과 성장 리포트를 읽기 전용으로 제공합니다.",
    accent: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
];

const navigation = [
  "대시보드",
  "학생",
  "강의",
  "과제",
  "첨삭",
  "성장 리포트",
  "설정",
];

const stats = [
  { label: "전체 학생", value: "128명", caption: "이번 달 +12", tone: "blue" },
  { label: "진행 강의", value: "24개", caption: "오늘 6개 수업", tone: "green" },
  { label: "첨삭 대기", value: "31건", caption: "평균 대기 1.8일", tone: "amber" },
  { label: "미제출 과제", value: "9건", caption: "마감 임박 4건", tone: "red" },
] as const;

const students = [
  {
    name: "학생 A",
    className: "중2 논술 심화",
    teacher: "강사 A",
    progress: "82%",
    status: "성실 제출",
    statusTone: "green",
  },
  {
    name: "학생 B",
    className: "고1 입문",
    teacher: "강사 B",
    progress: "64%",
    status: "관찰 필요",
    statusTone: "amber",
  },
  {
    name: "학생 C",
    className: "중3 독서토론",
    teacher: "강사 C",
    progress: "91%",
    status: "성장 우수",
    statusTone: "blue",
  },
] as const;

const assignments = [
  {
    title: "논제 분석과 개요 작성",
    className: "중2 논술 심화",
    due: "2026-06-12",
    submit: "24 / 28",
    status: "진행 중",
    tone: "blue",
  },
  {
    title: "찬반 근거 비교 글쓰기",
    className: "고1 입문",
    due: "2026-06-10",
    submit: "17 / 22",
    status: "마감 임박",
    tone: "amber",
  },
  {
    title: "첨삭 반영 최종본",
    className: "중3 독서토론",
    due: "2026-06-04",
    submit: "20 / 20",
    status: "첨삭 중",
    tone: "green",
  },
] as const;

const lectures = [
  { title: "서론에서 문제의식 세우기", className: "중2 논술 심화", duration: "48분", state: "공개" },
  { title: "문단별 주장과 근거 연결", className: "고1 입문", duration: "36분", state: "예약" },
  { title: "자료 해석형 논술 풀이", className: "중3 독서토론", duration: "52분", state: "공개" },
] as const;

const feedbackItems = [
  { student: "학생 A", assignment: "논제 분석과 개요 작성", score: "86", status: "첨삭 완료" },
  { student: "학생 B", assignment: "찬반 근거 비교 글쓰기", score: "-", status: "첨삭 대기" },
  { student: "학생 C", assignment: "첨삭 반영 최종본", score: "92", status: "첨삭 완료" },
] as const;

const screenTree = [
  {
    group: "공통 진입",
    pages: ["로그인", "역할별 대시보드 리다이렉트", "권한 오류/빈 상태"],
  },
  {
    group: "관리자",
    pages: ["운영 대시보드", "학생 목록", "학생 상세", "강사 목록", "반 목록", "반 상세", "학부모 연결"],
  },
  {
    group: "강사",
    pages: ["강사 대시보드", "강의 목록", "강의 상세", "과제 목록", "과제 상세", "첨삭 목록", "첨삭 상세"],
  },
  {
    group: "학생",
    pages: ["학생 대시보드", "내 강의", "내 과제", "과제 상세", "제출 폼", "첨삭 결과", "성장 요약"],
  },
  {
    group: "학부모",
    pages: ["학부모 대시보드", "자녀 과제 현황", "첨삭 열람", "성장 리포트"],
  },
] as const;

const components = [
  "AppShell",
  "Sidebar",
  "TopHeader",
  "PageTitle",
  "SummaryCard",
  "DataTable",
  "FormField",
  "Button",
  "StatusBadge",
  "EmptyState",
  "LoadingState",
  "ErrorState",
  "DetailPanel",
] as const;

const pageSamples = [
  {
    title: "로그인 페이지",
    caption: "역할별 홈으로 진입하는 깔끔한 인증 화면 기준안",
    tags: ["이메일", "비밀번호", "도움 링크"],
  },
  {
    title: "관리자 대시보드",
    caption: "전체 운영 지표와 빠른 관리 메뉴를 우선 배치",
    tags: ["학생 수", "강사 수", "반 현황"],
  },
  {
    title: "강사 대시보드",
    caption: "수업 일정과 첨삭 대기 목록을 중심으로 구성",
    tags: ["오늘 수업", "첨삭 대기", "과제"],
  },
  {
    title: "학생 대시보드",
    caption: "이번 주 학습 할 일과 피드백 접근성을 강화",
    tags: ["제출 상태", "강의", "피드백"],
  },
  {
    title: "학부모 대시보드",
    caption: "자녀 현황을 읽기 전용 요약으로 제공",
    tags: ["자녀 요약", "성장", "첨삭 열람"],
  },
  {
    title: "목록/상세/폼",
    caption: "학생, 강의, 과제, 첨삭 화면에 공통 패턴 적용",
    tags: ["표", "상세 패널", "입력 폼"],
  },
] as const;

const implementationSteps = [
  "공통 디자인 토큰과 Button, Badge, Card, Table부터 분리",
  "역할별 Layout의 사이드바와 헤더를 같은 구조로 정리",
  "관리자 목록/상세 화면부터 실제 데이터 연결",
  "강사 과제/첨삭 작성 흐름 구현",
  "학생 제출/피드백 확인 흐름 구현",
  "학부모 성장 리포트와 권한 검증을 최종 점검",
] as const;

function toneClasses(tone: StatusTone) {
  const tones: Record<StatusTone, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    zinc: "border-zinc-200 bg-zinc-50 text-zinc-600",
  };

  return tones[tone];
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-zinc-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">{description}</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function Badge({ children, tone = "zinc" }: { children: React.ReactNode; tone?: StatusTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses(tone)}`}>
      {children}
    </span>
  );
}

function Button({
  children,
  variant = "primary",
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
    secondary: "border border-zinc-200 bg-white text-zinc-800 hover:border-blue-300 hover:text-blue-700",
    ghost: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
  };

  return (
    <button className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${variants[variant]}`}>
      {children}
    </button>
  );
}

function SummaryCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone: StatusTone;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      {/* 핵심 지표는 숫자와 보조 설명을 같은 카드 안에서 바로 비교할 수 있게 둡니다. */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${tone === "blue" ? "bg-blue-500" : tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : "bg-rose-500"}`} />
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-zinc-500">{caption}</p>
    </div>
  );
}

function ShellPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm">
      <div className="flex min-h-[680px] flex-col lg:flex-row">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white p-4 lg:block">
          <div className="flex items-center gap-3 rounded-lg bg-zinc-950 px-3 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-500 text-sm font-bold">NM</div>
            <div>
              <p className="text-sm font-bold">논술마루</p>
              <p className="text-xs text-zinc-300">LMS Reference</p>
            </div>
          </div>
          <nav className="mt-6 space-y-1">
            {navigation.map((item, index) => (
              <a
                key={item}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                  index === 0 ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-100"
                }`}
                href={`#${item}`}
              >
                <span>{item}</span>
                {index === 4 ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">31</span> : null}
              </a>
            ))}
          </nav>
          <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-950">오늘의 운영 메모</p>
            <p className="mt-2 text-xs leading-5 text-blue-700">마감 임박 과제와 첨삭 대기 항목을 먼저 확인합니다.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">UI Sample</p>
                <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">전체 서비스 기준 화면</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost">미리보기</Button>
                <Button>새 항목</Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <SummaryCard key={stat.label} {...stat} />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-zinc-950">학생 목록 샘플</h3>
                    <p className="mt-1 text-sm text-zinc-500">관리자와 강사용 표 스타일 기준입니다.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary">필터</Button>
                    <Button>등록</Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">학생</th>
                        <th className="px-4 py-3">반</th>
                        <th className="px-4 py-3">담당</th>
                        <th className="px-4 py-3">진도</th>
                        <th className="px-4 py-3">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {students.map((student) => (
                        <tr key={student.name} className="hover:bg-blue-50/40">
                          <td className="whitespace-nowrap px-4 py-4 font-semibold text-zinc-950">{student.name}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{student.className}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{student.teacher}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{student.progress}</td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <Badge tone={student.statusTone as StatusTone}>{student.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DetailPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DetailPanel() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-950">학생 상세 샘플</h3>
          <p className="mt-1 text-sm text-zinc-500">목록에서 선택한 학생의 요약 정보입니다.</p>
        </div>
        <Badge tone="green">성장 우수</Badge>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["소속 반", "중2 논술 심화"],
          ["담당 강사", "강사 A"],
          ["최근 제출", "2026-06-05"],
          ["첨삭 완료", "18건"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-zinc-50 p-3">
            <dt className="text-xs font-medium text-zinc-500">{label}</dt>
            <dd className="mt-1 font-semibold text-zinc-950">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-sm font-semibold text-zinc-950">성장 지표</p>
        <div className="mt-3 space-y-3">
          {[
            ["논제 이해", "86%"],
            ["근거 구성", "74%"],
            ["문장 표현", "91%"],
          ].map(([label, width]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
                <span>{label}</span>
                <span>{width}</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button>상세 보기</Button>
        <Button variant="secondary">상담 기록</Button>
      </div>
    </div>
  );
}

function RoleCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {roles.map((role) => (
        <article key={role.key} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <Badge tone="blue">{role.label}</Badge>
          <h3 className="mt-4 text-lg font-bold text-zinc-950">{role.title}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{role.focus}</p>
          <div className={`mt-5 rounded-lg border p-3 text-xs font-semibold ${role.accent}`}>{role.key} UX 기준</div>
        </article>
      ))}
    </div>
  );
}

function LoginSample() {
  return (
    <div className="grid overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
      <div className="bg-zinc-950 p-8 text-white sm:p-10">
        <p className="text-sm font-semibold text-blue-300">논술마루 LMS</p>
        <h3 className="mt-6 text-3xl font-bold tracking-tight">수업, 과제, 첨삭을 한 흐름으로 관리합니다.</h3>
        <p className="mt-4 text-sm leading-6 text-zinc-300">
          로그인 후 역할에 따라 관리자, 강사, 학생, 학부모 화면으로 이동하는 기준 UI입니다.
        </p>
        <div className="mt-8 grid gap-3 text-sm">
          {["화이트 기반", "다크그레이 내비게이션", "블루 포인트"].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              {item}
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 sm:p-10">
        <div className="mx-auto max-w-sm">
          <h3 className="text-2xl font-bold text-zinc-950">로그인</h3>
          <p className="mt-2 text-sm text-zinc-500">등록된 계정으로 접속합니다.</p>
          <form className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-700">이메일</span>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none ring-blue-100 transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4"
                placeholder="name@example.com"
                readOnly
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-zinc-700">비밀번호</span>
              <input
                className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none ring-blue-100 transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4"
                placeholder="비밀번호"
                readOnly
                type="password"
              />
            </label>
            <Button>로그인</Button>
          </form>
          <p className="mt-5 text-xs leading-5 text-zinc-500">실제 인증 로직은 수정하지 않고, 화면 기준만 제안합니다.</p>
        </div>
      </div>
    </div>
  );
}

function ListDetailFormSamples() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm xl:col-span-2">
        <div className="border-b border-zinc-200 p-4">
          <h3 className="text-base font-bold text-zinc-950">과제 목록 샘플</h3>
          <p className="mt-1 text-sm text-zinc-500">과제, 강의, 첨삭 목록에 재사용하는 표 패턴입니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">과제</th>
                <th className="px-4 py-3">반</th>
                <th className="px-4 py-3">마감일</th>
                <th className="px-4 py-3">제출</th>
                <th className="px-4 py-3">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {assignments.map((assignment) => (
                <tr key={assignment.title}>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-zinc-950">{assignment.title}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{assignment.className}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{assignment.due}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-zinc-600">{assignment.submit}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <Badge tone={assignment.tone as StatusTone}>{assignment.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-zinc-950">폼 입력 UI</h3>
        <p className="mt-1 text-sm text-zinc-500">강의 등록, 과제 등록, 첨삭 작성에 공통 적용합니다.</p>
        <form className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-700">제목</span>
            <input className="mt-2 h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400" readOnly value="논제 분석과 개요 작성" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-zinc-700">대상 반</span>
            <select className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-blue-400" defaultValue="middle">
              <option value="middle">중2 논술 심화</option>
              <option value="high">고1 입문</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-zinc-700">설명</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
              readOnly
              value="논제를 읽고 핵심 쟁점, 주장, 근거를 구분해 개요를 작성합니다."
            />
          </label>
          <div className="flex gap-2">
            <Button>저장</Button>
            <Button variant="secondary">취소</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailSamples() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-zinc-950">강의 상세</h3>
          <Badge tone="green">공개</Badge>
        </div>
        <ul className="mt-4 space-y-3">
          {lectures.map((lecture) => (
            <li key={lecture.title} className="rounded-lg bg-zinc-50 p-3">
              <p className="text-sm font-semibold text-zinc-950">{lecture.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{lecture.className} · {lecture.duration} · {lecture.state}</p>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-zinc-950">과제 상세</h3>
          <Badge tone="amber">마감 임박</Badge>
        </div>
        <div className="mt-4 rounded-lg bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-950">찬반 근거 비교 글쓰기</p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">학생은 제출 화면에서 글을 입력하고, 강사는 첨삭 상세에서 원문과 피드백을 나란히 확인합니다.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs text-zinc-500">마감</p>
            <p className="mt-1 font-semibold text-zinc-950">2026-06-10</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-3">
            <p className="text-xs text-zinc-500">제출률</p>
            <p className="mt-1 font-semibold text-zinc-950">77%</p>
          </div>
        </div>
      </article>

      <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-zinc-950">첨삭 상세</h3>
          <Badge tone="blue">작성 중</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {feedbackItems.map((item) => (
            <div key={`${item.student}-${item.assignment}`} className="rounded-lg border border-zinc-200 p-3">
              <p className="text-sm font-semibold text-zinc-950">{item.assignment}</p>
              <p className="mt-1 text-xs text-zinc-500">{item.student} · 점수 {item.score}</p>
              <p className="mt-2 text-xs font-semibold text-blue-700">{item.status}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function StateSamples() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">0</div>
        <h3 className="mt-4 text-base font-bold text-zinc-950">빈 상태</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500">등록된 과제가 없을 때 다음 행동을 안내합니다.</p>
        <div className="mt-5">
          <Button variant="secondary">새 과제 만들기</Button>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-8">
        <h3 className="text-base font-bold text-zinc-950">로딩 상태</h3>
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse rounded-lg bg-zinc-100 p-4">
              <div className="h-3 w-2/3 rounded bg-zinc-200" />
              <div className="mt-3 h-3 w-1/2 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-8">
        <Badge tone="red">오류</Badge>
        <h3 className="mt-4 text-base font-bold text-rose-950">데이터를 불러오지 못했습니다.</h3>
        <p className="mt-2 text-sm leading-6 text-rose-700">권한, 네트워크, RLS 실패를 구분해 재시도 액션을 제공합니다.</p>
        <div className="mt-5">
          <Button variant="secondary">다시 시도</Button>
        </div>
      </div>
    </div>
  );
}

function GrowthReportSample() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Badge tone="blue">학부모용 성장 페이지</Badge>
          <h3 className="mt-4 text-xl font-bold text-zinc-950">자녀 성장 리포트</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            학부모 화면은 수정 버튼 없이 읽기 전용 요약, 월별 변화, 최근 첨삭 코멘트를 안정적으로 보여주는 방향이 적합합니다.
          </p>
        </div>
        <Button variant="secondary">월간 리포트</Button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {[
          ["논제 이해", "86", "지난달 대비 +8"],
          ["근거 구성", "74", "보완 필요"],
          ["표현력", "91", "강점 유지"],
          ["제출 습관", "95", "꾸준함"],
        ].map(([label, value, caption]) => (
          <div key={label} className="rounded-lg bg-zinc-50 p-4">
            <p className="text-sm font-semibold text-zinc-700">{label}</p>
            <p className="mt-3 text-3xl font-bold text-zinc-950">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UiReferencePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <section className="bg-zinc-950 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300">논술마루 LMS</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
              실제 구현 전 확인하는 전체 참고용 UI 샘플
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
              Notion처럼 정돈된 정보 구조에, 교육 플랫폼다운 신뢰감과 친근한 블루 포인트를 더한 정적 기준안입니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["더미 데이터", "정적 UI", "역할별 UX", "모바일 반응형"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-zinc-100">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-blue-200">이번 산출물 범위</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-200">
              <li>기존 인증, Supabase, DB, RLS, API 코드는 수정하지 않습니다.</li>
              <li>한 페이지 안에서 공통 구조와 필수 화면 샘플을 확인합니다.</li>
              <li>나중에 실제 컴포넌트로 분리 가능한 Tailwind 구조를 제안합니다.</li>
            </ul>
          </div>
        </div>
      </section>

      <Section
        eyebrow="01. UI Concept"
        title="깔끔하고 신뢰감 있는 학원 운영 화면"
        description="화이트 배경, 다크그레이 내비게이션, 블루 포인트를 기본으로 두고 상태 표현에만 보조 색을 제한적으로 사용합니다."
      >
        <RoleCards />
      </Section>

      <Section
        eyebrow="02. Screen Tree"
        title="전체 화면 목록과 화면 간 관계"
        description="기존 라우팅 흐름을 바꾸지 않고, 역할별 대표 화면을 같은 구조 안에서 비교할 수 있게 정리했습니다."
      >
        <div className="grid gap-4 lg:grid-cols-5">
          {screenTree.map((group) => (
            <article key={group.group} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-zinc-950">{group.group}</h3>
              <ul className="mt-4 space-y-2">
                {group.pages.map((page) => (
                  <li key={page} className="rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                    {page}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="03. Components"
        title="공통 컴포넌트 설계"
        description="실제 구현 시 분리할 컴포넌트 목록입니다. 현재 샘플은 한 파일 안에 두어 기존 구조 변경을 최소화했습니다."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {components.map((component) => (
            <div key={component} className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-800">
              {component}
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="04. App Shell"
        title="전체 레이아웃, 사이드바, 헤더, 요약 카드, 표"
        description="관리자와 강사의 운영 화면을 기준으로 삼되, 학생과 학부모도 같은 시각 언어를 공유하도록 설계했습니다."
      >
        <ShellPreview />
      </Section>

      <Section
        eyebrow="05. Login"
        title="로그인 페이지 샘플"
        description="인증 로직 없이 시각 구조만 제안합니다. 실제 구현에서는 현재 로그인 흐름과 역할별 리다이렉트를 유지합니다."
      >
        <LoginSample />
      </Section>

      <Section
        eyebrow="06. Pages"
        title="제작한 대표 페이지 샘플 목록"
        description="필수 페이지를 하나의 참고 화면 안에서 카드, 표, 상세, 폼 패턴으로 압축해 확인할 수 있습니다."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageSamples.map((sample) => (
            <article key={sample.title} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-zinc-950">{sample.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{sample.caption}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {sample.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="07. List Detail Form"
        title="목록, 상세, 폼 페이지 샘플"
        description="학생 목록, 강의 목록, 과제 목록, 첨삭 목록은 같은 표 밀도와 상태 배지를 사용하고, 상세/입력 화면은 우측 패널 또는 단일 폼으로 확장합니다."
      >
        <ListDetailFormSamples />
      </Section>

      <Section
        eyebrow="08. Detail Pages"
        title="강의 상세, 과제 상세, 첨삭 상세"
        description="상세 화면은 제목, 상태, 핵심 메타 정보, 다음 행동을 항상 같은 위치에 두어 역할이 바뀌어도 익숙하게 느껴지도록 합니다."
      >
        <DetailSamples />
      </Section>

      <Section
        eyebrow="09. Growth"
        title="성장 리포트와 학부모용 성장 페이지"
        description="학생과 학부모는 같은 성장 지표를 보되, 학부모 화면은 자녀 현황과 코멘트 중심의 읽기 경험으로 제한합니다."
      >
        <GrowthReportSample />
      </Section>

      <Section
        eyebrow="10. States"
        title="빈 상태, 로딩, 오류 상태"
        description="데이터가 없거나 늦게 오거나 실패했을 때의 상태를 미리 정의해 실제 기능 구현 시 화면 흔들림을 줄입니다."
      >
        <StateSamples />
      </Section>

      <Section
        eyebrow="11. Implementation Priority"
        title="실제 코딩 전 추천 구현 순서"
        description="기능 구현으로 옮길 때는 공통 컴포넌트와 레이아웃을 먼저 안정화한 뒤, 역할별 데이터 흐름을 붙이는 순서가 좋습니다."
      >
        <ol className="grid gap-3 lg:grid-cols-2">
          {implementationSteps.map((step, index) => (
            <li key={step} className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-sm font-medium leading-6 text-zinc-700">{step}</p>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}
