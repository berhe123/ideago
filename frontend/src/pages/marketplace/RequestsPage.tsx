import { Inbox, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import type { HireRequestDto } from '@/shared';
import {
  useIncomingRequests,
  useRespondRequest,
  useSentRequests,
} from '@/entities/expert/api';
import { errorMessage } from '@/shared/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/empty';
import { formatDate } from '@/shared/lib/format';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  ACCEPTED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  DECLINED: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  COMPLETED: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
};

export default function RequestsPage() {
  const sent = useSentRequests();
  const incoming = useIncomingRequests();
  const respond = useRespondRequest();

  const act = async (id: string, status: string) => {
    try {
      await respond.mutateAsync({ id, status });
      toast.success(`Request ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Requests</h1>
      <p className="mt-1 text-muted-foreground">Manage your hire requests.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" /> Sent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sent.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : sent.data?.length ? (
              sent.data.map((r) => <RequestRow key={r.id} r={r} who={r.expert?.fullName ?? 'Expert'} />)
            ) : (
              <p className="text-sm text-muted-foreground">You haven’t sent any requests yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-accent" /> Incoming
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {incoming.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : incoming.data?.length ? (
              incoming.data.map((r) => (
                <div key={r.id} className="rounded-xl border border-border p-4">
                  <RequestRow r={r} who="From a founder" />
                  {r.status === 'PENDING' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => act(r.id, 'ACCEPTED')}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => act(r.id, 'DECLINED')}>
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <EmptyState
                icon={<Inbox className="h-8 w-8" />}
                title="No incoming requests"
                description="Set up an expert profile to start receiving project requests."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RequestRow({ r, who }: { r: HireRequestDto; who: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{who}</p>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[r.status]}`}>
          {r.status}
        </span>
      </div>
      {r.ideaTitle && (
        <Badge className="mt-1 bg-muted text-xs">Idea: {r.ideaTitle}</Badge>
      )}
      <p className="mt-2 text-sm text-muted-foreground">{r.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
    </div>
  );
}
