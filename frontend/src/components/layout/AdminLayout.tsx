import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Film,
  FileText,
  Image,
  MessageSquare,
  Settings,
  Globe,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, memo } from "react";
import { useAuth } from "@/store/AuthContext";
import { APP_NAME } from "@/utils/constants";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Videos", href: "/admin/videos", icon: Film },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Gallery", href: "/admin/gallery", icon: Image },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Website Settings", href: "/admin/website-settings", icon: Globe },
];

export const AdminLayout = memo(function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gym-bg">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gym-border bg-gym-surface transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gym-border px-5">
          <NavLink to="/admin/dashboard" className="font-heading text-lg font-bold text-gym-gold">
            {APP_NAME}
            <span className="ml-1.5 text-xs font-normal text-gym-text-muted">Admin</span>
          </NavLink>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gym-text-muted hover:bg-gym-elevated hover:text-gym-text-primary lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gym-gold-muted text-gym-gold"
                    : "text-gym-text-secondary hover:bg-gym-elevated hover:text-gym-text-primary"
                }`
              }
            >
              <link.icon className="h-4.5 w-4.5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gym-border p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-gym-elevated/50 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gym-gold/20 text-xs font-bold text-gym-gold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gym-text-primary">
                {user?.full_name || "Admin"}
              </p>
              <p className="truncate text-xs text-gym-text-muted">
                {user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gym-text-secondary transition-all hover:bg-gym-elevated hover:text-gym-error"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-gym-border bg-gym-surface px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-gym-text-muted hover:bg-gym-elevated hover:text-gym-text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gym-text-muted">
            <LayoutDashboard className="h-4 w-4" />
            <NavLink to="/" className="hover:text-gym-gold">Site</NavLink>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gym-text-secondary">Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
});
