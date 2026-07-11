import { STAGE_LABEL, type IdeaStage } from '@/shared';
import { cn } from '../lib/cn';

const STAGE_STYLES: Record<string, string> = {
  IDEA: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  VALIDATION: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  PLANNING: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  DESIGN: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  MVP: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  DEVELOPMENT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  LAUNCH: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  GROWTH: 'bg-green-500/15 text-green-300 border-green-500/30',
};

export function StageBadge({ stage, className }: { stage: IdeaStage; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STAGE_STYLES[stage] ?? STAGE_STYLES.IDEA,
        className,
      )}
    >
      {STAGE_LABEL[stage] ?? stage}
    </span>
  );
}
