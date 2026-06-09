import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

// 학부모 영역 공통 레이아웃
export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "parent") redirect("/login");

  const navItems = [
    { label: "홈", href: "/parent/dashboard" },
    { label: "과제", href: "/parent/assignments" },
    { label: "첨삭", href: "/parent/feedback" },
    { label: "성장", href: "/parent/growth" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-neutral-50)]">
      <header className="sticky top-0 z-10 border-b border-[var(--color-neutral-200)] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-[var(--color-neutral-1000)]">
            {profile.name ?? "학부모"} 님
          </p>
          <LogoutButton className="px-2.5 py-1.5 text-xs" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-5 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-neutral-200)] bg-white px-2 py-2">
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex h-10 items-center justify-center rounded-lg text-xs font-medium text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
