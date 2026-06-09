"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBook, IconChecklist, IconChartLine, IconMessageCircle } from "@tabler/icons-react";

const items = [
  { href: "/student", label: "홈", icon: IconBook },
  { href: "/student/courses", label: "강의", icon: IconBook },
  { href: "/student/assignments", label: "과제", icon: IconChecklist },
  { href: "/student/feedback", label: "첨삭", icon: IconMessageCircle },
  { href: "/student/growth", label: "성장", icon: IconChartLine },
];

function resolveActiveHref(pathname: string): string {
  if (pathname === "/student" || pathname === "/student/dashboard") return "/student";
  if (pathname.startsWith("/student/courses") || pathname.startsWith("/student/lectures")) {
    return "/student/courses";
  }
  if (pathname.startsWith("/student/assignments")) return "/student/assignments";
  if (pathname.startsWith("/student/feedback")) return "/student/feedback";
  if (pathname.startsWith("/student/growth") || pathname.startsWith("/student/portfolio")) {
    return "/student/growth";
  }
  return "";
}

export default function StudentBottomNav() {
  const pathname = usePathname();
  const activeHref = resolveActiveHref(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#EAEDFA] bg-white/95 px-2 py-2 backdrop-blur">
      <ul className="mx-auto grid w-full max-w-sm grid-cols-5 gap-1">
        {items.map((item) => {
          const active = activeHref === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-lg px-1 py-1 text-[11px] ${
                  active ? "bg-[#EEF1FF] text-[#3A4BFF]" : "text-[#6470BF]"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="mt-0.5 leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

