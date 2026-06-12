-- lectures 테이블에 audio_url 컬럼 추가
alter table public.lectures
  add column if not exists audio_url text;

-- Supabase Storage 버킷 lecture-audio 생성 (공개 읽기)
insert into storage.buckets (id, name, public)
values ('lecture-audio', 'lecture-audio', true)
on conflict (id) do nothing;

-- 관리자만 업로드 가능
drop policy if exists "lecture-audio: admin upload" on storage.objects;
create policy "lecture-audio: admin upload"
  on storage.objects for insert
  with check (
    bucket_id = 'lecture-audio'
    and public.get_my_role() = 'admin'
  );

-- 인증된 사용자는 모두 읽기 가능 (학생 재생용)
drop policy if exists "lecture-audio: authenticated read" on storage.objects;
create policy "lecture-audio: authenticated read"
  on storage.objects for select
  using (
    bucket_id = 'lecture-audio'
    and auth.role() = 'authenticated'
  );
