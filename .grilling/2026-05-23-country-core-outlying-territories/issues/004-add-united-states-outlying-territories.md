id: "004"
title: Add United States Outlying Territories
status: pending
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

Filled in by `/implement-issues`.
