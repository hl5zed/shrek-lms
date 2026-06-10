import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getHomeByRole } from "@/lib/auth/role-redirect";
import LogoutButton from "@/components/auth/LogoutButton";

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

  // 역할 미설정 또는 조회 실패 사용자의 예외 안내 화면
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-semibold text-zinc-500">슈렉샘 논술 LMS</p>

        <h1 className="mt-3 text-3xl font-bold text-zinc-900">
          역할 확인이 필요합니다
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          로그인은 완료되었지만, 아직 사용자 역할이 설정되지 않았거나 권한 정보를 불러오지 못했습니다.
          관리자에게 계정 역할 설정을 요청해 주세요.
        </p>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-left text-sm text-zinc-700">
          <p>
            <span className="font-semibold">현재 로그인 계정:</span>{" "}
            {user.email ?? "없음"}
          </p>
          <p className="mt-2">
            <span className="font-semibold">사용자 ID:</span>{" "}
            {user.id}
          </p>
          <p className="mt-2">
            <span className="font-semibold">현재 역할:</span>{" "}
            {profile?.role ?? "설정되지 않음"}
          </p>
          <p className="mt-4 text-red-600">
            profiles.role이 설정되지 않았거나 조회할 수 없습니다. 관리자에게 문의해 주세요.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <a
            href="/login"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
          >
            로그인 화면으로 돌아가기
          </a>
          <a
            href="/dashboard"
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
          >
            다시 확인
          </a>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}