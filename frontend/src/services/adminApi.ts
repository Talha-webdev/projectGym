import api from "@/services/api";
import type { PaginatedResponse } from "@/types/api";
import type { Video } from "@/types/video";
import type { BlogDetail } from "@/types/blog";
import type { GalleryItem } from "@/types/gallery";
import type {
  DashboardData,
  AdminUser,
  AdminPayment,
  AdminComment,
  MembershipActionData,
  SiteSettings,
} from "@/types/admin";

export const adminApi = {
  getDashboard: () =>
    api.get<DashboardData>("/admin/dashboard"),

  getUsers: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get<PaginatedResponse<AdminUser>>("/admin/users", { params }),

  getUserDetail: (userId: string) =>
    api.get<AdminUser>(`/admin/users/${userId}`),

  manageMembership: (userId: string, data: MembershipActionData) =>
    api.patch<AdminUser>(`/admin/users/${userId}/membership`, data),

  getPayments: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<AdminPayment>>("/admin/payments", { params }),

  getComments: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<AdminComment>>("/admin/comments", { params }),

  deleteComment: (commentId: string) =>
    api.delete(`/admin/comments/${commentId}`),

  getSettings: () =>
    api.get<SiteSettings>("/admin/settings"),

  updateSettings: (settings: SiteSettings) =>
    api.patch<SiteSettings>("/admin/settings", settings),

  createVideo: (data: Record<string, unknown>) =>
    api.post<Video>("/videos", data),

  updateVideo: (slug: string, data: Record<string, unknown>) =>
    api.patch<Video>(`/videos/${slug}`, data),

  deleteVideo: (slug: string) =>
    api.delete(`/videos/${slug}`),

  createBlog: (data: Record<string, unknown>) =>
    api.post<BlogDetail>("/blogs", data),

  updateBlog: (slug: string, data: Record<string, unknown>) =>
    api.patch<BlogDetail>(`/blogs/${slug}`, data),

  deleteBlog: (slug: string) =>
    api.delete(`/blogs/${slug}`),

  createGallery: (data: Record<string, unknown>) =>
    api.post<GalleryItem>("/gallery", data),

  updateGallery: (id: string, data: Record<string, unknown>) =>
    api.patch<GalleryItem>(`/gallery/${id}`, data),

  deleteGallery: (id: string) =>
    api.delete(`/gallery/${id}`),
};
