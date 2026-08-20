import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { GalleryItem } from "@/types/gallery";
import type { PaginatedResponse } from "@/types/api";

export function useGallery(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<GalleryItem>>({
    queryKey: ["gallery", params],
    queryFn: async () => {
      const { data } = await api.get("/gallery", { params });
      return data;
    },
  });
}