#!/bin/bash
set -e

echo "=== 1. nginx 설치 ==="
apt-get update -y
apt-get install -y nginx openssl

echo "=== 2. 자체 서명 SSL 인증서 생성 (1년) ==="
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out    /etc/nginx/ssl/selfsigned.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=ShrekLMS/OU=Dev/CN=213.35.124.213"

echo "=== 3. nginx 설정 복사 ==="
cp nginx/nginx.conf /etc/nginx/sites-available/shrek-lms
ln -sf /etc/nginx/sites-available/shrek-lms /etc/nginx/sites-enabled/shrek-lms
# 기본 설정 충돌 방지
rm -f /etc/nginx/sites-enabled/default

echo "=== 4. nginx 설정 검증 및 재시작 ==="
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "=== 완료 ==="
echo "https://213.35.124.213 으로 접속하세요."
echo "브라우저에서 '고급 → 계속 진행'을 클릭하면 접속됩니다."
echo "(자체 서명 인증서라 브라우저 경고가 한 번 표시됩니다)"
echo ""
echo "★ 완전한 HTTPS를 위해서는 도메인 구매 후 아래를 실행하세요:"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d 도메인명"
