# Software Requirements Specification (SRS)
## Fitness Journey Website — "Project GYM"

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for a production-ready fitness journey website. The platform enables a personal fitness coach to share his weight-loss journey via freely accessible content (videos, blogs, gallery) and allows visitors to register, interact with content, and follow the coach's journey.

### 1.2 Scope
A dark-themed, premium-luxury fitness brand website with:
- Public pages (Home, About, Journey, Gallery, Contact)
- Authentication (Register, Login, Profile, Email Verification, Password Reset)
- Freely accessible content (Videos, Blogs, Gallery)
- Comment system
- Admin panel (single admin/coach)
- SEO optimization, security, responsive design

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Visitor | Unauthenticated user browsing public pages |
| User | Registered user with a verified account |
| Admin/Coach | The sole content creator and site administrator |

---

## 2. User Roles

| Role | Permissions |
|------|------------|
| **Visitor** | View public pages (Home, About, Journey, Gallery, Contact). Register. Login. |
| **User** | All Visitor permissions + view all videos & blogs, post comments, browse gallery, view profile, access dashboard. |
| **Admin (Coach)** | All User permissions + upload/manage videos, create/manage blogs, manage gallery, view all comments, manage site settings, single admin account. |

---

## 3. Functional Requirements

### 3.1 Public Pages (FR-01 to FR-07)

| ID | Requirement |
|----|------------|
| FR-01 | **Home**: Hero section with coach branding, value proposition, testimonial carousel, featured content preview, CTA. |
| FR-02 | **About**: Coach bio, transformation photos, qualifications, story timeline. |
| FR-03 | **My Journey**: Chronological weight-loss journey blog-style timeline with before/after media. |
| FR-04 | **Gallery**: Public photo grid; thumbnails, lightbox viewer, category filter. |
| FR-05 | **Contact**: Contact form (name, email, message), coach social links, FAQ accordion. |
| FR-06 | **SEO**: Meta tags, Open Graph, sitemap.xml, robots.txt, semantic HTML, SSR-friendly meta. |
| FR-07 | **Responsive**: All pages fully responsive (mobile, tablet, desktop). |

### 3.2 Authentication (FR-08 to FR-14)

| ID | Requirement |
|----|------------|
| FR-08 | **Register**: Email, password (hashed), name fields. Email verification via token. |
| FR-09 | **Email Verification**: Verify email via token link sent to user. |
| FR-10 | **Login**: Email + password; returns JWT access + refresh tokens. |
| FR-11 | **Logout**: Blacklist access token server-side; revoke refresh token; clear client tokens. |
| FR-12 | **Forgot Password**: Send reset email with token. |
| FR-13 | **Reset Password**: Reset password with token from email. |
| FR-14 | **JWT Tokens**: Access token (15 min), refresh token (7 days). |

### 3.3 Content — Videos (FR-15 to FR-19)

| ID | Requirement |
|----|------------|
| FR-15 | **Video List**: Public videos page showing all uploaded videos (title, thumbnail, duration, date). |
| FR-16 | **Video Detail**: Single video page with embedded player (Cloudinary). |
| FR-17 | **Upload (Admin)**: Admin uploads video via Cloudinary with title, description, thumbnail, category. |
| FR-18 | **Categories**: Videos grouped by category (e.g., Workout, Nutrition, Mindset). |
| FR-19 | **Search/Filter**: Search by title, filter by category. |

### 3.4 Content — Blogs (FR-20 to FR-24)

| ID | Requirement |
|----|------------|
| FR-20 | **Blog List**: Paginated list with title, excerpt, cover image, date, read time. |
| FR-21 | **Blog Detail**: Full blog with rich text, images, share buttons. |
| FR-22 | **Create/Edit (Admin)**: Rich text editor, cover image upload. |
| FR-23 | **Tags/Categories**: Blog tags for filtering and related posts. |
| FR-24 | **SEO Meta**: Custom slug, meta description, OG image per blog. |

### 3.5 Comments (FR-25 to FR-28)

| ID | Requirement |
|----|------------|
| FR-25 | **Post Comment**: Logged-in users can comment on videos and blogs. |
| FR-26 | **Comment Display**: Nested threaded comments with pagination. |
| FR-27 | **Moderation (Admin)**: Admin can delete any comment. |
| FR-28 | **Rate Limiting**: Prevent spam; max comments per time window per user. |

### 3.6 Admin Panel (FR-29 to FR-35)

