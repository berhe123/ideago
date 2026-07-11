import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessage, LlmProvider } from './providers/provider.interface';
import { MockProvider } from './providers/mock.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: LlmProvider;
  private readonly fallback = new MockProvider();
  private readonly allowFallback: boolean;
  private lastResponseSource: 'provider' | 'mock' = 'provider';

  constructor(private readonly config: ConfigService) {
    const configured = (this.config.get<string>('ai.provider') || 'mock').toLowerCase();
    this.allowFallback =
      configured === 'mock' || this.config.get<boolean>('ai.fallbackToMock') === true;
    this.provider = this.resolveProvider();
    this.logger.log(
      `AI provider: ${this.provider.name}${this.provider.offline ? ' (offline)' : ''}` +
        (this.allowFallback ? ' · mock fallback enabled' : ' · mock fallback disabled'),
    );
  }

  get providerName(): string {
    return this.provider.name;
  }

  /** Which engine produced the last chat() response. */
  get responseSource(): string {
    return this.lastResponseSource === 'mock' ? 'mock' : this.provider.name;
  }

  async chat(messages: ChatMessage[], opts?: { temperature?: number; maxTokens?: number }): Promise<string> {
    try {
      const out = await this.provider.chat(messages, opts);
      if (out && out.trim()) {
        this.lastResponseSource = 'provider';
        if (!this.provider.offline) {
          this.logger.log(`AI response from ${this.provider.name} (${out.length} chars)`);
        }
        return out;
      }
      throw new Error('Empty completion');
    } catch (err) {
      if (!this.allowFallback || this.provider.offline) {
        this.lastResponseSource = 'provider';
        throw err;
      }
      this.logger.warn(
        `Provider "${this.provider.name}" failed, using offline fallback: ${(err as Error).message}`,
      );
      this.lastResponseSource = 'mock';
      return this.fallback.chat(messages, opts);
    }
  }

  private resolveProvider(): LlmProvider {
    const name = (this.config.get<string>('ai.provider') || 'mock').toLowerCase();
    const model = this.config.get<string>('ai.model') || undefined;

    switch (name) {
      case 'openai': {
        const key = this.config.get<string>('ai.openaiKey');
        if (key) return new OpenAiProvider(key, model || 'gpt-4o-mini');
        this.logger.warn('AI_PROVIDER=openai but OPENAI_API_KEY missing — using offline mock.');
        return this.fallback;
      }
      case 'anthropic': {
        const key = this.config.get<string>('ai.anthropicKey');
        if (key) return new AnthropicProvider(key, model || 'claude-3-5-sonnet-latest');
        this.logger.warn('AI_PROVIDER=anthropic but ANTHROPIC_API_KEY missing — using offline mock.');
        return this.fallback;
      }
      case 'gemini': {
        const key = this.config.get<string>('ai.geminiKey');
        if (key) return new GeminiProvider(key, model || 'gemini-2.0-flash-lite');
        this.logger.warn('AI_PROVIDER=gemini but GEMINI_API_KEY missing — using offline mock.');
        return this.fallback;
      }
      default:
        return this.fallback;
    }
  }
}
