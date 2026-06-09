# test_checklist.md — 역할별 테스트 체크리스트

각 Phase가 완성될 때마다 아래 체크리스트를 역할별 계정으로 직접 확인합니다.
한 항목이라도 실패하면 다음 Phase로 넘어가지 않습니다.

---

## 테스트 계정 (개발 단계)

| 역할 | 이메일 | 비밀번호 |
|------|--------|---------|
| 관리자 | admin@test.com | Test1234! |
| 강사 A | teacher_a@test.com | Test1234! |
| 강사 B | teacher_b@test.com | Test1234! |
| 학생 1 | student_1@test.com | Test1234! |
| 학생 2 | student_2@test.com | Test1234! |
| 학생 3 | student_3@test.com | Test1234! |
| 학부모 1 | parent_1@test.com | Test1234! |
| 학부모 2 | parent_2@test.com | Test1234! |

> 학생 1,2 → 강사 A 담당 반 / 학생 3 → 강사 B 담당 반
> 학부모 1 → 학생 1의 학부모 / 학부모 2 → 학생 2의 학부모

---

## Phase 3 체크리스트 — 인증·권한

- [ ] 관리자 계정으로 로그인 → /admin/dashboard 이동
- [ ] 강사 계정으로 로그인 → /teacher/dashboard 이동
- [ ] 학생 계정으로 로그인 → /student/dashboard 이동
- [ ] 학부모 계정으로 로그인 → /parent/dashboard 이동
- [ ] 비로그인 상태로 /admin/dashboard 접근 → /login 리다이렉트
- [ ] 학생 계정으로 /admin/dashboard 접근 → /student/dashboard 리다이렉트
- [ ] 로그아웃 후 보호 페이지 접근 불가 확인
- [ ] npm run build 통과

---

## Phase 4 체크리스트 — 핵심 MVP 흐름

### 관리자 계정 (admin@test.com)
- [ ] 강사 A, B 계정 생성 가능
- [ ] 학생 1, 2, 3 계정 생성 가능
- [ ] 학부모 1, 2 계정 생성 및 자녀 연결 가능
- [ ] 반 A 생성 → 강사 A 배정 → 학생 1, 2 배정 가능
- [ ] 반 B 생성 → 강사 B 배정 → 학생 3 배정 가능
- [ ] 전체 학생·강사·반 목록 조회 가능

### 강사 A 계정 (teacher_a@test.com)
- [ ] 본인 반(반 A)의 학생(학생 1, 2)만 보임
- [ ] 학생 3 (강사 B 담당)은 보이지 않음
- [ ] 반 A에 강의 등록 가능 (제목, 설명, 영상URL, 대상 반)
- [ ] 반 A에 과제 등록 가능 (제목, 설명, 마감일)
- [ ] 학생 1이 제출한 과제 조회 가능
- [ ] 학생 2가 제출한 과제 조회 가능
- [ ] 강사 B 담당 학생의 제출물은 보이지 않음
- [ ] 첨삭 작성 → 저장 가능 (종합 코멘트, 영역별 코멘트, 성장지표 5개)
- [ ] 첨삭 완료 후 submission status가 reviewed로 변경됨

### 강사 B 계정 (teacher_b@test.com)
- [ ] 본인 반(반 B)의 학생(학생 3)만 보임
- [ ] 학생 1, 2 (강사 A 담당)는 보이지 않음

### 학생 1 계정 (student_1@test.com)
- [ ] 본인 반(반 A)의 강의 목록 조회 가능
- [ ] 본인 반(반 A)의 과제 목록 조회 가능
- [ ] 학생 2의 과제·제출물·첨삭이 보이지 않음
- [ ] 과제 제출 가능 (텍스트 입력 + 글자수 실시간 카운트)
- [ ] 이미지/PDF 파일 업로드 가능
- [ ] 제출 후 상태가 '첨삭대기'로 표시됨
- [ ] 강사가 첨삭 완료 후 → 결과 확인 가능
- [ ] 성장지표 5개 점수 확인 가능
- [ ] 영역별 코멘트 확인 가능

### 학부모 1 계정 (parent_1@test.com)
- [ ] 자녀(학생 1)의 과제 제출 현황 조회 가능
- [ ] 자녀(학생 1)의 첨삭 결과 조회 가능
- [ ] 자녀(학생 1)의 성장지표 조회 가능
- [ ] 학생 2, 3의 정보는 보이지 않음
- [ ] 데이터 수정·제출 불가 (읽기 전용)

### 공통 확인
- [ ] npm run build 통과 (에러 없음)
- [ ] Vercel 배포 후 실제 URL에서 동작 확인
- [ ] 모바일 화면 (학부모·학생 페이지 우선) 레이아웃 확인

