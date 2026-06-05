// 브라우저(클라이언트 컴포넌트)에서 사용하는 Supabase 클라이언트입니다.
// @supabase/ssr 의 createBrowserClient 를 사용하면 로그인 세션이 쿠키에 저장되어,
// 서버 쪽 proxy(미들웨어)와 서버 컴포넌트가 동일한 세션을 읽을 수 있습니다.
// (이전 createClient 는 localStorage 만 사용해서 서버에서 세션을 볼 수 없었습니다.)
// export 이름 'supabase' 는 그대로이므로 기존 import 코드는 수정할 필요가 없습니다.
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);