# feedback_comments 실사용 여부 감사 보고서

## 1. 한 줄 결론

```txt
B. 현재 앱에서 직접 실사용 미검출
```

현재 코드 기준으로 `feedback_comments` 테이블에 대한 직접 조회/저장 호출은 확인되지 않았고, 첨삭 코멘트 기능은 `feedbacks.comment`를 통해 동작합니다.

---

## 2. 검색 범위

| 범위 | 확인 내용 | 결과 |
| --- | --- | --- |
| app/ | 페이지/Server Action 사용 여부 | `feedbacks` 사용은 다수 확인, `feedback_comments` 직접 사용 미검출 |
| components/ | UI 컴포넌트 사용 여부 | `comment` UI 텍스트는 존재, `feedback_comments` 연동 미검출 |
| lib/ | query/helper 사용 여부 | `feedbacks ( comment )` 조회 확인, `feedback_comments` 미검출 |
| src/ | legacy/helper 사용 여부 | `feedbacks` 기반 조회/매핑 확인, `feedback_comments` 미검출 |
| app/api/ | API Route 사용 여부 | `app/api` 경로/route 파일 미검출 (현재 API Route 없음) |
| docs/ | 문서 언급 여부 | 감사/정책 문서에서 `feedback_comments` 다수 언급 확인 |
| supabase/ | migration/seed/function 사용 여부 | 현재 migration 범위에서 `feedback_comments` 사용 미검출 |

---

## 3. 검색 결과 상세

| 파일 | 키워드 | 실제 사용 여부 | 비고 |
| --- | --- | --- | --- |
| `app/teacher/submissions/[id]/page.tsx` | `.from("feedbacks")`, `comment` | 실제 DB 사용 | 교사 첨삭 저장/조회는 `feedbacks` 사용 (`upsert`) |
| `app/parent/feedback/[submissionId]/page.tsx` | `.from("feedbacks")`, `feedback.comment` | 실제 DB 사용 | 학부모 상세 첨삭 표시도 `feedbacks.comment` 사용 |
| `app/parent/growth/page.tsx` | `.from("feedbacks")` | 실제 DB 사용 | 성장 화면 지표/첨삭 요약에 `feedbacks` 사용 |
| `src/lib/student/feedback.ts` | `.from("feedbacks")`, `comment` | 실제 DB 사용 | 학생 첨삭 목록/상세 helper가 `feedbacks` 조회 |
| `src/lib/student/assignments.ts` | `.from("feedbacks")` | 실제 DB 사용 | 과제-첨삭 연계 상태 계산 시 `feedbacks` 사용 |
| `src/lib/student/growth.ts` | `.from("feedbacks")` | 실제 DB 사용 | 성장 데이터 조합 시 `feedbacks` 사용 |
| `src/lib/student/portfolio.ts` | `.from("feedbacks")` | 실제 DB 사용 | 포트폴리오 집계에 `feedbacks` 사용 |
| `lib/lms/queries/students.ts` | `feedbacks ( comment )` | 실제 DB 사용 | 관리자 학생 최근 제출 요약에서 `feedbacks.comment` 사용 |
| `src/components/student/CommentBox.tsx` | `comment` | 일반 comment 텍스트 | UI 표시 컴포넌트, 테이블 직접 연동 없음 |
| `docs/rls_policy_audit.md` | `feedback_comments` | 타입/문서 언급 | 위험 후보 정책 설명 |
| `docs/rls_app_dependency_map.md` | `feedback_comments` | 타입/문서 언급 | 미사용 추정 및 후속 점검 항목 |
| `docs/content_access_policy.md` | `feedback_comments` | 타입/문서 언급 | 정책 방향 정의 |
| `docs/rls_replacement_plan.md` | `feedback_comments` | 타입/문서 언급 | 대체 정책 설계 초안 |
| `docs/manual_permission_test_guide.md` | `feedback_comments` | 타입/문서 언급 | QA 점검 항목 언급 |
| `docs/supabase_preflight_check.sql.md` | `feedback_comments` | 타입/문서 언급 | 사전 점검 SQL 항목 |
| `supabase/migrations/20260607193800_create_class_records.sql` | `teacher_id` 등 | 무관 | `feedback_comments`/`feedbacks` 직접 정의/사용 없음 |

구분 요약:
- 실제 DB 사용: `feedbacks` 테이블 중심
- 타입/문서 언급: `feedback_comments`는 문서에서만 확인
- 일반 comment 텍스트: UI 문구/필드명 수준
- 무관: `teacher_id`, `submission_id` 일반 관계 키워드 매치

---

## 4. 실제 사용 여부 판단

- `.from("feedback_comments")` 사용 여부
  - 코드(`app/`, `lib/`, `src/`, `components/`)에서 미검출
  - 문서(`docs/`) 내 설명 텍스트에서만 확인
- insert/update/delete/select 사용 여부
  - `feedback_comments` 대상 CRUD 패턴 미검출
  - 실제 첨삭 저장/조회는 `feedbacks` 테이블로 확인
- RPC나 API를 통한 간접 사용 여부
  - `rpc(` 호출 기반 `feedback_comments` 연계 미검출
  - `app/api` 경로 자체가 현재 코드베이스에 미구성 상태
- UI에서 댓글 기능 노출 여부
  - 댓글 UI는 존재하나 데이터 소스는 `feedbacks.comment`
  - `feedback_comments` 전용 UI/흐름은 미검출
- `feedbacks.comment`와 역할이 중복되는지 여부
  - 현재 앱 기능에서 “선생님 코멘트” 역할은 `feedbacks.comment`가 수행
  - `feedback_comments`는 현재 기능 관점에서 중복 또는 미활성 테이블로 판단 가능

---

## 5. RLS 정리 영향도

```txt
A. 미사용이므로 staging에서 넓은 조회 정책 제거 테스트 가능
```

판단 이유:
- 실제 런타임 코드 경로에서 `feedback_comments` 직접 사용이 확인되지 않음
- 현재 사용자 기능(teacher/student/parent/admin 첨삭 코멘트)은 `feedbacks.comment`로 이미 동작
- 따라서 `feedback_comments: 로그인 사용자 조회` 정책은 staging에서 우선 제거/축소 테스트 대상으로 분류 가능

---

## 6. 권장 조치

```txt
feedback_comments는 현재 앱 직접 사용이 확인되지 않으므로,
staging에서 `feedback_comments: 로그인 사용자 조회` 정책 제거 테스트 대상으로 분류한다.
단, production에서는 전체 QA PASS 전 삭제하지 않는다.
```

---

## 7. 다음 단계

1. 감사 결과가 미사용이므로 `feedback_comments` staging 정책 정리 SQL 초안 문서를 작성한다.
2. 정리 SQL은 즉시 실행하지 않고, 기존 정책 백업/롤백 절차를 먼저 문서에 포함한다.
3. QA 체크리스트에 `feedbacks.comment` 회귀 확인(teacher 작성, student/parent 조회)을 명시한다.
4. 어떤 경우에도 production에서 즉시 정책 삭제는 금지한다.
