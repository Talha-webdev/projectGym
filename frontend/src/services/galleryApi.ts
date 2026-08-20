import api from "@/services/api";
import type { GalleryItem } from "@/types/gallery";
import type { PaginatedResponse } from "@/types/api";

export const galleryApi = {
  list: (params?: { category?: string; page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<GalleryItem>>("/gallery", { params }),
};
