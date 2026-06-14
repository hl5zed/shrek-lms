-- notifications 테이블: 관리자가 학부모에게 발송하는 주간 알림 저장
create table if not exists public.notifications (
  id           uuid        primary key default gen_random_uuid(),
  recipient_id uuid        not null references auth.users(id) on delete cascade,
  type         text        not null,          -- 'weekly_alert' | 'mini_alert_draft'
  message      text        not null,
  is_read      boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- 인덱스: 수신자 + 타입 조회 최적화
create index if not exists notifications_recipient_type_idx
  on public.notifications(recipient_id, type);

-- RLS 활성화 (service_role은 자동으로 우회)
alter table public.notifications enable row level security;

-- 학부모 본인 알림만 읽기 허용 (user 클라이언트 대비)
create policy "parent_read_own" on public.notifications
  for select
  using (auth.uid() = recipient_id);
