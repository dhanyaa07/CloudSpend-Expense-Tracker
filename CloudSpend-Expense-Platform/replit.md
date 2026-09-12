# CloudSpend Expense Platform

CloudSpend is a private personal finance workspace that turns a simple ledger into clear spending, budget, alert, report, and Copilot insight.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/cloudspend run dev` — run the CloudSpend web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, Clerk variables provisioned by the Replit Auth pane. `OPENAI_API_KEY` is optional and enables model-backed Copilot responses.

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
- Clerk is the source of truth for sign-in and session identity. The existing username field is retained as the stable Clerk user ID so the generated API contracts remain compatible.
- Every CloudSpend route is protected server-side and rejects a request whose path identity does not match the Clerk session.
- Replit AI Integrations was unavailable because the account upgrade was declined. Copilot uses the user's optional `OPENAI_API_KEY` when present and falls back to deterministic, ledger-grounded responses when the provider is unavailable.

## Product

Users sign in with Clerk, review totals and month-over-month change, inspect category and trend breakdowns, manage monthly and category budgets, configure threshold-based email/SMS alert preferences, export report data as CSV or JSON, ask Copilot about their ledger, and view personalized patterns, recommendations, anomalies, and forecasts.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
