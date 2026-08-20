# Project Specification

## Overview
A production-ready fitness membership website. A personal fitness coach documents his weight-loss journey. Visitors can register, log in, purchase a 3-month membership, watch premium videos, read premium blogs, browse a gallery, and comment. Only the coach uploads content. Only one admin exists.

## Brand Identity
- **Name**: Project GYM
- **Aesthetic**: Premium luxury fitness brand — Apple + Gymshark influence
- **Theme**: Dark (#0A0A0A backgrounds, #1A1A1A surfaces)
- **Accent**: Gold (#D4A853) — luxury feel
- **Typography**: Inter (body), Playfair Display (accent headlines)

## User Roles
| Role | Permissions |
|------|-------------|
| **Visitor** | View public pages, register, login |
| **Member** | All visitor + premium content, comments, dashboard, profile |
| **Admin (Coach)** | All member + content management, user management, settings, single admin account |

## Features
- Home, About, My Journey, Videos, Blogs, Gallery, Pricing, Contact pages
- Authentication (register, login, JWT access + refresh tokens, password reset)
- Membership (3-month, Stripe payments, webhook activation, expiry)
- Premium content gating (videos + blogs behind membership)
- Comments (threaded, member-only posting, admin moderation)
- Admin panel (dashboard analytics, CRUD content, user management, payments log, settings)
- Gallery (masonry grid, lightbox, category filter)
- SEO (meta tags, Open Graph, sitemap, semantic HTML)
- Security (JWT rotation, bcrypt, rate limiting, CORS, CSP, Stripe webhook verification)

## Technology Stack
### Frontend
- React 18+, Vite, Tailwind CSS, React Router v6, React Query (TanStack Query v5), Axios, Framer Motion

### Backend
- Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), PostgreSQL 16, Alembic, Pydantic v2, python-jose (JWT), passlib[bcrypt], Stripe SDK, Cloudinary SDK

### Infrastructure
- Docker Compose (backend + frontend + PostgreSQL), Nginx (reverse proxy), GitHub Actions (CI/CD)

## Design Requirements
- Fully responsive (320px–4K)
- Dark theme with gold accents
- Modern animations (Framer Motion)
- WCAG 2.1 AA accessibility
- Lighthouse scores > 90 (Performance, Accessibility, SEO)
