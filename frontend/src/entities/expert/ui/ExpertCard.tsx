import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { EXPERT_CATEGORY_LABEL, type ExpertDto } from '@/shared';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { initials } from '@/shared/lib/format';

export function ExpertCard({ expert }: { expert: ExpertDto }) {
  return (
    <Link to={`/experts/${expert.id}`}>
      <Card className="card-hover h-full p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full gradient-brand text-sm font-bold text-white">
            {initials(expert.fullName)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{expert.fullName}</p>
            <p className="text-xs text-muted-foreground">{EXPERT_CATEGORY_LABEL[expert.category]}</p>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">{expert.headline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {expert.skills.slice(0, 4).map((s) => (
            <Badge key={s} className="bg-muted text-xs">{s}</Badge>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-amber-400">
            <Star className="h-4 w-4 fill-amber-400" /> {expert.rating.toFixed(1)}
            <span className="text-muted-foreground">({expert.reviewsCount})</span>
          </span>
          <span className="font-semibold">${expert.hourlyRateUsd}/hr</span>
        </div>
      </Card>
    </Link>
  );
}
