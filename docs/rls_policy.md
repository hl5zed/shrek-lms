# rls_policy.md — Supabase RLS 정책

이 파일은 Supabase SQL Editor에서 실행할 RLS 정책의 기준입니다.
Cursor AI는 이 정책을 임의로 변경하거나 비활성화하지 않습니다.

---

## 기본 원칙

- 모든 테이블에 RLS를 활성화한다
- 정책이 없으면 아무도 접근할 수 없다 (기본 차단)
- admin은 별도 정책으로 전체 접근 허용
- 클라이언트는 anon key만 사용, service_role key는 서버(API Route)에서만 사용

---

## RLS 활성화 (전체 테이블)

```sql
alter table profiles enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table parent_students enable row level security;
alter table lectures enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table feedbacks enable row level security;
```

---

## profiles 정책

```sql
-- 관리자: 전체 조회·수정
create policy "admin_all_profiles" on profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 본인: 자기 정보만 조회 (role 변경 불가 — update는 admin만)
create policy "self_read_profile" on profiles
  for select using (id = auth.uid());
```

---

## classes 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_classes" on classes
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 본인이 담당인 반만 조회
create policy "teacher_own_classes" on classes
  for select using (teacher_id = auth.uid());

-- 강사: 반 생성 가능
create policy "teacher_insert_class" on classes
  for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'teacher')
  );

-- 학생: 본인이 속한 반 조회
create policy "student_own_classes" on classes
  for select using (
    exists (
      select 1 from class_students
      where class_id = classes.id and student_id = auth.uid()
    )
  );

-- 학부모: 자녀가 속한 반 조회
create policy "parent_child_classes" on classes
  for select using (
    exists (
      select 1 from class_students cs
      join parent_students ps on cs.student_id = ps.student_id
      where cs.class_id = classes.id and ps.parent_id = auth.uid()
    )
  );
```

---

## class_students 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_class_students" on class_students
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 본인 반의 학생 매핑 조회
create policy "teacher_class_students" on class_students
  for select using (
    exists (
      select 1 from classes
      where id = class_students.class_id and teacher_id = auth.uid()
    )
  );

-- 학생: 본인 매핑만 조회
create policy "student_own_class" on class_students
  for select using (student_id = auth.uid());
```

---

## parent_students 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_parent_students" on parent_students
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 학부모: 본인과 연결된 자녀만 조회
create policy "parent_own_children" on parent_students
  for select using (parent_id = auth.uid());
```

---

## lectures 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_lectures" on lectures
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 본인 반의 강의 생성·조회·수정
create policy "teacher_own_lectures" on lectures
  for all using (
    exists (
      select 1 from classes
      where id = lectures.class_id and teacher_id = auth.uid()
    )
  );

-- 학생: 본인 반의 강의 조회만
create policy "student_class_lectures" on lectures
  for select using (
    exists (
      select 1 from class_students
      where class_id = lectures.class_id and student_id = auth.uid()
    )
  );
```

---

## assignments 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_assignments" on assignments
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 본인 반의 과제 생성·조회·수정
create policy "teacher_own_assignments" on assignments
  for all using (
    exists (
      select 1 from classes
      where id = assignments.class_id and teacher_id = auth.uid()
    )
  );

-- 학생: 본인 반의 과제 조회만
create policy "student_class_assignments" on assignments
  for select using (
    exists (
      select 1 from class_students
      where class_id = assignments.class_id and student_id = auth.uid()
    )
  );

-- 학부모: 자녀 반의 과제 조회만
create policy "parent_child_assignments" on assignments
  for select using (
    exists (
      select 1 from class_students cs
      join parent_students ps on cs.student_id = ps.student_id
      where cs.class_id = assignments.class_id and ps.parent_id = auth.uid()
    )
  );
```

---

## submissions 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_submissions" on submissions
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 배정된 반 학생의 제출물 조회
create policy "teacher_class_submissions" on submissions
  for select using (
    exists (
      select 1 from class_students cs
      join assignments a on cs.class_id = a.class_id
      join classes c on cs.class_id = c.id
      where a.id = submissions.assignment_id
        and cs.student_id = submissions.student_id
        and c.teacher_id = auth.uid()
    )
  );

-- 학생: 본인 제출물만 생성·조회
-- (reviewed 상태이면 수정 불가 — 애플리케이션 레벨에서 추가 처리)
create policy "student_own_submissions" on submissions
  for all using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- 학부모: 자녀 제출물 조회만
create policy "parent_child_submissions" on submissions
  for select using (
    exists (
      select 1 from parent_students
      where student_id = submissions.student_id and parent_id = auth.uid()
    )
  );
```

---

## feedbacks 정책

```sql
-- 관리자: 전체 접근
create policy "admin_all_feedbacks" on feedbacks
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- 강사: 본인이 작성한 첨삭만 생성·수정·조회
create policy "teacher_own_feedbacks" on feedbacks
  for all using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

-- 강사: 배정 학생의 첨삭 조회 (다른 강사 작성 포함)
create policy "teacher_class_feedbacks_read" on feedbacks
  for select using (
    exists (
      select 1 from submissions s
      join class_students cs on s.student_id = cs.student_id
      join classes c on cs.class_id = c.id
      where s.id = feedbacks.submission_id
        and c.teacher_id = auth.uid()
    )
  );

-- 학생: 본인 제출물의 첨삭만 조회
create policy "student_own_feedbacks" on feedbacks
  for select using (
    exists (
      select 1 from submissions
      where id = feedbacks.submission_id and student_id = auth.uid()
    )
  );

-- 학부모: 자녀 제출물의 첨삭만 조회
create policy "parent_child_feedbacks" on feedbacks
  for select using (
    exists (
      select 1 from submissions s
      join parent_students ps on s.student_id = ps.student_id
      where s.id = feedbacks.submission_id and ps.parent_id = auth.uid()
    )
  );
```

---

## 주의사항

1. RLS 정책 확인 방법: Supabase 대시보드 → Authentication → Policies
2. 정책 적용 후 반드시 역할별 테스트 계정으로 실제 접근 확인
3. 다른 학생의 데이터가 보인다면 → RLS가 비활성화되어 있는지 즉시 확인
4. 개발 중 RLS를 임시로 끄지 말 것 — 처음부터 켜고 개발
