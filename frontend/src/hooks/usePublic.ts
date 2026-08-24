import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import type { Statistics, FAQItem } from "@/types/public";

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
