import type { ExpertCategory, HireStatus } from '../constants';

export interface ExpertDto {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  category: ExpertCategory;
  headline: string;
  bio: string;
  skills: string[];
  hourlyRateUsd: number;
  rating: number;
  reviewsCount: number;
  available: boolean;
  location?: string | null;
  createdAt: string;
}

export interface HireRequestDto {
  id: string;
  expertId: string;
  founderId: string;
  ideaId?: string | null;
  message: string;
  status: HireStatus;
  expert?: ExpertDto;
  ideaTitle?: string | null;
  createdAt: string;
}
