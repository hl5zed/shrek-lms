"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div className="max-w-sm">
        <p className="text-7xl font-black text-red-100">500</p>
        <h1 className="mt-3 text-xl font-bold text-zinc-900">문제가 발생했어요</h1>
        <p className="mt-2 text-sm text-zinc-500">
          일시적인 오류입니다. 잠시 후 다시 시도해 주세요.
        </p>
        {error.digest && (
          <p className="mt-1 text-[11px] text-zinc-400">오류 코드: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            다시 시도
          </button>
          <a
            href="/login"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  );
}
