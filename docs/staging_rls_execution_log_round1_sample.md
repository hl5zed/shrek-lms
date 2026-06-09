# staging RLS 1회차 실행 기록 샘플

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
| 실행 회차 | 1차 |
| 실행 날짜 | YYYY-MM-DD |
| 실행자 | |
| 검증자 | |
| 환경 | staging |
| Git commit | |
| Supabase project | staging project name |
| 테스트 범위 | lectures / feedback_comments |
| production 반영 여부 | 아님 |
| 실행 시작 시각 | HH:MM (UTC+7) |
| 실행 종료 시각 | HH:MM (UTC+7) |
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

## 3. 실행 전 체크리스트

- [ ] staging 프로젝트인지 확인
- [ ] production 프로젝트가 아닌지 확인
- [ ] 현재 RLS 정책 목록 백업 완료
- [ ] rollback SQL 초안 확인
- [ ] 테스트 계정 7개 로그인 가능 확인
- [ ] A/B 반 데이터 준비
- [ ] A/B lectures 데이터 준비
- [ ] A/B assignments/submissions/feedbacks 데이터 준비
- [ ] 실행 로그 문서 열어둠
- [ ] High 이슈 발생 시 즉시 중단 원칙 확인

---

## 4. 정책 백업 기록

| 테이블 | 백업 SQL 실행 여부 | 백업 결과 저장 위치 | 비고 |
| ----------------- | ------------ | ----------- | -- |
| lectures | 예 / 아니오 | | |
| feedback_comments | 예 / 아니오 | | |

예시 메모:

```txt
백업 결과는 Supabase SQL Editor 결과를 복사해 별도 문서 또는 이 파일 하단에 보관함.
```

---

## 5. 기준선 QA 결과

정책 변경 전 기존 상태에서 정상 동작하는지 기록하세요.

| 테스트 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ------------------- | ----- | ----- | --------- | -- |
| teacher A 로그인 | 허용 | | | |
| teacher B 로그인 | 허용 | | | |
| student A 로그인 | 허용 | | | |
| student B 로그인 | 허용 | | | |
| parent A 로그인 | 허용 | | | |
| parent B 로그인 | 허용 | | | |
| admin 로그인 | 허용 | | | |
| teacher lectures 목록 | 정상 조회 | | | |
| student lectures 목록 | 정상 조회 | | | |
| teacher feedback 저장 | 정상 저장 | | | |
| student feedback 조회 | 정상 조회 | | | |
| parent feedback 조회 | 정상 조회 | | | |

---

## 6. lectures RLS 테스트 기록

### 실행 단계

| 단계 | 작업 | 시작 시각 | 종료 시각 | 실행 여부 | 결과 | 메모 |
| -- | ------------------------- | --------- | --------- | -------- | ----------- | -- |
| 1 | lectures 현재 정책 확인 |  |  |  | PASS / FAIL | |
| 2 | lectures 대체 정책 적용 |  |  |  | PASS / FAIL | |
| 3 | `lectures: 로그인 사용자 조회` 제거 |  |  |  | PASS / FAIL | |
| 4 | lectures 역할별 QA 실행 |  |  |  | PASS / FAIL | |
| 5 | 문제 시 rollback |  |  | 실행 / 미실행 |  | |

### 역할별 QA

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | ---------------------- | ------ | ----- | --------- | -- |
| admin | 모든 lectures 조회 | 허용 | | | |
| teacher A | A반 lectures 조회 | 허용 | | | |
| teacher A | B반 lectures 조회 | 차단 | | | |
| teacher A | A반 lecture 생성 | 허용 | | | |
| teacher A | B반 class_id lecture 생성 | 차단 | | | |
| student A | A반 lectures 조회 | 허용 | | | |
| student A | B반 lectures 조회 | 차단 | | | |
| parent A | lectures 직접 조회 | 차단/미노출 | | | |
| logged-out | lectures 접근 | 차단 | | | |

