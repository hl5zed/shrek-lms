# RLS 정책 감사 보고서

## 1. 한 줄 결론

현재 RLS 정책은 기본 보호 골격은 있으나, **`feedback_comments`/`lectures`의 로그인 사용자 조회 정책은 High 위험 후보**, `assignments`/`classes`/`submissions`/`feedbacks`의 한글·영문 정책 혼재는 **중복 정리 후보**로 분류되며, **삭제/정리 전 수동 권한 테스트가 반드시 필요**합니다.

---

## 2. 테이블별 정책 상태

아래 분류는 현재 정책 상세 조회 결과를 기준으로 정리한 감사 관점입니다.  
(`유지` / `중복` / `위험` / `보강 필요`)

| 테이블 | 현재 상태 | 분류 | 비고 |
| --- | --- | --- | --- |
| `profiles` | 역할 기반 접근 제어 중심 | 유지 | 기본 골격 유지 가능 |
| `classes` | 정책 세트가 한글/영문 네이밍으로 혼재 가능 | 중복 | 동등 의미 정책 정리 필요 |
| `class_students` | 역할별 제한 정책 존재 | 유지 | 정리 대상 아님(우선순위 낮음) |
| `parent_students` | parent-child 관계 정책 존재 | 유지 | 정리 대상 아님(우선순위 낮음) |
| `assignments` | 한글/영문 정책 혼재 가능 | 중복 | 중복 정리 후보(삭제 전 검증 필수) |
| `submissions` | 한글/영문 정책 혼재 가능 | 중복 | 중복 정리 후보(삭제 전 검증 필수) |
| `feedbacks` | 한글/영문 정책 혼재 가능 | 중복 | 중복 정리 후보(삭제 전 검증 필수) |
| `feedback_comments` | 로그인 사용자 조회 계열 정책 존재 시 범위 과다 가능 | 위험 | **High 위험 후보** |
| `lectures` | 로그인 사용자 조회 계열 정책 존재 시 범위 과다 가능 | 위험 | **High 위험 후보** |
| `courses` | 정책/사용 흐름 연계 점검 필요 | 보강 필요 | 실제 사용 범위 기준 보강 |
| `lessons` | 정책/사용 흐름 연계 점검 필요 | 보강 필요 | 실제 사용 범위 기준 보강 |
| `enrollments` | 정책/사용 흐름 연계 점검 필요 | 보강 필요 | 실제 사용 범위 기준 보강 |

---

## 3. High 위험 후보

다음 정책군은 즉시 삭제가 아니라 **위험 후보로 먼저 고정**하고, 테스트 후 정리합니다.

- `feedback_comments`: 로그인 사용자 조회(예: "로그인 사용자면 조회 가능") 계열
  - 위험 사유: 제출물/첨삭 소유권 체인 없이 열리면 타인 첨삭 코멘트 노출 가능
  - 조치 원칙: `feedback_comments -> feedbacks -> submissions -> student/parent/teacher ownership` 체인으로 제한
- `lectures`: 로그인 사용자 조회 계열
  - 위험 사유: 반 소속/담당 교사 검증 누락 시 타 반 강의 메타 노출 가능
  - 조치 원칙: `lectures.class_id` 기준으로 `classes.teacher_id` 또는 `class_students.student_id`/`parent_students` 체인 제한

주의: **아직 정책 삭제 SQL은 작성/실행하지 않습니다.**

---

## 4. Medium 보강 후보

- `courses` / `lessons` / `enrollments`
  - 앱 실제 사용 범위와 정책 범위가 정확히 일치하는지 재검증 필요
  - "읽기만 허용" 대상과 "작성 허용" 대상을 역할별로 명확히 분리 필요
- `profiles`
  - self-read / admin-all 외에 teacher/parent 파생 조회가 있다면 최소화 필요
- `class_students` / `parent_students`
  - 조회 허용은 유지하되, 불필요한 update/insert 권한 확장 여부 점검 필요

---

## 5. 중복 정리 후보

다음 테이블은 **한글/영문 정책이 기능적으로 중복**될 가능성이 높아 정리 후보로 분류합니다.

- `assignments`
- `classes`
- `submissions`
- `feedbacks`

정리 원칙:

1. 동일 `cmd` + 동일 조건의 정책은 1개 표준 정책으로 수렴
2. 정책명 네이밍 규칙 통일 (`table: role action scope` 형태 권장)
3. 중복 제거는 단계적으로 진행 (한 번에 대량 삭제 금지)
4. **정리 전/후 동일 테스트 세트로 회귀 검증**

중요: 본 단계에서는 **삭제 SQL을 작성하지 않습니다.**

---

## 6. 삭제 전 반드시 해야 할 테스트

정리 전 수동 테스트 필요(필수):

- teacher A/B 상호 URL 변조 차단
- parent A/B 상호 자녀 데이터 접근 차단
- student A/B 상호 과제/제출 접근 차단
- admin 관리 화면 접근 및 데이터 조회 확인
- 로그아웃 상태 보호 페이지 접근 차단
- 네트워크 응답에 민감 데이터가 포함되지 않는지 확인

테스트 문서:

