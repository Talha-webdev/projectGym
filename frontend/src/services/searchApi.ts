import api from "@/services/api";
import type { SearchResponse } from "@/types/search";

export const searchApi = {
  global: (params: { q: string; page?: number; per_page?: number }) =>
    api.get<SearchResponse>("/search", { params }),
};
