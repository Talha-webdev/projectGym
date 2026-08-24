import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Play, Clock, Eye } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useVideos, useCategories } from "@/hooks/useVideos";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { formatDuration } from "@/utils/formatters";

export default function Videos() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, per_page: 12 };
  if (search) params.search = search;
  if (activeCategory) params.category = activeCategory;

  const { data, isLoading } = useVideos(params);
  const { data: categories } = useCategories();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
    },
    []
  );

  return (
    <>
      <SEOHead
        title="Videos"
        description="Browse our collection of workout videos. From beginner to advanced, find the perfect routine for your fitness level."
        canonical="/videos"
      />
      <div>
      <section className="relative pt-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gym-bg via-gym-bg to-gym-surface/50" />
        <div className="relative z-10 content-max-width px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Workouts
            </span>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-gym-text-primary">
              Video Library
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gym-text-secondary">
              Workout videos, tutorials, and guided sessions to help you reach your goals.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="content-max-width px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 space-y-4"
          >
            <form onSubmit={handleSearch} className="relative mx-auto max-w-md">
              <label htmlFor="videos-search" className="sr-only">Search videos</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gym-text-muted" />
              <input
                id="videos-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search videos..."
                className="w-full rounded-xl border border-gym-border-light bg-gym-surface py-3 pl-10 pr-4 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all duration-200 focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
              />
            </form>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => { setActiveCategory(null); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  !activeCategory
                    ? "bg-gym-gold text-black"
                    : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => { setActiveCategory(cat.slug); setPage(1); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat.slug
                      ? "bg-gym-gold text-black"
                      : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-gym-border bg-gym-surface">
                  <Skeleton variant="rectangular" className="aspect-video w-full !rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items?.length === 0 ? (
            <EmptyState
              title="No videos found"
              description={search ? "Try a different search term." : "No videos available yet."}
            />
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {data?.items?.map((video) => (
                  <motion.div key={video.id} variants={fadeInUp}>
                    <Link to={`/videos/${video.slug}`} className="group block">
                      <div className="overflow-hidden rounded-xl border border-gym-border bg-gym-surface transition-all duration-300 hover:border-gym-gold/30 hover:shadow-lg">
                        <div className="relative aspect-video bg-gym-elevated">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Play className="h-10 w-10 text-gym-text-muted" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gym-gold/90 text-black opacity-0 transition-all duration-300 group-hover:opacity-100">
                              <Play className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="absolute right-2 top-2 flex gap-1.5">
                          </div>
                          {video.duration && (
                            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                              <Clock className="h-3 w-3" />
                              {formatDuration(video.duration)}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="mb-1 text-xs text-gym-text-muted">
                            {video.category || "General"}
                          </p>
                          <h3 className="line-clamp-2 font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                            {video.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-3 text-xs text-gym-text-muted">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {video.view_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {data?.pagination && (
                <div className="mt-10">
                  <Pagination
                    page={data.pagination.page}
                    totalPages={data.pagination.total_pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
    </>
  );
}
