import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";

// 관리자 대시보드 — 인증/역할 검증은 app/admin/layout.tsx 에서 처리합니다.
export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 전체 현황 집계
  const [
    { count: studentCount },
    { count: teacherCount },
    { count: classCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("classes").select("*", { count: "exact", head: true }),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted"),
  ]);

  const stats = [
    {
      label: "학생 수",
      value: studentCount ?? 0,
      accent: "bg-blue-50 text-blue-600",
      icon: "👨‍🎓",
    },
    {
      label: "강사 수",
      value: teacherCount ?? 0,
      accent: "bg-purple-50 text-purple-600",
      icon: "👨‍🏫",
    },
    {
      label: "반 수",
      value: classCount ?? 0,
      accent: "bg-green-50 text-green-600",
      icon: "🏫",
    },
    {
      label: "첨삭 대기",
      value: pendingCount ?? 0,
      accent: "bg-amber-50 text-amber-600",
      icon: "📝",
    },
  ];

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">전체 현황을 한눈에 확인합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-6"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 text-xl ${stat.accent}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-zinc-900">{stat.value}</p>
            <p className="mt-1 text-sm text-zinc-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* 빠른 링크 */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-zinc-500 uppercase tracking-wide">빠른 메뉴</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "학생 관리", href: "/admin/students", desc: "학생 목록·상세" },
            { label: "강사 관리", href: "/admin/teachers", desc: "강사 목록" },
            { label: "반 관리", href: "/admin/classes", desc: "반 생성·배정" },
            { label: "학부모 관리", href: "/admin/parents", desc: "자녀 연결 관리" },
          ].map((item) => (
            <Card key={item.href} className="transition hover:border-[var(--color-primary-200)]">
              <a
                href={item.href}
                className="block p-4"
              >
                <p className="text-sm font-semibold text-zinc-800">{item.label}</p>
                <p className="mt-0.5 text-xs text-zinc-400">{item.desc}</p>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
