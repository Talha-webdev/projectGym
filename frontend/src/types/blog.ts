export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  read_time_minutes: number | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  tags: string[];
}

export interface BlogDetail extends Blog {
  content: string;
  meta_description: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}
