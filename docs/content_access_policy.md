# 논술 LMS 콘텐츠 공개 범위 정책

## 1. 한 줄 결론

논술 LMS의 과제·제출·첨삭·반별 강의 자료는 역할/소속 관계 기준으로 제한하고, 공개 커리큘럼 정보만 로그인 사용자 전체 조회를 허용하는 방향이 안전합니다.

---

## 2. 콘텐츠 유형별 공개 범위 원칙

| 콘텐츠 유형 | 대상 테이블 | 기본 공개 범위 | 제한 기준 | 이유 |
| ------ | ------ | -------- | ----- | -- |
| 반별 강의 자료 | `lectures` | 제한 공개 | `class_id` 기반(담당 교사/소속 학생/자녀 소속) | 수업 영상/자료는 반 단위 운영 데이터 |
| 코스/커리큘럼 정보 | `courses` | 조건부 공개 | A안: 로그인 전체, B안: `enrollments` 기반 | 공지형 커리큘럼과 수강형 콘텐츠를 분리 필요 |
| 레슨/차시 정보 | `lessons` | 조건부 공개 | `courses` 정책 연동(공개형 또는 수강 제한형) | 실제 수업 자료 포함 여부에 따라 민감도 달라짐 |
| 첨삭 댓글/상호작용 댓글 | `feedback_comments` | 제한 공개 | `feedback -> submission` 소유권 체인 | 댓글은 첨삭 맥락 데이터로 누수 시 민감 |
| 과제 | `assignments` | 제한 공개 | 반 소속/자녀 소속/담당 반 기준 | 반 단위 학습 운영 데이터 |
| 제출물 | `submissions` | 제한 공개 | 학생 본인/자녀/담당 반/관리자 | 학생 개인 작성물 포함 |
| 피드백 | `feedbacks` | 제한 공개 | submission 소유권 + teacher 담당 반 기준 | 학습 평가 데이터로 민감 |

---

## 3. 테이블별 권장 접근 정책

| 테이블 | admin | teacher | student | parent | 권장 정책 방향 |
| --- | ----- | ------- | ------- | ------ | -------- |
| `lectures` | 전체 | 본인 담당 반 강의 자료 | 본인 소속 반 강의 자료 | 자녀 소속 반 강의 자료(필요 시) | 전체 로그인 사용자 조회는 원칙적으로 비권장 |
| `courses` | 전체 | 조회/관리(담당 범위) | A안: 전체 조회 / B안: 수강 범위 조회 | A안: 전체 조회 / B안: 자녀 수강 범위 조회 | 초기는 공개형 가능, 운영 안정화 후 제한형 검토 |
| `lessons` | 전체 | 담당/관리 범위 | 코스 정책 연동 | 코스 정책 연동 | `courses` 정책과 반드시 연동 |
| `feedback_comments` | 전체 | 담당 반 submission 댓글 조회/작성 | 본인 submission 댓글 조회 | 자녀 submission 댓글 조회 | 전체 로그인 사용자 조회는 비권장 |
| `assignments` | 전체 | 담당 반 과제 관리 | 본인 반 과제 조회 | 자녀 반 과제 조회 | 반/역할 기반 제한 유지 |
| `submissions` | 전체 | 담당 반 학생 제출물 조회 | 본인 제출물 CRUD(첨삭 완료 제한) | 자녀 제출물 조회 | 역할별 소유권 체인 강제 |
| `feedbacks` | 전체 | 담당 반 첨삭 작성/수정/조회 | 본인 제출물 첨삭 조회 | 자녀 제출물 첨삭 조회 | teacher 작성권한 + 담당 반 체인 검증 |

### `lectures`

- admin: 전체
- teacher: 본인 담당 반 강의 자료
- student: 본인 소속 반 강의 자료
- parent: 자녀 소속 반 강의 자료
- 전체 로그인 사용자 조회는 원칙적으로 비권장

### `courses`

두 가지 안 비교:

- A안: 공개 커리큘럼
  - 로그인 사용자 전체 조회 가능
- B안: 수강 제한 콘텐츠
  - `enrollments` 기준 제한

현재 프로젝트 단계 권장:

- 운영 초기에는 A안(공개 커리큘럼)으로 시작 가능
- 실제 수업 자료/진도 데이터가 포함되면 B안으로 전환하는 것이 안전

### `lessons`

