import type { IdeaStage, IdeaStatus } from '../constants';
import type { BlueprintDto } from './blueprint';

export interface IdeaDto {
  id: string;
  ownerId: string;
  title: string;
  problem: string;
  solution: string;
  targetMarket: string;
  category: string;
  stage: IdeaStage;
  status: IdeaStatus;
  startupScore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaDetailDto extends IdeaDto {
  blueprint: BlueprintDto;
  hasProject: boolean;
}
