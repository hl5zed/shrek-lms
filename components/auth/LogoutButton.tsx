"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type LogoutButtonProps = {
  className?: string;
  variant?: "sidebar" | "outline";
};

export default function LogoutButton({
  className = "",
  variant = "outline",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 실패:", error);
        setIsLoading(false);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("로그아웃 중 예외 발생:", error);
      setIsLoading(false);
    }
  }

  const baseClass =
    variant === "sidebar"
      ? "mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
      : "rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`${baseClass} ${className}`}
    >
      {isLoading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}

