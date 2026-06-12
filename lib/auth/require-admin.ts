import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 관리자 전용 서버 액션 보호 유틸:
// 로그인 사용자이며 role이 admin인 경우에만 통과시킵니다.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/login");
  }

  return user;
}
