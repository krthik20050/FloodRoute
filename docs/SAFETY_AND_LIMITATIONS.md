# Safety and limitations

FloodRoute is an unvalidated decision-support prototype. Follow current official emergency instructions. Connectivity in its model does not establish a road's physical safety, legal access, flood depth or a destination's operational status.

## MVP meaning

- All configured closures and affected routes are simulation inputs. They are not observed Kerala incidents.
- The compact graph is an illustrative network near Kerala locations. Edges do not assert complete surveyed roads, bridge geometry, turn restrictions, access classes or verified road lengths.
- Facilities represent configured demo destinations. They do not assert active camps, available hospital beds, operating hours or emergency acceptance.
- Reachable means a graph path exists after the selected edges are removed. Unreachable means no modeled path exists; missing roads may change real-world results.
- Counts are counts of configured facilities/nodes. They are not people, households or exposure estimates.
- No travel time or flood-prediction confidence is justified by the fixture. Any geometric distance must be explicitly identified as a model estimate.

## Provenance categories

Keep simulated closures, manually reported incidents, verified observations, official warnings, historical hazard layers and model estimates distinct. A future live incident must include provider/source, observed/published timestamp, ingestion timestamp, validity/status and verification state. Missing timestamps are unknown, never fresh. Historical hazard probability cannot be transformed into a current closure.

## Failure and uncertainty behavior

| Failure / uncertainty | Required behavior |
|---|---|
| No route in disrupted graph | Show no modeled route and affected connections; do not invent a recommendation. |
| Invalid origin/destination or closure | Reject with bounded validation error; preserve the last valid scenario. |
| Map tiles unavailable | Keep route/accessibility controls and textual results usable; explain map limitation. |
| Routing provider unavailable/timeout | Explicit provider error; never silently present a synthetic result as live navigation. |
| No database credentials | Use isolated demo adapter; mark persistence limitations. |
| Missing/stale/unverified incident | Expose provenance/status; do not assert a road is open or a facility operational. |
| Incomplete graph / uncertain hazard boundaries | Explain modeled coverage and sensitivity; no numerical safety guarantee. |
| Public untrusted report | Treat as unverified pending privileged review; do not let anonymous input establish official closures. |

## Security boundary

The demo should not expose privileged incident writes. Any future persistent administrative changes require server-side authorization, input validation, audited moderation and least-privilege RLS. Supabase service-role keys remain server-only and must never enter client bundles or source control. Local browser scenario state is user-controlled simulation, not trusted operational data.

## Required before operational use

Vetted complete road topology, official feed permissions, closure-to-edge matching, stale-data handling, facility verification, vehicle/access restrictions, field validation, emergency agency review, reliability monitoring and documented incident response. Independent domain review is necessary before treating routes as emergency recommendations. This MVP does not satisfy those conditions.
