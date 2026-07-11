import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminStatsDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

interface AdminUserRow {
  id: string;
  email: string;
  fullName: string;
  role: string;
  ideas: number;
  createdAt: string;
}

interface AdminIdeaRow {
  id: string;
  title: string;
  category: string;
  owner: string;
  stage: string;
  status: string;
  score?: number | null;
  createdAt: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => unwrap<AdminStatsDto>(api.get('/admin/stats')),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => unwrap<AdminUserRow[]>(api.get('/admin/users')),
  });
}

export function useAdminIdeas() {
  return useQuery({
    queryKey: ['admin-ideas'],
    queryFn: () => unwrap<AdminIdeaRow[]>(api.get('/admin/ideas')),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      unwrap(api.patch(`/admin/users/${id}/role`, { role })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
