/* eslint-disable no-console */
import { PrismaClient, Role, ExpertCategory, IdeaStage, IdeaStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  generateValidation,
  generateBusinessModel,
  generateProductPlan,
  generateDesignBrief,
  IdeaInput,
} from '../src/ai/blueprint.generator';

const prisma = new PrismaClient();

const EXPERTS: {
  email: string;
  firstName: string;
  lastName: string;
  category: ExpertCategory;
  headline: string;
  bio: string;
  skills: string[];
  rate: number;
  rating: number;
  reviews: number;
  location: string;
}[] = [
  {
    email: 'dev.ava@ideago.com',
    firstName: 'Ava',
    lastName: 'Chen',
    category: ExpertCategory.DEVELOPER,
    headline: 'Full-stack engineer — React, NestJS, Postgres',
    bio: 'I ship production MVPs fast. 8 years building SaaS products end to end.',
    skills: ['React', 'TypeScript', 'NestJS', 'PostgreSQL', 'AWS'],
    rate: 85,
    rating: 4.9,
    reviews: 37,
    location: 'Remote',
  },
  {
    email: 'design.leo@ideago.com',
    firstName: 'Leo',
    lastName: 'Martins',
    category: ExpertCategory.DESIGNER,
    headline: 'Product designer crafting delightful, conversion-first UX',
    bio: 'I turn rough ideas into clean, usable products that users love.',
    skills: ['Figma', 'Design Systems', 'UX Research', 'Prototyping'],
    rate: 70,
    rating: 4.8,
    reviews: 29,
    location: 'Lisbon',
  },
  {
    email: 'pm.nadia@ideago.com',
    firstName: 'Nadia',
    lastName: 'Khan',
    category: ExpertCategory.PRODUCT_MANAGER,
    headline: 'Fractional PM — roadmaps, discovery, and shipping',
    bio: 'Ex-startup PM. I help founders find product-market fit faster.',
    skills: ['Roadmapping', 'Discovery', 'Analytics', 'Prioritization'],
    rate: 90,
    rating: 4.7,
    reviews: 22,
    location: 'Remote',
  },
  {
    email: 'growth.sam@ideago.com',
    firstName: 'Sam',
    lastName: 'Okoro',
    category: ExpertCategory.MARKETING,
    headline: 'Growth marketer — content, SEO, and paid that scales',
    bio: 'I build acquisition engines for early-stage startups.',
    skills: ['SEO', 'Content', 'Paid Ads', 'Lifecycle', 'Analytics'],
    rate: 65,
    rating: 4.6,
    reviews: 18,
    location: 'Berlin',
  },
  {
    email: 'ai.mira@ideago.com',
    firstName: 'Mira',
    lastName: 'Patel',
    category: ExpertCategory.AI_ENGINEER,
    headline: 'AI engineer — LLM apps, RAG, and evaluation',
    bio: 'I integrate AI into products in a way that actually works.',
    skills: ['LLMs', 'RAG', 'Python', 'Vector DBs', 'Evals'],
    rate: 110,
    rating: 5.0,
    reviews: 14,
    location: 'Remote',
  },
  {
    email: 'consult.theo@ideago.com',
    firstName: 'Theo',
    lastName: 'Nguyen',
    category: ExpertCategory.CONSULTANT,
    headline: 'Startup consultant — strategy, fundraising, GTM',
    bio: 'I help founders sharpen strategy and tell a fundable story.',
    skills: ['Strategy', 'Fundraising', 'Go-to-market', 'Pitch'],
    rate: 120,
    rating: 4.9,
    reviews: 26,
    location: 'Remote',
  },
];

async function persistBlueprint(idea: IdeaInput) {
  const v = generateValidation(idea);
  await prisma.validation.upsert({
    where: { ideaId: idea.id },
    update: {},
    create: {
      ideaId: idea.id,
      startupScore: v.startupScore,
      verdict: v.verdict,
      marketSummary: v.marketSummary,
      marketSizeUsd: BigInt(Math.round(v.marketSizeUsd)),
      targetSegments: v.targetSegments,
      competitors: v.competitors,
      swot: v.swot,
      risks: v.risks,
      recommendations: v.recommendations,
    },
  });

  const b = generateBusinessModel(idea);
  await prisma.businessModel.upsert({
    where: { ideaId: idea.id },
    update: {},
    create: { ideaId: idea.id, ...b },
  });

  const p = generateProductPlan(idea);
  await prisma.productPlan.upsert({
    where: { ideaId: idea.id },
    update: {},
    create: { ideaId: idea.id, ...p },
  });

  const d = generateDesignBrief(idea);
  await prisma.designBrief.upsert({
    where: { ideaId: idea.id },
    update: {},
    create: { ideaId: idea.id, ...d },
  });

  return v.startupScore;
}

