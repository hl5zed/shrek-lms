# Manual Role Flow QA Issue Report - Round 1

Round 1 수동 QA에서 발견된 이슈를 일관된 형식으로 기록하기 위한 템플릿입니다.

참조 문서:
- `docs/manual_role_flow_qa_top10_quickcheck.md`
- `docs/manual_role_flow_qa_log_round1.md`
- `docs/manual_role_flow_qa_log_round1_runbook.md`

---

## 1) 기본 정보

- 보고일: 2026-06-12
- 보고자: Cursor AI
- 테스트 회차: Round 1
- 브랜치: main
- 커밋 해시: 17ee03f
- 실행 환경(OS/Browser): Windows 10 / Playwright Chromium

---

## 2) 이슈 목록 (요약)

| 이슈 ID | 심각도(High/Medium/Low) | 역할 | 화면/경로 | 상태(Open/In Progress/Resolved) | 비고 |
| --- | --- | --- | --- | --- | --- |
| R1-001 | Medium | admin | `/admin/feedback` | Open | 페이지 404로 핵심 검증 차단 |

이슈 ID 규칙:
- Round 1: `R1-001`, `R1-002`, ...

---

## 3) 이슈 상세 템플릿

### [이슈 ID] R1-001

- 심각도: Medium
- 역할: admin
- 화면/경로: `/admin/feedback`
- 관련 항목(Quick 번호 또는 로그 섹션): staging baseline playwright (RLS 적용 전 기준선)

#### 문제 내용
- admin 로그인 후 `/admin/feedback` 진입 시 기대한 "첨삭 관리" 화면 대신 404 페이지가 노출됩니다.

#### 재현 절차
1. `admin@test.com` 계정으로 로그인
2. `/admin/feedback` 경로로 이동
3. 헤더 "첨삭 관리" 표시 여부 확인

#### 기대 결과
- `/admin/feedback`에서 첨삭 관리 화면이 정상 렌더링되어야 합니다.

#### 실제 결과
- 404 페이지(`This page could not be found.`)가 표시됩니다.

#### 영향 범위
- admin 기준선 QA에서 feedback 관리 화면 검증이 불가합니다.
- RLS 적용 전 baseline 판정이 BLOCKED 됩니다.

#### 임시 우회 방법(있으면)
- 없음 (해당 라우트 정상화 필요)

#### 원인 추정
- 배포 환경 코드/라우팅 상태와 현재 테스트 기대 라우트 간 불일치
- 또는 배포 아티팩트에 `/admin/feedback` 경로 누락

#### 조치 제안
- 배포된 staging 앱에서 `/admin/feedback` 라우트 존재 여부 점검
- middleware/redirect 규칙으로 404로 우회되는지 점검
- 라우트 정상화 후 baseline 스펙 재실행

#### 처리 상태
- Open

#### 검증 결과
- FAIL

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
| High 건수 | 0 |
| Medium 건수 | 1 |
| Low 건수 | 0 |
| Open 건수 | 1 |
| Resolved 건수 | 0 |
| 재검증 필요 건수 | 1 |

결론:
- BLOCKED

다음 단계:
- `/admin/feedback` 404 원인 수정 후 baseline QA 재실행

