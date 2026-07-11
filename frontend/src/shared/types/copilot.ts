import type { IdeaStage } from '../constants';

export interface CopilotMessageDto {
  id: string;
  ideaId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  stage?: IdeaStage | null;
  createdAt: string;
}

export interface CopilotReplyDto {
  message: CopilotMessageDto;
  suggestions: string[];
  provider?: string;
}
