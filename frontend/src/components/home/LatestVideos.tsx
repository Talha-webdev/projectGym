import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { useVideos } from "@/hooks/useVideos";
import { Badge } from "@/components/ui/Badge";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { formatDuration, formatViewCount, formatRelativeTime } from "@/utils/formatters";

export function LatestVideos() {
  const { data, isLoading } = useVideos({ per_page: 3 });

  return (
    <section className="section-padding bg-gym-surface/50">
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
              Latest Videos
            </span>
            <h2 className="font-heading text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-gym-text-primary">
              Workout Videos
            </h2>
          </div>
          <Link
            to="/videos"
            className="hidden items-center gap-1 text-sm font-medium text-gym-gold transition-colors hover:text-gym-gold-hover sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items?.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
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
                      {video.is_premium && (
                        <div className="absolute right-2 top-2">
                          <Badge variant="premium">Premium</Badge>
                        </div>
                      )}
                      {video.duration && (
                        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="mb-1 text-xs text-gym-text-muted">{video.category || "General"}</p>
                      <h3 className="font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold line-clamp-2">
                        {video.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gym-text-muted">
                        <span>{formatViewCount(video.view_count)} views</span>
                        <span>{formatRelativeTime(video.created_at)}</span>
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
            to="/videos"
            className="inline-flex items-center gap-1 rounded-lg border border-gym-border-light px-6 py-3 text-sm font-medium text-gym-gold transition-colors hover:bg-gym-gold-muted"
          >
            View All Videos <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}