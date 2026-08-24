# API Specification

Base URL: `/api/v1`

## Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register user (sends verification email) |
| POST | `/auth/login` | No | Login, returns tokens |
| POST | `/auth/refresh` | Refresh | Refresh access token |
| POST | `/auth/logout` | JWT | Blacklist access token, revoke refresh token |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Reset with token |
| POST | `/auth/verify-email` | No | Verify email with token |

## Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | JWT | Current user profile |
| PATCH | `/users/me` | JWT | Update profile |
| PATCH | `/users/me/password` | JWT | Change password |

## Videos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/videos` | No | List videos |
| GET | `/videos/{slug}` | No | Video detail |
| POST | `/videos` | Admin | Create video |
| PATCH | `/videos/{slug}` | Admin | Update video |
| DELETE | `/videos/{slug}` | Admin | Delete video |
| GET | `/categories` | No | List categories |

## Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blogs` | No | List blogs |
| GET | `/blogs/{slug}` | No | Blog detail |
| POST | `/blogs` | Admin | Create blog |
| PATCH | `/blogs/{slug}` | Admin | Update blog |
| DELETE | `/blogs/{slug}` | Admin | Delete blog |
| GET | `/tags` | No | List tags |

## Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/comments/video/{video_id}` | No | Video comments |
| GET | `/comments/blog/{blog_id}` | No | Blog comments |
| POST | `/comments` | JWT | Create comment |
| DELETE | `/comments/{id}` | Owner/Admin | Delete comment |

## Gallery
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery` | No | List gallery |
| POST | `/gallery` | Admin | Upload image |
| DELETE | `/gallery/{id}` | Admin | Delete image |

## Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/contact` | No | Submit contact form |

## Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Analytics |
| GET | `/admin/users` | Admin | List users |
| GET | `/admin/users/{id}` | Admin | User detail |
| GET | `/admin/comments` | Admin | All comments |
| DELETE | `/admin/comments/{id}` | Admin | Delete comment |
| GET | `/admin/settings` | Admin | Site settings |
| PATCH | `/admin/settings` | Admin | Update settings |

## Uploads
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/uploads/image` | Admin | Upload image to Cloudinary |
| POST | `/uploads/video` | Admin | Upload video to Cloudinary |

## Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | No | Global search across content |

## Public
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public/website-settings` | No | Site config (typed response) |
| GET | `/public/journey` | No | Journey timeline |
| GET | `/public/statistics` | No | Site statistics |
| GET | `/public/faq` | No | FAQ entries |

## SEO
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/sitemap.xml` | No | Dynamic sitemap |
| GET | `/robots.txt` | No | Robots file |

## Standard Response Formats
### Success
```json
{ "items": [...], "pagination": { "page": 1, "per_page": 12, "total": 47, "total_pages": 4, "has_next": true, "has_prev": false } }
```

### Error
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [{"field": "email", "message": "..."}] } }
```

### HTTP Status Codes
200 Success, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Rate Limited, 500 Internal Error
