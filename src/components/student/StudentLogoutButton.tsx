"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconLogout2 } from "@tabler/icons-react";
import { supabase } from "@/lib/supabase/client";

export default function StudentLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("학생 로그아웃 실패:", error);
      setIsLoading(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="로그아웃"
      title={isLoading ? "로그아웃 중..." : "로그아웃"}
      className="rounded-md p-1 text-[#4A55A8] hover:bg-[#F5F7FF] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? <IconLoader2 size={18} className="animate-spin" /> : <IconLogout2 size={18} />}
    </button>
  );
}

