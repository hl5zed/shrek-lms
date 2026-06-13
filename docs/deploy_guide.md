# 원클릭 배포 설정 가이드

> **목표:** `.\deploy.ps1` 한 번 실행 → GitHub push → OCI 자동 배포

---

## 전체 흐름

```
노트북에서 코드 수정
       ↓
.\deploy.ps1 실행
       ↓
GitHub (main 브랜치)
       ↓
GitHub Actions 자동 실행
       ↓
OCI 서버: git pull → npm build → PM2 재시작
```

---

## 1단계: OCI 서버 초기 설정 (최초 1회)

### 1-1. OCI 서버에 SSH 접속
```bash
ssh opc@<OCI_공인IP>
```

### 1-2. Node.js / PM2 설치 (없으면)
```bash
# Node.js 18 설치 (Amazon Linux / Oracle Linux)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Ubuntu인 경우
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs

# PM2 설치 (프로세스 매니저)
sudo npm install -g pm2
```

### 1-3. 프로젝트 클론
```bash
cd /home/opc          # 또는 원하는 디렉토리
git clone https://github.com/hl5zend/shrek-lms.git
cd shrek-lms
npm ci
npm run build
pm2 start npm --name "shrek-lms" -- start
pm2 save
pm2 startup            # 서버 재시작 시 자동 실행 설정
```

### 1-4. .env.local 파일 생성 (Supabase 키 등)
```bash
nano /home/opc/shrek-lms/.env.local
# Supabase URL, ANON_KEY 등 환경변수 입력 후 저장
```

---

## 2단계: GitHub Actions Secrets 등록

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret 이름     | 값 예시                          | 설명                          |
|----------------|----------------------------------|-------------------------------|
| `OCI_HOST`     | `140.238.xxx.xxx`                | OCI 서버 공인 IP              |
| `OCI_USER`     | `opc`                            | SSH 접속 사용자명             |
| `OCI_SSH_KEY`  | *(아래 참고)*                    | SSH 개인키 전체 내용          |
| `OCI_PORT`     | `22`                             | SSH 포트 (기본값 22)          |
| `OCI_APP_DIR`  | `/home/opc/shrek-lms`            | 서버의 프로젝트 경로          |

### SSH 키 생성 (로컬 노트북에서)
```powershell
# PowerShell에서 실행
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/oci_deploy
# 비밀번호 없이 Enter 두 번

# 공개키 → OCI 서버의 authorized_keys에 추가
Get-Content ~/.ssh/oci_deploy.pub
# 위 출력을 OCI 서버의 ~/.ssh/authorized_keys에 붙여넣기

# 개인키 → GitHub Secret (OCI_SSH_KEY)에 등록
Get-Content ~/.ssh/oci_deploy
# 위 출력 전체를 OCI_SSH_KEY에 붙여넣기
```

---

## 3단계: 일상적인 배포 사용법

### PowerShell에서 실행
```powershell
# 프로젝트 폴더에서
.\deploy.ps1

# 커밋 메시지 직접 지정
.\deploy.ps1 "feat: 강사 피드백 화면 수정"
```

### 처음 실행 시 스크립트 권한 허용 (1회)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 배포 상태 확인

- **GitHub Actions 로그:** https://github.com/hl5zend/shrek-lms/actions
- **OCI 서버 로그:** `pm2 logs shrek-lms`
- **서버 상태 확인:** `pm2 status`

---

## 문제 해결

| 증상 | 원인 | 해결 |
|------|------|------|
| `git push` 실패 | GitHub 인증 없음 | `git config credential.helper store` 후 재시도 |
| Actions 실패 - SSH 연결 오류 | OCI 방화벽 | OCI 보안 목록에서 포트 22 허용 확인 |
| Actions 실패 - build 오류 | .env.local 누락 | OCI 서버에 `.env.local` 파일 생성 |
| PM2 재시작 안 됨 | 앱 이름 불일치 | `pm2 list`로 이름 확인 후 `deploy.yml`의 `shrek-lms` 수정 |
