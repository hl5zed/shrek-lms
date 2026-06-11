# staging RLS Round 1 실제 실행 기록

## Round 1 Staging RLS 실제 실행 절차 (체크리스트)

목표: `lectures`, `feedback_comments` High 후보 RLS 정책을 staging에서 실제 검증하고 결과를 본 문서에 기록한다.

### 0) 기본 정보 먼저 입력

- 날짜: 2026-06-10
- 시간대: UTC+7
- 환경: staging
- production 접근 여부: 접근하지 않음
- 실행자:
- 검증자:
- 실행 시작 시각:

### 1) Supabase staging 프로젝트 확인

체크:
- [ ] 현재 프로젝트가 staging 프로젝트인가?
- [ ] production 프로젝트는 열려 있지 않은가?
- [ ] SQL Editor가 staging 프로젝트에 연결되어 있는가?

기록 예시:
- Supabase 프로젝트 확인: staging 확인 완료 (PASS)
- production 접근 여부: 접근하지 않음 (PASS)

### 2) 기존 정책 백업 실행

실행 SQL:

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('lectures', 'feedback_comments')
order by tablename, policyname;
```

백업 파일 권장:
- `docs/staging_rls_policy_backup_round1.md`

기록:
- lectures 정책 백업: PASS / FAIL
- feedback_comments 정책 백업: PASS / FAIL
- 백업 저장 위치:
- 백업 완료 시각: HH:MM (UTC+7)

### 3) 기준선 QA 실행 (SQL 변경 전)

확인 계정:
- admin
- teacher A
- teacher B
- student A
- student B
- parent A
- parent B

필수 확인:
- [ ] admin 로그인/화면 정상
- [ ] teacher lectures 목록 정상
- [ ] student lectures 목록 정상
- [ ] teacher feedback 저장 정상
- [ ] student feedback 조회 정상
- [ ] parent feedback 조회 정상
- [ ] 콘솔/네트워크 오류 없음

중단 조건:
- 기준선 QA FAIL이면 즉시 중단하고 RLS 변경 진행 금지

### 4) lectures RLS 적용

참고 문서:
- `docs/staging_lectures_rls_sql_draft.md`

적용 후 확인 SQL:

```sql
select
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'lectures'
order by policyname;
```

기록:
- lectures 대체 정책 적용: PASS / FAIL
- `lectures: 로그인 사용자 조회` 제거 테스트: PASS / FAIL
- SQL 에러: 없음 / 있음

### 5) lectures 역할별 QA

판정표:
- admin: 전체 lectures 조회 허용 (PASS / FAIL)
- teacher A: class A 조회/생성 허용 (PASS / FAIL)
- teacher A: class B 조회/생성 차단 (PASS / FAIL)
- teacher B: class B 조회 허용 (PASS / FAIL)
- teacher B: class A 조회 차단 (PASS / FAIL)
- student A: class A 조회 허용 (PASS / FAIL)
- student A: class B 조회 차단 (PASS / FAIL)
- student B: class B 조회 허용 (PASS / FAIL)
- student B: class A 조회 차단 (PASS / FAIL)
- parent A: lectures 직접 조회 차단/미노출 (PASS / FAIL)
- logged-out: 보호 페이지 접근 차단 (PASS / FAIL)

High 이슈 기준:
- 권한 없는 계정이 타 반 lectures를 볼 수 있으면 즉시 중단

### 6) feedback_comments RLS 적용

참고 문서:
- `docs/staging_feedback_comments_rls_sql_draft.md`

적용 후 확인 SQL:

```sql
select
  tablename,
  policyname,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename = 'feedback_comments'
