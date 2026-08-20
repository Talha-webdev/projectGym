export interface DashboardData {
  total_users: number;
  active_members: number;
  total_revenue: string;
  revenue_this_month: string;
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
  membership_status: string | null;
  membership_end: string | null;
  created_at: string;
}

export interface AdminPayment {
  id: string;
  user_email: string;
  user_name: string;
  amount: string;
  currency: string;
  status: string;
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

export interface MembershipActionData {
  action: "activate" | "deactivate" | "extend";
  days?: number;
}

export type SiteSettings = Record<string, string>;
