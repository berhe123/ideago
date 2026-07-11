import { cn } from '../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex snap-x snap-mandatory gap-1 overflow-x-auto scrollbar-hide rounded-full border border-border bg-card/60 p-1', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'flex min-h-[44px] shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition sm:px-4',
            active === t.id
              ? 'gradient-brand text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}
