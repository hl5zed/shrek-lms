# Staging 적용 체크리스트 (실행 담당자용)

이 문서는 lectures RLS 대체 정책을 **staging에서만** 검증하기 위한 실행 순서 체크리스트입니다.

> ⚠️ production 직접 실행 금지  
> ⚠️ 현재 정책 백업 없이 실행 금지  
> ⚠️ 롤백 SQL 없이 실행 금지

---

## 1) 실행 전 준비

- [ ] 대상 환경이 staging인지 확인
- [ ] 실행 담당자/검증 담당자/승인 담당자 지정
- [ ] `docs/staging_lectures_rls_sql_draft.md` 최신본 확인
- [ ] `docs/manual_permission_test_guide.md` 최신본 확인
- [ ] 테스트 계정 7종(admin/teacher A/B/student A/B/parent A/B) 로그인 가능 확인
- [ ] A/B 반, 과제, 제출물, feedback 데이터 준비 확인
- [ ] parent lectures 정책(허용/비허용) 결정 상태 확인

---

## 2) 백업 및 기준선 확보

- [ ] SQL Editor에서 lectures 정책 목록 조회
- [ ] 조회 결과를 문서/스크린샷으로 저장
- [ ] 저장 위치 기록 (예: 내부 위키/티켓/PR 코멘트)
- [ ] 기존 상태에서 권한 QA 1회 실행
  - [ ] teacher A/B lectures 교차 접근
  - [ ] student A/B lectures 교차 접근
  - [ ] admin 전체 조회
  - [ ] parent 접근(정책에 따라 차단 또는 허용) 확인

---

## 3) 정책 교체 실행 (staging only)

- [ ] 대체 정책 SQL 초안 재검토 (중복/충돌 정책명 확인)
- [ ] 대체 정책 생성
- [ ] `lectures: 로그인 사용자 조회` 정책 제거(초안 기준)
- [ ] 실행 쿼리/결과 로그 저장

---

## 4) 적용 후 권한 QA

- [ ] admin: 모든 lectures 조회 허용
- [ ] teacher A: A반 lectures 조회 허용
- [ ] teacher A: B반 lectures 조회 차단
- [ ] teacher A: A반 lecture 생성 허용
- [ ] teacher A: B반 class_id 생성 차단
- [ ] student A: A반 lectures 조회 허용
- [ ] student A: B반 lectures 조회 차단
- [ ] parent A: 제품 정책 기준대로 동작(허용 또는 차단)
- [ ] logged-out: 보호 페이지 차단

---

## 5) 실패 시 즉시 롤백

아래 중 1개라도 발생하면 롤백:

- [ ] 정상 teacher/student가 본인 반 lectures를 못 봄
- [ ] 권한 없는 사용자가 타 반 lectures를 봄
- [ ] lecture 생성 권한 경계가 깨짐
- [ ] admin 조회가 비정상 차단됨
- [ ] 500 에러 또는 주요 페이지 렌더링 실패

롤백 후:

- [ ] 롤백 SQL 실행 로그 저장
- [ ] 재검증 결과 기록
- [ ] 이슈 심각도(High/Medium/Low) 분류

---

## 6) 완료/승인 조건

- [ ] High 이슈 0건
- [ ] Medium 이슈 재검증 완료 또는 처리 계획 확정
- [ ] QA 결과표 PASS/FAIL 기록 완료
- [ ] 실행 SQL/결과 스냅샷 첨부 완료
- [ ] 승인 담당자 확인 완료
- [ ] production 반영 여부 결정 문서화 완료

---

## 7) 참고 문서

- `docs/staging_lectures_rls_sql_draft.md`
- `docs/rls_replacement_plan.md`
- `docs/lectures_ownership_audit.md`
- `docs/manual_permission_test_guide.md`
- `docs/test_checklist.md`
