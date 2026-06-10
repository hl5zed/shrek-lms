# 다음 단계 커서 명령어 (2026-06-11 기준)

각 단계의 명령어를 복사해서 Cursor에 붙여넣으세요.
**한 단계 완료 → 결과 확인 → 다음 단계** 순서를 지킵니다.

---

## 현재 진행 상황 요약

- 완료: 역할별 화면(관리자/강사/학생/학부모), 과제 제출 + 글자수 카운트, 첨삭 흐름, QA Round 1 문서, Playwright 기준선 스펙, RLS 교체 초안(lectures, feedback_comments)
- 미완료: 미커밋 변경 84개 파일, package.json 중복 키, Playwright 기준선 QA 실행, staging RLS 교체 실행, Round 1 수동 QA 실행

---

## 1단계 — 미커밋 변경 정리 및 커밋

```
수정 파일:
git 미커밋 변경 전체 (84개 파일)

목표:
현재 작업 트리의 변경 사항을 검토하고 논리 단위로 나눠 커밋한다.

작업:
1. git status와 git diff로 변경 내용을 영역별(admin/student/parent/teacher/components/docs/tests)로 분류해서 요약 보고
2. 의도하지 않은 변경(디버그 코드, console.log, 임시 mock)이 있으면 목록으로 알려주고 제거 여부 확인
3. 확인 후 영역별로 3~5개의 커밋으로 나눠 커밋 (커밋 메시지는 영어, 변경 요약 포함)

유지할 기존 기능:
- 모든 기존 화면 동작

수정 금지:
- DB schema 변경 금지
- RLS 정책 변경 금지
- package.json 변경 금지

완료 기준:
1. git status가 clean
2. npm run build 통과
```

---

## 2단계 — package.json 중복 키 수정

devDependencies에 `"@playwright/test"`가 두 번(^1.60.0, ^1.55.0) 선언되어 있음.
(package.json 수정 금지 원칙의 예외 — 버그 수정이므로 명시적으로 승인)

```
수정 파일:
package.json

목표:
devDependencies의 @playwright/test 중복 선언 버그를 수정한다. (사용자 승인된 package.json 수정)

작업:
1. "@playwright/test": "^1.55.0" 중복 항목 제거, "^1.60.0" 하나만 유지
2. npm install 실행해서 lock 파일 정리
3. npx playwright --version으로 정상 설치 확인

유지할 기존 기능:
- 기존 의존성 버전 전부 그대로

수정 금지:
- DB schema 변경 금지
- RLS 정책 변경 금지
- 다른 의존성 추가/제거/버전 변경 금지

완료 기준:
1. package.json에 @playwright/test가 한 번만 선언됨
2. npm run build 통과
3. npx playwright test --list 정상 동작
```

---

## 3단계 — Playwright 기준선 QA 실행 (RLS 적용 전 필수)

`docs/staging_playwright_baseline_qa.md` 기준. RLS 교체 전 기준선 PASS가 선행 조건.

먼저 터미널에서 환경변수 설정:

```bash
STAGING_BASE_URL=https://<staging-url>
E2E_ADMIN_EMAIL=... / E2E_ADMIN_PASSWORD=...
E2E_TEACHERA_EMAIL=... / E2E_TEACHERA_PASSWORD=...
E2E_STUDENTA_EMAIL=... / E2E_STUDENTA_PASSWORD=...
E2E_PARENTA_EMAIL=... / E2E_PARENTA_PASSWORD=...
```

커서 명령어:

```
수정 파일:
tests/e2e/staging-baseline.spec.ts (실패 시에만)

목표:
docs/staging_playwright_baseline_qa.md 가이드대로 RLS 적용 전 기준선 QA를 실행하고 결과를 기록한다.

작업:
1. npx playwright install 후 npm run test:e2e:staging-baseline 실행
2. 실패 항목이 있으면 원인 분석 (테스트 코드 문제 vs 앱 버그 구분해서 보고)
3. 테스트 코드 문제면 spec 파일만 수정해서 재실행
4. 앱 버그면 수정하지 말고 docs/manual_role_flow_qa_issue_report_round1.md 형식으로 이슈 기록
5. 전체 결과를 docs/staging_rls_qa_execution_log.md에 기록

유지할 기존 기능:
- 앱 코드는 수정하지 않음 (spec 파일만 허용)

수정 금지:
- DB schema 변경 금지
- RLS 정책 변경 금지
- package.json 변경 금지
- app/, src/ 코드 수정 금지

완료 기준:
1. 4개 역할 로그인/핵심 화면 로딩 테스트 전체 PASS 또는 이슈 문서화
2. console error / 4xx·5xx 네트워크 오류 없음 확인
```

---

## 4단계 — staging lectures RLS 정책 교체

기준선 PASS 후에만 진행. `docs/staging_execution_checklist.md` 순서 준수.

