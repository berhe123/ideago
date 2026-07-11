import type {
  BusinessModel,
  DesignBrief,
  ProductPlan,
  Validation,
} from '@prisma/client';
import type {
  BusinessModelDto,
  DesignBriefDto,
  ProductPlanDto,
  ValidationDto,
} from '../../shared';

export function toValidationDto(v: Validation): ValidationDto {
  return {
    id: v.id,
    ideaId: v.ideaId,
    startupScore: v.startupScore,
    verdict: v.verdict,
    marketSummary: v.marketSummary,
    marketSizeUsd: Number(v.marketSizeUsd),
    targetSegments: v.targetSegments as unknown as ValidationDto['targetSegments'],
    competitors: v.competitors as unknown as ValidationDto['competitors'],
    swot: v.swot as unknown as ValidationDto['swot'],
    risks: v.risks as unknown as ValidationDto['risks'],
    recommendations: v.recommendations as unknown as ValidationDto['recommendations'],
    createdAt: v.createdAt.toISOString(),
  };
}

export function toBusinessModelDto(b: BusinessModel): BusinessModelDto {
  return {
    id: b.id,
    ideaId: b.ideaId,
    leanCanvas: b.leanCanvas as unknown as BusinessModelDto['leanCanvas'],
    revenueModel: b.revenueModel as unknown as BusinessModelDto['revenueModel'],
    pricingTiers: b.pricingTiers as unknown as BusinessModelDto['pricingTiers'],
    goToMarket: b.goToMarket as unknown as BusinessModelDto['goToMarket'],
    personas: b.personas as unknown as BusinessModelDto['personas'],
    financialProjection: b.financialProjection as unknown as BusinessModelDto['financialProjection'],
    createdAt: b.createdAt.toISOString(),
  };
}

export function toProductPlanDto(p: ProductPlan): ProductPlanDto {
  return {
    id: p.id,
    ideaId: p.ideaId,
    prdSummary: p.prdSummary,
    objectives: p.objectives as unknown as ProductPlanDto['objectives'],
    features: p.features as unknown as ProductPlanDto['features'],
    userStories: p.userStories as unknown as ProductPlanDto['userStories'],
    roadmap: p.roadmap as unknown as ProductPlanDto['roadmap'],
    techStack: p.techStack as unknown as ProductPlanDto['techStack'],
    mvpScope: p.mvpScope as unknown as ProductPlanDto['mvpScope'],
    createdAt: p.createdAt.toISOString(),
  };
}

export function toDesignBriefDto(d: DesignBrief): DesignBriefDto {
  return {
    id: d.id,
    ideaId: d.ideaId,
    brandPersonality: d.brandPersonality as unknown as DesignBriefDto['brandPersonality'],
    colorPalette: d.colorPalette as unknown as DesignBriefDto['colorPalette'],
    typography: d.typography as unknown as DesignBriefDto['typography'],
    uxPrinciples: d.uxPrinciples as unknown as DesignBriefDto['uxPrinciples'],
    screens: d.screens as unknown as DesignBriefDto['screens'],
    createdAt: d.createdAt.toISOString(),
  };
}
