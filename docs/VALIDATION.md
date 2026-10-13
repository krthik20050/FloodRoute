# Local acceptance evidence

13 October 2026, Windows / Node 22.21.1. No GitHub push, remote deployment or cloud credentials used.

## Completed checks

- `npm run typecheck`: Next route type generation and strict TypeScript passed.
- `npm run lint`: passed without source errors or warnings. Generated build output is excluded.
- `npm test`: 39/39 tests passed using Vitest 5.0.4, across graph, API and provider suites.
- Production build: passed with `FLOODROUTE_BUILD_DIR=.next-production` to isolate it from the running developer workspace.
- Independent browser QA: 9/9 passed against the development app using installed Chrome; 390×844 keyboard/layout checks, baseline/detour/isolation/reset, map clicks, tab navigation, map tiles unavailable, saved closures/export, network and analysis failure recovery.
- Production browser verification: the same 9/9 tests passed against `next start` on localhost port 3001 in 11.3 seconds, after the final source and module configuration changes. Port 3000 remains the development demo. This verifies local production mode, not external hosting.
- Fixture importer: validated export and import successfully; attempted `../outside-floodroute.json` rejected before writing. The importer does not update a database or activate new fixtures in the running app.
- Runtime dependency audit: `npm audit --omit=dev` reported zero known vulnerabilities. This is advisory-database evidence, not proof of complete application security.

Baseline example: Aluva → demo hospital uses the east bridge and hospital access, 4.6 illustrative scenario km. Closing the east bridge uses the western/northern detour, 12.4 scenario km. Closing hospital access produces no route and removes hospital reachability. Hospital + shelter closures create three components; closing village access disconnects the riverbank settlement. Same-node route is zero; reverse routes orient geometry correctly.

Provider validation rejects duplicate IDs, missing endpoints, parallel/self-loop roads, coordinate/geometry errors, nonfinite or negative weights, malformed or missing timestamps, and unknown incident-road references. Timestamps are never refreshed to make a fixture look live. Provider failure returns sanitized 503; oversized/malformed/unknown requests fail at the API boundary. Nonexistent incident-write API returns 404, unsupported analysis GET returns 405.

## Dependency limitation

The test runner was upgraded after the initial full audit identified patched worker/mock-server advisories. The final full development audit still reports five high findings in the ESLint dependency chain rooted in `braces`. Its [upstream advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) reports no patched version for deeply nested attacker-controlled glob patterns. These packages are development-only, and this app does not pass web input to glob matching. We retain the compatible Next lint configuration rather than downgrade the framework lint rules to an incompatible version. Do not expose lint tooling as a public service or run it on untrusted glob patterns; recheck upstream fixes before future releases.

## Not verified

- Draft Supabase migration execution, actual RLS/privilege behavior, database writes or authentication: no database/account configured.
- Official/live road closures, road geometry, operational facilities, flood extents or real emergency routing: no verified live providers are connected.
- Real routing-provider timeout behavior: no external route service is implemented. The current local calculation and frontend failure/retry behavior are tested.
- Real phones, screen readers, target mobile network performance, Lighthouse/CWV or public hosted CI: browser emulation/local checks only.
- Population exposure, vehicle passability, flood prediction or evacuation recommendations: deliberately not implemented.

Screenshots: `docs/screenshots/desktop-baseline.png`, `docs/screenshots/mobile-hospital-cutoff.png`. Setup and demonstration steps are in the root README; detailed independent findings are in QA_REVIEW.md.