```
수정 파일:
docs/staging_rls_execution_log_round1.md (로그 기록용)

목표:
docs/staging_execution_checklist.md 체크리스트대로 staging 환경에서 lectures RLS 정책을 교체할 준비를 한다.

작업:
1. docs/staging_lectures_rls_sql_draft.md의 SQL 초안을 최종 검토 (정책명 중복/충돌 확인)
2. 실행 전 백업용 정책 조회 SQL, 적용 SQL, 롤백 SQL 3가지를 순서대로 정리해서 출력 (내가 Supabase SQL Editor에 직접 붙여넣을 수 있게)
3. 적용 후 검증할 권한 QA 시나리오를 docs/manual_permission_test_guide.md 기준으로 체크리스트로 출력
4. 내가 실행 결과를 알려주면 docs/staging_rls_execution_log_round1.md에 기록

유지할 기존 기능:
- 앱 코드 변경 없음

수정 금지:
- production 환경 절대 금지 (staging only)
- 앱 코드 수정 금지
- 백업/롤백 SQL 없이 적용 SQL 출력 금지

완료 기준:
1. 백업 → 적용 → 롤백 SQL 3종 세트 출력
2. 적용 후 권한 QA 체크리스트 출력 (teacher A/B 교차 차단, student A/B 교차 차단, admin 전체 허용, parent 정책 확인)
```

> SQL 실행 자체는 Supabase 대시보드에서 직접 수행. 결과(성공/실패/스크린샷 내용)를 다음 명령에 붙여넣으면 됨.

---

## 5단계 — feedback_comments RLS 정책 교체

4단계의 lectures 권한 QA 전체 PASS 후 진행. 4단계와 동일한 명령어에서 대상만 변경:

```
수정 파일:
docs/staging_rls_execution_log_round1.md

목표:
docs/staging_feedback_comments_rls_sql_draft.md 기준으로 feedback_comments RLS 교체를 4단계와 동일한 절차로 진행한다.

작업:
1. SQL 초안 최종 검토
2. 백업/적용/롤백 SQL 3종 출력
3. 적용 후 권한 QA 체크리스트 출력 (학생 본인 첨삭만, 학부모 자녀 첨삭만, 강사 담당 반만)
4. 실행 결과를 로그 문서에 기록

유지할 기존 기능:
- lectures에 적용한 신규 정책 유지

수정 금지:
- production 환경 절대 금지
- 앱 코드 수정 금지

완료 기준:
1. SQL 3종 세트 출력
2. 권한 QA 체크리스트 출력
```

---

## 6단계 — Round 1 수동 QA 실행 및 이슈 수정 루프

```
수정 파일:
docs/manual_role_flow_qa_log_round1.md
docs/manual_role_flow_qa_issue_report_round1.md

목표:
docs/manual_role_flow_qa_top10_quickcheck.md의 Top 10 항목을 기준으로 Round 1 수동 QA를 진행하고 이슈를 기록한다.

작업:
1. Top 10 체크 항목을 실행 순서대로 정리해서 출력 (역할별 로그인 → 화면 → 확인 포인트)
2. 내가 각 항목 결과(PASS/FAIL + 증상)를 알려주면 로그 문서에 기록
3. FAIL 항목은 R1-XXX 이슈 ID를 부여해 이슈 리포트에 심각도와 함께 기록
4. 모든 항목 완료 후 이슈를 심각도순으로 정렬한 수정 우선순위 목록 출력

유지할 기존 기능:
- 이 단계에서는 코드 수정 없음 (기록만)

수정 금지:
- DB schema / RLS / package.json 변경 금지

완료 기준:
1. Top 10 항목 전체 결과 기록 완료
2. 이슈 리포트에 모든 FAIL 항목 등록 완료
```

이슈 수정은 **이슈 1건당 커서 명령 1개**로 진행:

```
수정 파일:
(이슈 R1-XXX 관련 파일 — 먼저 영향 파일 목록부터 보고할 것)

목표:
이슈 R1-XXX 수정: (이슈 내용 붙여넣기)

작업:
1. 원인 분석 후 영향받는 파일 목록 먼저 보고
2. 승인 후 최소 수정으로 해결
3. 재현 절차대로 수정 확인 방법 안내

유지할 기존 기능:
- 다른 역할 화면 동작 전부

수정 금지:
- DB schema / RLS / package.json 변경 금지
- 한 번에 여러 이슈 수정 금지

완료 기준:
1. 이슈 재현 절차에서 기대 결과대로 동작
2. npm run build 통과
```

---

## 7단계 — 최종 점검 및 배포 준비

```
수정 파일:
없음 (점검만)

목표:
MVP 완료 기준 최종 점검 후 Vercel 배포 가능 상태인지 확인한다.

작업:
1. npm run build 실행 및 에러/경고 보고
2. docs/prd.md의 MVP 12개 기능 각각에 대해 구현 완료/미완료 표로 정리
3. .env.local의 키가 .gitignore에 포함되어 있는지, service_role key가 클라이언트 코드에 없는지 전체 검색으로 확인
4. app/supabase-test, app/ui-sample, app/ui-reference 등 테스트용 라우트의 배포 제외 필요 여부 보고
5. Vercel 배포 전 필요한 환경변수 목록 출력

유지할 기존 기능:
- 코드 수정 없음

수정 금지:
- 모든 코드/설정 수정 금지 (보고만)

완료 기준:
1. MVP 기능 체크표 출력
2. 보안 점검 결과 출력
3. 배포 전 조치 목록 출력
```

---

## 진행 규칙

- 각 단계 완료 후 결과를 이 대화에 붙여넣으면, 결과에 맞춰 다음 명령어를 조정해서 제공
- 3단계(기준선 QA) PASS 전에는 4단계(RLS 교체) 진행 금지
- RLS SQL은 반드시 staging에서만, 백업 SQL 확보 후 실행