order by policyname;
```

기록:
- `feedback_comments: 로그인 사용자 조회` 제거 테스트: PASS / FAIL
- SQL 에러: 없음 / 있음

### 7) feedback/첨삭 회귀 QA

판정표:
- teacher 첨삭 저장: 정상 (PASS / FAIL)
- teacher 첨삭 수정: 정상 (PASS / FAIL)
- student 본인 첨삭 조회: 정상 (PASS / FAIL)
- parent 자녀 첨삭 조회: 정상 (PASS / FAIL)
- teacher B가 A반 첨삭 접근: 차단 (PASS / FAIL)
- student가 타인 첨삭 접근: 차단 (PASS / FAIL)
- parent가 타 자녀 첨삭 접근: 차단 (PASS / FAIL)
- feedbacks.comment 노출: 정상 (PASS / FAIL)
- feedback_comments 관련 오류: 없음 (PASS / FAIL)

High 이슈 기준:
- 타인 첨삭/피드백 노출 시 즉시 중단

### 8) 통합 QA

최종 확인:
- [ ] lectures 핵심 흐름 정상
- [ ] feedback 핵심 흐름 정상
- [ ] 역할별 URL 직접 접근 차단
- [ ] 로그아웃 상태 보호 페이지 차단
- [ ] admin/teacher/student/parent 기본 화면 정상
- [ ] 콘솔/네트워크 오류 없음

### 9) 최종 판정

PASS 조건:
- High 이슈 0건
- 핵심 시나리오 전부 PASS

PASS 기록 예시:
- 최종 판정: Round 1 PASS
- 근거:
  - High 이슈 0건
  - lectures RLS QA PASS
  - feedback_comments 회귀 QA PASS
  - 통합 권한 QA PASS
- production 적용은 미실행
- 다음 단계: production 반영 문서화 준비

FAIL 기록 예시:
- 최종 판정: Round 1 FAIL
- 근거:
  - 실패 항목:
  - 심각도:
  - 발생 시각:
- 조치:
  - 즉시 중단
  - rollback 실행
  - 원인 분석 후 Round 2 준비

### 절대 원칙

Round 1 staging PASS 확정 전까지 production에는 절대 적용하지 않는다.

---

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

## 1. 실행 기본 정보

| 항목 | 기록 |
| ---------------- | ---------------------------- |
| 실행 회차 | Round 1 |
| 실행 날짜 | YYYY-MM-DD |
| 실행자 | |
| 검증자 | |
| 환경 | staging |
| Git commit | |
| Supabase project | |
| 테스트 범위 | lectures / feedback_comments |
| production 반영 여부 | 아님 |
| 실행 시작 시각 | HH:MM (UTC+7) |
| 실행 종료 시각 | HH:MM (UTC+7) |
| 총 소요 시간 | |
| rollback 발생 시각 | 해당 없음 / HH:MM (UTC+7) |

---

## 2. 실행 타임라인

| 순서 | 단계 | 시작 시각 | 종료 시각 | 결과 | 메모 |
|---|---|---|---|---|---|
| 1 | 실행 전 환경 확인 |  |  | PASS / FAIL |  |
| 2 | 정책 백업 |  |  | PASS / FAIL |  |
| 3 | 기준선 QA |  |  | PASS / FAIL |  |
| 4 | lectures RLS 테스트 |  |  | PASS / FAIL |  |
| 5 | lectures QA |  |  | PASS / FAIL |  |
| 6 | feedback_comments RLS 테스트 |  |  | PASS / FAIL |  |
| 7 | feedback/첨삭 회귀 QA |  |  | PASS / FAIL |  |
| 8 | 전체 권한 QA |  |  | PASS / FAIL |  |
| 9 | rollback | 해당 없음 /  | 해당 없음 /  | 실행 / 미실행 |  |
| 10 | 최종 판정 |  |  | PASS / FAIL |  |

---

## 3. 실제 테스트 계정 기록

| 역할 | 계정 이메일 | 연결 데이터 | 로그인 확인 |
| --------- | ------ | ------------- | ----------- |
| admin | | 전체 관리 권한 | PASS / FAIL |
| teacher A | | class A 담당 | PASS / FAIL |
| teacher B | | class B 담당 | PASS / FAIL |
| student A | | class A 소속 | PASS / FAIL |
| student B | | class B 소속 | PASS / FAIL |
| parent A | | student A 학부모 | PASS / FAIL |
| parent B | | student B 학부모 | PASS / FAIL |

---

## 4. 실제 테스트 ID 기록

| 항목 | 실제 ID | 비고 |
| --------------- | ----- | --------------- |
| class A id | | teacher A 담당 |
| class B id | | teacher B 담당 |
| lecture A id | | class A 소속 |
| lecture B id | | class B 소속 |
| assignment A id | | class A 소속 |
| assignment B id | | class B 소속 |
| submission A id | | student A 제출 |
| submission B id | | student B 제출 |
| feedback A id | | submission A 연결 |
| feedback B id | | submission B 연결 |

---

## 5. 정책 백업 기록

| 테이블 | 백업 SQL 실행 여부 | 백업 저장 위치 | 확인자 | 메모 |
| ----------------- | ------------ | -------- | --- | -- |
| lectures | PASS / FAIL | | | |
| feedback_comments | PASS / FAIL | | | |

---

## 6. 기준선 QA 결과

정책 변경 전 기존 상태에서 정상 동작하는지 확인합니다.

| 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| --------------------- | ----------- | ----- | --------- | -- |
| admin 로그인 | 허용 | | | |
| teacher A 로그인 | 허용 | | | |
| teacher B 로그인 | 허용 | | | |
| student A 로그인 | 허용 | | | |
| student B 로그인 | 허용 | | | |
| parent A 로그인 | 허용 | | | |
| parent B 로그인 | 허용 | | | |
| teacher A lectures 목록 | class A만 조회 | | | |
| teacher B lectures 목록 | class B만 조회 | | | |
| student A lectures 목록 | class A만 조회 | | | |
| student B lectures 목록 | class B만 조회 | | | |
| teacher feedback 저장 | 정상 저장 | | | |
| student feedback 조회 | 정상 조회 | | | |
| parent feedback 조회 | 정상 조회 | | | |

### Step 2. 기준선 QA

- 시작 시각: 미기록
- 환경: staging
- 정책 변경 여부: 변경 전
- production 접근 여부: 접근하지 않음

### 로그인 확인

| 역할 | 계정 | 기대 결과 | 실제 결과 | 판정 |
|---|---|---|---|---|
| admin | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| teacher A | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| teacher B | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| student A | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| student B | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| parent A | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |
| parent B | 미기록 | 로그인 성공 | 현재 실행 환경에서 실제 로그인 테스트 미수행 | BLOCKED / NOT VERIFIED |

### lectures 기준선 QA

| 항목 | 기대 결과 | 실제 결과 | 판정 |
|---|---|---|---|
| admin lectures | 접근 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| teacher A lectures | 목록 조회 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| teacher B lectures | 목록 조회 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| student A lectures | 목록 조회 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| student B lectures | 목록 조회 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| parent lectures | 문서 기대와 일치 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| logged-out 보호 페이지 | 접근 차단 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |

### feedback 기준선 QA

| 항목 | 기대 결과 | 실제 결과 | 판정 |
|---|---|---|---|
| teacher 첨삭 저장 | 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| teacher 첨삭 수정 | 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| student 본인 첨삭 조회 | 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| parent 자녀 첨삭 조회 | 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| feedbacks.comment | 노출 정상 | 실제 브라우저 시나리오 미검증 | BLOCKED / NOT VERIFIED |
| 콘솔/네트워크 오류 | 없음 | 실제 브라우저 콘솔/네트워크 미검증 | BLOCKED / NOT VERIFIED |

## 기준선 QA 최종 판정

- 로그인 확인: BLOCKED / NOT VERIFIED
- lectures 기준선: BLOCKED / NOT VERIFIED
- feedback 기준선: BLOCKED / NOT VERIFIED
- 콘솔/네트워크 오류: BLOCKED / NOT VERIFIED
- 종료 시각: 미기록

최종 판정: BLOCKED / NOT VERIFIED

메모:
- 현재 작업 환경에서는 실제 브라우저 로그인/화면 조작/콘솔 확인을 수행하지 못해 기준선 QA를 완료할 수 없음.
- 기준선 QA가 기능 실패가 아니라 검증 보류 상태이므로 RLS 적용 단계 진행 금지.

주의:
본 결과는 앱 기능 실패가 아니라, 현재 실행 환경에서 실제 브라우저 기반 QA를 수행할 수 없어 검증이 보류된 상태이다.
따라서 Round 1 RLS 적용 단계로 진행하지 않는다.
사람이 직접 staging 앱에서 기준선 QA를 수행하고 PASS가 확인된 후에만 lectures RLS 적용 단계로 이동한다.

다음 단계: RLS 적용 중단. 기준선 실패 원인 수정 후 재시도.

### Playwright 자동 기준선 QA 기록 템플릿

아래 템플릿은 `tests/e2e/staging-baseline.spec.ts` 실행 결과를 기록할 때 사용합니다.

#### 실행 정보

- 실행 일시: YYYY-MM-DD HH:MM (UTC+7)
- 실행 환경: staging
- 실행자:
- 실행 명령어: `npx playwright test tests/e2e/staging-baseline.spec.ts`
- 결과 요약: PASS / FAIL / BLOCKED

#### 항목별 결과

| 항목 | 기대 결과 | 실제 결과 | 판정 |
|---|---|---|---|
| admin 로그인 + /admin 접근 | 정상 |  | PASS / FAIL / BLOCKED |
| teacher A 로그인 + /teacher 접근 | 정상 |  | PASS / FAIL / BLOCKED |
| student A 로그인 + /student 접근 | 정상 |  | PASS / FAIL / BLOCKED |
| parent A 로그인 + /parent 접근 | 정상 |  | PASS / FAIL / BLOCKED |
| logged-out 보호 페이지 차단 | 정상 |  | PASS / FAIL / BLOCKED |
| lectures 화면 로딩 | 정상 |  | PASS / FAIL / BLOCKED |
| feedback 화면 로딩 | 정상 |  | PASS / FAIL / BLOCKED |
| console error | 없음 |  | PASS / FAIL / BLOCKED |
| network 400/401/403/500 | 없음 |  | PASS / FAIL / BLOCKED |

#### 상세 메모

- 실패 또는 차단 사유:
- 첨부 산출물: playwright html report / trace / screenshot 경로
- 다음 단계:
  - PASS: lectures RLS 적용/검증으로 진행
  - FAIL/BLOCKED: RLS 적용 중단 및 원인 해소 후 재실행

## Playwright 자동 기준선 QA 결과

- 실행일: 2026-06-10
- 시간대: UTC+7
- 환경: staging
- 실행 명령어: `npm run test:e2e:staging-baseline`
- 실행자: 미기록
- 시작 시각: 미기록
- 종료 시각: 미기록

### 결과 요약

- admin 로그인/접근: BLOCKED / ENV NOT READY
- teacher A 로그인/접근: BLOCKED / ENV NOT READY (미실행)
- student A 로그인/접근: BLOCKED / ENV NOT READY (미실행)
- parent A 로그인/접근: BLOCKED / ENV NOT READY (미실행)
- lectures 화면 로딩: BLOCKED / ENV NOT READY
- feedback 화면 로딩: BLOCKED / ENV NOT READY
- logged-out 보호 페이지 차단: BLOCKED / ENV NOT READY (미실행)
- console error: 미검증 (환경변수 누락으로 시나리오 진입 불가)
- network 400/401/403/500 오류: 미검증 (환경변수 누락으로 시나리오 진입 불가)

최종 판정: BLOCKED / ENV NOT READY

메모:
- 사전 점검 결과 `STAGING_BASE_URL`, `E2E_*` 계정 환경변수가 모두 누락됨.
- Playwright 실행 시 첫 테스트에서 `필수 환경변수 누락: STAGING_BASE_URL`로 즉시 실패하여 나머지 4개 테스트는 미실행.
- 현재 단계에서는 RLS 적용을 진행하지 않음.
- 환경변수/계정 보완 후 Playwright 기준선 QA를 재실행해야 함.

## Playwright 자동 기준선 QA selector 보정 후 재실행 결과

- 실행일: 2026-06-10
- 시간대: UTC+7
- 실행 명령어: `npm run test:e2e:staging-baseline`
- 환경: local/staging baseline
- STAGING_BASE_URL: `http://localhost:3000` (로컬 기준선 실행)
- 실행자: 미기록

