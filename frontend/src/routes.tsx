import { lazy } from "react";

const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Journey = lazy(() => import("@/pages/Journey"));
const Videos = lazy(() => import("@/pages/Videos"));
const VideoDetail = lazy(() => import("@/pages/VideoDetail"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Contact = lazy(() => import("@/pages/Contact"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Profile = lazy(() => import("@/pages/Profile"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const CheckEmail = lazy(() => import("@/pages/CheckEmail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminVideos = lazy(() => import("@/pages/admin/AdminVideos"));
const AdminBlogs = lazy(() => import("@/pages/admin/AdminBlogs"));
const AdminGallery = lazy(() => import("@/pages/admin/AdminGallery"));
const AdminComments = lazy(() => import("@/pages/admin/AdminComments"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminWebsiteSettings = lazy(() => import("@/pages/admin/AdminWebsiteSettings"));

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType>;
  protected?: boolean;
  admin?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  { path: "/", element: Home },
  { path: "/about", element: About },
  { path: "/journey", element: Journey },
  { path: "/videos", element: Videos },
  { path: "/videos/:slug", element: VideoDetail },
  { path: "/blogs", element: Blogs },
  { path: "/blogs/:slug", element: BlogDetail },
  { path: "/gallery", element: Gallery },
  { path: "/contact", element: Contact },
  { path: "/login", element: Login },
  { path: "/register", element: Register },
  { path: "/forgot-password", element: ForgotPassword },
  { path: "/reset-password", element: ResetPassword },
  { path: "/verify-email", element: VerifyEmail },
  { path: "/check-email", element: CheckEmail },
];

export const protectedRoutes: RouteConfig[] = [
  { path: "/profile", element: Profile, protected: true },
  { path: "/dashboard", element: Dashboard, protected: true },
];

export const adminRoutes: RouteConfig[] = [
  { path: "/admin", element: AdminDashboard, admin: true },
  { path: "/admin/dashboard", element: AdminDashboard, admin: true },
  { path: "/admin/users", element: AdminUsers, admin: true },
  { path: "/admin/videos", element: AdminVideos, admin: true },
  { path: "/admin/blogs", element: AdminBlogs, admin: true },
  { path: "/admin/gallery", element: AdminGallery, admin: true },
  { path: "/admin/comments", element: AdminComments, admin: true },
  { path: "/admin/settings", element: AdminSettings, admin: true },
  { path: "/admin/website-settings", element: AdminWebsiteSettings, admin: true },
  { path: "/admin/*", element: NotFound, admin: true },
];

export const notFoundRoute: RouteConfig = { path: "*", element: NotFound };
