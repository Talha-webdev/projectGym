# Software Requirements Specification (SRS)
## Fitness Membership Website — "Project GYM"

---

## 1. Introduction

### 1.1 Purpose
This document defines the complete functional and non-functional requirements for a production-ready fitness membership website. The platform enables a personal fitness coach to share his weight-loss journey via premium content (videos, blogs, gallery) and allows visitors to register, purchase a 3-month membership, and access premium content.

### 1.2 Scope
A dark-themed, premium-luxury fitness brand website with:
- Public pages (Home, About, Journey, Gallery, Contact, Pricing)
- Authentication (Register, Login, Profile)
- Paid membership (Stripe, 3-month expiry)
- Premium content (Videos, Blogs) behind membership
- Comment system
- Admin panel (single admin/coach)
- SEO optimization, security, responsive design

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Visitor | Unauthenticated user browsing public pages |
| Member | Registered user with an active paid membership |
| Admin/Coach | The sole content creator and site administrator |
| Premium Content | Videos and blogs accessible only to active members |
| Membership | 3-month recurring subscription purchased via Stripe |

---

## 2. User Roles

| Role | Permissions |
|------|------------|
| **Visitor** | View public pages (Home, About, Journey, Gallery, Contact, Pricing). Register. Login. |
| **Member** | All Visitor permissions + view premium videos & blogs, post comments, browse gallery, view profile, access dashboard. |
| **Admin (Coach)** | All Member permissions + upload/manage videos, create/manage blogs, manage gallery, view all comments, manage memberships, view analytics, manage site settings, single admin account. |

---

## 3. Functional Requirements

### 3.1 Public Pages (FR-01 to FR-08)

| ID | Requirement |
|----|------------|
| FR-01 | **Home**: Hero section with coach branding, value proposition, testimonial carousel, featured content preview, CTA to join. |
| FR-02 | **About**: Coach bio, transformation photos, qualifications, story timeline. |
| FR-03 | **My Journey**: Chronological weight-loss journey blog-style timeline with before/after media. |
| FR-04 | **Gallery**: Public photo grid; thumbnails, lightbox viewer, category filter. |
| FR-05 | **Pricing**: Membership tiers (only one: 3-month), Stripe checkout integration, feature list. |
| FR-06 | **Contact**: Contact form (name, email, message), coach social links, FAQ accordion. |
| FR-07 | **SEO**: Meta tags, Open Graph, sitemap.xml, robots.txt, semantic HTML, SSR-friendly meta. |
| FR-08 | **Responsive**: All pages fully responsive (mobile, tablet, desktop). |

### 3.2 Authentication (FR-09 to FR-14)

| ID | Requirement |
|----|------------|
| FR-09 | **Register**: Email, password (hashed), name fields. Email verification optional (recommended). |
| FR-10 | **Login**: Email + password; returns JWT access + refresh tokens. |
| FR-11 | **Logout**: Invalidate refresh token server-side; clear client tokens. |
| FR-12 | **Password Reset**: Forgot password flow via email. |
| FR-13 | **JWT Tokens**: Access token (15 min), refresh token (7 days). |
| FR-14 | **Profile**: View and edit name, avatar, email. Change password. |

### 3.3 Membership & Payments (FR-15 to FR-21)

| ID | Requirement |
|----|------------|
| FR-15 | **Stripe Checkout**: Create Stripe checkout session for 3-month membership. |
| FR-16 | **Webhook**: Stripe webhook to handle `checkout.session.completed`. |
| FR-17 | **Membership Activation**: On successful payment, activate membership with 3-month expiry timestamp. |
| FR-18 | **Membership Expiry**: Daily cron job or on-login check; auto-deactivate expired memberships. |
| FR-19 | **Membership Status**: API endpoint to check if current user has active membership. |
| FR-20 | **Pricing Display**: Show price, duration, feature list. |
| FR-21 | **Payment History**: User can view their payment transactions in dashboard. |

### 3.4 Content — Videos (FR-22 to FR-27)

| ID | Requirement |
|----|------------|
| FR-22 | **Video List**: Public videos page showing all uploaded videos (title, thumbnail, duration, date). |
| FR-23 | **Video Detail**: Single video page with embedded player (Cloudinary or YouTube). |
| FR-24 | **Premium Gating**: Premium videos show preview/teaser to non-members; full video only for active members. |
| FR-25 | **Upload (Admin)**: Admin uploads video via Cloudinary with title, description, thumbnail, category. |
| FR-26 | **Categories**: Videos grouped by category (e.g., Workout, Nutrition, Mindset). |
| FR-27 | **Search/Filter**: Search by title, filter by category. |

