import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Blog, BlogDetail, Tag } from "@/types/blog";
import type { PaginatedResponse } from "@/types/api";

export function useBlogs(params?: Record<string, string | number>) {
  return useQuery<PaginatedResponse<Blog>>({
    queryKey: ["blogs", params],
    queryFn: async () => {
      const { data } = await api.get("/blogs", { params });
      return data;
    },
  });
}

export function useBlog(slug: string) {
  return useQuery<BlogDetail>({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data } = await api.get("/blogs/tags/list");
      return data;
    },
  });
}
