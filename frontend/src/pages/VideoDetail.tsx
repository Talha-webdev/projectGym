import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Eye, Clock, Lock, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useVideo, useVideos } from "@/hooks/useVideos";
import { useAuth } from "@/store/AuthContext";
import { videoObjectSchema, canonicalUrl } from "@/utils/seo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { lazy, Suspense } from "react";
const CommentSection = lazy(() => import("@/components/comments/CommentSection").then(m => ({ default: m.CommentSection })));
import { formatDuration, formatDate } from "@/utils/formatters";
import { fadeInUp } from "@/utils/animations";

export default function VideoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { data: video, isLoading } = useVideo(slug || "");
  const { data: relatedData } = useVideos({ per_page: 4 });

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="content-max-width px-4">
          <Skeleton variant="rectangular" className="aspect-video w-full rounded-2xl" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="section-padding text-center">
        <div className="content-max-width px-4">
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Video not found</h1>
          <p className="mt-2 text-gym-text-secondary">The video you're looking for doesn't exist.</p>
          <Link to="/videos" className="mt-6 inline-block text-gym-gold hover:underline">
            &larr; Back to Videos
          </Link>
        </div>
      </div>
    );
  }

  const isPremium = video.is_premium;
  const isLocked = isPremium && !video.cloudinary_url;
  const related = relatedData?.items?.filter((v) => v.slug !== slug).slice(0, 3) || [];

  const videoJsonLd = videoObjectSchema({
    title: video.title,
    description: video.description,
    slug: video.slug,
    thumbnailUrl: video.thumbnail_url,
    uploadDate: video.created_at,
    duration: video.duration,
  });

  return (
    <>
      <SEOHead
        title={video.title}
        description={video.description || `Watch ${video.title} on Project GYM`}
        ogImage={video.thumbnail_url || undefined}
        ogUrl={canonicalUrl(`/videos/${video.slug}`)}
        ogType="video.other"
        canonical={canonicalUrl(`/videos/${video.slug}`)}
        jsonLd={videoJsonLd}
      />
      <div className="pt-24">
      <div className="content-max-width px-4 py-8">
        <Link
          to="/videos"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gym-text-muted transition-colors hover:text-gym-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Videos
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gym-elevated">
                {isLocked ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-gym-elevated to-gym-surface">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gym-gold/10">
                      <Lock className="h-10 w-10 text-gym-gold" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gym-text-primary">Premium Content</p>
                      <p className="mt-1 text-sm text-gym-text-secondary">
                        {isAuthenticated
                          ? "Upgrade your membership to access this video."
                          : "Join Project GYM to unlock this workout."}
                      </p>
                    </div>
                    <Link to={isAuthenticated ? "/pricing" : "/register"}>
                      <Button>
                        {isAuthenticated ? "View Pricing" : "Join Now"}
                      </Button>
                    </Link>
                  </div>
                ) : video.cloudinary_url ? (
                  <div className="flex h-full items-center justify-center bg-gym-elevated">
                    <div className="text-center">
                      <Play className="mx-auto h-16 w-16 text-gym-gold/50" />
                      <p className="mt-2 text-sm text-gym-text-muted">Video Player</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Play className="h-16 w-16 text-gym-text-muted" />
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="mt-6 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {isPremium && <Badge variant="premium">Premium</Badge>}
                    {video.category && (
                      <span className="rounded-full bg-gym-surface px-3 py-0.5 text-xs text-gym-text-muted">
                        {video.category}
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-gym-text-primary">
                    {video.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gym-text-muted">
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {formatDuration(video.duration)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {video.view_count} views
                    </span>
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>
              </div>

              {video.description && (
                <div className="rounded-xl border border-gym-border-light bg-gym-surface p-5">
                  <h3 className="mb-2 text-sm font-semibold text-gym-text-primary">Description</h3>
                  <p className="text-sm leading-relaxed text-gym-text-secondary">
                    {video.description}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gym-text-muted">
              Related Videos
            </h3>
            {related.map((rv) => (
              <Link
                key={rv.id}
                to={`/videos/${rv.slug}`}
                className="group flex gap-3 rounded-xl border border-gym-border-light bg-gym-surface p-3 transition-all hover:border-gym-gold/30"
              >
                <div className="relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gym-elevated">
                  {rv.thumbnail_url ? (
                    <img
                      src={rv.thumbnail_url}
                      alt={rv.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-6 w-6 text-gym-text-muted" />
                    </div>
                  )}
                  {rv.is_premium && (
                    <div className="absolute right-1 top-1">
                      <Badge variant="premium">Premium</Badge>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                    {rv.title}
                  </p>
                  <p className="mt-1 text-xs text-gym-text-muted">
                    {rv.category || "General"}
                  </p>
                </div>
              </Link>
            ))}
            {related.length === 0 && (
              <p className="text-sm text-gym-text-muted">No related videos.</p>
            )}
          </motion.div>
        </div>

        <div className="content-max-width px-4">
          <Suspense fallback={null}>
            <CommentSection videoId={video.id} />
          </Suspense>
        </div>
      </div>
    </div>
    </>
  );
}
