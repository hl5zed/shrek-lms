# RLS 대체 정책 설계안

## 1. 한 줄 결론

RLS 정리는 넓게 열린 로그인 사용자 조회 정책을 바로 삭제하지 않고, 실제 사용 화면과 제품 정책을 확인한 뒤 lectures는 `class_id` 기반 제한 정책으로, feedback_comments는 실사용 여부 확인 후 submissions 관계 기반 제한 정책으로 전환하는 방향이 안전하다.

---

## 2. 대체 대상 정책 요약

| 우선순위 | 테이블 | 현재 정책 | 현재 위험 | 대체 방향 | 실행 시점 |
| ---- | --- | ----- | ----- | ----- | ----- |
| 1 | `lectures` | `lectures: 로그인 사용자 조회` | High | `class_id` 기반 역할/소속 제한으로 전환 | 제품 정책(특히 parent 열람) 확정 직후 |
| 2 | `feedback_comments` | `feedback_comments: 로그인 사용자 조회` | High | 실사용 확인 후 `submission` 관계 기반 제한으로 전환 | 실사용 여부 확정 후 |
| 3 | `feedbacks` | `feedbacks: teacher INSERT` | Medium | `teacher_id = auth.uid()` + 담당 반 submission 체인 검증 강화 | lectures 정책 정리 직후 |
| 4 | `feedbacks` | `feedbacks: teacher UPDATE` | Medium | INSERT와 동일하게 담당 반 체인 포함 검증 | lectures 정책 정리 직후 |
| 5 | `feedbacks` | `teacher_own_feedbacks` | Medium | teacher 소유 + 담당 반 범위로 정합성 강화 | feedbacks 정책군 통합 시 |
| 6 | `courses` | `courses: 로그인 사용자 조회` | Medium / Policy Pending | 공개형(A안) 유지 또는 수강 제한형(B안) 결정 후 반영 | 제품 정책 확정 후 |
| 7 | `lessons` | `lessons: 로그인 사용자 조회` | Medium / Policy Pending | courses 정책 연동(공개형 또는 enrollments 제한형) | 제품 정책 확정 후 |

---

## 3. lectures 대체 정책 설계

현재 정책:

```txt
lectures: 로그인 사용자 조회
USING: auth.uid() IS NOT NULL
```

문제:

- 모든 로그인 사용자가 모든 lectures를 볼 가능성이 있음
- `lectures.class_id`가 있는데 반별 제한이 약해짐
- `video_url`, `material_url`이 포함되어 있어 반별 수업 자료라면 노출 위험이 있음

권장 대체 방향:

| 역할 | 권장 접근 |
| ------- | -------------------------------------- |
| admin | 전체 lectures 조회/관리 |
| teacher | 본인 담당 반 lectures 조회/생성/수정 |
| student | 본인 소속 반 lectures 조회 |
| parent | 제품 정책에 따라 자녀 소속 반 lectures 조회 허용 또는 차단 |

정책 논리(설계 문장):

```txt
teacher:
lectures.class_id가 classes.teacher_id = auth.uid()인 class_id에 포함될 때 허용

student:
lectures.class_id가 class_students.student_id = auth.uid()인 class_id에 포함될 때 허용

parent:
lectures.class_id가 parent_students로 연결된 자녀의 class_students.class_id에 포함될 때 허용
단, 학부모 열람 허용 여부는 제품 정책으로 먼저 확정
```

정리 전 확인 질문:

- 학부모가 lectures를 볼 필요가 있는가?
- lectures의 `video_url`, `material_url`은 민감 자료인가?
- 학생 화면에서 lectures를 어떤 경로로 조회하는가?
- 교사 화면에서 lectures를 생성/수정하는가?
- lectures가 없는 반/학생의 빈 상태 처리는 정상인가?

---

## 4. feedback_comments 대체 정책 설계

현재 정책:

```txt
feedback_comments: 로그인 사용자 조회
USING: auth.uid() IS NOT NULL
```

문제:

- 로그인 사용자 전체가 모든 feedback_comments를 볼 수 있을 가능성이 있음
- 실제 앱 코드에서 직접 사용은 현재 미검출
- 향후 댓글 기능이 활성화되면 권한 누수 위험이 큼
- 실제 컬럼 구조는 `submission_id`, `teacher_id` 기준임

권장 대체 방향:

