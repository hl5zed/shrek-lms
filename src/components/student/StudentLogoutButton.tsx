"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2, IconLogout2 } from "@tabler/icons-react";
import { logoutWithRedirect } from "@/lib/auth/logout";

export default function StudentLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    await logoutWithRedirect(router);
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

