# 코드 진단 보고서 + 커서용 수정 명령어 (2026-06-12)

> 본 문서는 분석/진단 결과 기록용입니다. 코드는 수정하지 않았습니다.
> 아래 "커서용 명령어"를 순서대로 Cursor에 붙여넣어 수정을 진행하세요.

---

## 1. 현재까지 진행 상황 요약

- 스택: Next.js 16.2.6 (App Router, proxy.ts 미들웨어) + React 19 + Supabase(@supabase/ssr) + Tailwind 4 + Playwright E2E
- 4개 역할(admin/teacher/student/parent) 라우트 트리 완성, 미들웨어 기반 역할 라우팅 동작
- 완료된 주요 기능: 로그인/회원가입, 역할별 대시보드, 반/학생/강사/학부모 관리, 강의 등록·스트리밍 설정, 과제 출제·제출(텍스트+파일), 첨삭(영역별 점수+코멘트), 성장관리, 게시판, 리포트
- RLS: lectures·feedback_comments round1 적용 완료(실행 로그 docs에 기록), 기준 문서는 `docs/rls_policy.md`
- QA: Playwright staging baseline + 수동 QA round1 문서화 완료
- 최근 작업: LMS v4 레이아웃 리디자인, 첨삭 저장 데드락/타임아웃 수정

---

## 2. 진단 결과 (문제점)

### 🔴 P0 — 보안 (즉시 수정 권장)

**S1. service_role(adminSupabase)을 쓰는 서버 액션에 권한 검증 없음**
- 대상: `app/admin/board/new·[id]/edit·page`, `app/admin/reports/page.tsx`(sendWeeklyAlert), `app/admin/settings`, `app/admin/teachers/new`, `app/admin/portfolio` 등 13개 파일
- 예: `sendWeeklyAlert`는 getUser() 호출조차 없이 formData의 parentId를 그대로 service_role로 insert. `createPost`는 user가 null이어도 insert 진행(author_id: null)
- 현재는 미들웨어의 /admin 경로 차단에만 의존 → 단일 방어선. 서버 액션은 독립 POST 엔드포인트이므로 액션 내부에서 admin 역할을 반드시 재검증해야 함 (심층 방어)

**S2. 미들웨어 fail-open**
- `lib/supabase/middleware.ts`: 환경변수가 없으면 인증을 **건너뛰고 통과**시킴. 배포 환경에서 env 누락 시 전체 인증이 조용히 무력화됨. 보호 경로는 fail-close(차단)가 원칙

**S3. iframe 임베드 호스트 검사 우회 가능**
- `getEmbedUrl`의 `url.hostname.includes("youtube.com")` → `youtube.com.evil.com` 같은 도메인도 통과해 악성 iframe 삽입 가능. 정확 일치/`endsWith(".youtube.com")` 필요
- `app/api/admin/lectures/update-video-url/route.ts`도 URL 형식·허용 도메인 검증 없이 저장

**S4. 회원가입 시 클라이언트가 profiles.role을 직접 upsert**
- `app/signup/SignupForm.tsx`: 브라우저에서 `profiles.upsert({ role: "student" })`. role 컬럼이 클라이언트 쓰기 경로에 노출되는 구조 자체가 위험(향후 self-update 정책 추가 시 role 위변조 통로). 프로필 생성은 DB 트리거(`handle_new_user`)가 표준

**S5. RLS 정책 무한 재귀 위험**
- `docs/rls_policy.md`의 `admin_all_profiles` 정책이 profiles 정책 안에서 profiles를 서브쿼리 → Postgres infinite recursion 오류 패턴. SECURITY DEFINER 함수(`get_my_role()`)로 우회 필요 (구버전 root `rls_policy.md`에는 함수가 있으나 기준 문서에는 직접 서브쿼리)

### 🟠 P1 — 무결성

