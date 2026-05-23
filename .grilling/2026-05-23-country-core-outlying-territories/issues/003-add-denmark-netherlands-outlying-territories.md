id: "003"
title: Add Denmark and Netherlands Outlying Territories
status: pending
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

Filled in by `/implement-issues`.
