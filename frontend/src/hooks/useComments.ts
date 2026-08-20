import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "@/services/commentApi";
import type { Comment } from "@/types/comment";
import type { PaginatedResponse } from "@/types/api";

export function useVideoComments(videoId: string) {
  return useQuery<PaginatedResponse<Comment>>({
    queryKey: ["comments", "video", videoId],
    queryFn: async () => {
      const { data } = await commentApi.getVideoComments(videoId);
      return data;
    },
    enabled: !!videoId,
  });
}

export function useBlogComments(blogId: string) {
  return useQuery<PaginatedResponse<Comment>>({
    queryKey: ["comments", "blog", blogId],
    queryFn: async () => {
      const { data } = await commentApi.getBlogComments(blogId);
      return data;
    },
    enabled: !!blogId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      content: string;
      video_id?: string;
      blog_id?: string;
      parent_id?: string;
    }) => {
      const response = await commentApi.create(data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.video_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "video", variables.video_id] });
      }
      if (variables.blog_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "blog", variables.blog_id] });
      }
    },
  });
}

export function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
      data,
    }: {
      commentId: string;
      data: { content: string };
      source: { video_id?: string; blog_id?: string };
    }) => {
      const response = await commentApi.update(commentId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      if (variables.source.video_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "video", variables.source.video_id] });
      }
      if (variables.source.blog_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "blog", variables.source.blog_id] });
      }
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      commentId,
    }: {
      commentId: string;
      source: { video_id?: string; blog_id?: string };
    }) => {
      await commentApi.delete(commentId);
    },
    onSuccess: (_, variables) => {
      if (variables.source.video_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "video", variables.source.video_id] });
      }
      if (variables.source.blog_id) {
        queryClient.invalidateQueries({ queryKey: ["comments", "blog", variables.source.blog_id] });
      }
    },
  });
}
