# RLS 앱 의존 관계 맵

## 1. 한 줄 결론

`feedback_comments`와 `lectures`는 넓은 조회 정책 정리 시 영향 가능성이 크므로, **실제 사용 화면/역할 범위를 먼저 확정한 뒤** 정책을 단계적으로 정리해야 합니다.

---

## 2. 테이블별 앱 사용 현황

| 테이블 | 사용 파일/페이지 | 사용하는 역할 | 사용 목적 | 현재 RLS 위험도 | 정책 정리 영향 |
| --- | --------- | ------- | ----- | ---------- | -------- |
| `feedback_comments` | 앱 코드 직접 사용 없음 (`.from("feedback_comments")` 미검출) | 미확정 | 첨삭 코멘트 확장용 추정 | High | 정책 정리 시 현재 UI 영향은 낮을 수 있으나, 향후 기능/직접 쿼리 존재 여부 재확인 필요 |
| `lectures` | `app/student/lectures/page.tsx`, `app/teacher/lectures/page.tsx`, `app/teacher/lectures/new/page.tsx`, `src/lib/student/courses.ts`, `lib/lms/queries/class-records.ts` | teacher, student, admin(관리 경로 간접) | 강의 목록/등록, 학생 강의 노출, 수업 관련 집계 | High | 넓은 정책 제거 시 학생/강사 강의 목록 영향 가능 |
| `courses` | 앱 코드 직접 DB 조회 미검출 (`.from("courses")` 미검출) | 미확정 | 문서상 커리큘럼 도메인 | Medium | 정책 변경 영향은 현재 낮음, 제품 정책 확정 전 정리 보류 권장 |
| `lessons` | 앱 코드 직접 DB 조회 미검출 (`.from("lessons")` 미검출) | 미확정 | 문서상 강의 세부 도메인 | Medium | 정책 변경 영향은 현재 낮음, `courses/enrollments` 모델 확정 필요 |
| `feedbacks` | `app/teacher/submissions/[id]/page.tsx`, `app/parent/feedback/[submissionId]/page.tsx`, `app/parent/growth/page.tsx`, `src/lib/student/feedback.ts`, `src/lib/student/growth.ts`, `src/lib/student/portfolio.ts` | teacher, student, parent, admin(간접) | 첨삭 저장/조회, 성장 지표 조회 | Medium | teacher 쓰기 정책 정리 시 첨삭 저장 흐름 직접 영향 |
| `submissions` | `app/teacher/dashboard/page.tsx`, `app/teacher/submissions/*.tsx`, `app/parent/feedback*.tsx`, `app/parent/assignments/page.tsx`, `app/student/assignments/[id]/*.tsx`, `src/lib/student/*` | teacher, student, parent, admin(간접) | 제출물 생성/수정/조회 | Medium | 권한 정책 조정 시 거의 모든 역할 흐름에 영향 |
| `assignments` | `app/teacher/assignments*.tsx`, `app/student/assignments*.tsx`, `app/parent/assignments/page.tsx`, `app/student/assignments/[id]/actions.ts`, `src/lib/student/assignments.ts` | teacher, student, parent, admin(간접) | 과제 생성/조회/상세 | Medium | 정책 정리 시 학생/학부모/강사 조회 경로 영향 |
| `classes` | `app/admin/classes/*`, `app/teacher/lectures/new/page.tsx`, `app/teacher/assignments/new/page.tsx`, `lib/lms/queries/classes.ts` | admin, teacher | 반 관리, 강의/과제 대상 반 선택 | Medium | 중복 정책 정리 시 관리자/강사 운영 흐름 영향 |
| `class_students` | `app/student/assignments/[id]/page.tsx`, `app/student/assignments/[id]/actions.ts`, `app/parent/assignments/page.tsx`, `src/lib/student/assignments.ts`, `src/lib/student/courses.ts`, `lib/lms/queries/*` | admin, teacher, student, parent(간접) | 반-학생 소속 검증 핵심 | Medium | 소속 검증 기반이므로 정책 변경 시 권한 경계 전반 영향 |
| `parent_students` | `app/parent/*`, `app/admin/parents/*`, `app/admin/students/[id]/page.tsx`, `lib/lms/queries/students.ts` | admin, parent | 학부모-자녀 연결/조회 | Medium | parent 접근 정책 조정 시 학부모 기능 전반 영향 |

---

## 3. High 위험 후보 상세 분석

### 3.1 `feedback_comments`

- 실제 코드에서 사용하는 파일:
  - 현재 앱 코드에서 `.from("feedback_comments")` 직접 사용 파일이 확인되지 않음
  - 문서(`docs/database_schema.md`, `docs/manual_permission_test_guide.md`)에는 존재
