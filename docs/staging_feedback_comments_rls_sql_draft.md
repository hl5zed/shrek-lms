# staging feedback_comments RLS 정리 SQL 초안

> ⚠️ 이 문서는 staging 검토용 SQL 초안입니다.
> production에서 직접 실행하지 마세요.
> 현재 앱에서는 `feedback_comments` 직접 사용이 미검출되었지만, 삭제 전 반드시 staging QA를 통과해야 합니다.
> 이 SQL은 Cursor가 작성만 하며, 실제 Supabase SQL Editor에서 실행하지 않습니다.

## 1. 목적

현재 feedback_comments 테이블에는 로그인 사용자 전체 조회 정책이 존재한다.  
하지만 현재 앱 코드에서 feedback_comments 직접 사용은 미검출되었고, 실제 첨삭 코멘트는 feedbacks.comment 기반으로 동작한다.  
따라서 staging에서 먼저 feedback_comments의 넓은 조회 정책 제거 테스트를 수행한다.

---

## 2. 현재 정책 확인 SQL

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'feedback_comments'
ORDER BY policyname;
```

---

## 3. 현재 feedback_comments 정책 백업용 SQL

```sql
SELECT
  *
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'feedback_comments'
ORDER BY policyname;
```

실행 결과는 반드시 문서 또는 별도 파일로 저장합니다(rollback 근거).

---

## 4. 현재 확인된 정책

현재 확인된 정책:

```txt
feedback_comments: admin 전체
feedback_comments: 로그인 사용자 조회
```

현재 위험 후보:

```txt
feedback_comments: 로그인 사용자 조회
USING: auth.uid() IS NOT NULL
```

위험 설명:

- 로그인 사용자 전체가 feedback_comments를 조회할 수 있을 가능성
- 현재 앱 직접 사용은 미검출
- 향후 댓글 기능 활성화 시 권한 누수 위험
- 현재 첨삭 코멘트 기능은 `feedbacks.comment`로 동작

---

## 5. 삭제 후보 정책

삭제 후보:

```txt
feedback_comments: 로그인 사용자 조회
```

주의:

- 이 정책은 staging QA 통과 전 production에서 삭제하면 안 됨
- 현재 미사용으로 보이지만 hidden dependency가 있을 수 있으므로 전체 smoke test 필요
- 특히 teacher/student/parent 첨삭 화면을 반드시 확인해야 함

---

## 6. 삭제 SQL 초안

```sql
-- ⚠️ staging QA 통과 전 실행 금지
-- ⚠️ production 직접 실행 금지
-- DROP POLICY IF EXISTS "feedback_comments: 로그인 사용자 조회" ON public.feedback_comments;
```

---

## 7. 롤백 SQL 초안

```sql
-- ⚠️ rollback 전용. production 직접 실행 금지.
-- CREATE POLICY "feedback_comments: 로그인 사용자 조회"
--   ON public.feedback_comments
--   FOR SELECT
--   USING (auth.uid() IS NOT NULL);
```

---

## 8. 향후 사용 시 대체 정책 방향

현재는 미사용으로 판단되므로 대체 정책 SQL은 아직 작성하지 않고, 관계 논리만 정리한다.

향후 `feedback_comments`를 실제 사용할 경우 권장 관계:

```txt
admin:
전체 조회

teacher:
feedback_comments.submission_id
→ submissions.assignment_id
→ assignments.class_id
→ classes.teacher_id = auth.uid()

student:
feedback_comments.submission_id
→ submissions.student_id = auth.uid()

parent:
feedback_comments.submission_id
→ submissions.student_id가 parent_students에서 parent_id = auth.uid()인 자녀
```

실사용 기능이 생기면 이 관계 기반 정책을 별도 SQL 문서로 작성한다.

---

## 9. 실행 순서

1. 현재 feedback_comments 정책 목록 백업
2. staging 테스트 계정 준비
3. 기존 상태에서 첨삭/피드백 화면 QA 실행
4. `feedback_comments: 로그인 사용자 조회` 삭제 SQL 검토
5. staging에서만 삭제 테스트
6. teacher/student/parent/admin 첨삭 화면 회귀 테스트
7. `feedbacks.comment` 기반 코멘트 표시 정상 여부 확인
8. 전체 권한 QA 재실행
9. 실패 시 롤백
10. PASS 시 production 반영안 별도 문서 작성

---

## 10. QA 체크리스트

| 역할 | 테스트 | 기대 결과 |
| ---------- | --------------------- | ----- |
| admin | feedback/첨삭 관련 화면 조회 | 허용 |
| teacher A | A반 제출물 첨삭 조회 | 허용 |
| teacher A | A반 feedback 생성/수정 | 허용 |
| teacher A | B반 제출물 첨삭 접근 | 차단 |
| student A | 본인 feedback 조회 | 허용 |
| student A | 타 학생 feedback 접근 | 차단 |
| parent A | 자녀 feedback 조회 | 허용 |
| parent A | 타 자녀 feedback 접근 | 차단 |
| logged-out | feedback 관련 보호 페이지 접근 | 차단 |

추가 확인:

- [ ] `feedbacks.comment`가 정상 표시되는지 확인
- [ ] teacher 첨삭 저장이 정상 동작하는지 확인
- [ ] student 첨삭 조회가 정상 동작하는지 확인
- [ ] parent 첨삭 조회가 정상 동작하는지 확인
- [ ] 콘솔/네트워크 응답에 `feedback_comments` 관련 오류가 없는지 확인

---

## 11. 실행 금지 조건

- production에서 직접 실행 금지
- 테스트 계정 없이 실행 금지
- 현재 정책 백업 없이 실행 금지
- rollback 초안 없이 실행 금지
- teacher/student/parent feedback 화면 수동 테스트 없이 실행 금지
- `feedbacks.comment` 회귀 확인 없이 production 반영 금지

---

## 12. 완료 기준

- [x] `docs/staging_feedback_comments_rls_sql_draft.md` 생성
- [x] 현재 정책 확인 SQL 포함
- [x] 백업 SQL 포함
- [x] 삭제 SQL 초안은 주석 또는 강한 경고 포함
- [x] 롤백 SQL 초안 포함
- [x] 향후 관계 기반 정책 방향 포함
- [x] 실행 순서 포함
- [x] QA 체크리스트 포함
- [x] production 직접 실행 금지 문구 포함
- [x] 실제 SQL 실행 없음
- [x] 앱 코드 수정 없음

---

## 참고 문서

- `docs/feedback_comments_usage_audit.md`
- `docs/rls_replacement_plan.md`
- `docs/manual_permission_test_guide.md`
- `docs/rls_policy_audit.md`
