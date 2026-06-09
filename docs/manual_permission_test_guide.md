# 논술 LMS 역할별 권한 수동 테스트 가이드

## 1. 테스트 목적

- 로그인 사용자가 자기 역할에 맞는 데이터만 볼 수 있는지 확인합니다.
- URL을 직접 바꿔도 타인의 데이터에 접근할 수 없는지 확인합니다.
- RLS 적용 전/후 모두 사용할 수 있는 권한 회귀 테스트 절차를 확보합니다.
- 운영 배포 전 권한 누수 가능성을 줄이기 위한 최종 점검 기준으로 사용합니다.

---

## 2. 필요한 테스트 계정

| 역할 | 계정 이름 예시 | 설명 |
| --- | --- | --- |
| admin | admin-test@example.com | 전체 관리 권한 |
| teacher A | teacher-a@example.com | A반 담당 교사 |
| teacher B | teacher-b@example.com | B반 담당 교사 |
| student A | student-a@example.com | teacher A의 A반 소속 학생 |
| student B | student-b@example.com | teacher B의 B반 소속 학생 |
| parent A | parent-a@example.com | student A의 학부모 |
| parent B | parent-b@example.com | student B의 학부모 |

주의:

- 실제 운영 사용자 이메일을 테스트에 사용하지 말 것
- 테스트용 이메일과 비밀번호는 별도 관리
- 테스트 종료 후 필요하면 비밀번호 변경 또는 계정 비활성화

---

## 3. 필요한 테스트 데이터

아래 관계가 반드시 구성되어 있어야 합니다.

```txt
teacher A
└── class A
    └── student A
        └── submission A
            └── feedback A
        └── parent A

teacher B
└── class B
    └── student B
        └── submission B
            └── feedback B
        └── parent B
```

필요 데이터:

- A반 1개
- B반 1개
- teacher A는 A반 담당
- teacher B는 B반 담당
- student A는 A반 소속
- student B는 B반 소속
- parent A는 student A와 연결
- parent B는 student B와 연결
- A반 과제 1개 이상
- B반 과제 1개 이상
- student A 제출물 1개 이상
- student B 제출물 1개 이상
- 각 제출물에 feedback 1개 이상

---

## 4. Supabase에서 확인해야 할 테이블

확인 대상 테이블:

- `profiles`
- `classes`
- `class_students`
- `parent_students`
- `assignments`
- `submissions`
- `feedbacks`
- `feedback_comments`

테이블별 확인 포인트:

- `profiles.id`: Supabase Auth user id와 일치해야 함
- `profiles.role`: `admin` / `teacher` / `student` / `parent` 중 하나
- `classes.teacher_id`: 담당 teacher의 `profiles.id`
- `class_students.student_id`: 학생의 `profiles.id`
- `parent_students.parent_id`: 학부모의 `profiles.id`
- `parent_students.student_id`: 자녀 학생의 `profiles.id`
- `assignments.class_id`: 과제가 연결된 반 id
- `submissions.student_id`: 제출 학생의 `profiles.id`
- `submissions.assignment_id`: 제출이 연결된 과제 id
- `feedbacks.submission_id`: 첨삭 대상 제출물 id
- `feedbacks.teacher_id`: 첨삭 작성 교사의 `profiles.id`
- `feedback_comments.feedback_id`: 첨삭 본문과 올바르게 연결되어 있는지 확인

---

## 5. 테스트 전 준비 체크리스트

- [ ] 로컬 또는 배포 URL 접속 가능
- [ ] Supabase 환경변수 설정 완료
- [ ] 테스트 계정 7개 준비 완료
- [ ] teacher A/B가 각각 다른 반에 연결됨
- [ ] student A/B가 각각 다른 반에 연결됨
- [ ] parent A/B가 각각 다른 학생과 연결됨
- [ ] A/B 반에 각각 과제 있음
- [ ] student A/B 제출물 있음
- [ ] 각 제출물에 feedback 있음
- [ ] 테스트할 submission id와 assignment id를 기록해 둠

---

## 6. 테스트할 URL 기록표

| 구분 | 정상 접근 계정 | 차단되어야 할 계정 | URL 또는 ID | 결과 |
| --- | --- | --- | --- | --- |
| teacher A 제출물 상세 | teacher A | teacher B | `/teacher/submissions/{submissionA_id}` |  |
| teacher B 제출물 상세 | teacher B | teacher A | `/teacher/submissions/{submissionB_id}` |  |
| parent A 자녀 feedback | parent A | parent B | `/parent/feedback/{submissionA_id}` |  |
| parent B 자녀 feedback | parent B | parent A | `/parent/feedback/{submissionB_id}` |  |
| student A 과제 상세 | student A | student B | `/student/assignments/{assignmentA_id}` |  |
| student B 과제 상세 | student B | student A | `/student/assignments/{assignmentB_id}` |  |

---

## 7. Teacher 테스트 절차

### teacher A 정상 접근

