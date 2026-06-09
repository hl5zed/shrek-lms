# staging RLS Round 1 실제 실행 기록

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
