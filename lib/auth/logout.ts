"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { supabase } from "@/lib/supabase/client";

// 공통 로그아웃 함수: 실패해도 /login 이동을 보장해 화면 갇힘을 방지합니다.
export async function logoutWithRedirect(router: AppRouterInstance): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("로그아웃 실패:", error);
    }
  } catch (error) {
    console.error("로그아웃 중 예외 발생:", error);
  } finally {
    router.replace("/login");
    router.refresh();
  }
}
