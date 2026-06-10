import Link from "next/link";
import LogoutButton from "./LogoutButton";

type NavItem = {
  label: string;
  href: string;
};

// 역할별 네비게이션 메뉴 정의
const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [
    { label: "대시보드", href: "/admin/dashboard" },
    { label: "강사 관리", href: "/admin/teachers" },
    { label: "학생 관리", href: "/admin/students" },
    { label: "반 관리", href: "/admin/classes" },
    { label: "학부모 관리", href: "/admin/parents" },
  ],
  teacher: [
    { label: "대시보드", href: "/teacher/dashboard" },
    { label: "강의", href: "/teacher/lectures" },
    { label: "과제", href: "/teacher/assignments" },
    { label: "제출함", href: "/teacher/submissions" },
  ],
  student: [
    { label: "대시보드", href: "/student/dashboard" },
    { label: "강의", href: "/student/lectures" },
    { label: "과제", href: "/student/assignments" },
    { label: "첨삭 결과", href: "/student/feedback" },
  ],
  parent: [
    { label: "대시보드", href: "/parent/dashboard" },
    { label: "과제 현황", href: "/parent/assignments" },
    { label: "첨삭 결과", href: "/parent/feedback" },
    { label: "성장 추이", href: "/parent/growth" },
  ],
};

const ROLE_LABEL: Record<string, string> = {
  admin: "관리자",
  teacher: "강사",
  student: "학생",
  parent: "학부모",
};

// 역할별 아바타 색상
const ROLE_COLOR: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
  parent: "bg-amber-100 text-amber-700",
};

type SidebarProps = {
  role: string;
  name: string;
};

// 공통 사이드바 (Server Component)
export default function Sidebar({ role, name }: SidebarProps) {
  const items = NAV_ITEMS[role] ?? [];
  const avatarColor = ROLE_COLOR[role] ?? "bg-zinc-100 text-zinc-700";

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      {/* 서비스 로고 영역 */}
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">논</span>
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">슈렉샘 논술 LMS</p>
          <p className="text-[10px] text-zinc-400">LMS</p>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor}`}>
            {name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-800">{name}</p>
            <p className="text-xs text-zinc-400">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