- `courses` 정책과 연동해 결정
- 공개 커리큘럼형이면 로그인 전체 조회 허용 가능
- 수업 자료/영상 포함 시 수강 제한형(`enrollments`)으로 전환 권장

### `feedback_comments`

- admin: 전체
- teacher: 담당 반 submission 댓글
- student: 본인 submission 댓글
- parent: 자녀 submission 댓글
- 전체 로그인 사용자 조회는 비권장

---

## 4. lectures 정책 방향 결정

현재 판단:

- `lectures`는 앱에서 실제 사용 중
- `lectures.class_id`가 존재함
- 따라서 반별 자료 성격이 강함

권장 결론:

`lectures`는 전체 로그인 사용자 공개가 아니라 `class_id` 기반 제한 자료로 보는 것이 안전하다.

정리 전 확인할 것:

- 학생 화면에서 lectures를 어디서 조회하는지
- 교사 화면에서 lectures를 어디서 생성/조회하는지
- 학부모가 lectures를 볼 필요가 있는지
- `lecture.material_url`/`video_url`이 민감 자료인지

---

## 5. courses / lessons 정책 방향 결정

### A안: 공개 커리큘럼형

- 장점:
  - 구현 단순
  - 모든 로그인 사용자가 코스 목록을 볼 수 있음
  - 마케팅/안내용 커리큘럼에 적합
- 단점:
  - 수강생 제한 콘텐츠와 섞이면 위험
  - 강의 자료가 포함될 경우 과다 노출 가능

### B안: 수강 제한형

- 장점:
  - 실제 LMS 운영에 더 안전
  - `enrollments` 기준으로 수강생만 접근 가능
- 단점:
  - RLS와 앱 쿼리 복잡도 증가
  - 관리자/교사 관리 화면 추가 고려 필요

현재 권장:

초기 운영 단계에서는 courses는 공개 커리큘럼 수준으로 유지 가능하지만, lessons에 실제 수업 영상/자료가 들어간다면 `enrollments` 기준 제한으로 전환하는 것이 안전하다.

---

## 6. feedback_comments 정책 방향 결정

현재 판단:

- 앱 코드에서 직접 사용 미검출
- 하지만 테이블과 넓은 RLS 정책은 존재
- 향후 댓글 기능이 붙으면 권한 누수 가능성 있음

권장 결론:

`feedback_comments`는 지금 즉시 삭제보다 사용 여부를 보류 점검하고, 사용한다면 `submissions` 관계 기준으로 제한해야 한다.

정리 전 확인:

- 현재 UI에서 댓글 기능이 실제 노출되는지
- teacher feedback 작성 과정에서 `feedback_comments`를 쓰는지
- student/parent 화면에서 댓글을 보는지
- `feedbacks.comment`와 역할이 중복되는지

---

## 7. 정책 결정 요약

| 테이블 | 현재 판단 | 권장 방향 | RLS 정리 우선순위 |
| --- | ----- | ----- | ----------- |
| `lectures` | 실제 사용 중 | `class_id` 기반 제한 | High |
| `feedback_comments` | 사용 미검출 | 보류 후 제한 정책 | High |
| `courses` | 직접 조회 미검출 | 일단 공개 가능하나 정책 결정 필요 | Medium |
| `lessons` | 직접 조회 미검출 | 콘텐츠 포함 시 제한 | Medium |
| `feedbacks` | 실제 사용 중 | teacher 담당 반 체인 강화 유지 | Medium |
| `submissions` | 실제 사용 중 | 역할/소유권 체인 제한 유지 | Medium |
| `assignments` | 실제 사용 중 | 반 소속 기반 제한 유지 | Medium |

---

## 8. 다음 단계

1. `lectures` 사용 파일 목록을 기준으로 코드 레벨 class ownership 검증 여부 확인
2. `feedback_comments` 실사용 여부 최종 확인
3. `courses/lessons`를 공개형으로 둘지 수강 제한형으로 둘지 운영 정책 결정
4. 정책 결정 후 `rls_replacement_plan.md` 작성
5. staging에서 먼저 RLS 정리 테스트

---

## 9. 완료 기준

- [x] `docs/content_access_policy.md` 생성
- [x] lectures 공개 범위 권장 결론 포함
- [x] courses/lessons A안/B안 비교 포함
- [x] feedback_comments 보류/제한 방향 포함
- [x] 앱 코드 수정 없음
- [x] SQL 작성 없음
- [x] RLS 정책 변경 없음
