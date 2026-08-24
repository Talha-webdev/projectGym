import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";

export function useSiteSettings() {
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await api.get("/public/website-settings");
      return data.settings as Record<string, string>;
    },
    staleTime: 5 * 60 * 1000,
  });
  return { settings: data || {}, isLoading };
}
