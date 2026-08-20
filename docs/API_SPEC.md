# API Specification

Base URL: `/api/v1`

## Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login, returns tokens |
| POST | `/auth/refresh` | Refresh | Refresh access token |
| POST | `/auth/logout` | JWT | Revoke refresh token |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Reset with token |

## Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | JWT | Current user profile |
| PATCH | `/users/me` | JWT | Update profile |
| PATCH | `/users/me/password` | JWT | Change password |
| DELETE | `/users/me` | JWT | Delete account (GDPR) |

## Membership
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/membership/status` | JWT | Membership status |
| POST | `/membership/create-checkout` | JWT | Stripe checkout |
| POST | `/membership/webhook` | Stripe sig | Stripe webhook |
| GET | `/membership/payments` | JWT | Payment history |

## Videos
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/videos` | No | List videos |
| GET | `/videos/{slug}` | No* | Video detail |
| POST | `/videos` | Admin | Create video |
| PATCH | `/videos/{slug}` | Admin | Update video |
| DELETE | `/videos/{slug}` | Admin | Delete video |
| GET | `/categories` | No | List categories |

*Premium content requires active membership.

## Blogs
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blogs` | No | List blogs |
| GET | `/blogs/{slug}` | No* | Blog detail |
| POST | `/blogs` | Admin | Create blog |
| PATCH | `/blogs/{slug}` | Admin | Update blog |
| DELETE | `/blogs/{slug}` | Admin | Delete blog |
| GET | `/tags` | No | List tags |

## Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/comments/video/{video_id}` | No | Video comments |
| GET | `/comments/blog/{blog_id}` | No | Blog comments |
| POST | `/comments` | Member | Create comment |
| DELETE | `/comments/{id}` | Owner/Admin | Delete comment |

## Gallery
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gallery` | No | List gallery |
| POST | `/gallery` | Admin | Upload image |
| PATCH | `/gallery/{id}` | Admin | Update image |
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
| PATCH | `/admin/users/{id}/membership` | Admin | Manage membership |
| GET | `/admin/payments` | Admin | Payment logs |
| GET | `/admin/comments` | Admin | All comments |
| DELETE | `/admin/comments/{id}` | Admin | Delete comment |
| GET | `/admin/settings` | Admin | Site settings |
| PATCH | `/admin/settings` | Admin | Update settings |

## Public
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/public/journey` | No | Journey timeline |
| GET | `/public/testimonials` | No | Testimonials |
| GET | `/public/site-settings` | No | Site config |

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
