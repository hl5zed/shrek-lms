# Staging Playwright 기준선 QA 실행 가이드

이 문서는 Round 1 RLS 적용 전 기준선 QA를 Playwright로 자동 검증하기 위한 실행 가이드입니다.

## 1) 목적

- staging 환경에서 역할별 로그인/접근 정상 여부를 자동 확인
- lectures/feedback 핵심 화면 로딩 정상 여부 확인
- console error 및 네트워크 오류(400/401/403/500) 자동 감지
- 기준선 PASS 전에는 RLS 적용 단계로 이동하지 않음

## 2) 사전 조건

- production 프로젝트/URL 미사용
- RLS 정책 변경 전 상태
- 테스트 계정 정보 확보 (admin, teacher A, student A, parent A)

## 3) 환경변수

테스트 계정 비밀번호는 코드에 하드코딩하지 않습니다. 아래 값을 실행 환경에 설정하세요.

```bash
STAGING_BASE_URL=https://<staging-url>

E2E_ADMIN_EMAIL=<admin-email>
E2E_ADMIN_PASSWORD=<admin-password>

E2E_TEACHERA_EMAIL=<teacher-a-email>
E2E_TEACHERA_PASSWORD=<teacher-a-password>

E2E_STUDENTA_EMAIL=<student-a-email>
E2E_STUDENTA_PASSWORD=<student-a-password>

E2E_PARENTA_EMAIL=<parent-a-email>
E2E_PARENTA_PASSWORD=<parent-a-password>
```

## 4) 실행 명령어

최초 1회 브라우저 설치:

```bash
npx playwright install --with-deps chromium
```

기준선 QA 실행:

```bash
npx playwright test tests/e2e/staging-baseline.spec.ts
```

## 5) 테스트 범위

- admin 로그인 후 `/admin/*` 접근 가능
- teacher A 로그인 후 `/teacher/*` 접근 가능
- student A 로그인 후 `/student/*` 접근 가능
- parent A 로그인 후 `/parent/*` 접근 가능
- logged-out 상태에서 보호 페이지 접근 차단
- lectures 관련 화면 로딩 정상
- feedback/첨삭 관련 화면 로딩 정상
- console error 감지
- network 400/401/403/500 감지

## 6) 결과 해석

- PASS: 기준선 QA 통과, lectures RLS 적용/검증 단계로 이동 가능
- FAIL: 기준선 미통과, RLS 적용 중단 후 원인 분석
- BLOCKED / NOT VERIFIED: 환경변수/접속/계정 문제로 자동 검증 미완료