| ID | Requirement |
|----|------------|
| FR-29 | **Dashboard**: Analytics (total users, content counts). |
| FR-30 | **Content Management**: CRUD for videos, blogs, gallery images. |
| FR-31 | **User Management**: View all users, view user details. |
| FR-32 | **Comment Moderation**: View all comments, delete inappropriate ones. |
| FR-33 | **Gallery Management**: Upload, delete, categorize gallery images. |
| FR-34 | **Site Settings**: Update site name, hero text, social links, etc. |
| FR-35 | **Single Admin**: Only one admin account can exist; created via seed script. |

### 3.7 Dashboard & Profile (FR-36 to FR-38)

| ID | Requirement |
|----|------------|
| FR-36 | **User Dashboard**: Recent comments, recent content. |
| FR-37 | **Profile Settings**: Edit name, avatar, email, change password. |
| FR-38 | **My Comments**: View all past comments across videos and blogs. |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|------------|
| NFR-01 | **Performance**: Homepage loads < 2s (Lighthouse). API responses < 200ms average. |
| NFR-02 | **Scalability**: Support 5,000+ concurrent users. Horizontal scaling via containerized backend. |
| NFR-03 | **Security**: HTTPS, JWT best practices, CORS, input sanitization, rate limiting, SQL injection protection, XSS prevention. |
| NFR-04 | **Availability**: 99.9% uptime. Graceful error handling, fallback UI. |
| NFR-05 | **SEO**: Lighthouse SEO score > 90. All pages have unique meta tags. Sitemap submission. |
| NFR-06 | **Accessibility**: WCAG 2.1 AA compliance. Keyboard navigation, screen reader support, sufficient contrast. |
| NFR-07 | **Maintainability**: Modular folder structure, typed interfaces, consistent naming, documented API. |
| NFR-08 | **Responsiveness**: Works on all devices (320px to 4K). |
| NFR-09 | **Data Privacy**: GDPR-compliant cookie consent, data deletion request, privacy policy page. |
| NFR-10 | **Backup**: Daily PostgreSQL backups to cloud storage. |

---

## 5. User Flow

```
Visitor arrives on Homepage
       │
       ├── Browse public pages (About, Journey, Gallery, Contact)
       │
       ├── Explore Content
       │     ├── Videos → views all videos (freely accessible)
       │     └── Blogs  → reads all blogs (freely accessible)
       │
       ├── Register → Email + Password → Email Verification
       │     │
       │     └── Verify Email → Account activated
       │
       ├── Now logged in as User
       │     ├── Watch all videos (full access)
       │     ├── Read all blogs (full access)
       │     ├── Post comments
       │     ├── Browse gallery
       │     └── Edit profile
       │
       └── Forgot Password → Reset Email → Set New Password → Login
```

---

## 6. Admin Flow

```
Admin logs in (route guarded by admin check middleware)
       │
       ├── Dashboard
       │     ├── View KPIs: total users, content stats
       │     └── Quick actions (upload video, write blog)
       │
       ├── Content
       │     ├── Videos → Upload, edit, delete
       │     ├── Blogs  → Create (rich text), edit, delete
       │     └── Gallery → Upload, categorize, delete
       │
       ├── Users
       │     ├── View all registered users
       │     ├── Search by name/email
       │     └── View user details
       │
       ├── Comments → View all, delete spam
       │
       └── Settings → Site metadata, social links, hero content
```

---

## 7. Database Design

### 7.1 Entity-Relationship Overview

```
users ────< refresh_tokens
  │
  ├───< comments
  │
  └───< pending_registrations

videos ────< comments
  │
  ├───< video_categories
  │
  └───> categories (M:N via video_categories)

blogs ────< comments
  │
  ├───< blog_tags
  │
  └───> tags (M:N via blog_tags)

gallery
site_settings
```

### 7.2 Tables

#### `users`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, default uuid4 |
| email | VARCHAR(255) | UNIQUE, NOT NULL, INDEX |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(100) | NOT NULL |
| avatar_url | TEXT | NULLABLE |
| is_admin | BOOLEAN | DEFAULT FALSE, UNIQUE when TRUE |
| is_verified | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### `pending_registrations`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token | VARCHAR(255) | UNIQUE, NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `videos`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(250) | UNIQUE, NOT NULL |
| description | TEXT | NULLABLE |
| cloudinary_public_id | VARCHAR(255) | NOT NULL |
| cloudinary_url | TEXT | NOT NULL |
| thumbnail_url | TEXT | NULLABLE |
| duration | INTEGER | seconds, NULLABLE |
| view_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### `categories`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| slug | VARCHAR(120) | UNIQUE, NOT NULL |

#### `video_categories`
| Column | Type | Constraints |
|--------|------|------------|
| video_id | UUID | FK → videos.id |
| category_id | UUID | FK → categories.id |
| PK | (video_id, category_id) | |

