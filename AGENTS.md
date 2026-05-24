# <!-- BEGIN:nextjs-agent-rules -->

# \# This is NOT the Next.js you know

# 

# This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node\_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# <!-- END:nextjs-agent-rules -->



# 

# AGENTS.md — 논술마루 LMS AI 작업 규칙

이 파일은 Cursor AI가 모든 작업에서 반드시 참고해야 하는 전체 규칙입니다.
코딩 요청 시 이 파일을 항상 먼저 읽고 원칙을 지켜주세요.

\---

## 프로젝트 개요

* 서비스명: 논술마루 LMS
* 목적: 논술 학원의 강의·과제·첨삭·성장관리를 체계화하는 웹 시스템
* 사용자: 관리자 / 강사 / 학생 / 학부모 (4개 역할)

\---

## 기술 스택

* Frontend: Next.js 14 App Router / TypeScript / Tailwind CSS
* Backend: Supabase (Auth + PostgreSQL + Storage)
* 배포: Vercel
* 영상: YouTube / Vimeo / Bunny Stream URL 등록 방식 (자체 업로드 없음)

\---

## 절대 원칙 (위반 금지)

1. 기존 기능을 깨지 않는다
2. 전체 파일을 재작성하지 않는다 — 필요한 부분만 최소 수정
3. 한 번에 하나의 기능, 하나의 파일만 수정한다
4. 수정 전 반드시 영향받는 파일 목록을 먼저 알려준다
5. DB 스키마를 임의로 변경하지 않는다 → database\_schema.md 참고
6. RLS 정책을 임의로 변경하거나 비활성화하지 않는다 → rls\_policy.md 참고
7. service\_role key를 클라이언트(브라우저) 코드에 절대 사용하지 않는다
8. 학생 개인정보(이름, 학교, 전화번호 등)를 AI API로 전송하지 않는다
9. package.json 의존성을 무단으로 변경하지 않는다
10. 모든 주요 코드에 한글 주석을 작성한다

\---

## 완료 기준

모든 작업은 아래 기준을 충족해야 완료로 간주합니다.

* npm run build 통과
* 역할별 테스트 계정으로 실제 동작 확인
* 다른 역할의 데이터가 노출되지 않음 (RLS 검증)

\---

## 요청 형식 (이 형식으로만 요청할 것)

```
수정 파일:
src/app/...

목표:
무엇을 만들거나 고칠지 설명

작업:
1. ...
2. ...

유지할 기존 기능:
- ...

수정 금지:
- DB schema 변경 금지
- RLS 정책 변경 금지
- package.json 변경 금지

완료 기준:
1. ...
2. npm run build 통과
```

\---

## 참고 문서 목록

|파일|내용|
|-|-|
|docs/prd.md|제품 기획 및 MVP 범위|
|docs/database\_schema.md|DB 테이블 전체 구조|
|docs/roles\_permissions.md|역할별 권한 범위|
|docs/rls\_policy.md|Supabase RLS 정책|
|docs/ui\_flow.md|화면 흐름 및 라우팅|
|docs/test\_checklist.md|역할별 테스트 체크리스트|