async function main() {
  console.log('🌱 Seeding Ideago...');

  // 1) Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ideago.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      email: adminEmail,
      passwordHash: await argon2.hash(adminPassword),
      firstName: 'Ideago',
      lastName: 'Admin',
      role: Role.ADMIN,
      emailVerified: true,
      headline: 'Platform administrator',
    },
  });
  console.log(`  ✓ admin: ${adminEmail} / ${adminPassword}`);

  // 2) Demo founder
  const founderEmail = process.env.SEED_FOUNDER_EMAIL || 'founder@ideago.com';
  const founderPassword = process.env.SEED_FOUNDER_PASSWORD || 'Founder123!';
  const founder = await prisma.user.upsert({
    where: { email: founderEmail },
    update: {},
    create: {
      email: founderEmail,
      passwordHash: await argon2.hash(founderPassword),
      firstName: 'Jordan',
      lastName: 'Rivera',
      role: Role.FOUNDER,
      emailVerified: true,
      headline: 'Aspiring founder',
    },
  });
  console.log(`  ✓ founder: ${founderEmail} / ${founderPassword}`);

  // 3) Experts
  for (const e of EXPERTS) {
    const user = await prisma.user.upsert({
      where: { email: e.email },
      update: { role: Role.EXPERT },
      create: {
        email: e.email,
        passwordHash: await argon2.hash('Expert123!'),
        firstName: e.firstName,
        lastName: e.lastName,
        role: Role.EXPERT,
        emailVerified: true,
        headline: e.headline,
        bio: e.bio,
      },
    });
    await prisma.expertProfile.upsert({
      where: { userId: user.id },
      update: {
        category: e.category,
        headline: e.headline,
        bio: e.bio,
        skills: e.skills,
        hourlyRateUsd: e.rate,
        rating: e.rating,
        reviewsCount: e.reviews,
        location: e.location,
        available: true,
      },
      create: {
        userId: user.id,
        category: e.category,
        headline: e.headline,
        bio: e.bio,
        skills: e.skills,
        hourlyRateUsd: e.rate,
        rating: e.rating,
        reviewsCount: e.reviews,
        location: e.location,
        available: true,
      },
    });
  }
  console.log(`  ✓ ${EXPERTS.length} experts`);

  // 4) Demo idea with a full generated blueprint + workspace
  const existing = await prisma.idea.findFirst({
    where: { ownerId: founder.id, title: 'Snap — AI receipts for freelancers' },
  });

  if (!existing) {
    const idea = await prisma.idea.create({
      data: {
        ownerId: founder.id,
        title: 'Snap — AI receipts for freelancers',
        problem:
          'Freelancers and solo consultants waste hours every month tracking receipts and categorizing expenses for taxes. It is tedious, error-prone, and easy to fall behind.',
        solution:
          'A mobile-first app that scans receipts with the camera, auto-categorizes expenses using AI, and exports clean reports for tax time and invoicing.',
        targetMarket: 'Independent freelancers, contractors, and solo consultants',
        category: 'Fintech',
        stage: IdeaStage.DESIGN,
        status: IdeaStatus.VALIDATED,
      },
    });

    const score = await persistBlueprint({
      id: idea.id,
      title: idea.title,
      problem: idea.problem,
      solution: idea.solution,
      targetMarket: idea.targetMarket,
      category: idea.category,
    });
    await prisma.idea.update({ where: { id: idea.id }, data: { startupScore: score } });

    const project = await prisma.project.create({
      data: {
        ideaId: idea.id,
        name: idea.title,
        summary: idea.solution.slice(0, 200),
        members: { create: { userId: founder.id, role: 'OWNER' } },
        tasks: {
          create: [
            { title: 'Interview 10 freelancers', priority: 'HIGH', status: 'DONE' },
            { title: 'Build receipt-scan prototype', priority: 'HIGH', status: 'IN_PROGRESS' },
            { title: 'Set up billing with Stripe', priority: 'MEDIUM', status: 'TODO' },
            { title: 'Design onboarding flow', priority: 'MEDIUM', status: 'TODO' },
          ],
        },
        milestones: {
          create: [
            { title: 'MVP — Weeks 1–6', status: 'ACTIVE' },
            { title: 'Beta — Weeks 7–12', status: 'PLANNED' },
          ],
        },
        documents: {
          create: [
            { title: 'Product Requirements (PRD)', content: generateProductPlan({
              id: idea.id,
              title: idea.title,
              problem: idea.problem,
              solution: idea.solution,
              targetMarket: idea.targetMarket,
              category: idea.category,
            }).prdSummary },
          ],
        },
      },
    });

    // A sample idea still in early stage (no blueprint yet) to show the flow.
    await prisma.idea.create({
      data: {
        ownerId: founder.id,
        title: 'PlantPal — plant care reminders',
        problem: 'People kill their houseplants because they forget to water and feed them correctly.',
        solution: 'An app that identifies plants from a photo and sends tailored care reminders.',
        targetMarket: 'Urban millennials and new plant owners',
        category: 'Consumer',
        stage: IdeaStage.IDEA,
        status: IdeaStatus.SUBMITTED,
      },
    });

    console.log(`  ✓ demo idea + workspace (project ${project.id}, score ${score})`);
  } else {
    console.log('  ✓ demo idea already present — skipping');
  }

  console.log('✅ Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
