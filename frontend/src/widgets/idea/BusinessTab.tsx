import { Sparkles } from 'lucide-react';
import type { IdeaDetailDto } from '@/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { formatCurrency } from '@/shared/lib/format';
import { GenerateCard } from './GenerateCard';

export function BusinessTab({ idea }: { idea: IdeaDetailDto }) {
  const b = idea.blueprint.businessModel;
  if (!b) {
    return (
      <GenerateCard
        ideaId={idea.id}
        kind="business"
        title="No business model yet"
        description="Generate a lean canvas, revenue model, pricing tiers, personas and a 3-year financial projection."
        icon={<Sparkles className="h-10 w-10" />}
      />
    );
  }

  const lc = b.leanCanvas;
  const maxRev = Math.max(...b.financialProjection.map((f) => f.revenueUsd), 1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lean Canvas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Canvas title="Problem" items={lc.problem} />
          <Canvas title="Solution" items={lc.solution} />
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Unique Value</p>
            <p className="mt-2 text-sm">{lc.uniqueValueProposition}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary">Unfair Advantage</p>
            <p className="mt-1 text-sm text-muted-foreground">{lc.unfairAdvantage}</p>
          </div>
          <Canvas title="Customer Segments" items={lc.customerSegments} />
          <Canvas title="Channels" items={lc.channels} />
          <Canvas title="Key Metrics" items={lc.keyMetrics} />
          <Canvas title="Cost Structure" items={lc.costStructure} />
          <Canvas title="Revenue Streams" items={lc.revenueStreams} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {b.pricingTiers.map((t, i) => (
              <div
                key={t.name}
                className={`rounded-xl border p-4 ${i === 1 ? 'border-primary/40 bg-primary/5' : 'border-border'}`}
              >
                <p className="font-semibold">{t.name}</p>
                <p className="font-display text-2xl font-bold gradient-text">{t.price}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {t.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3-year projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-around gap-4 pt-4" style={{ height: 180 }}>
              {b.financialProjection.map((f) => (
                <div key={f.year} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-accent">{formatCurrency(f.revenueUsd)}</span>
                  <div
                    className="w-full max-w-[48px] rounded-t-lg gradient-brand"
                    style={{ height: `${(f.revenueUsd / maxRev) * 130}px` }}
                  />
                  <span className="text-xs text-muted-foreground">Y{f.year}</span>
                  <span className="text-[10px] text-muted-foreground">{f.users.toLocaleString()} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {b.revenueModel.map((r) => (
              <div key={r.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="text-muted-foreground">{r.estimatedShare}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full gradient-brand" style={{ width: `${r.estimatedShare}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer personas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {b.personas.map((p) => (
              <div key={p.name} className="rounded-xl border border-border p-4">
                <p className="font-semibold">
                  {p.name} <span className="text-xs font-normal text-muted-foreground">· {p.role}, {p.age}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.goals.map((g) => (
                    <Badge key={g} className="bg-muted text-xs">🎯 {g}</Badge>
                  ))}
                  {p.painPoints.map((g) => (
                    <Badge key={g} className="bg-muted text-xs">⚡ {g}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Go-to-market</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {b.goToMarket.map((g, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {g}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function Canvas({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}