**I1. 회원가입 프로필 저장 실패를 "정상 흐름"으로 처리**
- profiles에 INSERT 정책이 없어 RLS가 막으면 SignupForm이 조용히 성공 처리 → role 없는 사용자 발생 → /dashboard에서 갈 곳 없음

**I2. posts / notifications 테이블이 RLS 기준 문서에 없음**
- RLS 미정의 상태라 student/parent/teacher 대시보드까지 adminSupabase(RLS 우회)로 공지를 읽는 중. 절대원칙 6·7의 취지와 충돌. SELECT 정책을 만들고 일반 클라이언트로 전환해야 함

**I3. visibility를 "공개"/"비공개" 한글 문자열로 저장**
- CHECK 제약/enum 여부 불명확. 오타 한 번이면 필터 깨짐. DB 제약과 코드 상수 일치 확인 필요

**I4. Next 16의 비동기 searchParams 미적용 의심**
- `app/admin/reports/page.tsx` 등에서 `searchParams`를 동기 객체로 받음. Next 15+에서 Promise로 변경됨 → 런타임 오류/경고 가능. 확인 필요

### 🟡 P2 — 정합성·일관성

**C1. `app/`과 `src/app/` 이중 트리** — root `app/`이 우선이라 `src/app/(student)/**`는 빌드에서 무시되는 데드코드. 잘못된 파일을 수정하는 사고 위험. `src/components`, `src/lib` 중 실제 import되는 것만 유지하고 정리 필요
**C2. 문서 불일치** — AGENTS.md "Next.js 14" vs 실제 next 16.2.6 / package.json name "my-lms"
**C3. getEmbedUrl 3곳 중복 정의** (student/page, courses/page, courses/[id]/page) — 한 곳만 고치면 불일치 발생
**C4. `.env.local` E2E 계정 값 뒤 공백 문자** — `admin@test.com ` 등. 로그인 실패 원인 가능 (직접 수동 수정 권장, 코드 아님)
**C5. mock 데이터 잔존** — `lib/lms/mock-data.ts`, `src/lib/mock/` 운영 코드 경로와 혼재
**C6. tsconfig exclude에 `"page.tsx"`** — 의도 불명, 모든 page.tsx 타입체크 제외 위험 표기

### ✅ 잘 되어 있는 부분
- service_role 키가 `lib/supabase/admin.ts` 한 곳에만 존재 + `server-only` 가드, git에 .env 커밋 이력 없음
- API 라우트 2개(`/api/admin/lectures/*`)는 user + role 검증 정상
- 학생 제출 액션은 anon 클라이언트 + RLS + 파일 타입/크기 검증, 수강 여부 확인까지 갖춤
- 미들웨어가 getUser()로 토큰 검증, profiles 기반 역할 라우팅 — 구조 자체는 양호

---

## 3. 커서용 수정 명령어 (순서대로 1개씩 실행)

### 명령어 1 — [P0] 서버 액션 admin 권한 가드 추가

```
AGENTS.md 절대 원칙을 준수하면서 보안 수정을 진행해줘. 기능 변경 금지, 최소 수정만.

작업 내용:
1. lib/auth/require-admin.ts 파일을 새로 만들어줘.
   - createClient(@/lib/supabase/server)로 getUser() 호출
   - user가 없으면 redirect("/login")
   - profiles에서 role 조회 후 'admin'이 아니면 redirect("/login")
   - 성공 시 user를 반환하는 requireAdmin() 함수 하나만 export
   - 한글 주석 포함
2. 그 다음, adminSupabase를 사용하는 서버 액션이 있는 아래 파일들을 하나씩 수정해줘.
   각 서버 액션("use server") 본문 맨 앞에 await requireAdmin() 한 줄만 추가하고, 나머지 로직은 절대 건드리지 마.
   - app/admin/reports/page.tsx (sendWeeklyAlert — 현재 인증 검사가 전혀 없음, 최우선)
   - app/admin/board/new/page.tsx
   - app/admin/board/[id]/edit/page.tsx
   - app/admin/board/[id]/page.tsx
   - app/admin/board/page.tsx
   - app/admin/teachers/new/page.tsx
   - app/admin/settings/page.tsx
   - app/admin/portfolio/page.tsx
3. 수정 전에 영향받는 파일 목록을 먼저 보여주고, 한 파일씩 진행해줘.
4. UI/기능/응답 형식은 그대로 유지해야 해.
```