#### `blogs`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(250) | UNIQUE, NOT NULL |
| content | TEXT | NOT NULL |
| excerpt | TEXT | NULLABLE |
| cover_image_url | TEXT | NULLABLE |
| read_time_minutes | INTEGER | NULLABLE |
| meta_description | VARCHAR(300) | NULLABLE |
| view_count | INTEGER | DEFAULT 0 |
| published_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### `tags`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| slug | VARCHAR(60) | UNIQUE, NOT NULL |

#### `blog_tags`
| Column | Type | Constraints |
|--------|------|------------|
| blog_id | UUID | FK → blogs.id |
| tag_id | UUID | FK → tags.id |
| PK | (blog_id, tag_id) | |

#### `comments`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| video_id | UUID | FK → videos.id, NULLABLE |
| blog_id | UUID | FK → blogs.id, NULLABLE |
| parent_id | UUID | FK → comments.id, NULLABLE (for threading) |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### `gallery`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| title | VARCHAR(200) | NULLABLE |
| cloudinary_public_id | VARCHAR(255) | NOT NULL |
| cloudinary_url | TEXT | NOT NULL |
| category | VARCHAR(100) | NULLABLE |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `refresh_tokens`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token_hash | VARCHAR(255) | UNIQUE, NOT NULL |
| expires_at | TIMESTAMP | NOT NULL |
| revoked | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |

#### `site_settings`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE, NOT NULL |
| value | TEXT | NOT NULL |
| updated_at | TIMESTAMP | DEFAULT NOW() |

---

## 8. API Planning

### 8.1 Base URL
```
Production:  https://api.projectgym.com/v1
Development: http://localhost:8000/api/v1
```

### 8.2 Endpoints

#### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login, returns tokens | No |
| POST | /auth/refresh | Refresh access token | Refresh |
| POST | /auth/logout | Blacklist access + revoke refresh token | Yes |
| POST | /auth/forgot-password | Send reset email | No |
| POST | /auth/reset-password | Reset password with token | No |
| POST | /auth/verify-email | Verify email with token | No |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /users/me | Get current user profile | Yes |
| PATCH | /users/me | Update profile | Yes |
| PATCH | /users/me/password | Change password | Yes |

#### Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /videos | List videos (public) | No |
| GET | /videos/{slug} | Video detail | No |
| POST | /videos | Upload video | Admin |
| PATCH | /videos/{slug} | Edit video | Admin |
| DELETE | /videos/{slug} | Delete video | Admin |
| GET | /categories | List categories | No |

#### Blogs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /blogs | List blogs (paginated) | No |
| GET | /blogs/{slug} | Blog detail | No |
| POST | /blogs | Create blog | Admin |
| PATCH | /blogs/{slug} | Edit blog | Admin |
| DELETE | /blogs/{slug} | Delete blog | Admin |
| GET | /tags | List tags | No |

#### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /comments/video/{video_id} | Get comments for video | No |
| GET | /comments/blog/{blog_id} | Get comments for blog | No |
| POST | /comments | Create comment | Yes |
| DELETE | /comments/{id} | Delete own comment | Owner |
| DELETE | /comments/{id}/admin | Delete any comment | Admin |

#### Gallery
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /gallery | List gallery images | No |
| POST | /gallery | Upload image | Admin |
| DELETE | /gallery/{id} | Delete image | Admin |

#### Contact
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /contact | Submit contact form | No |

#### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /admin/dashboard | Dashboard analytics | Admin |
| GET | /admin/users | List all users | Admin |
| GET | /admin/users/{id} | User detail | Admin |
| GET | /admin/comments | All comments | Admin |
| DELETE | /admin/comments/{id} | Delete comment | Admin |
| GET | /admin/settings | Get site settings | Admin |
| PATCH | /admin/settings | Update site settings | Admin |

#### Public
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /public/website-settings | Site config (typed response) | No |
| GET | /public/journey | Journey timeline entries | No |
| GET | /public/statistics | Site statistics | No |
| GET | /public/faq | FAQ entries | No |

#### Uploads
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /uploads/image | Upload image to Cloudinary | Admin |
| POST | /uploads/video | Upload video to Cloudinary | Admin |

#### Search
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /search | Global search across content | No |

#### SEO
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /sitemap.xml | Dynamic sitemap | No |
| GET | /robots.txt | Robots file | No |

---

## 9. Folder Structure

