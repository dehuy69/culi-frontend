# Docker Deployment Guide

Hướng dẫn deploy Culi Frontend sử dụng Docker.

## Quick Start

### Option 1: Chạy Frontend riêng (standalone)

```bash
cd culi-frontend

# Build và chạy
docker-compose up -d

# Frontend sẽ chạy tại: http://localhost:8080
```

**Lưu ý**: Nếu backend chạy trên host (không phải Docker), cần set `BACKEND_HOST`:

```bash
# Linux
BACKEND_HOST=host.docker.internal docker-compose up -d

# Hoặc sửa trong docker-compose.yml
```

### Option 2: Chạy Full Stack (Frontend + Backend)

```bash
cd culi

# Chạy cả frontend và backend
docker-compose -f docker-compose.full.yml up -d

# Frontend: http://localhost:8080
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Environment Variables

### Frontend Standalone

Tạo file `.env` trong `culi-frontend/`:

```env
# API Base URL - để trống để dùng relative paths (/api)
VITE_API_BASE_URL=

# Backend host cho nginx proxy (nếu backend không trong Docker)
BACKEND_HOST=host.docker.internal
BACKEND_PORT=8000
```

### Full Stack

Không cần cấu hình thêm, nginx sẽ tự động proxy `/api` đến backend service.

## Build Options

### Build với custom API URL

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t culi-frontend .
```

### Build production

```bash
docker-compose build
```

## Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild và restart
docker-compose up -d --build

# Remove volumes (cleanup)
docker-compose down -v
```

## Troubleshooting

### Frontend không kết nối được backend

1. **Kiểm tra backend đang chạy:**
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

2. **Kiểm tra nginx config:**
   ```bash
   docker exec culi-frontend cat /etc/nginx/conf.d/default.conf
   ```

3. **Xem nginx logs:**
   ```bash
   docker logs culi-frontend
   ```

### CORS errors

Đảm bảo backend CORS config cho phép origin của frontend:

```python
# In backend app/main.py
allow_origins=["http://localhost:8080", "https://yourdomain.com"]
```

## Production Deployment

Cho production, nên:

1. **Sử dụng reverse proxy (Nginx/Traefik)** ở ngoài Docker để:
   - Handle SSL/TLS
   - Serve cả frontend và backend trên cùng domain
   - Load balancing

2. **Build với production optimizations:**
   ```bash
   npm run build  # Minified, optimized
   ```

3. **Set proper environment variables:**
   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```

4. **Use health checks:**
   ```yaml
   healthcheck:
     test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