### 명령어 2 — [P0] 미들웨어 fail-open 차단

```
lib/supabase/middleware.ts 의 updateSession 함수를 최소 수정해줘. 기능 변경 금지.

현재 문제: NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 없으면
인증을 건너뛰고 모든 요청을 통과시킴(fail-open). 배포 환경에서 env 누락 시
/admin, /teacher, /student, /parent 보호 경로가 전부 무방비로 열림.

수정 방향:
- env가 없을 때, 요청 경로가 ROLE_PREFIX 보호 경로에 해당하면 /login 으로 리다이렉트(fail-close)
- 보호 경로가 아닌 경우(/, /login 등)는 기존처럼 통과
- console.error로 "Supabase 환경변수 누락" 경고 로그 1줄 추가
- 다른 로직은 한 줄도 건드리지 마. 한글 주석 포함.
```

### 명령어 3 — [P1] 영상 URL 검증 공통화 + iframe 호스트 검사 강화

```
영상 URL 처리를 보안 강화하면서 공통 모듈로 정리해줘. 기능 변경 금지, 기존 동작 결과는 동일해야 함.

1. lib/lectures/video-url.ts 파일을 새로 만들어줘.
   - getEmbedUrl(videoUrl: string): string | null 함수를 이동
   - 호스트 검사를 includes() 대신 정확 일치로 변경:
     hostname === "www.youtube.com" || hostname === "youtube.com" || hostname === "m.youtube.com"
     hostname === "youtu.be"
     hostname === "vimeo.com" || hostname === "www.vimeo.com" || hostname === "player.vimeo.com"
   - isAllowedVideoUrl(url: string): boolean 함수 추가 (http/https + 위 허용 도메인 또는 bunny stream 도메인만 true)
   - 한글 주석 포함
2. 아래 3개 파일에서 중복 정의된 getEmbedUrl을 제거하고 새 모듈을 import 하도록 수정해줘. 한 파일씩 진행.
   - app/student/page.tsx
   - app/student/courses/page.tsx
   - app/student/courses/[id]/page.tsx
3. app/api/admin/lectures/update-video-url/route.ts 에서 video_url 저장 전에
   값이 비어있지 않은 경우 isAllowedVideoUrl 검증을 추가하고, 실패 시 400 + 한글 에러 메시지를 반환해줘.
4. 수정 전에 영향받는 파일 목록을 먼저 알려줘.
```

### 명령어 4 — [P1] 회원가입 프로필 생성을 DB 트리거 방식으로 전환 (SQL 초안 문서만 생성)

```
DB 스키마와 RLS는 직접 변경하지 말고, 문서 초안만 만들어줘.

docs/signup_profile_trigger_draft.md 파일을 새로 만들어서 아래 내용을 작성해줘:
1. 현재 문제 설명: app/signup/SignupForm.tsx가 브라우저에서 profiles를 직접 upsert하고 있고,
   profiles에 INSERT 정책이 없어 RLS가 막으면 프로필이 생성되지 않은 채 "정상" 처리됨.
   또한 role 컬럼이 클라이언트 쓰기 경로에 노출되는 구조라 위험함.
2. 해결 SQL 초안 (Supabase SQL Editor에서 사람이 직접 실행할 용도):
   - auth.users INSERT 시 profiles(id, name, email, phone, role='student')를 자동 생성하는
     SECURITY DEFINER 트리거 함수 handle_new_user + 트리거 on_auth_user_created
   - raw_user_meta_data에서 name, phone을 읽도록 작성
3. 트리거 적용 이후 SignupForm.tsx에서 제거해야 할 코드 블록(profiles.upsert 부분)을
   "추후 수정 대상"으로 명시 (지금 코드는 수정하지 마).
docs/rls_policy.md, docs/database_schema.md 형식과 톤을 맞춰줘.
```

