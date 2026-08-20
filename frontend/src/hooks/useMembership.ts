import { useQuery, useMutation } from "@tanstack/react-query";
import { membershipApi } from "@/services/membershipApi";
import type { MembershipStatus, Payment } from "@/types/user";

export function useMembership() {
  return useQuery<MembershipStatus>({
    queryKey: ["membership"],
    queryFn: async () => {
      const { data } = await membershipApi.getStatus();
      return data;
    },
    staleTime: 1000 * 60 * 2,
    retry: false,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await membershipApi.createCheckout();
      return data;
    },
  });
}

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: ["membership", "payments"],
    queryFn: async () => {
      const { data } = await membershipApi.getPayments();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
