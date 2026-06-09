-- ============================================================
-- [DEPRECATED - 실행 금지]
-- 이 문서는 현재 운영 기준이 아닙니다.
--
-- 이유:
-- - auth_user_id 컬럼 전제
-- - students / teachers / parents 별도 테이블 전제
-- - 현재 DB 스키마(profiles.id = auth.uid())와 불일치
--
-- 현재 기준 문서: docs/rls_policy.md
-- 본 파일은 과거 참고용으로만 보관합니다.
-- ============================================================

-- ============================================================
-- docs/rls_policy.md
-- Supabase Dashboard → SQL Editor에서 단계별로 실행하세요
-- 각 단계를 독립적으로 실행하세요 (전체 한 번에 실행 금지)
-- ============================================================

-- ──────────────────────────────────────────────
-- 0단계: 헬퍼 함수 (1단계 전에 먼저 실행)
-- ──────────────────────────────────────────────

-- 현재 로그인 사용자의 role을 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 현재 로그인 사용자의 profile id를 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS UUID AS $$
  SELECT id FROM public.profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 현재 로그인 사용자의 student id를 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_my_student_id()
RETURNS UUID AS $$
  SELECT s.id FROM public.students s
  JOIN public.profiles p ON p.id = s.profile_id
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 현재 로그인 사용자의 teacher id를 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_my_teacher_id()
RETURNS UUID AS $$
  SELECT t.id FROM public.teachers t
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 현재 로그인 사용자의 parent id를 반환하는 함수
CREATE OR REPLACE FUNCTION public.get_my_parent_id()
RETURNS UUID AS $$
  SELECT par.id FROM public.parents par
  JOIN public.profiles p ON p.id = par.profile_id
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ──────────────────────────────────────────────
-- 1단계: 테이블 RLS 활성화
-- ──────────────────────────────────────────────

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_posts     ENABLE ROW LEVEL SECURITY;


-- ──────────────────────────────────────────────
-- 2단계: profiles 정책
-- ──────────────────────────────────────────────

-- 본인 profile 조회
CREATE POLICY "profiles: 본인 조회"
  ON public.profiles FOR SELECT
  USING (auth_user_id = auth.uid());

-- admin은 전체 조회
CREATE POLICY "profiles: admin 전체 조회"
  ON public.profiles FOR SELECT
  USING (get_my_role() = 'admin');

-- teacher는 담당 학생 profile 조회
CREATE POLICY "profiles: teacher 담당 학생 조회"
  ON public.profiles FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND id IN (
      SELECT p.id FROM public.profiles p
      JOIN public.students s ON s.profile_id = p.id
      JOIN public.class_students cs ON cs.student_id = s.id
      JOIN public.classes c ON c.id = cs.class_id
      WHERE c.teacher_id = get_my_teacher_id()
    )
  );

-- 본인 profile 수정
CREATE POLICY "profiles: 본인 수정"
  ON public.profiles FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- admin profile 수정
CREATE POLICY "profiles: admin 수정"
  ON public.profiles FOR UPDATE
  USING (get_my_role() = 'admin');


-- ──────────────────────────────────────────────
-- 3단계: classes 정책
-- ──────────────────────────────────────────────

-- admin: 전체 CRUD
CREATE POLICY "classes: admin 전체 조회"
  ON public.classes FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "classes: admin INSERT"
  ON public.classes FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "classes: admin UPDATE"
  ON public.classes FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반 조회
CREATE POLICY "classes: teacher 담당 반 조회"
  ON public.classes FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND teacher_id = get_my_teacher_id()
  );

-- teacher: 담당 반 강사 배정 업데이트
CREATE POLICY "classes: teacher 반 업데이트"
  ON public.classes FOR UPDATE
  USING (
    get_my_role() = 'teacher'
    AND teacher_id = get_my_teacher_id()
  );

-- student: 본인 소속 반 조회
CREATE POLICY "classes: student 소속 반 조회"
  ON public.classes FOR SELECT
  USING (
    get_my_role() = 'student'
    AND id IN (
      SELECT class_id FROM public.class_students
      WHERE student_id = get_my_student_id()
    )
  );

-- parent: 자녀 소속 반 조회
CREATE POLICY "classes: parent 자녀 반 조회"
  ON public.classes FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND id IN (
      SELECT cs.class_id FROM public.class_students cs
      JOIN public.parent_students ps ON ps.student_id = cs.student_id
      WHERE ps.parent_id = get_my_parent_id()
    )
  );


