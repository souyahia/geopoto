id: "005"
title: Harden resolved geography generation invariants
status: pending
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

Filled in by `/implement-issues`.
