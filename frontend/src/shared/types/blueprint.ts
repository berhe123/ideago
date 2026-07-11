// AI-generated startup blueprint artifacts. Shapes are stable so the UI can render them
// regardless of which provider (mock / openai / anthropic / gemini) produced them.

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface RiskItem {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  mitigation: string;
}

export interface ValidationDto {
  id: string;
  ideaId: string;
  startupScore: number; // 0-100
  verdict: string;
  marketSummary: string;
  marketSizeUsd: number;
  targetSegments: string[];
  competitors: Competitor[];
  swot: SwotAnalysis;
  risks: RiskItem[];
  recommendations: string[];
  createdAt: string;
}

export interface CustomerPersona {
  name: string;
  role: string;
  age: string;
  goals: string[];
  painPoints: string[];
}

export interface RevenueStream {
  name: string;
  description: string;
  estimatedShare: number; // percentage
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface LeanCanvas {
  problem: string[];
  solution: string[];
  uniqueValueProposition: string;
  unfairAdvantage: string;
  customerSegments: string[];
  keyMetrics: string[];
  channels: string[];
  costStructure: string[];
  revenueStreams: string[];
}

export interface BusinessModelDto {
  id: string;
  ideaId: string;
  leanCanvas: LeanCanvas;
  revenueModel: RevenueStream[];
  pricingTiers: PricingTier[];
  goToMarket: string[];
  personas: CustomerPersona[];
  financialProjection: {
    year: number;
    revenueUsd: number;
    costUsd: number;
    users: number;
  }[];
  createdAt: string;
}

export interface UserStory {
  asA: string;
  iWant: string;
  soThat: string;
  priority: 'MUST' | 'SHOULD' | 'COULD' | 'WONT';
}

export interface FeatureItem {
  name: string;
  description: string;
  effort: 'S' | 'M' | 'L' | 'XL';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  mvp: boolean;
}

export interface RoadmapPhase {
  phase: string;
  timeframe: string;
  goals: string[];
}

export interface ProductPlanDto {
  id: string;
  ideaId: string;
  prdSummary: string;
  objectives: string[];
  features: FeatureItem[];
  userStories: UserStory[];
  roadmap: RoadmapPhase[];
  techStack: { layer: string; choice: string; reason: string }[];
  mvpScope: string[];
  createdAt: string;
}

export interface DesignToken {
  name: string;
  value: string;
}

export interface WireframeScreen {
  name: string;
  purpose: string;
  sections: string[];
}

export interface DesignBriefDto {
  id: string;
  ideaId: string;
  brandPersonality: string[];
  colorPalette: DesignToken[];
  typography: { heading: string; body: string };
  uxPrinciples: string[];
  screens: WireframeScreen[];
  createdAt: string;
}

export interface BlueprintDto {
  validation: ValidationDto | null;
  businessModel: BusinessModelDto | null;
  productPlan: ProductPlanDto | null;
  designBrief: DesignBriefDto | null;
}