### 3.5 Content — Blogs (FR-28 to FR-33)

| ID | Requirement |
|----|------------|
| FR-28 | **Blog List**: Paginated list with title, excerpt, cover image, date, read time. |
| FR-29 | **Blog Detail**: Full blog with rich text, images, share buttons. |
| FR-30 | **Premium Gating**: Premium blogs show intro paragraph only; full content for active members. |
| FR-31 | **Create/Edit (Admin)**: Rich text editor (e.g., TipTap or Quill), cover image, premium toggle. |
| FR-32 | **Tags/Categories**: Blog tags for filtering and related posts. |
| FR-33 | **SEO Meta**: Custom slug, meta description, OG image per blog. |

### 3.6 Comments (FR-34 to FR-37)

| ID | Requirement |
|----|------------|
| FR-34 | **Post Comment**: Logged-in users (members) can comment on videos and blogs. |
| FR-35 | **Comment Display**: Nested threaded comments with pagination. |
| FR-36 | **Moderation (Admin)**: Admin can delete any comment. |
| FR-37 | **Rate Limiting**: Prevent spam; max 5 comments per 10 minutes per user. |

### 3.7 Admin Panel (FR-38 to FR-45)

| ID | Requirement |
|----|------------|
| FR-38 | **Dashboard**: Analytics (total users, active members, revenue, content counts). |
| FR-39 | **Content Management**: CRUD for videos, blogs, gallery images. |
| FR-40 | **User Management**: View all users, see membership status, manually expire/reactivate membership. |
| FR-41 | **Comment Moderation**: View all comments, delete inappropriate ones. |
| FR-42 | **Payment Logs**: View all Stripe transactions, amounts, dates, user emails. |
| FR-43 | **Gallery Management**: Upload, delete, categorize gallery images. |
| FR-44 | **Site Settings**: Update site name, hero text, social links, etc. |
| FR-45 | **Single Admin**: Only one admin account can exist; created via seed script. |

### 3.8 Dashboard & Profile (FR-46 to FR-49)

| ID | Requirement |
|----|------------|
| FR-46 | **Member Dashboard**: View membership status, expiry date, recent comments, recent content. |
| FR-47 | **Profile Settings**: Edit name, avatar, email, change password. |
| FR-48 | **My Comments**: View all past comments across videos and blogs. |
| FR-49 | **Payment History**: See transaction list with dates and amounts. |

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
       │     ├── Videos → sees free videos, premium locked
       │     └── Blogs  → sees free blogs, premium locked
       │
       ├── Register → Email + Password → JWT issued
       │     │
       │     └── Now logged in (Member without membership)
       │
       ├── Browse Premium Content → sees teaser + "Upgrade to view"
       │
       ├── Pricing → CTA "Join Now" → Stripe Checkout
       │     │
       │     ├── Payment Success → Webhook activates 3-month membership
       │     └── Payment Fail   → Redirect with error message
       │
       ├── Member Dashboard
       │     ├── View membership status & expiry
       │     ├── Watch premium videos (full)
       │     ├── Read premium blogs (full)
       │     ├── Post comments
       │     └── Edit profile
       │
       └── Membership expires after 3 months
             ├── Premium content locked again
             ├── Prompt to re-subscribe
             └── Old comments remain visible
```

---

## 6. Admin Flow

```
Admin logs in via /admin/login (route guarded by admin check middleware)
       │
       ├── Dashboard
       │     ├── View KPIs: total users, active members, revenue, content stats
       │     ├── Recent activity feed
       │     └── Quick actions (upload video, write blog)
       │
       ├── Content
       │     ├── Videos → Upload, edit, delete, toggle premium
       │     ├── Blogs  → Create (rich text), edit, delete, toggle premium
       │     └── Gallery → Upload, categorize, delete
       │
       ├── Users
       │     ├── View all registered users
       │     ├── Search by name/email
       │     ├── Manually expire/reactivate membership
       │     └── View user details
       │
       ├── Comments → View all, delete spam
       │
       ├── Payments → Transaction log (user, amount, date, status)
       │
       └── Settings → Site metadata, social links, hero content
```

---

## 7. Database Design

### 7.1 Entity-Relationship Overview

```
users ────< memberships
  │              │
  │              └─────── payments
  │
  ├───< comments
  │
  ├───< blog_comments
  │
  └───< refresh_tokens

videos ────< comments
  │
  ├───< video_categories
  │
  └───> categories (M:N via video_categories)

blogs ────< blog_comments
  │
  ├───< blog_tags
  │
  └───> tags (M:N via blog_tags)

