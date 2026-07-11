import { ChatMessage, ChatOptions, LlmProvider } from './provider.interface';

/**
 * Deterministic, offline "AI" used by default. It produces genuinely helpful,
 * context-aware startup-coach responses without any external API or key, so the
 * platform is fully runnable out of the box and great for demos & tests.
 */
export class MockProvider implements LlmProvider {
  readonly name = 'mock';
  readonly offline = true;

  async chat(messages: ChatMessage[], _opts?: ChatOptions): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const question = (lastUser?.content ?? '').trim();
    const stageMatch = system.match(/stage:\s*([A-Z]+)/i);
    const stage = stageMatch ? stageMatch[1].toUpperCase() : 'IDEA';

    return this.compose(question, stage);
  }

  private compose(question: string, stage: string): string {
    const topic = this.topicFor(question);
    const stageAdvice = STAGE_PLAYBOOK[stage] ?? STAGE_PLAYBOOK.IDEA;

    const intro = topic
      ? `Great question about ${topic}. Here's how I'd approach it as your startup copilot:`
      : `Here's my take as your startup copilot:`;

    const bullets = this.bulletsFor(topic, stageAdvice);

    return [
      intro,
      '',
      ...bullets.map((b, i) => `${i + 1}. ${b}`),
      '',
      `Since you're in the **${stage}** stage, your single most important next move is: ${stageAdvice.nextMove}`,
      '',
      `Want me to draft this for you? I can generate a ${stageAdvice.artifact} from your idea in one click.`,
    ].join('\n');
  }

  private topicFor(q: string): string | null {
    const lower = q.toLowerCase();
    for (const [needle, label] of Object.entries(TOPIC_MAP)) {
      if (lower.includes(needle)) return label;
    }
    return null;
  }

  private bulletsFor(topic: string | null, stageAdvice: StagePlay): string[] {
    if (topic && TOPIC_TIPS[topic]) return TOPIC_TIPS[topic];
    return stageAdvice.tips;
  }
}

interface StagePlay {
  nextMove: string;
  artifact: string;
  tips: string[];
}

const STAGE_PLAYBOOK: Record<string, StagePlay> = {
  IDEA: {
    nextMove: 'talk to 5 potential customers this week and write down the exact words they use.',
    artifact: 'validation report',
    tips: [
      'Sharpen the problem statement — who hurts, how often, and how much it costs them today.',
      'Describe the smallest version of your solution that still removes that pain.',
      'Identify the riskiest assumption and design a cheap test for it.',
    ],
  },
  VALIDATION: {
    nextMove: 'quantify demand — run a landing page or pre-sale and measure conversion.',
    artifact: 'business model canvas',
    tips: [
      'Validate willingness-to-pay, not just interest. Interest is cheap; commitment is signal.',
      'Map 3 real competitors and articulate why a customer switches to you.',
      'Define one north-star metric you will move in the next 90 days.',
    ],
  },
  PLANNING: {
    nextMove: 'cut your feature list to the 3 things that prove the core value.',
    artifact: 'product requirements doc',
    tips: [
      'Write user stories as "As a ___ I want ___ so that ___" to keep scope honest.',
      'Prioritize with effort vs. impact — ship the high-impact / low-effort items first.',
      'Pick a tech stack you can move fast in, not the one that looks best on paper.',
    ],
  },
  DESIGN: {
    nextMove: 'prototype the single most important screen and test it with 3 users.',
    artifact: 'design brief',
    tips: [
      'Design the happy path first; edge cases come after the core flow feels effortless.',
      'Use a consistent design system from day one to move faster later.',
      'Reduce steps to first value — every extra click costs activation.',
    ],
  },
  MVP: {
    nextMove: 'set a hard launch date 4–6 weeks out and scope ruthlessly to hit it.',
    artifact: 'MVP roadmap',
    tips: [
      'An MVP is an experiment, not a tiny product. Decide what it must prove.',
      'Instrument analytics before launch so you learn from day one.',
      'Manual is fine early — automate only what hurts repeatedly.',
    ],
  },
  DEVELOPMENT: {
    nextMove: 'ship to a small group of real users and watch them use it live.',
    artifact: 'sprint plan',
    tips: [
      'Release in thin vertical slices so you always have something demoable.',
      'Protect a feedback loop: build → measure → learn every week.',
      'Track activation and retention before you worry about acquisition.',
    ],
  },
  LAUNCH: {
    nextMove: 'pick one launch channel and go deep instead of spreading thin.',
    artifact: 'go-to-market plan',
    tips: [
      'Have a clear positioning statement: for whom, the category, and the key benefit.',
      'Line up assets (demo, screenshots, story) before launch day.',
      'Define what a successful launch looks like in numbers, not vibes.',
    ],
  },
  GROWTH: {
    nextMove: 'double down on the one channel with the best CAC-to-LTV ratio.',
    artifact: 'growth model',
    tips: [
      'Find your growth loop — how does usage create more usage?',
      'Improve retention before pouring fuel on acquisition.',
      'Instrument the funnel and remove the biggest drop-off first.',
    ],
  },
};

const TOPIC_MAP: Record<string, string> = {
  pric: 'pricing',
  competitor: 'competition',
  market: 'market sizing',
  fund: 'fundraising',
  invest: 'fundraising',
  validate: 'validation',
  mvp: 'building an MVP',
  tech: 'tech stack',
  stack: 'tech stack',
  marketing: 'marketing',
  growth: 'growth',
  customer: 'customer discovery',
  hire: 'hiring',
  team: 'hiring',
  revenue: 'revenue model',
  monetiz: 'revenue model',
};

const TOPIC_TIPS: Record<string, string[]> = {
  pricing: [
    'Anchor price to value delivered, not your costs.',
    'Offer 3 tiers — most people pick the middle, which raises your average revenue.',
    'Test price with real prospects; never guess it in a spreadsheet alone.',
  ],
  competition: [
    'List direct and indirect competitors, including "do nothing".',
    'Find the wedge — one segment you can win decisively first.',
    'Compete on a dimension incumbents structurally cannot copy.',
  ],
  'market sizing': [
    'Build TAM/SAM/SOM bottom-up: customers × price × frequency.',
    'A credible SOM (what you can realistically capture) matters more than a huge TAM.',
    'Tie market size to a specific beachhead segment you can reach.',
  ],
  fundraising: [
    'Raise to hit a specific milestone, not just "to grow".',
    'Traction de-risks the story more than any deck slide.',
    'Know your numbers cold: burn, runway, CAC, LTV, growth rate.',
  ],
  'revenue model': [
    'Match the model to buying behavior (subscription, usage, marketplace fee, etc.).',
    'Recurring revenue compounds — prefer it where it fits.',
    'Model unit economics early so growth doesn’t bury you in losses.',
  ],
  'tech stack': [
    'Optimize for iteration speed and hiring, not novelty.',
    'A boring, well-supported stack ships faster than a trendy one.',
    'Defer scaling decisions until you have load worth scaling for.',
  ],
};
