import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Lock,
  Shield,
  LogOut,
  ArrowRight,
  Film,
  FileText,
  Image,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { SEOHead } from "@/components/common/SEOHead";
import { useAuth } from "@/store/AuthContext";
import { useVideos } from "@/hooks/useVideos";
import { useBlogs } from "@/hooks/useBlogs";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/ui/Avatar";
import {
  formatDate,
  formatDateShort,
  formatDuration,
  formatReadTime,
  formatRelativeTime,
  pluralize,
} from "@/utils/formatters";
import { fadeInUp, staggerContainer, scaleIn } from "@/utils/animations";

const quickActions = [
  { label: "Browse Videos", href: "/videos", icon: Film, color: "text-gym-gold" },
  { label: "Read Blogs", href: "/blogs", icon: FileText, color: "text-gym-gold" },
  { label: "View Gallery", href: "/gallery", icon: Image, color: "text-gym-gold" },
];

const settingsLinks = [
  { label: "Edit Profile", href: "/profile", icon: User },
  { label: "Change Password", href: "/profile", icon: Lock },
  { label: "Privacy", href: "/profile", icon: Shield },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: videosData, isLoading: videosLoading } = useVideos({ per_page: 3 });
  const { data: blogsData, isLoading: blogsLoading } = useBlogs({ per_page: 3 });

  const recentVideos = videosData?.items || [];
  const recentBlogs = blogsData?.items || [];

  return (
    <>
      <SEOHead title="Dashboard" robots="noindex" canonical="/dashboard" />
      <div className="section-padding">
      <div className="content-max-width px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Avatar
              src={user?.avatar_url || undefined}
              alt={user?.full_name || "User"}
              size="lg"
            />
            <div>
              <h1 className="font-heading text-2xl font-bold text-gym-text-primary">
                Welcome back, {user?.full_name?.split(" ")[0] || "Athlete"}
              </h1>
              <p className="text-sm text-gym-text-secondary">
                Member since{" "}
                {user?.created_at
                  ? formatDate(user.created_at)
                  : "today"}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <motion.aside
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full flex-shrink-0 space-y-4 lg:w-72"
          >
            <motion.div variants={fadeInUp}>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user?.avatar_url || undefined}
                    alt={user?.full_name || "User"}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gym-text-primary">
                      {user?.full_name || "User"}
                    </p>
                    <p className="truncate text-xs text-gym-text-muted">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-gym-border-light pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gym-text-secondary">Status</span>
                    <span className="flex items-center gap-1 font-medium text-gym-success">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gym-text-secondary">Role</span>
                    <span className="font-medium text-gym-text-primary">
                      {user?.is_admin ? "Admin" : "Member"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gym-text-secondary">Joined</span>
                    <span className="font-medium text-gym-text-primary">
                      {user?.created_at
                        ? formatDateShort(user.created_at)
                        : "—"}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gym-text-muted">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      to={action.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gym-text-secondary transition-all hover:bg-gym-elevated hover:text-gym-gold"
                    >
                      <action.icon className="h-4 w-4" />
                      <span>{action.label}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gym-text-muted">
                  Settings
                </h3>
                <div className="space-y-1">
                  {settingsLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gym-text-secondary transition-all hover:bg-gym-elevated hover:text-gym-gold"
                    >
                      <link.icon className="h-4 w-4" />
                      <span>{link.label}</span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5" />
                    </Link>
                  ))}
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gym-text-secondary transition-all hover:bg-gym-elevated hover:text-gym-error"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </Card>
            </motion.div>
          </motion.aside>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="min-w-0 flex-1 space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">
                    Recent Videos
                  </h2>
                </div>
                <Link
                  to="/videos"
                  className="flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-gold"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {videosLoading ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      className="aspect-video w-full rounded-xl"
                    />
                  ))}
                </div>
              ) : recentVideos.length === 0 ? (
                <Card className="mt-4 p-6 text-center">
                  <Film className="mx-auto h-8 w-8 text-gym-text-muted" />
                  <p className="mt-2 text-sm text-gym-text-secondary">
                    No videos available yet.
                  </p>
                </Card>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentVideos.map((video) => (
                    <Link
                      key={video.id}
                      to={`/videos/${video.slug}`}
                      className="group block"
                    >
                      <motion.div
                        variants={scaleIn}
                        className="overflow-hidden rounded-xl border border-gym-border-light bg-gym-surface transition-all duration-300 hover:border-gym-gold/30 hover:shadow-lg"
                      >
                        <div className="relative aspect-video overflow-hidden bg-gym-elevated">
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
                              <Film className="h-8 w-8 text-gym-text-muted" />
                            </div>
                          )}
                          {video.duration && (
                            <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                              {formatDuration(video.duration)}
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-1 text-sm font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                            {video.title}
                          </p>
                          <p className="mt-1 text-xs text-gym-text-muted">
                            {video.view_count}{" "}
                            {pluralize(video.view_count, "view")} ·{" "}
                            {formatRelativeTime(video.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gym-gold" />
                  <h2 className="font-heading text-lg font-bold text-gym-text-primary">
                    Recent Articles
                  </h2>
                </div>
                <Link
                  to="/blogs"
                  className="flex items-center gap-1 text-xs text-gym-text-muted transition-colors hover:text-gym-gold"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {blogsLoading ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      className="aspect-[4/3] w-full rounded-xl"
                    />
                  ))}
                </div>
              ) : recentBlogs.length === 0 ? (
                <Card className="mt-4 p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gym-text-muted" />
                  <p className="mt-2 text-sm text-gym-text-secondary">
                    No articles available yet.
                  </p>
                </Card>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.slug}`}
                      className="group block"
                    >
                      <motion.div
                        variants={scaleIn}
                        className="overflow-hidden rounded-xl border border-gym-border-light bg-gym-surface transition-all duration-300 hover:border-gym-gold/30 hover:shadow-lg"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gym-elevated">
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
                              <span className="font-heading text-4xl font-bold text-gym-gold/20">
                                {blog.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="line-clamp-2 text-sm font-medium text-gym-text-primary transition-colors group-hover:text-gym-gold">
                            {blog.title}
                          </p>
                          <p className="mt-1 text-xs text-gym-text-muted">
                            {blog.read_time_minutes
                              ? formatReadTime(blog.read_time_minutes)
                              : "Quick read"}{" "}
                            · {formatRelativeTime(blog.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
