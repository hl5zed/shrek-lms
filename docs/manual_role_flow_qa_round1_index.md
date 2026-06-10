# Manual Role Flow QA Round 1 Index

Shrek-LMS 역할별 수동 QA Round 1 수행/기록 문서를 한 번에 관리하기 위한 인덱스입니다.

---

## 1) 문서 맵

| 문서 | 목적 | 사용 시점 |
| --- | --- | --- |
| `docs/manual_role_flow_qa_checklist.md` | 전체 역할별 수동 점검 기준(마스터 체크리스트) | QA 시작 전 기준 확인 |
| `docs/manual_role_flow_qa_log_round1.md` | Round 1 공식 실행 로그/판정 문서 | QA 실행 중/종료 후 |
| `docs/manual_role_flow_qa_log_round1_runbook.md` | 빠른 실행 절차(한 장 가이드) | QA 실행 직전 |
| `docs/manual_role_flow_qa_top10_quickcheck.md` | 시간 대비 리스크 Top 10 빠른 점검 | 스모크/1차 선별 점검 |
| `docs/manual_role_flow_qa_issue_report_round1.md` | Round 1 FAIL/BLOCKED 이슈 상세 보고서 | 이슈 분석/우선순위 산정 시 |

---

## 2) 권장 실행 순서

1. `docs/manual_role_flow_qa_top10_quickcheck.md`로 Top 10 우선 점검
2. `docs/manual_role_flow_qa_log_round1.md`에 Quick 결과 반영
3. `docs/manual_role_flow_qa_log_round1_runbook.md` 순서대로 전체 수동 QA 실행
4. `FAIL/BLOCKED` 항목을 `docs/manual_role_flow_qa_issue_report_round1.md`에 상세 기록
5. `docs/manual_role_flow_qa_log_round1.md` 최종 판정 및 결론 확정
6. 필요 시 `docs/manual_role_flow_qa_checklist.md` 항목으로 누락 범위 보강

---

## 3) 결과 반영 규칙 (요약)

- 결과 값은 `PASS`, `FAIL`, `BLOCKED`만 사용
- `FAIL`은 반드시 `manual_role_flow_qa_log_round1.md`의 이슈 목록에 등록
- `FAIL/BLOCKED` 상세는 `manual_role_flow_qa_issue_report_round1.md`에 별도 기록
- `BLOCKED`는 사유를 메모에 구체적으로 기록
- 최종 결론은 공식 로그(`manual_role_flow_qa_log_round1.md`) 기준으로만 확정

---

## 4) Round 1 완료 체크

| 항목 | 상태 |
| --- | --- |
| Top 10 Quick Check 완료 |  |
| 역할별 전체 수동 QA 완료 |  |
| 이슈 목록 정리 완료 |  |
| 이슈 상세 보고서 작성 완료 |  |
| 최종 판정/결론 확정 |  |
| 후속 조치 항목 도출 |  |

---

## 5) 후속 단계 템플릿

Round 1 결과:
- PASS / FAIL / BLOCKED

핵심 이슈:
- 

다음 액션:
- 

---

## 6) 즉시 실행 체크 (Start -> Done)

아래 체크를 위에서 아래 순서로 진행하면 Round 1을 실제로 마무리할 수 있습니다.

- [ ] `docs/manual_role_flow_qa_top10_quickcheck.md` 실행 정보/ID 기입표 먼저 작성
- [ ] Top 10 Quick Check 실행 후 결과(PASS/FAIL/BLOCKED) 전부 입력
- [ ] Quick `FAIL/BLOCKED`를 `docs/manual_role_flow_qa_log_round1.md`에 반영
- [ ] `docs/manual_role_flow_qa_log_round1_runbook.md` 순서대로 전체 역할 수동 QA 실행
- [ ] 전체 수동 QA 결과를 `docs/manual_role_flow_qa_log_round1.md` 섹션 3~11에 반영
- [ ] `FAIL/BLOCKED` 상세를 `docs/manual_role_flow_qa_issue_report_round1.md`에 기록
- [ ] `docs/manual_role_flow_qa_log_round1.md` 섹션 12 결론 확정
- [ ] 본 인덱스 섹션 4 완료 체크 표 갱신

완료 정의:
- 공식 로그 문서(`manual_role_flow_qa_log_round1.md`)에 빈 결과 셀이 없어야 합니다.
- `FAIL` 항목은 이슈 보고서에 모두 연결되어야 합니다.

