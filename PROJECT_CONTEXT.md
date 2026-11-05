# Project Context

Household finance tracker for two people. Mobile-first PWA, Indonesian UI.
Read this file first in every new session, together with AGENTS.md and
DESIGN.md.

## Environment

| | Development | Production |
|---|---|---|
| Machine | Linux (Ubuntu) | Mac mini, running 24/7 |
| Architecture | amd64 | likely arm64 (Apple Silicon) |
| Role | all coding and testing | the live app for the household |
| Status | in use | not set up yet, see TASK-04 |

Everything runs inside Docker. There is no Node.js on the host. Every tool
command goes through `docker compose exec app`.

The container runs as the host user, using UID and GID from `.env`. On
Linux this prevents container-created files from being owned by root.
`.env` is not in git, so every machine needs its own.

macOS differs and the development setup will not transfer unchanged:
Docker Desktop virtualises bind mounts and already maps ownership, and a
typical macOS GID of 20 collides with the existing `dialout` group inside
a Linux container. Production needs its own compose stage. Do not reuse the
development one.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, Prisma, SQLite.

SQLite lives at `./data/dev.db`, one file. Moving to PostgreSQL later is a
config change, not a rewrite.

`cacheComponents` and `partialPrefetching` are explicitly set to `false` in
`next.config.ts`. Next.js 16 enables them by default, which makes `new
Date()` in a Server Component fail with a prerender error and requires
Suspense boundaries around dynamic components. This app is full of dates.
Leaving these flags visible in the config is deliberate, so it reads as a
decision rather than an oversight. Do not enable them without a strong
reason.

## Conventions

- Money is an integer in full rupiah. Rp 15.000 is `15000`. Float and
  Decimal are forbidden.
- Timezone is Asia/Jakarta, in the app and in the container.
- Balance is never stored. It is always recomputed from
  `initialBalance + sum of transactions`, because backdated entry is
  allowed.
- UI text is Indonesian. Code, comments, identifiers, and commit messages
  are English.
- Auth is email and password, JWT in an httpOnly cookie.
- External API access uses a DeviceToken, never a user password.
- Transfers never count as income or expense. One transfer is one record.
- An ATM withdrawal is a transfer from a bank account to Cash, not an
  expense.
- The AI returns a category name taken exactly from the supplied list, or
  null. An invented name is rejected and forced to null, which sends the
  item to the Inbox.

## Shared code

| File | Holds |
|---|---|
| `src/lib/constants.ts` | categories, account types, transaction types and sources, thresholds |
| `src/lib/money.ts` | `formatRupiah`, `formatSignedRupiah`, `parseAmount`, `computeBalance` |

Known gaps in `parseAmount`, deliberately left for the parser work in
phase 4, where a 50+ case test suite will cover them:

- `"1.5jt"` reads as `1`, because a dot is only treated as a thousands
  separator when three digits follow.
- A date appearing before the amount can be read as the amount.

## Status

| Task | Content | Status |
|---|---|---|
| TASK-00 | Next.js scaffold | done |
| TASK-01 | Docker dev environment, AGENTS.md, cache flags off | done |
| TASK-01b | container runs as the host user | done |
| TASK-01c | `.next` volume ownership fix | done |
| TASK-02a | `constants.ts`, `money.ts`, `tsx` | done |
| TASK-02b | first commit and push, ignore rules | done |
| TASK-02c | git history audit, clean | done |
| TASK-02d | this file | in progress |
| TASK-03 | Prisma schema, migration, seed | next |
| TASK-04 | production stage for the Mac mini | not started |

Placeholder pages were dropped from TASK-02 on purpose. They prove nothing
and would be deleted again in phase 3.

## Open risks

- The Mac mini is a different CPU architecture. `package-lock.json` was
  generated on amd64. Native binaries for Next.js and Tailwind v4 differ per
  architecture. Prove the production build on the real machine in TASK-04.
- There is no backup for `data/` yet. A single machine holding the only copy
  of the household's financial records is not acceptable for long.
- The e-wallet providers used here have no public API. Notification text is
  the only automatic source, so the quality of the parser is the quality of
  the feature.

## Updating this file

Update the Status table at the end of every task, in the same commit as the
work it describes.
