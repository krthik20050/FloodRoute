<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## FloodRoute conventions

- Read docs/ARCHITECTURE.md and docs/SAFETY_AND_LIMITATIONS.md before changing routing or data presentation.
- The current provider is synthetic. Never label fixture observations, schematic edges or fictional facilities as verified/live/operational. Connectivity never establishes travel safety.
- Preserve server-side graph calculations, per-request closure isolation, coordinate order (latitude, longitude), provenance and failure states.
- Run typecheck, lint, unit/API tests and the relevant browser journey after meaningful changes. Use a separate production output directory while dev is running.
- Keep secrets out of source, fixtures, exports and logs. No privileged writes are currently exposed; the Supabase migration is a draft, not a connected database.
- Do not push or publish this project without direct user authorization. Current task delivery is localhost only.
