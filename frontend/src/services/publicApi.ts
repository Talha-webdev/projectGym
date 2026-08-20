import api from "@/services/api";
import type { SiteSettings, Testimonial, JourneyItem } from "@/types/public";

export const publicApi = {
  getSiteSettings: () => api.get<SiteSettings>("/public/site-settings"),
  getTestimonials: () => api.get<Testimonial[]>("/public/testimonials"),
  getJourney: () => api.get<JourneyItem[]>("/public/journey"),
};
