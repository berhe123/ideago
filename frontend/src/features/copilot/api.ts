import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CopilotMessageDto, CopilotReplyDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

interface CopilotHistory {
  messages: CopilotMessageDto[];
  provider: string;
}

export function useCopilot(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['copilot', ideaId],
    queryFn: () => unwrap<CopilotHistory>(api.get(`/ideas/${ideaId}/copilot`)),
    enabled: !!ideaId,
  });
}

export function useAskCopilot(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      unwrap<CopilotReplyDto>(api.post(`/ideas/${ideaId}/copilot`, { content })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['copilot', ideaId] }),
  });
}
