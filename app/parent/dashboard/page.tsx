import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// 학부모 대시보드 — 인증/역할 검증은 app/parent/layout.tsx 에서 처리합니다.
export default async function ParentDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 연결된 자녀 목록 조회
  const { data: children } = await supabase
    .from("parent_students")
    .select("profiles!student_id ( id, name )")
    .eq("parent_id", user!.id);

  const childList = (children ?? [])
    .map((row) => row.profiles as unknown as { id: string; name: string } | null)
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">학부모 대시보드</h1>
        <p className="mt-1 text-sm text-zinc-500">자녀의 학습 현황을 확인합니다.</p>
      </div>

      {/* 자녀 목록 */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-zinc-800">자녀 목록</h2>

        {childList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <p className="text-sm text-zinc-400">연결된 자녀가 없습니다.</p>
            <p className="mt-1 text-xs text-zinc-400">관리자에게 문의하여 자녀 계정을 연결해주세요.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {childList.map((child) => (
              <li
                key={child.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                  {child.name.charAt(0)}
                </div>
                <p className="text-sm font-medium text-zinc-900">{child.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { label: "과제 현황", href: "/parent/assignments", desc: "제출·첨삭 상태" },
          { label: "첨삭 결과", href: "/parent/feedback", desc: "완료된 첨삭 확인" },
          { label: "성장 추이", href: "/parent/growth", desc: "성장지표 변화" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-sm font-semibold text-zinc-800">{item.label}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
