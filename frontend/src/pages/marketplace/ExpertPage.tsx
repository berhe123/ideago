import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Star } from 'lucide-react';
import { toast } from 'sonner';
import { EXPERT_CATEGORY_LABEL } from '@/shared';
import { useExpert, useHireExpert } from '@/entities/expert/api';
import { useIdeas } from '@/entities/idea/api';
import { useAuthStore } from '@/entities/user/store';
import { errorMessage } from '@/shared/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Textarea } from '@/shared/ui/textarea';
import { PageLoader } from '@/shared/ui/page-loader';
import { initials } from '@/shared/lib/format';

export default function ExpertPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: expert, isLoading, isError } = useExpert(id);
  const { isAuthenticated } = useAuthStore();
  const { data: ideas } = useIdeas({}, { enabled: isAuthenticated });
  const hire = useHireExpert();

  const [message, setMessage] = useState('');
  const [ideaId, setIdeaId] = useState<string>('');

  if (isLoading) return <PageLoader />;

  if (isError || !expert) {
    return (
      <div className="container max-w-4xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Expert not found</h1>
        <p className="mt-2 text-muted-foreground">This profile may have been removed.</p>
        <Button className="mt-4" onClick={() => navigate('/marketplace')}>
          Back to marketplace
        </Button>
      </div>
    );
  }

  const submit = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/experts/${id}` } });
      return;
    }
    if (message.trim().length < 5) {
      toast.error('Add a short message about your project.');
      return;
    }
    try {
      await hire.mutateAsync({ expertId: expert.id, ideaId: ideaId || undefined, message });
      toast.success('Request sent! The expert will be in touch.');
      setMessage('');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="container max-w-4xl py-12">
      <button
        onClick={() => navigate('/marketplace')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Marketplace
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-brand text-lg font-bold text-white">
                  {initials(expert.fullName)}
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold">{expert.fullName}</h1>
                  <p className="text-sm text-muted-foreground">{EXPERT_CATEGORY_LABEL[expert.category]}</p>
                  <div className="mt-1 flex items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <Star className="h-4 w-4 fill-amber-400" /> {expert.rating.toFixed(1)} ({expert.reviewsCount})
                    </span>
                    {expert.location && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {expert.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm">{expert.bio}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {expert.skills.map((s) => (
                  <Badge key={s} className="bg-muted">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hire {expert.fullName.split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold gradient-text">${expert.hourlyRateUsd}<span className="text-sm text-muted-foreground">/hr</span></p>

              {isAuthenticated && ideas?.items.length ? (
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Attach an idea (optional)</label>
                  <select
                    value={ideaId}
                    onChange={(e) => setIdeaId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">None</option>
                    {ideas.items.map((i) => (
                      <option key={i.id} value={i.id}>{i.title}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              <Textarea
                className="mt-4"
                placeholder="Tell them about your project…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button className="mt-4 w-full" onClick={submit} disabled={hire.isPending}>
                {hire.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isAuthenticated ? 'Send request' : 'Sign in to hire'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