### 명령어 5 — [P1] posts·notifications RLS 정책 초안 문서 작성

```
DB는 변경하지 말고 문서 초안만 만들어줘.

docs/staging_posts_notifications_rls_sql_draft.md 파일을 새로 만들어서:
1. 현재 문제: posts, notifications 테이블이 docs/rls_policy.md(기준 문서)에 빠져 있어
   RLS 미정의 상태이고, 그 때문에 student/parent/teacher 대시보드와 admin 게시판이
   adminSupabase(service_role, RLS 우회)로 조회 중임을 기록.
2. SQL 초안 작성 (기존 docs/staging_lectures_rls_sql_draft.md 형식 참고):
   - posts: RLS 활성화 / admin 전체 CRUD / 로그인 사용자는 visibility='공개' AND
     (target_role='all' OR target_role=본인 role)인 글만 SELECT
   - notifications: RLS 활성화 / admin 전체 CRUD / recipient_id = auth.uid()인 본인 알림만 SELECT·UPDATE(읽음 처리)
   - admin 판별은 docs/rls_policy.md의 무한 재귀 문제를 피하기 위해
     SECURITY DEFINER 함수 get_my_role() 정의를 포함할 것
3. 정책 적용 후 adminSupabase 호출을 일반 createClient로 교체해야 할 파일 목록을
   "추후 수정 대상"으로 정리 (app/student/dashboard, app/parent/dashboard,
   app/teacher/dashboard, app/student/page, app/admin/board/* 등). 지금 코드는 수정하지 마.
```

### 명령어 6 — [P2] 데드코드·문서 정합성 정리

```
기능 변경 없는 정리 작업이야. 삭제 전 반드시 영향 파일 목록을 먼저 보여주고 진행해줘.

1. src/app/(student)/ 디렉터리는 root app/ 디렉터리가 우선이라 빌드에서 무시되는 데드코드야.
   먼저 src/components, src/lib 중에서 root app/** 에서 실제 import되는 파일 목록을 조사해서 보여줘.
   - src/app/(student)/** 는 어디서도 사용되지 않음이 확인되면 _backup_shrek-lms/ 로 이동(삭제 금지)
   - 실제 import되는 src/components, src/lib 파일은 그대로 유지
2. AGENTS.md의 "Next.js 14" 표기를 실제 버전 "Next.js 16 (App Router, proxy.ts 미들웨어)"로 수정해줘.
3. tsconfig.json의 exclude에 들어있는 "page.tsx" 항목이 왜 있는지 확인하고,
   특정 백업 파일 때문이 아니라면 제거를 제안만 해줘 (바로 수정하지 말 것).
4. 위 작업은 한 단계씩, 각 단계 결과를 보고하면서 진행해줘.
```

### 수동 조치 (Cursor 불필요, 직접 수정)

- `.env.local`: E2E 계정 이메일/비밀번호 값 끝의 **공백 문자 제거** (`admin@test.com ` → `admin@test.com`)
- Supabase 대시보드에서 `docs/rls_policy.md`의 `admin_all_profiles` 정책이 실제 적용돼 있는지 확인 — 적용돼 있다면 profiles 조회 시 infinite recursion 오류 여부 점검 (오류 시 get_my_role() SECURITY DEFINER 함수로 교체 필요, 명령어 5의 함수 재사용 가능)

---

## 4. 권장 실행 순서

명령어 1 → 2 (보안 심층방어) → 3 (XSS/임베드) → 4·5 (SQL 초안 검토 후 Supabase에서 직접 실행) → 6 (정리) → 수동 조치 → `npm run test:e2e:staging-baseline`으로 회귀 확인
