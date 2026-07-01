# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Grupo Velmot** — digital motorcycle catalog for a Mexican import dealer. Customers browse inventory, view full motorcycle listings, and contact via WhatsApp or initiate an *apartado* (deposit-based reservation). This is a catalog + apartado system, not a full e-commerce cart.

Stack: Next.js 16.2.6 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Payload CMS (external, PostgreSQL on Railway), Conekta payment gateway.

**AGENTS.md note**: This Next.js version has breaking changes — read `node_modules/next/dist/docs/` before writing any code that relies on Next.js APIs.

## Commands

```bash
npm run dev        # start dev server (port 3000)
npm run build      # production build
npm run typecheck  # tsc --noEmit (no test runner installed — this is the primary correctness check)
npm run lint       # eslint
npm run format     # prettier --write on all .ts/.tsx files
```

There is no test runner. Validation is done manually per `specs/*/quickstart.md`.

## Environment Variables

Copy `.env.local.example` to `.env.local`. Required vars:

| Variable | Purpose |
|---|---|
| `PAYLOAD_CMS_URL` | URL of the Payload CMS instance (Railway) |
| `PAYLOAD_API_KEY` | API key for authenticated CMS write operations |
| `CONEKTA_API_KEY` | Conekta payment gateway key (use test key in dev) |
| `CONEKTA_WEBHOOK_SECRET` | HMAC secret for webhook signature verification |
| `NEXT_PUBLIC_APP_URL` | Full site URL — used to build Conekta redirect URLs |
| `REVALIDATE_SECRET` | Secret for on-demand ISR revalidation from Payload hooks |
| `USE_MOCK_DATA` | Set to `true` to run without a live CMS (uses `lib/payload/mocks.ts`) |

### Payload API key setup (required for write operations)

`PAYLOAD_API_KEY` must be a **user-scoped API key** from the live Payload instance, not an arbitrary string. The access control on `Apartados` (and other write-protected collections) uses `({ req }) => Boolean(req.user)`, which only passes when `req.user` is populated — and Payload only populates that for requests authenticated with a valid user API key.

**Setup checklist** (do this once on the live Payload instance on Railway):

1. Verify the `Users` collection in Payload has `useAPIKey: true` in its config. Without it, API key auth is silently ignored and every PATCH/DELETE returns 403.
2. In Payload admin → Users → find (or create) a service user (e.g. "Sistema").
3. On that user's document, generate an API key and copy it.
4. Set `PAYLOAD_API_KEY=<that key>` in Vercel environment variables.

**Symptom when misconfigured**: POST to `/api/apartados` succeeds (because `create: () => true` skips auth), but PATCH to `/api/apartados/:id` returns `403 You are not allowed to perform this action`. This causes `referenciaConekta` to never be saved and the apartado confirmation flow to rely solely on the webhook path.

## Architecture

### Data flow

All motorcycle data lives in Payload CMS and is fetched server-side via `lib/payload/client.ts` (`fetchFromCMS` / `mutateOnCMS`). There is **no direct database connection** in Next.js — everything goes through the Payload REST API.

Mock mode (`USE_MOCK_DATA=true`) bypasses all CMS calls and uses the static array in `lib/payload/mocks.ts`. Use this for UI development without a running CMS.

### Layer structure (no upward imports)

```
app/ (pages + route handlers)
  └─ components/ (UI)
       └─ lib/apartado/actions.ts (Server Actions)
            └─ lib/conekta/client.ts  +  lib/payload/apartados.ts
                 └─ lib/payload/client.ts (raw CMS fetch)
```

### Apartado flow

The reservation flow is the most complex path:

1. `app/apartar/[slug]/page.tsx` — renders `ApartarForm` with the `iniciarApartado` Server Action bound to it
2. `lib/apartado/actions.ts` → validates form → checks moto availability → creates `Apartado` record in CMS → calls Conekta to create a Hosted Checkout order → redirects customer to `checkoutUrl`
3. On return: `app/apartar/[slug]/exito/page.tsx` calls `confirmarApartado()` via the `apartado_id` query param
4. In parallel: `app/api/conekta/webhook/route.ts` receives `charge.paid` events, verifies HMAC signature, and calls `confirmarApartado()`
5. `lib/apartado/confirm.ts` is **idempotent** — safe to call from both the redirect and the webhook without double-processing

Race condition prevention is handled by a Payload `beforeChange` hook on the `Apartados` collection (`cms/collections/Apartados.ts`) that rejects if the moto is not `disponible` or if a `pendiente` apartado already exists for it.

### ISR revalidation

Payload CMS hooks call `GET /api/revalidate?secret=...&path=...` on the Next.js app (Railway → Vercel) after `Moto` state changes or `ConfiguracionApartado` changes. This keeps catalog pages fresh without a full deploy.

### CMS schema reference

The `cms/` directory contains Payload collection/global definitions used as **schema reference files** — they document the expected structure in Payload but the actual Payload instance runs separately on Railway. Registration of new collections must be done manually in the live Payload config.

## Specs

Feature specs live in `specs/NNN-feature-name/`:
- `spec.md` — requirements and user stories
- `plan.md` — architecture decisions, project structure, constitution check
- `data-model.md` — Payload schema definitions
- `tasks.md` — task checklist (check these before starting implementation)
- `quickstart.md` — manual validation scenarios

The current active feature is `specs/002-sistema-apartado/`. Check `tasks.md` for outstanding items before writing new code.

## Key constraints

- Spanish only (Mexico), MXN only
- Single-item flow — no cart, no multi-purchase
- No email/WhatsApp notifications (Phase 1 scope)
- WCAG 2.1 AA: minimum contrast 4.5:1 for text, 3:1 for interactive components, keyboard navigation, `prefers-reduced-motion` support
- LFPDPPP compliance: explicit privacy consent checkbox required in the apartado form
