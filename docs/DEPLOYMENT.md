# Deployment

## Environments & configuration

All configuration is via environment variables (see `.env.example`). Required in production:

| Variable | Notes |
| -------- | ----- |
| `DATABASE_URL` | PostgreSQL connection string. |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Strong random secrets. |
| `CORS_ORIGIN` | Comma-separated allowed web origins. |
| `AI_PROVIDER` | `mock` (default), `openai`, `anthropic`, or `gemini`. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | Only if using a real provider. |
| `VITE_API_URL` | Public API URL (baked into the web build). |

## Option A — Docker Compose (single host)

```bash
cp .env.example .env          # edit secrets
docker compose up --build -d
```

Services: `postgres`, `redis`, `mailhog`, `backend` (:3000), `frontend` (:5173 dev).
The API container runs `prisma db push`, seeds, then starts in watch mode (development target).

For production images:

```bash
docker build -f frontend/Dockerfile --target production -t ideago-frontend ./frontend
docker build -f backend/Dockerfile --target production -t ideago-backend ./backend
```

## Option B — Managed platforms

### Database
Provision managed PostgreSQL (RDS, Cloud SQL, Neon, Supabase). Run migrations on deploy:

```bash
npm --prefix backend run prisma:deploy
```

### API (container)
Build the `production` target from `backend/`. It runs `prisma db push` then `node dist/main.js`.
Deploy to any container host (ECS, Cloud Run, Fly.io, Render, Railway). Expose port `3000`.
Set all required env vars; attach Postgres. Use `render.yaml` for Render.

### Web (static)
```bash
npm --prefix frontend run build      # outputs frontend/dist
```
Serve `frontend/dist` from any static host/CDN (Vercel, Netlify, Cloudflare Pages).
Set `VITE_API_URL` to your API URL at build time. Use `frontend/vercel.json` for SPA routing.

## Database lifecycle

- **Local / first run:** `npm run db:push` (fast, no migration files) or `npm run db:migrate`.
- **Production:** commit migrations and apply with `prisma migrate deploy`.
- **Seed:** `npm run db:seed` creates demo admin/founder/experts and a sample blueprint (idempotent).

## CI/CD

`.github/workflows/ci.yml` installs dependencies in `frontend/` and `backend/`, generates the Prisma client, then runs typecheck, test and build on every push/PR.

## Health & observability

- `GET /health` — liveness probe.
- Structured logging via `nestjs-pino` (pretty in dev, JSON in prod), with auth headers redacted.
- Global rate limiting via `@nestjs/throttler`; stricter limits on auth endpoints.

## Production checklist

- [ ] Rotate `JWT_*` secrets; never reuse dev defaults.
- [ ] Set `NODE_ENV=production` and a locked-down `CORS_ORIGIN`.
- [ ] Use managed Postgres with backups; run `prisma migrate deploy`.
- [ ] Configure a real SMTP host (replace Mailhog) and, optionally, a real AI provider key.
- [ ] Put the API behind HTTPS/Ingress; serve the web build via CDN.
