"use client";

import { FormEvent, useState } from "react";
import Card from "@/components/ui/Card";
import { supabase } from "@/lib/supabase/client";

// 강사 계정 설정 페이지 — 현재 로그인된 강사가 비밀번호를 변경합니다.
export default function TeacherSettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setIsError(true);
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      setIsError(true);
      setMessage("비밀번호는 8자 이상 입력해 주세요.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setIsLoading(false);
      setIsError(true);
      setMessage("비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsLoading(false);
    setIsError(false);
    setMessage("비밀번호가 변경되었습니다.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-zinc-900">계정 설정</h1>
        <p className="mt-1 text-sm text-zinc-500">비밀번호를 변경합니다.</p>
      </div>

      <Card className="max-w-xl p-6">
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">새 비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8자 이상 입력"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">새 비밀번호 확인</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="새 비밀번호를 다시 입력"
              className="h-10 w-full rounded-lg border border-zinc-200 px-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </button>

          {message ? (
            <p className={`rounded-lg px-3 py-2 text-sm ${isError ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
              {message}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}
