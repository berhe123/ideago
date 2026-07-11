import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { EXPERT_CATEGORY, EXPERT_CATEGORY_LABEL } from '@/shared';
import { useMyExpertProfile, useUpsertExpert } from '@/entities/expert/api';
import { useAuthStore } from '@/entities/user/store';
import { errorMessage } from '@/shared/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

const CATEGORIES = Object.values(EXPERT_CATEGORY);

export default function ExpertSetupPage() {
  const { data: profile, isLoading } = useMyExpertProfile();
  const upsert = useUpsertExpert();
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [form, setForm] = useState({
    category: CATEGORIES[0] as string,
    headline: '',
    bio: '',
    skills: '',
    hourlyRateUsd: 60,
    location: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        category: profile.category,
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills.join(', '),
        hourlyRateUsd: profile.hourlyRateUsd,
        location: profile.location ?? '',
      });
    }
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert.mutateAsync({
        category: form.category,
        headline: form.headline,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        hourlyRateUsd: Number(form.hourlyRateUsd),
        location: form.location || undefined,
      });
      await fetchMe();
      toast.success('Expert profile saved — you’re now in the marketplace!');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (isLoading) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">
        {profile ? 'Your expert profile' : 'Become an expert'}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Offer your skills to founders building their startups.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{EXPERT_CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Headline</label>
              <Input
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                placeholder="Full-stack engineer — React, NestJS, Postgres"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell founders about your experience…"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Skills (comma-separated)</label>
              <Input
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                placeholder="React, TypeScript, NestJS"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Hourly rate (USD)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.hourlyRateUsd}
                  onChange={(e) => setForm((f) => ({ ...f, hourlyRateUsd: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Remote"
                />
              </div>
            </div>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
