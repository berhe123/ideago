import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { IdeaDto } from '@/shared';
import { Card } from '@/shared/ui/card';
import { StageBadge } from '@/shared/ui/stage-badge';
import { scoreColor } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export function IdeaCard({ idea }: { idea: IdeaDto }) {
  return (
    <Link to={`/ideas/${idea.id}`}>
      <Card className="card-hover group h-full p-6">
        <div className="flex items-start justify-between gap-3">
          <StageBadge stage={idea.stage} />
          {typeof idea.startupScore === 'number' && (
            <span className={cn('font-display text-2xl font-bold', scoreColor(idea.startupScore))}>
              {idea.startupScore}
            </span>
          )}
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold leading-tight">{idea.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{idea.problem}</p>
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2.5 py-1">{idea.category}</span>
          <span className="inline-flex items-center gap-1 text-primary opacity-0 transition group-hover:opacity-100">
            Open <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
