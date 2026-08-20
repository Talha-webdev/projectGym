export interface GalleryItem {
  id: string;
  title: string | null;
  cloudinary_url: string;
  category: string | null;
  sort_order: number;
}