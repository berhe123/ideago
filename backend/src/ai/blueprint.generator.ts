/**
 * Deterministic startup-blueprint engine.
 *
 * Turns a raw idea into fully-structured artifacts (validation, business model,
 * product plan, design brief). It is 100% offline and deterministic (seeded by
 * the idea id) so results are stable, testable, and require no API key. When a
 * real LLM provider is configured, the Copilot and narrative refinement use it;
 * the structured artifacts remain reliable regardless of provider availability.
 */

export interface IdeaInput {
  id: string;
  title: string;
  problem: string;
  solution: string;
  targetMarket: string;
  category: string;
}

// --- Seeded pseudo-randomness -------------------------------------------------

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rng {
  private next: () => number;
  constructor(seed: string) {
    this.next = mulberry32(hashSeed(seed));
  }
  float() {
    return this.next();
  }
  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  sample<T>(arr: T[], n: number): T[] {
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
      out.push(copy.splice(Math.floor(this.next() * copy.length), 1)[0]);
    }
    return out;
  }
}

// --- Small NLP-ish helpers ----------------------------------------------------

function keywords(idea: IdeaInput): string[] {
  const text = `${idea.title} ${idea.problem} ${idea.solution} ${idea.targetMarket}`.toLowerCase();
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with', 'that', 'this',
    'is', 'are', 'be', 'by', 'it', 'as', 'we', 'our', 'their', 'they', 'who', 'how', 'can',
    'will', 'help', 'people', 'users', 'make', 'using', 'use', 'than', 'from', 'into', 'them',
  ]);
  const counts = new Map<string, number>();
  for (const raw of text.split(/[^a-z0-9]+/)) {
    if (raw.length < 4 || stop.has(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w).slice(0, 8);
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function clarity(text: string): number {
  const len = text.trim().split(/\s+/).length;
  if (len < 4) return 0.35;
  if (len < 10) return 0.6;
  if (len < 30) return 0.85;
  return 1;
}

// --- Validation ---------------------------------------------------------------

export function generateValidation(idea: IdeaInput) {
  const rng = new Rng(idea.id + ':validation');
  const kw = keywords(idea);
  const focus = kw[0] ? titleCase(kw[0]) : idea.category;

  const problemClarity = clarity(idea.problem);
  const solutionClarity = clarity(idea.solution);
  const marketClarity = clarity(idea.targetMarket);
  const base = (problemClarity + solutionClarity + marketClarity) / 3;
  const startupScore = Math.max(38, Math.min(94, Math.round(base * 70 + rng.int(8, 24))));

  const verdict =
    startupScore >= 80
      ? 'Strong potential — pursue with focused validation.'
      : startupScore >= 65
        ? 'Promising — de-risk the key assumptions before building.'
        : startupScore >= 50
          ? 'Workable, but needs sharper problem/market focus.'
          : 'Early — refine the problem and target customer first.';

  const marketSizeUsd = rng.int(2, 48) * 1_000_000_000;

  const segments = [
    `Early adopters in ${idea.targetMarket || idea.category}`,
    `${titleCase(idea.category)} teams seeking efficiency`,
    `Budget-conscious ${kw[1] ? kw[1] : 'small business'} buyers`,
    `Power users frustrated by legacy ${focus.toLowerCase()} tools`,
  ];

  const competitorNames = rng.sample(
    ['Northstar', 'Vantage', 'Loop', 'Cobalt', 'Lumen', 'Quill', 'Patchwork', 'Beacon', 'Forge'],
    3,
  );
  const competitors = competitorNames.map((name) => ({
    name,
    description: `An established ${idea.category} player serving overlapping customers.`,
    strengths: rng.sample(
      ['Brand recognition', 'Large install base', 'Funding runway', 'Integrations', 'Enterprise sales'],
      2,
    ),
    weaknesses: rng.sample(
      ['Clunky UX', 'Slow to innovate', 'Expensive', 'Poor support', 'Bloated feature set'],
      2,
    ),
  }));

  return {
    startupScore,
    verdict,
    marketSummary: `The ${idea.category} space is growing as ${idea.targetMarket || 'target customers'} look for better ways to ${kw[0] ? kw[0] : 'solve this problem'}. ${idea.solution.slice(0, 140)} addresses a real gap, with the clearest wedge being ${segments[0].toLowerCase()}.`,
    marketSizeUsd,
    targetSegments: segments,
    competitors,
    swot: {
      strengths: [
        `Focused solution: ${idea.solution.slice(0, 80)}`,
        'Clear initial customer to target',
        'Lean, software-first approach keeps costs low',
      ],
      weaknesses: [
        problemClarity < 0.7 ? 'Problem statement needs sharpening' : 'Limited brand awareness early on',
        'No proprietary data or network effects yet',
      ],
      opportunities: [
        `Underserved segment: ${segments[2]}`,
        'Incumbents are slow and disliked for UX',
        'AI/automation can compress cost-to-serve',
      ],
      threats: [
        'Well-funded incumbents could copy fast',
        marketClarity < 0.7 ? 'Unclear go-to-market channel' : 'Customer acquisition cost risk',
      ],
    },
    risks: [
      {
        title: 'Demand risk',
        severity: startupScore >= 70 ? 'MEDIUM' : 'HIGH',
        mitigation: 'Run customer interviews and a pre-sale landing page before building.',
      },
      {
        title: 'Differentiation risk',
        severity: 'MEDIUM',
        mitigation: 'Pick a narrow wedge segment incumbents ignore and win it decisively.',
      },
      {
        title: 'Execution risk',
        severity: 'MEDIUM',
        mitigation: 'Scope a 4–6 week MVP that proves the single core value.',
      },
    ],
    recommendations: [
      'Interview 10 target customers and capture the exact language they use.',
      'Validate willingness-to-pay with a pre-sale or paid pilot.',
      `Build an MVP focused only on: ${idea.solution.slice(0, 70)}.`,
      'Define one north-star metric and instrument it before launch.',
    ],
  };
}

// --- Business model -----------------------------------------------------------

export function generateBusinessModel(idea: IdeaInput) {
  const rng = new Rng(idea.id + ':business');
  const kw = keywords(idea);
  const uvp = `The fastest way for ${idea.targetMarket || idea.category} to ${kw[0] ?? 'solve this'} — without the cost and complexity of legacy tools.`;

  const revenueModel = [
    { name: 'Subscription (SaaS)', description: 'Monthly/annual plans by seat or usage.', estimatedShare: 60 },
    { name: 'Premium add-ons', description: 'Advanced features, integrations, priority support.', estimatedShare: 25 },
    { name: 'Services / onboarding', description: 'Setup and white-glove migration for larger accounts.', estimatedShare: 15 },
  ];

  const pricingTiers = [
    { name: 'Starter', price: '$0', features: ['Core features', '1 project', 'Community support'] },
    { name: 'Pro', price: `$${rng.int(19, 49)}/mo`, features: ['Unlimited projects', 'Integrations', 'Email support', 'Analytics'] },
    { name: 'Business', price: `$${rng.int(99, 299)}/mo`, features: ['Team workspaces', 'SSO & roles', 'Priority support', 'SLA'] },
  ];

  const personas = [
    {
      name: rng.pick(['Maya', 'Daniel', 'Aisha', 'Leo']),
      role: `${titleCase(idea.category)} lead`,
      age: `${rng.int(28, 44)}`,
      goals: ['Save time on repetitive work', 'Look great to stakeholders', 'Hit growth targets'],
      painPoints: ['Tools are clunky and slow', 'Too much manual work', 'Hard to see what matters'],
    },
    {
      name: rng.pick(['Sam', 'Priya', 'Marco', 'Nina']),
      role: 'Hands-on operator',
      age: `${rng.int(24, 38)}`,
      goals: ['Get set up fast', 'Avoid steep learning curves', 'Trust the data'],
      painPoints: ['Switching costs', 'Fragmented workflows', 'Limited budget'],
    },
  ];

  const y1Users = rng.int(500, 3000);
  const arpu = rng.int(120, 480);
  const financialProjection = [1, 2, 3].map((year) => {
    const growth = Math.pow(rng.int(25, 40) / 10, year - 1);
    const users = Math.round(y1Users * growth);
    const revenueUsd = Math.round(users * arpu);
    const costUsd = Math.round(revenueUsd * (year === 1 ? 1.4 : year === 2 ? 0.85 : 0.6));
    return { year, revenueUsd, costUsd, users };
  });

  return {
    leanCanvas: {
      problem: [idea.problem.slice(0, 120), 'Existing tools are slow and expensive', 'Manual workarounds waste time'],
      solution: [idea.solution.slice(0, 120), 'Automate the painful steps', 'Make insight instant'],
      uniqueValueProposition: uvp,
      unfairAdvantage: 'Speed of iteration + a sharply focused wedge segment + workflow data over time.',
      customerSegments: [idea.targetMarket || `${idea.category} teams`, 'Early adopters', 'SMBs'],
      keyMetrics: ['Activation rate', 'Weekly active usage', 'Net revenue retention'],
      channels: ['Content & SEO', 'Founder-led sales', 'Communities', 'Partnerships'],
      costStructure: ['Engineering', 'Hosting/infra', 'Go-to-market', 'Support'],
      revenueStreams: revenueModel.map((r) => r.name),
    },
    revenueModel,
    pricingTiers,
    goToMarket: [
      `Win a beachhead: ${idea.targetMarket || 'a specific niche'} first.`,
      'Found-led sales + content that ranks for the core pain.',
      'Build a referral/word-of-mouth loop into the product.',
      'Layer paid channels only after unit economics are proven.',
    ],
    personas,
    financialProjection,
  };
}

// --- Product plan -------------------------------------------------------------

export function generateProductPlan(idea: IdeaInput) {
  const rng = new Rng(idea.id + ':product');
  const kw = keywords(idea);

  const features = [
    { name: 'Onboarding & setup', description: 'Get a user to first value in under 5 minutes.', effort: 'M', impact: 'HIGH', mvp: true },
    { name: `Core ${kw[0] ?? 'workflow'} engine`, description: idea.solution.slice(0, 90), effort: 'L', impact: 'HIGH', mvp: true },
    { name: 'Dashboard & insights', description: 'See what matters at a glance.', effort: 'M', impact: 'HIGH', mvp: true },
    { name: 'Collaboration', description: 'Invite teammates, share, comment.', effort: 'M', impact: 'MEDIUM', mvp: false },
    { name: 'Integrations', description: 'Connect the tools customers already use.', effort: 'L', impact: 'MEDIUM', mvp: false },
    { name: 'Billing & plans', description: 'Self-serve upgrade and payment.', effort: 'S', impact: 'MEDIUM', mvp: true },
    { name: 'Admin & roles', description: 'Permissions for larger teams.', effort: 'M', impact: 'LOW', mvp: false },
  ] as const;

  const userStories = [
    { asA: 'new user', iWant: 'to set up in minutes', soThat: 'I see value before I lose interest', priority: 'MUST' },
    { asA: 'core user', iWant: `to ${kw[0] ?? 'do the main task'} effortlessly`, soThat: 'I solve my problem fast', priority: 'MUST' },
    { asA: 'returning user', iWant: 'a dashboard of my progress', soThat: 'I know it’s working', priority: 'SHOULD' },
    { asA: 'team lead', iWant: 'to invite teammates', soThat: 'we collaborate in one place', priority: 'COULD' },
  ] as const;

  return {
    prdSummary: `${idea.title} helps ${idea.targetMarket || 'its users'} by ${idea.solution.slice(0, 120)}. The MVP proves that users will adopt and pay for the core workflow.`,
    objectives: [
      'Reach first value in under 5 minutes',
      'Prove the core workflow with 50 active users',
      'Convert 5% of free users to paid within 30 days',
    ],
    features: features.map((f) => ({ ...f })),
    userStories: userStories.map((s) => ({ ...s })),
    roadmap: [
      { phase: 'MVP', timeframe: 'Weeks 1–6', goals: ['Core workflow', 'Onboarding', 'Billing'] },
      { phase: 'Beta', timeframe: 'Weeks 7–12', goals: ['Collaboration', 'Integrations', 'Analytics'] },
      { phase: 'GA', timeframe: 'Months 4–6', goals: ['Admin & roles', 'Scale infra', 'Public launch'] },
    ],
    techStack: [
      { layer: 'Frontend', choice: 'React + TypeScript + Vite + Tailwind', reason: 'Fast iteration and a great UX.' },
      { layer: 'Backend', choice: 'NestJS + Prisma', reason: 'Structured, typed, and scalable.' },
      { layer: 'Database', choice: 'PostgreSQL', reason: 'Reliable relational core with rich querying.' },
      { layer: 'Infra', choice: 'Docker + managed cloud', reason: 'Reproducible and easy to deploy.' },
      { layer: 'AI', choice: rng.pick(['OpenAI', 'Anthropic', 'Gemini']) + ' via abstraction', reason: 'Swappable provider behind one interface.' },
    ],
    mvpScope: features.filter((f) => f.mvp).map((f) => f.name),
  };
}

// --- Design brief -------------------------------------------------------------

export function generateDesignBrief(idea: IdeaInput) {
  const rng = new Rng(idea.id + ':design');

  const palettes = [
    [
      { name: 'Primary', value: '#4f46e5' },
      { name: 'Accent', value: '#06b6d4' },
      { name: 'Ink', value: '#0f172a' },
      { name: 'Surface', value: '#f8fafc' },
    ],
    [
      { name: 'Primary', value: '#7c3aed' },
      { name: 'Accent', value: '#ec4899' },
      { name: 'Ink', value: '#1e1b2e' },
      { name: 'Surface', value: '#faf5ff' },
    ],
    [
      { name: 'Primary', value: '#10b981' },
      { name: 'Accent', value: '#f59e0b' },
      { name: 'Ink', value: '#052e2b' },
      { name: 'Surface', value: '#f0fdf4' },
    ],
  ];

  const personalities = rng.sample(
    ['Bold', 'Trustworthy', 'Friendly', 'Premium', 'Minimal', 'Energetic', 'Calm', 'Innovative'],
    3,
  );

  return {
    brandPersonality: personalities,
    colorPalette: rng.pick(palettes),
    typography: {
      heading: rng.pick(['Clash Display', 'Satoshi', 'Sora', 'Space Grotesk']),
      body: rng.pick(['Inter', 'General Sans', 'IBM Plex Sans']),
    },
    uxPrinciples: [
      'Reduce time-to-first-value above all else',
      'One primary action per screen',
      'Show progress and feedback at every step',
      'Make the empty state teach the product',
    ],
    screens: [
      { name: 'Landing', purpose: 'Communicate the value and convert visitors.', sections: ['Hero', 'Social proof', 'How it works', 'Pricing', 'CTA'] },
      { name: 'Onboarding', purpose: 'Get the user to first value fast.', sections: ['Welcome', 'Quick setup', 'First action', 'Success'] },
      { name: 'Dashboard', purpose: 'Show the core value at a glance.', sections: ['Summary', 'Primary workflow', 'Insights', 'Next steps'] },
      { name: `Core ${idea.category} screen`, purpose: idea.solution.slice(0, 80), sections: ['Input', 'Result', 'Actions'] },
    ],
  };
}