- [ ] teacher A로 로그인
- [ ] `/teacher/dashboard` 접속
- [ ] A반 제출물만 보이는지 확인
- [ ] `/teacher/submissions/{submissionA_id}` 접속
- [ ] student A 제출물 상세가 정상 표시되는지 확인

### teacher A 차단 테스트

- [ ] teacher A 로그인 상태에서 `/teacher/submissions/{submissionB_id}` 직접 접속
- [ ] 404 또는 접근 차단 화면이 나오는지 확인
- [ ] B반/student B 데이터가 노출되지 않는지 확인

### teacher B도 동일하게 반대로 테스트

- [ ] teacher B로 로그인
- [ ] B반 제출물 정상 접근
- [ ] A반 제출물 직접 URL 접근 차단 확인

---

## 8. Parent 테스트 절차

### parent A 정상 접근

- [ ] parent A로 로그인
- [ ] `/parent/assignments` 접속
- [ ] student A의 과제/제출/첨삭만 보이는지 확인
- [ ] `/parent/feedback/{submissionA_id}` 접속
- [ ] student A feedback이 정상 표시되는지 확인

### parent A 차단 테스트

- [ ] parent A 로그인 상태에서 `/parent/feedback/{submissionB_id}` 직접 접속
- [ ] 404 또는 접근 차단 화면이 나오는지 확인
- [ ] student B 데이터가 노출되지 않는지 확인

### parent B도 동일하게 반대로 테스트

- [ ] parent B로 로그인
- [ ] student B 데이터 정상 접근
- [ ] student A 데이터 직접 URL 접근 차단 확인

---

## 9. Student 테스트 절차

### student A 정상 접근

- [ ] student A로 로그인
- [ ] `/student/dashboard` 접속
- [ ] A반 과제만 보이는지 확인
- [ ] `/student/assignments/{assignmentA_id}` 접속
- [ ] 과제 상세가 정상 표시되는지 확인
- [ ] 텍스트 제출이 정상 저장되는지 확인
- [ ] 파일 제출이 정상 저장되는지 확인

### student A 차단 테스트

- [ ] student A 로그인 상태에서 `/student/assignments/{assignmentB_id}` 직접 접속
- [ ] 404 또는 접근 차단 화면이 나오는지 확인
- [ ] B반 과제/제출물 데이터가 노출되지 않는지 확인

### student B도 동일하게 반대로 테스트

- [ ] student B 정상 접근
- [ ] student A 과제 직접 접근 차단 확인

---

## 10. Admin 테스트 절차

- [ ] admin으로 로그인
- [ ] `/admin/dashboard` 접속
- [ ] 학생/교사/학부모/반/과제/제출물 관리 화면 접근 확인
- [ ] `/teacher/dashboard`, `/student/dashboard`, `/parent/dashboard` 직접 접근 시 의도한 정책대로 처리되는지 확인
- [ ] admin이 관리용 데이터 조회에 제한을 받지 않는지 확인

---

## 11. 결과 기록표

| 날짜 | 환경 | 역할 | 테스트 항목 | 기대 결과 | 실제 결과 | PASS/FAIL | 이슈 메모 | 확인자 |
| -- | -- | -- | -- | -- | -- | -- | -- | -- |
|  | local / production | teacher A | teacher B submission 직접 접근 | 차단 |  |  |  |  |
|  | local / production | teacher B | teacher A submission 직접 접근 | 차단 |  |  |  |  |
|  | local / production | parent A | parent B 자녀 feedback 직접 접근 | 차단 |  |  |  |  |
|  | local / production | parent B | parent A 자녀 feedback 직접 접근 | 차단 |  |  |  |  |
|  | local / production | student A | student B 과제 직접 접근 | 차단 |  |  |  |  |
|  | local / production | student B | student A 과제 직접 접근 | 차단 |  |  |  |  |
|  | local / production | admin | 관리자 전체 관리 화면 접근 | 허용 |  |  |  |  |

---

## 12. 실패 시 이슈 기록 형식

```md
### 권한 테스트 실패 이슈

- 날짜:
- 환경:
- 로그인 계정:
- 접근한 URL:
- 기대 결과:
- 실제 결과:
- 노출된 데이터:
- 관련 역할:
- 관련 파일 추정:
- 심각도: High / Medium / Low
- 조치 메모:
```

심각도 기준:

- High: 타인 데이터가 실제로 화면에 노출됨
- Medium: 차단은 되었지만 에러 처리/리다이렉트가 이상함
- Low: 문구, UI, 기록 방식 문제

---

## 13. 완료 기준

- [ ] teacher A/B 상호 URL 변조 차단 확인
- [ ] parent A/B 상호 자녀 데이터 접근 차단 확인
- [ ] student A/B 상호 과제 접근 차단 확인
- [ ] admin 관리 화면 접근 확인
- [ ] 실패 케이스가 있으면 이슈 템플릿으로 기록
- [ ] 테스트 결과표에 PASS/FAIL 기록
- [ ] 배포 전 동일 테스트 재실행 가능