gallery
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

#### `memberships`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, UNIQUE |
| is_active | BOOLEAN | DEFAULT FALSE |
| start_date | TIMESTAMP | NULLABLE |
| end_date | TIMESTAMP | NULLABLE |
| stripe_subscription_id | VARCHAR(255) | UNIQUE, NULLABLE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

#### `payments`
| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| stripe_session_id | VARCHAR(255) | UNIQUE, NOT NULL |
| stripe_payment_intent_id | VARCHAR(255) | NULLABLE |
| amount | DECIMAL(10,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'usd' |
| status | VARCHAR(50) | NOT NULL (completed, failed, refunded) |
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
| is_premium | BOOLEAN | DEFAULT FALSE |
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
| is_premium | BOOLEAN | DEFAULT FALSE |
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
| POST | /auth/logout | Revoke refresh token | Yes |
| POST | /auth/forgot-password | Send reset email | No |
| POST | /auth/reset-password | Reset password with token | No |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /users/me | Get current user profile | Yes |
| PATCH | /users/me | Update profile | Yes |
| PATCH | /users/me/password | Change password | Yes |

#### Membership
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /membership/status | Get current membership | Yes |
| POST | /membership/create-checkout | Create Stripe checkout session | Yes |
| POST | /membership/webhook | Stripe webhook | No (signature) |
| GET | /membership/payments | Payment history | Yes |

#### Videos
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /videos | List videos (public) | No |
| GET | /videos/{slug} | Video detail (premium gated) | No* |
| GET | /videos/{slug}/stream | Get video URL (premium check) | Var* |
| POST | /videos | Upload video | Admin |
| PATCH | /videos/{slug} | Edit video | Admin |
| DELETE | /videos/{slug} | Delete video | Admin |
| GET | /categories | List categories | No |

\* Premium video content requires active membership.

#### Blogs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /blogs | List blogs (paginated) | No |
| GET | /blogs/{slug} | Blog detail (premium gated) | No* |
| POST | /blogs | Create blog | Admin |
| PATCH | /blogs/{slug} | Edit blog | Admin |
| DELETE | /blogs/{slug} | Delete blog | Admin |
| GET | /tags | List tags | No |

\* Premium blog full content requires active membership.

#### Comments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /comments/video/{video_id} | Get comments for video | No |
| GET | /comments/blog/{blog_id} | Get comments for blog | No |
| POST | /comments | Create comment | Member |
| DELETE | /comments/{id} | Delete own comment | Member+ |
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
| PATCH | /admin/users/{id}/membership | Update user membership | Admin |
| GET | /admin/payments | All transactions | Admin |
| GET | /admin/comments | All comments | Admin |
| DELETE | /admin/comments/{id} | Delete comment | Admin |
| GET | /admin/settings | Get site settings | Admin |
| PATCH | /admin/settings | Update site settings | Admin |

#### Public
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /public/journey | Journey timeline entries | No |
| GET | /public/testimonials | Testimonials | No |

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
│   │   │   ├── membership.py
│   │   │   ├── payment.py
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
│   │   │   ├── membership.py
│   │   │   ├── payment.py
│   │   │   ├── video.py
│   │   │   ├── blog.py
│   │   │   ├── comment.py
│   │   │   ├── gallery.py
│   │   │   └── admin.py
│   │   │
│   │   ├── api/                    # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── membership.py
│   │   │   ├── videos.py
│   │   │   ├── blogs.py
│   │   │   ├── comments.py
│   │   │   ├── gallery.py
│   │   │   ├── contact.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── membership_service.py
│   │   │   ├── payment_service.py
│   │   │   ├── cloudinary_service.py
│   │   │   ├── email_service.py
│   │   │   └── admin_service.py
│   │   │
│   │   ├── utils/                  # Helpers
│   │   │   ├── __init__.py
│   │   │   ├── security.py         # JWT, hashing, rate limit
│   │   │   ├── pagination.py
│   │   │   └── slug.py
│   │   │
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── cors.py
│   │       ├── rate_limit.py
│   │       └── admin_required.py
│   │
│   ├── alembic/                    # DB migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── scripts/
│   │   ├── seed_admin.py
│   │   └── check_expired_memberships.py
│   │
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_membership.py
│   │   ├── test_videos.py
│   │   ├── test_blogs.py
│   │   └── test_comments.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
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
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   └── icons/
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
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── MobileMenu.tsx
│   │   │   │   └── PageWrapper.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── AdminRoute.tsx
│   │   │   │
│   │   │   ├── membership/
│   │   │   │   ├── MembershipCard.tsx
│   │   │   │   ├── MembershipBadge.tsx
│   │   │   │   └── StripeCheckoutButton.tsx
│   │   │   │
│   │   │   ├── content/
│   │   │   │   ├── VideoCard.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── BlogCard.tsx
│   │   │   │   ├── BlogContent.tsx
│   │   │   │   ├── GalleryGrid.tsx
│   │   │   │   └── Lightbox.tsx
│   │   │   │
│   │   │   ├── comments/
│   │   │   │   ├── CommentSection.tsx
│   │   │   │   ├── CommentItem.tsx
│   │   │   │   └── CommentForm.tsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── SEOHead.tsx
│   │   │       ├── LoadingScreen.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       ├── EmptyState.tsx
│   │   │       └── Pagination.tsx
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
│   │   │   ├── Pricing.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── NotFound.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminVideos.tsx
│   │   │       ├── AdminVideoForm.tsx
│   │   │       ├── AdminBlogs.tsx
│   │   │       ├── AdminBlogForm.tsx
│   │   │       ├── AdminGallery.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── AdminComments.tsx
│   │   │       ├── AdminPayments.tsx
│   │   │       └── AdminSettings.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useMembership.ts
│   │   │   ├── useVideos.ts
│   │   │   ├── useBlogs.ts
│   │   │   ├── useComments.ts
│   │   │   └── useAdmin.ts
│   │   │
│   │   ├── services/                 # Axios API layer
│   │   │   ├── api.ts                # Axios instance with interceptors
│   │   │   ├── authApi.ts
│   │   │   ├── membershipApi.ts
│   │   │   ├── videoApi.ts
│   │   │   ├── blogApi.ts
│   │   │   ├── commentApi.ts
│   │   │   ├── galleryApi.ts
│   │   │   └── adminApi.ts
│   │   │
│   │   ├── store/                    # React Context or Zustand
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts         # Date, currency formatters
│   │   │   ├── validators.ts
│   │   │   ├── constants.ts
│   │   │   └── seo.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css             # Tailwind directives
│   │   │   ├── globals.css           # Custom global styles
│   │   │   └── animations.css        # Framer motion variants
│   │   │
│   │   └── types/
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       ├── video.ts
│   │       ├── blog.ts
│   │       ├── comment.ts
│   │       └── api.ts
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
├── docs/
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml               # Root compose (backend + frontend + db)
├── .gitignore
└── README.md
```

---

## 10. Security Requirements

| ID | Requirement |
|----|------------|
| SEC-01 | **HTTPS Only**: Enforce TLS 1.3; redirect all HTTP to HTTPS. |
| SEC-02 | **JWT Security**: Access token (15 min expiry), refresh token (7 days, stored hashed in DB). Token rotation on refresh. |
| SEC-03 | **Password Policy**: Min 8 chars, must include uppercase, lowercase, number. Bcrypt hashing (cost 12). |
| SEC-04 | **CORS**: Whitelist only frontend domain. |
| SEC-05 | **Rate Limiting**: 100 req/min per IP. Auth endpoints: 10 req/min. Comment posts: 30 req/min. |
| SEC-06 | **Input Sanitization**: Strip HTML tags from text inputs; escape output. Use Pydantic validation. |
| SEC-07 | **SQL Injection**: Use SQLAlchemy ORM (no raw queries). |
| SEC-08 | **XSS Prevention**: Content-Security-Policy header, React's built-in escaping. |
| SEC-09 | **CSRF**: SameSite=Strict cookies for refresh tokens; anti-CSRF token for state-changing requests. |
| SEC-10 | **Stripe Webhook**: Verify webhook signature with Stripe SDK. |
| SEC-11 | **Cloudinary**: Signed uploads from backend only; never expose API secrets to frontend. |
| SEC-12 | **Environment Variables**: All secrets in .env, never committed. Use pydantic-settings for validation. |
| SEC-13 | **Admin Protection**: Admin routes check `is_admin` on every request; admin created only via seed script; no register-as-admin endpoint. |
| SEC-14 | **Data Deletion**: GDPR — DELETE /users/me endpoint to request account deletion. |
| SEC-15 | **Dependency Scanning**: Use `safety` (Python) and `npm audit` in CI. |

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
         Frontend       Backend      Stripe API
        (Vite/React)   (FastAPI)        │
         Docker/        Docker/         │
         Nginx          Gunicorn+Uvicorn│
              │            │            │
              │       ┌────┴────┐       │
              │       │PostgreSQL│       │
              │       └─────────┘       │
              │                         │
         Cloudinary (Media)        Stripe (Payments)
```

### 11.2 Hosting Options

| Option | Pros | Cons | Recommended For |
|--------|------|------|----------------|
| **Railway** | Simple deploy, PG included, auto SSL | Limited free tier | MVP/Launch |
| **DigitalOcean App Platform** | Good balance, managed PG | Slightly pricier | Growth |
| **AWS (ECS + RDS)** | Full control, scalable | Complex setup | Scale |
| **VPS (Linode/Hetzner)** | Cheap, full control | Manual setup | Budget |

### 11.3 CI/CD Pipeline
- **GitHub Actions** on push to `main`:
  1. Run backend tests
  2. Run frontend lint & build
  3. Build Docker images
  4. Push to container registry
  5. Deploy via SSH or platform CLI

### 11.4 Monitoring
- **Backend**: Sentry for error tracking, Prometheus + Grafana for metrics
- **Frontend**: Sentry for JS errors, Vercel Analytics or Plausible
- **Uptime**: UptimeRobot or BetterStack

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Stripe webhook failures | Users not activated | Medium | Retry logic + manual admin activation UI |
| Membership expiry not enforced | Revenue loss | Medium | Check on every premium request, not just cron |
| Cloudinary API rate limits | Upload failures | Low | Queue uploads, retry with exponential backoff |
| JWT token theft | Account takeover | Low | Short access tokens, refresh rotation, revoke on logout |
| SQL injection | Data breach | Very Low | ORM-only queries + parameterized input |
| DDoS attack | Site down | Low | Cloudflare protection, rate limiting |
| GDPR non-compliance | Legal risk | Low | Cookie consent, data deletion endpoint, privacy policy |
| Single admin account locked out | No site management | Low | Seed script to recreate; DB access as last resort |
| Payment disputes/chargebacks | Revenue loss | Low | Clear refund policy, Stripe dispute handling |
| Browser compatibility | Poor UX | Low | Target modern browsers, graceful fallbacks |

---

## 13. Development Roadmap

### Phase 1 — Foundation (Weeks 1-2)
- [ ] Initialize backend (FastAPI + SQLAlchemy + PostgreSQL)
- [ ] Initialize frontend (Vite + React + Tailwind + Router)
- [ ] Database schema & Alembic migrations
- [ ] Authentication system (register, login, JWT, refresh)
- [ ] Docker Compose setup (backend + frontend + postgres)
- [ ] CI/CD pipeline

### Phase 2 — Core Features (Weeks 3-4)
- [ ] User profile & settings
- [ ] Stripe integration + membership system
- [ ] Stripe webhook handler
- [ ] Membership expiry logic
- [ ] Admin panel layout & dashboard

### Phase 3 — Content (Weeks 5-6)
- [ ] Video upload (Cloudinary) + video player
- [ ] Premium video gating
- [ ] Blog CRUD with rich text editor
- [ ] Premium blog gating
- [ ] Gallery with lightbox

### Phase 4 — Engagement (Weeks 7-8)
- [ ] Comment system (threaded, paginated)
- [ ] Comment moderation
- [ ] Contact form with email notification
- [ ] Public pages (Home, About, Journey, FAQ)
- [ ] SEO (meta tags, sitemap, robots.txt)

### Phase 5 — Polish & Launch (Weeks 9-10)
- [ ] Admin analytics dashboard
- [ ] Payment history & logs
- [ ] Dark theme refinement + animations
- [ ] Responsive QA pass
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing
- [ ] Production deployment
- [ ] Domain + SSL setup

---

## 14. Technology Rationale

| Technology | Why |
|-----------|-----|
| **FastAPI** | Async, auto-docs via Swagger, Pydantic validation, high performance. |
| **SQLAlchemy** | Mature ORM, migration support via Alembic, async support. |
| **PostgreSQL** | Robust, supports UUID, JSONB for future flexibility. |
| **JWT (python-jose)** | Stateless auth, standard library, refresh token pattern. |
| **Cloudinary** | Automated image/video optimization, transformations, CDN delivery. |
| **Stripe** | Industry standard, webhook support, checkout customization. |
| **React + Vite** | Fast dev experience, tree-shaking, HMR. |
| **Tailwind CSS** | Utility-first, rapid prototyping, consistent design system. |
| **React Query** | Server state management, caching, auto-refetch. |
| **React Router** | Standard SPA routing, nested layouts, lazy loading. |
| **Framer Motion** | Declarative animations, gesture support, layout animations. |
| **Axios** | Interceptors for JWT refresh, request/response transforms. |

---

*Document Version 1.0 — Generated from project analysis*
