# Cadivity LMS

Production-focused LMS built with Next.js App Router, Prisma, and better-auth.

## Local Development

1. Copy `.env.example` to `.env` and fill required values.
2. Install dependencies: `pnpm install`
3. Start dev server: `pnpm dev`

## Quality Commands

- `pnpm typecheck` - TypeScript checks
- `pnpm lint` - lint checks
- `pnpm build` - production build
- `pnpm test:e2e` - Playwright tests
- `pnpm test:ci` - CI quality bundle

## Security and Launch Docs

- `docs/security/hardening-plan.md`
- `docs/database/migration-plan.md`
- `docs/monitoring/observability-plan.md`
- `docs/release/launch-checklist.md`
- `docs/release/solo-execution-schedule.md`
