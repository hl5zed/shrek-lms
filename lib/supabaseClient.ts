import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** .env.local의 Supabase URL·Anon Key를 읽고, 없으면 명확한 오류를 던집니다. */
function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url?.trim()) {
    throw new Error(
      "환경변수 NEXT_PUBLIC_SUPABASE_URL이 없습니다. 프로젝트 루트의 .env.local을 확인하세요.",
    );
  }

  if (!anonKey?.trim()) {
    throw new Error(
      "환경변수 NEXT_PUBLIC_SUPABASE_ANON_KEY가 없습니다. 프로젝트 루트의 .env.local을 확인하세요.",
    );
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

/** Supabase 브라우저/서버 공용 클라이언트를 생성합니다. */
export function createSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey);
}
