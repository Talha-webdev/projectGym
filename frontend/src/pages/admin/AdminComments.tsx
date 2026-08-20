import { useState } from "react";
import { MessageSquare, Trash2, Film, FileText } from "lucide-react";
import { useAdminComments, useDeleteComment } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { formatRelativeTime } from "@/utils/formatters";

export default function AdminComments() {
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { data, isLoading, error } = useAdminComments({ page, per_page: 20 });
  const deleteComment = useDeleteComment();

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync(commentId);
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Comments</h1>
        <p className="mt-1 text-sm text-gym-text-secondary">Moderate all user comments across the platform.</p>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load comments. Please try again.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="space-y-3">
          {data.items.map((comment) => (
            <Card key={comment.id} className="p-4" hover={false}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gym-gold/20 text-[10px] font-bold text-gym-gold">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gym-text-primary">{comment.user_name}</span>
                    <span className="text-xs text-gym-text-muted">· {formatRelativeTime(comment.created_at)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gym-text-secondary line-clamp-2">{comment.content}</p>
                  {comment.source_type && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {comment.source_type === "video" ? (
                        <Film className="h-3 w-3 text-gym-text-muted" />
                      ) : (
                        <FileText className="h-3 w-3 text-gym-text-muted" />
                      )}
                      <span className="text-xs text-gym-text-muted">
                        On {comment.source_type}: {comment.source_title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={comment.source_type === "video" ? "info" : "default"}>
                    {comment.source_type || "Unknown"}
                  </Badge>
                  <button
                    onClick={() => setConfirmDelete(comment.id)}
                    className="rounded-lg p-1.5 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-error"
                    disabled={deleteComment.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No comments found.</p>
        </Card>
      )}

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gym-text-muted">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!data.pagination.has_prev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={!data.pagination.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Comment">
        <div className="space-y-4">
          <p className="text-sm text-gym-text-secondary">Are you sure you want to permanently delete this comment? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)} isLoading={deleteComment.isPending}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
