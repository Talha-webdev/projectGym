export interface SearchResultItem {
  id: string;
  title: string;
  slug: string;
  source_type: "video" | "blog" | "gallery";
  thumbnail_url: string | null;
  excerpt: string | null;
  is_premium: boolean;
  created_at: string;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}
