import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LmsShell from "@/components/lms/LmsShell";

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

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    return <LmsShell initialMenu="dashboard" />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-semibold text-zinc-500">로그인 성공</p>

        <h1 className="mt-3 text-3xl font-bold text-zinc-900">
          논술마루 LMS 대시보드
        </h1>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-left text-sm text-zinc-700">
          <p>
            <span className="font-semibold">로그인 이메일:</span>{" "}
            {user.email ?? "없음"}
          </p>

          {profile && !error ? (
            <div className="mt-4 space-y-2">
              <p>
                <span className="font-semibold">이름:</span>{" "}
                {profile.name ?? "미등록"}
              </p>
              <p>
                <span className="font-semibold">역할:</span>{" "}
                {profile.role ?? "미등록"}
              </p>
              <p>
                <span className="font-semibold">프로필 이메일:</span>{" "}
                {profile.email ?? "미등록"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-red-600">
              {error?.message ?? "프로필 정보가 아직 없습니다."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}