-- ──────────────────────────────────────────────
-- 4단계: class_students 정책
-- ──────────────────────────────────────────────

CREATE POLICY "class_students: admin 전체 조회"
  ON public.class_students FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "class_students: admin INSERT"
  ON public.class_students FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "class_students: admin UPDATE"
  ON public.class_students FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반 학생 조회
CREATE POLICY "class_students: teacher 담당 반 조회"
  ON public.class_students FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id FROM public.classes
      WHERE teacher_id = get_my_teacher_id()
    )
  );

-- student: 본인 반 수강 정보 조회
CREATE POLICY "class_students: student 본인 조회"
  ON public.class_students FOR SELECT
  USING (
    get_my_role() = 'student'
    AND student_id = get_my_student_id()
  );

-- parent: 자녀 반 수강 정보 조회
CREATE POLICY "class_students: parent 자녀 조회"
  ON public.class_students FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM public.parent_students
      WHERE parent_id = get_my_parent_id()
    )
  );


-- ──────────────────────────────────────────────
-- 5단계: parent_students 정책
-- ──────────────────────────────────────────────

CREATE POLICY "parent_students: admin 전체 조회"
  ON public.parent_students FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "parent_students: admin INSERT"
  ON public.parent_students FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "parent_students: admin UPDATE"
  ON public.parent_students FOR UPDATE
  USING (get_my_role() = 'admin');

-- parent: 본인 연결 자녀 조회
CREATE POLICY "parent_students: parent 본인 자녀 조회"
  ON public.parent_students FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND parent_id = get_my_parent_id()
  );

-- student: 본인과 연결된 학부모 조회
CREATE POLICY "parent_students: student 본인 연결 조회"
  ON public.parent_students FOR SELECT
  USING (
    get_my_role() = 'student'
    AND student_id = get_my_student_id()
  );


-- ──────────────────────────────────────────────
-- 6단계: lectures(lessons) 정책
-- ──────────────────────────────────────────────

CREATE POLICY "lessons: admin 전체 조회"
  ON public.lessons FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "lessons: admin INSERT"
  ON public.lessons FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "lessons: admin UPDATE"
  ON public.lessons FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반의 lessons 조회
CREATE POLICY "lessons: teacher 조회"
  ON public.lessons FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND status = 'published'
  );

CREATE POLICY "lessons: teacher INSERT"
  ON public.lessons FOR INSERT
  WITH CHECK (get_my_role() = 'teacher');

CREATE POLICY "lessons: teacher UPDATE"
  ON public.lessons FOR UPDATE
  USING (get_my_role() = 'teacher');

-- student/parent: published lessons만 조회
CREATE POLICY "lessons: student 조회"
  ON public.lessons FOR SELECT
  USING (
    get_my_role() IN ('student', 'parent')
    AND status = 'published'
  );


-- ──────────────────────────────────────────────
-- 7단계: assignments 정책
-- ──────────────────────────────────────────────

CREATE POLICY "assignments: admin 전체 조회"
  ON public.assignments FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "assignments: admin INSERT"
  ON public.assignments FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "assignments: admin UPDATE"
  ON public.assignments FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반 과제 조회 및 생성
CREATE POLICY "assignments: teacher 담당 반 조회"
  ON public.assignments FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id FROM public.classes
      WHERE teacher_id = get_my_teacher_id()
    )
  );

CREATE POLICY "assignments: teacher INSERT"
  ON public.assignments FOR INSERT
  WITH CHECK (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id FROM public.classes
      WHERE teacher_id = get_my_teacher_id()
    )
  );

CREATE POLICY "assignments: teacher UPDATE"
  ON public.assignments FOR UPDATE
  USING (
    get_my_role() = 'teacher'
    AND class_id IN (
      SELECT id FROM public.classes
      WHERE teacher_id = get_my_teacher_id()
    )
  );

-- student: 소속 반 과제 조회
CREATE POLICY "assignments: student 소속 반 조회"
  ON public.assignments FOR SELECT
  USING (
    get_my_role() = 'student'
    AND class_id IN (
      SELECT class_id FROM public.class_students
      WHERE student_id = get_my_student_id()
    )
  );

