# Deployment Guide

## Overview

| Service | Platform | Method |
|---------|----------|--------|
| Frontend (React SPA) | Vercel | Git push → auto-deploy |
| Backend (FastAPI) | Railway | Dockerfile build |
| Database | Neon PostgreSQL | Managed connection string |
| Media Storage | Cloudinary | API keys |
| CI/CD | GitHub Actions | Automated tests + deploy |

---

## Prerequisites

- GitHub account with repository write access
- Vercel account (Hobby tier is sufficient)
- Railway account (free tier includes $5 credit)
- Neon account (free tier includes 0.5GB storage)
- Cloudinary account (free tier includes 25GB storage)

---

## 1. Environment Variables

### Backend (`backend/.env`)

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@ep-xxx.us-east-2.aws.neon.tech/project_gym?sslmode=require
DATABASE_URL_SYNC=postgresql+psycopg2://user:password@ep-xxx.us-east-2.aws.neon.tech/project_gym?sslmode=require

# JWT (generate with: python -c "import secrets; print(secrets.token_urlsafe(64))")
JWT_SECRET_KEY=<64-char-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudinary (from Cloudinary Dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
APP_NAME=Project GYM
APP_ENV=production
DEBUG=false
CORS_ORIGINS=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Email (for password reset — Gmail App Password recommended)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=your-email@gmail.com

# Sentry (optional — for error tracking)
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api/v1
VITE_APP_NAME=Project GYM
```

> **Important**: Set these as **GitHub Actions secrets** and **Railway/Vercel environment variables**, never commit them to the repository.

---

## 2. Database Setup (Neon)

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project (choose the nearest region)
3. Copy the connection string from the dashboard:
   ```
   postgresql+asyncpg://user:password@ep-xxx.us-east-2.aws.neon.tech/project_gym?sslmode=require
   ```
4. Run migrations:
   ```bash
   cd backend
   alembic upgrade head
   ```
5. Create the admin user (run once):
   ```bash
   python scripts/seed_admin.py
   ```

---

## 3. Backend Deployment (Railway)

### Option A: Railway Dashboard (Manual)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select the repository root
4. Railway auto-detects `backend/railway.json` and `backend/Dockerfile`
5. Add environment variables in Railway Dashboard → Variables
6. Deploy

### Option B: Railway CLI (Automated)

```bash
npm install -g @railway/cli
railway login
railway init
railway up --service backend
```

### Railway Configuration

The `backend/railway.json` specifies:
- Builder: Dockerfile (uses `backend/Dockerfile`)
- Health check: `/health` endpoint
- Restart: on failure, max 3 retries

### Backend Health Check

Railway pings `/health` every 10 seconds. The endpoint returns:
```json
{ "status": "ok", "app": "Project GYM", "environment": "production" }
```

---

## 4. Frontend Deployment (Vercel)

### Option A: Vercel Dashboard (Manual)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import GitHub repo
3. Framework preset: Vite
4. Root directory: `frontend`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Add environment variables:
   - `VITE_API_BASE_URL` → your Railway backend URL
8. Deploy

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
cd frontend
vercel --prod
```

### SPA Routing

The frontend uses client-side routing via React Router. All non-API routes are rewritten to `index.html`.

### Custom Domain

1. Go to Vercel Dashboard → Project → Domains
2. Add your domain (e.g., `projectgym.com`)
3. Update DNS nameservers to point to Vercel

---

## 5. CI/CD (GitHub Actions)

The workflows run on every push/PR to `main`:

| Job | Triggers | Description |
|-----|----------|-------------|
| `frontend-ci` | Any push/PR | npm ci → lint → build |
| `backend-ci` | Any push/PR | pip install → pytest |
| `docker` | Any push/PR | Verify both Docker images build |
| `deploy-frontend` | Push to main only | Deploy to Vercel |
| `deploy-backend` | Push to main only | Deploy to Railway |

### Required GitHub Secrets

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `VERCEL_TOKEN` | Vercel API token | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel org ID | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Dashboard → Project → Settings |
| `RAILWAY_TOKEN` | Railway API token | Railway Dashboard → Settings → Tokens |
| `RAILWAY_PROJECT_ID` | Railway project ID | Railway Dashboard → Project → Settings |

### Adding Secrets

```bash
gh secret set VERCEL_TOKEN --body "your-token-here"
gh secret set VERCEL_ORG_ID --body "your-org-id"
gh secret set VERCEL_PROJECT_ID --body "your-project-id"
gh secret set RAILWAY_TOKEN --body "your-token"
gh secret set RAILWAY_PROJECT_ID --body "your-project-id"
```

---

## 6. Cloudinary Setup

1. Create a Cloudinary account
2. From Dashboard, copy:
   - Cloud name (`CLOUDINARY_CLOUD_NAME`)
   - API Key (`CLOUDINARY_API_KEY`)
   - API Secret (`CLOUDINARY_API_SECRET`)
3. Create unsigned upload presets for public galleries

---

## 7. Docker (Local Production Simulation)

### Build & Run

```bash
# Build all services
docker compose build

# Start with PostgreSQL
docker compose up -d db
# Wait for health check, then:
docker compose up -d backend frontend

# View logs
docker compose logs -f
```

### Production-Like Test

```bash
# Set env vars for production
$env:APP_ENV="production"
docker compose up --build
```

The frontend will be available at `http://localhost`, backend at `http://localhost:8000`.

### Multi-Stage Build

The backend Dockerfile uses multi-stage builds:
1. **Builder stage**: installs build dependencies (gcc, libpq-dev), compiles Python packages
2. **Runtime stage**: copies only compiled packages, runs as non-root `appuser`

---

## 8. Post-Deployment Checklist

- [ ] Backend health check returns `200 OK` at `/health`
- [ ] Frontend loads without console errors
- [ ] Database migrations have run (`alembic upgrade head`)
- [ ] Admin user exists (`python scripts/seed_admin.py`)
- [ ] CORS origins set correctly (no `localhost` in production)
- [ ] `JWT_SECRET_KEY` is a strong random value
- [ ] Debug/docs endpoints disabled in production (`/docs`, `/redoc`)
- [ ] SSL/TLS enabled (automatic with Vercel + Railway)
- [ ] Rate limiting active
- [ ] Sentry DSN configured (if using error tracking)
- [ ] Custom domain DNS propagated (if using custom domain)

---

## 9. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Backend returns 500 on startup | DB not migrated | Run `alembic upgrade head` |
| Frontend shows white screen | Vite build failed / env vars missing | Check Vercel deploy logs |
| CORS errors in browser | `CORS_ORIGINS` doesn't include frontend URL | Update env var and redeploy |
| Auth tokens not working | `JWT_SECRET_KEY` changed | Use same key across all deploys |
| Images not uploading | Cloudinary credentials wrong | Verify in Cloudinary Dashboard |
| Emails not sending | Resend API key wrong | Verify in Resend Dashboard |
| Rate limiting too aggressive | Default limit too low | Adjust in `rate_limiter.py` |

---

## 10. Backup & Recovery

### Database Backups (Neon)

Neon provides automatic daily backups with 7-day retention. For manual backup:

```bash
pg_dump --no-owner --no-acl "postgresql://user:password@ep-xxx.neon.tech/project_gym" > backup_$(date +%Y%m%d).sql
```

### Restore

```bash
psql "postgresql://user:password@ep-xxx.neon.tech/project_gym" < backup_20250101.sql
```

---

## 11. Monitoring

- **Vercel Analytics**: Built-in for frontend performance
- **Railway Metrics**: CPU, memory, network for backend
- **Sentry**: Error tracking (if configured)
- **Neon Dashboard**: DB connections, query performance, storage
