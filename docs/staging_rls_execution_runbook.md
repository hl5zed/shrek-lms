# staging RLS 실행 순서 통합 문서

> ⚠️ 이 문서는 staging 실행용 통합 Runbook입니다.
> production에서 직접 실행하지 마세요.
> 실제 SQL 실행 전 정책 백업, 테스트 계정, rollback 절차를 반드시 준비해야 합니다.

## 1. 문서 목적

```txt
이 문서는 lectures / feedback_comments RLS 정리 테스트를 staging에서
한 번의 실행 흐름으로 통합하여, 준비-실행-QA-롤백-판정 순서를 표준화하기 위한 문서입니다.
production 반영 여부는 staging PASS 로그를 근거로 별도 판단합니다.
```

---

## 2. 적용 범위

- 대상 정책 1: `lectures: 로그인 사용자 조회`
- 대상 정책 2: `feedback_comments: 로그인 사용자 조회`
- 관련 화면:
  - lectures: teacher/student/admin (parent는 현재 차단 또는 미노출 정책 기준)
  - feedback: teacher/student/parent/admin
- 비대상:
  - DB schema 변경
  - production 실행
  - 앱 코드/UI/라우트 수정

---

## 3. 실행 전 준비(공통)

### 3.1 필수 입력값

- 실행 날짜/실행자
- staging Git commit hash
- Supabase staging project 식별값
- 테스트 계정: admin, teacher A/B, student A/B, parent A/B
- 테스트 데이터: A/B class, lecture, assignment, submission, feedback

### 3.2 사전 확인 체크리스트

- [ ] 현재 환경이 staging인지 확인
- [ ] production 프로젝트가 아닌지 재확인
- [ ] `lectures` 정책 목록 백업 완료
- [ ] `feedback_comments` 정책 목록 백업 완료
- [ ] rollback SQL 초안 준비 완료
- [ ] 실행 전 기준선 QA(기존 정책 상태) 완료
- [ ] High 이슈 발생 시 즉시 중단/롤백 합의 완료

---

## 4. 통합 실행 순서

## Phase A. 기준선 확보

1. `lectures` 현재 정책 확인/백업
2. `feedback_comments` 현재 정책 확인/백업
3. 현재 상태 기준선 QA 실행
   - lectures 접근/생성 정상 여부
   - feedback 조회/저장 정상 여부
4. 기준선 FAIL이면 정책 변경 테스트 진행 금지

## Phase B. lectures 정책 테스트

1. `docs/staging_lectures_rls_sql_draft.md` 기준으로 대체 정책 검토
2. staging에서 lectures 대체 정책 적용
3. `lectures: 로그인 사용자 조회` 제거 테스트
4. lectures QA 실행
   - admin 전체 조회 허용
   - teacher A: A반 허용, B반 차단
   - teacher A: A반 생성 허용, B반 class_id 생성 차단
   - student A: A반 허용, B반 차단
   - parent A: 직접 조회 차단 또는 미노출
   - logged-out 차단
5. FAIL 발생 시 lectures 즉시 rollback 후 원인 기록

## Phase C. feedback_comments 정책 테스트

1. `docs/staging_feedback_comments_rls_sql_draft.md` 기준으로 삭제 후보 검토
2. staging에서 `feedback_comments: 로그인 사용자 조회` 제거 테스트
3. feedback/첨삭 회귀 QA 실행
   - admin 화면 조회 허용
   - teacher A: A반 첨삭 조회/저장 허용, B반 접근 차단
   - student A: 본인 조회 허용, 타인 차단
   - parent A: 자녀 조회 허용, 타 자녀 차단
   - logged-out 차단
4. 추가 회귀 확인
   - `feedbacks.comment` 정상 노출
   - teacher 첨삭 저장 정상
   - student/parent 첨삭 조회 정상
   - 콘솔/네트워크 `feedback_comments` 오류 없음
5. FAIL 발생 시 feedback_comments 즉시 rollback 후 원인 기록

## Phase D. 최종 통합 판정

1. lectures QA 결과 집계
2. feedback_comments QA 결과 집계
3. High 이슈 유무 확인
4. rollback 실행 이력 확인
5. 최종 판정:
   - 두 영역 PASS + High 0건 -> production 반영안 작성 가능
   - 하나라도 FAIL 또는 High 존재 -> production 반영 불가

---

## 5. 롤백 트리거(즉시 중단 조건)

- 권한 없는 계정이 타인 데이터 열람 가능(High)
- 정상 사용자 접근이 차단되거나 500 발생(Medium 이상)
- 핵심 첨삭 동선(teacher 저장, student/parent 조회) 중단
- 정책 백업 없이 실행한 사실 확인
- 실행 대상이 staging이 아닌 환경으로 확인됨

---

## 6. 실행 산출물(필수)

- [ ] 정책 백업 결과(lectures/feedback_comments) 보관
- [ ] `docs/staging_rls_qa_execution_log.md` 기록 완료
- [ ] 실패 이슈 템플릿 기록(해당 시)
- [ ] rollback 실행 기록(해당 시)
- [ ] 최종 PASS/FAIL 판정 기록
- [ ] production 반영 가능/불가 결론 기록

---

## 7. production 반영 게이트

아래 조건을 모두 만족해야 production 반영안을 검토할 수 있습니다.

- [ ] staging 통합 QA 전체 PASS
- [ ] High 이슈 0건
- [ ] rollback 절차 검증 완료
- [ ] production 정책 백업 계획 준비 완료
- [ ] production 적용 SQL 문서 별도 작성 완료
- [ ] 반영 시간/담당자/검증자 지정 완료
- [ ] 반영 후 smoke test 계획 확정

---

## 참고 문서

- `docs/staging_lectures_rls_sql_draft.md`
- `docs/staging_feedback_comments_rls_sql_draft.md`
- `docs/staging_rls_qa_execution_log.md`
- `docs/manual_permission_test_guide.md`
- `docs/rls_replacement_plan.md`
