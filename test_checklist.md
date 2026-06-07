# 테스트 체크리스트

## RLS 적용 후 역할별 데이터 격리 검증

### 테스트 계정 준비
Supabase Dashboard → Authentication → Users에서 생성:
- `admin@test.com` / `Test1234!` → profiles.role = 'admin'
- `teacher@test.com` / `Test1234!` → profiles.role = 'teacher'
- `student@test.com` / `Test1234!` → profiles.role = 'student'
- `parent@test.com` / `Test1234!` → profiles.role = 'parent'

### Phase 1 — 인증 및 리다이렉트

- [ ] admin 로그인 → `/admin/dashboard` 이동
- [ ] teacher 로그인 → `/teacher/dashboard` 이동
- [ ] student 로그인 → `/student/dashboard` 이동
- [ ] parent 로그인 → `/parent/dashboard` 이동
- [ ] 미로그인 상태에서 `/admin/dashboard` 접근 → `/login` 리다이렉트

### Phase 2 — 관리자 페이지

- [ ] `/admin/teachers` — 강사 목록 조회됨
- [ ] `/admin/students` — 학생 목록 조회됨
- [ ] `/admin/students/[id]` — 학생 상세 (수강반, 제출이력, 성장기록)
- [ ] `/admin/classes` — 반 목록 + 새 반 생성
- [ ] `/admin/classes/[id]` — 반 상세 + 강사 배정 저장
- [ ] `/admin/parents` — 학부모 목록 조회됨
- [ ] `/admin/parents/[id]` — 학부모 상세 + 연결 자녀

### Phase 3 — 학부모 페이지

- [ ] `/parent/assignments` — 자녀 과제 현황 (전체/제출/미제출/첨삭완료 수)
- [ ] `/parent/feedback` — 첨삭 완료 목록
- [ ] `/parent/feedback/[submissionId]` — 첨삭 상세 (점수 바, 코멘트)
- [ ] `/parent/growth` — 성장 추이 (차트 + 타임라인)

### Phase 4 — RLS 격리 검증

#### 학부모 격리
- [ ] 다른 학부모의 자녀 데이터 → 조회 불가 (0건 반환)
- [ ] 연결되지 않은 submissionId 직접 접근 → 404

#### 학생 격리
- [ ] 다른 학생의 제출물 → 조회 불가
- [ ] 본인 제출물만 조회됨

#### teacher 격리
- [ ] 담당 반 외 학생 데이터 → 조회 불가
- [ ] 담당 반 내 학생 데이터 → 조회됨

#### admin 전체 접근
- [ ] 모든 학생 데이터 조회됨
- [ ] 모든 제출물 조회됨

### Phase 5 — 빌드 검증

```bash
cd /path/to/project
npm run typecheck
npm run build
```

- [ ] TypeScript 오류 0건
- [ ] `npm run build` 성공
- [ ] 32개 라우트 모두 등록

### 완료된 라우트 체크리스트

#### 관리자
- [ ] `app/admin/dashboard/page.tsx`
- [ ] `app/admin/teachers/page.tsx`
- [ ] `app/admin/students/page.tsx`
- [ ] `app/admin/students/[id]/page.tsx`
- [ ] `app/admin/classes/page.tsx`
- [ ] `app/admin/classes/[id]/page.tsx`
- [ ] `app/admin/parents/page.tsx`
- [ ] `app/admin/parents/[id]/page.tsx`

#### 강사
- [ ] `app/teacher/dashboard/page.tsx`
- [ ] `app/teacher/lectures/page.tsx`
- [ ] `app/teacher/lectures/new/page.tsx`
- [ ] `app/teacher/assignments/page.tsx`
- [ ] `app/teacher/assignments/new/page.tsx`
- [ ] `app/teacher/submissions/page.tsx`
- [ ] `app/teacher/submissions/[id]/page.tsx`

#### 학생
- [ ] `app/student/dashboard/page.tsx`
- [ ] `app/student/lectures/page.tsx`
- [ ] `app/student/assignments/page.tsx`
- [ ] `app/student/assignments/[id]/page.tsx`
- [ ] `app/student/assignments/[id]/submit/page.tsx`
- [ ] `app/student/feedback/page.tsx`
- [ ] `app/student/feedback/[submissionId]/page.tsx`

#### 학부모
- [ ] `app/parent/dashboard/page.tsx`
- [ ] `app/parent/assignments/page.tsx`
- [ ] `app/parent/feedback/page.tsx`
- [ ] `app/parent/feedback/[submissionId]/page.tsx`
- [ ] `app/parent/growth/page.tsx`
