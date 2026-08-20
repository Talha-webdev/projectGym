import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useAdminPayments } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate, formatCurrency } from "@/utils/formatters";

export default function AdminPayments() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminPayments({ page, per_page: 15 });

  const statusVariant = (status: string) => {
    switch (status) {
      case "completed": return "success" as const;
      case "refunded": return "warning" as const;
      case "failed": return "error" as const;
      default: return "default" as const;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Payments</h1>
        <p className="mt-1 text-sm text-gym-text-secondary">View all payment transactions and refunds.</p>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load payments. Please try again.</p>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <Card hover={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gym-border bg-gym-elevated/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Currency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border">
                {data.items.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-gym-elevated/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gym-gold/20 text-xs font-bold text-gym-gold">
                          {payment.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gym-text-primary">{payment.user_name}</p>
                          <p className="text-xs text-gym-text-muted">{payment.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gym-text-primary">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3 uppercase text-gym-text-secondary">{payment.currency}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gym-text-muted">{formatDate(payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No payments found.</p>
        </Card>
      )}

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gym-text-muted">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={!data.pagination.has_prev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={!data.pagination.has_next} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
