export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-bold text-zinc-900">
          슈렉샘 논술 LMS 로그인
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          학생, 학부모, 강사가 로그인하여 강의·과제·첨삭·성장 관리를 확인할 수 있습니다.
        </p>

        <div className="mt-8 space-y-3">
          <input
            type="email"
            placeholder="이메일"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <input
            type="password"
            placeholder="비밀번호"
            className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-zinc-900"
          />

          <button className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700">
            로그인
          </button>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          현재는 로그인 화면 테스트 단계입니다.
        </p>
      </section>
    </main>
  );
}