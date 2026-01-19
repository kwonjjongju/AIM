# 배포 설계
## 업무 개선 보드 시스템

---

## 1. 배포 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         Docker Host                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Nginx (Port 80/443)                   │   │
│  │                     - SSL Termination                     │   │
│  │                     - Reverse Proxy                       │   │
│  │                     - Static Files                        │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           │               │               │                     │
│           ▼               ▼               ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Frontend   │  │   Backend   │  │   Backend   │             │
│  │   (React)   │  │  (Node.js)  │  │  (Node.js)  │             │
│  │   :3000     │  │    :4000    │  │    :4001    │             │
│  └─────────────┘  └──────┬──────┘  └──────┬──────┘             │
│                          │                │                     │
│                          └────────┬───────┘                     │
│                                   │                             │
│                     ┌─────────────┼─────────────┐               │
│                     │             │             │               │
│                     ▼             ▼             ▼               │
│              ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│              │PostgreSQL│  │  Redis   │  │  Uploads │          │
│              │  :5432   │  │  :6379   │  │  Volume  │          │
│              └──────────┘  └──────────┘  └──────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Docker Compose 설정

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - frontend_build:/usr/share/nginx/html
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    volumes:
      - frontend_build:/app/dist
    environment:
      - VITE_API_URL=/api
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DATABASE_URL=postgresql://user:pass@db:5432/improvement_board
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRES_IN=1h
      - REFRESH_TOKEN_EXPIRES_IN=7d
    depends_on:
      - db
      - redis
    volumes:
      - uploads:/app/uploads
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=improvement_board
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:
  frontend_build:
```

---

## 3. Dockerfile

### 3.1 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate

EXPOSE 4000
CMD ["node", "dist/index.js"]
```

---

## 4. Nginx 설정

```nginx
# nginx/nginx.conf
upstream backend {
    server backend:4000;
}

server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name localhost;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # Frontend
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    client_max_body_size 10M;
}
```

---

## 5. 환경 변수

### 5.1 Backend 환경변수

```bash
# .env.production
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@db:5432/improvement_board

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=<secure-random-string-min-32-chars>
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://improvement-board.company.com

# File Upload
FILE_UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760
```

### 5.2 Frontend 환경변수

```bash
# .env.production
VITE_API_URL=/api
VITE_APP_NAME=업무 개선 보드
```

---

## 6. 배포 절차

### 6.1 초기 배포

```bash
# 1. 소스 클론
git clone <repository> improvement-board
cd improvement-board

# 2. 환경변수 설정
cp .env.example .env
# .env 파일 수정

# 3. SSL 인증서 준비
mkdir -p nginx/ssl
# cert.pem, key.pem 복사

# 4. Docker 빌드 및 실행
docker-compose build
docker-compose up -d

# 5. DB 마이그레이션
docker-compose exec backend npx prisma migrate deploy

# 6. 초기 데이터 시딩 (선택)
docker-compose exec backend npx prisma db seed
```

### 6.2 업데이트 배포

```bash
# 1. 소스 업데이트
git pull origin main

# 2. 재빌드 및 재시작
docker-compose build
docker-compose up -d

# 3. DB 마이그레이션 (필요 시)
docker-compose exec backend npx prisma migrate deploy
```

---

## 7. 모니터링 및 로깅

### 7.1 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend

# 최근 100줄
docker-compose logs --tail=100 backend
```

### 7.2 헬스체크

```typescript
// backend: /api/v1/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 8. 백업 전략

### 8.1 데이터베이스 백업

```bash
# 백업 스크립트 (cron 일 1회)
#!/bin/bash
DATE=$(date +%Y%m%d)
docker-compose exec -T db pg_dump -U user improvement_board > backup_$DATE.sql

# 7일 이상 된 백업 삭제
find /backups -name "backup_*.sql" -mtime +7 -delete
```

### 8.2 파일 백업

```bash
# 업로드 파일 백업
docker cp improvement-board_backend_1:/app/uploads ./uploads_backup_$DATE
```

---

## 9. 스케일링

### 9.1 수평 확장

```yaml
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 2
```

```bash
docker-compose up -d --scale backend=2
```

### 9.2 부하 분산

Nginx upstream에서 자동 로드 밸런싱 (라운드 로빈)

---

**문서 버전**: 1.0  
**작성일**: 2026-01-19
