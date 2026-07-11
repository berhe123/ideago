import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Store } from 'lucide-react';
import type { IdeaDetailDto } from '@/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';

export function OverviewTab({
  idea,
  onOpenTab,
}: {
  idea: IdeaDetailDto;
  onOpenTab: (id: string) => void;
}) {
  const b = idea.blueprint;
  const checklist = [
    { label: 'Market validation', done: !!b.validation, tab: 'validation' },
    { label: 'Business model', done: !!b.businessModel, tab: 'business' },
    { label: 'Product plan', done: !!b.productPlan, tab: 'product' },
    { label: 'Design brief', done: !!b.designBrief, tab: 'design' },
    { label: 'Workspace', done: idea.hasProject, tab: 'workspace' },
  ];
  const completed = checklist.filter((c) => c.done).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>The idea</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Problem" value={idea.problem} />
            <Field label="Solution" value={idea.solution} />
            <Field label="Target market" value={idea.targetMarket} />
          </CardContent>
        </Card>

        {b.validation && (
          <Card>
            <CardHeader>
              <CardTitle>Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{b.validation.verdict}</p>
              <p className="mt-3 text-sm">{b.validation.marketSummary}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Blueprint progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">{completed} of {checklist.length} complete</p>
            <ul className="space-y-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <button
                    onClick={() => onOpenTab(c.tab)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {c.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={c.done ? '' : 'text-muted-foreground'}>{c.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need a team?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hire vetted developers, designers and growth experts to build this.
            </p>
            <Link to="/marketplace" className="mt-4 inline-block">
              <Button variant="outline">
                <Store className="h-4 w-4" /> Browse marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
