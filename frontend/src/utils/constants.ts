export const APP_NAME = "LH Fitness";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  JOURNEY: "/journey",
  VIDEOS: "/videos",
  VIDEO_DETAIL: (slug: string) => `/videos/${slug}`,
  BLOGS: "/blogs",
  BLOG_DETAIL: (slug: string) => `/blogs/${slug}`,
  GALLERY: "/gallery",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_VIDEOS: "/admin/videos",
  ADMIN_BLOGS: "/admin/blogs",
  ADMIN_GALLERY: "/admin/gallery",
  ADMIN_USERS: "/admin/users",
  ADMIN_COMMENTS: "/admin/comments",
  ADMIN_SETTINGS: "/admin/settings",
} as const;

export const QUERY_KEYS = {
  VIDEOS: "videos",
  VIDEO: "video",
  BLOGS: "blogs",
  BLOG: "blog",
  CATEGORIES: "categories",
  TAGS: "tags",
  COMMENTS: "comments",
  PROFILE: "profile",
  ADMIN_DASHBOARD: "admin-dashboard",
  ADMIN_USERS: "admin-users",
  ADMIN_COMMENTS: "admin-comments",
  ADMIN_SETTINGS: "admin-settings",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
  MAX_PER_PAGE: 50,
} as const;

export const TOKEN_KEYS = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
} as const;
