# FloodRoute research

Research checked 13 October 2026. This is a focused MVP investigation, not a certification or exhaustive competitor audit. Repository descriptions are author claims unless explicitly identified as observed execution. No competitor was installed or run. GitHub CLI requests failed due to network access; browser research supplied the evidence below. Latest commit dates and ongoing maintenance remain unverified. REA routing guidance was applied: these are source repositories and public descriptions, so no binary/runtime reverse engineering is warranted.

## Comparable products

| Product / primary evidence | Verified documentation findings | Boundary and reuse decision |
|---|---|---|
| [FloodReroute](https://github.com/brittivora/Flood-reroute) | Supplied URL returned 404 through the research browser. | Could be moved/private/unavailable. Features, stack, license, maintenance unknown. No reuse. |
| [Water Watch](https://github.com/mishanilkazreen/water-watch) | README describes React/Vite/TypeScript, Mapbox, FastAPI/SQLite, UK Environment Agency data and ORS avoidance polygons. GitHub shows MIT and 14 commits. | Useful example of hazard buffering and separate reports/shelters. UK feed does not establish Kerala coverage. Running behavior, verification quality and safety claims untested. No code copied. |
| [OptiRoute](https://github.com/RayonBiswas/OptiRoute) | Mumbai-oriented React/Leaflet/FastAPI product. README combines Open-Meteo rainfall, static waterlogging heuristics, bad-road penalties and ORS route comparison. GitHub shows MIT and 12 commits. | Transparent route explanation is relevant. Rainfall/heuristics do not establish observed inundation. Kerala calibration and operational accuracy unknown. No code copied. |
| [FloodWatch AI](https://github.com/rohanpilankar/Flood-Nowcasting) | README describes Mumbai grids, XGBoost nowcasting and risk-penalized Dijkstra with Angular/FastAPI/GIS. Repository has tests and 15 commits. | Reported evaluation scores were not independently checked. Data/model transfer to Kerala is unverified. License not verified. No reuse. |
| [Flood-Guard AI](https://github.com/ankit-sengupta05/Flood-Guard-AI) | Describes dam-break simulation, digital twin and evacuation planning with React/FastAPI/PostGIS/Earth Engine. 26 commits visible. README license says TBD. | Hydrodynamic and satellite claims not validated here. Unclear license excludes code reuse. |
| [Kerala Flood Watch](https://www.keralafloodwatch.in/) | Search-indexed first-party text describes telemetry, satellite observation, gauges, camps, reports and simulators. Direct page retrieval failed. | Government endorsement, actual feed provenance, API, license, refresh rate and execution unknown. Do not treat branding as official authority. |
| [CWC FloodWatch India](https://play.google.com/store/apps/details?id=in.gov.affcwc) | Official CWC app listing describes near-real-time flood monitoring, reservoir information, bilingual content and forecasts up to seven days. | App listing is not an integration API or road-passability dataset. No source/license or reusable API established. |

Other leads found: [JalaNet](https://jalanet.org/) publishes first-party dam monitoring information, and [Kerala Flash-Flood Watch](https://nishanthkesavan.in/projects/flash-flood-keralam/) describes a risk dashboard. They merit later provenance/API investigation; they were not audited or reused in this MVP.

## Authoritative data inventory

| Provider | Coverage / format / temporal meaning | Access, permission, freshness and fallback |
|---|---|---|
| [KSDMA hazard maps](https://sdma.kerala.gov.in/hazard-maps/) | Kerala district PDFs; historical flood probability raster ZIPs; climate-scenario rasters; landslide shapefiles. | Page accessible. Historical/scenario maps are not current inundation or road closures. Explicit redistribution terms and update cadence not established. Link to originals; no ingestion until terms/CRS/nodata verified. |
| [IMD hydrology](https://hydro.imd.gov.in/national/) | National flash flood bulletin page with issue/validity fields. | Supplied endpoint rendered input/template fields during inspection, not a verified published feed. Never interpret default text as current guidance. No API or reuse permission confirmed; link out. |
| [IMD Kerala](https://mausam.imd.gov.in/thiruvananthapuram/) | Regional weather/warnings webpage. | Official link for users; machine interface, publication cadence and license require further verification. Missing feed means unknown conditions. |
| [CWC](https://play.google.com/store/apps/details?id=in.gov.affcwc) | India flood forecasts and monitoring via official app. | No documented public API verified. Do not scrape app endpoints or infer road status from a river level. Link out. |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | Community geographic database under ODbL. | Attribution required. Road topology can be incomplete/stale; it does not establish current passability. MVP schematic graph is original illustrative data, not an OSM road extract. |
| [NRSC historical Kerala flood map](https://ndem.nrsc.gov.in/documents/Disaster_Document/2023/KL/klflood50dsc06072023_1800hrs/klflood50dsc06072023_1800hrs_report.pdf) | Dated July 2023 satellite flood report. | Historical evidence only; event-specific extent must not be relabeled current. Redistribution/automation terms not verified. |

No verified operational relief-camp roster, closure feed or population exposure data was obtained. Facility markers in the demo must be labeled illustrative; no operational capacity, availability or affected population is claimed.

## Routing ecosystem and MVP decision

[OSRM](https://github.com/Project-OSRM/osrm-backend) is a BSD-2-Clause C++ OSM routing backend. [Valhalla](https://github.com/valhalla/valhalla) is MIT and supports OSM routing. [pgRouting](https://github.com/pgRouting/pgrouting) integrates graph algorithms into PostgreSQL; most functionality is GPL-2.0-or-later with component exceptions. These are credible future providers, but regional data preparation, closure mapping and hosted operation are significant deployment work. Their public availability does not establish a dependable production endpoint.

[Leaflet](https://leafletjs.com/) supports markers, polylines, GeoJSON, layer controls and mobile interaction with a small integration surface. It fits a compact 2D MVP; select stable installed versions rather than the advertised 2.0 alpha. [OSM tile policy](https://operations.osmfoundation.org/policies/tiles/) requires attribution and compliant usage; public tiles are best-effort and unsuitable as an emergency availability guarantee. No prefetching/bulk downloads.

The supported product direction is explainable closure simulation plus community accessibility. Existing leads already describe flood routing and dashboards, so a claim of unique invention is unsupported. FloodRoute's initial value is reproducible baseline/disrupted graph comparison, newly unreachable destinations and explicit provenance. This is a useful hypothesis to validate with responders, not demonstrated market exclusivity.

The MVP should use an original compact Kerala-focused illustrative network. Close specific edges, run shortest-path and reachability analysis, and show why connectivity changed. Avoid predictive flood scores, fabricated populations and guaranteed travel times. Official sources remain links until usable APIs and licensing are verified. Keep provider contracts separate so a vetted road network can replace the fixture.
