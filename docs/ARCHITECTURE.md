# Architecture

## Overview

Ideago is a **standalone full-stack project** with two deployable apps:

- `backend/` — NestJS **modular monolith** exposing a versioned REST API (`/api/v1`).
- `frontend/` — React SPA (Vite) organized in feature-sliced layers.
- Shared enums and DTO types live in `backend/src/shared/` and `frontend/src/shared/` (kept in sync manually).

## Backend

### Layering

```
HTTP → Controller → Service → Prisma (Repository) → PostgreSQL
                      │
                      └→ AiService (provider abstraction) / NotificationService
```

- **Controllers** are thin; they validate input (class-validator DTOs) and delegate to services.
- **Services** hold domain logic and own ownership/authorization checks.
- **PrismaService** is the data-access layer (repository role).
- Cross-cutting concerns are global: `JwtAuthGuard`, `RolesGuard`, `ThrottlerGuard`,
  `AllExceptionsFilter`, and `TransformInterceptor` (wraps every response in `{ success, data }`).

### Modules (domains)

| Module        | Responsibility |
| ------------- | -------------- |
| `auth`        | Register/login/refresh/logout, JWT issuance & rotation (argon2 hashing). |
| `user`        | Profile read/update. |
| `idea`        | Idea CRUD, ownership, detail (idea + blueprint). |
| `blueprint`   | Generates & persists validation, business model, product plan, design brief. |
| `copilot`     | Stage-aware AI chat per idea, persisted history. |
| `marketplace` | Expert profiles, browsing, hiring & hire-request lifecycle. |
| `workspace`   | Project, tasks (Kanban), milestones, documents — seeded from the product plan. |
| `notification`| In-app notifications (validation done, hire updates, …). |
| `admin`       | Platform analytics, user & idea management (RBAC: `ADMIN`). |

### The AI layer (`backend/src/ai`)

```
AiService
  ├─ resolveProvider()  → MockProvider | OpenAiProvider | AnthropicProvider | GeminiProvider
  └─ chat(messages)     → calls provider, falls back to MockProvider on failure

blueprint.generator.ts  → deterministic, seeded structured artifacts (offline, testable)
```

- `LlmProvider` is the single abstraction. Real providers call vendor APIs via `fetch` (no SDK
  lock-in). The `MockProvider` is fully offline and deterministic.
- The **conversational Copilot** uses the configured LLM provider.
- The **structured blueprint** (validation/business/product/design) is produced by a deterministic
  generator seeded by the idea id, guaranteeing stable, valid shapes regardless of provider.

### Auth & RBAC

- Stateless JWT access tokens + rotating refresh tokens (hashed, stored, revocable).
- Routes are protected by default (global `JwtAuthGuard`); `@Public()` opts out.
- `@Roles(Role.ADMIN)` + `RolesGuard` enforce role-based access.

## Database (Prisma / PostgreSQL)

Core entities:

```
User 1─* Idea 1─1 Validation
            │   1─1 BusinessModel
            │   1─1 ProductPlan
            │   1─1 DesignBrief
            │   1─* CopilotMessage
            │   1─1 Project 1─* Task / Milestone / Document / ProjectMember
User 1─1 ExpertProfile 1─* HireRequest *─1 Idea
User 1─* Notification
User 1─* RefreshToken
```

AI artifacts store their rich, nested content as JSON columns (flexible shape, validated DTOs at the
edges) while relational columns (score, stage, status) stay queryable.

## Frontend

Feature-sliced layers under `frontend/src`:

```
app/       # bootstrap, providers, router
pages/     # route screens (home, auth, dashboard, idea, marketplace, profile, admin)
widgets/   # composite UI (layouts, idea blueprint tabs)
features/  # use-cases with their own data hooks (blueprint, copilot, workspace, notification, admin, auth)
entities/  # domain models + data hooks (user, idea, expert)
shared/    # ui primitives, api client, lib, config
```

- **TanStack Query** owns server state (caching, invalidation).
- **Zustand** owns local/auth/theme state.
- A single Axios client wraps the `{ success, data }` envelope and auto-refreshes expired tokens.

## Request flow example — "Generate blueprint"

1. Web calls `POST /api/v1/ideas/:id/blueprint/generate-all`.
2. `BlueprintController` → `BlueprintService` verifies ownership via `IdeaService`.
3. The deterministic generator builds artifacts; Prisma upserts each; idea stage/score advance.
4. A `Notification` is created; the interceptor returns `{ success, data }`.
5. Web invalidates the `idea` query and re-renders the blueprint tabs.
