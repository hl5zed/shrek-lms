"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadUserAndProfile() {
      setIsLoading(true);
      setMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth");
        return;
      }

      setUserEmail(user.email ?? null);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, name, role")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(`프로필 조회 실패: ${error.message}`);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setProfile(data);
      setIsLoading(false);
    }

    loadUserAndProfile();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <p className="text-sm text-zinc-600">
          사용자 정보를 불러오는 중입니다...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-semibold text-zinc-500">로그인 성공</p>

        <h1 className="mt-3 text-3xl font-bold text-zinc-900">
          슈렉샘 논술 LMS 대시보드
        </h1>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-left text-sm text-zinc-700">
          <p>
            <span className="font-semibold">로그인 이메일:</span>{" "}
            {userEmail ?? "없음"}
          </p>

          {profile ? (
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
              {message || "프로필 정보가 아직 없습니다."}
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
        >
          로그아웃
        </button>
      </section>
    </main>
  );
}