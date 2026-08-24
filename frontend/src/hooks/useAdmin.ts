import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { adminApi } from "@/services/adminApi";
import type { DashboardData, AdminUser, AdminComment, SiteSettings } from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";
import type { BlogDetail } from "@/types/blog";

interface UploadPayload {
  formData: FormData;
  onUploadProgress?: (e: AxiosProgressEvent) => void;
}

export function useAdminDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const { data } = await adminApi.getDashboard();
      return data;
    },
  });
}

export function useAdminUsers(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery<PaginatedResponse<AdminUser>>({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await adminApi.getUsers(params);
      return data;
    },
  });
}

export function useAdminUserDetail(userId: string) {
  return useQuery<AdminUser>({
    queryKey: ["admin", "users", userId],
    queryFn: async () => {
      const { data } = await adminApi.getUserDetail(userId);
      return data;
    },
    enabled: !!userId,
  });
}

export function useAdminComments(params?: { page?: number; per_page?: number }) {
  return useQuery<PaginatedResponse<AdminComment>>({
    queryKey: ["admin", "comments", params],
    queryFn: async () => {
      const { data } = await adminApi.getComments(params);
      return data;
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      await adminApi.deleteComment(commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    },
  });
}

export function useAdminSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data } = await adminApi.getSettings();
      return data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: SiteSettings) => {
      const response = await adminApi.updateSettings(settings);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await adminApi.createVideo(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Record<string, unknown> }) => {
      const response = await adminApi.updateVideo(slug, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await adminApi.deleteVideo(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await adminApi.createBlog(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
  });
}

export function useAdminBlogs(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<BlogDetail>>({
    queryKey: ["admin", "blogs", params],
    queryFn: async () => {
      const { data } = await adminApi.getAdminBlogs(params);
      return data;
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: Record<string, unknown> }) => {
      const response = await adminApi.updateBlog(slug, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      await adminApi.deleteBlog(slug);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "blogs"] });
    },
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await adminApi.createGallery(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const response = await adminApi.updateGallery(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useDeleteGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await adminApi.deleteGallery(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData, onUploadProgress }: UploadPayload) => {
      const response = await adminApi.uploadVideo(formData, onUploadProgress);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUploadGallery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ formData, onUploadProgress }: UploadPayload) => {
      const response = await adminApi.uploadGallery(formData, onUploadProgress);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useUploadBlogCover() {
  return useMutation({
    mutationFn: async ({ formData, onUploadProgress }: UploadPayload) => {
      const response = await adminApi.uploadBlogCover(formData, onUploadProgress);
      return response.data;
    },
  });
}

export function useUploadThumbnail() {
  return useMutation({
    mutationFn: async ({ formData, onUploadProgress }: UploadPayload) => {
      const response = await adminApi.uploadThumbnail(formData, onUploadProgress);
      return response.data;
    },
  });
}
