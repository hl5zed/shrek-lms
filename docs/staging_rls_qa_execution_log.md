# staging RLS QA 실행 로그

## 시간 기록 규칙

- 모든 시간은 태국 현지 시간 기준으로 기록한다.
- 시간대 표기는 `UTC+7`로 통일한다.
- 날짜 형식은 `YYYY-MM-DD`로 기록한다.
- 시각 형식은 `HH:MM` 24시간제로 기록한다.
- 날짜와 시각을 함께 기록할 때는 `YYYY-MM-DD HH:MM (UTC+7)` 형식을 사용한다.
- 예시: `2026-06-10 14:30 (UTC+7)`
- rollback이 발생하지 않은 경우 `해당 없음`으로 기록한다.
- 시간이 불명확한 경우 추정하지 말고 `미기록`으로 남긴다.

---

## 1. 문서 목적

```txt
이 문서는 staging 환경에서 RLS 정책 정리 테스트를 실행할 때,
정책 백업·실행 순서·QA 결과·롤백 여부를 기록하기 위한 실행 로그입니다.
production 반영 여부는 이 로그의 PASS 결과를 근거로 별도 판단합니다.
```

---

## 2. 실행 기본 정보

| 항목 | 내용 |
| ---------------- | ------------------------------------------------------------------------------------------- |
| 실행 날짜 | 2026-06-11 |
| 실행자 | Cursor AI |
| 환경 | staging |
| Git commit | 0df2330 |
| Supabase project | xxhfffvdmlzbozgfefrx |
| 테스트 범위 | lectures / feedback_comments |
| 관련 문서 | `docs/staging_lectures_rls_sql_draft.md`, `docs/staging_feedback_comments_rls_sql_draft.md` |
| production 반영 여부 | 아직 아님 |
| 실행 시작 시각 | 2026-06-11 04:42 (UTC+7) |
| 실행 종료 시각 | 2026-06-11 04:59 (UTC+7) |
| rollback 발생 시각 | 해당 없음 / HH:MM (UTC+7) |

---

## 3. 실행 타임라인

| 순서 | 단계 | 시작 시각 | 종료 시각 | 결과 | 메모 |
|---|---|---|---|---|---|
| 1 | 실행 전 환경 확인 | 04:42 | 04:44 | PASS | 필수 env 키 존재 확인 완료 |
| 2 | 정책 백업 | 04:44 | 04:44 | 해당 없음 | 본 작업 범위는 Playwright 기준선 QA 실행 |
| 3 | 기준선 QA | 04:44 | 04:59 | FAIL | 최초 브라우저 실행 파일 누락 후 재설치, 재실행 시 STAGING_BASE_URL DNS 해석 실패(ERR_NAME_NOT_RESOLVED) |
| 4 | lectures RLS 테스트 |  |  | PASS / FAIL |  |
| 5 | lectures QA |  |  | PASS / FAIL |  |
| 6 | feedback_comments RLS 테스트 |  |  | PASS / FAIL |  |
| 7 | feedback/첨삭 회귀 QA |  |  | PASS / FAIL |  |
| 8 | 전체 권한 QA |  |  | PASS / FAIL |  |
| 9 | rollback | 해당 없음 /  | 해당 없음 /  | 실행 / 미실행 |  |
| 10 | 최종 판정 |  |  | PASS / FAIL |  |

---

## 4. 실행 전 필수 체크리스트

- [ ] staging 환경인지 확인
- [ ] production이 아닌지 재확인
- [ ] 현재 RLS 정책 목록 백업 완료
- [ ] rollback SQL 초안 준비 완료
- [ ] 테스트 계정 준비 완료: admin, teacher A/B, student A/B, parent A/B
- [ ] 테스트 데이터 준비 완료: A/B class, lecture, assignment, submission, feedback
- [ ] `docs/manual_permission_test_guide.md` 확인 완료
- [ ] `docs/staging_lectures_rls_sql_draft.md` 확인 완료
- [ ] `docs/staging_feedback_comments_rls_sql_draft.md` 확인 완료
- [ ] 실행 전 현재 상태 QA 완료
- [ ] High 이슈 발생 시 즉시 중단하기로 합의

---

## 5. 현재 정책 백업 기록

