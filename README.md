# FloodRoute

Hosted simulation: [GitHub Pages](https://krthik20050.github.io/FloodRoute/). The static hosting build uses the same graph algorithm in a browser worker; the local app retains server APIs. See [Pages setup](docs/GITHUB_PAGES.md).

A local-first community accessibility lab for Kerala. A working map workspace demonstrates how hypothetical road and bridge closures change routes and access to configured hospitals, shelters and relief points.

**Simulation prototype only.** All road geometry, facilities and incident fixtures are illustrative. No live flood data or operational destination list is connected. A path is graph connectivity, not verified travel safety. Follow current official instructions.

## Run

Requires Node.js 22 and npm.

```powershell
cd 'D:\projects codes\Blind_Date'
npm ci
npm run dev
```

Open http://127.0.0.1:3000. If occupied: `npm run dev -- --port 3001`.

No credentials or paid services are needed. `.env.example` contains placeholders reserved for a future Supabase adapter; filling them currently does not activate persistence. OSM basemap tiles and optional Google Fonts use the internet; failure does not disable the graph calculation. System fonts serve as fallback. Toggle the basemap off to view only the network.

Validated demo fixture export/import: `npm run import:demo -- --export docs/new-scenario.json`, then `npm run import:demo -- docs/new-scenario.json data/new-scenario.json`. Output must be a new JSON file inside this workspace. The importer validates the graph but does not replace the running fixture; see `src/server/SCHEMA.md` for the trusted-data procedure.

## Demonstrate in two minutes

1. Default Aluva origin to demo district hospital: connected baseline, 4.6 illustrative scenario km; all three essential facilities reachable.
2. Open **Simulate**, choose **Bridge closure**. Return to **Plan a route**: an alternative path through the northern bypass, 12.4 illustrative scenario km.
3. Choose **Hospital cutoff**: no connected hospital route; hospital loses access while shelter and relief depot remain reachable.
4. Choose **Compound flooding**: hospital and shelter access are lost. Reset to restore the baseline.
5. Expand **All network connections** to try any combination, or click scenario roads on the map. Select a facility to make it the destination.
6. Inspect **Data & sources**, toggle map layers, save closures in this browser or export a JSON scenario for review.

Changing the origin recomputes all essential-facility reachability relative to that origin. Component counts include every disconnected graph area. No population values, predicted flood severity or travel times are fabricated.

## Checks

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright uses installed Chromium by default. To use system Chrome set `PLAYWRIGHT_CHANNEL=chrome` in the shell. Tests use port 3000; stop unrelated services there or adjust the config. A local checks workflow is included; it has not been pushed or run on hosted CI. See `docs/QA_REVIEW.md` and `docs/VALIDATION.md` for actual results.

Production local server: `npm run build`, then `npm start`. Do not run production build concurrently with development if both share `.next`; stop dev first, or set `FLOODROUTE_BUILD_DIR=.next-production` for isolated build/start output.

## Structure

- `src/components/`: responsive workspace, client-only Leaflet map and tool panels.
- `src/lib/`: typed graph contract and synthetic fixtures.
- `src/features/`: cancellable API requests and browser-local scenario state.
- `src/server/`: deterministic routing/accessibility and provider boundary.
- `src/app/api/`: read-only network and bounded/validated analysis endpoints.
- `tests/`, `e2e/`: graph, API and browser regression tests.
- `supabase/migrations/`: draft schema with client access denied, not applied.
- `docs/`: research, product, architecture, licenses, safety and validation.

## Data and persistence

Scenario storage is browser-local. There is no shared incident creation endpoint, auth or server persistence. Supabase/PostGIS schema is a reviewed starting point only; apply it to an authorized disposable database and test privileges before building any authenticated writer. Real source integration requires verified license, access contract, provenance, latency and outage behavior. Official KSDMA, IMD and CWC links are references, not ingested feeds.

## Important limitations

The small bidirectional graph excludes road directions, turn restrictions, elevation, bridge clearances and flood depth. Straight connection geometry does not follow actual roads. Scenario weights are illustrative, not measured distance. Reachable does not imply safe, open, staffed or operational. Flood shading has no automatic effect on routing. See `docs/SAFETY_AND_LIMITATIONS.md` for assumptions and failure modes.

Next: import a licensed real road graph and validate topology; obtain trusted incident/facility data with freshness and verification; configure and test authenticated persistence with moderation. These are prerequisites to evaluating real-world decision support.
