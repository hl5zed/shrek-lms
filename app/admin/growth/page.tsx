import Link from "next/link";

export default function AdminGrowthPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">성장지표</h1>
      <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
        준비 중입니다.
      </p>
      <Link href="/admin/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        대시보드로 이동
      </Link>
    </div>
  );
}