| 테이블 | 백업 실행 여부 | 백업 저장 위치/메모 | 확인자 |
| ----------------- | -------- | ----------- | --- |
| lectures | | | |
| feedback_comments | | | |

```txt
정책 백업 결과는 SQL 실행 결과를 그대로 복사해 이 문서 하단 또는 별도 파일에 보관한다.
```

---

## 6. lectures RLS 테스트 실행 기록

| 단계 | 작업 | 실행 여부 | 결과 | 메모 |
| -- | ----------------------------- | ----- | ----------- | -- |
| 1 | 기존 lectures 정책 확인 | | PASS / FAIL | |
| 2 | 기존 상태 QA 실행 | | PASS / FAIL | |
| 3 | staging 대체 정책 적용 | | PASS / FAIL | |
| 4 | `lectures: 로그인 사용자 조회` 제거 테스트 | | PASS / FAIL | |
| 5 | lectures QA 실행 | | PASS / FAIL | |
| 6 | 문제 발생 시 rollback | | 실행 / 미실행 | |

### lectures QA 상세

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | ----------------------- | --------- | ----- | --------- | -- |
| admin | 모든 lectures 조회 | 허용 | | | |
| teacher A | A반 lectures 조회 | 허용 | | | |
| teacher A | B반 lectures 조회 | 차단 | | | |
| teacher A | A반 lecture 생성 | 허용 | | | |
| teacher A | B반 class_id로 lecture 생성 | 차단 | | | |
| student A | A반 lectures 조회 | 허용 | | | |
| student A | B반 lectures 조회 | 차단 | | | |
| parent A | lectures 직접 조회 | 차단 또는 미노출 | | | |
| logged-out | lectures 조회 | 차단 | | | |

---

## 7. feedback_comments RLS 테스트 실행 기록

| 단계 | 작업 | 실행 여부 | 결과 | 메모 |
| -- | -------------------------------------- | ----- | ----------- | -- |
| 1 | 기존 feedback_comments 정책 확인 | | PASS / FAIL | |
| 2 | 기존 상태 feedback/첨삭 QA 실행 | | PASS / FAIL | |
| 3 | `feedback_comments: 로그인 사용자 조회` 제거 테스트 | | PASS / FAIL | |
| 4 | feedback/첨삭 회귀 QA 실행 | | PASS / FAIL | |
| 5 | 문제 발생 시 rollback | | 실행 / 미실행 | |

### feedback_comments QA 상세

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | --------------------- | ----- | ----- | --------- | -- |
| admin | feedback/첨삭 관련 화면 조회 | 허용 | | | |
| teacher A | A반 제출물 첨삭 조회 | 허용 | | | |
| teacher A | A반 feedback 생성/수정 | 허용 | | | |
| teacher A | B반 제출물 첨삭 접근 | 차단 | | | |
| student A | 본인 feedback 조회 | 허용 | | | |
| student A | 타 학생 feedback 접근 | 차단 | | | |
| parent A | 자녀 feedback 조회 | 허용 | | | |
| parent A | 타 자녀 feedback 접근 | 차단 | | | |
| logged-out | feedback 관련 보호 페이지 접근 | 차단 | | | |

추가 확인 체크리스트:

- [ ] `feedbacks.comment`가 정상 표시됨
- [ ] teacher 첨삭 저장이 정상 동작함
- [ ] student 첨삭 조회가 정상 동작함
- [ ] parent 첨삭 조회가 정상 동작함
- [ ] 콘솔/네트워크 응답에 `feedback_comments` 관련 오류 없음

---

## 8. 실패 이슈 기록

### 실패 이슈 #1 (테스트 인프라)

- 날짜: 2026-06-11
- 환경: staging baseline playwright
- 관련 테이블: 해당 없음
- 관련 정책: 해당 없음
- 로그인 계정: admin/teacherA/studentA/parentA 전부 영향
- 접근 URL: test launch 단계
- 기대 결과: Playwright가 chromium headless shell 실행
- 실제 결과: `Executable doesn't exist ... chrome-headless-shell.exe`
- 노출된 데이터: 없음
- 심각도: Low
- rollback 실행 여부: 미실행
- 조치 메모: `npx playwright install chromium chromium-headless-shell --force` 재설치로 해소

### 실패 이슈 #2 (환경 설정)

