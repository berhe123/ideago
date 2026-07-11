import { type IdeaStage } from '@/shared';
import { useAdminIdeas } from '@/features/admin/api';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { StageBadge } from '@/shared/ui/stage-badge';
import { PageLoader } from '@/shared/ui/page-loader';
import { scoreColor, formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export default function AdminIdeas() {
  const { data, isLoading } = useAdminIdeas();
  if (isLoading || !data) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Ideas</h1>
      <p className="mt-1 text-muted-foreground">{data.length} ideas submitted.</p>

      <Card className="mt-6">
        <CardContent className="overflow-x-auto py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="py-2">Idea</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Stage</th>
                <th className="py-2">Status</th>
                <th className="py-2">Score</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((i) => (
                <tr key={i.id} className="border-b border-border/60">
                  <td className="py-3">
                    <p className="font-medium">{i.title}</p>
                    <p className="text-xs text-muted-foreground">{i.category}</p>
                  </td>
                  <td className="py-3 text-muted-foreground">{i.owner}</td>
                  <td className="py-3">
                    <StageBadge stage={i.stage as IdeaStage} />
                  </td>
                  <td className="py-3">
                    <Badge className="bg-muted">{i.status}</Badge>
                  </td>
                  <td className={cn('py-3 font-bold', i.score ? scoreColor(i.score) : 'text-muted-foreground')}>
                    {i.score ?? '—'}
                  </td>
                  <td className="py-3 text-muted-foreground">{formatDate(i.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
