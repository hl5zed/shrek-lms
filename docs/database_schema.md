# database_schema.md — 논술마루 LMS DB 스키마

이 파일은 프로젝트의 유일한 DB 설계 기준입니다.
Cursor AI는 이 파일을 참고하여 DB 관련 코드를 작성하고,
임의로 테이블·컬럼을 추가하거나 변경하지 않습니다.

---

## MVP 핵심 테이블 (Phase 4까지 사용)

### profiles
auth.users와 1:1 연동되는 사용자 정보 테이블

```sql
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        text not null check (role in ('admin', 'teacher', 'student', 'parent')),
  name        text not null,
  email       text not null,
  phone       text,
  created_at  timestamptz default now()
);
```

> 신규 가입 시 트리거로 자동 생성 (role 기본값: 'student')
> 관리자가 별도로 role을 변경하여 강사·학부모 등으로 지정

---

### classes (반)

```sql
create table classes (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  teacher_id    uuid references profiles(id),
  created_at    timestamptz default now()
);
```

---

### class_students (반-학생 매핑)

```sql
create table class_students (
  class_id    uuid references classes(id) on delete cascade,
  student_id  uuid references profiles(id) on delete cascade,
  primary key (class_id, student_id)
);
```

---

### parent_students (학부모-학생 연결)

```sql
create table parent_students (
  parent_id   uuid references profiles(id) on delete cascade,
  student_id  uuid references profiles(id) on delete cascade,
  primary key (parent_id, student_id)
);
```

---

### lectures (강의)

```sql
create table lectures (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid references classes(id) on delete cascade,
  title         text not null,
  description   text,
  video_url     text,         -- YouTube / Vimeo / Bunny Stream URL
  material_url  text,         -- Supabase Storage URL (자료 파일)
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);
```

---

### assignments (과제)

```sql
create table assignments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid references classes(id) on delete cascade,
  title         text not null,
  description   text,
  due_date      date not null,
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);
```

---

### submissions (과제 제출)

```sql
create table submissions (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid references assignments(id) on delete cascade,
  student_id      uuid references profiles(id),
  content_text    text,                    -- 텍스트 논술
  file_urls       jsonb default '[]',      -- Supabase Storage URL 배열 [{type, url, name}]
  word_count      int default 0,           -- 공백 포함 글자 수
  word_count_pure int default 0,           -- 공백 제외 글자 수
  status          text default 'submitted' check (status in ('submitted', 'reviewed')),
  submitted_at    timestamptz default now(),
  updated_at      timestamptz default now()
);
```

---

### feedbacks (강사 첨삭)

```sql
create table feedbacks (
  id              uuid primary key default gen_random_uuid(),
  submission_id   uuid references submissions(id) on delete cascade unique,
  teacher_id      uuid references profiles(id),

  -- 종합 코멘트
  comment         text,

  -- 영역별 코멘트 (JSON)
  -- 예: {"독해": "...", "사고": "...", "논리": "...", "구성": "...", "표현": "..."}
  area_comments   jsonb default '{}',

  -- 성장지표 점수 (1~5점)
  score_reading   int check (score_reading between 1 and 5),     -- 독해력
  score_thinking  int check (score_thinking between 1 and 5),    -- 사고력
  score_logic     int check (score_logic between 1 and 5),       -- 논리력
  score_structure int check (score_structure between 1 and 5),   -- 구성력
  score_expression int check (score_expression between 1 and 5), -- 표현력

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
```

---

### feedback_comments (첨삭 코멘트 확장)

```sql
create table feedback_comments (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  teacher_id    uuid references profiles(id),
  comment       text not null,
  created_at    timestamptz not null default now()
);
```

> 실제 운영 DB 확인 기준:
> - `submission_id`로 제출물에 직접 연결됨 (`feedback_id` 아님)
> - 현재 정책 백업 기준으로 SELECT 정책만 존재

---

## 확장 테이블 (Phase 5 이후 추가 예정)

아래 테이블은 MVP 완성 후 단계적으로 추가합니다.
현재 단계에서는 생성하지 않습니다.

| 테이블명 | 용도 | 추가 시점 |
|----------|------|-----------|
| subscriptions | 수강권/기간 관리 | Phase 7 (운영 관리자) |
| assignment_extensions | 개인별 마감 연장 | Phase 6 |
| ai_usage_logs | AI 첨삭 비용 추적 | Phase 5 (AI 첨삭) |
| notifications | 알림 발송 이력 | Phase 6 (알림) |
| parent_reports | 월간 학부모 리포트 | Phase 6 |

---

## 자동 트리거 (Supabase SQL Editor에서 실행)

### 신규 가입 시 profiles 자동 생성

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    'student',                        -- 기본 역할은 student
    coalesce(new.raw_user_meta_data->>'name', '이름없음'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### submissions updated_at 자동 갱신

```sql
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger submissions_updated_at
  before update on submissions
  for each row execute procedure update_updated_at();

create trigger feedbacks_updated_at
  before update on feedbacks
  for each row execute procedure update_updated_at();
```

---

## Supabase Storage 버킷 구조

```
버킷명: submissions
경로: {student_id}/{assignment_id}/{파일명}
접근: 업로드한 학생 + 담당 강사 + 관리자만 가능
공개: 비공개 (Signed URL 사용)

버킷명: materials
경로: {class_id}/{lecture_id}/{파일명}
접근: 해당 반 학생 + 강사 + 관리자
공개: 비공개
```

---

## TypeScript 타입 정의 위치

```
types/
  database.ts   -- Supabase 자동 생성 타입 (supabase gen types typescript)
  index.ts      -- 커스텀 타입 및 유틸리티 타입
```
