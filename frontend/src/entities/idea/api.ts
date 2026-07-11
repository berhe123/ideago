import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IdeaDetailDto, IdeaDto, Paginated } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

export interface CreateIdeaInput {
  title: string;
  problem: string;
  solution: string;
  targetMarket: string;
  category: string;
}

export function useIdeas(
  params: { stage?: string; q?: string } = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['ideas', params],
    enabled: options?.enabled ?? true,
    queryFn: () =>
      unwrap<Paginated<IdeaDto>>(api.get('/ideas', { params: { ...params, pageSize: 100 } })),
  });
}

export function useIdea(id: string | undefined) {
  return useQuery({
    queryKey: ['idea', id],
    queryFn: () => unwrap<IdeaDetailDto>(api.get(`/ideas/${id}`)),
    enabled: !!id,
  });
}

export function useCreateIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIdeaInput) => unwrap<IdeaDto>(api.post('/ideas', input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }),
  });
}

export function useUpdateIdea(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CreateIdeaInput> & { stage?: string; status?: string }) =>
      unwrap<IdeaDto>(api.patch(`/ideas/${id}`, input)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['idea', id] });
      qc.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useDeleteIdea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.delete(`/ideas/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ideas'] }),
  });
}