---

## 7. feedback_comments RLS 테스트 기록

### 실행 단계

| 단계 | 작업 | 시작 시각 | 종료 시각 | 실행 여부 | 결과 | 메모 |
| -- | ---------------------------------- | --------- | --------- | -------- | ----------- | -- |
| 1 | feedback_comments 현재 정책 확인 |  |  |  | PASS / FAIL | |
| 2 | `feedback_comments: 로그인 사용자 조회` 제거 |  |  |  | PASS / FAIL | |
| 3 | feedback/첨삭 회귀 QA 실행 |  |  |  | PASS / FAIL | |
| 4 | 문제 시 rollback |  |  | 실행 / 미실행 |  | |

### 역할별 QA

| 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 메모 |
| ---------- | ------------------ | ----- | ----- | --------- | -- |
| admin | feedback/첨삭 화면 조회 | 허용 | | | |
| teacher A | A반 제출물 첨삭 조회 | 허용 | | | |
| teacher A | A반 feedback 생성/수정 | 허용 | | | |
| teacher A | B반 제출물 첨삭 접근 | 차단 | | | |
| student A | 본인 feedback 조회 | 허용 | | | |
| student A | 타 학생 feedback 접근 | 차단 | | | |
| parent A | 자녀 feedback 조회 | 허용 | | | |
| parent A | 타 자녀 feedback 접근 | 차단 | | | |
| logged-out | feedback 보호 페이지 접근 | 차단 | | | |

### 회귀 확인

- [ ] `feedbacks.comment`가 정상 표시됨
- [ ] teacher 첨삭 저장 정상
- [ ] student 첨삭 조회 정상
- [ ] parent 첨삭 조회 정상
- [ ] 콘솔/네트워크에 `feedback_comments` 관련 오류 없음

---

## 8. 실패 이슈 예시 기록

아래는 실제 실패 발생 시 기록하는 형식입니다.

```md
### 실패 이슈 예시

- 날짜: YYYY-MM-DD
- 환경: staging
- 관련 테이블: lectures
- 관련 정책: lectures_select_student_class_staging
- 로그인 계정: student-a@example.com
- 접근 URL: /student/lectures
- 기대 결과: A반 lectures 조회 허용
- 실제 결과: lectures 목록이 비어 있음
- 노출된 데이터: 없음
- 심각도: Medium
- rollback 실행 여부: 미실행
- 조치 메모: student class_id 조회 조건 확인 필요
```

---

## 9. 실제 실패 이슈 기록

```md
### 실패 이슈 1

- 날짜:
- 환경:
- 관련 테이블:
- 관련 정책:
- 로그인 계정:
- 접근 URL:
- 기대 결과:
- 실제 결과:
- 노출된 데이터:
- 심각도: High / Medium / Low
- rollback 실행 여부:
- 조치 메모:
```

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
| production 반영 검토 가능 여부 | 가능 / 불가 | |

---

## 11. production 반영 전 메모

```txt
이 1회차 staging 실행 기록은 production 반영 근거가 아니라,
production 반영안을 작성하기 전의 검증 자료로만 사용한다.
production 반영은 별도 SQL 문서, 백업 계획, 담당자/검증자 확인 후 진행한다.
```

---

## 12. 완료 기준

- [x] `docs/staging_rls_execution_log_round1_sample.md`에 실행 타임라인 표 추가
- [x] 시작 시각/종료 시각 컬럼 포함
- [x] 기준선 QA, lectures, feedback_comments, rollback, 최종 판정 단계 포함
- [x] 기존 QA 기록표 삭제 없음
- [x] 실제 SQL 실행 없음
- [x] 앱 코드 수정 없음

---

## 참고 문서

- `docs/staging_rls_execution_runbook.md`
- `docs/staging_rls_qa_execution_log.md`
- `docs/manual_permission_test_guide.md`
