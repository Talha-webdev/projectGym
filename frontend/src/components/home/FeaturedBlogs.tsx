import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { useBlogs } from "@/hooks/useBlogs";
import { Badge } from "@/components/ui/Badge";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { formatDate, formatReadTime } from "@/utils/formatters";

export function FeaturedBlogs() {
  const { data, isLoading } = useBlogs({ per_page: 3 });

  return (
    <section className="section-padding">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <span className="mb-4 inline-block rounded-full border border-gym-gold/30 bg-gym-gold-muted px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gym-gold">
              Articles
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              Featured Blogs
            </h2>
          </div>
          <Link
            to="/blogs"
            className="hidden items-center gap-1 text-sm font-medium text-gym-gold transition-colors hover:text-gym-gold-hover sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items?.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
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
                          <svg className="h-10 w-10 text-gym-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                      )}
                      {blog.is_premium && (
                        <div className="absolute right-2 top-2">
                          <Badge variant="premium">Premium</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        {blog.tags?.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-xs text-gym-gold">{tag}</span>
                        ))}
                      </div>
                      <h3 className="font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold line-clamp-2">
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p className="mt-2 text-sm text-gym-text-secondary line-clamp-2">{blog.excerpt}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-gym-text-muted">
                        {blog.published_at && <span>{formatDate(blog.published_at)}</span>}
                        {blog.read_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatReadTime(blog.read_time_minutes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 rounded-lg border border-gym-border-light px-6 py-3 text-sm font-medium text-gym-gold transition-colors hover:bg-gym-gold-muted"
          >
            View All Blogs <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}