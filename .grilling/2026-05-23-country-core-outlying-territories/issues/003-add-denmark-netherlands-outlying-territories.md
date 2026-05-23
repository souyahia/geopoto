id: "003"
title: Add Denmark and Netherlands Outlying Territories
status: done
blocked_by: ["002"]

---

# Add Denmark and Netherlands Outlying Territories

Extend the **Outlying Territory** model to Denmark and the Netherlands.

## Description

Denmark and the Netherlands should highlight only their **Country Core** in general country quizzes, while their resolved outlying areas stay visible on the neutral map and are exported as separate **Outlying Territories**. This verifies that the model works beyond the France tracer and covers both named source territories and embedded source shapes.

## Acceptance Criteria

- [ ] Denmark's **Country Core** excludes Greenland and the Faroe Islands.
- [ ] Greenland (`GL`) and the Faroe Islands (`FO`) are exported as Denmark **Outlying Territories** with location-based continent and regions.
- [ ] The Netherlands **Country Core** excludes Aruba, Caribbean Netherlands, Curaçao, and Sint Maarten.
- [ ] Aruba (`AW`), Caribbean Netherlands (`BQ`), Curaçao (`CW`), and Sint Maarten (`SX`) are exported as **Outlying Territories** with `countryCode: "NL"` and location-based continent and regions.
- [ ] Caribbean Netherlands (`BQ`) includes the resolved embedded Netherlands source shapes for Bonaire, Saba, and Sint Eustatius.
- [ ] Generation fails with a clear error if any configured Denmark or Netherlands **Outlying Territory** cannot resolve metadata or map paths.
- [ ] The mobile neutral base map still draws the excluded Denmark and Netherlands outlying areas.
- [ ] `pnpm -C packages/geo-data generate`, `pnpm -C packages/geo-data typecheck`, and `pnpm -C apps/mobile typecheck` pass.

## Blocked By

- 002 - Introduce France Outlying Territories

## Implementation Notes

- Extended the existing Outlying Territory config model with a separate source country code and multiple source bounds per territory. This keeps Denmark and Netherlands additions on the same generator path as France while allowing direct atlas features and embedded source shapes.
- Added Denmark Outlying Territories for Greenland (`GL`) and the Faroe Islands (`FO`). Generated entries use `countryCode: "DK"` with location-based continent and regions.
- Added Netherlands Outlying Territories for Aruba (`AW`), Caribbean Netherlands (`BQ`), Curaçao (`CW`), and Sint Maarten (`SX`). Generated entries use `countryCode: "NL"` with location-based continent and Caribbean region membership where appropriate.
- Configured Caribbean Netherlands (`BQ`) from the embedded Netherlands source geometry with separate bounds for Bonaire, Sint Eustatius, and Saba. Source extraction now requires every configured bounds entry to resolve, so missing embedded source shapes fail clearly during generation.
- Regenerated geo data. Denmark and Netherlands Country Core maps stay bounded to their European cores, while the excluded outlying areas remain available through `OUTLYING_TERRITORIES` for the existing mobile Countries plus Outlying Territories aggregation.
- Review pass: no code fixes were needed. Verified Denmark Country Core remains bounded to European Denmark and that `GL` and `FO` are exported as Denmark Outlying Territories with location-based regions.
- Review pass: verified Netherlands Country Core removes the Caribbean Netherlands embedded source shapes, and that `AW`, `BQ`, `CW`, and `SX` are exported as Netherlands Outlying Territories with Caribbean region membership.
- Review pass: verified `BQ` resolves exactly three embedded source shapes for Bonaire, Saba, and Sint Eustatius, and verified clear generation failures for missing Denmark owner metadata, missing Greenland source geometry, missing Caribbean Netherlands source geometry, and a Sint Maarten map path failure.
- Review pass: verified the mobile neutral base map still uses the existing runtime aggregation of `COUNTRIES` and `OUTLYING_TERRITORIES`; no duplicate path-heavy neutral base map list was added.
- Tests run:
  - `pnpm -C packages/geo-data generate`
  - `pnpm -C packages/geo-data typecheck`
  - `pnpm -C apps/mobile typecheck`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/scripts/generate/outlying-territory.ts packages/geo-data/scripts/generate/source-feature-parts.ts`
  - Generated Denmark, Netherlands, and Outlying Territory data check with `node --input-type=module`
  - Denmark, Netherlands, and `BQ` generated data check with `node --input-type=module`
  - Denmark and Netherlands Country Core source geometry check with `node --experimental-strip-types --input-type=module`
  - Missing Denmark owner metadata, Greenland source geometry, Caribbean Netherlands source geometry, and Sint Maarten map path error checks with `node --experimental-strip-types --input-type=module`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/scripts/generate/outlying-territory.ts packages/geo-data/scripts/generate/source-feature-parts.ts packages/geo-data/scripts/generate/country-core.ts apps/mobile/src/modules/map-viewer/utils/map-viewer-skia-paths.ts apps/mobile/src/modules/map-viewer/hooks/use-map-viewer-styles.ts`
  - `git diff --check`
