# FloodRoute MVP architecture

## Decision

Next.js App Router + strict TypeScript, React, direct Leaflet, server-side Graphology Dijkstra and Zod. A synthetic fixture adapter supplies the initial network. Supabase/PostGIS has a draft migration but is **not connected**. No authentication or public incident writes are exposed.

Initial research (docs/RESEARCH.md) found hazard/reference information but no verified authoritative live road-closure API. Thus the first acceptance target is reproducible community-access simulation, not emergency navigation.

| Choice | Why selected | Deferred alternative |
|---|---|---|
| Next.js | Requested preference; one app with server route handlers and React UI | Vite would require a separate server; unnecessary here |
| Leaflet | Small 2D fixture, mature BSD package, accessible DOM controls, no WebGL requirement | MapLibre for large vector networks |
| CSS tokens + native controls + Lucide | Fast coherent map workspace, native keyboard selects and checkboxes, no extra component framework | Tailwind/shadcn when component surface expands |
| Graphology weighted Dijkstra | Maintained package, deterministic undirected connectivity, Node-compatible | Self-hosted OSRM/Valhalla + imported OSM graph for actual road routing |
| Fixture provider | No credentials or paid service needed, repeatable offline calculations | Supabase/PostGIS for trusted incident and facility records |
| Vitest + Playwright + ESLint | Domain/API invariants, actual main journey and strict code checks | Hosted CI execution deferred; local workflow file included |

## Boundaries

Browser -> GET /api/network (dataset/provenance) and POST /api/analyze (validated IDs/closures) -> server provider -> Graphology. UI receives baseline/current path, reachable facilities, settlement connectivity and network components. Routing computation never runs in the map component. Each request constructs independent graphs; users do not modify a shared network.

All coordinate tuples are [latitude, longitude] for Leaflet. Geometry is synthetic and schematic. Edge weights are illustrative scenario km, not surveyed distance. No time estimates, flood-prediction score, population totals or destination-operation claim.

Closure simulation removes an entire undirected edge. Dijkstra optimizes only the declared fixture weights. Components use graph traversal; facilities are reachable from the selected origin, not asserted reachable from every settlement. No path returns null. Origin equals destination returns a zero-weight path. No map/report API or arbitrary external URLs can mutate the graph.

## Provider evolution

`src/server/data-provider.ts` isolates validated fixture ingestion and provenance. Future provider implementations must carry origin, timestamps, verification and outage state; they must not silently relabel fixtures as live. A real routing adapter must enforce closures in the route search itself; rejecting an OSRM route after calculation is not a complete alternative-route method.

The MVP has no external routing request or live ingestion service, so provider timeout and retry integration tests are inapplicable to current server calculations. The frontend applies 10-second network request timeouts, cancellation and retry. Map tile failure leaves the interactive graph visible. Scenario closures can be saved in browser localStorage (validated against current edge IDs on restore), and exported as JSON. This is browser-local persistence, not a shared incident database.

## Security

Zod strict input, valid fixture IDs, bounded array and 8192-byte request limit. Stateless read/compute endpoints only. No account, service-role key, dynamic SQL, arbitrary outbound URL or privileged write endpoint. Draft migration revokes all anonymous and authenticated access pending a reviewed authorization scheme. This protects data by denying access but does not implement incident administration. Rate limits and trusted operational user roles remain production work.

## Design and performance assumptions

Primary demo: laptop on ordinary Wi-Fi, with responsive 390px phone layout; future low-bandwidth mobile usage requires device validation. Product workspace is not auth-walled and SEO is secondary. White daylight-friendly controls surround a large geographic canvas; periwinkle represents calculated paths, orange simulated closures, green connected facilities. Color is always paired with text. Manrope headings and DM Sans body have system fallbacks.

Target WCAG AA; root/QA owns keyboard, viewport and state checks. Aspirational mobile p75 targets: LCP 2500ms, INP 200ms, CLS 0.1; initial JS goal 250KB gzip with map split into a client-only dynamic chunk; Lighthouse accessibility goal 90 and performance 80. These are targets, not measured scores. Public OSM tiles and optional Google Fonts require network; calculations and textual access results remain usable if they fail. Performance and screen-reader qualification on target hardware remain unverified.

## Operations

Node 22, npm lockfile. `npm ci`, `npm run dev`. Static fixtures require no .env. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. CI file performs checks without deployment. No cloud service, GitHub remote or external publishing is required.
