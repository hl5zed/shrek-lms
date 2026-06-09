# Supabase QA 사전 점검 SQL

이 문서는 실제 권한 QA를 시작하기 전에 Supabase SQL Editor에서 현재 DB 상태를 확인하기 위한 읽기 전용 점검 SQL 모음입니다.

주의:
- 이 문서의 SQL은 SELECT 중심이어야 합니다.
- INSERT / UPDATE / DELETE / ALTER / DROP / CREATE는 포함하지 않습니다.
- 실제 데이터 생성 전 구조 확인용입니다.

---

## 1) 핵심 테이블 존재 여부 확인

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'classes',
    'class_students',
    'parent_students',
    'assignments',
    'submissions',
    'feedbacks',
    'feedback_comments',
    'courses',
    'lessons',
    'lectures',
    'enrollments'
  )
ORDER BY table_name;
```

---

## 2) 핵심 컬럼 존재 여부 확인

아래 쿼리는 대상 테이블의 컬럼 목록과 타입을 출력합니다.

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'profiles' AND column_name IN ('id', 'role', 'name', 'email'))
    OR (table_name = 'classes' AND column_name IN ('id', 'teacher_id'))
    OR (table_name = 'class_students' AND column_name IN ('class_id', 'student_id'))
    OR (table_name = 'parent_students' AND column_name IN ('parent_id', 'student_id'))
    OR (table_name = 'assignments' AND column_name IN ('id', 'class_id'))
    OR (table_name = 'submissions' AND column_name IN ('id', 'assignment_id', 'student_id', 'status'))
    OR (table_name = 'feedbacks' AND column_name IN ('id', 'submission_id', 'teacher_id'))
    OR (table_name = 'feedback_comments' AND column_name IN ('id', 'feedback_id'))
    OR (table_name = 'courses' AND column_name IN ('id'))
    OR (table_name = 'lessons' AND column_name IN ('id'))
    OR (table_name = 'lectures' AND column_name IN ('id'))
    OR (table_name = 'enrollments' AND column_name IN ('id', 'student_id'))
  )
ORDER BY table_name, column_name;
```

---

## 3) `get_my_role()` 함수 존재 여부 확인

```sql
SELECT
  n.nspname AS schema_name,
  p.proname AS function_name,
  pg_get_userbyid(p.proowner) AS function_owner,
  p.prosecdef AS security_definer,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_get_function_result(p.oid) AS return_type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname = 'get_my_role';
```

---

## 4) RLS 활성화 여부 확인

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'classes',
    'class_students',
    'parent_students',
    'assignments',
    'submissions',
    'feedbacks',
    'feedback_comments',
    'courses',
    'lessons',
    'lectures',
    'enrollments'
  )
ORDER BY tablename;
```

---

## 5) 현재 RLS 정책 목록 확인

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 6) 테스트 데이터 현황 조회

### 6-1. 역할별 계정 수

```sql
SELECT role, COUNT(*) AS count
FROM public.profiles
GROUP BY role
ORDER BY role;
```

### 6-2. 주요 테이블 row 수

```sql
SELECT 'classes' AS table_name, COUNT(*)::bigint AS row_count FROM public.classes
UNION ALL
SELECT 'class_students', COUNT(*)::bigint FROM public.class_students
UNION ALL
SELECT 'parent_students', COUNT(*)::bigint FROM public.parent_students
UNION ALL
SELECT 'assignments', COUNT(*)::bigint FROM public.assignments
UNION ALL
SELECT 'submissions', COUNT(*)::bigint FROM public.submissions
UNION ALL
SELECT 'feedbacks', COUNT(*)::bigint FROM public.feedbacks
ORDER BY table_name;
```

---

## 7) 관계 무결성 점검 (깨진 연결만 조회)

### 7-1. `classes.teacher_id -> profiles.id`

```sql
SELECT c.id AS class_id, c.teacher_id
FROM public.classes c
LEFT JOIN public.profiles p ON p.id = c.teacher_id
WHERE c.teacher_id IS NOT NULL
  AND p.id IS NULL;
```

### 7-2. `class_students.student_id -> profiles.id`

```sql
SELECT cs.class_id, cs.student_id
FROM public.class_students cs
LEFT JOIN public.profiles p ON p.id = cs.student_id
WHERE p.id IS NULL;
```

### 7-3. `parent_students.parent_id -> profiles.id`

```sql
SELECT ps.parent_id, ps.student_id
FROM public.parent_students ps
LEFT JOIN public.profiles p ON p.id = ps.parent_id
WHERE p.id IS NULL;
```

### 7-4. `parent_students.student_id -> profiles.id`

```sql
SELECT ps.parent_id, ps.student_id
FROM public.parent_students ps
LEFT JOIN public.profiles p ON p.id = ps.student_id
WHERE p.id IS NULL;
```

### 7-5. `assignments.class_id -> classes.id`

```sql
SELECT a.id AS assignment_id, a.class_id
FROM public.assignments a
LEFT JOIN public.classes c ON c.id = a.class_id
WHERE c.id IS NULL;
```

### 7-6. `submissions.assignment_id -> assignments.id`

```sql
SELECT s.id AS submission_id, s.assignment_id
FROM public.submissions s
LEFT JOIN public.assignments a ON a.id = s.assignment_id
WHERE a.id IS NULL;
```

### 7-7. `submissions.student_id -> profiles.id`

```sql
SELECT s.id AS submission_id, s.student_id
FROM public.submissions s
LEFT JOIN public.profiles p ON p.id = s.student_id
WHERE p.id IS NULL;
```

### 7-8. `feedbacks.submission_id -> submissions.id`

```sql
SELECT f.id AS feedback_id, f.submission_id
FROM public.feedbacks f
LEFT JOIN public.submissions s ON s.id = f.submission_id
WHERE s.id IS NULL;
```

### 7-9. `feedbacks.teacher_id -> profiles.id`

```sql
SELECT f.id AS feedback_id, f.teacher_id
FROM public.feedbacks f
LEFT JOIN public.profiles p ON p.id = f.teacher_id
WHERE f.teacher_id IS NOT NULL
  AND p.id IS NULL;
```

---

## 8) QA 테스트 가능 여부 체크

아래 쿼리는 권한 QA 최소 시작 조건을 한 번에 확인합니다.

```sql
SELECT
  check_name,
  required,
  actual,
  CASE WHEN actual >= required THEN 'PASS' ELSE 'FAIL' END AS status
FROM (
  SELECT 'admin 계정 수'::text AS check_name, 1::bigint AS required,
         (SELECT COUNT(*)::bigint FROM public.profiles WHERE role = 'admin') AS actual
  UNION ALL
  SELECT 'teacher 계정 수', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.profiles WHERE role = 'teacher')
  UNION ALL
  SELECT 'student 계정 수', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.profiles WHERE role = 'student')
  UNION ALL
  SELECT 'parent 계정 수', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.profiles WHERE role = 'parent')
  UNION ALL
  SELECT '반 수(classes)', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.classes)
  UNION ALL
  SELECT '과제 수(assignments)', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.assignments)
  UNION ALL
  SELECT '제출물 수(submissions)', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.submissions)
  UNION ALL
  SELECT '피드백 수(feedbacks)', 2::bigint,
         (SELECT COUNT(*)::bigint FROM public.feedbacks)
) t
ORDER BY check_name;
```

---

## 점검 순서 권장

1. 테이블 존재 여부
2. 컬럼 존재 여부
3. `get_my_role()` 함수 확인
4. RLS 활성화/정책 확인
5. 데이터 볼륨 및 무결성 확인
6. QA 가능 여부 PASS/FAIL 확인
