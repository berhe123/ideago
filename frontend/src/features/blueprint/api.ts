import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '@/shared/api/client';

type BlueprintKind = 'validation' | 'business' | 'product' | 'design' | 'generate-all';

export function useGenerateBlueprint(ideaId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kind: BlueprintKind) => unwrap(api.post(`/ideas/${ideaId}/blueprint/${kind}`)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['idea', ideaId] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
