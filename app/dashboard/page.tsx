export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <section className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <p className="text-sm font-semibold text-zinc-500">
          로그인 성공
        </p>

        <h1 className="mt-3 text-3xl font-bold text-zinc-900">
          슈렉샘 논술 LMS 대시보드
        </h1>

        <p className="mt-4 text-sm leading-6 text-zinc-600">
          이곳은 로그인 후 이동하는 임시 대시보드입니다. 다음 단계에서 학생, 강사, 관리자 역할별 화면을 연결할 수 있습니다.
        </p>
      </section>
    </main>
  );
}