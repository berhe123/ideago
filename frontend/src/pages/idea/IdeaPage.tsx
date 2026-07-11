import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Bot,
  FileText,
  LayoutGrid,
  Loader2,
  Palette,
  Sparkles,
  Target,
  Trash2,
  Wand2,
} from 'lucide-react';
import { useDeleteIdea, useIdea } from '@/entities/idea/api';
import { useGenerateBlueprint } from '@/features/blueprint/api';
import { errorMessage } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { PageLoader } from '@/shared/ui/page-loader';
import { StageBadge } from '@/shared/ui/stage-badge';
import { Tabs } from '@/shared/ui/tabs';
import { scoreColor } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { OverviewTab } from '@/widgets/idea/OverviewTab';
import { ValidationTab } from '@/widgets/idea/ValidationTab';
import { BusinessTab } from '@/widgets/idea/BusinessTab';
import { ProductTab } from '@/widgets/idea/ProductTab';
import { DesignTab } from '@/widgets/idea/DesignTab';
import { CopilotTab } from '@/widgets/idea/CopilotTab';
import { WorkspaceTab } from '@/widgets/idea/WorkspaceTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'validation', label: 'Validation', icon: <Target className="h-4 w-4" /> },
  { id: 'business', label: 'Business', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'product', label: 'Product', icon: <FileText className="h-4 w-4" /> },
  { id: 'design', label: 'Design', icon: <Palette className="h-4 w-4" /> },
  { id: 'copilot', label: 'Copilot', icon: <Bot className="h-4 w-4" /> },
  { id: 'workspace', label: 'Workspace', icon: <Wand2 className="h-4 w-4" /> },
];

export default function IdeaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { data: idea, isLoading, isError } = useIdea(id);
  const generate = useGenerateBlueprint(id!);
  const deleteIdea = useDeleteIdea();
  const [tab, setTab] = useState('overview');

  const autostart = params.get('autostart') === '1';
  const hasAnyBlueprint = useMemo(() => {
    const b = idea?.blueprint;
    return !!(b?.validation || b?.businessModel || b?.productPlan || b?.designBrief);
  }, [idea]);

  // Auto-generate the full blueprint right after creation.
  useEffect(() => {
    if (autostart && idea && !hasAnyBlueprint && !generate.isPending) {
      generate
        .mutateAsync('generate-all')
        .then(() => toast.success('Your startup blueprint is ready!'))
        .catch((err) => toast.error(errorMessage(err)))
        .finally(() => {
          params.delete('autostart');
          setParams(params, { replace: true });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autostart, idea, hasAnyBlueprint]);

  if (isLoading) return <PageLoader />;

  if (isError || !idea) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Idea not found</h1>
          <p className="mt-2 text-muted-foreground">This idea may have been removed or you do not have access.</p>
          <Button className="mt-4" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const generatingAll = generate.isPending && generate.variables === 'generate-all';

  const remove = async () => {
    if (!confirm('Delete this idea and its blueprint? This cannot be undone.')) return;
    try {
      await deleteIdea.mutateAsync(idea.id);
      toast.success('Idea deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <StageBadge stage={idea.stage} />
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {idea.category}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{idea.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{idea.problem}</p>
        </div>

        <div className="flex items-center gap-3">
          {typeof idea.startupScore === 'number' && (
            <div className="text-right">
              <p className={cn('font-display text-3xl font-bold', scoreColor(idea.startupScore))}>
                {idea.startupScore}
              </p>
              <p className="text-xs text-muted-foreground">Startup score</p>
            </div>
          )}
          <Button variant="outline" size="icon" onClick={remove} aria-label="Delete idea">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!hasAnyBlueprint && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:flex-row">
          <div>
            <h3 className="font-display text-lg font-semibold">Generate your startup blueprint</h3>
            <p className="text-sm text-muted-foreground">
              Validation, business model, product plan and design — all at once.
            </p>
          </div>
          <Button onClick={() => generate.mutate('generate-all')} disabled={generatingAll}>
            {generatingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate blueprint
          </Button>
        </div>
      )}

      <div className="mt-6">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div className="mt-6">
        {tab === 'overview' && <OverviewTab idea={idea} onOpenTab={setTab} />}
        {tab === 'validation' && <ValidationTab idea={idea} />}
        {tab === 'business' && <BusinessTab idea={idea} />}
        {tab === 'product' && <ProductTab idea={idea} />}
        {tab === 'design' && <DesignTab idea={idea} />}
        {tab === 'copilot' && <CopilotTab ideaId={idea.id} />}
        {tab === 'workspace' && <WorkspaceTab idea={idea} />}
      </div>
    </div>
  );
}
