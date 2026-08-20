import api from "@/services/api";
import type { MembershipStatus, Payment } from "@/types/user";

interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
}

interface VerifySessionResponse {
  valid: boolean;
  status: string;
}

export const membershipApi = {
  getStatus: () =>
    api.get<MembershipStatus>("/membership/status"),

  createCheckout: () =>
    api.post<CheckoutResponse>("/membership/create-checkout"),

  getPayments: () =>
    api.get<Payment[]>("/membership/payments"),

  verifySession: (sessionId: string) =>
    api.get<VerifySessionResponse>(`/membership/verify-session/${sessionId}`),
};
