import {
  generateBusinessModel,
  generateDesignBrief,
  generateProductPlan,
  generateValidation,
  IdeaInput,
} from './blueprint.generator';

const idea: IdeaInput = {
  id: 'idea_test_123',
  title: 'Snap — AI receipts for freelancers',
  problem: 'Freelancers waste hours tracking receipts and categorizing expenses for taxes.',
  solution: 'A mobile app that scans receipts and auto-categorizes expenses using AI.',
  targetMarket: 'Independent freelancers and solo consultants',
  category: 'Fintech',
};

describe('blueprint generator', () => {
  it('produces a validation with a bounded score', () => {
    const v = generateValidation(idea);
    expect(v.startupScore).toBeGreaterThanOrEqual(38);
    expect(v.startupScore).toBeLessThanOrEqual(94);
    expect(v.competitors.length).toBeGreaterThan(0);
    expect(v.swot.strengths.length).toBeGreaterThan(0);
    expect(v.recommendations.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same idea id', () => {
    expect(generateValidation(idea).startupScore).toBe(generateValidation(idea).startupScore);
  });

  it('produces a business model with pricing tiers and projections', () => {
    const b = generateBusinessModel(idea);
    expect(b.pricingTiers.length).toBe(3);
    expect(b.financialProjection.length).toBe(3);
    expect(b.leanCanvas.uniqueValueProposition).toContain('fastest');
  });

  it('produces a product plan with MVP features', () => {
    const p = generateProductPlan(idea);
    expect(p.features.some((f) => f.mvp)).toBe(true);
    expect(p.mvpScope.length).toBeGreaterThan(0);
    expect(p.roadmap.length).toBeGreaterThan(0);
  });

  it('produces a design brief with a palette and screens', () => {
    const d = generateDesignBrief(idea);
    expect(d.colorPalette.length).toBeGreaterThan(0);
    expect(d.screens.length).toBeGreaterThan(0);
    expect(d.typography.heading).toBeTruthy();
  });
});
