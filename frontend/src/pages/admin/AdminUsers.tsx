import { useState } from "react";
import { Search, UserX } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/utils/formatters";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminUsers({ page, per_page: 10, search: search || undefined as string | undefined });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-gym-text-primary">Users</h1>
          <p className="mt-1 text-sm text-gym-text-secondary">Manage user accounts.</p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gym-text-muted" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gym-border bg-gym-surface py-2 pl-10 pr-4 text-sm text-gym-text-primary placeholder-gym-text-muted outline-none transition-all focus:border-gym-gold focus:ring-1 focus:ring-gym-gold"
          />
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-gym-error/30 bg-gym-error/5 p-4">
          <p className="text-sm text-gym-error">Failed to load users. Please try again.</p>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gym-text-muted">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border">
                {data.items.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-gym-elevated/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gym-gold/20 text-xs font-bold text-gym-gold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gym-text-primary">{user.full_name}</span>
                        {user.is_admin && <Badge variant="gold" className="text-[0.6rem]">Admin</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gym-text-secondary">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_verified ? "success" : "warning"}>
                        {user.is_verified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gym-text-muted">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <UserX className="mx-auto h-10 w-10 text-gym-text-muted" />
          <p className="mt-3 text-sm text-gym-text-secondary">No users found.</p>
        </Card>
      )}

      {data && data.pagination.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gym-text-muted">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!data.pagination.has_prev}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!data.pagination.has_next}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