- 어떤 역할이 조회/생성/수정하는지:
  - 코드 기준 명시 불가(미사용), 제품 정책 미확정
- 학생/학부모가 직접 봐야 하는지:
  - 현재 UI에는 `feedbacks.comment` 중심 노출이며 `feedback_comments` 직접 노출 경로는 확인되지 않음
- 현재 `auth.uid() IS NOT NULL` 조회 정책을 제거하면 깨질 화면:
  - 현재 코드 기준으로는 즉시 깨질 화면이 없을 가능성이 높음
  - 단, RPC/대시보드/숨은 쿼리 사용 여부는 별도 확인 필요
- 안전한 대체 정책 방향(문장):
  - admin: 전체 조회/관리
  - teacher: 담당 반 submission의 댓글만 조회/작성
  - student: 본인 submission의 댓글만 조회
  - parent: 자녀 submission의 댓글만 조회

### 3.2 `lectures`

- 실제 코드에서 사용하는 파일:
  - `app/student/lectures/page.tsx`
  - `app/teacher/lectures/page.tsx`
  - `app/teacher/lectures/new/page.tsx`
  - `src/lib/student/courses.ts`
  - `lib/lms/queries/class-records.ts`
- `lectures`가 전체 공개 자료인지 반별 자료인지 코드상 추정:
  - 코드상 추정은 **반별 자료**
  - 학생 화면은 `classes.class_students.student_id = user.id` 필터
  - 강사 화면은 `created_by = user.id` 필터
- `lectures: 로그인 사용자 조회` 정책 제거 시 영향:
  - 반별/작성자 필터가 없는 보조 조회가 있다면 영향 가능
  - 현재 핵심 화면은 코드 필터가 있어 즉시 전면 장애 가능성은 낮지만, RLS 정합성 불일치 시 일부 조회 실패 가능
- 안전한 대체 정책 방향(문장):
  - admin: 전체
  - teacher: 담당 반 또는 본인 생성 lectures
  - student: 본인 반 lectures
  - parent: 자녀 반 lectures

---

## 4. Medium 보강 후보 상세 분석

### 4.1 `feedbacks`

- feedback 생성/수정 액션 파일:
  - `app/teacher/submissions/[id]/page.tsx` (`upsert`, `update`)
- teacher 생성 시 `teacher_id = auth.uid()` 외 담당 반 검증:
  - 코드에서 상세 조회 시 `submissions -> assignments -> classes.teacher_id = user.id` 검증 후 진입
  - 저장 액션 자체에서는 동일 체인을 재검증하지 않고 `teacher_id = user.id`로 저장
- 앱 코드 보강 상태:
  - 이전 보강으로 상세 페이지 진입 검증은 추가됨
- RLS 보강 필요 여부:
  - 필요(권장). 액션 단에서도 담당 반 체인까지 RLS/DB에서 강제되는지 확인 필요

### 4.2 `courses` / `lessons`

- 전체 로그인 사용자 공개 가능 여부:
  - 코드에서 현재 `courses`, `lessons` 테이블 직접 조회는 미확인
  - 따라서 공개/제한 정책이 제품적으로 미확정 상태
- 특정 수강생만 봐야 하는지:
  - LMS 성격상 제한형 가능성이 높음(문서상 역할 분리 구조)
- `enrollments` 연결 여부:
  - 앱 코드에서 `enrollments` 직접 조회 미확인
- 정책 정리 전 제품 정책 결정 필요 여부:
  - 필요(강함). 공개형/수강제한형 결정 없이 RLS 정리하면 과차단/과노출 위험

---

## 5. 직접 URL 접근과 RLS 의존 관계