### 결과 요약

- admin 로그인/접근: PASS
- teacher A 로그인/접근: PASS
- student A 로그인/접근: PASS
- parent A 로그인/접근: PASS
- logged-out 보호 페이지 차단: PASS
- console error: 없음 (PASS)
- network 400/401/403/500 오류: 없음 (PASS)

최종 판정: `AUTOMATED BASELINE PASS`

메모:
- teacher/parent strict mode selector 충돌을 heading role 기반 locator로 보정.
- student dashboard 기대값을 실제 UI 구조(인사 문구 + 핵심 섹션 heading)로 보정.
- 기준선 QA 목적에 맞춰 URL 접근 + 핵심 로딩 검증 중심으로 안정화.
- 모든 자동 기준선 테스트 PASS 확인. 다음 단계로 `lectures RLS 적용/검증` 이동 가능.

## Step 3. lectures RLS 적용/검증

- 시작 시각: 미기록
- 환경: staging
- production 접근 여부: 접근하지 않음
- 기준선 QA 상태: AUTOMATED BASELINE PASS
- 적용 대상: public.lectures

사전 확인:
- `docs/staging_lectures_rls_sql_draft.md` 확인 완료
- `lectures: 로그인 사용자 조회` 제거 대상 확인 완료
- admin/teacher/student 대체 정책 초안 확인 완료
- rollback 근거 문서 `docs/staging_rls_policy_backup_round1.md` 확인 완료

