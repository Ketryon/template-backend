# template-backend

Express 5 + TypeScript API template with Clerk auth, Drizzle ORM on PostgreSQL, Redis-backed rate limiting and caching, and Zod request validation. It ships one example CRUD resource that shows every pattern in use.

## What's included

- **Auth**: Clerk via `clerkMiddleware()`; protected routes use `requireAuth()` + `getAuth(req)`
- **Database**: Drizzle ORM with `postgres` driver; example `users` and `items` tables in `src/services/schema.ts`
- **Redis**: `ioredis` client with sliding-window rate limiting (`X-RateLimit-*` headers, 500 req/min on `/api`) and `cacheGet`/`cacheSet`/`cacheDelete` helpers
- **Validation**: Zod schemas with a `validate()` middleware, plus text and filename sanitizers
- **Responses/errors**: `asyncHandler`, `sendSuccess`, `sendError`
- **Routes**: `GET /health`, `GET /api` (API info), and authenticated `/api/example` (list, get, create, delete)

## Getting started

Requires Node.js, pnpm, a PostgreSQL database and a Redis instance.

```bash
pnpm install
cp .env.example .env   # fill in the values below
pnpm db:generate       # generate migrations from the schema
pnpm db:migrate        # apply them
pnpm dev               # http://localhost:3001
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `3001`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis URL (default `redis://localhost:6379`) |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CORS_ORIGINS` | Comma-separated allowed origins (default `http://localhost:3000`) |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload (`tsx watch`) |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm lint` | Run ESLint on `src/` (no ESLint config is included yet; add an `eslint.config.js` first) |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Structure

```
src/
├── index.ts        # Entry point: middleware, routes, error handling
├── middleware/     # Rate limiting
├── routes/         # health.ts, example.ts
├── services/       # Database, schema, Redis
├── types/          # Shared TypeScript types
└── utils/          # Response helpers, validation, sanitization
```

## Built by Ketryon

Built and used by [Ketryon](https://www.ketryon.com) — a developer on subscription for founders.

## License

MIT
