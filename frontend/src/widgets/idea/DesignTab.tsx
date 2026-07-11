import { Palette } from 'lucide-react';
import type { IdeaDetailDto } from '@/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { GenerateCard } from './GenerateCard';

export function DesignTab({ idea }: { idea: IdeaDetailDto }) {
  const d = idea.blueprint.designBrief;
  if (!d) {
    return (
      <GenerateCard
        ideaId={idea.id}
        kind="design"
        title="No design brief yet"
        description="Generate a brand direction, color system, typography and wireframe blueprints."
        icon={<Palette className="h-10 w-10" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brand direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {d.brandPersonality.map((p) => (
                <Badge key={p} className="border-primary/30 bg-primary/10 text-primary">{p}</Badge>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase text-muted-foreground">Typography</p>
              <p className="mt-2 font-display text-2xl">{d.typography.heading}</p>
              <p className="text-sm text-muted-foreground">Body · {d.typography.body}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {d.colorPalette.map((c) => (
                <div key={c.name} className="overflow-hidden rounded-xl border border-border">
                  <div className="h-16 w-full" style={{ backgroundColor: c.value }} />
                  <div className="p-2">
                    <p className="text-xs font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UX principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {d.uxPrinciples.map((p, i) => (
              <div key={i} className="rounded-xl border border-border p-3 text-sm">
                {p}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wireframe blueprint</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.screens.map((s) => (
            <div key={s.name} className="rounded-xl border border-border p-4">
              <p className="font-display font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.purpose}</p>
              <div className="mt-3 space-y-1.5">
                {s.sections.map((sec) => (
                  <div key={sec} className="rounded-md bg-muted px-2 py-1.5 text-xs">{sec}</div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
