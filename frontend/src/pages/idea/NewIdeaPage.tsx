import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useCreateIdea } from '@/entities/idea/api';
import { errorMessage } from '@/shared/api/client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card } from '@/shared/ui/card';

const STEPS = [
  { key: 'title', label: 'Name your idea', field: 'title', placeholder: 'e.g. Snap — AI receipts for freelancers', long: false, hint: 'A short, memorable name.' },
  { key: 'problem', label: 'What problem does it solve?', field: 'problem', placeholder: 'Describe the pain your customers feel today…', long: true, hint: 'Who hurts, how often, and how much it costs them.' },
  { key: 'solution', label: 'What’s your solution?', field: 'solution', placeholder: 'Describe how your product removes that pain…', long: true, hint: 'The core of what you’ll build.' },
  { key: 'targetMarket', label: 'Who is it for?', field: 'targetMarket', placeholder: 'e.g. Independent freelancers and solo consultants', long: false, hint: 'Your initial target customer.' },
  { key: 'category', label: 'Category', field: 'category', placeholder: 'e.g. Fintech, SaaS, Consumer, Health…', long: false, hint: 'The space your startup plays in.' },
] as const;

type Form = { title: string; problem: string; solution: string; targetMarket: string; category: string };

export default function NewIdeaPage() {
  const navigate = useNavigate();
  const createIdea = useCreateIdea();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    title: '',
    problem: '',
    solution: '',
    targetMarket: '',
    category: '',
  });

  const current = STEPS[step];
  const value = form[current.field as keyof Form];
  const isLast = step === STEPS.length - 1;
  const canNext = value.trim().length >= (current.long ? 10 : 2);

  const next = async () => {
    if (!canNext) {
      toast.error('Please add a little more detail.');
      return;
    }
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    try {
      const idea = await createIdea.mutateAsync(form);
      toast.success('Idea created! Generating your blueprint…');
      navigate(`/ideas/${idea.id}?autostart=1`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create idea'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-accent" />
        New idea · Step {step + 1} of {STEPS.length}
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full gradient-brand transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Card className="p-8">
        <h1 className="font-display text-2xl font-bold">{current.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{current.hint}</p>

        <div className="mt-6">
          {current.long ? (
            <Textarea
              autoFocus
              rows={6}
              value={value}
              placeholder={current.placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [current.field]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) next();
              }}
            />
          ) : (
            <Input
              autoFocus
              value={value}
              placeholder={current.placeholder}
              onChange={(e) => setForm((f) => ({ ...f, [current.field]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') next();
              }}
            />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => (step === 0 ? navigate('/dashboard') : setStep((s) => s - 1))}
          >
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={next} disabled={createIdea.isPending}>
            {createIdea.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLast ? 'Create & generate blueprint' : 'Continue'}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
