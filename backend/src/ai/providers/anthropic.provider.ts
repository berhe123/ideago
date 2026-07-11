import { Logger } from '@nestjs/common';
import { ChatMessage, ChatOptions, LlmProvider } from './provider.interface';

export class AnthropicProvider implements LlmProvider {
  readonly name = 'anthropic';
  readonly offline = false;
  private readonly logger = new Logger(AnthropicProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly model = 'claude-3-5-sonnet-latest',
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const turns = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        system,
        messages: turns,
        max_tokens: opts.maxTokens ?? 800,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Anthropic error ${res.status}: ${text}`);
      throw new Error(`Anthropic request failed (${res.status})`);
    }

    const data = (await res.json()) as { content: { text: string }[] };
    return data.content?.map((c) => c.text).join('').trim() ?? '';
  }
}
