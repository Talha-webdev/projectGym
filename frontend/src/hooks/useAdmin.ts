import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/adminApi";
import type { DashboardData, AdminUser, AdminPayment, AdminComment, MembershipActionData, SiteSettings } from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";

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

export function useManageMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: MembershipActionData }) => {
      const response = await adminApi.manageMembership(userId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminPayments(params?: { page?: number; per_page?: number }) {
  return useQuery<PaginatedResponse<AdminPayment>>({
    queryKey: ["admin", "payments", params],
    queryFn: async () => {
      const { data } = await adminApi.getPayments(params);
      return data;
    },
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
