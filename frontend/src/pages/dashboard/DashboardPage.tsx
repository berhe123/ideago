import { Link } from 'react-router-dom';
import { Lightbulb, Plus, Rocket, Sparkles, TrendingUp } from 'lucide-react';
import { useIdeas } from '@/entities/idea/api';
import { IdeaCard } from '@/entities/idea/ui/IdeaCard';
import { useAuthStore } from '@/entities/user/store';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useIdeas();

  const ideas = data?.items ?? [];
  const validated = ideas.filter((i) => typeof i.startupScore === 'number').length;
  const building = ideas.filter((i) => ['MVP', 'DEVELOPMENT', 'LAUNCH', 'GROWTH'].includes(i.stage)).length;
  const avgScore =
    validated > 0
      ? Math.round(
          ideas.reduce((s, i) => s + (i.startupScore ?? 0), 0) / validated,
        )
      : 0;

  const stats = [
    { label: 'Ideas', value: ideas.length, icon: Lightbulb },
    { label: 'Validated', value: validated, icon: Sparkles },
    { label: 'Building', value: building, icon: Rocket },
    { label: 'Avg score', value: avgScore || '—', icon: TrendingUp },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Hi {user?.firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Here’s your startup workspace.</p>
        </div>
        <Link to="/ideas/new">
          <Button>
            <Plus className="h-4 w-4" /> New idea
          </Button>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-semibold">Your ideas</h2>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : ideas.length ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Lightbulb className="h-10 w-10" />}
          title="No ideas yet"
          description="Submit your first idea and let your AI team build a complete startup blueprint."
          action={
            <Link to="/ideas/new">
              <Button>
                <Plus className="h-4 w-4" /> Submit your first idea
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
