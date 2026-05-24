import { createSupabaseClient } from "@/lib/supabaseClient";

/** profiles 5건 조회로 Supabase 연결을 확인하는 테스트 페이지 */
export default async function SupabaseTestPage() {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, name, email, created_at")
      .limit(5);

    if (error) {
      return (
        <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 p-8">
          <h1 className="text-2xl font-semibold text-red-600">
            Supabase 연결 실패
          </h1>
          <p className="text-zinc-600">
            클라이언트는 생성되었으나 profiles 조회 중 오류가 발생했습니다.
          </p>
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800">
            {error.message}
            {error.details ? `\n\n상세: ${error.details}` : ""}
            {error.hint ? `\n\n힌트: ${error.hint}` : ""}
          </pre>
        </main>
      );
    }

    return (
      <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 p-8">
        <h1 className="text-2xl font-semibold text-green-600">
          Supabase 연결 성공!
        </h1>
        <p className="text-zinc-600">
          profiles 테이블에서 {data?.length ?? 0}건을 조회했습니다.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800">
          {JSON.stringify(data, null, 2)}
        </pre>
      </main>
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";

    return (
      <main className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 p-8">
        <h1 className="text-2xl font-semibold text-red-600">
          Supabase 연결 실패
        </h1>
        <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm text-zinc-800">
          {message}
        </pre>
      </main>
    );
  }
}
