id: "001"
title: Repair Australia Country Core map
status: done
blocked_by: []

---

# Repair Australia Country Core map

Fix Australia as the tracer **Country Core** for source geometry selection.

## Description

Some source country identifiers appear more than once in the map data. Australia is the tracer case because the current high resolution map can resolve to a tiny duplicate shape instead of Australia itself. The geography generator must resolve duplicate source shapes by stable meaning and keep the current map viewer path working for the corrected **Country Core**.

## Acceptance Criteria

- [ ] Australia's high resolution **Country Core** map covers Australia and Tasmania instead of a tiny duplicate territory.
- [ ] Source geometry lookup handles duplicate numeric identifiers without silently replacing the main country shape with a smaller duplicate.
- [ ] The existing mobile map viewer can highlight and center Australia from the regenerated `Country.map` data.
- [ ] Existing generated country data remains sorted by country code and keeps the existing public `Country.map` field.
- [ ] Country generation fails with a clear error when a required country source geometry cannot be resolved.
- [ ] `pnpm -C packages/geo-data generate`, `pnpm -C packages/geo-data typecheck`, and `pnpm -C apps/mobile typecheck` pass.

## Blocked By

- None - can start immediately

## Implementation Notes

- Updated world atlas numeric id lookup to preserve all source geometry candidates instead of overwriting duplicates. Duplicate numeric ids now resolve by normalized source feature name and fail with a clear ambiguity error when no candidate matches.
- Made high resolution Country Core source geometry required during generation, while keeping Tuvalu as the explicit synthetic map exception because the current world atlas data has no Tuvalu source geometry.
- Regenerated geo data. Australia's high resolution `Country.map` now uses the Australia source feature with bounds from `656.819,264.034` to `720.775,341.246`, and generated countries remain sorted by country code with the public `Country.map` field preserved.
- Review pass: no additional code fixes were needed for issue 001. The current implementation preserves duplicate numeric id candidates, resolves the Australia duplicate by normalized source feature name, keeps Tuvalu as the explicit synthetic exception, and leaves the mobile map viewer consuming the existing `Country.map` contract.
- Tests run:
  - `pnpm -C packages/geo-data generate`
  - `pnpm -C packages/geo-data typecheck`
  - `pnpm -C apps/mobile typecheck`
  - Generated Australia bounds check with `node --input-type=module`
  - Missing required source geometry error check with `node --experimental-strip-types --input-type=module`
  - Current atlas duplicate numeric id scan with `node --experimental-strip-types --input-type=module`
