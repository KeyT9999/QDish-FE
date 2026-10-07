# Multilingual QR Menu — Todo

**Status:** Draft for user review
**Plan:** `2026-10-07-multilingual-qr-menu.md`
**Design:** `../specs/2026-10-07-multilingual-qr-menu-design.md`

## Planning gate

- [x] Inspect current menu/category models, routes, dashboard editor, customer menu, cart, and order payload.
- [x] Inspect both repositories' CI workflows and test commands.
- [x] Select the design and implementation-planning skills.
- [x] Draft the feature design, implementation plan, and task checklist.
- [x] User reviews and approves the design and plan.
- [x] Create `feat/multilingual-qr-menu` in both FE and BE repositories.
- [x] Run UI UX Pro Max design-system and React stack searches; preserve existing QDish palette and typography.
- [x] Run baseline FE and BE `test:ci` suites successfully.
- [x] Begin implementation after written-plan approval.

## Current progress

- [x] Task 1: backend translation schema and publication policy.
- [~] Task 2: xKiro client and draft generation service (in progress).
- [ ] Task 3: protected management APIs and public serialization.
- [ ] Tasks 4–8: dashboard, guest localization, browser coverage, and CI verification.

## Backend

- [ ] Add separate draft and approved values per locale; derive DRAFT, APPROVED, or STALE for the management UI.
- [ ] Add tested policy helpers for stale invalidation and approved-only public serialization.
- [ ] Add xKiro client using the Qwen3.8 Max model ID, backend secret, timeout, and response validation.
- [ ] Add authenticated management reads for owner/admin only, scoped from the authenticated restaurant identity.
- [ ] Add authenticated item/category draft generation and locale edit/publish routes.
- [ ] Verify public reads hide DRAFT and STALE content and cross-restaurant writes fail.
- [ ] Keep order snapshots and staff/kitchen display in Vietnamese.

## Frontend

- [ ] Add translation and locale types plus management API methods.
- [ ] Update dashboard reads to protected management APIs.
- [ ] Add AI draft, edit, and approve controls for dishes and categories.
- [ ] Add per-restaurant guest locale persistence and VI/EN/zh-CN message dictionaries.
- [ ] Add language selector to the guest QR menu.
- [ ] Localize category filters, menu cards, item details, warnings, cart, checkout, and order history.
- [ ] Verify approved translations render and missing/stale translations fall back to Vietnamese.
- [ ] Verify order submission keeps the existing item-ID/quantity payload.

## Verification and release readiness

- [ ] Add focused backend tests and register them in backend test:ci.
- [ ] Add focused frontend tests and register them in frontend test:ci.
- [ ] Add a mocked multilingual Playwright test and include it in frontend CI.
- [ ] Run backend npm ci, npm run test:ci, and npm run build.
- [ ] Run frontend npm ci, npm run check:encoding, npm run lint, npm run test:ci, existing E2E commands, multilingual E2E, and npm run build.
- [ ] Review the full diff for key leakage, draft exposure, and changed staff order names.
- [ ] Confirm production XKIRO_API_KEY is configured as a backend secret before enabling the AI action.
- [ ] Review the finished flow before any deployment.
