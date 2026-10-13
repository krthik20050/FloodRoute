# GitHub Pages deployment

Public simulation website: https://krthik20050.github.io/FloodRoute/ . The source repository remains private; GitHub accepted Pages configuration for this repository.

GitHub Pages is static hosting and cannot run the Next.js POST routing API. A separate export build therefore executes the identical validated demo graph and algorithm inside a browser Web Worker. The worker is terminated on completion, cancellation or failure; input changes cancel outdated work. No network API, credentials or shared writes are required. The local Next.js application retains its original server API mode.

`scripts/build-pages.mjs` copies only app source/config into a checked staging directory, excludes API routes, links the existing installed dependency tree, and runs a webpack static export with `NEXT_PUBLIC_STATIC_DEMO=1` and `basePath=/FloodRoute`. It includes only illustrative fixtures and public assets. No env files, private documents, database credentials or live provider configuration are copied. `.pages-build/` is ignored by Git, lint, formatting and root type checking. The artifact contains `.nojekyll` and prefixed JS/CSS/worker asset paths.

Build and preview locally:

```powershell
npm run build:pages
npm run preview:pages
```

Preview URL: http://127.0.0.1:3002/FloodRoute/ . Browser verification:

```powershell
$env:PLAYWRIGHT_STATIC_DEMO='1'
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3002/FloodRoute/'
npm run test:e2e
```

The deployment workflow `.github/workflows/pages.yml` runs typecheck/lint/unit tests, builds the export, exercises static browser tests, uploads the Pages artifact, then deploys with scoped Pages and OIDC permissions. Main-branch pushes update the site automatically. No PAT or service secret is embedded or added.

The static demo preserves route selection, closure simulation, detours, disconnected facilities, map layers, data provenance, browser-local save/restore and JSON exports. It does not enable Supabase, official live feeds, authenticated writes or real emergency navigation. Future operational data processing requires an independently secured backend; never embed privileged credentials in the static build.

Local pre-publication acceptance: static export succeeded, 39 shared unit/API/provider tests passed, TypeScript and lint passed, and 3/3 static browser tests passed at the prefixed preview. Browser tests verify no server API calls, no uncaught page errors, no broken bundled assets, detours/cutoffs/reset, mobile tabs/selectors, saved scenarios and exports. The existing server journey also exercised successfully; one simultaneous-run artifact cleanup collision was fixed by separating static/server test output directories.
