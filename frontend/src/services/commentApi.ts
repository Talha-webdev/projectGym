import api from "@/services/api";
import type { Comment } from "@/types/comment";
import type { PaginatedResponse } from "@/types/api";

interface CreateCommentData {
  content: string;
  video_id?: string;
  blog_id?: string;
  parent_id?: string;
}

interface UpdateCommentData {
  content: string;
}

export const commentApi = {
  getVideoComments: (videoId: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Comment>>(`/comments/video/${videoId}`, { params }),

  getBlogComments: (blogId: string, params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Comment>>(`/comments/blog/${blogId}`, { params }),

  create: (data: CreateCommentData) =>
    api.post<Comment>("/comments", data),

  update: (commentId: string, data: UpdateCommentData) =>
    api.patch<Comment>(`/comments/${commentId}`, data),

  delete: (commentId: string) =>
    api.delete(`/comments/${commentId}`),
};
