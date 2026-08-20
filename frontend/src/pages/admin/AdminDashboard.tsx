import { motion } from "framer-motion";
import { Users, Crown, Film, FileText, Image, TrendingUp, DollarSign } from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/utils/formatters";
import { fadeInUp, staggerContainer } from "@/utils/animations";

const statCards = [
  { label: "Total Users", key: "total_users", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Active Members", key: "active_members", icon: Crown, color: "text-gym-gold", bg: "bg-gym-gold-muted" },
  { label: "Total Revenue", key: "total_revenue", icon: DollarSign, color: "text-gym-success", bg: "bg-gym-success/10", isCurrency: true },
  { label: "Revenue This Month", key: "revenue_this_month", icon: TrendingUp, color: "text-gym-warning", bg: "bg-gym-warning/10", isCurrency: true },
  { label: "Videos", key: "total_videos", icon: Film, color: "text-purple-400", bg: "bg-purple-500/10" },
  { label: "Blogs", key: "total_blogs", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/10" },
  { label: "Gallery", key: "total_gallery", icon: Image, color: "text-teal-400", bg: "bg-teal-500/10" },
];

export default function AdminDashboard() {
  const { data: dashboard, isLoading, error } = useAdminDashboard();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-gym-text-secondary">Overview of your platform analytics.</p>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load dashboard data. Please try again.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {statCards.map((stat) => {
            const value = dashboard ? dashboard[stat.key as keyof typeof dashboard] : 0;
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={fadeInUp}>
                <Card className="p-5" hover={false}>
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg ${stat.bg} p-2.5`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gym-text-primary">
                    {stat.isCurrency ? formatCurrency(value as string) : (value as number).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs text-gym-text-muted">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {dashboard && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="p-5" hover={false}>
            <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">Revenue Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gym-elevated/50 px-4 py-3">
                <span className="text-sm text-gym-text-secondary">Total Revenue</span>
                <span className="font-semibold text-gym-text-primary">{formatCurrency(dashboard.total_revenue)}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gym-elevated/50 px-4 py-3">
                <span className="text-sm text-gym-text-secondary">This Month</span>
                <span className="font-semibold text-gym-gold">{formatCurrency(dashboard.revenue_this_month)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5" hover={false}>
            <h2 className="mb-4 font-heading text-base font-bold text-gym-text-primary">Content Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Videos", value: dashboard.total_videos, icon: Film, color: "text-purple-400" },
                { label: "Blogs", value: dashboard.total_blogs, icon: FileText, color: "text-pink-400" },
                { label: "Gallery", value: dashboard.total_gallery, icon: Image, color: "text-teal-400" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-gym-elevated/50 p-4 text-center">
                  <item.icon className={`mx-auto h-5 w-5 ${item.color}`} />
                  <p className="mt-2 text-lg font-bold text-gym-text-primary">{item.value}</p>
                  <p className="text-xs text-gym-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
