-- 수업기록 정규화 2차: class_records + class_record_students

create extension if not exists pgcrypto;

create table if not exists public.class_records (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  lesson_date date,
  title text not null,
  goal text,
  key_concepts text,
  materials text,
  activities text,
  assignment text,
  teacher_memo text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.class_record_students (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.class_records(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  attendance_status text not null default 'present',
  focus_level text,
  understanding_level text,
  presentation_level text,
  discussion_level text,
  assignment_status text,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(record_id, student_id)
);

create index if not exists idx_class_records_class_id on public.class_records(class_id);
create index if not exists idx_class_records_lesson_date on public.class_records(lesson_date);
create index if not exists idx_class_record_students_record_id on public.class_record_students(record_id);
create index if not exists idx_class_record_students_student_id on public.class_record_students(student_id);

alter table public.class_records enable row level security;
alter table public.class_record_students enable row level security;

-- 프로젝트 rls_policy.md 패턴(get_my_role/get_my_teacher_id)에 맞춰 최소 정책 구성
-- admin: 전체 읽기/쓰기
drop policy if exists "class_records: admin all" on public.class_records;
create policy "class_records: admin all"
  on public.class_records
  for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

drop policy if exists "class_record_students: admin all" on public.class_record_students;
create policy "class_record_students: admin all"
  on public.class_record_students
  for all
  using (public.get_my_role() = 'admin')
  with check (public.get_my_role() = 'admin');

-- teacher: 담당 반의 기록만 읽기/쓰기
drop policy if exists "class_records: teacher own classes" on public.class_records;
create policy "class_records: teacher own classes"
  on public.class_records
  for all
  using (
    public.get_my_role() = 'teacher'
    and exists (
      select 1
      from public.classes c
      where c.id = class_records.class_id
        and c.teacher_id = public.get_my_teacher_id()
    )
  )
  with check (
    public.get_my_role() = 'teacher'
    and exists (
      select 1
      from public.classes c
      where c.id = class_records.class_id
        and c.teacher_id = public.get_my_teacher_id()
    )
  );

drop policy if exists "class_record_students: teacher own classes" on public.class_record_students;
create policy "class_record_students: teacher own classes"
  on public.class_record_students
  for all
  using (
    public.get_my_role() = 'teacher'
    and exists (
      select 1
      from public.class_records cr
      join public.classes c on c.id = cr.class_id
      where cr.id = class_record_students.record_id
        and c.teacher_id = public.get_my_teacher_id()
    )
  )
  with check (
    public.get_my_role() = 'teacher'
    and exists (
      select 1
      from public.class_records cr
      join public.classes c on c.id = cr.class_id
      where cr.id = class_record_students.record_id
        and c.teacher_id = public.get_my_teacher_id()
    )
  );

-- TODO: student/parent read 정책은 권한 범위 확정 후 별도 추가
