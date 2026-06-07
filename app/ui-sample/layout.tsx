"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    group: "🎨 디자인 시스템",
    items: [{ href: "/ui-sample", label: "컴포넌트 갤러리" }],
  },
  {
    group: "🛠 관리자 (Admin)",
    items: [
      { href: "/ui-sample/admin", label: "대시보드" },
      { href: "/ui-sample/admin/students", label: "학생 목록" },
    ],
  },
  {
    group: "📚 강사 (Teacher)",
    items: [
      { href: "/ui-sample/teacher", label: "대시보드" },
      { href: "/ui-sample/teacher/submissions", label: "첨삭 목록" },
      { href: "/ui-sample/teacher/submissions/1", label: "첨삭 상세" },
    ],
  },
  {
    group: "✏️ 학생 (Student)",
    items: [
      { href: "/ui-sample/student", label: "대시보드" },
      { href: "/ui-sample/student/assignments/1", label: "과제 상세·제출" },
    ],
  },
  {
    group: "👨‍👩‍👧 학부모 (Parent)",
    items: [
      { href: "/ui-sample/parent", label: "대시보드" },
      { href: "/ui-sample/parent/growth", label: "성장 리포트" },
    ],
  },
];

export default function UiSampleLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* 샘플 전용 사이드바 */}
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-3 py-5">
        <div className="mb-5 px-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
            UI SAMPLE
          </span>
          <p className="mt-0.5 text-[11px] text-zinc-400">논술마루 LMS 참고용</p>
        </div>

        {NAV.map((section) => (
          <div key={section.group} className="mb-5">
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              {section.group}
            </p>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition ${
                    isActive
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="mt-8 rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-400">
          실제 데이터 없음 · 더미 전용
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
