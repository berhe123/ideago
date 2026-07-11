import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Target,
  LineChart,
  FileText,
  Palette,
  Users,
  Rocket,
  Bot,
  CheckCircle2,
  Code2,
  TrendingUp,
} from 'lucide-react';
import { STAGE_LABEL, STAGE_ORDER, type IdeaStage } from '@/shared';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

const FEATURES = [
  { icon: Target, title: 'AI Validation', desc: 'Market opportunity, competitors, SWOT, risks and a startup score in seconds.' },
  { icon: LineChart, title: 'Business Model', desc: 'Lean canvas, revenue model, pricing tiers, personas and financial projections.' },
  { icon: FileText, title: 'Product Plan', desc: 'PRD, user stories, prioritized features, tech stack and an MVP roadmap.' },
  { icon: Palette, title: 'Design Studio', desc: 'Brand direction, color system, typography and wireframe blueprints.' },
  { icon: Users, title: 'Build Marketplace', desc: 'Hire vetted developers, designers, PMs, marketers and AI engineers.' },
  { icon: Bot, title: 'AI Startup Copilot', desc: 'A 24/7 advisor that guides you through every stage of the journey.' },
];

/** Homepage journey cards — outcome-led copy for each startup stage. */
const JOURNEY_STEPS: Record<
  IdeaStage,
  { icon: typeof Sparkles; tagline: string; desc: string; outcome: string }
> = {
  IDEA: {
    icon: Sparkles,
    tagline: 'Capture the spark',
    desc: 'Describe your problem, who you serve, and the change you want to make — in plain language, not pitch-deck jargon.',
    outcome: 'One clear idea brief',
  },
  VALIDATION: {
    icon: Target,
    tagline: 'Know before you build',
    desc: 'AI analyzes market size, competitors, SWOT, and risks — then scores your idea so you invest time where the opportunity is real.',
    outcome: 'Startup score + evidence',
  },
  PLANNING: {
    icon: LineChart,
    tagline: 'Strategy on paper',
    desc: 'Generate a lean canvas, revenue model, pricing tiers, customer personas, and financial projections — the backbone of every serious venture.',
    outcome: 'Investor-ready plan',
  },
  DESIGN: {
    icon: Palette,
    tagline: 'Make it feel real',
    desc: 'Get brand personality, color systems, typography, UX principles, and wireframe blueprints — ready for designers or developers.',
    outcome: 'Design system + wireframes',
  },
  MVP: {
    icon: Rocket,
    tagline: 'Ship the smallest proof',
    desc: 'Prioritize features, write user stories, pick a tech stack, and lock an MVP scope that tests your business — not your ego.',
    outcome: 'Focused build roadmap',
  },
  DEVELOPMENT: {
    icon: Code2,
    tagline: 'Build with the right people',
    desc: 'Hire vetted experts from the marketplace or run your project in a shared workspace with tasks, milestones, and docs.',
    outcome: 'Team + execution hub',
  },
  LAUNCH: {
    icon: Rocket,
    tagline: 'Go live with intent',
    desc: 'Follow a launch playbook: messaging, early-user outreach, feedback loops, and the metrics that tell you what’s working on day one.',
    outcome: 'Launch checklist',
  },
  GROWTH: {
    icon: TrendingUp,
    tagline: 'Scale what works',
    desc: 'Double down on traction with growth plays, hiring signals, and iteration loops — from first customers to a company built to last.',
    outcome: 'Growth & formation path',
  },
};

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="container relative py-16 sm:py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-accent" />
              Your entire startup team, on demand
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-7xl">
              Turn your <span className="gradient-text">idea</span> into a
              <br />
              real <span className="gradient-text">company</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              Ideago transforms a raw idea into a complete startup blueprint — validation, business
              model, product plan, design and an MVP roadmap — then connects you with the experts to
              build it. Powered by AI, guided like a founding team.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg">
                  Start building free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button size="lg" variant="outline">
                  Explore the marketplace
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card. Works instantly with built-in AI — bring your own key anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Journey */}
      <section id="how" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">The journey, end to end</h2>
          <p className="mt-3 text-muted-foreground">
            Eight stages. One guided path — from a rough thought to a company that grows.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGE_ORDER.map((stage, i) => {
            const step = JOURNEY_STEPS[stage];
            const Icon = step.icon;
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="card-hover flex h-full flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{STAGE_LABEL[stage]}</h3>
                  <p className="mt-1 text-sm font-medium text-accent">{step.tagline}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                  <p className="mt-4 border-t border-border pt-3 text-xs font-medium text-foreground/80">
                    <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5 text-accent" />
                    {step.outcome}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            One platform. <span className="gradient-text">Everything you need.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Stop juggling ten tools and a dozen freelancers. Ideago does the heavy lifting.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-white">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Blueprint highlight */}
      <section className="container py-20">
        <Card className="relative overflow-hidden p-6 sm:p-10 md:p-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                From idea to a full blueprint — in one click
              </h2>
              <p className="mt-4 text-muted-foreground">
                Describe your idea. Ideago instantly generates a complete, investor-ready startup
                blueprint you can refine, share and build from.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Market validation & startup score',
                  'Business model & financial projections',
                  'Product requirements & MVP roadmap',
                  'Design system & wireframe plan',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-accent" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="mt-8 inline-block">
                <Button size="lg">
                  Generate my blueprint <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Startup Score</span>
                <span className="font-display text-4xl font-bold gradient-text">82</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: 'Market opportunity', v: 78 },
                  { label: 'Differentiation', v: 71 },
                  { label: 'Execution readiness', v: 88 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{row.label}</span>
                      <span>{row.v}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full gradient-brand" style={{ width: `${row.v}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="container py-24 text-center">
        <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold md:text-5xl">
          Your idea deserves a <span className="gradient-text">real shot</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join founders turning ideas into companies with an AI team that never sleeps.
        </p>
        <Link to="/register" className="mt-8 inline-block">
          <Button size="lg">
            Start free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
