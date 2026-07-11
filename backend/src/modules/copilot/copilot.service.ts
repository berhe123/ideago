import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CopilotMessage, CopilotRole } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AiService } from '../../ai/ai.service';
import { GeminiRateLimitError } from '../../ai/providers/gemini.provider';
import { ChatMessage } from '../../ai/providers/provider.interface';
import { IdeaService } from '../idea/idea.service';

const STAGE_SUGGESTIONS: Record<string, string[]> = {
  IDEA: ['Is this idea worth pursuing?', 'Who is my ideal first customer?', 'What should I validate first?'],
  VALIDATION: ['How do I size this market?', 'Who are my real competitors?', 'How do I test willingness to pay?'],
  PLANNING: ['What should be in my MVP?', 'How do I prioritize features?', 'What tech stack should I use?'],
  DESIGN: ['What screens do I need first?', 'How do I improve onboarding?', 'What should my brand feel like?'],
  MVP: ['How do I scope a 6-week MVP?', 'What metrics should I track?', 'How do I find beta users?'],
  DEVELOPMENT: ['How do I run effective sprints?', 'What should I build next?', 'How do I avoid scope creep?'],
  LAUNCH: ['Which launch channel should I pick?', 'How do I write my positioning?', 'What makes a launch succeed?'],
  GROWTH: ['How do I improve retention?', 'What is my growth loop?', 'Where should I spend on acquisition?'],
};

@Injectable()
export class CopilotService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly ideas: IdeaService,
  ) {}

  private toDto(m: CopilotMessage) {
    return {
      id: m.id,
      ideaId: m.ideaId,
      role: m.role,
      content: m.content,
      stage: m.stage,
      createdAt: m.createdAt.toISOString(),
    };
  }

  async history(userId: string, ideaId: string) {
    await this.ideas.getOwned(userId, ideaId);
    const messages = await this.prisma.copilotMessage.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    return {
      messages: messages.map((m) => this.toDto(m)),
      provider: this.ai.responseSource,
    };
  }

  async ask(userId: string, ideaId: string, content: string) {
    const idea = await this.ideas.getOwned(userId, ideaId);

    const priorMessages = await this.prisma.copilotMessage.findMany({
      where: { ideaId },
      orderBy: { createdAt: 'asc' },
      take: 4,
    });

    const system = this.buildSystemPrompt(idea);
    const chat: ChatMessage[] = [
      { role: 'system', content: system },
      ...priorMessages.map((m) => ({
        role: m.role === CopilotRole.USER ? ('user' as const) : ('assistant' as const),
        content: m.content,
      })),
      { role: 'user', content },
    ];

    let answer: string;
    try {
      answer = await this.ai.chat(chat, { temperature: 0.7, maxTokens: 512 });
    } catch (err) {
      if (err instanceof GeminiRateLimitError) {
        throw new HttpException(
          {
            message: err.message,
            retryAfterSec: err.retryAfterSec,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new ServiceUnavailableException(
        `AI provider unavailable (${this.ai.providerName}): ${(err as Error).message}`,
      );
    }

    await this.prisma.copilotMessage.create({
      data: { ideaId, role: CopilotRole.USER, content, stage: idea.stage },
    });

    const assistant = await this.prisma.copilotMessage.create({
      data: { ideaId, role: CopilotRole.ASSISTANT, content: answer, stage: idea.stage },
    });

    return {
      message: this.toDto(assistant),
      suggestions: STAGE_SUGGESTIONS[idea.stage] ?? STAGE_SUGGESTIONS.IDEA,
      provider: this.ai.responseSource,
    };
  }

  private buildSystemPrompt(idea: {
    title: string;
    problem: string;
    solution: string;
    targetMarket: string;
    category: string;
    stage: string;
  }): string {
    return [
      'You are Ideago Copilot — an expert startup advisor combining the skills of a product manager,',
      'business strategist, designer, and engineer. Be concrete, encouraging, and actionable. Use short',
      'paragraphs and numbered steps. Tailor advice to the founder’s current stage.',
      '',
      `Idea: ${idea.title}`,
      `Category: ${idea.category}`,
      `Problem: ${idea.problem}`,
      `Solution: ${idea.solution}`,
      `Target market: ${idea.targetMarket}`,
      `Stage: ${idea.stage}`,
    ].join('\n');
  }
}
