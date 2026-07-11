import { Logger } from '@nestjs/common';
import { ChatMessage, ChatOptions, LlmProvider } from './provider.interface';

export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';
  readonly offline = false;
  private readonly logger = new Logger(OpenAiProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly model = 'gpt-4o-mini',
  ) {}

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 800,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`OpenAI error ${res.status}: ${text}`);
      throw new Error(`OpenAI request failed (${res.status})`);
    }

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }
}
