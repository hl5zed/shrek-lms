import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

// 역할(role)별 기본 대시보드 경로 — 미들웨어와 동일하게 맞춥니다.
const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
};

// 로그인 페이지 — 서버 컴포넌트
// 이미 로그인된 사용자는 자신의 대시보드로 바로 보냅니다.
export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const home = profile?.role ? ROLE_HOME[profile.role] : null;
    if (home) redirect(home);

    // role이 없는 로그인 계정은 /dashboard(임시 화면)로 보냅니다.
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <span className="text-xl font-bold text-white">논</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">논술마루 LMS</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            강의·과제·첨삭·성장을 한곳에서 관리합니다
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          슈렉샘 논술 — 이메일·비밀번호 로그인
        </p>
      </div>
    </main>
  );
}
