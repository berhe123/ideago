import { Logger } from '@nestjs/common';
import { ChatMessage, ChatOptions, LlmProvider } from './provider.interface';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Free-tier Gemini allows ~15 RPM — stay well under that globally. */
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 10_000;

/** Lighter models tend to have more generous free-tier quotas. */
const MODEL_FALLBACKS = ['gemini-2.0-flash-lite', 'gemini-1.5-flash-8b', 'gemini-1.5-flash'];

export class GeminiRateLimitError extends Error {
  readonly retryAfterSec: number;

  constructor(retryAfterSec = 60, message?: string) {
    super(
      message ??
        `Google AI rate limit reached. Please wait ${retryAfterSec} seconds before sending another message.`,
    );
    this.name = 'GeminiRateLimitError';
    this.retryAfterSec = retryAfterSec;
  }
}

export class GeminiProvider implements LlmProvider {
  readonly name = 'gemini';
  readonly offline = false;
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly models: string[];

  constructor(
    private readonly apiKey: string,
    primaryModel = 'gemini-2.0-flash-lite',
  ) {
    this.models = [primaryModel, ...MODEL_FALLBACKS.filter((m) => m !== primaryModel)];
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    await this.throttle();

    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body = JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: {
        temperature: opts.temperature ?? 0.7,
        maxOutputTokens: opts.maxTokens ?? 512,
      },
    });

    let lastError: Error | null = null;

    for (const model of this.models) {
      try {
        const res = await this.fetchOnce(model, body);
        const data = (await res.json()) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
        };
        const answer =
          data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim() ?? '';

        if (!answer) {
          throw new Error('Gemini returned an empty response');
        }

        this.logger.log(`Gemini response via model ${model}`);
        return answer;
      } catch (err) {
        lastError = err as Error;
        const msg = lastError.message;
        if (lastError instanceof GeminiRateLimitError) {
          throw lastError;
        }
        if (msg.includes('(404)') || msg.toLowerCase().includes('not found')) {
          this.logger.warn(`Model ${model} unavailable, trying next…`);
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error('Gemini request failed for all models');
  }

  private async throttle() {
    const now = Date.now();
    const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  }

  private parseRetryAfterSec(status: number, bodyText: string, header?: string | null): number {
    const fromHeader = header ? Number.parseInt(header, 10) : NaN;
    if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;

    try {
      const json = JSON.parse(bodyText) as {
        error?: { details?: { retryDelay?: string }[]; message?: string };
      };
      const retryDetail = json.error?.details?.find((d) => d.retryDelay)?.retryDelay;
      if (retryDetail) {
        const match = retryDetail.match(/(\d+)/);
        if (match) return Math.max(Number.parseInt(match[1], 10), 30);
      }
    } catch {
      /* ignore parse errors */
    }

    return status === 429 ? 60 : 15;
  }

  private async fetchOnce(model: string, body: string): Promise<Response> {
    const base = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const url = `${base}?key=${encodeURIComponent(this.apiKey)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey,
      },
      body,
    });

    if (res.ok) return res;

    const text = await res.text();
    this.logger.error(`Gemini error ${res.status} (${model}): ${text}`);

    if (res.status === 429) {
      const retryAfterSec = this.parseRetryAfterSec(res.status, text, res.headers.get('retry-after'));
      this.logger.warn(`Rate limited — waiting ${retryAfterSec}s before one retry…`);
      await sleep(retryAfterSec * 1000);
      lastRequestAt = Date.now();

      const retry = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body,
      });

      if (retry.ok) return retry;

      const retryText = await retry.text();
      this.logger.error(`Gemini retry failed ${retry.status} (${model}): ${retryText}`);
      const retrySec = this.parseRetryAfterSec(retry.status, retryText, retry.headers.get('retry-after'));
      throw new GeminiRateLimitError(retrySec);
    }

    if (res.status === 503) {
      await sleep(5_000);
      const retry = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body,
      });
      if (retry.ok) return retry;
    }

    throw new Error(`Gemini request failed (${res.status})`);
  }
}
