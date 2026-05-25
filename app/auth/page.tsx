"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setMessage(`로그인 실패: ${error.message}`);
      return;
    }

    setMessage("로그인 성공! 대시보드로 이동합니다.");
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">
          슈렉샘 논술 LMS 로그인
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          학생, 학부모, 강사가 로그인하여 강의·과제·첨삭·성장 관리를 확인할 수 있습니다.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message ? (
          <p className="mt-5 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-xs text-zinc-500">
          Supabase 이메일/비밀번호 로그인 테스트 단계입니다.
        </p>
      </section>
    </main>
  );
}