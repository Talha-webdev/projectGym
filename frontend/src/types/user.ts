export interface MembershipStatus {
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  days_remaining: number | null;
}

export interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  created_at: string;
}
