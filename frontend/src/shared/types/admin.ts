export interface AdminStatsDto {
  totalUsers: number;
  totalFounders: number;
  totalExperts: number;
  totalIdeas: number;
  validatedIdeas: number;
  activeProjects: number;
  hireRequests: number;
  avgStartupScore: number;
  ideasByStage: { stage: string; count: number }[];
  recentIdeas: {
    id: string;
    title: string;
    owner: string;
    stage: string;
    score?: number | null;
    createdAt: string;
  }[];
}
