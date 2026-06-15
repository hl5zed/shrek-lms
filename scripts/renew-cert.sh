#!/bin/bash
# 도메인을 구매하고 A 레코드를 213.35.124.213으로 설정한 뒤 실행
# 사용법: sudo bash scripts/renew-cert.sh 도메인명
DOMAIN=$1
if [ -z "$DOMAIN" ]; then
  echo "사용법: sudo bash scripts/renew-cert.sh 도메인명"
  exit 1
fi

apt-get install -y certbot python3-certbot-nginx

# nginx.conf의 server_name을 도메인으로 교체
sed -i "s/213.35.124.213/$DOMAIN/g" /etc/nginx/sites-available/shrek-lms

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"
systemctl restart nginx

echo "완료: https://$DOMAIN 에서 신뢰된 HTTPS 인증서로 서빙됩니다."