| 화면 | URL 예시 | 조회 테이블 | 코드 레벨 소유권 검증 | RLS 의존도 | 보강 필요 여부 |
| -- | ------ | ------ | ------------ | ------- | -------- |
| teacher dashboard | `/teacher/dashboard` | `submissions`, `assignments`, `classes` | 있음(`assignments.classes.teacher_id = user.id`) | 중 | 낮음 |
| teacher submission detail | `/teacher/submissions/{id}` | `submissions`, `assignments`, `classes`, `feedbacks` | 있음(상세 조회 시 teacher_id 체인) | 중 | 중(저장 액션 재검증 강화 여지) |
| parent assignments | `/parent/assignments` | `parent_students`, `class_students`, `assignments`, `submissions` | 있음(자녀 id 선조회 + 자녀 제출 필터) | 중 | 낮음 |
| parent feedback detail | `/parent/feedback/{submissionId}` | `parent_students`, `submissions`, `feedbacks` | 있음(자녀 id 범위 검증) | 중 | 낮음 |
| student assignment detail | `/student/assignments/{id}` | `class_students`, `assignments`, `submissions` | 있음(본인 class_id 범위) | 중 | 낮음 |
| student submission action | `/student/assignments/{id}` action | `class_students`, `assignments`, `submissions` | 있음(`verifyStudentAssignmentAccess`, `student_id=user.id`) | 중 | 낮음 |
| lecture/material 관련 화면 | `/student/lectures`, `/teacher/lectures` | `lectures`, `classes`, `class_students` | 부분 있음(학생 반 필터, 강사 created_by 필터) | 중~높음 | 중(정책 일관성 점검 필요) |
| course/lesson 관련 화면 | `/student/courses` (간접), lessons 전용 화면 없음 | `class_students`, `classes`, `lectures` (직접 `courses/lessons` 미사용) | 부분 있음 | 높음(정책 미확정) | 높음(제품 정책 선결정) |

---

## 6. 정책 정리 전 필요한 코드 보강 후보

| 우선순위 | 파일 | 문제 | 보강 방향 | 정책 정리와의 관계 |
| ---- | -- | -- | ----- | ---------- |
| 1 | `app/teacher/submissions/[id]/page.tsx` | 첨삭 저장 액션에서 담당 반 체인 재검증이 페이지 진입 검증에 간접 의존 | 저장 액션에서도 submission 소유 체인 재확인 후 저장 | `feedbacks` teacher 쓰기 정책 정리 시 안정성 확보 |
| 2 | `app/teacher/lectures/page.tsx` | 강사 조회가 `created_by` 중심이라 class ownership 정책과 기준이 다를 수 있음 | `created_by`와 `classes.teacher_id` 기준 일관성 검토 | `lectures` 정책 축소/대체 시 회귀 방지 |
| 3 | `src/lib/student/courses.ts` | `courses/lessons` 미사용 상태에서 lectures 기반 대체 계산 | 제품 정책 확정 후 실제 테이블 사용 여부 결정 | `courses/lessons/enrollments` 정책 정리 전 선행 검토 |

---

## 7. 정책 정리 영향도 판단

- `feedback_comments`: **D. 아직 정리 보류**
  - 실제 앱 사용 경로 확정 전 정책 정리 위험
- `lectures`: **B. 코드 보강 후 정리 가능**
  - 핵심 화면은 필터 있음, 정책 일관성 점검 후 정리 가능
- `courses`: **C. 제품 정책 결정 후 정리 가능**
- `lessons`: **C. 제품 정책 결정 후 정리 가능**
- `feedbacks`: **B. 코드 보강 후 정리 가능**
  - teacher 쓰기 체인 강제 확인 후 진행 권장
- `submissions`: **A. 지금 바로 정리 가능(중복 정리 범위)**
  - 단, 수동 QA 동반 필수
- `assignments`: **A. 지금 바로 정리 가능(중복 정리 범위)**
  - 단, 수동 QA 동반 필수
- `classes`: **A. 지금 바로 정리 가능(중복 정리 범위)**
  - 단, 수동 QA 동반 필수
- `class_students`: **B. 코드 보강 후 정리 가능**
  - 소속 검증 핵심 테이블이라 보수적 접근 권장
- `parent_students`: **B. 코드 보강 후 정리 가능**
  - parent 핵심 경계라 회귀 위험 점검 필요

---

## 8. 다음 단계 제안

1. `feedback_comments` 실제 사용 여부를 먼저 확정하고, 미사용이면 보수적 축소/정리 후보로 분리
2. `lectures` 공개 범위(반별 제한 vs 전체 공개)를 제품 정책으로 확정한 뒤 정책 정리안 작성
3. `courses/lessons`를 공개형으로 유지할지 수강 제한형으로 전환할지 결정 후 `enrollments` 연계 정책 설계

콘텐츠 공개 범위 정책은 `docs/content_access_policy.md`를 기준으로 사용합니다.
대체 정책 설계는 `docs/rls_replacement_plan.md`와 함께 검토합니다.
`feedback_comments` 실사용 최종 감사는 `docs/feedback_comments_usage_audit.md`를 참고합니다.

---

## 9. 완료 기준

- [x] `docs/rls_app_dependency_map.md` 생성
- [x] High 후보 2개 상세 분석 포함
- [x] Medium 후보 분석 포함
- [x] 화면 ↔ 테이블 ↔ 역할 매핑 포함
- [x] 정책 삭제/수정 SQL은 작성하지 않음
- [x] 앱 코드는 수정하지 않음
