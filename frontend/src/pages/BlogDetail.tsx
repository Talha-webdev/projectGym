import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, Calendar } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useBlog, useBlogs } from "@/hooks/useBlogs";
import { articleSchema, canonicalUrl } from "@/utils/seo";
import { Skeleton } from "@/components/ui/Skeleton";
import { lazy, Suspense } from "react";
const CommentSection = lazy(() => import("@/components/comments/CommentSection").then(m => ({ default: m.CommentSection })));
import { formatReadTime, formatDate, formatViewCount } from "@/utils/formatters";
import { fadeInUp } from "@/utils/animations";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug || "");
  const { data: relatedData } = useBlogs({ per_page: 5 });

  if (isLoading) {
    return (
      <div className="section-padding pt-32">
        <div className="content-max-width px-4">
          <div className="mx-auto max-w-3xl">
            <Skeleton variant="rectangular" className="aspect-video w-full rounded-2xl" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="section-padding pt-32 text-center">
        <div className="content-max-width px-4">
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Article not found</h1>
          <p className="mt-2 text-gym-text-secondary">The article you're looking for doesn't exist.</p>
          <Link to="/blogs" className="mt-6 inline-block text-gym-gold hover:underline">
            &larr; Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  const related = relatedData?.items?.filter((b) => b.slug !== slug).slice(0, 3) || [];

  const blogJsonLd = articleSchema({
    title: blog.title,
    description: blog.excerpt || blog.meta_description,
    slug: blog.slug,
    imageUrl: blog.cover_image_url,
    datePublished: blog.published_at || blog.created_at,
  });

  return (
    <>
      <SEOHead
        title={blog.title}
        description={blog.excerpt || blog.meta_description || `Read ${blog.title} on LH Fitness`}
        ogImage={blog.cover_image_url || undefined}
        ogUrl={canonicalUrl(`/blogs/${blog.slug}`)}
        ogType="article"
        canonical={canonicalUrl(`/blogs/${blog.slug}`)}
        jsonLd={blogJsonLd}
      />
      <div className="pt-24">
      <div className="content-max-width px-4 py-8">
        <Link
          to="/blogs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gym-text-muted transition-colors hover:text-gym-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-gym-elevated">
                {blog.cover_image_url ? (
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className="h-full w-full object-cover"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-heading text-7xl font-bold text-gym-gold/20">
                      {blog.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gym-border-light bg-gym-surface px-3 py-0.5 text-xs text-gym-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="font-heading text-2xl font-bold text-gym-text-primary md:text-3xl">
                {blog.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gym-text-muted">
                {blog.read_time_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {formatReadTime(blog.read_time_minutes)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {formatViewCount(blog.view_count)} views
                </span>
                {blog.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {formatDate(blog.published_at)}
                  </span>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="prose prose-invert prose-gold mt-8 max-w-none"
            >
              <div className="whitespace-pre-line text-sm leading-relaxed text-gym-text-secondary">
                {blog.content}
              </div>
            </motion.div>
          </article>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-gym-border-light bg-gym-surface p-5">
                <h2 className="mb-1 font-heading text-lg font-bold text-gym-text-primary">
                  Author
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gym-gold/10">
                    <span className="font-heading text-sm font-bold text-gym-gold">AR</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gym-text-primary">Alex Rivera</p>
                    <p className="text-xs text-gym-text-muted">Head Coach & Founder</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gym-border-light bg-gym-surface p-5">
                <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">
                  Related Articles
                </h2>
                <div className="space-y-4">
                  {related.map((rb) => (
                    <Link
                      key={rb.id}
                      to={`/blogs/${rb.slug}`}
                      className="group flex gap-3"
                    >
                      <div className="relative aspect-square w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gym-elevated">
                        {rb.cover_image_url ? (
                          <img
                            src={rb.cover_image_url}
                            alt={rb.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-lg font-bold text-gym-gold/30">
                              {rb.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                          {rb.title}
                        </p>
                        <p className="mt-1 text-xs text-gym-text-muted">
                          {formatReadTime(rb.read_time_minutes || 1)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  {related.length === 0 && (
                    <p className="text-sm text-gym-text-muted">No related articles.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="content-max-width px-4">
          <Suspense fallback={null}>
            <CommentSection blogId={blog.id} />
          </Suspense>
        </div>
      </div>
    </div>
    </>
  );
}
