id: "002"
title: Introduce France Outlying Territories
status: pending
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

Filled in by `/implement-issues`.
