# Database Design

## ER Diagram
```
users 1──N refresh_tokens
users 1──1 memberships
users 1──N payments
users 1──N comments
videos 1──N comments
blogs  1──N comments
comments N──1 comments (self-ref, parent_id)
videos M──N categories (via video_categories)
blogs  M──N tags (via blog_tags)
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(100) | NOT NULL |
| avatar_url | TEXT | NULLABLE |
| is_admin | BOOLEAN | DEFAULT FALSE, partial unique TRUE |
| is_verified | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### memberships
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK, UNIQUE |
| is_active | BOOLEAN | DEFAULT FALSE |
| start_date | TIMESTAMPTZ | NULLABLE |
| end_date | TIMESTAMPTZ | NULLABLE |
| stripe_subscription_id | VARCHAR(255) | UNIQUE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### payments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK |
| stripe_session_id | VARCHAR(255) | UNIQUE, NOT NULL |
| stripe_payment_intent_id | VARCHAR(255) | NULLABLE |
| amount | DECIMAL(10,2) | NOT NULL |
| currency | VARCHAR(3) | DEFAULT 'usd' |
| status | VARCHAR(50) | CHECK IN ('completed','failed','refunded') |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### videos
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(250) | UNIQUE, NOT NULL |
| description | TEXT | NULLABLE |
| cloudinary_public_id | VARCHAR(255) | NOT NULL |
| cloudinary_url | TEXT | NOT NULL |
| thumbnail_url | TEXT | NULLABLE |
| duration | INTEGER | NULLABLE |
| is_premium | BOOLEAN | DEFAULT FALSE |
| view_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| slug | VARCHAR(120) | UNIQUE, NOT NULL |

### video_categories
Composite PK: (video_id, category_id)

### blogs
| Column | Type | Constraints |
|--------|------|-------------|
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
| published_at | TIMESTAMPTZ | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### tags
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| slug | VARCHAR(60) | UNIQUE, NOT NULL |

### blog_tags
Composite PK: (blog_id, tag_id)

### comments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK |
| video_id | UUID | FK, NULLABLE |
| blog_id | UUID | FK, NULLABLE |
| parent_id | UUID | FK (self), NULLABLE |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

CHECK: Exactly one of video_id or blog_id must be non-null.

### gallery
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(200) | NULLABLE |
| cloudinary_public_id | VARCHAR(255) | NOT NULL |
| cloudinary_url | TEXT | NOT NULL |
| category | VARCHAR(100) | NULLABLE |
| sort_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### refresh_tokens
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| user_id | UUID | FK |
| token_hash | VARCHAR(255) | UNIQUE, NOT NULL |
| expires_at | TIMESTAMPTZ | NOT NULL |
| revoked | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### site_settings
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| key | VARCHAR(100) | UNIQUE, NOT NULL |
| value | TEXT | NOT NULL |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

## Indexes
- `videos.slug` UNIQUE, `videos.created_at` DESC, `videos.is_premium`
- `blogs.slug` UNIQUE, `blogs.published_at` DESC, `blogs.is_premium`
- `comments.video_id + created_at`, `comments.blog_id + created_at`
- `comments.parent_id` (for threaded loading)
- `memberships.is_active + end_date` (expiry cron)
- `payments.user_id + created_at`
- Partial: `users.is_admin WHERE TRUE`, `memberships.is_active WHERE TRUE`

## Foreign Keys
All CASCADE on delete except payments (RESTRICT). Comment parent_id: SET NULL on delete.
