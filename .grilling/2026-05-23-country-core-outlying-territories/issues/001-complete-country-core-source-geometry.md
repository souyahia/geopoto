id: "001"
title: Repair Australia Country Core map
status: pending
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

Filled in by `/implement-issues`.
