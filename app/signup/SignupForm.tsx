"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// 학생 회원가입 폼 컴포넌트 — 서버 컴포넌트인 signup/page.tsx에서 렌더합니다.
export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      setIsError(true);
      const msg = error.message ?? "";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        setMessage("이미 사용 중인 이메일입니다. 로그인을 시도해 주세요.");
      } else if (msg.includes("Password should be at least") || msg.includes("password")) {
        setMessage("비밀번호는 6자 이상이어야 합니다.");
      } else if (msg.includes("Invalid email") || msg.includes("valid email")) {
        setMessage("유효하지 않은 이메일 형식입니다.");
      } else if (msg.includes("Email rate limit") || msg.includes("rate limit")) {
        setMessage("잠시 후 다시 시도해 주세요. (요청 횟수 초과)");
      } else {
        setMessage(`회원가입 실패: ${msg}`);
      }
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setIsLoading(false);
      setIsError(true);
      // Supabase는 이미 가입된 이메일에 대해 보안상 error 대신 user: null을 반환합니다.
      setMessage("이미 사용 중인 이메일이거나 가입을 확인할 수 없습니다. 해당 이메일로 로그인을 시도해 보세요.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      name,
      email,
      phone: phone.trim() || null,
      role: "student",
    });

    if (profileError) {
      // 세션이 없는 경우(이메일 인증 대기)는 RLS로 인해 프로필 저장이 실패할 수 있음.
      // 이 경우 auth 가입은 완료된 것이므로 정상 흐름으로 처리합니다.
      const isRlsOrNoSession =
        !data.session ||
        profileError.message?.includes("row-level security") ||
        profileError.message?.includes("JWT");
      if (!isRlsOrNoSession) {
        setIsLoading(false);
        setIsError(true);
        setMessage(`프로필 저장 실패: ${profileError.message}`);
        return;
      }
      // 이메일 인증 후 로그인 시 트리거 또는 재시도로 프로필이 생성됩니다.
    }

    setIsError(false);
    setMessage("가입이 완료되었습니다. 이메일을 확인해주세요.");
    setIsLoading(false);

    // 안내 메시지를 로그인 화면에서 다시 보여주기 위해 status 쿼리를 전달합니다.
    router.push("/login?status=signup_success");
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">이름</label>
        <input
          type="text"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">이메일</label>
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
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">전화번호 (선택)</label>
        <input
          type="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">비밀번호</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-700">비밀번호 확인</label>
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "가입 중..." : "회원가입"}
      </button>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm ${isError ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"}`}>
          {message}
        </div>
      )}

      <p className="text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          로그인
        </Link>
      </p>
    </form>
  );
}
