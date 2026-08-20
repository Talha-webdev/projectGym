export interface CommentUser {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  user: CommentUser;
  content: string;
  parent_id: string | null;
  created_at: string;
  replies_count: number;
}
