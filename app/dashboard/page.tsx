import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHomeByRole } from "@/lib/auth/role-redirect";

// 역할 미설정 계정 및 개발 테스트용 임시 대시보드 (Server Component)
// 역할이 있는 사용자는 미들웨어가 역할별 대시보드로 리다이렉트합니다.
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const home = getHomeByRole(profile?.role);
  if (home) {
    redirect(home);
  }

  // 역할 미설정 또는 조회 실패 사용자의 안전한 임시 화면
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-semibold text-zinc-500">역할 확인 필요</p>

        <h1 className="mt-3 text-3xl font-bold text-zinc-900">
          계정 역할 설정이 필요합니다
        </h1>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-left text-sm text-zinc-700">
          <p>
            <span className="font-semibold">현재 로그인 계정:</span>{" "}
            {user.email ?? "없음"}
          </p>
          <p className="mt-4 text-red-600">
            profiles.role 이 설정되지 않았거나 조회할 수 없습니다. 관리자에게 문의해주세요.
          </p>
        </div>
      </section>
    </main>
  );
}