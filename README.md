# Ideago — Turn ideas into companies

Ideago is an **AI-powered startup creation platform**. A founder submits a raw idea and Ideago
generates a complete, structured **startup blueprint** — market validation, business model, product
plan and design brief — then guides them through building it with an **AI Copilot**, a
**collaboration workspace**, and a **marketplace** of vetted experts.

It feels like having an entire startup team on demand.

```
Idea → Validation → Planning → Design → MVP → Development → Launch → Growth → Company
```

## ✨ Highlights

- **AI Validation** — startup score, market sizing, competitors, SWOT, risks & recommendations.
- **Business Model** — lean canvas, revenue model, pricing tiers, personas, 3-year projections.
- **Product Plan** — PRD, user stories, prioritized features, tech stack & MVP roadmap.
- **Design Studio** — brand direction, color system, typography & wireframe blueprints.
- **AI Startup Copilot** — a stage-aware chat advisor for every step of the journey.
- **Build Marketplace** — hire developers, designers, PMs, marketers, AI engineers & consultants.
- **Collaboration Workspace** — Kanban tasks, milestones and documents, seeded from the product plan.
- **Admin** — analytics dashboard, user & idea management with RBAC.

## 🧠 The AI layer (works with zero keys)

The AI is built behind a provider abstraction (`backend/src/ai`). By default it uses a
**deterministic offline "mock" provider**, so the whole platform runs instantly with **no API key**.
Set `AI_PROVIDER` to `openai`, `anthropic` or `gemini` (and the matching key) to use a real LLM —
the app transparently falls back to the offline provider if a call fails.

Structured blueprint artifacts are produced by a deterministic, seeded generator so results are
stable, testable and never break a demo.

## 🏗️ Tech stack

| Layer       | Tech                                                                 |
| ----------- | -------------------------------------------------------------------- |
| Frontend    | React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand       |
| Backend     | NestJS, TypeScript, Prisma, PostgreSQL, JWT, RBAC, Swagger           |
| Architecture| Modular monolith (API) · feature-sliced structure (web) · standalone apps |

## 📁 Project layout

```
ideago/
├── frontend/       # React + Vite SPA (app / pages / widgets / features / entities / shared)
├── backend/        # NestJS modular monolith
│   └── src/
│       ├── ai/         # provider abstraction + blueprint generator
│       ├── common/     # guards, filters, interceptors, decorators
│       ├── config/     # env config & validation
│       ├── infra/      # prisma, mailer
│       ├── shared/     # shared enums + DTO types (frontend has its own copy)
│       └── modules/    # auth, user, idea, blueprint, copilot,
│                       # marketplace, workspace, notification, admin
└── docker-compose.yml
```

## 🚀 Quick start

### Prerequisites
- Node.js ≥ 20, Docker (for Postgres) — or a local PostgreSQL.

### 1. Install & configure
```bash
npm --prefix backend install
npm --prefix frontend install
cp .env.example .env
```

### 2. Start infrastructure (Postgres, Redis, Mailhog)
```bash
docker compose up -d postgres redis mailhog
```

### 3. Set up the database
```bash
npm run db:generate     # generate Prisma client
npm run db:push         # create schema (or: npm run db:migrate)
npm run db:seed         # demo admin, founder, experts & a sample blueprint
```

### 4. Run the apps
```bash
# Terminal 1 — API
npm run dev:backend

# Terminal 2 — Web
npm run dev:frontend
```

Or use the helper script:
```powershell
.\start-dev.ps1
```

- Frontend app → http://localhost:5181
- API docs (Swagger) → http://localhost:3003/docs
- Mailhog inbox → http://localhost:8026

### Run everything in Docker
```bash
docker compose up --build
```

## 🔑 Demo accounts (after seeding)

| Role    | Email               | Password     |
| ------- | ------------------- | ------------ |
| Admin   | admin@ideago.com    | Admin123!    |
| Founder | founder@ideago.com  | Founder123!  |
| Experts | dev.ava@ideago.com … | Expert123!  |

## 🧪 Testing

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix backend run typecheck
npm --prefix frontend run typecheck
npm run build:backend
npm run build:frontend
```

## 📚 More docs

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)

---

Built as a production-grade reference platform. See `docs/` for design details.
