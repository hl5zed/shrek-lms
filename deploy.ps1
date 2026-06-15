# UTF-8 인코딩 설정 (한글 깨짐 방지)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# deploy.ps1 — 논술마루 LMS 원클릭 배포 스크립트
# 사용법: PowerShell에서 .\deploy.ps1 또는 .\deploy.ps1 "커밋 메시지"

param(
    [string]$Message = ""
)

# 색상 출력 함수
function Write-Step($text) { Write-Host "`n▶ $text" -ForegroundColor Cyan }
function Write-OK($text)   { Write-Host "  ✓ $text" -ForegroundColor Green }
function Write-Fail($text) { Write-Host "  ✗ $text" -ForegroundColor Red; exit 1 }

Set-Location $PSScriptRoot

# 1. 변경 파일 확인
Write-Step "변경 파일 확인"
$status = git status --short
if (-not $status) {
    Write-Host "  변경 사항 없음. 배포 종료." -ForegroundColor Yellow
    exit 0
}
Write-Host $status

# 2. 커밋 메시지 결정
if (-not $Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Message = Read-Host "`n커밋 메시지 (Enter 시 '$timestamp' 사용)"
    if (-not $Message) { $Message = $timestamp }
}

# 3. git add
Write-Step "git add -A"
git add -A
if ($LASTEXITCODE -ne 0) { Write-Fail "git add 실패" }
Write-OK "전체 변경사항 스테이징 완료"

# 4. git commit
Write-Step "git commit"
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Fail "git commit 실패" }
Write-OK "커밋 완료: $Message"

# 5. git push
Write-Step "git push → GitHub"
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  main 브랜치 push 실패. 현재 브랜치로 재시도..." -ForegroundColor Yellow
    $branch = git rev-parse --abbrev-ref HEAD
    git push origin $branch
    if ($LASTEXITCODE -ne 0) { Write-Fail "git push 실패" }
}
Write-OK "GitHub push 완료"

# 6. 완료
Write-Host "`n✅ 배포 트리거 완료!" -ForegroundColor Green
Write-Host "   GitHub Actions가 OCI 서버에 자동 배포합니다." -ForegroundColor Gray
Write-Host "   진행 상황: https://github.com/hl5zend/shrek-lms/actions" -ForegroundColor Gray