| 역할 | 권장 접근 |
| ------- | ------------------------ |
| admin | 전체 조회 |
| teacher | 담당 반 submission 댓글 조회/작성 |
| student | 본인 submission 댓글 조회 |
| parent | 자녀 submission 댓글 조회 |

정책 논리(설계 문장):

```txt
teacher:
feedback_comments.submission_id
→ submissions.assignment_id
→ assignments.class_id
→ classes.teacher_id = auth.uid()

student:
feedback_comments.submission_id
→ submissions.student_id = auth.uid()

parent:
feedback_comments.submission_id
→ submissions.student_id가 parent_students에서 parent_id = auth.uid()인 자녀
```

정리 전략:

- 앱에서 실사용이 없으면 staging에서 넓은 조회 정책 제거 후보로 분류
- 단, production 직접 삭제 금지
- 삭제 전 UI/API/RPC 전체 grep 확인
- 향후 댓글 기능을 사용할 계획이면 위 관계 기반 정책으로 대체

---

## 5. feedbacks teacher INSERT/UPDATE 보강 설계

현재 문제:

```txt
feedbacks: teacher INSERT
feedbacks: teacher UPDATE
teacher_own_feedbacks
```

현재 조건은 주로 다음 기준입니다.

```txt
teacher_id = auth.uid()
```

보강이 필요한 이유:

- 교사가 자기 `teacher_id`만 넣으면 되는 구조라면 담당 반 submission 검증이 약할 수 있음
- 더 안전한 조건은 `teacher_id = auth.uid()`와 담당 반 submission 검증을 함께 확인하는 것

권장 대체 방향:

```txt
teacher_id = auth.uid()
AND feedbacks.submission_id가 본인 담당 반 학생의 submission이어야 함
```

관계 체인:

```txt
feedbacks.submission_id
→ submissions.assignment_id
→ assignments.class_id
→ classes.teacher_id = auth.uid()
```

추가 확인:

- feedback 생성 액션에서 이미 동일 체인을 검증하는지 확인
- feedback 수정 액션에서 동일 체인을 검증하는지 확인
- RLS의 WITH CHECK 조건에도 이 체인을 반영할지 검토

---

## 6. courses / lessons 정책 방향

### courses

현재 정책:

```txt
courses: 로그인 사용자 조회
```

현재 권장:

- 초기 단계에서는 공개 커리큘럼 정보로 유지 가능
- 단, 실제 수강 제한 콘텐츠가 들어가면 enrollments 기준 제한 필요

정책 방향:

```txt
A안: 로그인 사용자 전체 조회 유지
B안: enrollments 기준 수강생 제한
```

현재 추천:

```txt
초기 단계에서는 courses는 공개형 유지 가능
```

### lessons

현재 정책:

```txt
lessons: 로그인 사용자 조회
```

현재 권장:

- 단순 차시 제목/설명만 있다면 공개형 유지 가능
- 실제 영상/자료/수업 콘텐츠가 들어가면 제한형 전환 필요

정책 방향:

```txt
A안: course 공개 범위와 동일하게 공개
B안: enrollments 기준 제한
```

현재 추천:

```txt
lessons가 실제 영상/자료를 포함한다면 enrollments 기준 제한형 전환 준비
```

---

## 7. staging 적용 전 준비 체크리스트

- [ ] 현재 production RLS 정책 목록 백업
- [ ] 현재 staging/local RLS 정책 목록 백업
- [ ] 테스트 계정 준비: admin, teacher A/B, student A/B, parent A/B
- [ ] A/B 반, 과제, 제출물, feedback 데이터 준비
- [ ] lectures A/B 데이터 준비
- [ ] parent가 lectures를 볼지 제품 정책 확정
- [ ] feedback_comments 실사용 여부 최종 확인
- [ ] `docs/manual_permission_test_guide.md` 기준 권한 QA 준비
- [ ] 롤백 기준 합의

---

## 8. staging 정책 교체 권장 순서

1. 현재 정책 목록 백업
2. 기존 상태에서 권한 QA 1회 실행
3. `lectures` 대체 정책 초안 작성
4. staging에서 `lectures: 로그인 사용자 조회` 대체 테스트
5. teacher/student/parent/admin lectures 접근 테스트
6. `feedback_comments` 실사용 여부 최종 확인
7. 실사용이 없으면 staging에서 넓은 조회 정책 제거 테스트
8. 실사용이 있으면 submissions 관계 기반 대체 정책 테스트
9. `feedbacks` teacher INSERT/UPDATE 보강 테스트
10. 전체 권한 QA 재실행
11. High 이슈 0개일 때만 production 반영 검토

