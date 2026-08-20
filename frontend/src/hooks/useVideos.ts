import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Video, Category } from "@/types/video";
import type { PaginatedResponse } from "@/types/api";

export function useVideos(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Video>>({
    queryKey: ["videos", params],
    queryFn: async () => {
      const { data } = await api.get("/videos", { params });
      return data;
    },
  });
}

export function useVideo(slug: string) {
  return useQuery<Video>({
    queryKey: ["video", slug],
    queryFn: async () => {
      const { data } = await api.get(`/videos/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/videos/categories/list");
      return data;
    },
  });
}
