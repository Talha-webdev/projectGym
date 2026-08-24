import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Clock, Eye } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useBlogs, useTags } from "@/hooks/useBlogs";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { EmptyState } from "@/components/common/EmptyState";
import { staggerContainer, fadeInUp } from "@/utils/animations";
import { formatReadTime, formatDate, formatViewCount } from "@/utils/formatters";

export default function Blogs() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const params: Record<string, string | number> = { page, per_page: 12 };
  if (search) params.search = search;
  if (activeTag) params.tag = activeTag;

  const { data, isLoading } = useBlogs(params);
  const { data: tags } = useTags();

  return (
    <>
      <SEOHead
        title="Blogs"
        description="Read expert fitness articles, nutrition guides, and transformation stories. Stay informed and motivated on your fitness journey."
        canonical="/blogs"
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
              Articles
            </span>
            <h1 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-gym-text-primary">
              Blog
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-gym-text-secondary">
              Insights, tips, and stories from the transformation journey.
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
            <form
              onSubmit={(e) => { e.preventDefault(); setPage(1); }}
              className="relative mx-auto max-w-md"
            >
              <label htmlFor="blogs-search" className="sr-only">Search articles</label>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gym-text-muted" />
              <input
                id="blogs-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full rounded-xl border border-gym-border-light bg-gym-surface py-3 pl-10 pr-4 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all duration-200 focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
              />
            </form>

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => { setActiveTag(null); setPage(1); }}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  !activeTag
                    ? "bg-gym-gold text-black"
                    : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                }`}
              >
                All
              </button>
              {tags?.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => { setActiveTag(t.slug); setPage(1); }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeTag === t.slug
                      ? "bg-gym-gold text-black"
                      : "border border-gym-border-light bg-gym-surface text-gym-text-secondary hover:border-gym-gold/30 hover:text-gym-gold"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="overflow-hidden rounded-xl border border-gym-border bg-gym-surface">
                  <Skeleton variant="rectangular" className="aspect-video w-full !rounded-none" />
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.items?.length === 0 ? (
            <EmptyState
              title="No articles found"
              description={search ? "Try a different search term." : "No articles published yet."}
            />
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {data?.items?.map((blog) => (
                  <motion.div key={blog.id} variants={fadeInUp}>
                    <Link to={`/blogs/${blog.slug}`} className="group block">
                      <div className="overflow-hidden rounded-xl border border-gym-border bg-gym-surface transition-all duration-300 hover:border-gym-gold/30 hover:shadow-lg">
                        <div className="relative aspect-video bg-gym-elevated">
                          {blog.cover_image_url ? (
                            <img
                              src={blog.cover_image_url}
                              alt={blog.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <span className="font-heading text-5xl font-bold text-gym-gold/20">
                                {blog.title.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="absolute right-2 top-2">
                          </div>
                        </div>
                        <div className="p-4">
                          {blog.tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {blog.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gym-surface px-2 py-0.5 text-[10px] text-gym-text-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="line-clamp-2 font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                            {blog.title}
                          </h3>
                          {blog.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm text-gym-text-secondary">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="mt-3 flex items-center gap-3 text-xs text-gym-text-muted">
                            {blog.read_time_minutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatReadTime(blog.read_time_minutes)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {formatViewCount(blog.view_count)}
                            </span>
                            {blog.published_at && (
                              <span>{formatDate(blog.published_at)}</span>
                            )}
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
