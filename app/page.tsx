import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-md flex-col items-center gap-10 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            슈렉샘 논술 LMS
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            강의·과제·첨삭·성장 관리를 한곳에서
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth"
            className="flex h-12 w-full items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 sm:w-auto sm:min-w-[160px]"
          >
            로그인하기
          </Link>
          <Link
            href="/supabase-test"
            className="flex h-12 w-full items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 sm:w-auto sm:min-w-[200px]"
          >
            Supabase 연결 테스트
          </Link>
        </div>
      </main>
    </div>
  );
}
