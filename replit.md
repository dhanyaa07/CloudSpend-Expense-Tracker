# CloudSpend

CloudSpend is a personal expense tracker that turns a simple ledger into clear spending and budget insight.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/cloudspend run dev` — run the CloudSpend web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/cloudspend/src/` — CloudSpend frontend routes, shell, dialogs, and styles
- `artifacts/api-server/src/routes/cloudspend.ts` — CloudSpend API routes and dashboard aggregates
- `lib/db/src/schema/cloudspend.ts` — PostgreSQL schema for users, budgets, and expenses
- `lib/api-spec/openapi.yaml` — source of truth for the generated API client and Zod contracts

## Architecture decisions

- CloudSpend uses the built-in PostgreSQL database so the app works immediately in Replit without requiring Firebase service-account setup.
- Username entry is intentionally lightweight for the requested no-password flow; all expense queries are scoped by the active username.
- The demo account is seeded server-side on first access and uses the same CRUD/API paths as a normal account.

## Product

Users can enter with a username or demo account, review totals and month-over-month change, inspect category and trend breakdowns, manage monthly and category budgets, receive smart budget alerts, export filtered expenses to CSV, and view personalized patterns, recommendations, anomalies, and forecasts.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
