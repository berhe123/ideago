import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { EXPERT_CATEGORY, EXPERT_CATEGORY_LABEL } from '@/shared';
import { useExperts } from '@/entities/expert/api';
import { ExpertCard } from '@/entities/expert/ui/ExpertCard';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/empty';
import { cn } from '@/shared/lib/cn';

const CATEGORIES = Object.values(EXPERT_CATEGORY);

export default function MarketplacePage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [q, setQ] = useState('');
  const { data, isLoading, isError } = useExperts({ category, q: q || undefined });
  const experts = data?.items ?? [];

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl font-bold">
          Build with <span className="gradient-text">vetted experts</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Developers, designers, PMs, marketers and AI engineers — ready to bring your idea to life.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search experts, skills…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <FilterChip active={!category} onClick={() => setCategory(undefined)}>
          All
        </FilterChip>
        {CATEGORIES.map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
            {EXPERT_CATEGORY_LABEL[c]}
          </FilterChip>
        ))}
      </div>

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Could not load experts"
            description="Check that the API is running and refresh the page."
          />
        ) : experts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((e) => (
              <ExpertCard key={e.id} expert={e} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Users className="h-10 w-10" />} title="No experts found" description="Try a different category or search." />
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
