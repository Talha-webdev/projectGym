import api from "@/services/api";
import type { SiteSettings, JourneyItem } from "@/types/public";

export const publicApi = {
  getSiteSettings: () => api.get<SiteSettings>("/public/site-settings"),
  getJourney: () => api.get<JourneyItem[]>("/public/journey"),
};
