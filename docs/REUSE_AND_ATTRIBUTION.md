# Reuse and attribution ledger

Checked 13 October 2026. No competitor source code, imagery, data or substantial components have been copied. Public repository visibility is not a reuse license. Package use must retain its bundled notices and be reflected in the lockfile; this document is not a substitute for those notices.

| Candidate | License evidence / compatibility | Decision |
|---|---|---|
| [Water Watch](https://github.com/mishanilkazreen/water-watch) | GitHub labels MIT; exact source/dependency audit and executable verification not completed. Different UK/Mapbox/FastAPI architecture. | Research inspiration only; no copied code. |
| [OptiRoute](https://github.com/RayonBiswas/OptiRoute) | GitHub labels MIT; source/dependency audit not completed. Mumbai heuristics require regional validation. | Research inspiration only; no copied code or risk formula. |
| [Flood-Guard AI](https://github.com/ankit-sengupta05/Flood-Guard-AI) | README license TBD. | No code reuse. |
| [FloodWatch AI](https://github.com/rohanpilankar/Flood-Nowcasting) | License not verified. | No code/model/data reuse. |
| [FloodReroute](https://github.com/brittivora/Flood-reroute) | URL inaccessible; license unknown. | No reuse. |
| [Leaflet](https://github.com/Leaflet/Leaflet/blob/main/LICENSE) | BSD-2-Clause project license; React/Next client map compatibility. | Prefer package integration for 2D map. Retain license in installed distribution; map attribution separately required. |
| [Graphology](https://github.com/graphology/graphology) and [shortest-path library](https://graphology.github.io/standard-library/shortest-path.html) | Graphology repository labels MIT. Official shortest-path documentation supplies weighted Dijkstra and disconnected-path semantics. TypeScript/Node compatible; exact installed subpackage notices must be checked after installation. | Reuse packages for graph representation and routing rather than copying competitor algorithms. Unit tests must exercise closure exclusion and disconnected cases. |
| [OSRM](https://github.com/Project-OSRM/osrm-backend) / [Valhalla](https://github.com/valhalla/valhalla) | BSD-2-Clause / MIT shown by repositories. | Future routing adapter candidates. Not installed or operated for this deadline. |
| [pgRouting](https://github.com/pgRouting/pgrouting) | Mostly GPL-2.0-or-later; Boost/MIT component exceptions. | Deferred database extension; review deployment/license obligations first. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL geographic database. [Public tile usage policy](https://operations.osmfoundation.org/policies/tiles/) is separate. | Display visible OpenStreetMap contributor attribution if its tiles/data are used. No bulk download, prefetch, SLA assumption or fixture-as-OSM claim. |
| KSDMA, IMD, CWC content | Public access does not establish redistribution/API rights. | Official links only until data terms and integration contracts are established. |

The simulation graph and incident fixtures are authored for this MVP and are illustrative. Dijkstra and connected-component methods are standard algorithms, integrated through vetted graph packages where applicable and tested on the small fixture; no proprietary algorithm or competitor application source was copied.

Installed package review: Next.js 16.4.0, React 19.3.0, Graphology 0.26.0, graphology-shortest-path 2.1.0 and Zod 4.6.7 declare MIT; Leaflet 1.9.4 contains BSD-2-Clause LICENSE; Lucide React 0.468.0 declares ISC. React-Leaflet 5.0.0 was evaluated but declares Hippocratic-2.1; it was removed in favor of direct Leaflet so the map does not introduce that nonstandard license. No competitor package was installed. Package notices remain in installed dependencies; `THIRD_PARTY_NOTICES.md` records the direct runtime libraries and obligations.

Before production: audit the exact lockfile, dependency vulnerabilities and notices; verify tile-provider terms/capacity; review source-data license and derivative database obligations; document actual provider SLAs; audit any proposed substantial source reuse before importing it.