- `docs/test_checklist.md`
- `docs/manual_permission_test_guide.md`

---

## 7. 다음 단계 제안

1. 정책 상세 조회 결과를 정책명/테이블/명령(cmd) 기준으로 스냅샷 저장
2. High 위험 후보(`feedback_comments`, `lectures`)를 우선 차단 설계안으로 별도 문서화
3. 중복 후보 4개 테이블(`assignments`, `classes`, `submissions`, `feedbacks`)에 대해
   - 표준 정책안 1차 작성
   - "정리 전 테스트" 실행
4. 테스트 PASS 후에만 정책 정리(삭제/병합) SQL 초안 작성
5. 정리 SQL 적용은 staging -> 재검증 -> production 순서로 진행

앱 화면별 실제 의존 관계는 `docs/rls_app_dependency_map.md`를 참고하세요.
콘텐츠 공개 범위 기준은 `docs/content_access_policy.md`를 참고하세요.
대체 정책 설계안은 `docs/rls_replacement_plan.md`를 참고하세요.
`feedback_comments` 실사용 최종 감사는 `docs/feedback_comments_usage_audit.md`를 참고하세요.

---

## 8. RLS 정책 정리 우선순위 매트릭스

| 우선순위 | 테이블 | 정책/이슈 | 위험도 | 영향 범위 | 수정 난이도 | 검증 비용 | 권장 조치 |
| ---- | --- | ----- | --- | ----- | ------ | ----- | ----- |
| 1 | `feedback_comments` | `feedback_comments: 로그인 사용자 조회` | High | teacher/student/parent 전체 첨삭 코멘트 노출 가능성 | 중 | 높음 | 즉시 삭제하지 말고 실제 사용 화면 확인 후 역할별 제한 정책 대체 검토 |
| 2 | `lectures` | `lectures: 로그인 사용자 조회` | High (또는 Medium-High) | 반별 강의/자료 메타가 타 반에 노출될 가능성 | 중 | 높음 | 강의 공개 범위(전체/반별) 정책 확정 후, 반별 제한이면 제거 후보로 분류하고 대체 정책 검토 |
| 3 | `feedbacks` | `feedbacks: teacher INSERT`, `feedbacks: teacher UPDATE`, `teacher_own_feedbacks` | Medium | 교사 첨삭 생성/수정 권한 경계 | 중 | 중 | `submission -> assignment -> class -> teacher_id` 체인 검증을 RLS/앱 코드 양쪽에서 확인 |
| 4 | `courses`, `lessons` | `courses: 로그인 사용자 조회`, `lessons: 로그인 사용자 조회` | Medium | 커리큘럼/수업 자료 노출 범위 | 중 | 중 | 공개형/수강제한형 정책 먼저 결정, 제한형이면 `enrollments` 기준으로 정책 보강 검토 |
| 5 | `assignments`, `classes`, `submissions`, `feedbacks`, `parent_students`, `profiles` | 한글/영문 중복 정책 혼재 | Low~Medium | 운영/디버깅 혼란, 정책 추적 난이도 증가 | 중 | 중 | 정상 동작 확인 후 단일 정책 체계로 통합, 삭제 전 역할별 수동 테스트 필수 |

---

## 9. 정책 정리 전 필수 확인 질문

- [ ] `feedback_comments`는 실제 화면에서 어디에 사용되는가?
- [ ] 학생이 feedback_comments를 직접 보는 기능이 있는가?
- [ ] 학부모가 feedback_comments를 직접 보는 기능이 있는가?
- [ ] 교사는 담당 반 submission의 댓글만 보면 되는가?
- [ ] `lectures`는 전체 로그인 사용자 공개 자료인가, 반별 제한 자료인가?
- [ ] `courses`와 `lessons`는 전체 공개 커리큘럼인가, 수강생 제한 자료인가?
- [ ] 중복 정책 중 현재 앱이 실제로 의존하는 정책은 무엇인가?
- [ ] 정책 삭제 전 teacher/parent/student/admin 수동 테스트를 완료했는가?
- [ ] 정책 삭제 후 롤백할 수 있는 백업 SQL 또는 스냅샷이 있는가?

---

## 10. 정책 정리 권장 순서

1. 현재 정책 목록 백업
2. local 또는 staging에서 수동 QA 실행
3. `feedback_comments` 실제 사용 화면 확인
4. `lectures` 공개 범위 정책 결정
5. High 위험 정책부터 대체 정책 설계
6. 대체 정책 문서화
7. 삭제 후보 정책을 별도 목록화
8. 삭제 SQL은 별도 문서에서 작성
9. 삭제 전 재검토
10. 삭제 후 teacher/parent/student/admin 권한 테스트 재실행

---

## 11. 이번 단계 완료 기준

- [ ] 정책 정리 우선순위 매트릭스 작성
- [ ] High 위험 후보 1순위/2순위 명시
- [ ] Medium 보강 후보 명시
- [ ] 중복 정리 후보 명시
- [ ] 정리 전 확인 질문 추가
- [ ] 정책 정리 권장 순서 추가
- [ ] 삭제 SQL은 작성하지 않음
