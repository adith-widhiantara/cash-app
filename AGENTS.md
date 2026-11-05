<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Running commands

This project runs entirely in Docker. There is no Node.js on the host.
Never run npm, npx, or node directly.

- Start:      docker compose up -d
- Stop:       docker compose down
- Logs:       docker compose logs -f app
- Any command: docker compose exec app <command>
- Install a package: docker compose exec app npm install <package>

After changing package.json, rebuild: docker compose build

## Project conventions

- Money is an integer of whole rupiah. 15000 means Rp 15.000.
  Float and Decimal are forbidden for money.
- All dates use the Asia/Jakarta timezone.
- UI text is Indonesian. Code, comments, and identifiers are English.
- Cache Components is deliberately disabled in next.config.ts.
  Do not re-enable it.
- DESIGN.md defines all UI direction. Read it before building a screen.

## Git workflow

Every task ends with a commit and a push. This is not optional and does not
need to be asked for.

- Stage with `git add -A`.
- Commit message: English, one line, `type(scope): summary` in the
  imperative mood. Types used here: feat, fix, chore, docs, refactor.
- Push with `git push`.
- Never run `git push --force`.
- If a push fails for any reason, stop and report the full error. Do not
  retry with different flags, another remote, or another protocol.

## This repository is public

Anything committed here is permanent and world-readable. Deleting a file in
a later commit does not remove it from history.

- Never commit `.env`, `pm/`, the contents of `data/` or `uploads/`, or any
  `.db` file.
- Secrets, API keys, and tokens live in `.env` only and are read through
  environment variables. Never write a key into a source file, a comment, a
  test, or a commit message.
- Test fixtures and sample data must be invented. Never commit a real
  transaction, a real account number, a real balance, or a real bank
  notification. Keep the sentence structure, replace the values.
- If a secret is ever committed, stop and report it. The key must be revoked
  and replaced. Deleting the file is not a fix.

## Project memory

`PROJECT_CONTEXT.md` in the repository root is the project's memory. Read it
at the start of every session. Update its Status table at the end of every
task, in the same commit as the work.
