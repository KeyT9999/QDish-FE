# Bulk Menu Translation — Todo

**Status:** Implementation complete; hosted CI pending PR verification
**Plan:** `2026-10-07-bulk-menu-translation.md`
**Design:** `../specs/2026-10-07-bulk-menu-translation-design.md`

## Planning gate

- [x] Inspect current FE/BE translation flow, menu management read, model storage, and approved-only public serialization.
- [x] Confirm whether current approved translations should be overwritten: skip fully translated items.
- [x] Present and receive approval for sequential generation, progress, review list, and one-action publication design.
- [x] Draft the design addendum, implementation plan, and task checklist.
- [x] User reviews and approves the written spec, plan, and todo.
- [x] User approves source implementation.

## Backend

- [x] Add optional `preserveExisting` behavior to menu draft generation.
- [x] Add a restaurant-scoped bulk publication endpoint that validates all selected IDs and locale states before writing.
- [x] Return updated managed menu items from bulk publication.
- [x] Test authentication, restaurant isolation, preservation, completeness validation, publication, and public filtering.

## Frontend

- [x] Add pure bulk eligibility, skip, review, and publish-readiness logic.
- [x] Extend `menuService` for preserve-existing generation and bulk publication.
- [x] Add the menu-tab bulk action.
- [x] Add confirmation counts and sequential progress UI.
- [x] Show numeric percent complete alongside the x/y progress count.
- [x] Continue after item-level failures and support retry.
- [x] Show a mobile-friendly review list with source, English, Chinese, status, selection, and edit action.
- [x] Publish selected ready items with one action and update dashboard state.
- [x] Show completion counts and recoverable refresh state after publication errors.

## Verification and release readiness

- [x] Focused backend route tests, full backend `test:ci`, and build pass.
- [x] Focused frontend policy tests and full frontend `test:ci` pass.
- [x] Mocked browser regression covers progress, partial failure, retry, review, bulk publish, and publication-refresh recovery.
- [x] FE encoding check, lint, and build pass.
- [x] BE focused route tests and build pass.
- [x] Production dependency audits pass with no high-severity findings.
- [x] Review draft confidentiality, cross-restaurant isolation, and no-overwrite behavior.
- [ ] Hosted CI is verified on the exact PR head after an authorized push.

**Local verification note:** The CI install graph passed `npm ci --dry-run --ignore-scripts` in both repos. FE encoding, lint, unit tests, all browser regressions, and build passed; BE unit tests and build passed. Hosted CI will be verified against each PR head.
