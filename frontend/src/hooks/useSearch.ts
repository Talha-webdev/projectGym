import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/services/searchApi";
import type { SearchResponse } from "@/types/search";

export function useSearch(q: string, page: number = 1) {
  return useQuery<SearchResponse>({
    queryKey: ["search", q, page],
    queryFn: async () => {
      const { data } = await searchApi.global({ q, page, per_page: 12 });
      return data;
    },
    enabled: q.trim().length > 0,
    placeholderData: (prev) => prev,
  });
}
