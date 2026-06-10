# Round 1 Staging RLS 정책 백업

## 0. 기본 정보

* 날짜: `2026-06-10`
* 시간대: `UTC+7`
* 환경: `staging`
* production 접근 여부: `접근하지 않음`
* 실행자:
* 검증자:
* 백업 시작 시각:
* 백업 완료 시각:

---

## 1. 백업 목적

Round 1 staging RLS 테스트 전, `lectures`와 `feedback_comments` 테이블의 기존 RLS 정책 상태를 기록한다.

이 문서는 테스트 실패 또는 High 이슈 발생 시 rollback 기준 자료로 사용한다.

---

## 2. 백업 대상 테이블

* `public.lectures`
* `public.feedback_comments`

---

## 3. 정책 조회 SQL

아래 SQL을 staging Supabase SQL Editor에서 실행한다.

```sql
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('lectures', 'feedback_comments')
order by tablename, policyname;
```

---

## 4. 전체 정책 조회 결과

> 아래 영역에 SQL 실행 결과를 그대로 붙여 넣는다.

```csv
schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
public,feedback_comments,feedback_comments: admin 전체,PERMISSIVE,{public},SELECT,(get_my_role() = 'admin'::text),null
public,feedback_comments,feedback_comments: 로그인 사용자 조회,PERMISSIVE,{public},SELECT,(auth.uid() IS NOT NULL),null
public,lectures,admin_all_lectures,PERMISSIVE,{public},ALL,"(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",null
public,lectures,lectures: admin/teacher INSERT,PERMISSIVE,{public},INSERT,null,"(get_my_role() = ANY (ARRAY['admin'::text, 'teacher'::text]))"
public,lectures,lectures: 로그인 사용자 조회,PERMISSIVE,{public},SELECT,(auth.uid() IS NOT NULL),null
public,lectures,student_class_lectures,PERMISSIVE,{public},SELECT,"(EXISTS ( SELECT 1
   FROM class_students
  WHERE ((class_students.class_id = lectures.class_id) AND (class_students.student_id = auth.uid()))))",null
public,lectures,teacher_own_lectures,PERMISSIVE,{public},ALL,"(EXISTS ( SELECT 1
   FROM classes
  WHERE ((classes.id = lectures.class_id) AND (classes.teacher_id = auth.uid()))))",null
```

---

## 5. lectures 정책 백업

### 5-1. 백업 시각

* 조회 시각: `HH:MM (UTC+7)`

### 5-2. 기존 정책 목록

```csv
schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
public,lectures,admin_all_lectures,PERMISSIVE,{public},ALL,"(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text))))",null
public,lectures,lectures: admin/teacher INSERT,PERMISSIVE,{public},INSERT,null,"(get_my_role() = ANY (ARRAY['admin'::text, 'teacher'::text]))"
public,lectures,lectures: 로그인 사용자 조회,PERMISSIVE,{public},SELECT,(auth.uid() IS NOT NULL),null
public,lectures,student_class_lectures,PERMISSIVE,{public},SELECT,"(EXISTS ( SELECT 1
   FROM class_students
  WHERE ((class_students.class_id = lectures.class_id) AND (class_students.student_id = auth.uid()))))",null
public,lectures,teacher_own_lectures,PERMISSIVE,{public},ALL,"(EXISTS ( SELECT 1
   FROM classes
  WHERE ((classes.id = lectures.class_id) AND (classes.teacher_id = auth.uid()))))",null
```

### 5-3. 확인 사항

* [x] `lectures` 기존 정책이 조회됨
* [x] 정책명 확인 완료
* [x] `qual` 조건 확인 완료
* [x] `with_check` 조건 확인 완료
* [x] rollback 기준으로 사용할 수 있음

메모:

* `lectures: 로그인 사용자 조회` 정책이 확인됨.
* 해당 정책은 `(auth.uid() IS NOT NULL)` 조건으로 로그인 사용자 전체에게 `lectures` SELECT를 허용한다.
* Round 1 staging 테스트에서 제거/대체 검증할 High 후보 정책이다.

---

## 6. feedback_comments 정책 백업

### 6-1. 백업 시각

* 조회 시각: `HH:MM (UTC+7)`

### 6-2. 기존 정책 목록

```csv
schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
public,feedback_comments,feedback_comments: admin 전체,PERMISSIVE,{public},SELECT,(get_my_role() = 'admin'::text),null
public,feedback_comments,feedback_comments: 로그인 사용자 조회,PERMISSIVE,{public},SELECT,(auth.uid() IS NOT NULL),null
```

### 6-3. 확인 사항

* [x] `feedback_comments` 기존 정책이 조회됨
* [x] 정책명 확인 완료
* [x] `qual` 조건 확인 완료
* [x] `with_check` 조건 확인 완료
* [x] rollback 기준으로 사용할 수 있음

메모:

* `feedback_comments: 로그인 사용자 조회` 정책이 확인됨.
* 해당 정책은 `(auth.uid() IS NOT NULL)` 조건으로 로그인 사용자 전체에게 `feedback_comments` SELECT를 허용한다.
* 현재 앱은 `feedback_comments` 직접 사용이 미검출된 상태이며, Round 1 staging 테스트에서 제거 후 회귀 여부를 확인한다.

---

## 7. rollback 참고 정보

High 이슈 또는 회귀 오류 발생 시 아래 순서로 처리한다.

1. 즉시 테스트 중단
2. 발생 시각 기록
3. 관련 테이블/정책 기록
4. 기존 정책 백업 내용 확인
5. rollback SQL 실행
6. rollback 완료 시각 기록
7. 기준선 QA 재확인
8. Round 1 FAIL 판정 또는 Round 2 준비

---

## 8. 백업 완료 판정

* [x] `lectures` 정책 백업 완료
* [x] `feedback_comments` 정책 백업 완료
* [x] 백업 결과가 문서에 저장됨
* [x] rollback 기준 자료로 사용 가능함

최종 판정: `PASS`

메모:

* Round 1 staging RLS 실행 전 정책 백업 완료.
* 다음 단계는 기준선 QA 실행이다.

---

## 9. 절대 원칙

이 백업 문서는 staging Round 1 테스트용이다.

**production 정책 백업은 별도 production 전용 문서에서 다시 수행한다.**