```
project-gym/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app, middleware, CORS
│   │   ├── config.py               # Settings via pydantic-settings (env vars)
│   │   ├── database.py             # SQLAlchemy engine & session
│   │   ├── dependencies.py         # Dependency injection (get_db, get_current_user)
│   │   │
│   │   ├── models/                 # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── pending_registration.py
│   │   │   ├── video.py
│   │   │   ├── blog.py
│   │   │   ├── comment.py
│   │   │   ├── gallery.py
│   │   │   ├── category.py
│   │   │   ├── tag.py
│   │   │   ├── refresh_token.py
│   │   │   └── site_setting.py
│   │   │
│   │   ├── schemas/                # Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── video.py
│   │   │   ├── blog.py
│   │   │   ├── comment.py
│   │   │   ├── gallery.py
│   │   │   ├── contact.py
│   │   │   ├── admin.py
│   │   │   ├── public.py
│   │   │   ├── search.py
│   │   │   └── website_settings.py
│   │   │
│   │   ├── api/                    # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── videos.py
│   │   │   ├── blogs.py
│   │   │   ├── comments.py
│   │   │   ├── gallery.py
│   │   │   ├── contact.py
│   │   │   ├── public.py
│   │   │   ├── admin.py
│   │   │   ├── search.py
│   │   │   ├── seo.py
│   │   │   └── uploads.py
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── admin_service.py
│   │   │   ├── blog_service.py
│   │   │   ├── cloudinary_service.py
│   │   │   ├── comment_service.py
│   │   │   ├── contact_service.py
│   │   │   ├── email_service.py
│   │   │   ├── gallery_service.py
│   │   │   ├── public_service.py
│   │   │   ├── search_service.py
│   │   │   ├── seo_service.py
│   │   │   └── video_service.py
│   │   │
│   │   ├── utils/                  # Helpers
│   │   │   ├── __init__.py
│   │   │   ├── security.py         # JWT, hashing
│   │   │   ├── token_store.py      # In-memory token blacklist
│   │   │   ├── rate_limiter.py
│   │   │   ├── sanitize.py
│   │   │   └── pagination.py
│   │   │
│   │   └── middleware/
│   │       ├── __init__.py
│   │       └── security_headers.py
│   │
│   ├── alembic/                    # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── scripts/
│   │   └── seed_admin.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_admin.py
│   │   ├── test_videos.py
│   │   ├── test_blogs.py
│   │   ├── test_comments.py
│   │   ├── test_contact.py
│   │   ├── test_email.py
│   │   ├── test_gallery.py
│   │   ├── test_health.py
│   │   ├── test_media.py
│   │   └── test_utils.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   │
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes.tsx               # React Router config
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   └── Skeleton.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MobileMenu.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── AdminRoute.tsx
│   │   │   │
│   │   │   ├── content/
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   ├── BlogCard.tsx
│   │   │   │   └── GalleryGrid.tsx
│   │   │   │
│   │   │   ├── comments/
│   │   │   │   └── CommentSection.tsx
│   │   │   │
│   │   │   └── home/
│   │   │       ├── CTA.tsx
│   │   │       ├── FAQ.tsx
│   │   │       └── Statistics.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Journey.tsx
│   │   │   ├── Videos.tsx
│   │   │   ├── VideoDetail.tsx
│   │   │   ├── Blogs.tsx
│   │   │   ├── BlogDetail.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VerifyEmail.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   ├── CheckEmail.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminVideos.tsx
│   │   │       ├── AdminBlogs.tsx
│   │   │       ├── AdminGallery.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── AdminComments.tsx
│   │   │       ├── AdminSettings.tsx
│   │   │       └── AdminWebsiteSettings.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useAdmin.ts
│   │   │   ├── useVideos.ts
│   │   │   ├── useBlogs.ts
│   │   │   ├── useComments.ts
│   │   │   ├── useGallery.ts
│   │   │   ├── usePublic.ts
│   │   │   ├── useSiteSettings.ts
│   │   │   └── useSearch.ts
│   │   │
│   │   ├── services/                 # Axios API layer
│   │   │   ├── api.ts                # Axios instance with interceptors
│   │   │   ├── authApi.ts
│   │   │   ├── adminApi.ts
│   │   │   ├── publicApi.ts
│   │   │   ├── galleryApi.ts
│   │   │   ├── commentApi.ts
│   │   │   ├── contactApi.ts
│   │   │   └── searchApi.ts
│   │   │
│   │   ├── store/                    # React Context
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── utils/
│   │   │   └── formatters.ts         # Date, duration, view count formatters
│   │   │
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── admin.ts
│   │       ├── video.ts
│   │       ├── blog.ts
│   │       ├── comment.ts
│   │       ├── gallery.ts
│   │       ├── contact.ts
│   │       ├── public.ts
│   │       ├── search.ts
│   │       └── api.ts
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── vite-env.d.ts
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── API_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_SPEC.md
│   └── UI_GUIDELINES.md
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── ci.yml
│
├── docker-compose.yml
├── .gitignore
└── SRS.md
```

