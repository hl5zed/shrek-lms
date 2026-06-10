# Manual Role Flow QA Issue Report - Round 1

Round 1 수동 QA에서 발견된 이슈를 일관된 형식으로 기록하기 위한 템플릿입니다.

참조 문서:
- `docs/manual_role_flow_qa_top10_quickcheck.md`
- `docs/manual_role_flow_qa_log_round1.md`
- `docs/manual_role_flow_qa_log_round1_runbook.md`

---

## 1) 기본 정보

- 보고일:
- 보고자:
- 테스트 회차: Round 1
- 브랜치:
- 커밋 해시:
- 실행 환경(OS/Browser):

---

## 2) 이슈 목록 (요약)

| 이슈 ID | 심각도(High/Medium/Low) | 역할 | 화면/경로 | 상태(Open/In Progress/Resolved) | 비고 |
| --- | --- | --- | --- | --- | --- |
| R1-001 |  |  |  | Open |  |

이슈 ID 규칙:
- Round 1: `R1-001`, `R1-002`, ...

---

## 3) 이슈 상세 템플릿

아래 블록을 이슈 수만큼 복사해서 작성합니다.

```md
### [이슈 ID] R1-001

- 심각도:
- 역할:
- 화면/경로:
- 관련 항목(Quick 번호 또는 로그 섹션):

#### 문제 내용
- 

#### 재현 절차
1.
2.
3.

#### 기대 결과
- 

#### 실제 결과
- 

#### 영향 범위
- 

#### 임시 우회 방법(있으면)
- 

#### 원인 추정
- 

#### 조치 제안
- 

#### 처리 상태
- Open / In Progress / Resolved

#### 검증 결과
- PASS / FAIL / BLOCKED
```

---

## 4) 심각도 분류 기준

- High
  - 권한 우회, 타 사용자 데이터 노출, 보호 라우트 우회
- Medium
  - 핵심 흐름 실패(로그인, redirect, 주요 상세 진입), 주요 예외 안내 누락
- Low
  - 문구 오탈자, 경미한 UI/UX 불일치, 사용자 혼란 가능성이 낮은 이슈

---

## 5) 처리 우선순위 가이드

1. High 이슈 즉시 우선 처리
2. Medium 이슈는 재현성 높은 순서로 처리
3. Low 이슈는 문구/정합성 묶음으로 일괄 처리

---

## 6) Round 1 이슈 종합 결론

| 항목 | 값 |
| --- | --- |
| High 건수 |  |
| Medium 건수 |  |
| Low 건수 |  |
| Open 건수 |  |
| Resolved 건수 |  |
| 재검증 필요 건수 |  |

결론:
- PASS / FAIL / BLOCKED

다음 단계:
- 

