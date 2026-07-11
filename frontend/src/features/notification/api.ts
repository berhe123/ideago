import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NotificationDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

interface NotificationList {
  items: NotificationDto[];
  unread: number;
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => unwrap<NotificationList>(api.get('/notifications')),
    refetchInterval: 60_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.post('/notifications/read-all')),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.post(`/notifications/${id}/read`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
