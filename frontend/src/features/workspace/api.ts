import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectBoardDto, TaskDto } from '@/shared';
import { api, unwrap } from '@/shared/api/client';

async function fetchWorkspace(ideaId: string) {
  return unwrap<ProjectBoardDto>(api.post(`/ideas/${ideaId}/workspace`));
}

function patchBoard(
  qc: ReturnType<typeof useQueryClient>,
  ideaId: string,
  updater: (board: ProjectBoardDto) => ProjectBoardDto,
) {
  qc.setQueryData<ProjectBoardDto>(['workspace', ideaId], (board) => (board ? updater(board) : board));
}

export function useWorkspaceBoard(ideaId: string, hasProject: boolean) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['workspace', ideaId],
    queryFn: () => fetchWorkspace(ideaId),
    enabled: hasProject,
  });
  const create = useMutation({
    mutationFn: () => fetchWorkspace(ideaId),
    onSuccess: (board) => {
      qc.setQueryData(['workspace', ideaId], board);
      qc.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });

  return {
    board: query.data ?? create.data,
    isLoading: (hasProject && query.isLoading && !query.data) || create.isPending,
    isError: query.isError,
    create,
  };
}

function useBoardInvalidate(ideaId: string) {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['workspace', ideaId] });
}

export function useTaskMutations(ideaId: string, projectId: string) {
  const qc = useQueryClient();
  const invalidate = useBoardInvalidate(ideaId);
  const add = useMutation({
    mutationFn: (input: { title: string; priority?: string }) =>
      unwrap<TaskDto>(api.post(`/projects/${projectId}/tasks`, input)),
    onSuccess: (task) => {
      patchBoard(qc, ideaId, (board) => ({ ...board, tasks: [...board.tasks, task] }));
      invalidate();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: string; title?: string; priority?: string }) =>
      unwrap<TaskDto>(api.patch(`/projects/${projectId}/tasks/${id}`, input)),
    onSuccess: (task) => {
      patchBoard(qc, ideaId, (board) => ({
        ...board,
        tasks: board.tasks.map((t) => (t.id === task.id ? task : t)),
      }));
      invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => unwrap(api.delete(`/projects/${projectId}/tasks/${id}`)),
    onSuccess: (_, id) => {
      patchBoard(qc, ideaId, (board) => ({
        ...board,
        tasks: board.tasks.filter((t) => t.id !== id),
      }));
      invalidate();
    },
  });
  return { add, update, remove };
}

export function useMilestoneMutations(ideaId: string, projectId: string) {
  const invalidate = useBoardInvalidate(ideaId);
  const add = useMutation({
    mutationFn: (input: { title: string }) =>
      unwrap(api.post(`/projects/${projectId}/milestones`, input)),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, ...input }: { id: string; status?: string }) =>
      unwrap(api.patch(`/projects/${projectId}/milestones/${id}`, input)),
    onSuccess: invalidate,
  });
  return { add, update };
}
