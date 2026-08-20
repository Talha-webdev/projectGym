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
     │                       ├── Cloudinary (Media Storage)
     │                       └── Stripe (Payments)
     │
     └── /* ─────────► React SPA (Frontend)
                           └── Vite (Build Tool)
```

## Backend Architecture (Layered)
```
┌─────────────────────────────────────────────┐
│              API Layer (routes)              │
│  auth / users / membership / videos / blogs  │
│  comments / gallery / contact / admin        │
├─────────────────────────────────────────────┤
│            Service Layer (business logic)    │
│  auth_service / membership_service           │
│  payment_service / cloudinary_service        │
│  email_service / admin_service               │
├─────────────────────────────────────────────┤
│            Data Layer (models)               │
│  SQLAlchemy ORM models + Alembic migrations  │
├─────────────────────────────────────────────┤
│            Infrastructure                    │
│  PostgreSQL / Redis (future) / Cloudinary    │
└─────────────────────────────────────────────┘
```

### Layer Responsibilities
- **API Layer**: Input validation (Pydantic), authentication checks, route definitions, response formatting. No business logic.
- **Service Layer**: All business logic, external API calls (Stripe, Cloudinary), email sending. No direct DB access — uses data layer.
- **Data Layer**: SQLAlchemy models, relationships, queries. No business logic.

## Frontend Architecture (Feature-Based)
```
┌─────────────────────────────────────────────┐
│                Pages (routes)                │
│  Each page is a route component              │
├─────────────────────────────────────────────┤
│              Components (reusable)           │
│  ui/ (primitives) / layout/ / auth/          │
│  membership/ / content/ / comments/ / common/│
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
9. External calls to Stripe/Cloudinary as needed
10. Response flows back through the chain

## Security Architecture
- JWT access token (15min) + refresh token (7 days, DB-stored hashed)
- CORS whitelist (frontend origin only)
- Rate limiting per IP (100 req/min, auth: 10 req/min)
- All passwords bcrypt-hashed (cost 12)
- Stripe webhook signature verification
- Cloudinary signed uploads (backend-only)
