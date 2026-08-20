import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
  isReply?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  initialValue = "",
  submitLabel = "Post Comment",
  isReply = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setContent("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post comment. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={`${isReply ? "mt-3 pl-6" : "mb-6"}`}
    >
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={isReply ? 2 : 3}
          className="w-full resize-none rounded-xl border border-gym-border-light bg-gym-surface px-4 py-3 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all focus:border-gym-gold/50 focus:ring-1 focus:ring-gym-gold/20"
          maxLength={2000}
        />
        <span className="absolute bottom-3 right-3 text-xs text-gym-text-muted">
          {content.length}/2000
        </span>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-gym-error">{error}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {submitLabel}
        </Button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gym-text-muted transition-colors hover:text-gym-text-primary"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.form>
  );
}