---

## 권한 침투 테스트: 직접 URL 변조 차단

이 섹션은 RLS 적용 전/후 모두 사용할 수 있는 권한 회귀 테스트입니다.
모든 테스트는 "로그인 계정 역할"과 "직접 입력한 URL"을 함께 기록합니다.

상세 절차는 `docs/manual_permission_test_guide.md`를 참고하세요.

### Teacher 권한 테스트

- [ ] teacher A로 로그인한다.
- [ ] teacher A 담당 반의 제출물 목록이 정상 조회되는지 확인한다.
- [ ] teacher A 담당 반 학생의 제출물 상세 페이지에 정상 접근되는지 확인한다.
- [ ] teacher B 담당 반 학생의 submission id를 URL에 직접 입력했을 때 접근이 차단되는지 확인한다.
- [ ] 차단 시 `notFound()` 또는 404 화면으로 처리되는지 확인한다.
- [ ] teacher dashboard에 타 교사 담당 반 제출물이 섞이지 않는지 확인한다.

### Parent 권한 테스트

- [ ] parent A로 로그인한다.
- [ ] parent A의 자녀 과제 현황이 정상 조회되는지 확인한다.
- [ ] parent A의 자녀 제출물/첨삭 상세가 정상 조회되는지 확인한다.
- [ ] parent B의 자녀 submission id를 URL에 직접 입력했을 때 접근이 차단되는지 확인한다.
- [ ] 자녀가 아닌 학생의 feedback/submission 상세가 노출되지 않는지 확인한다.
- [ ] 자녀가 여러 명일 때 각 자녀의 데이터만 표시되는지 확인한다.

### Student 권한 테스트

- [ ] student A로 로그인한다.
- [ ] student A가 본인 반 과제 목록을 정상 조회하는지 확인한다.
- [ ] student A가 본인 반 과제 상세에 정상 접근하는지 확인한다.
- [ ] 다른 반 assignment id를 URL에 직접 입력했을 때 접근이 차단되는지 확인한다.
- [ ] 제출 생성 시 `student_id`가 로그인 사용자 id로 저장되는지 확인한다.
- [ ] 다른 학생의 제출물을 수정할 수 없는지 확인한다.
- [ ] 파일 제출 시 업로드 경로가 본인 제출 범위 안에서만 연결되는지 확인한다.

### Admin 권한 테스트

- [ ] admin으로 로그인한다.
- [ ] 전체 학생/교사/학부모/반/과제/제출물 관리 화면 접근이 가능한지 확인한다.
- [ ] admin 권한에서 teacher/parent/student 화면으로 잘못 리다이렉트되지 않는지 확인한다.
- [ ] admin이 관리 화면에서 필요한 데이터를 조회할 수 있는지 확인한다.

### 테스트 준비 데이터

- admin 계정 1개
- teacher A 계정 1개
- teacher B 계정 1개
- student A 계정 1개: teacher A 담당 반 소속
- student B 계정 1개: teacher B 담당 반 소속
- parent A 계정 1개: student A와 연결
- parent B 계정 1개: student B와 연결
- teacher A 반 과제 1개 이상
- teacher B 반 과제 1개 이상
- student A 제출물 1개 이상
- student B 제출물 1개 이상
- 각 제출물에 대한 feedback 1개 이상

### 테스트 결과 기록표

| 날짜 | 테스트 역할 | 테스트 항목 | 결과 | 이슈 | 확인자 |
|---|---|---|---|---|---|
|  | teacher | 타 교사 submission 직접 접근 차단 | PASS / FAIL |  |  |
|  | parent | 타 자녀 submission 직접 접근 차단 | PASS / FAIL |  |  |
|  | student | 타 반 assignment 직접 접근 차단 | PASS / FAIL |  |  |
|  | admin | 관리자 전체 접근 확인 | PASS / FAIL |  |  |

---

## 자주 막히는 포인트 체크

| 증상 | 확인할 것 |
|------|-----------|
| 로그인 후 역할별 이동 안 됨 | profiles 테이블에 role 값이 있는지 확인 |
| 데이터가 아예 안 불러와짐 | RLS 활성화 여부 + 정책 조건 확인 |
| 다른 학생 데이터가 보임 | RLS 비활성화 상태 즉시 확인 |
| 파일 업로드 안 됨 | Storage 버킷 정책 + 파일 크기 제한 확인 |
| 로컬은 되는데 Vercel에서 안 됨 | Vercel 환경변수 등록 여부 확인 |
| build는 되는데 런타임 에러 | Supabase URL/KEY 환경변수 확인 |
