# Direct runtime dependencies

The npm lockfile records exact versions. Dependency packages retain their original notices. Distribution of bundled dependencies must retain all required copyright/license notices, including transitive dependencies.

| Library                               | License      | Source                                   |
| ------------------------------------- | ------------ | ---------------------------------------- |
| Next.js                               | MIT          | https://github.com/vercel/next.js        |
| React / React DOM                     | MIT          | https://github.com/facebook/react        |
| Graphology / graphology-shortest-path | MIT          | https://github.com/graphology/graphology |
| Zod                                   | MIT          | https://github.com/colinhacks/zod        |
| Leaflet                               | BSD-2-Clause | https://github.com/Leaflet/Leaflet       |
| Lucide React                          | ISC          | https://github.com/lucide-icons/lucide   |

Leaflet copyright: (c) 2010-2023 Volodymyr Agafonkin, (c) 2010-2011 CloudMade. Preserve its BSD redistribution conditions and disclaimer in any source or binary redistribution. The full notice is retained in the installed `leaflet/LICENSE` package file.

Map tiles: © OpenStreetMap contributors, database licensed under ODbL. https://www.openstreetmap.org/copyright . Tile service usage rules: https://operations.osmfoundation.org/policies/tiles/ . Attribution is visible on the map. Tiles are fetched as the user browses; no bulk download/prefetch is implemented.

Optional Google Fonts: DM Sans (Colophon Foundry) and Manrope (Mikhail Sharanda) are loaded through Google Fonts. Each is distributed under SIL Open Font License 1.1. They are not bundled locally; system fonts work when the external service is unavailable. Verify the font distribution license before repackaging.

No competitor source, hazard raster, official report content or real personal data is bundled. The demo network and incident fixtures are original illustrative data.
