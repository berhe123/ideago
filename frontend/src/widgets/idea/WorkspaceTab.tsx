import { useState } from 'react';
import { CheckCircle2, Flag, Loader2, Plus, Rocket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { IdeaDetailDto, TaskDto } from '@/shared';
import { useWorkspaceBoard, useTaskMutations, useMilestoneMutations } from '@/features/workspace/api';
import { errorMessage } from '@/shared/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Progress } from '@/shared/ui/progress';
import { EmptyState } from '@/shared/ui/empty';
import { cn } from '@/shared/lib/cn';

const COLUMNS: { id: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string }[] = [
  { id: 'TODO', label: 'To do' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'DONE', label: 'Done' },
];

export function WorkspaceTab({ idea }: { idea: IdeaDetailDto }) {
  const { board, isLoading, isError, create } = useWorkspaceBoard(idea.id, idea.hasProject);

  const launch = async () => {
    try {
      await create.mutateAsync();
      toast.success('Workspace created — tasks seeded from your product plan.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create workspace'));
    }
  };

  if (!idea.hasProject && !board) {
    return (
      <EmptyState
        icon={<Rocket className="h-10 w-10" />}
        title="Launch your workspace"
        description="Spin up a build workspace with tasks, milestones and documents — pre-filled from your product plan."
        action={
          <Button onClick={launch} disabled={create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create workspace
          </Button>
        }
      />
    );
  }

  if (isLoading && !board) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError && !board) {
    return (
      <EmptyState
        icon={<Rocket className="h-10 w-10" />}
        title="Workspace unavailable"
        description="We could not load your workspace. Try creating it again."
        action={<Button onClick={launch}>Retry</Button>}
      />
    );
  }

  if (!board) {
    return (
      <EmptyState
        icon={<Rocket className="h-10 w-10" />}
        title="Workspace unavailable"
        description="We could not load your workspace yet."
        action={<Button onClick={launch}>Create workspace</Button>}
      />
    );
  }

  return <Board ideaId={idea.id} projectId={board.project.id} board={board} />;
}

function Board({
  ideaId,
  projectId,
  board,
}: {
  ideaId: string;
  projectId: string;
  board: NonNullable<ReturnType<typeof useWorkspaceBoard>['board']>;
}) {
  const tasks = useTaskMutations(ideaId, projectId);
  const milestones = useMilestoneMutations(ideaId, projectId);
  const [newTask, setNewTask] = useState('');

  const addTask = async () => {
    if (!newTask.trim()) {
      toast.error('Enter a task title first.');
      return;
    }
    try {
      await tasks.add.mutateAsync({ title: newTask.trim() });
      setNewTask('');
      toast.success('Task added');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add task'));
    }
  };

  const moveTask = (task: TaskDto, status: string) => {
    tasks.update.mutate(
      { id: task.id, status },
      { onError: (err) => toast.error(errorMessage(err, 'Could not update task')) },
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium">{board.project.name}</p>
            <p className="text-xs text-muted-foreground">{board.project.summary}</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{board.project.progress}%</span>
            </div>
            <Progress value={board.project.progress} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a task…"
        />
        <Button type="button" onClick={addTask} disabled={tasks.add.isPending || !newTask.trim()}>
          {tasks.add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = board.tasks.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className="rounded-2xl border border-border bg-card/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', t.status === 'DONE' && 'text-muted-foreground line-through')}>
                        {t.title}
                      </p>
                      <button
                        onClick={() =>
                          tasks.remove.mutate(t.id, {
                            onError: (err) => toast.error(errorMessage(err, 'Could not delete task')),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-2 flex gap-1">
                      {COLUMNS.filter((c) => c.id !== t.status).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => moveTask(t, c.id)}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-accent" /> Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {board.milestones.map((m) => (
              <button
                key={m.id}
                onClick={() =>
                  milestones.update.mutate(
                    { id: m.id, status: m.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED' },
                    { onError: (err) => toast.error(errorMessage(err, 'Could not update milestone')) },
                  )
                }
                className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted"
              >
                <CheckCircle2
                  className={cn(
                    'h-5 w-5',
                    m.status === 'COMPLETED' ? 'text-emerald-400' : 'text-muted-foreground',
                  )}
                />
                <span className={cn('text-sm', m.status === 'COMPLETED' && 'line-through text-muted-foreground')}>
                  {m.title}
                </span>
              </button>
            ))}
            {board.milestones.length === 0 && (
              <p className="text-sm text-muted-foreground">No milestones yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {board.documents.map((d) => (
              <div key={d.id} className="rounded-xl border border-border p-3">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{d.content}</p>
              </div>
            ))}
            {board.documents.length === 0 && (
              <p className="text-sm text-muted-foreground">No documents yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
