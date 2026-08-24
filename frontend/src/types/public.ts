export interface JourneyItem {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  milestone_type: string | null;
  value: string | null;
  sort_order: number;
}

export interface Statistics {
  total_weight_lost: string;
  active_members: string;
  workout_videos: string;
  success_rate: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type SiteSettings = Record<string, string>;