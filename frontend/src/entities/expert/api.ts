import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ExpertDto, HireRequestDto, Paginated } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export function useExperts(params: { category?: string; q?: string } = {}) {
  return useQuery({
    queryKey: ['experts', params],
    queryFn: () =>
      unwrap<Paginated<ExpertDto>>(
        api.get('/marketplace/experts', { params: { ...params, pageSize: 100 } }),
      ),
  });
}

export function useExpert(id: string | undefined) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: () => unwrap<ExpertDto>(api.get(`/marketplace/experts/${id}`)),
    enabled: !!id,
  });
}

export function useMyExpertProfile() {
  return useQuery({
    queryKey: ['my-expert'],
    queryFn: () => unwrap<ExpertDto | null>(api.get('/marketplace/me/expert')),
  });
}

export function useUpsertExpert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      category: string;
      headline: string;
      bio: string;
      skills: string[];
      hourlyRateUsd: number;
      location?: string;
      available?: boolean;
    }) => unwrap<ExpertDto>(api.put('/marketplace/me/expert', input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-expert'] });
      qc.invalidateQueries({ queryKey: ['experts'] });
    },
  });
}

export function useHireExpert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { expertId: string; ideaId?: string; message: string }) =>
      unwrap<HireRequestDto>(api.post('/marketplace/hire', input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests-sent'] }),
  });
}

export function useSentRequests() {
  return useQuery({
    queryKey: ['requests-sent'],
    queryFn: () => unwrap<HireRequestDto[]>(api.get('/marketplace/requests/sent')),
  });
}

export function useIncomingRequests() {
  return useQuery({
    queryKey: ['requests-incoming'],
    queryFn: () => unwrap<HireRequestDto[]>(api.get('/marketplace/requests/incoming')),
  });
}

export function useRespondRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      unwrap<HireRequestDto>(api.patch(`/marketplace/requests/${id}`, { status })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests-incoming'] }),
  });
}
