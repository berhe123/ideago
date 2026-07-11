import { toast } from 'sonner';
import { useAdminUsers, useSetUserRole } from '@/features/admin/api';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { PageLoader } from '@/shared/ui/page-loader';
import { formatDate } from '@/shared/lib/format';
import { errorMessage } from '@/shared/api/client';

const ROLES = ['FOUNDER', 'EXPERT', 'ADMIN'];

export default function AdminUsers() {
  const { data, isLoading } = useAdminUsers();
  const setRole = useSetUserRole();

  if (isLoading || !data) return <PageLoader />;

  const change = async (id: string, role: string) => {
    try {
      await setRole.mutateAsync({ id, role });
      toast.success('Role updated');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Users</h1>
      <p className="mt-1 text-muted-foreground">{data.length} users on the platform.</p>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2">User</th>
                <th className="py-2">Ideas</th>
                <th className="py-2">Joined</th>
                <th className="py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="py-3">
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="py-3">
                    <Badge className="bg-muted">{u.ideas}</Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="py-3">
                    <select
                      value={u.role}
                      onChange={(e) => change(u.id, e.target.value)}
                      className="h-9 rounded-lg border border-input bg-background/60 px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
