id: "005"
title: Harden resolved geography generation invariants
status: done
blocked_by: ["002", "003", "004"]

---

# Harden resolved geography generation invariants

Harden the resolved **Country Core** and **Outlying Territory** behavior with generation-time invariants.

## Description

Once multiple country families use **Outlying Territories**, the generator should fail fast when a curated geography decision breaks. This hardening issue adds cross-country regression coverage for the already implemented families, without adding new geography scope.

## Acceptance Criteria

- [ ] Generation fails when any **Country Core** or **Outlying Territory** has an empty high or low resolution path.
- [ ] Generation fails when an **Outlying Territory** references a missing **Country**.
- [ ] Generation fails when a **Country** references a missing **Outlying Territory** code.
- [ ] Sanity checks cover the resolved examples: France, Australia, Denmark, Netherlands, and United States.
- [ ] Sanity checks verify the known **Country Core** examples do not include their configured **Outlying Territories**.
- [ ] Generated data does not include a second path-heavy neutral base map list.
- [ ] `pnpm -C packages/geo-data generate`, `pnpm -C packages/geo-data typecheck`, and `pnpm -C apps/mobile typecheck` pass.

## Blocked By

- 002 - Introduce France Outlying Territories
- 003 - Add Denmark and Netherlands Outlying Territories
- 004 - Add United States Outlying Territories

## Implementation Notes

- Added generator-time geography invariant validation before files are written. The checks fail with clear errors for empty Country Core or Outlying Territory high and low resolution paths, Outlying Territories whose `countryCode` is not generated as a Country, and Countries that reference a missing Outlying Territory code.
- Added generated Country `outlyingTerritoryCodes` references for the resolved owner Countries. Denmark now references `FO` and `GL`, France references `GF`, `GP`, `MQ`, `RE`, and `YT`, Netherlands references `AW`, `BQ`, `CW`, and `SX`, and the United States references `AS`, `GU`, `MP`, `PR`, `US-HI`, and `VI`.
- Added cross-country sanity checks for Australia, Denmark, France, Netherlands, and the United States. The checks verify expected Outlying Territory ownership, minimum Country Core bounds for the known examples, and that configured Outlying Territory source bounds are not still present in the Country Core source feature for high or low resolution generation.
- Review fix: tightened the known Country Core exclusion invariant to validate each configured Outlying Territory source bounds entry independently. The previous full-territory extraction check could miss a partial leak for multi-part territories such as Caribbean Netherlands (`BQ`) when only one configured source part was still present in the Country Core.
- Added a generated JSON file invariant that only `countries.json` and `outlying-territories.json` may contain map path records, preventing a second path-heavy neutral base map list.
- Regenerated geo data. The generated JSON file set remains `countries.json`, `country-summaries.json`, `country-summary-codes-by-name.json`, `flags.json`, `map-regions.json`, and `outlying-territories.json`.
- Tests run:
  - `pnpm -C packages/geo-data generate`
  - `pnpm -C packages/geo-data typecheck`
  - `pnpm -C apps/mobile typecheck`
  - `pnpm exec oxfmt --check packages/geo-data/scripts/generate/geography-generation-invariants.ts packages/geo-data/scripts/generate/country.ts packages/geo-data/scripts/generate/index.ts packages/geo-data/scripts/generate/outlying-territory-config.ts packages/geo-data/src/countries.ts`
  - Generation invariant failure checks for empty Country Core high and low resolution paths, empty Outlying Territory high and low resolution paths, missing owner Country, and missing Outlying Territory code with `node --experimental-strip-types --input-type=module`
  - Generated path-heavy file failure check with `node --experimental-strip-types --input-type=module`
  - Generated Country Outlying Territory references, generated JSON file list, and per-bounds Country Core exclusion checks for Australia, Denmark, France, Netherlands, and the United States with `node --experimental-strip-types --input-type=module`
  - `git diff --check`
