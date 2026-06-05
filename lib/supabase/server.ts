import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// 서버 컴포넌트 / 서버 액션 / 라우트 핸들러에서 사용하는 Supabase 클라이언트입니다.
// 쿠키 기반으로 로그인 세션을 읽고 갱신하기 때문에 서버에서 안전하게 사용자 인증 상태를 확인할 수 있습니다.
// 주의: 브라우저(클라이언트 컴포넌트)에서는 lib/supabase/client.ts 를 사용하세요.
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  if (!supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required");
  }

  // Next.js 16에서는 cookies()가 비동기이므로 await 로 받아옵니다.
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // 현재 요청에 담긴 모든 쿠키를 Supabase 에 전달합니다.
      getAll() {
        return cookieStore.getAll();
      },
      // Supabase 가 세션을 갱신할 때 쿠키를 다시 써 줍니다.
      // 서버 컴포넌트에서 호출되면 쓰기가 막혀 예외가 날 수 있으므로 try/catch 로 감쌉니다.
      // (이 경우 세션 갱신은 proxy(미들웨어) 단계에서 처리됩니다.)
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 호출된 경우 무시합니다.
        }
      },
    },
  });
}
