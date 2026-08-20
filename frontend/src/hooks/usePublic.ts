import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Testimonial, JourneyItem, Statistics, FAQItem, SiteSettings } from "@/types/public";

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await api.get("/public/site-settings");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data } = await api.get("/public/testimonials");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useJourney() {
  return useQuery<JourneyItem[]>({
    queryKey: ["journey"],
    queryFn: async () => {
      const { data } = await api.get("/public/journey");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useStatistics() {
  return useQuery<Statistics>({
    queryKey: ["statistics"],
    queryFn: async () => {
      const { data } = await api.get("/public/statistics");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useFAQ() {
  return useQuery<FAQItem[]>({
    queryKey: ["faq"],
    queryFn: async () => {
      const { data } = await api.get("/public/faq");
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
}