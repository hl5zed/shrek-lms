import "server-only";
import { createClient } from "@supabase/supabase-js";

// 서버 전용 Supabase Admin 클라이언트입니다.
// 절대 클라이언트(브라우저) 코드에서 import 하지 마세요.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const fallbackUrl = "https://invalid.localhost";
const fallbackKey = "invalid-service-role-key";

// 빌드 시점(import 시점)에는 throw하지 않고, 실제 사용 시점에 환경변수를 검사합니다.
export function assertAdminSupabaseEnv() {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required");
  }
}

export const adminSupabase = createClient(supabaseUrl ?? fallbackUrl, supabaseServiceRoleKey ?? fallbackKey);
