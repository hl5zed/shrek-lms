"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AdminError]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm">
        <p className="text-5xl font-black text-red-100">오류</p>
        <h2 className="mt-3 text-base font-bold text-zinc-900">페이지 로딩 중 오류 발생</h2>
        <p className="mt-1 text-sm text-zinc-500">
          일시적인 오류입니다. 잠시 후 다시 시도해 주세요.
        </p>
        {error.digest && (
          <p className="mt-1 text-[11px] text-zinc-400">오류 코드: {error.digest}</p>
        )}
        <div className="mt-5 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            대시보드로
          </Link>
        </div>
      </div>
    </div>
  );
}
