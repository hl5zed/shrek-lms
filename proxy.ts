import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16+ 에서 미들웨어 파일명은 proxy.ts 입니다.
// 실제 인증/역할 라우팅 로직은 lib/supabase/middleware.ts 의 updateSession 에 있습니다.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 보호가 필요 없는 정적 파일, 이미지, favicon 등은 프록시 대상에서 제외합니다.
  // 그 외 모든 경로에서 세션 갱신 + 역할 라우팅이 동작합니다.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
