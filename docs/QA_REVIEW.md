# FloodRoute MVP QA review

Scope: synthetic Aluva network, public read/compute endpoints and local browser simulation. No live flood data or production deployment is claimed.

## Reviewed boundaries

- Analysis accepts only known node/road identifiers, bounded strings and at most 100 closure entries. Extra fields are rejected.
- Request bodies are capped at 8 KiB using actual streamed bytes, independent of the declared Content-Length.
- Closed roads are omitted from the graph. A disconnected destination returns a null route; no unsafe fallback is invented.
- Baseline comparison and facility reachability are recomputed from immutable fixtures for each caller.
- The API has no incident creation or update endpoint. Scenario saving is browser-local; exported JSON carries a simulation disclaimer.
- No provider credentials, database access or user identities are needed by the demo endpoints.

## Automated checks

`tests/api.test.ts` exercises malformed/missing input, unknown IDs, schema strictness, closure limits, byte limits, credential-free operation and caller isolation.

`e2e/workspace.spec.ts` exercises baseline → bridge detour → hospital cutoff → reset, native keyboard selection, a 390 px viewport, mobile provenance access and roving tab navigation, map road clicks through highlighted route overlays, layer toggles, blocked-tile fallback, local save/restore, exported simulation JSON, network retry, analysis loading/error/retry, and actual HTTP response codes for absent writes and unsupported methods.

Executed locally on 13 October 2026:

- API boundary suite: 14/14 passed under Vitest.
- Extended browser suite: 9/9 passed against the running Next.js development server using installed Google Chrome.
- The bridge scenario increased the fixture route from 4.6 to 12.4 scenario km; hospital cutoff produced no connected route; reset restored the baseline.
- The 390 × 844 viewport had no horizontal document overflow and native keyboard route selection worked.
- HTTP checks confirmed credential-free read/analysis, POST `/api/incidents` → 404, and GET `/api/analyze` → 405.
- Road SVG click closed the east bridge through the noninteractive highlighted route overlay; missing basemap tiles left analysis and network interactions operational.
- Saved compound closures survived reload. The exported JSON identified simulation mode, preserved all selected closures, returned a null isolated route and included the travel disclaimer.
- Loading disabled comparison/export; mocked network and analysis outages showed clear retry UI and recovered.
- Desktop (1440 × 1000) and mobile (390 × 844, full page) screenshots were captured and visually inspected: `screenshots/desktop-baseline.png` and `screenshots/mobile-hospital-cutoff.png`. Both show loaded map tiles, readable controls and the intended result/facility states.

These browser checks validate the local development build, not hosted production behavior. Playwright traces are retained on failures only.

Lead acceptance additionally reran the same 9-test browser suite against the finalized production build on localhost port 3001: 9/9 passed. Unit/API/provider suites ran on Vitest 5.0.4 after dependency remediation: 39/39 passed. Details and the remaining development-only upstream glob advisory are in VALIDATION.md. No public hosting is validated.

## Remaining limitations

- Network coordinates and edge weights are fictional. Connectivity does not imply safe passage.
- External map tiles require network access; analysis itself uses local fixture data.
- Public hosting, actual devices, real emergency reports, authenticated incident moderation and database persistence are outside this validated MVP.
