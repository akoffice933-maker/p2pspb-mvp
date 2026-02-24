# HTTPS Deployment Guide

## Вариант 1: Nginx + Let's Encrypt (рекомендуется)

### 1. Установка Nginx

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

### 2. Настройка Nginx как reverse proxy

```nginx
# /etc/nginx/sites-available/p2pspb
server {
    listen 80;
    server_name p2pspb.com www.p2pspb.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name p2pspb.com www.p2pspb.com api.p2pspb.com;

    # SSL certificates (will be created by certbot)
    ssl_certificate /etc/letsencrypt/live/p2pspb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/p2pspb.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /trades {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Включение сайта

```bash
sudo ln -s /etc/nginx/sites-available/p2pspb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Установка SSL сертификата (Let's Encrypt)

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d p2pspb.com -d www.p2pspb.com -d api.p2pspb.com

# Автоматическое продление (проверка)
sudo certbot renew --dry-run
```

### 5. Автоматическое продление

Certbot автоматически создаёт cron job для продления.
Проверка:

```bash
sudo systemctl status certbot.timer
```

---

## Вариант 2: Caddy (автоматический HTTPS)

Caddy автоматически получает и обновляет SSL сертификаты.

### 1. Установка Caddy

```bash
# Ubuntu/Debian
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 2. Настройка Caddyfile

```caddyfile
# /etc/caddy/Caddyfile
p2pspb.com, www.p2pspb.com {
    reverse_proxy localhost:3000
    
    @api {
        path /api/*
    }
    reverse_proxy @api localhost:4000
    
    @websocket {
        path /trades/*
    }
    reverse_proxy @websocket localhost:4000
}

api.p2pspb.com {
    reverse_proxy localhost:4000
}
```

### 3. Запуск

```bash
sudo systemctl reload caddy
```

Caddy автоматически получит SSL сертификаты!

---

## Вариант 3: Docker + Nginx Proxy Manager

Для Docker-развёртываний.

### 1. Docker Compose с Nginx

```yaml
version: '3.8'

services:
  nginx-proxy:
    image: jc21/nginx-proxy-manager:latest
    ports:
      - "80:80"
      - "443:443"
      - "81:81" # Admin UI
    volumes:
      - nginx-proxy-data:/data
      - nginx-proxy-letsencrypt:/etc/letsencrypt
    restart: unless-stopped

  api:
    # ... ваш api сервис

  web:
    # ... ваш web сервис

volumes:
  nginx-proxy-data:
  nginx-proxy-letsencrypt:
```

### 2. Настройка через Web UI

1. Откройте http://your-server-ip:81
2. Логин: `admin@example.com`
3. Пароль: `changeme`
4. Добавьте Proxy Host через UI

---

## Проверка HTTPS

```bash
# Проверка редиректа HTTP → HTTPS
curl -I http://p2pspb.com

# Проверка SSL
curl -I https://p2pspb.com

# Проверка заголовков безопасности
curl -I https://p2pspb.com | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options)"
```

---

## Production Checklist

- [ ] HTTPS настроен и работает
- [ ] HTTP автоматически редиректит на HTTPS
- [ ] SSL сертификаты продлеваются автоматически
- [ ] Security headers присутствуют
- [ ] WebSocket работает через WSS
- [ ] API доступно только через HTTPS
- [ ] Firewall настроен (только 80, 443, 22)

---

## Firewall настройка

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Проверка
sudo ufw status
```

---

## Troubleshooting

### SSL не продлевается
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

### Nginx не запускается
```bash
sudo nginx -t
sudo journalctl -u nginx -f
```

### WebSocket не работает
Проверьте заголовки Upgrade в Nginx конфиге.
