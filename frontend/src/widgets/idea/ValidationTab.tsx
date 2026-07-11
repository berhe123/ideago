import { AlertTriangle, Target, TrendingUp } from 'lucide-react';
import type { IdeaDetailDto } from '@/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { ScoreRing } from '@/shared/ui/score-ring';
import { formatCurrency } from '@/shared/lib/format';
import { GenerateCard } from './GenerateCard';

const SEVERITY: Record<string, string> = {
  LOW: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  MEDIUM: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  HIGH: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
};

export function ValidationTab({ idea }: { idea: IdeaDetailDto }) {
  const v = idea.blueprint.validation;
  if (!v) {
    return (
      <GenerateCard
        ideaId={idea.id}
        kind="validation"
        title="No validation yet"
        description="Run AI validation to get a startup score, market analysis, competitors, SWOT and risk assessment."
        icon={<Target className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center p-6">
        <ScoreRing score={v.startupScore} />
        <p className="mt-4 text-center text-sm text-muted-foreground">{v.verdict}</p>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" /> Market opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{v.marketSummary}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="border-accent/30 bg-accent/10 text-accent">
              TAM ≈ {formatCurrency(v.marketSizeUsd)}
            </Badge>
            {v.targetSegments.map((s) => (
              <Badge key={s} className="bg-muted">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {v.competitors.map((c) => (
            <div key={c.name} className="rounded-xl border border-border p-4">
              <p className="font-semibold">{c.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
              <p className="mt-3 text-xs font-medium text-emerald-400">Strengths</p>
              <ul className="text-xs text-muted-foreground">
                {c.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs font-medium text-rose-400">Weaknesses</p>
              <ul className="text-xs text-muted-foreground">
                {c.weaknesses.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Risks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {v.risks.map((r) => (
            <div key={r.title} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{r.title}</p>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${SEVERITY[r.severity]}`}>
                  {r.severity}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.mitigation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>SWOT</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SwotBox title="Strengths" items={v.swot.strengths} tone="text-emerald-400" />
          <SwotBox title="Weaknesses" items={v.swot.weaknesses} tone="text-rose-400" />
          <SwotBox title="Opportunities" items={v.swot.opportunities} tone="text-cyan-400" />
          <SwotBox title="Threats" items={v.swot.threats} tone="text-amber-400" />
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {v.recommendations.map((r, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function SwotBox({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className={`text-sm font-semibold ${tone}`}>{title}</p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