---

## 실제 테스트 ID 기록표

아래 표는 Supabase에서 테스트 데이터를 만든 뒤, 실제 URL 변조 테스트에 사용할 ID를 기록하기 위한 표입니다.

| 항목 | 실제 ID 값 | 연결 관계 | 비고 |
|---|---|---|---|
| teacher A user id |  | profiles.id |  |
| teacher B user id |  | profiles.id |  |
| student A user id |  | profiles.id | teacher A 담당 반 소속 |
| student B user id |  | profiles.id | teacher B 담당 반 소속 |
| parent A user id |  | profiles.id | student A와 연결 |
| parent B user id |  | profiles.id | student B와 연결 |
| class A id |  | classes.id / teacher_id = teacher A |  |
| class B id |  | classes.id / teacher_id = teacher B |  |
| assignment A id |  | assignments.class_id = class A |  |
| assignment B id |  | assignments.class_id = class B |  |
| submission A id |  | submissions.student_id = student A | URL 테스트용 |
| submission B id |  | submissions.student_id = student B | URL 테스트용 |
| feedback A id |  | feedbacks.submission_id = submission A |  |
| feedback B id |  | feedbacks.submission_id = submission B |  |

---

## QA 실행 결과 누적 관리표

권한 테스트는 1회성으로 끝내지 않고, 배포 전마다 누적 기록합니다.

| 회차 | 날짜 | 환경 | Git commit | 테스트 범위 | 결과 | 주요 이슈 | 확인자 |
|---|---|---|---|---|---|---|---|
| 1차 |  | local |  | teacher/parent/student/admin | PASS / FAIL |  |  |
| 2차 |  | staging |  | teacher/parent/student/admin | PASS / FAIL |  |  |
| 3차 |  | production |  | smoke test | PASS / FAIL |  |  |

---

## 배포 보류 기준

아래 항목 중 하나라도 발생하면 배포를 보류합니다.

### High: 즉시 배포 보류

- [ ] teacher A가 teacher B 담당 반 제출물을 볼 수 있음
- [ ] teacher B가 teacher A 담당 반 제출물을 볼 수 있음
- [ ] parent A가 parent B 자녀 제출물 또는 feedback을 볼 수 있음
- [ ] parent B가 parent A 자녀 제출물 또는 feedback을 볼 수 있음
- [ ] student A가 student B의 과제/제출물을 볼 수 있음
- [ ] student B가 student A의 과제/제출물을 볼 수 있음
- [ ] 로그아웃 상태에서 보호 페이지 데이터가 노출됨
- [ ] 일반 사용자가 admin 관리 데이터를 볼 수 있음

### Medium: 수정 후 재검증 필요

- [ ] 접근 차단은 되지만 500 에러가 발생함
- [ ] 권한 없는 접근 시 화면은 막히지만 콘솔/네트워크 응답에 민감 데이터가 포함됨
- [ ] 정상 권한 사용자도 간헐적으로 접근 실패함
- [ ] parent 다자녀 화면에서 데이터 표시가 섞이거나 중복됨
- [ ] teacher dashboard 통계와 제출물 목록이 일치하지 않음

### Low: 다음 수정 주기에 반영 가능

- [ ] 차단 화면 문구가 불친절함
- [ ] 테스트 기록표의 설명이 부족함
- [ ] 빈 상태 메시지가 어색함
- [ ] 권한 문제는 아니지만 UI 정렬이 깨짐

---

## QA 완료 선언 조건

아래 조건을 모두 만족해야 권한 QA를 완료한 것으로 봅니다.

- [ ] teacher A/B 상호 직접 URL 변조 차단 PASS
- [ ] parent A/B 상호 자녀 데이터 접근 차단 PASS
- [ ] student A/B 상호 과제/제출 접근 차단 PASS
- [ ] admin 관리 화면 접근 PASS
- [ ] 로그아웃 상태 보호 페이지 접근 차단 PASS
- [ ] High 이슈 0개
- [ ] Medium 이슈가 있으면 수정 후 재검증 완료
- [ ] 테스트 결과 기록표 작성 완료
- [ ] 테스트에 사용한 Git commit 기록 완료
- [ ] 확인자 이름과 날짜 기록 완료

---

## 다음 단계

이 문서가 준비되면 다음 순서로 진행합니다.

1. Supabase에서 테스트 계정 7개 생성
2. `profiles`에 각 계정 role 입력
3. A/B 반 생성
4. teacher A/B를 각각 A/B 반에 연결
5. student A/B를 각각 A/B 반에 연결
6. parent A/B를 각각 student A/B와 연결
7. A/B 반 과제 생성
8. student A/B 제출물 생성
9. feedback A/B 생성
10. 실제 테스트 ID 기록표 작성
11. 권한 침투 테스트 실행
12. PASS/FAIL 기록
13. High 이슈가 없으면 다음 단계 진행

사전 구조 점검 SQL은 `docs/supabase_preflight_check.sql.md`를 참고하세요.
