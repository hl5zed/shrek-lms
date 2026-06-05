import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16부터 미들웨어(middleware)는 프록시(proxy)로 이름이 바뀌었습니다. 기능은 동일합니다.
// 이 파일은 프로젝트 루트(app/ 과 같은 위치)에 있어야 모든 요청에 적용됩니다.
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
