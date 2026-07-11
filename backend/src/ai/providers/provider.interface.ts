export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Minimal LLM abstraction. Every provider (mock / OpenAI / Anthropic / Gemini)
 * implements this so the rest of the app never depends on a specific vendor.
 */
export interface LlmProvider {
  readonly name: string;
  /** Whether this provider runs fully offline (no external API). */
  readonly offline: boolean;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<string>;
}
