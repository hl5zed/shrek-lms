import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div className="max-w-sm">
        <p className="text-7xl font-black text-indigo-100">404</p>
        <h1 className="mt-3 text-xl font-bold text-zinc-900">페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-zinc-500">
          요청하신 페이지가 존재하지 않거나 주소가 변경되었습니다.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