---

## 9. 롤백 기준

정책 교체 후 아래 문제가 발생하면 즉시 롤백 대상으로 기록합니다.

- 정상 학생이 본인 반 lectures를 못 봄
- 정상 교사가 담당 반 lectures를 못 봄
- 학부모 허용 정책인 경우 자녀 반 lectures를 못 봄
- 교사가 담당 학생 feedback을 생성/수정하지 못함
- student가 본인 feedback을 못 봄
- parent가 자녀 feedback을 못 봄
- admin 관리 화면에서 필요한 데이터 조회가 막힘
- 권한 없는 사용자가 타인 데이터를 볼 수 있음
- 500 에러가 발생하거나 정상 페이지 렌더링이 깨짐

---

## 10. 검증 시나리오

| 역할 | 테스트 항목 | 기대 결과 |
| ---------- | ------------------------- | --------------- |
| admin | lectures 전체 조회 | 허용 |
| teacher A | A반 lectures 조회 | 허용 |
| teacher A | B반 lectures 조회 | 차단 |
| student A | A반 lectures 조회 | 허용 |
| student A | B반 lectures 조회 | 차단 |
| parent A | student A 반 lectures 조회 | 제품 정책에 따라 허용/차단 |
| parent A | student B 반 lectures 조회 | 차단 |
| teacher A | A반 submission feedback 생성 | 허용 |
| teacher A | B반 submission feedback 생성 | 차단 |
| student A | 본인 feedback 조회 | 허용 |
| parent A | 자녀 feedback 조회 | 허용 |
| logged-out | 보호 페이지 접근 | 차단 |

---

## 11. 아직 작성하지 말아야 할 것

- 실제 `DROP POLICY` SQL 작성 금지
- 실제 `CREATE POLICY` SQL 작성 금지
- production 직접 실행 금지
- 테스트 전 중복 정책 삭제 금지
- 검증 전 `로그인 사용자 조회` 정책 임의 삭제 금지

---

## 12. 다음 단계

1. `lectures` 사용 화면을 기준으로 class ownership 코드 검증
2. `feedback_comments` 실사용 여부 최종 grep/API/RPC 확인
3. staging용 RLS 교체 SQL 초안 별도 문서 작성
4. staging에서만 정책 교체 테스트
5. QA PASS 후 production 반영 검토

lectures 코드 레벨 소유권 감사 결과는 `docs/lectures_ownership_audit.md`를 참고하세요.
`feedback_comments` 실사용 최종 감사 결과는 `docs/feedback_comments_usage_audit.md`를 참고하세요.

---

## 13. 완료 기준

- [x] `docs/rls_replacement_plan.md` 생성
- [x] lectures 대체 정책 방향 포함
- [x] feedback_comments 대체 정책 방향 포함
- [x] feedbacks INSERT/UPDATE 보강 방향 포함
- [x] courses/lessons 정책 방향 포함
- [x] staging 적용 순서 포함
- [x] 롤백 기준 포함
- [x] 검증 시나리오 포함
- [x] 실제 SQL 미작성
- [x] 앱 코드 미수정

---

## 14. Round 2 RLS 정리 계획 (성능/정합성 통합)

Round 1에서 feedback 저장 timeout(57014) 이슈를 해결했지만, 페이지 로딩 1~3초 구간의 추가 개선 여지가 확인되었습니다.
Round 2에서는 아래 테이블을 동일 원칙으로 정리합니다.

대상 테이블:

- `assignments`
- `classes`
- `class_students`
- `parent_students`
- `lectures`
- `feedback_comments`

정리 원칙:

1. 신·구 중복 정책 제거
2. 교차 테이블 체인 검증은 SECURITY DEFINER 헬퍼 함수 기반으로 통일
3. 역할 경계(admin/teacher/student/parent)를 기능 요구 기준으로 재검증
4. 성능 지표(Planning Time, SubPlan 개수, 요청 p95)를 함께 기록

특기 교체 항목:

- 과허용 정책 `lectures: admin/teacher INSERT`를 class ownership 검증 포함 정책으로 교체

목표:

- 권한 정합성 유지
- 정책 중복 제거
- 페이지 로딩/저장 성능 추가 안정화 (체감 1~3초 개선 여지 반영)
