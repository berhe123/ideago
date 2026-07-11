import { FileText } from 'lucide-react';
import type { IdeaDetailDto } from '@/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { GenerateCard } from './GenerateCard';

const IMPACT: Record<string, string> = {
  HIGH: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  LOW: 'text-muted-foreground',
};

export function ProductTab({ idea }: { idea: IdeaDetailDto }) {
  const p = idea.blueprint.productPlan;
  if (!p) {
    return (
      <GenerateCard
        ideaId={idea.id}
        kind="product"
        title="No product plan yet"
        description="Generate a PRD, user stories, prioritized features, tech stack and an MVP roadmap."
        icon={<FileText className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{p.prdSummary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {p.objectives.map((o, i) => (
              <div key={i} className="rounded-xl border border-border p-3 text-sm">
                {o}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Feature</th>
                  <th className="py-2">Effort</th>
                  <th className="py-2">Impact</th>
                  <th className="py-2">MVP</th>
                </tr>
              </thead>
              <tbody>
                {p.features.map((f) => (
                  <tr key={f.name} className="border-b border-border/60">
                    <td className="py-3">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </td>
                    <td className="py-3">
                      <Badge className="bg-muted">{f.effort}</Badge>
                    </td>
                    <td className={`py-3 font-medium ${IMPACT[f.impact]}`}>{f.impact}</td>
                    <td className="py-3">{f.mvp ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {p.userStories.map((s, i) => (
              <div key={i} className="rounded-xl border border-border p-3 text-sm">
                <p>
                  As a <b>{s.asA}</b>, I want <b>{s.iWant}</b> so that {s.soThat}.
                </p>
                <Badge className="mt-2 bg-muted text-xs">{s.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech stack</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.techStack.map((t) => (
              <div key={t.layer} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-muted-foreground">{t.layer}</span>
                  <span className="text-sm font-medium">{t.choice}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roadmap</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {p.roadmap.map((r) => (
            <div key={r.phase} className="rounded-xl border border-border p-4">
              <p className="font-display text-lg font-semibold">{r.phase}</p>
              <p className="text-xs text-muted-foreground">{r.timeframe}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {r.goals.map((g) => (
                  <li key={g}>• {g}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
