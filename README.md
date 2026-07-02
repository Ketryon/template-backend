# template-backend

Ketryon Express backend template. Production-ready with Clerk auth, Drizzle ORM, Redis caching, Zod validation, and rate limiting.

## Setup

```bash
pnpm install
cp .env.example .env
# Fill in your env vars
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run compiled server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Run migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Structure

```
src/
├── index.ts           # Entry point
├── middleware/         # Express middleware (rate limiting)
├── routes/            # Feature-based route files
├── services/          # Database, Redis, external APIs
├── types/             # Shared TypeScript types
└── utils/             # Response helpers, validation, sanitization
```

## Patterns

- **Auth**: Clerk JWT via `requireAuth()` + `getAuth(req)`
- **Validation**: Zod schemas with `validate()` middleware
- **Errors**: `asyncHandler` wraps all routes, `sendSuccess`/`sendError` for responses
- **Rate limiting**: Redis sliding window with `X-RateLimit-*` headers
- **Database**: Drizzle ORM with PostgreSQL
