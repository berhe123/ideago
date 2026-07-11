import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAskCopilot, useCopilot } from '@/features/copilot/api';
import { errorMessage } from '@/shared/api/client';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';

export function CopilotTab({ ideaId }: { ideaId: string }) {
  const { data, isLoading } = useCopilot(ideaId);
  const ask = useAskCopilot(ideaId);
  const [input, setInput] = useState('');
  const [cooldownSec, setCooldownSec] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];
  const suggestions = ['Is this idea worth pursuing?', 'How should I price it?', 'What should my MVP include?'];
  const sendDisabled = ask.isPending || cooldownSec > 0 || !input.trim();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, ask.isPending]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSec]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || ask.isPending || cooldownSec > 0) return;

    setInput('');
    try {
      await ask.mutateAsync(content);
    } catch (err) {
      setInput(content);
      const ax = err as {
        response?: { status?: number; data?: { message?: string; retryAfterSec?: number } };
      };
      if (ax.response?.status === 429) {
        const wait = ax.response.data?.retryAfterSec ?? 60;
        setCooldownSec(wait);
        toast.error(
          ax.response.data?.message ??
            `Google AI rate limit reached. Wait ${wait} seconds, then try again.`,
        );
        return;
      }
      toast.error(errorMessage(err));
    }
  };

  return (
    <Card className="flex h-[min(70dvh,640px)] min-h-[420px] flex-col overflow-hidden sm:h-[70vh]">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">Ideago Copilot</p>
          <p className="text-xs text-muted-foreground">
            Your AI startup advisor
            {data?.provider ? (
              <>
                {' · '}
                <span className={data.provider === 'mock' ? 'text-amber-400' : 'text-emerald-400'}>
                  {data.provider}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid h-full place-items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Sparkles className="mx-auto h-10 w-10 text-accent" />
              <p className="mt-3 font-display text-lg font-semibold">Ask me anything about your startup</p>
              <p className="text-sm text-muted-foreground">Validation, pricing, MVP scope, growth — I've got you.</p>
              <p className="mt-2 text-xs text-muted-foreground">Powered by Google Gemini — wait ~10s between messages.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={ask.isPending || cooldownSec > 0}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn('flex', m.role === 'USER' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm',
                  m.role === 'USER'
                    ? 'gradient-brand text-white'
                    : 'border border-border bg-background/60',
                )}
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {ask.isPending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin" /> Thinking… (Gemini may take up to a minute)
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {cooldownSec > 0 && (
        <p className="border-t border-border px-4 py-2 text-center text-xs text-amber-400">
          Rate limit cooldown — you can send again in {cooldownSec}s
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={cooldownSec > 0 ? `Wait ${cooldownSec}s…` : 'Ask your copilot…'}
          disabled={ask.isPending || cooldownSec > 0}
          className="h-11 flex-1 rounded-full border border-input bg-background/60 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <Button type="submit" size="icon" disabled={sendDisabled}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}
