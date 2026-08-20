import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Comment } from "@/types/comment";
import { useAuth } from "@/store/AuthContext";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/utils/formatters";
import { CommentForm } from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem = memo(function CommentItem({
  comment,
  replies = [],
  onReply,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const { user, isAdmin } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.user.id;
  const canModerate = isOwner || isAdmin;

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  };

  const handleEdit = async (content: string) => {
    await onEdit(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group ${comment.parent_id ? "ml-8 border-l-2 border-gym-border-light pl-4" : ""}`}
    >
      <div className="flex gap-3">
        <Avatar
          src={comment.user.avatar_url || undefined}
          alt={comment.user.full_name}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gym-text-primary">
              {comment.user.full_name}
            </span>
            <span className="text-xs text-gym-text-muted">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CommentForm
                  onSubmit={handleEdit}
                  onCancel={() => setIsEditing(false)}
                  initialValue={comment.content}
                  submitLabel="Save"
                  isReply
                />
              </motion.div>
            ) : (
              <motion.p
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-0.5 text-sm leading-relaxed text-gym-text-secondary"
              >
                {comment.content}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-1.5 flex items-center gap-3">
            {!comment.parent_id && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-gold"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            {canModerate && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-gold"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-error"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </>
            )}
          </div>

          <AnimatePresence>
            {showReplyForm && (
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write a reply..."
                submitLabel="Reply"
                isReply
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="mb-2 flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-gold"
          >
            {showReplies ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>

          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    replies={[]}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
});