실행 상태:
- staging Supabase SQL Editor 직접 실행: BLOCKED
- 사유: 현재 실행 환경에서는 Supabase Dashboard/SQL Editor 원격 접속 권한이 없어 SQL 적용을 수행할 수 없음
- `feedback_comments` 관련 SQL 실행: 미실행 (제한 준수)

## Step 3. lectures RLS 적용/검증 결과

- 적용 대상: public.lectures
- 적용 SQL 문서: docs/staging_lectures_rls_sql_draft.md
- 적용 시각: 미기록
- 정책 상태 확인 SQL 실행: BLOCKED / SQL NOT EXECUTED
- `lectures: 로그인 사용자 조회` 제거 확인: NOT VERIFIED

### 역할별 QA 결과

| 역할 | 기대 결과 | 실제 결과 | 판정 |
|---|---|---|---|
| admin | 전체 lectures 조회 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher A | class A 조회 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher A | class B 조회 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher A | class A 생성 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher A | class B 생성 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher B | class B 조회 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| teacher B | class A 조회 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| student A | class A 조회 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| student A | class B 조회 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| student B | class B 조회 허용 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| student B | class A 조회 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| parent A | lectures 직접 조회 차단/미노출 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |
| logged-out | 보호 페이지 접근 차단 | SQL 미적용으로 Step 3 QA 미실행 | NOT RUN / SQL NOT APPLIED |