- 날짜: 2026-06-11
- 환경: staging baseline playwright
- 관련 테이블: 해당 없음
- 관련 정책: 해당 없음
- 로그인 계정: admin/teacherA/studentA/parentA 전부 영향
- 접근 URL: `https://staging-app-url.example.com/*`
- 기대 결과: staging 앱 접속 및 로그인/핵심 화면 로딩 검증
- 실제 결과: `net::ERR_NAME_NOT_RESOLVED`
- 노출된 데이터: 없음
- 심각도: Medium
- rollback 실행 여부: 미실행
- 조치 메모: `.env.local`의 `STAGING_BASE_URL`이 예시 도메인으로 설정되어 실제 QA 불가. 실제 staging URL로 교체 후 재실행 필요

### 분류 결과

- 테스트 코드 문제: **있음(수정 완료)**  
  - 상대 경로 `page.goto("/...")`에서 baseURL 미적용 상황 대응을 위해 절대 URL 해석(`resolveUrl`)으로 보강
- 앱 버그: **없음(미확인)**  
  - 네트워크 접속 자체 실패로 앱 동작 단계까지 도달하지 못함
- 데이터/계정 문제: **부분 있음(환경 문제)**  
  - 계정 env 키는 존재하나, staging URL이 유효하지 않아 테스트 진행 불가

### console / network 오류 요약

- console error: 앱 런타임 콘솔 오류 검증 불가(페이지 미진입)
- 4xx/5xx: 관측되지 않음 (DNS 실패로 HTTP 요청 단계 미도달)
- 네트워크 오류: `ERR_NAME_NOT_RESOLVED` 5/5 테스트 공통 발생

심각도 기준:

- High: 권한 없는 사용자가 타인 데이터를 실제로 볼 수 있음
- Medium: 정상 사용자가 필요한 데이터를 볼 수 없거나 500 에러 발생
- Low: 문구/빈 상태/UI 문제

---

## 9. 최종 판정

| 항목 | 결과 | 메모 |
| ---------------------- | ----------- | -- |
| lectures QA | BLOCKED | staging URL 미유효로 baseline 단계 미통과 |
| feedback_comments QA | BLOCKED | staging URL 미유효로 baseline 단계 미통과 |
| High 이슈 | 0개 / 있음 | |
| rollback 필요 여부 | 불필요 | 정책/SQL 미적용 |
| production 반영 검토 가능 여부 | 불가 | baseline QA 자체가 환경 문제로 실패 |

---

## 10. production 반영 전 추가 조건

- [ ] staging QA 전체 PASS
- [ ] High 이슈 0개
- [ ] rollback 절차 검증 완료
- [ ] production 정책 백업 계획 준비
- [ ] production 반영 SQL 문서 별도 작성
- [ ] 반영 시간/담당자/검증자 확정
- [ ] production 반영 후 smoke test 계획 준비

---

## 11. 완료 기준

- [x] `docs/staging_rls_qa_execution_log.md` 생성
- [x] 실행 전 체크리스트 포함
- [x] lectures QA 기록표 포함
- [x] feedback_comments QA 기록표 포함
- [x] 실패 이슈 템플릿 포함
- [x] 최종 판정 표 포함
- [x] production 반영 전 추가 조건 포함
- [x] 실제 SQL 실행 없음
- [x] 앱 코드 수정 없음

---

## 참고 문서

- `docs/staging_lectures_rls_sql_draft.md`
- `docs/staging_feedback_comments_rls_sql_draft.md`
- `docs/manual_permission_test_guide.md`
- `docs/rls_replacement_plan.md`

---

## 12. 기준선 QA 재실행 (신규 admin 페이지 포함)

| 항목 | 내용 |
| --- | --- |
| 실행 날짜 | 2026-06-11 |
| 실행 시각 | 2026-06-11 06:14 (UTC+7) |
| 실행 명령 | `npm run test:e2e:staging-baseline` |
| 대상 스펙 | `tests/e2e/staging-baseline.spec.ts` |
| 신규 포함 화면 | `/admin/feedback`, `/admin/lectures`, `/admin/assignments`, `/admin/records` |

### 스펙 검증 범위(이번 실행 기준)

