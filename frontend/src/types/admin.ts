export interface DashboardData {
  total_users: number;
  total_videos: number;
  total_blogs: number;
  total_gallery: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface AdminComment {
  id: string;
  user_email: string;
  user_name: string;
  content: string;
  source_type: string | null;
  source_title: string | null;
  created_at: string;
}

export type SiteSettings = Record<string, string>;