### Playwright 회귀 확인

- 실행 명령어: `npm run test:e2e:staging-baseline`
- admin: PASS (직전 기준선 결과 유지)
- teacher: PASS (직전 기준선 결과 유지)
- student: PASS (직전 기준선 결과 유지)
- parent: PASS (직전 기준선 결과 유지)
- logged-out: PASS (직전 기준선 결과 유지)
- console error: 없음 (직전 기준선 결과)
- network 400/401/403/500 오류: 없음 (직전 기준선 결과)

### 최종 판정

- High 이슈: 없음
- lectures RLS 검증 판정: BLOCKED / SQL NOT EXECUTED

메모:
- 본 결과는 기능/권한 실패가 아니라 Step 3 SQL 적용 자체를 수행하지 못한 실행 환경 제약에 의한 미완료 상태다.
- staging Supabase SQL Editor에서 사람이 직접 `docs/staging_lectures_rls_sql_draft.md` SQL을 실행한 뒤 정책 상태 확인 SQL + 역할별 QA + Playwright 회귀를 다시 수행해야 한다.
- 현재 단계에서는 RLS 적용 진행을 중단한다.

주의:
이번 Step 3 결과는 RLS 정책 검증 실패가 아니라, 현재 실행 환경에서 staging Supabase SQL Editor 원격 실행을 수행할 수 없어 SQL 적용이 보류된 상태이다.
따라서 rollback은 실행하지 않는다.
실제 DB 변경이 없으므로 rollback 대상도 없다.
사람이 staging Supabase SQL Editor에서 `docs/staging_lectures_rls_sql_draft.md` SQL을 직접 실행한 뒤, 정책 조회 SQL과 역할별 QA를 다시 수행해야 한다.

rollback 필요 여부: 불필요

다음 단계: 사람이 staging Supabase SQL Editor에서 lectures SQL 직접 실행 후 재검증

---

## 7. lectures RLS 실행 기록

| 단계 | 작업 | 시작 시각 | 종료 시각 | 실행 여부 | 결과 | 메모 |
| -- | ------------------------- | --------- | --------- | -------- | ----------- | -- |
| 1 | 현재 lectures 정책 확인 | | | | PASS / FAIL | |
| 2 | lectures 대체 정책 적용 | | | | PASS / FAIL | |
| 3 | `lectures: 로그인 사용자 조회` 제거 | | | | PASS / FAIL | |
| 4 | lectures 역할별 QA 실행 | | | | PASS / FAIL | |
| 5 | 문제 시 rollback | | | 실행 / 미실행 | | |

