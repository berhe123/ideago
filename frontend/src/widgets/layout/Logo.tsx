import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white">
        <Lightbulb className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">Ideago</span>
    </Link>
  );
}
