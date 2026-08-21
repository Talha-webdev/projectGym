import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Clock,
  ArrowLeft,
  Play,
  Crown,
  Lock,
  AlertCircle,
} from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useVideo } from "@/hooks/useVideos";
import { useMembership } from "@/hooks/useMembership";
import { useAuth } from "@/store/AuthContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatDuration, formatViewCount } from "@/utils/formatters";
import { fadeInUp } from "@/utils/animations";

export default function VideoDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: video, isLoading, error } = useVideo(slug ?? "");
  const { data: membership } = useMembership();
  const { isAuthenticated } = useAuth();
  const [hasPremium, setHasPremium] = useState(false);

  useEffect(() => {
    if (membership?.is_active) setHasPremium(true);
  }, [membership]);

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="content-max-width px-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="aspect-video w-full rounded-xl mb-6" />
          <Skeleton className="h-6 w-2/3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="section-padding flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gym-error" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-gym-text-primary">Video Not Found</h1>
          <p className="mt-2 text-gym-text-secondary">The video you're looking for doesn't exist or has been removed.</p>
          <Link to="/videos">
            <Button className="mt-6"><ArrowLeft className="h-4 w-4" /> Back to Videos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const canPlay = !video.is_premium || hasPremium;
  const videoUrl = canPlay ? video.cloudinary_url : null;

  return (
    <>
      <SEOHead
        title={video.title}
        description={video.description || `Watch ${video.title} on Project GYM`}
        ogImage={video.thumbnail_url ?? undefined}
        canonical={`/videos/${video.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoObject",
          name: video.title,
          description: video.description ?? undefined,
          thumbnailUrl: video.thumbnail_url ?? undefined,
          duration: video.duration ? `PT${video.duration}S` : undefined,
          uploadDate: video.created_at,
        }}
      />
      <div className="section-padding">
        <div className="content-max-width px-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link to="/videos" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gym-text-muted transition-colors hover:text-gym-gold">
              <ArrowLeft className="h-4 w-4" /> All Videos
            </Link>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {canPlay && videoUrl ? (
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="relative overflow-hidden rounded-xl border border-gym-border-light bg-black"
                  >
                    <video
                      src={videoUrl}
                      controls
                      preload="metadata"
                      className="aspect-video w-full"
                      poster={video.thumbnail_url ?? undefined}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    className="relative aspect-video overflow-hidden rounded-xl border border-gym-border-light bg-gym-surface"
                  >
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gym-elevated">
                        <Play className="h-16 w-16 text-gym-text-muted" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
                      <div className="rounded-full bg-gym-gold/20 p-4 mb-4">
                        <Lock className="h-8 w-8 text-gym-gold" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-gym-text-primary">Premium Content</h3>
                      <p className="mt-2 max-w-sm text-center text-sm text-gym-text-secondary">
                        Subscribe to unlock this video and all other premium content.
                      </p>
                      {!isAuthenticated ? (
                        <Link to="/register" className="mt-6">
                          <Button><Crown className="mr-2 h-4 w-4" /> Join Now</Button>
                        </Link>
                      ) : (
                        <Link to="/pricing" className="mt-6">
                          <Button><Crown className="mr-2 h-4 w-4" /> Get Membership</Button>
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {video.category && <Badge variant="default">{video.category}</Badge>}
                    {video.is_premium && <Badge variant="premium" className="gap-1"><Crown className="h-3 w-3" /> Premium</Badge>}
                  </div>
                  <h1 className="font-heading text-2xl font-bold text-gym-text-primary leading-tight">{video.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gym-text-secondary">
                    <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {formatViewCount(video.view_count)} views</span>
                    {video.duration && (
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDuration(video.duration)}</span>
                    )}
                    <span>{formatDate(video.created_at)}</span>
                  </div>
                </div>

                {video.description && (
                  <Card hover={false} className="p-4">
                    <p className="text-sm leading-relaxed text-gym-text-secondary whitespace-pre-line">{video.description}</p>
                  </Card>
                )}

                <div className="rounded-xl bg-gym-elevated/50 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-gym-text-primary">About this video</h3>
                  <div className="space-y-2 text-sm text-gym-text-secondary">
                    {video.category && (
                      <div className="flex justify-between">
                        <span>Category</span>
                        <span className="font-medium text-gym-text-primary">{video.category}</span>
                      </div>
                    )}
                    {video.duration && (
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span className="font-medium text-gym-text-primary">{formatDuration(video.duration)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Type</span>
                      <span className="font-medium text-gym-text-primary">{video.is_premium ? "Premium" : "Free"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
