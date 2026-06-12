# signup_profile_trigger_draft.md — 회원가입 프로필 트리거 초안

> [중요] 이 문서는 **DB/RLS 변경 초안 문서**입니다.
>
> - 실제 반영은 Supabase SQL Editor에서 사람이 직접 실행해야 합니다.
> - Cursor AI는 본 문서 작성 외에 DB 스키마/RLS를 직접 변경하지 않습니다.
> - 실행 전 `docs/database_schema.md`, `docs/rls_policy.md`와 반드시 대조하세요.

---

## 1) 현재 문제

현재 `app/signup/SignupForm.tsx`는 브라우저에서 `profiles`를 직접 `upsert`하고 있습니다.

- `profiles`에 INSERT 정책이 없거나 세션 상태가 불완전하면 RLS에 의해 `profiles` 저장이 차단될 수 있음
- 이때 auth 가입은 완료되었지만 프로필 생성은 실패할 수 있어, 결과적으로 **프로필 없는 계정**이 발생할 수 있음
- 또한 `role` 컬럼(`student`)이 클라이언트 쓰기 경로에 노출되어 있어, 장기적으로 보안 경계가 약해질 수 있음

즉, 회원가입 시 `profiles` 생성 책임을 클라이언트가 아닌 DB 트리거로 이동하는 것이 안전합니다.

---

## 2) 해결 SQL 초안 (사람이 SQL Editor에서 직접 실행)

아래 초안은 `auth.users` 신규 생성 시 `public.profiles`를 자동 생성합니다.

- `SECURITY DEFINER` 함수 `public.handle_new_user()`
- 트리거 `on_auth_user_created`
- `raw_user_meta_data`에서 `name`, `phone`을 읽음
- `role`은 서버 고정값 `'student'`

```sql
-- [초안] 신규 auth 사용자 생성 시 profiles 자동 생성
-- 실행 전 기존 함수/트리거 충돌 여부 확인 권장

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    name,
    email,
    phone
  )
  values (
    new.id,
    'student',
    coalesce(new.raw_user_meta_data->>'name', '이름없음'),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do update set
    name  = excluded.name,
    email = excluded.email,
    phone = excluded.phone;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
```

---

## 3) 추후 수정 대상 (현재 코드 즉시 수정 금지)

트리거 적용이 완료되면, `app/signup/SignupForm.tsx`의 클라이언트 `profiles.upsert` 블록은 제거 대상입니다.

> 현재 요청 범위에서는 **코드를 수정하지 않고 문서로만 기록**합니다.

제거 대상 블록(참고):

```ts
const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  name,
  email,
  phone: phone.trim() || null,
  role: "student",
});
```

방향:

- 회원가입 클라이언트는 `supabase.auth.signUp`만 담당
- `profiles` 생성은 DB 트리거가 담당
- `role`은 클라이언트에서 전달하지 않음

---

## 체크 포인트

1. SQL Editor에서 함수/트리거 적용 후 신규 회원가입 테스트
2. 가입 직후 `profiles` 자동 생성 여부 확인 (`id`, `name`, `email`, `phone`, `role='student'`)
3. 이메일 인증 대기/완료 케이스 모두에서 프로필 누락이 없는지 확인
4. 이후 앱 코드에서 `profiles.upsert` 제거 시 회귀 테스트 수행

