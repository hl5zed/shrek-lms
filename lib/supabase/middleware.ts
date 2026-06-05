import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 역할(role)별 기본 대시보드 경로입니다.
const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
};

// 역할 기반으로 보호되는 경로의 접두사입니다.
const ROLE_PREFIX: Record<string, string> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/student": "student",
  "/parent": "parent",
};

// 로그인 페이지 경로입니다.
const AUTH_PATH = "/auth";

// proxy(미들웨어)에서 호출되는 세션 갱신 + 역할 기반 라우팅 함수입니다.
// 1) Supabase 세션 쿠키를 갱신합니다.
// 2) 비로그인 사용자가 보호 경로에 접근하면 /auth 로 리다이렉트합니다.
// 3) 로그인 사용자가 자신의 역할과 다른 역할 경로에 접근하면 자기 대시보드로 리다이렉트합니다.
// 4) 로그인 사용자가 /auth 에 접근하면 자기 대시보드로 리다이렉트합니다.
export async function updateSession(request: NextRequest) {
  // 기본 응답: 요청을 그대로 통과시킵니다.
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없으면 인증 처리를 건너뛰고 그대로 통과시킵니다.
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  // 요청/응답 쿠키를 동기화하는 Supabase 클라이언트를 만듭니다.
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // 중요: getUser() 는 세션 토큰을 검증하고 갱신합니다. 절대 생략하면 안 됩니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 현재 경로가 어떤 역할 보호 경로에 속하는지 확인합니다.
  const matchedPrefix = Object.keys(ROLE_PREFIX).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const requiredRole = matchedPrefix ? ROLE_PREFIX[matchedPrefix] : null;

  // 1) 비로그인 사용자가 보호 경로에 접근 → /auth 로 리다이렉트
  if (!user && requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_PATH;
    return NextResponse.redirect(url);
  }

  // 2) 로그인 사용자의 역할을 profiles 테이블에서 조회합니다.
  //    (roles_permissions.md 규칙: auth metadata 가 아니라 profiles.role 을 기준으로 판단)
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  // 3) 로그인 사용자가 /auth 에 접근하면 자기 대시보드로 보냅니다.
  if (user && pathname === AUTH_PATH && role && ROLE_HOME[role]) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  // 4) 로그인 사용자가 자신의 역할과 다른 역할 경로에 접근하면 자기 대시보드로 리다이렉트합니다.
  if (user && requiredRole && role && requiredRole !== role && ROLE_HOME[role]) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[role];
    return NextResponse.redirect(url);
  }

  // 그 외에는 갱신된 세션 쿠키가 담긴 응답을 그대로 반환합니다.
  return supabaseResponse;
}
