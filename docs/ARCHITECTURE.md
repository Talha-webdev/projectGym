# Architecture

## High-Level Architecture
```
Client (Browser)
     │
     │ HTTPS
     ▼
Nginx (Reverse Proxy / SSL Termination)
     │
     ├── /api/* ──────► FastAPI (Backend)
     │                       │
     │                       ├── PostgreSQL (Database)
     │                       └── Cloudinary (Media Storage)
     │
     └── /* ─────────► React SPA (Frontend)
                           └── Vite (Build Tool)
```

## Backend Architecture (Layered)
```
┌─────────────────────────────────────────────┐
│              API Layer (routes)              │
│  auth / users / videos / blogs              │
│  comments / gallery / contact / admin       │
│  search / seo / uploads / public            │
├─────────────────────────────────────────────┤
│            Service Layer (business logic)    │
│  admin_service / blog_service               │
│  comment_service / contact_service          │
│  email_service / gallery_service            │
│  public_service / search_service            │
│  seo_service / video_service                │
│  cloudinary_service                         │
├─────────────────────────────────────────────┤
│            Data Layer (models)               │
│  SQLAlchemy ORM models + Alembic migrations  │
├─────────────────────────────────────────────┤
│            Infrastructure                    │
│  PostgreSQL / Cloudinary                    │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities
- **API Layer**: Input validation (Pydantic), authentication checks, route definitions, response formatting. No business logic.
- **Service Layer**: All business logic, external API calls (Cloudinary), email sending. No direct DB access — uses data layer.
- **Data Layer**: SQLAlchemy models, relationships, queries. No business logic.

## Frontend Architecture (Feature-Based)
```
┌─────────────────────────────────────────────┐
│                Pages (routes)                │
│  Each page is a route component              │
├─────────────────────────────────────────────┤
│              Components (reusable)           │
│  ui/ (primitives) / layout/ / auth/          │
│  content/ / comments/ / home/                │
├─────────────────────────────────────────────┤
│            Hooks (data + logic)              │
│  React Query hooks per domain                │
│  Custom hooks for auth state, etc.           │
├─────────────────────────────────────────────┤
│            Services (API calls)              │
│  Axios instance with interceptors            │
│  Domain-specific API modules                 │
├─────────────────────────────────────────────┤
│            State Management                  │
│  AuthContext (user + tokens)                  │
│  React Query (server state cache)            │
└─────────────────────────────────────────────┘
```

## Data Flow
1. User interacts with React UI
2. React Query hook calls Axios service
3. Axios interceptor attaches JWT, handles 401 → refresh
4. Request hits Nginx → FastAPI
5. FastAPI auth middleware validates JWT
6. Route handler validates body via Pydantic
7. Service layer executes business logic
8. Data layer queries PostgreSQL via SQLAlchemy
9. External calls to Cloudinary as needed
10. Response flows back through the chain

## Security Architecture
- JWT access token (15min) + refresh token (7 days, DB-stored hashed)
- Token blacklist for logout (in-memory with expiry)
- CORS whitelist (frontend origin only)
- Rate limiting per IP and per user
- All passwords bcrypt-hashed
- Security headers (CSP, Permissions-Policy, HSTS, etc.)
- HTML-escaping in email templates
- Cloudinary signed uploads (backend-only)