---

## 10. Security Requirements

| ID | Requirement |
|----|------------|
| SEC-01 | **HTTPS Only**: Enforce TLS 1.3; redirect all HTTP to HTTPS. |
| SEC-02 | **JWT Security**: Access token (15 min expiry), refresh token (7 days, stored hashed in DB). Token rotation on refresh. Token blacklist for logout. |
| SEC-03 | **Password Policy**: Min 8 chars, must include uppercase, lowercase, number. Bcrypt hashing. |
| SEC-04 | **CORS**: Whitelist only frontend domain. |
| SEC-05 | **Rate Limiting**: Per-IP and per-user rate limiting on sensitive endpoints. |
| SEC-06 | **Input Sanitization**: Strip control characters from text inputs; HTML-escape output. Use Pydantic validation. |
| SEC-07 | **SQL Injection**: Use SQLAlchemy ORM (no raw queries). |
| SEC-08 | **XSS Prevention**: Security headers (CSP), HTML-escaping in email templates, React's built-in escaping. |
| SEC-09 | **CSRF**: SameSite=Strict cookies for refresh tokens. |
| SEC-10 | **Cloudinary**: Signed uploads from backend only; never expose API secrets to frontend. |
| SEC-11 | **Environment Variables**: All secrets in .env, never committed. Use pydantic-settings for validation. |
| SEC-12 | **Admin Protection**: Admin routes check `is_admin` on every request; admin created only via seed script. |
| SEC-13 | **Token Revocation**: Password reset and password change revoke all user refresh tokens. |
| SEC-14 | **Dependency Scanning**: Use `safety` (Python) and `npm audit` in CI. |

---

## 11. Deployment Strategy

### 11.1 Infrastructure
```
                    Cloudflare (DNS, CDN, DDoS)
                           │
                    ┌──────┴──────┐
                    │   Nginx      │  Reverse Proxy / SSL Termination
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         Frontend       Backend      Cloudinary
        (Vite/React)   (FastAPI)     (Media)
         Docker/        Docker/
         Nginx          Gunicorn+Uvicorn
              │            │
              │       ┌────┴────┐
              │       │PostgreSQL│
              │       └─────────┘
```

### 11.2 CI/CD Pipeline
- **GitHub Actions** on push to `main`:
  1. Run backend tests
  2. Run frontend lint & build
  3. Build Docker images
  4. Push to container registry
  5. Deploy via SSH or platform CLI

### 11.3 Monitoring
- **Backend**: Sentry for error tracking
- **Frontend**: Sentry for JS errors, Vercel Analytics
- **Uptime**: UptimeRobot or BetterStack

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Cloudinary API rate limits | Upload failures | Low | Queue uploads, retry with exponential backoff |
| JWT token theft | Account takeover | Low | Short access tokens, refresh rotation, revoke on logout |
| SQL injection | Data breach | Very Low | ORM-only queries + parameterized input |
| DDoS attack | Site down | Low | Cloudflare protection, rate limiting |
| GDPR non-compliance | Legal risk | Low | Cookie consent, data deletion endpoint, privacy policy |
| Single admin account locked out | No site management | Low | Seed script to recreate; DB access as last resort |
| Browser compatibility | Poor UX | Low | Target modern browsers, graceful fallbacks |

---

## 13. Technology Rationale

| Technology | Why |
|-----------|-----|
| **FastAPI** | Async, auto-docs via Swagger, Pydantic validation, high performance. |
| **SQLAlchemy** | Mature ORM, migration support via Alembic, async support. |
| **PostgreSQL** | Robust, supports UUID, JSONB for future flexibility. |
| **JWT (python-jose)** | Stateless auth, standard library, refresh token pattern. |
| **Cloudinary** | Automated image/video optimization, transformations, CDN delivery. |
| **React + Vite** | Fast dev experience, tree-shaking, HMR. |
| **Tailwind CSS** | Utility-first, rapid prototyping, consistent design system. |
| **React Query** | Server state management, caching, auto-refetch. |
| **React Router** | Standard SPA routing, nested layouts, lazy loading. |
| **Framer Motion** | Declarative animations, gesture support, layout animations. |
| **Axios** | Interceptors for JWT refresh, request/response transforms. |

---

*Document Version 2.0 — Updated to reflect current free-access architecture*
