# Manual Role Flow QA Top 10 Quick Check

Round 1 수동 QA에서 시간 대비 리스크가 큰 항목만 빠르게 점검하는 1페이지 체크표입니다.

연계 문서:
- 상세 체크리스트: `docs/manual_role_flow_qa_checklist.md`
- 실행 로그: `docs/manual_role_flow_qa_log_round1.md`
- 실행 런북: `docs/manual_role_flow_qa_log_round1_runbook.md`

---

## 실행 정보

- 실행일: 2026-06-10
- 실행자: (입력 필요)
- 브랜치: `2026-06-10-03gr`
- 커밋 해시: `66d8a7e`
- 브라우저: (입력 필요)
- 서버 주소: `http://localhost:3000`

---

## 테스트 데이터 ID 기입표 (실행 전)

| 항목 | 실제 ID/값 | 비고 |
| --- | --- | --- |
| student A 계정 이메일 | `student@test.com` | `.env.local` 기준 |
| student B 계정 이메일 | (입력 필요) | student A와 다른 반/권한 |
| parent A 계정 이메일 | `parent@test.com` | `.env.local` 기준 |
| parent B(또는 비연결 학생) 기준 값 | (입력 필요) | parent A 기준 차단 테스트용 |
| teacher A 계정 이메일 | `teacher@test.com` | `.env.local` 기준 |
| teacher B 계정 이메일 | (입력 필요) | teacher A 기준 차단 대상 |
| assignment_of_student_a | (입력 필요) | student A 정상 접근용 |
| assignment_of_student_b | (입력 필요) | student A 차단 테스트용 |
| submission_of_student_a | (입력 필요) | parent A/teacher A 정상 접근용 |
| submission_of_student_b | (입력 필요) | student A/parent A/teacher A 차단 테스트용 |

작성 규칙:
- URL 테스트에 쓰는 값은 실행 전에 확정하고, 테스트 도중 변경하지 않습니다.
- 동일 Round에서는 같은 ID 세트를 유지해야 FAIL 재현성이 확보됩니다.

---

## Top 10 Quick Check

| 우선순위 | 점검 항목 | 결과(PASS/FAIL/BLOCKED) | 메모 |
| --- | --- | --- | --- |
| 1 | 로그아웃 상태에서 보호 라우트 접근 시 `/login` 이동 |  |  |
| 2 | 정상 로그인 시 역할별 화면으로 이동 |  |  |
| 3 | 학생이 다른 학생 과제/첨삭 URL 접근 시 차단 |  |  |
| 4 | 학부모가 비연결 학생 첨삭 URL 접근 시 차단 |  |  |
| 5 | 교사가 비담당 제출물 URL 접근 시 차단 |  |  |
| 6 | `/` 접속 시 `/login` 리다이렉트 |  |  |
| 7 | `/login` 서비스명/로그인 폼 정상 표시 |  |  |
| 8 | 학생 과제 상세 제출 이력/누락 안내 문구 표시 |  |  |
| 9 | 교사 제출 상세 fallback(답안/첨부/코멘트/점수) 표시 |  |  |
| 10 | 학부모 첨삭 상세 fallback/데이터 부족 안내 표시 |  |  |

---

## 이슈 기록 (Quick)

| 번호 | 심각도(High/Medium/Low) | 점검 항목 번호 | 문제 내용 | 재현 경로(URL/역할) | 처리 상태 |
| --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |

심각도 가이드:
- High: 권한 우회, 타 사용자 데이터 노출, 보호 라우트 우회
- Medium: 핵심 흐름 실패(로그인/redirect/상세 진입), 주요 안내 문구 누락
- Low: 문구/표현/경미한 UI 불일치

---

## Quick 판정

| 판정 항목 | 결과(PASS/FAIL/BLOCKED) | 메모 |
| --- | --- | --- |
| Top 10 중 High 이슈 0건 |  |  |
| Top 10 중 FAIL 0건 |  |  |
| Top 10 중 BLOCKED 사유 기록 완료 |  |  |
| Round 1 본 로그 반영 완료 |  |  |

Quick 결과:
- PASS / FAIL / BLOCKED

다음 조치:
- 

---

## 본 로그 반영 매핑 (실행 직후)