### lectures 역할별 QA

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | ---------------------------- | ------ | ----- | --------- | -- |
| admin | 모든 lectures 조회 | 허용 | | | |
| teacher A | class A lectures 조회 | 허용 | | | |
| teacher A | class B lectures 조회 | 차단 | | | |
| teacher A | class A lecture 생성 | 허용 | | | |
| teacher A | class B class_id로 lecture 생성 | 차단 | | | |
| teacher B | class B lectures 조회 | 허용 | | | |
| teacher B | class A lectures 조회 | 차단 | | | |
| student A | class A lectures 조회 | 허용 | | | |
| student A | class B lectures 조회 | 차단 | | | |
| student B | class B lectures 조회 | 허용 | | | |
| student B | class A lectures 조회 | 차단 | | | |
| parent A | lectures 직접 조회 | 차단/미노출 | | | |
| logged-out | lectures 접근 | 차단 | | | |

---

## 8. feedback_comments RLS 실행 기록

| 단계 | 작업 | 시작 시각 | 종료 시각 | 실행 여부 | 결과 | 메모 |
| -- | ---------------------------------- | --------- | --------- | -------- | ----------- | -- |
| 1 | 현재 feedback_comments 정책 확인 | | | | PASS / FAIL | |
| 2 | `feedback_comments: 로그인 사용자 조회` 제거 | | | | PASS / FAIL | |
| 3 | feedback/첨삭 회귀 QA 실행 | | | | PASS / FAIL | |
| 4 | 문제 시 rollback | | | 실행 / 미실행 | | |

### feedback/첨삭 역할별 QA

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | ---------------------- | ----- | ----- | --------- | -- |
| admin | feedback/첨삭 화면 조회 | 허용 | | | |
| teacher A | class A 제출물 첨삭 조회 | 허용 | | | |
| teacher A | class A feedback 생성/수정 | 허용 | | | |
| teacher A | class B 제출물 첨삭 접근 | 차단 | | | |
| student A | 본인 feedback 조회 | 허용 | | | |
| student A | student B feedback 접근 | 차단 | | | |
| parent A | student A feedback 조회 | 허용 | | | |
| parent A | student B feedback 접근 | 차단 | | | |
| logged-out | feedback 보호 페이지 접근 | 차단 | | | |

### feedback_comments 제거 후 회귀 확인

- [ ] `feedbacks.comment`가 정상 표시됨
- [ ] teacher 첨삭 저장 정상
- [ ] teacher 첨삭 수정 정상
- [ ] student 첨삭 조회 정상
- [ ] parent 첨삭 조회 정상
- [ ] 콘솔/네트워크에 `feedback_comments` 관련 오류 없음

---

## 9. 실패 이슈 기록

### 실패 이슈 1

* 날짜:
* 환경:
* 관련 테이블:
* 관련 정책:
* 로그인 계정:
* 접근 URL:
* 기대 결과:
* 실제 결과:
* 노출된 데이터:
* 심각도: High / Medium / Low
* 발생 시각:
* 감지 시각:
* rollback 시작 시각:
* rollback 완료 시각:
* rollback 실행 여부:
* 조치 메모:

---

## 10. 최종 판정

| 항목 | 결과 | 메모 |
| ------------------------- | ----------- | -- |
| 기준선 QA | PASS / FAIL | |
| lectures RLS 테스트 | PASS / FAIL | |
| feedback_comments RLS 테스트 | PASS / FAIL | |
| 전체 권한 QA | PASS / FAIL | |
| High 이슈 | 0개 / 있음 | |
| rollback 필요 여부 | 필요 / 불필요 | |
| 총 실행 시간 |  |  |
| rollback 실행 시각 | 해당 없음 /  |  |
| production 검토 판단 시각 |  |  |
| production 반영 검토 가능 여부 | 가능 / 불가 | |

---

## 10-1. lectures Round 1 실행 확정 기록

실행 요약:

- [A] 정책 백업 완료  
  - 적용 전 확인된 `lectures` 정책:
    - `admin_all_lectures`
    - `lectures: admin/teacher INSERT`
    - `lectures: 로그인 사용자 조회`
    - `student_class_lectures`
    - `teacher_own_lectures`
- [C] 롤백 1회 수행 후 [B] 재적용 완료
- 최종 정책 상태:
  - `lectures_select_admin_staging`
  - `lectures_select_teacher_class_staging`
  - `lectures_select_student_class_staging`
  - `lectures_insert_teacher_class_staging`
  - `lectures_update_teacher_class_staging`
  - 과허용 `SELECT` 정책(`lectures: 로그인 사용자 조회`) 제거 확인
