import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getHomeByRole } from "@/lib/auth/role-redirect";

// 역할 기반으로 보호되는 경로의 접두사입니다.
const ROLE_PREFIX: Record<string, string> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/student": "student",
  "/parent": "parent",
};

// 통합된 로그인 페이지 경로입니다.
const LOGIN_PATH = "/login";

// redirect 응답에 supabaseResponse의 세션 쿠키를 함께 실어 줍니다.
// 이 처리가 없으면 세션 갱신 결과가 브라우저에 전달되지 않아 루프가 발생합니다.
function redirectWithCookies(
  url: URL,
  supabaseResponse: NextResponse
): NextResponse {
  const res = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    res.cookies.set(cookie.name, cookie.value, cookie);
  });
  return res;
}

// 미들웨어에서 호출되는 세션 갱신 + 역할 기반 라우팅 함수입니다.
// 1) Supabase 세션 쿠키를 갱신합니다.
// 2) 비로그인 사용자가 보호 경로에 접근하면 /login 으로 리다이렉트합니다.
// 3) 로그인 사용자가 자신의 역할과 다른 역할 경로에 접근하면 자기 대시보드로 리다이렉트합니다.
// 4) 로그인 사용자가 /login 또는 /auth 또는 /dashboard 에 접근하면 자기 대시보드로 리다이렉트합니다.
// 5) /auth 경로는 영구적으로 /login 으로 리다이렉트합니다(구 URL 호환).
export async function updateSession(request: NextRequest) {
  // 기본 응답: 요청을 그대로 통과시킵니다.
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없을 때는 보호 경로만 로그인으로 막고(실패-닫힘), 그 외 경로는 기존처럼 통과시킵니다.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase 환경변수 누락");
    const pathname = request.nextUrl.pathname;
    const isProtectedPath = Object.keys(ROLE_PREFIX).some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
    if (isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;

  // /auth 경로는 /login 으로 영구 리다이렉트합니다(308 Permanent Redirect).
  if (pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url, { status: 308 });
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

  // 현재 경로가 어떤 역할 보호 경로에 속하는지 확인합니다.
  const matchedPrefix = Object.keys(ROLE_PREFIX).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const requiredRole = matchedPrefix ? ROLE_PREFIX[matchedPrefix] : null;

  // 1) 비로그인 사용자가 보호 경로에 접근 → /login 으로 리다이렉트
  if (!user && requiredRole) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return redirectWithCookies(url, supabaseResponse);
  }

  // 2) 로그인 사용자의 역할을 profiles 테이블에서 조회합니다.
  //    (auth metadata 가 아니라 profiles.role 을 기준으로 판단)
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  // 3) 로그인 사용자가 /login 또는 /dashboard 에 접근하면 자기 대시보드로 보냅니다.
  const isGenericEntry =
    pathname === LOGIN_PATH || pathname === "/dashboard";
  const homeByRole = getHomeByRole(role);
  if (user && isGenericEntry && homeByRole) {
    const url = request.nextUrl.clone();
    url.pathname = homeByRole;
    return redirectWithCookies(url, supabaseResponse);
  }

  // 4) 로그인 사용자가 자신의 역할과 다른 역할 경로에 접근하면 자기 대시보드로 리다이렉트합니다.
  if (user && requiredRole && homeByRole && requiredRole !== role) {
    const url = request.nextUrl.clone();
    url.pathname = homeByRole;
    return redirectWithCookies(url, supabaseResponse);
  }

  // 5) 로그인은 되었지만 role 미설정 상태에서 보호 경로 접근 시 /dashboard 로 보냅니다.
  if (user && requiredRole && !homeByRole) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return redirectWithCookies(url, supabaseResponse);
  }

  // 그 외에는 갱신된 세션 쿠키가 담긴 응답을 그대로 반환합니다.
  return supabaseResponse;
}