Quick Check 결과를 아래 기준으로 `docs/manual_role_flow_qa_log_round1.md`에 옮깁니다.

| Quick 항목 번호 | 본 로그 반영 위치 |
| --- | --- |
| 1 | 섹션 3 "로그아웃 후 보호 라우트 접근 시 `/login` 이동" + 섹션 9 마지막 행 |
| 2 | 섹션 3 "정상 로그인 시 역할별 화면으로 이동" |
| 3 | 섹션 9 "학생이 다른 학생 과제/첨삭 URL 접근..." |
| 4 | 섹션 9 "학부모가 연결되지 않은 학생 첨삭 URL 접근..." |
| 5 | 섹션 9 "교사가 담당하지 않는 제출물 URL 접근..." |
| 6 | 섹션 3 "`/` 접속 시 `/login`으로 이동" |
| 7 | 섹션 3 "`/login` 서비스명...", "이메일/비밀번호 입력창 표시" |
| 8 | 섹션 7 "제출 이력 영역 표시", "제출 기록 있으나 내용 비어 있을 때..." |
| 9 | 섹션 6 fallback 관련 4개 항목 |
| 10 | 섹션 8 fallback 관련 4개 항목 |

반영 규칙:
- Quick에서 `FAIL`이면 본 로그 섹션 10(발견 이슈 목록)에 반드시 추가합니다.
- Quick에서 `BLOCKED`이면 본 로그 메모에 사유를 그대로 복사합니다.
- Quick 결과가 `PASS`여도 본 로그의 최종 판정(섹션 11)은 전체 항목 기준으로 다시 확정합니다.

---

## URL 기반 실행 절차 (Top 10 상세)

아래 표의 순서대로 실행하면 Quick Check 10개 항목을 바로 검증할 수 있습니다.

| 번호 | 사전 로그인 역할 | 입력 URL(예시) | 기대 결과 |
| --- | --- | --- | --- |
| 1 | 비로그인 | `/student/dashboard` | `/login`으로 이동 |
| 2 | admin / teacher / student / parent | `/login` 후 로그인 | 각 역할 기본 화면으로 이동 |
| 3 | student A | `/student/assignments/{assignment_of_student_b}` | 차단 또는 안내 화면 표시 |
| 3 | student A | `/student/feedback/{submission_of_student_b}` | 차단 또는 안내 화면 표시 |
| 4 | parent A | `/parent/feedback/{submission_of_unlinked_student}` | 차단 또는 안내 화면 표시 |
| 5 | teacher A | `/teacher/submissions/{submission_of_teacher_b_class}` | 차단 또는 안내 화면 표시 |
| 6 | 비로그인 | `/` | `/login`으로 리다이렉트 |
| 7 | 비로그인 | `/login` | 서비스명/로그인 폼 정상 표시 |
| 8 | student | `/student/assignments/{assignment_id}` | 제출 이력 및 누락 안내 문구 정상 표시 |
| 9 | teacher | `/teacher/submissions/{submission_id}` | 답안/첨부/코멘트/점수 fallback 문구 정상 표시 |
| 10 | parent | `/parent/feedback/{submission_id}` | fallback/데이터 부족 안내 문구 정상 표시 |

실행 메모:
- `{...}` 값은 테스트 데이터의 실제 id로 교체합니다.
- 번호 3은 과제/첨삭 2개 URL 모두 확인해야 PASS로 처리합니다.
- 차단 결과가 404이든 안내 화면이든, 타 사용자 데이터가 노출되지 않으면 PASS 후보입니다.

---

## 실행 완료 체크

| 항목 | 값 |
| --- | --- |
| 실행 시작 시각 |  |
| 실행 종료 시각 |  |
| 총 소요 시간 |  |
| 실행자 |  |
| 결과 검토자 |  |
| Quick 최종 결과(PASS/FAIL/BLOCKED) |  |
| 후속 이슈 티켓/문서 링크 |  |

완료 기준:
- Top 10 모든 항목에 결과가 입력되어야 합니다.
- FAIL/BLOCKED 항목은 이슈 기록 또는 메모가 비어 있지 않아야 합니다.
- 본 로그(`docs/manual_role_flow_qa_log_round1.md`) 반영 여부를 확인해야 합니다.

