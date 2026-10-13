# FloodRoute MVP product specification

## Outcome and scope

Demonstrate how road/bridge closures change journeys and access to important destinations in a Kerala-focused illustrative network. The MVP is a decision-support simulation; it does not report present flood conditions or provide emergency navigation.

Primary users are community coordinators exploring access loss and residents reviewing the concept. The presentation should lead with the interactive map, route controls, scenario switcher and reachable destinations.

## Priority 0 acceptance criteria

1. The application starts locally without Supabase or paid-service credentials. Demo mode is visible throughout.
2. Users select configured origins/destinations; invalid IDs are rejected server-side. A baseline path is calculated, displayed and described.
3. Users toggle a road/bridge closure. The current route recomputes from the remaining graph and never traverses a closed edge.
4. A disruption that removes the shortest path produces an alternative where one exists. Fully disconnected selections produce a clear no-route result.
5. Accessibility lists configured facilities reachable from the selected origin and highlights those reachable before closures but unreachable afterward.
6. Multiple simultaneous closures, reset and reproducible presets work. Counts reflect the actual configured graph, not fabricated incident/population metrics.
7. Every closure is marked simulated. Fixture origin, timestamps where present and model limitations can be inspected.
8. No result is called safe/open/officially approved. Distance is labeled a model estimate if derived from fixture coordinates; travel time is omitted without a suitable provider.
9. Keyboard-accessible labeled controls and a usable phone layout support the same core journey. Loading, empty and failure states explain next actions.
10. Unit tests cover baseline, detour, disconnection, facility access loss, multiple closures, malformed inputs and missing credentials. Checks actually run are recorded separately from planned coverage.

## User stories

- As a coordinator, I close a bridge and compare which configured destinations become unreachable, so I can explain a vulnerability.
- As a resident, I choose two configured places and inspect how closures change the route, so I can understand the model's result.
- As a reviewer, I reset a scenario and rerun it, so I can reproduce the analysis.
- As a reviewer, I inspect source and simulation labels, so I can distinguish model output from current evidence.

## Priority 1

Trusted incident import with validation and review; persistent scenarios through a configured Supabase adapter; authenticated moderation with RLS; vetted Kerala road graph; reliable routing service behind provider abstraction; facility operational verification and timestamps; source-freshness policies; browser end-to-end regression suite.

## Deferred

Flood prediction, hydrodynamic simulation, population exposure, real evacuation recommendations, statewide routing, crowdsourced public writes, mobile GPS tracking and automatic official-data scraping. These need operational data, calibration, permissions and independent domain validation.

## Demo acceptance journey

Open the local dashboard, inspect Demo mode, select a configured origin and hospital, calculate the baseline, activate a bridge closure, inspect detour and changed accessibility, activate an isolation scenario, verify no-route/unreachable states, reset, and inspect the official-source and assumption information.
