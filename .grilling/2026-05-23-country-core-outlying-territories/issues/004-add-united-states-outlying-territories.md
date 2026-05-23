id: "004"
title: Add United States Outlying Territories
status: done
blocked_by: ["002"]

---

# Add United States Outlying Territories

Extend the **Outlying Territory** model to the United States, including the app-defined Hawaii case.

## Description

The United States should highlight the contiguous United States plus Alaska in general country quizzes. Hawaii and the resolved dependent territories should stay visible on the neutral map and be exported as **Outlying Territories**. This slice exercises both external metadata from RestCountries and explicit curated metadata for an app-defined territory.

## Acceptance Criteria

- [ ] The United States **Country Core** includes the contiguous United States and Alaska.
- [ ] The United States **Country Core** excludes Hawaii, Puerto Rico, Guam, American Samoa, Northern Mariana Islands, and the U.S. Virgin Islands.
- [ ] Hawaii is exported as app-defined **Outlying Territory** `US-HI` with `countryCode: "US"`, explicit localized name, `continent: "oceania"`, `regions: ["world", "oceania"]`, and map.
- [ ] Puerto Rico (`PR`), Guam (`GU`), American Samoa (`AS`), Northern Mariana Islands (`MP`), and the U.S. Virgin Islands (`VI`) are exported as United States **Outlying Territories** with metadata derived from external geography data.
- [ ] Generation fails with a clear error if any configured United States **Outlying Territory** cannot resolve metadata or map paths.
- [ ] The mobile neutral base map still draws Hawaii and the exported United States outlying territories.
- [ ] `pnpm -C packages/geo-data generate`, `pnpm -C packages/geo-data typecheck`, and `pnpm -C apps/mobile typecheck` pass.

## Blocked By

- 002 - Introduce France Outlying Territories

## Implementation Notes

- Extended the existing Outlying Territory config metadata model with `restCountries` and `appDefined` metadata sources, so app-defined entries still use the same source bounds, map building, sorting, and failure path as existing external territories.
- Added Hawaii as app-defined Outlying Territory `US-HI` owned by `US`, sourced from the United States atlas feature, with explicit localized name, `continent: "oceania"`, `regions: ["world", "oceania"]`, and generated high and low resolution map paths.
- Added Puerto Rico (`PR`), Guam (`GU`), American Samoa (`AS`), Northern Mariana Islands (`MP`), and the U.S. Virgin Islands (`VI`) as United States Outlying Territories with RestCountries-derived names, continents, and regions.
- Regenerated geo data. The United States Country Core now excludes the configured Hawaii source polygons while keeping the contiguous United States and Alaska. The generated high resolution United States source part count is 120 after removing the 7 Hawaii polygons, and the low resolution part count is 5 after removing the 5 Hawaii polygons.
- The existing mobile neutral base map aggregation still uses `COUNTRIES` plus `OUTLYING_TERRITORIES`, so Hawaii and the exported United States outlying territories are included without adding a separate generated base map list.
- Verified clear generation failures for missing United States owner metadata, missing Hawaii source geometry, and missing Hawaii map path creation.
- Review pass: no scoped code fixes were needed. Verified the generated United States Country Core bounds and source part counts exclude Hawaii while preserving the contiguous United States and Alaska, and verified `US-HI`, `PR`, `GU`, `AS`, `MP`, and `VI` export the expected owner, names, continent, regions, and map paths.
- Review pass: verified the mobile neutral base map still aggregates `COUNTRIES` plus `OUTLYING_TERRITORIES` at runtime and no duplicate generated neutral base map list was added.
- Review pass: verified clear generation failures for missing United States owner metadata, missing Puerto Rico source metadata, missing Hawaii source geometry, and Hawaii high resolution map path creation.
- Tests run:
  - `pnpm -C packages/geo-data generate`
  - `pnpm -C packages/geo-data typecheck`
  - `pnpm -C apps/mobile typecheck`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/scripts/generate/outlying-territory.ts`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/scripts/generate/outlying-territory.ts packages/geo-data/scripts/generate/source-feature-parts.ts packages/geo-data/scripts/generate/country-core.ts apps/mobile/src/modules/map-viewer/utils/map-viewer-skia-paths.ts apps/mobile/src/modules/map-viewer/hooks/use-map-viewer-styles.ts`
  - Generated United States outlying territory data check with `node --input-type=module`
  - United States Country Core source geometry exclusion check with `node --experimental-strip-types --input-type=module`
  - Missing United States owner metadata, Hawaii source geometry, and Hawaii map path error checks with `node --experimental-strip-types --input-type=module`
  - Generated United States issue 004 acceptance and failure mode review check with `node --experimental-strip-types --input-type=module`
  - `git diff --check`
