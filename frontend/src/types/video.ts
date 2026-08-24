export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cloudinary_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  view_count: number;
  category: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
