import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Film, FileText, Image, X, Loader2, ArrowRight } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/utils/formatters";
import type { SearchResultItem } from "@/types/search";

const sourceIcons = {
  video: Film,
  blog: FileText,
  gallery: Image,
} as const;

const sourceLabels = {
  video: "Video",
  blog: "Blog",
  gallery: "Gallery",
} as const;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setDebouncedQuery("");
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching } = useSearch(debouncedQuery, page);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleResultClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-2xl"
          >
            <div className="overflow-hidden rounded-2xl border border-gym-border bg-gym-surface shadow-2xl">
              <div className="flex items-center gap-3 border-b border-gym-border px-5 py-4">
                <label htmlFor="search-modal-input" className="sr-only">Search</label>
                <Search className="h-5 w-5 flex-shrink-0 text-gym-text-muted" />
                <input
                  id="search-modal-input"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search videos, blogs, gallery..."
                  className="min-w-0 flex-1 bg-transparent text-base text-gym-text-primary outline-none placeholder:text-gym-text-muted"
                />
                {isFetching && (
                  <Loader2 className="h-4 w-4 animate-spin text-gym-gold" />
                )}
                <kbd className="hidden rounded-md border border-gym-border bg-gym-elevated px-2 py-0.5 text-[11px] text-gym-text-muted sm:inline-block">
                  ESC
                </kbd>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1 text-gym-text-muted transition-colors hover:bg-gym-elevated hover:text-gym-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {!debouncedQuery ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="h-10 w-10 text-gym-text-muted" />
                    <p className="mt-3 text-sm text-gym-text-secondary">
                      Type to search across all content
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex animate-pulse items-center gap-4 rounded-xl bg-gym-elevated/50 p-4"
                      >
                        <div className="h-12 w-16 flex-shrink-0 rounded-lg bg-gym-elevated" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-gym-elevated" />
                          <div className="h-3 w-1/2 rounded bg-gym-elevated" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : data && data.items.length > 0 ? (
                  <div>
                    <div className="space-y-1 p-2">
                      {data.items.map((item) => (
                        <SearchResultCard
                          key={`${item.source_type}-${item.id}`}
                          item={item}
                          onClick={handleResultClick}
                        />
                      ))}
                    </div>
                    {data.total_pages > 1 && (
                      <div className="flex items-center justify-between border-t border-gym-border px-5 py-3">
                        <p className="text-xs text-gym-text-muted">
                          {data.total} results — Page {data.page} of {data.total_pages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!data.has_prev}
                            onClick={() => setPage((p) => p - 1)}
                          >
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!data.has_next}
                            onClick={() => setPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="h-10 w-10 text-gym-text-muted" />
                    <p className="mt-3 text-sm font-medium text-gym-text-primary">
                      No results for "{debouncedQuery}"
                    </p>
                    <p className="mt-1 text-xs text-gym-text-muted">
                      Try a different search term
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SearchResultCard({
  item,
  onClick,
}: {
  item: SearchResultItem;
  onClick: () => void;
}) {
  const Icon = sourceIcons[item.source_type];
  const href =
    item.source_type === "video"
      ? `/videos/${item.slug}`
      : item.source_type === "blog"
        ? `/blogs/${item.slug}`
        : `/gallery`;

  return (
    <Link
      to={href}
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-gym-elevated"
    >
      <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gym-elevated">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Icon className="h-5 w-5 text-gym-text-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-gym-text-primary">
            {item.title}
          </span>
          {item.is_premium && (
            <Badge variant="premium" className="flex-shrink-0 text-[0.55rem]">
              Premium
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge variant="default" className="text-[0.6rem]">
            <Icon className="mr-0.5 h-2.5 w-2.5" />
            {sourceLabels[item.source_type]}
          </Badge>
          {item.excerpt && (
            <span className="line-clamp-1 text-xs text-gym-text-muted">
              {item.excerpt}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[10px] text-gym-text-muted">
          {formatRelativeTime(item.created_at)}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-gym-text-muted" />
    </Link>
  );
}
