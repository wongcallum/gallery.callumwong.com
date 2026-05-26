# AGENTS.md

## Overview
- Next.js 16 App Router project with tRPC + TanStack Query, Drizzle ORM (Postgres), Better Auth, and S3 storage.
- Primary server API lives under `src/server/api` and is exposed via `src/app/api/trpc/[trpc]/route.ts`.
- Database schema is defined in `src/server/db/schema.ts` and migrations in `drizzle/`.

## Essential commands (pnpm)
From `package.json` / README:
- `pnpm dev` — run Next.js dev server.
- `pnpm build` — build app.
- `pnpm start` — run production server.
- `pnpm preview` — build + start.
- `pnpm check` — Biome lint/format check.
- `pnpm check:write` / `pnpm check:unsafe` — auto-fix with Biome.
- `pnpm typecheck` — TypeScript typecheck.
- `pnpm db:push` / `pnpm db:migrate` / `pnpm db:generate` — Drizzle workflows.
- `pnpm db:studio` — Drizzle Studio.

Docker/dev DB (from `docker-compose.yml`):
- `docker compose up db -d` — run local Postgres on port 54322.

## Architecture & data flow
- **App Router**: entry in `src/app/layout.tsx`, providers include Theme, Nuqs, and `TRPCReactProvider`.
- **tRPC**:
  - Router root in `src/server/api/root.ts` registers feature routers.
  - Context in `src/server/api/trpc.ts` pulls session via Better Auth and exposes `db`.
  - HTTP handler in `src/app/api/trpc/[trpc]/route.ts` uses `fetchRequestHandler`.
  - RSC helpers in `src/trpc/server.ts`, client in `src/trpc/react.tsx`.
- **DB**:
  - Drizzle client in `src/server/db/index.ts` and schema in `src/server/db/schema.ts`.
  - Postgres driver uses `postgres` with `prepare: false`.
- **Auth**:
  - Better Auth config in `src/server/auth/index.ts` with GitHub provider and admin allowlist.
- **S3**:
  - S3 client in `src/lib/s3.ts` and uploads in `src/server/api/routers/photos.ts`.

## Conventions & patterns
- Path alias `~/*` maps to `src/*` (`tsconfig.json`).
- Use `protectedProcedure` / `publicProcedure` from `src/server/api/trpc.ts` for API endpoints.
- Ordering logic for collections uses `displayOrder` with `MAX_ORDER` and `computeNewOrder` (`src/lib/ordering.ts`).

## Testing & linting
- No dedicated test runner found; use `pnpm typecheck` and `pnpm check` for validation.

## Env & config gotchas
- Env validation is enforced via `src/env.js`. Set `SKIP_ENV_VALIDATION=1` to bypass (used in Docker builds).
- Better Auth restricts sign-in to emails in `ADMIN_EMAIL` (comma-separated string parsed to array).
- S3 URLs are constructed from `AWS_S3_REGION` and `AWS_S3_BUCKET_NAME` in `src/server/api/routers/photos.ts`.
- Biome excludes `src/components/ui/*.tsx` and `drizzle/` from formatting/linting (`biome.jsonc`).