-- parent: 자녀 소속 반 과제 조회
CREATE POLICY "assignments: parent 자녀 반 조회"
  ON public.assignments FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND class_id IN (
      SELECT cs.class_id FROM public.class_students cs
      JOIN public.parent_students ps ON ps.student_id = cs.student_id
      WHERE ps.parent_id = get_my_parent_id()
    )
  );


-- ──────────────────────────────────────────────
-- 8단계: submissions 정책
-- ──────────────────────────────────────────────

-- admin: 전체
CREATE POLICY "submissions: admin 전체 조회"
  ON public.submissions FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "submissions: admin UPDATE"
  ON public.submissions FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반 제출물
CREATE POLICY "submissions: teacher 담당 반 조회"
  ON public.submissions FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.classes c ON c.id = a.class_id
      WHERE c.teacher_id = get_my_teacher_id()
    )
  );

-- student: 본인 제출물 CRUD
CREATE POLICY "submissions: student 본인 조회"
  ON public.submissions FOR SELECT
  USING (
    get_my_role() = 'student'
    AND student_id = get_my_student_id()
  );

CREATE POLICY "submissions: student INSERT"
  ON public.submissions FOR INSERT
  WITH CHECK (
    get_my_role() = 'student'
    AND student_id = get_my_student_id()
  );

CREATE POLICY "submissions: student UPDATE"
  ON public.submissions FOR UPDATE
  USING (
    get_my_role() = 'student'
    AND student_id = get_my_student_id()
    AND status IN ('draft', 'submitted') -- 첨삭 완료된 건 수정 불가
  );

-- parent: 자녀 제출물 조회만
CREATE POLICY "submissions: parent 자녀 조회"
  ON public.submissions FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND student_id IN (
      SELECT student_id FROM public.parent_students
      WHERE parent_id = get_my_parent_id()
    )
  );


-- ──────────────────────────────────────────────
-- 9단계: feedbacks 정책
-- ──────────────────────────────────────────────

-- admin: 전체
CREATE POLICY "feedback: admin 전체 조회"
  ON public.feedback FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "feedback: admin INSERT"
  ON public.feedback FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "feedback: admin UPDATE"
  ON public.feedback FOR UPDATE
  USING (get_my_role() = 'admin');

-- teacher: 담당 반 제출물 첨삭 작성/수정
CREATE POLICY "feedback: teacher 담당 반 조회"
  ON public.feedback FOR SELECT
  USING (
    get_my_role() = 'teacher'
    AND submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      JOIN public.classes c ON c.id = a.class_id
      WHERE c.teacher_id = get_my_teacher_id()
    )
  );

CREATE POLICY "feedback: teacher INSERT"
  ON public.feedback FOR INSERT
  WITH CHECK (
    get_my_role() = 'teacher'
    AND teacher_id = get_my_teacher_id()
    AND submission_id IN (
      SELECT s.id FROM public.submissions s
      JOIN public.assignments a ON a.id = s.assignment_id
      JOIN public.classes c ON c.id = a.class_id
      WHERE c.teacher_id = get_my_teacher_id()
    )
  );

CREATE POLICY "feedback: teacher UPDATE"
  ON public.feedback FOR UPDATE
  USING (
    get_my_role() = 'teacher'
    AND teacher_id = get_my_teacher_id()
  );

-- student: 본인 제출물 첨삭 조회 (published만)
CREATE POLICY "feedback: student 본인 조회"
  ON public.feedback FOR SELECT
  USING (
    get_my_role() = 'student'
    AND status = 'published'
    AND submission_id IN (
      SELECT id FROM public.submissions
      WHERE student_id = get_my_student_id()
    )
  );

-- parent: 자녀 첨삭 조회 (published만)
CREATE POLICY "feedback: parent 자녀 조회"
  ON public.feedback FOR SELECT
  USING (
    get_my_role() = 'parent'
    AND status = 'published'
    AND submission_id IN (
      SELECT sub.id FROM public.submissions sub
      JOIN public.parent_students ps ON ps.student_id = sub.student_id
      WHERE ps.parent_id = get_my_parent_id()
    )
  );


-- ──────────────────────────────────────────────
-- 검증 쿼리 (실행 후 확인)
-- ──────────────────────────────────────────────

-- RLS 활성화 확인 (모든 행이 true여야 함)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 정책 등록 확인
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