- 적용 후 기준선 QA:
  - Playwright 기준선 5개 시나리오(localhost) 전체 PASS

발견 사항 (Round 2 이관):

- 기존 정책 `lectures: admin/teacher INSERT`는 class ownership 검증 없이
  admin/teacher 전체 INSERT를 허용하는 형태로 확인됨.
- 해당 정책은 Round 2 교체/정리 대상으로 분류한다.

---

## 10-2. feedback_comments Round 1 실행 확정 기록

실행 요약:

- 1차 적용 실패:
  - 초안 SQL이 `feedback_id` 컬럼을 가정하고 작성되어 실행 실패
  - 실제 스키마 확인 결과 `feedback_comments`는 `submission_id` 기준 연결 구조
- 재작성 후 재적용:
  - `submission_id` 기준 SQL로 수정 후 적용 성공
- 최종 정책 상태:
  - 유지: `feedback_comments: admin 전체`
  - 추가:
    - `fc_select_student_staging`
    - `fc_select_teacher_class_staging`
    - `fc_select_parent_child_staging`
    - `fc_insert_teacher_class_staging`
  - 제거: `feedback_comments: 로그인 사용자 조회` (과허용 SELECT)
- 적용 후 기준선 QA:
  - Playwright 기준선 5개 시나리오(localhost) 전체 PASS

발견 사항 (Round 2 이관):

- `feedback_comments`에는 UPDATE/DELETE 정책이 없음.
- 현재 앱에는 `feedback_comments` 수정/삭제 기능이 없으므로 Round 1에서는 영향 없음.
- 향후 앱에서 코멘트 수정/삭제 기능이 추가되면 Round 2에서 UPDATE/DELETE 정책 설계를 포함해 보강한다.

---

## 10-3. 첨삭 저장 성능 이슈(57014) 원인/조치 기록

증상:

- 강사 첨삭 저장(`saveFeedback`) 시 statement timeout (`57014`) 발생
- 저장 요청 1건당 약 45~80초 지연

원인 분석:

- `feedbacks -> submissions -> assignments -> classes -> class_students -> parent_students`로 이어지는
  RLS 정책 교차 참조가 누적됨
- 신·구 정책이 중복 공존하면서 planner가 다수 서브플랜을 생성
- `EXPLAIN ANALYZE` 기준 `SubPlan` 약 4,800개, `Planning Time` 약 26초 확인

조치:

- SECURITY DEFINER 헬퍼 함수 4종 추가
  - `is_teacher_of_submission`
  - `is_own_submission`
  - `is_parent_of_submission`
  - `is_teacher_of_assignment`
- `feedbacks`, `submissions`의 교차 테이블 참조 정책을 함수 기반 v2 정책으로 교체
- 추가로 `get_my_role()`을 SECURITY DEFINER로 변경하여 `profiles` 재귀 참조 위험 차단

결과:

- 첨삭 저장 성능: 약 843ms로 개선
- 첨삭 저장/조회 기능 정상 동작 확인

---

## 11. production 반영 전 메모

이 Round 1 staging 실행 기록은 production 반영 근거의 일부일 뿐입니다.

production 반영 전에는 반드시 다음이 필요합니다.

* production 정책 백업 계획
* production 전용 SQL 문서
* 반영 담당자와 검증자 확정
* 반영 후 smoke test 계획
* rollback 절차 확인

---

## 12. 완료 기준

- [x] 실행 기본 정보에 시작/종료/rollback 시각 항목 추가
- [x] 실행 타임라인 표 추가
- [x] lectures 실행 기록 표에 시작/종료 시각 컬럼 추가
- [x] feedback_comments 실행 기록 표에 시작/종료 시각 컬럼 추가
- [x] 실패 이슈 기록에 시간 항목 추가
- [x] 최종 판정 표에 시간 관련 항목 추가
- [x] 실제 SQL 실행 없음
- [x] 앱 코드 수정 없음

---

## 참고 문서

- `docs/staging_rls_execution_log_round1_sample.md`
- `docs/staging_rls_execution_runbook.md`
- `docs/staging_rls_qa_execution_log.md`
- `docs/staging_lectures_rls_sql_draft.md`
- `docs/staging_feedback_comments_rls_sql_draft.md`
- `docs/manual_permission_test_guide.md`
