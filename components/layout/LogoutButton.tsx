"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// 사이드바 하단 로그아웃 버튼 (클라이언트 컴포넌트)
export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600"
    >
      로그아웃
    </button>
  );
}
