"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// 로그인 폼 클라이언트 컴포넌트 — 서버 컴포넌트인 page.tsx에서 렌더합니다.
export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "signup_success") {
      setIsError(false);
      setMessage("가입이 완료되었습니다. 이메일을 확인해주세요.");
    }
  }, [searchParams]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setIsLoading(false);
      setIsError(true);
      setMessage("이메일 또는 비밀번호를 확인해주세요.");
      return;
    }

    // 역할별 이동은 서버(middleware + /dashboard 서버 리다이렉트)가 profiles.role 기준으로 처리합니다.
    // replace를 사용해 뒤로가기로 /login 재진입을 방지합니다.
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          이메일
        </label>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
          비밀번호
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "로그인 중..." : "로그인"}
      </button>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            isError ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
          회원가입
        </Link>
      </p>
    </form>
  );
}
