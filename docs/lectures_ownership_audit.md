# lectures 코드 레벨 소유권 검증 감사 보고서

## 1. 한 줄 결론

lectures는 실제 사용 중이므로 RLS 정책을 줄이기 전에 teacher/student/parent별 `class_id` 소유권 검증 여부를 먼저 보강해야 한다.

---

## 2. lectures 사용 위치 목록

| 파일 | 역할 | 사용 방식 | class_id 제한 여부 | 위험도 | 비고 |
| -- | -- | ----- | -------------- | --- | -- |
| `app/teacher/lectures/page.tsx` | teacher | `lectures` 목록 조회 (`.from("lectures")`) | 간접(현재 `created_by = user.id`) | Medium | 담당 반(`classes.teacher_id`) 직접 검증은 없음 |
| `app/teacher/lectures/new/page.tsx` | teacher | `lectures` 생성 (`insert`) | 부분(폼의 class 목록은 `teacher_id = user.id`) | Medium | Server Action insert 시 `class_id` 재검증이 코드에 명시되지 않음(RLS 의존) |
| `app/student/lectures/page.tsx` | student | `lectures` 목록 조회 + `classes!inner(class_students)` 조인 | 있음(`classes.class_students.student_id = user.id`) | Low~Medium | 학생 본인 반 필터가 명시적 |
| `src/lib/student/courses.ts` | student | `class_students`로 class 확보 후 `lectures`를 `class_id in (...)` 조회 | 있음(본인 class ids 기반) | Low~Medium | 학생 코스 요약 집계용, 직접 `courses/lessons` 미사용 |
| `lib/lms/queries/class-records.ts` | admin/teacher(공용 쿼리) | class_records fallback 용으로 `lectures` 조회 | 있음(`.eq("class_id", classId)` / `.eq("id", recordId)`) | Medium | caller role 검증은 상위 라우트/RLS 의존 |

참고:

- `parent`/`admin` 전용 lectures 페이지는 현재 앱 경로에서 직접 확인되지 않음
- lecture 상세 단일 페이지(`/.../lectures/[id]`)는 실코드 기준 미확인

---

## 3. 역할별 검증 상태

| 역할 | 기대 검증 기준 | 현재 코드 상태 | 보강 필요 여부 |
| -- | -------- | -------- | -------- |
| admin | 전체 조회/관리 허용, 일반 사용자와 경로 분리 | admin 레이아웃 role 검증은 존재하나 admin 전용 lectures 화면은 명확히 분리되지 않음 | 중간(정책/화면 분리 명확화 권장) |
| teacher | 본인 담당 반(`classes.teacher_id = user.id`) lectures만 조회/생성/수정 | 목록 조회는 `created_by = user.id` 기준, 생성 시 class 선택은 제한되나 insert 시 재검증 코드 약함 | 필요 |
| student | 본인 소속 반(`class_students.student_id = user.id`) lectures만 조회 | 학생 목록/집계 조회 모두 class_id 기반 필터 명시 | 낮음(현상 유지 가능) |
| parent | 허용 시 자녀 소속 반 기준, 미허용 시 조회 없음 | parent lectures 조회 코드 현재 미확인 | 제품 정책 확정 후 필요 |

---

## 4. 위험 후보

### High

- 현재 코드 기준 **타 반 lectures가 즉시 노출되는 High 증거는 직접 확인되지 않음**
- 다만 `lectures`가 `video_url`을 포함하고 있고, RLS가 넓게 열려 있으면 정책 레이어에서 High로 상승 가능

### Medium

- `app/teacher/lectures/page.tsx`
  - teacher 조회 기준이 `created_by = user.id` 중심이라 `classes.teacher_id` ownership과 1:1 일치 보장이 약함
- `app/teacher/lectures/new/page.tsx`
  - UI 단계에서는 담당 반만 선택 가능하지만, Server Action insert에서 `class_id` ownership 재검증이 명시적이지 않음(RLS 의존)
- `lib/lms/queries/class-records.ts` fallback
  - class_id 필터는 있으나 호출 맥락 role 검증은 상위 흐름/RLS 전제

### Low

- lectures 상세 URL 라우트가 없어 직접 URL id 변조 기반 위험 표면은 상대적으로 작음
- 문서상 parent lectures 정책이 미확정이라 운영 기준 명확화가 필요

---

## 5. 정책 정리 전 필요한 코드 보강 후보

| 우선순위 | 파일 | 문제 | 보강 방향 | RLS 정리와의 관계 |
| ---- | -- | -- | ----- | ----------- |
| 1 | `app/teacher/lectures/new/page.tsx` | insert 시 `class_id`가 담당 반인지 서버 액션 단계 명시 검증 부족 | insert 직전 `classes.teacher_id = user.id` 재검증 | `lectures: 로그인 사용자 조회` 축소 시 write 실패/우회 방지 |
| 2 | `app/teacher/lectures/page.tsx` | 조회 기준이 `created_by` 중심이라 class ownership과 불일치 가능 | `classes.teacher_id = user.id` 기준과 정합성 맞추기 검토 | teacher 조회 정책 단순화 시 기준 일치 필요 |
| 3 | `lib/lms/queries/class-records.ts` | lectures fallback 조회가 role 맥락에 간접 의존 | 호출 경로별 권한 기대치 문서화/검증 강화 | RLS 축소 후 fallback 경로 회귀 방지 |

---

## 6. parent lectures 열람 정책 판단 자료

- 현재 parent 화면에서 lectures를 조회하는가?
  - 현재 코드에서 parent가 `.from("lectures")` 하는 경로는 확인되지 않음
- parent가 자녀의 수업 영상/자료를 볼 필요가 있어 보이는가?
  - 현재 parent 기능은 과제/첨삭/성장 중심으로 구성되어 있으며 lectures 직접 노출 요구는 코드상 뚜렷하지 않음
- parent lectures 조회가 없다면 RLS에서도 parent 허용을 보류해도 되는가?
  - 예. 현재 기능 기준으로는 parent 허용을 기본값으로 두지 않고 보류해도 기능 손실이 낮음
- 향후 parent 열람 기능을 추가할 경우 필요한 관계 검증:
  - `lectures.class_id -> class_students.class_id -> parent_students(student_id, parent_id = auth.uid())`
  - 즉, 자녀 소속 반 lectures만 허용

---

## 7. 결론 및 다음 단계

판단:

`A. lectures RLS 정리 전 코드 보강 필요`

추천 다음 단계 3개:

1. teacher lectures 생성/조회 경로의 class ownership 검증(`classes.teacher_id`)을 코드 레벨에서 명시 강화할지 결정
2. parent lectures 열람 정책을 제품 측에서 허용/비허용으로 확정
3. 위 두 항목 확정 후 staging에서 lectures 대체 정책(로그인 전체 조회 축소) 테스트 설계 진행

---

## 8. 완료 기준

- [x] `docs/lectures_ownership_audit.md` 생성
- [x] lectures 사용 파일 목록 작성
- [x] teacher/student/parent/admin별 검증 상태 작성
- [x] 위험 후보 분류 작성
- [x] parent 열람 정책 판단 자료 작성
- [x] SQL/RLS 변경 없음
- [x] 앱 코드 수정 없음
