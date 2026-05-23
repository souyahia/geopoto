id: "002"
title: Introduce France Outlying Territories
status: done
blocked_by: ["001"]

---

# Introduce France Outlying Territories

Add the first end-to-end **Outlying Territory** slice using France as the tracer country.

## Description

France should highlight as its **Country Core** in general country quizzes, while resolved French outlying areas stay visible on the neutral map and become separate geography quiz entities. This slice introduces the public outlying territory data model, generation path, exports, and mobile map rendering behavior with the agreed France examples.

## Acceptance Criteria

- [ ] The geo-data package exports `OUTLYING_TERRITORIES` from the root package and from `@geopoto/geo-data/outlying-territories`.
- [ ] Each **Outlying Territory** has `code`, `countryCode`, `name`, `continent`, `regions`, and `map`.
- [ ] France exposes outlying territory codes for French Guiana (`GF`), Martinique (`MQ`), Guadeloupe (`GP`), Mayotte (`YT`), and Réunion (`RE`).
- [ ] France's **Country Core** map includes metropolitan France and Corsica, and excludes French Guiana, Martinique, Guadeloupe, Mayotte, and Réunion.
- [ ] Generation fails with a clear error if any configured France **Outlying Territory** cannot resolve metadata or map paths.
- [ ] The mobile neutral base map draws both **Countries** and **Outlying Territories** without a generated path-heavy duplicate base map list.
- [ ] Region bounds used by the map include **Outlying Territories** according to their own location.
- [ ] `pnpm -C packages/geo-data generate`, `pnpm -C packages/geo-data typecheck`, and `pnpm -C apps/mobile typecheck` pass.

## Blocked By

- 001 - Complete Country Core source geometry

## Implementation Notes

- Added public `OUTLYING_TERRITORIES` data from the root geo-data package and from the `@geopoto/geo-data/outlying-territories` subpath. Generated entries include `code`, `countryCode`, localized `name`, `continent`, `regions`, and `map`.
- Added the France outlying territory slice for `GF`, `GP`, `MQ`, `RE`, and `YT`. Metadata comes from the unfiltered RestCountries records, while included Country records still use the existing filtered country list.
- Split configured France outlying territory polygons out of the France source `MultiPolygon` by geographic bounds. France Country Core now keeps metropolitan France, Corsica, and the coastal metropolitan island source polygon, while excluding French Guiana, Guadeloupe, Martinique, Mayotte, and Réunion.
- Generation now throws clear errors when configured outlying territory metadata, source geometry, or map path creation cannot be resolved. Tiny territories missing from the low resolution atlas reuse the high resolution path instead of failing.
- Region bounds are built from Countries and Outlying Territories, so French Guiana contributes to South America, Guadeloupe and Martinique contribute to the Caribbean and North America, and Mayotte and Réunion contribute to Africa.
- Mobile map rendering now aggregates `COUNTRIES` and `OUTLYING_TERRITORIES` at runtime for the neutral base path and region highlights, avoiding a second generated path-heavy base map list.
- Verified generated data: France bounds are European after regeneration, and the five France outlying territories have their expected `countryCode`, continent, regions, bounds, and map paths.
- Review fix: renamed the mobile aggregated map path helper and caches from country-specific names to map entity names, because those helpers now accept both Countries and Outlying Territories.
- Review found no remaining functional gaps in public exports, generated `outlying-territories.json`, France Country Core splitting, outlying territory generator failure modes, map region bounds, mobile neutral base map aggregation, or duplicate neutral base map generation.
- Tests run:
  - `pnpm -C packages/geo-data generate`
  - `pnpm -C packages/geo-data typecheck`
  - `pnpm -C apps/mobile typecheck`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/source-feature-parts.ts packages/geo-data/scripts/generate/outlying-territory.ts packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/scripts/generate/country-core.ts packages/geo-data/scripts/generate/country-map.ts packages/geo-data/scripts/generate/country.ts packages/geo-data/scripts/generate/generated-files.ts packages/geo-data/scripts/generate/index.ts packages/geo-data/scripts/generate/map-regions.ts packages/geo-data/scripts/generate/rest-countries.ts packages/geo-data/scripts/generate/world-atlas.ts packages/geo-data/src/outlying-territories.ts packages/geo-data/src/index.ts apps/mobile/src/modules/map-viewer/hooks/use-map-viewer-styles.ts apps/mobile/src/modules/map-viewer/utils/map-viewer-skia-paths.ts`
  - Generated France Country Core polygon split check with `node --experimental-strip-types --input-type=module`
  - Generated outlying territory code, shape, region, and France bounds check with `node --input-type=module`
  - Missing outlying territory metadata error check with `node --experimental-strip-types --input-type=module`
  - Missing outlying territory source geometry error check with `node --experimental-strip-types --input-type=module`
  - `git diff --check`
