import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "./SignupForm";

// 회원가입 페이지 — 서버 컴포넌트
// 이미 로그인된 사용자는 대시보드로 이동시킵니다.
export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden">
            <Image src="/shrek-s.png" alt="로고" width={48} height={48} className="object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">슈렉샘 논술 LMS</h1>
          <p className="mt-1.5 text-sm text-zinc-500">학생 회원가입 후 강의·과제·첨삭을 시작하세요</p>
        </div>

        {/* 회원가입 카드 */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">슈렉샘 논술 LMS — 학생 회원가입</p>
      </div>
    </main>
  );
}
