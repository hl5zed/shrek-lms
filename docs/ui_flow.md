# ui_flow.md — 화면 흐름 및 라우팅

---

## 전체 라우팅 구조

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx                     # 로그인 화면
│
├── (admin)/
│   └── admin/
│       ├── dashboard/page.tsx            # 관리자 대시보드
│       ├── teachers/page.tsx             # 강사 목록·등록
│       ├── students/page.tsx             # 학생 목록·등록
│       │   └── [id]/page.tsx            # 학생 상세·수정
│       ├── classes/page.tsx             # 반 목록·생성
│       │   └── [id]/page.tsx           # 반 상세·학생 배정
│       └── parents/page.tsx             # 학부모 목록·연결
│
├── (teacher)/
│   └── teacher/
│       ├── dashboard/page.tsx            # 강사 대시보드 (첨삭 대기 목록)
│       ├── lectures/page.tsx            # 강의 목록
│       │   └── new/page.tsx            # 강의 등록
│       ├── assignments/page.tsx         # 과제 목록
│       │   └── new/page.tsx            # 과제 등록
│       └── submissions/page.tsx         # 제출함
│           └── [id]/page.tsx           # 제출물 상세 + 첨삭 작성
│
├── (student)/
│   └── student/
│       ├── dashboard/page.tsx           # 학생 대시보드
│       ├── lectures/page.tsx            # 내 강의 목록
│       ├── assignments/page.tsx         # 내 과제 목록
│       │   └── [id]/
│       │       ├── page.tsx            # 과제 상세
│       │       └── submit/page.tsx     # 과제 제출 화면
│       └── feedback/page.tsx            # 첨삭 결과·성장지표
│           └── [submissionId]/page.tsx  # 개별 첨삭 결과
│
├── (parent)/
│   └── parent/
│       ├── dashboard/page.tsx           # 학부모 홈 (자녀 주간 요약)
│       ├── assignments/page.tsx         # 자녀 과제 현황
│       ├── feedback/page.tsx            # 자녀 첨삭 결과
│       └── growth/page.tsx             # 자녀 성장 추이
│
├── middleware.ts                         # 역할 기반 라우트 보호
└── layout.tsx                            # 루트 레이아웃
```

---

## 로그인 흐름

```
[로그인 페이지]
    ↓ 이메일/비밀번호 입력
[Supabase Auth 인증]
    ↓ 성공
[profiles 테이블에서 role 조회]
    ↓
admin   → /admin/dashboard
teacher → /teacher/dashboard
student → /student/dashboard
parent  → /parent/dashboard
```

---

## 역할별 핵심 화면 흐름

### 관리자 흐름
```
/admin/dashboard
  → 전체 현황 카드 (학생 수, 강사 수, 반 수, 첨삭 대기)
  → /admin/teachers    : 강사 등록 (이름, 이메일, 비밀번호 설정)
  → /admin/students    : 학생 등록 (이름, 이메일, 반 배정, 학부모 연결)
  → /admin/classes     : 반 생성 (이름, 담당 강사 배정, 학생 배정)
  → /admin/parents     : 학부모 등록 (이름, 이메일, 자녀 연결)
```

### 강사 흐름
```
/teacher/dashboard
  → 첨삭 대기 목록 (클릭 → /teacher/submissions/[id])
  → /teacher/lectures/new   : 강의 등록 (제목, 설명, 영상URL, 자료파일, 대상 반)
  → /teacher/assignments/new: 과제 등록 (제목, 설명, 마감일, 대상 반)
  → /teacher/submissions/[id]: 제출물 읽기 + 첨삭 작성 + 성장지표 입력
```

### 학생 흐름
```
/student/dashboard
  → 이번 주 과제 현황 카드
  → /student/assignments     : 전체 과제 목록 (제출 상태 포함)
  → /student/assignments/[id]/submit: 과제 제출 (텍스트 입력 + 파일 업로드 + 글자수)
  → /student/lectures        : 강의 목록 (영상 URL 클릭 → 외부 이동)
  → /student/feedback        : 첨삭 결과 목록
  → /student/feedback/[id]   : 개별 첨삭 결과 + 성장지표 확인
```

### 학부모 흐름
```
/parent/dashboard
  → 자녀 주간 요약 카드 (제출 완료/미제출/첨삭 완료)
  → /parent/assignments: 자녀 과제 제출 현황
  → /parent/feedback   : 자녀 첨삭 결과 목록 + 내용 확인
  → /parent/growth     : 자녀 성장지표 추이 (월별 그래프)
```

---

## 공통 레이아웃 컴포넌트

```
components/
├── layout/
│   ├── AdminLayout.tsx     # 관리자 사이드바 + 헤더
│   ├── TeacherLayout.tsx   # 강사 사이드바 + 헤더
│   ├── StudentLayout.tsx   # 학생 사이드바 + 헤더
│   └── ParentLayout.tsx    # 학부모 사이드바 + 헤더
├── ui/
│   ├── Button.tsx
│   ├── Badge.tsx           # 상태 뱃지 (제출완료, 첨삭대기, 미제출 등)
│   ├── Card.tsx
│   ├── Table.tsx
│   └── Modal.tsx
└── features/
    ├── submission/
    │   ├── SubmitForm.tsx   # 과제 제출 폼 (글자수 카운트 포함)
    │   └── FileUpload.tsx   # 파일 업로드 컴포넌트
    ├── feedback/
    │   ├── FeedbackEditor.tsx  # 첨삭 작성 폼
    │   └── ScoreInput.tsx      # 성장지표 점수 입력
    └── growth/
        └── GrowthChart.tsx     # 성장지표 막대 그래프
```

---

## 미들웨어 처리 규칙 (middleware.ts)

```typescript
// 보호 경로 목록
const protectedRoutes = {
  '/admin': ['admin'],
  '/teacher': ['teacher'],
  '/student': ['student'],
  '/parent': ['parent'],
}

// 처리 순서
// 1. 비로그인 → /login으로 리다이렉트
// 2. 로그인 + 잘못된 역할 경로 → 본인 역할 대시보드로 리다이렉트
// 3. /login 접근 + 이미 로그인 → 본인 역할 대시보드로 리다이렉트
```

---

## 상태값 정의

### submissions.status
| 값 | 의미 | 표시 뱃지 |
|----|------|-----------|
| submitted | 제출 완료, 첨삭 대기 | 🟡 첨삭대기 |
| reviewed | 첨삭 완료 | 🟢 첨삭완료 |

### 미제출 판단
- 과제 마감일이 지났으나 submissions 레코드가 없는 경우
- 대시보드에서 집계해서 표시 (별도 status 컬럼 없음)
