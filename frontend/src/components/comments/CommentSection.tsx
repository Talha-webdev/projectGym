import { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useVideoComments, useBlogComments, useCreateComment, useUpdateComment, useDeleteComment } from "@/hooks/useComments";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface CommentSectionProps {
  videoId?: string;
  blogId?: string;
}

export function CommentSection({ videoId, blogId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth();

  const source = videoId ? { type: "video" as const, id: videoId } : { type: "blog" as const, id: blogId! };

  const videoQuery = useVideoComments(videoId ?? "");
  const blogQuery = useBlogComments(blogId ?? "");
  const { data, isLoading } = source.type === "video" ? videoQuery : blogQuery;

  const createMutation = useCreateComment();
  const updateMutation = useUpdateComment();
  const deleteMutation = useDeleteComment();

  const comments = data?.items || [];

  const totalComments = useMemo(() => {
    const topLevel = comments.filter((c) => !c.parent_id).length;
    const replies = comments.filter((c) => c.parent_id).length;
    return topLevel + replies;
  }, [comments]);

  const handleCreate = async (content: string) => {
    const payload: { content: string; video_id?: string; blog_id?: string } = { content };
    if (videoId) payload.video_id = videoId;
    if (blogId) payload.blog_id = blogId;
    await createMutation.mutateAsync(payload);
  };

  const handleReply = async (parentId: string, content: string) => {
    const payload: { content: string; parent_id: string; video_id?: string; blog_id?: string } = { content, parent_id: parentId };
    if (videoId) payload.video_id = videoId;
    if (blogId) payload.blog_id = blogId;
    await createMutation.mutateAsync(payload);
  };

  const handleEdit = async (commentId: string, content: string) => {
    const sourceInfo: { video_id?: string; blog_id?: string } = {};
    if (videoId) sourceInfo.video_id = videoId;
    if (blogId) sourceInfo.blog_id = blogId;
    await updateMutation.mutateAsync({ commentId, data: { content }, source: sourceInfo });
  };

  const handleDelete = async (commentId: string) => {
    const sourceInfo: { video_id?: string; blog_id?: string } = {};
    if (videoId) sourceInfo.video_id = videoId;
    if (blogId) sourceInfo.blog_id = blogId;
    await deleteMutation.mutateAsync({ commentId, source: sourceInfo });
  };

  return (
    <section className="mt-12 border-t border-gym-border-light pt-8">
      <div className="mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-gym-gold" />
        <h2 className="font-heading text-lg font-bold text-gym-text-primary">
          Comments
        </h2>
        {!isLoading && totalComments > 0 && (
          <span className="rounded-full bg-gym-surface px-2.5 py-0.5 text-xs text-gym-text-muted">
            {totalComments}
          </span>
        )}
      </div>

      {isAuthenticated ? (
        <CommentForm onSubmit={handleCreate} />
      ) : (
        <div className="mb-6 rounded-xl border border-gym-border-light bg-gym-surface p-4 text-center">
          <p className="text-sm text-gym-text-secondary">
            <a href="/login" className="text-gym-gold hover:underline">
              Sign in
            </a>{" "}
            to join the conversation.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton variant="circular" className="h-8 w-8" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-10 w-10" />}
          title="No comments yet"
          description="Be the first to share your thoughts."
        />
      ) : (
        <CommentList
          comments={comments}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
