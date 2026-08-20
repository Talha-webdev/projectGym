import { memo } from "react";
import type { Comment } from "@/types/comment";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentList = memo(function CommentList({
  comments,
  onReply,
  onEdit,
  onDelete,
}: CommentListProps) {
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const getReplies = (parentId: string) =>
    replies.filter((r) => r.parent_id === parentId);

  return (
    <div className="space-y-5">
      {topLevel.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          replies={getReplies(comment.id)}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});
