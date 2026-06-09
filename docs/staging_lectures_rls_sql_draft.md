# staging lectures RLS 교체 SQL 초안

> ⚠️ 이 문서는 staging 검토용 SQL 초안입니다.
> production에서 직접 실행하지 마세요.
> 실행 전 반드시 현재 정책 목록 백업, 테스트 계정 준비, 권한 QA 계획 확인이 필요합니다.
> 이 SQL은 Cursor가 작성만 하며, 실제 Supabase SQL Editor에서 실행하지 않습니다.

## 1. 목적

현재 lectures 테이블에는 로그인 사용자 전체 조회 정책이 존재한다.  
하지만 lectures는 `class_id`를 갖는 반별 수업 자료이므로, staging에서 먼저 class ownership 기반 RLS로 대체 테스트한다.

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
  AND tablename = 'lectures'
ORDER BY policyname;
```

---

## 3. 현재 lectures 정책 목록 백업용 SQL

```sql
SELECT
  *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'lectures'
ORDER BY policyname;
```

실행 결과는 반드시 문서 또는 별도 파일로 저장합니다(rollback 근거).

---

## 4. 대체 전제

- `lectures.class_id -> classes.id`
- `classes.teacher_id -> profiles.id`
- `class_students.class_id -> classes.id`
- `class_students.student_id -> profiles.id`
- parent lectures 접근은 이번 초안에서 **허용하지 않음**
- admin은 전체 허용
- teacher는 담당 반만 허용
- student는 본인 소속 반만 허용
- teacher INSERT/UPDATE는 담당 반 class_id에 대해서만 허용
- 기존 `admin_all_lectures`, `teacher_own_lectures`, `student_class_lectures`가 이미 존재하므로 중복 여부 확인 필요

---

## 5. 삭제 또는 비활성 후보 정책

삭제 후보(아직 실행 금지):

```txt
lectures: 로그인 사용자 조회
```

주의:

- 이 정책은 모든 로그인 사용자 조회를 허용할 가능성이 있음
- staging에서 대체 정책이 정상 작동하는지 확인하기 전 production에서 삭제하지 말 것

---

## 6. 대체 정책 초안

아래 SQL은 staging 검토용 초안입니다.  
실행 전 기존 정책과 이름/조건 중복 여부를 반드시 확인하세요.

### 6.1 admin 전체 조회

```sql
-- staging draft: 실행 전 기존 정책과 중복/충돌 확인 필요
CREATE POLICY "lectures_select_admin_staging"
  ON public.lectures
  FOR SELECT
  USING (public.get_my_role() = 'admin');
```

### 6.2 teacher 담당 반 조회

```sql
-- staging draft: 실행 전 기존 정책과 중복/충돌 확인 필요
CREATE POLICY "lectures_select_teacher_class_staging"
  ON public.lectures
  FOR SELECT
  USING (
    public.get_my_role() = 'teacher'
    AND lectures.class_id IN (
      SELECT id
      FROM public.classes
      WHERE teacher_id = auth.uid()
    )
  );
```

### 6.3 student 소속 반 조회

```sql
-- staging draft: 실행 전 기존 정책과 중복/충돌 확인 필요
CREATE POLICY "lectures_select_student_class_staging"
  ON public.lectures
  FOR SELECT
  USING (
    public.get_my_role() = 'student'
    AND lectures.class_id IN (
      SELECT class_id
      FROM public.class_students
      WHERE student_id = auth.uid()
    )
  );
```

### 6.4 teacher 담당 반 INSERT

```sql
-- staging draft: 실행 전 기존 정책과 중복/충돌 확인 필요
CREATE POLICY "lectures_insert_teacher_class_staging"
  ON public.lectures
  FOR INSERT
  WITH CHECK (
    public.get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id
      FROM public.classes
      WHERE teacher_id = auth.uid()
    )
  );
```

### 6.5 teacher 담당 반 UPDATE

```sql
-- staging draft: 실행 전 기존 정책과 중복/충돌 확인 필요
CREATE POLICY "lectures_update_teacher_class_staging"
  ON public.lectures
  FOR UPDATE
  USING (
    public.get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id
      FROM public.classes
      WHERE teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id
      FROM public.classes
      WHERE teacher_id = auth.uid()
    )
  );
```

### 6.6 parent 정책

```txt
parent lectures 접근은 현재 제품 정책 확정 전이므로 이번 staging 초안에는 포함하지 않는다.
향후 허용 시 parent_students + class_students 관계 기반 SELECT 정책을 별도로 추가한다.
```

---

## 7. 삭제 SQL 초안

```sql
-- ⚠️ staging QA 통과 전 실행 금지
-- DROP POLICY IF EXISTS "lectures: 로그인 사용자 조회" ON public.lectures;
```

---

## 8. 롤백 SQL 초안

```sql
-- ⚠️ rollback 전용. production 직접 실행 금지.
-- CREATE POLICY "lectures: 로그인 사용자 조회"
--   ON public.lectures
--   FOR SELECT
--   USING (auth.uid() IS NOT NULL);
```

---

## 9. 실행 순서

1. 현재 lectures 정책 목록 백업
2. staging 테스트 계정 준비
3. 기존 상태에서 lectures 권한 QA 실행
4. 대체 정책 초안 검토
5. staging에서 대체 정책 생성
6. staging에서 `lectures: 로그인 사용자 조회` 삭제
7. teacher/student/admin 접근 테스트
8. parent 접근 차단 여부 확인
9. 전체 권한 QA 재실행
10. 실패 시 롤백
11. PASS 시 production 반영안 별도 문서 작성

---

## 10. QA 체크리스트

| 역할 | 테스트 | 기대 결과 |
| ---------- | ----------------------- | ------------------ |
| admin | 모든 lectures 조회 | 허용 |
| teacher A | A반 lectures 조회 | 허용 |
| teacher A | B반 lectures 조회 | 차단 |
| teacher A | A반 lecture 생성 | 허용 |
| teacher A | B반 class_id로 lecture 생성 | 차단 |
| student A | A반 lectures 조회 | 허용 |
| student A | B반 lectures 조회 | 차단 |
| parent A | lectures 직접 조회 | 이번 정책에서는 차단 또는 미노출 |
| logged-out | lectures 조회 | 차단 |

---

## 11. 실행 금지 조건

- production에서 직접 실행 금지
- 테스트 계정 없이 실행 금지
- 현재 정책 백업 없이 실행 금지
- rollback 초안 없이 실행 금지
- teacher/student lectures 수동 테스트 없이 실행 금지
- parent lectures 정책 미확정 상태에서 parent 허용 정책 추가 금지

---

## 12. 완료 기준

- [x] `docs/staging_lectures_rls_sql_draft.md` 생성
- [x] 현재 정책 확인 SQL 포함
- [x] 백업 SQL 포함
- [x] 대체 정책 SQL 초안 포함
- [x] 삭제 SQL 초안은 주석 또는 강한 경고 포함
- [x] 롤백 SQL 초안 포함
- [x] 실행 순서 포함
- [x] QA 체크리스트 포함
- [x] production 직접 실행 금지 문구 포함
- [x] 실제 SQL 실행 없음
- [x] 앱 코드 수정 없음

---

## 참고 문서

- `docs/rls_replacement_plan.md`
- `docs/lectures_ownership_audit.md`
- `docs/manual_permission_test_guide.md`