- admin: `/admin/dashboard`, `/admin/students`, `/admin/feedback`, `/admin/lectures`, `/admin/assignments`, `/admin/records`
- teacherA: `/teacher/dashboard`, `/teacher/lectures`, `/teacher/submissions`
- studentA: `/student/dashboard`, `/student/lectures`, `/student/feedback`
- parentA: `/parent/dashboard`, `/parent/feedback`
- logged-out: 보호 페이지 접근 차단(`/teacher/dashboard`, `/admin/dashboard`, `/student/dashboard`, `/parent/dashboard`)
- 공통: console error, `400/401/403/500` 응답 감지 로직 포함

### 환경변수 확인 결과

- `.env.local` 기준 필수 키 존재:
  - `STAGING_BASE_URL`
  - `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
  - `E2E_TEACHERA_EMAIL`, `E2E_TEACHERA_PASSWORD`
  - `E2E_STUDENTA_EMAIL`, `E2E_STUDENTA_PASSWORD`
  - `E2E_PARENTA_EMAIL`, `E2E_PARENTA_PASSWORD`
- 시스템 환경변수 레벨에는 미주입 상태이나, 스펙의 `.env.local` 로더로 실행 가능

### 실행 결과 요약

- 총 5개 테스트 실행
- PASS: 0
- FAIL: 5

### PASS 항목

- 없음

### FAIL 항목 상세

| 테스트 | 결과 | 분류 | 원인 |
| --- | --- | --- | --- |
| admin 로그인 및 `/admin/*` 접근 | FAIL | 데이터·계정/환경 문제 | `STAGING_BASE_URL=https://staging-app-url.example.com` DNS 해석 실패 (`ERR_NAME_NOT_RESOLVED`) |
| teacher A 로그인 및 핵심 화면 접근 | FAIL | 데이터·계정/환경 문제 | 동일 |
| student A 로그인 및 핵심 화면 접근 | FAIL | 데이터·계정/환경 문제 | 동일 |
| parent A 로그인 및 핵심 화면 접근 | FAIL | 데이터·계정/환경 문제 | 동일 |
| logged-out 보호 페이지 접근 차단 | FAIL | 데이터·계정/환경 문제 | 동일 |

### 분류 결론

- 테스트 코드 문제: 없음 (신규 admin 페이지 포함 스펙 확장 정상 반영)
- 앱 버그: 판단 불가 (앱 진입 전 DNS 단계에서 실패)
- 데이터·계정 문제: 있음 (유효하지 않은 staging URL 설정)

### 후속 조치

1. `.env.local`의 `STAGING_BASE_URL`을 실제 접속 가능한 staging URL로 교체
2. 동일 스펙 재실행 후 PASS/FAIL 재기록

---

## 13. 로컬 기준선 재실행

| 항목 | 내용 |
| --- | --- |
| 실행 날짜 | 2026-06-11 |
| 실행 시각 | 2026-06-11 06:21 (UTC+7) |
| 실행 환경 | local (`http://localhost:3000`) |
| 실행 명령 | `npm run test:e2e:staging-baseline` |
| 대상 스펙 | `tests/e2e/staging-baseline.spec.ts` |

### 실행 전 설정 변경

- `.env.local`의 `STAGING_BASE_URL`을 `http://localhost:3000`으로 변경
- `localhost:3000` 응답 확인: `200 OK`

### 1차 실행 결과

- 결과: 4 PASS / 1 FAIL
- FAIL 항목:
  - `admin 로그인 및 /admin/* 접근`
  - 원인: 테스트 타임아웃(기본 30초) 초과
  - 분류: 테스트 코드 문제
  - 비고: 관리자 케이스에서 신규 admin 화면 검증이 추가되어 실행 시간이 증가함

### 테스트 코드 보정

- 앱 코드 수정 없이 스펙만 보정:
  - `admin` 테스트에 `test.setTimeout(90000)` 추가

### 2차 실행 최종 결과

- 결과: 5 PASS / 0 FAIL
- PASS 목록:
  1. admin 로그인 및 `/admin/*` 접근 (신규 admin 페이지 포함)
  2. teacher A 로그인 및 핵심 화면 접근
  3. student A 로그인 및 핵심 화면 접근
  4. parent A 로그인 및 핵심 화면 접근
  5. logged-out 보호 페이지 접근 차단

### 최종 분류

- 테스트 코드 문제: 있음 (타임아웃 부족, 스펙 보정 후 해소)
- 앱 버그: 없음
- 데이터/계정 문제: 없음 (local 기준 정상 로그인/접근 확인)
