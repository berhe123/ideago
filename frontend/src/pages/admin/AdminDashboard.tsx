import { Briefcase, Lightbulb, Rocket, Users } from 'lucide-react';
import { STAGE_LABEL, type IdeaStage } from '@/shared';
import { useAdminStats } from '@/features/admin/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { StageBadge } from '@/shared/ui/stage-badge';
import { PageLoader } from '@/shared/ui/page-loader';
import { scoreColor, formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();
  if (isLoading || !data) return <PageLoader />;

  const cards = [
    { label: 'Users', value: data.totalUsers, icon: Users },
    { label: 'Ideas', value: data.totalIdeas, icon: Lightbulb },
    { label: 'Active projects', value: data.activeProjects, icon: Rocket },
    { label: 'Hire requests', value: data.hireRequests, icon: Briefcase },
  ];

  const maxStage = Math.max(...data.ideasByStage.map((s) => s.count), 1);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Platform overview</h1>
      <p className="mt-1 text-muted-foreground">A bird’s-eye view of Ideago.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ideas by stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.ideasByStage.map((s) => (
              <div key={s.stage}>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{STAGE_LABEL[s.stage as IdeaStage] ?? s.stage}</span>
                  <span>{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-brand" style={{ width: `${(s.count / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-2 text-sm text-muted-foreground">
              Avg startup score: <b className={scoreColor(data.avgStartupScore)}>{data.avgStartupScore}</b>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent ideas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentIdeas.map((i) => (
              <div key={i.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.owner} · {formatDate(i.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {typeof i.score === 'number' && (
                    <span className={cn('text-sm font-bold', scoreColor(i.score))}>{i.score}</span>
                  )}
                  <StageBadge stage={i.stage as IdeaStage} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
