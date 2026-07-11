import { cn } from '../lib/cn';

export function ScoreRing({
  score,
  size = 120,
  label = 'Startup Score',
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const stroke = score >= 80 ? '#34d399' : score >= 65 ? '#22d3ee' : score >= 50 ? '#fbbf24' : '#fb7185';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className={cn('font-display text-3xl font-bold')} style={{ color: stroke }}>
            {score}
          </span>
        </div>
      </div>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
    </div>
  );
}
