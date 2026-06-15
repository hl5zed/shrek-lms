import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

type NavItem = {
  label: string;
  href: string;
  badge?: {
    type: "new" | "count-red" | "count-amber";
    value?: number;
  };
  group?: "운영 관리" | "강의 콘텐츠" | "첨삭 & 성장" | "기타";
};

const NAV_ITEMS: Record<"teacher" | "student" | "parent", NavItem[]> = {
  teacher: [
    { label: "대시보드", href: "/teacher/dashboard" },
    { label: "강의", href: "/teacher/lectures" },
    { label: "과제", href: "/teacher/assignments" },
    { label: "제출함", href: "/teacher/submissions" },
    { label: "계정 설정", href: "/teacher/settings" },
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

const ADMIN_GROUPS: Array<"운영 관리" | "강의 콘텐츠" | "첨삭 & 성장" | "기타"> = [
  "운영 관리",
  "강의 콘텐츠",
  "첨삭 & 성장",
  "기타",
];

const ROLE_LABEL: Record<string, string> = {
  admin: "관리자",
  teacher: "강사",
  student: "학생",
  parent: "학부모",
};

const ROLE_COLOR: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  teacher: "bg-blue-100 text-blue-700",
  student: "bg-green-100 text-green-700",
  parent: "bg-amber-100 text-amber-700",
};

type SidebarProps = {
  role: string;
  name: string;
  currentPath?: string;
  studentNewCount?: number;
  pendingFeedbackCount?: number;
};

function getAdminNavItems(studentNewCount?: number, pendingFeedbackCount?: number): NavItem[] {
  return [
    { label: "대시보드", href: "/admin/dashboard", group: "운영 관리" },
    {
      label: "학생회원 관리",
      href: "/admin/students",
      group: "운영 관리",
      badge: (studentNewCount ?? 0) > 0 ? { type: "count-red", value: studentNewCount } : undefined,
    },
    { label: "강사 관리", href: "/admin/teachers", group: "운영 관리" },
    { label: "반 관리", href: "/admin/classes", group: "운영 관리" },
    { label: "학부모 관리", href: "/admin/parents", group: "운영 관리" },
    { label: "수업기록", href: "/admin/records", group: "운영 관리", badge: { type: "new" } },

    { label: "강의 관리", href: "/admin/lectures", group: "강의 콘텐츠", badge: { type: "new" } },
    { label: "과제 관리", href: "/admin/assignments", group: "강의 콘텐츠" },
    { label: "과제 제출", href: "/admin/submissions", group: "강의 콘텐츠" },

    {
      label: "첨삭 관리",
      href: "/admin/feedback",
      group: "첨삭 & 성장",
      badge: (pendingFeedbackCount ?? 0) > 0 ? { type: "count-amber", value: pendingFeedbackCount } : undefined,
    },
    { label: "성장지표", href: "/admin/growth", group: "첨삭 & 성장" },
    { label: "포트폴리오", href: "/admin/portfolio", group: "첨삭 & 성장" },
    { label: "학부모 리포트", href: "/admin/reports", group: "첨삭 & 성장" },

    { label: "게시판", href: "/admin/board", group: "기타" },
    { label: "설정", href: "/admin/settings", group: "기타" },
  ];
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderBadge(badge?: NavItem["badge"]) {
  if (!badge) return null;
  if (badge.type === "new") {
    return (
      <span className="ml-auto rounded-full bg-indigo-500 px-1.5 py-[1px] text-[9px] font-bold text-white">
        NEW
      </span>
    );
  }
  if (!badge.value || badge.value <= 0) return null;
  if (badge.type === "count-red") {
    return (
      <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
        {badge.value > 99 ? "99+" : badge.value}
      </span>
    );
  }
  return (
    <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-white">
      {badge.value > 99 ? "99+" : badge.value}
    </span>
  );
}

export default function Sidebar({
  role,
  name,
  currentPath = "",
  studentNewCount,
  pendingFeedbackCount,
}: SidebarProps) {
  const avatarColor = ROLE_COLOR[role] ?? "bg-zinc-100 text-zinc-700";
  const initial = name.charAt(0);

  if (role === "admin") {
    const items = getAdminNavItems(studentNewCount, pendingFeedbackCount);

    const GROUP_STYLES: Record<string, { label: string; active: string; inactive: string }> = {
      "운영 관리": {
        label: "text-blue-500",
        active: "bg-blue-50 text-blue-700 font-semibold",
        inactive: "text-zinc-600 hover:bg-blue-50/70 hover:text-blue-700",
      },
      "강의 콘텐츠": {
        label: "text-violet-500",
        active: "bg-violet-50 text-violet-700 font-semibold",
        inactive: "text-zinc-600 hover:bg-violet-50/70 hover:text-violet-700",
      },
      "첨삭 & 성장": {
        label: "text-emerald-500",
        active: "bg-emerald-50 text-emerald-700 font-semibold",
        inactive: "text-zinc-600 hover:bg-emerald-50/70 hover:text-emerald-700",
      },
      "기타": {
        label: "text-zinc-400",
        active: "bg-zinc-100 text-zinc-800 font-semibold",
        inactive: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700",
      },
    };

    return (
      <aside className="flex h-screen w-48 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-3 pb-3 pt-3.5">
          <div className="flex items-center gap-2">
            <Image
              src="/shrek-s.png"
              alt="슈렉샘"
              width={30}
              height={30}
              className="rounded-lg object-contain"
            />
            <div>
              <p className="text-[13px] font-bold leading-tight text-zinc-900">슈렉샘 LMS</p>
              <p className="text-[10px] leading-tight text-zinc-400">논술 성장관리 플랫폼</p>
            </div>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 py-2">
          {ADMIN_GROUPS.map((group) => {
            const gStyle = GROUP_STYLES[group] ?? GROUP_STYLES["기타"];
            return (
              <div key={group} className="mb-1">
                <p className={`px-1.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider first:pt-1.5 ${gStyle.label}`}>
                  {group}
                </p>
                <div className="space-y-0.5">
                  {items
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const isActive = isActivePath(currentPath, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-[7px] text-[13px] transition-all duration-150 ${
                            isActive ? gStyle.active : gStyle.inactive
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {renderBadge(item.badge)}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-bold text-zinc-900">{name}</p>
              <p className="text-[10px] text-zinc-400">{ROLE_LABEL[role] ?? role}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    );
  }

  const items = NAV_ITEMS[role as keyof typeof NAV_ITEMS] ?? [];
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center gap-2.5 border-b border-zinc-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <span className="text-xs font-bold text-white">논</span>
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">슈렉샘 논술 LMS</p>
          <p className="text-[10px] text-zinc-400">LMS</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center rounded-lg py-2 pr-3 pl-[11px] text-sm font-medium transition-colors border-l-2 ${
              isActivePath(currentPath, item.href)
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-zinc-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor}`}>
            {initial}
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
