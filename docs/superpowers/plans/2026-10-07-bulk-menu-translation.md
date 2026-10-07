# Bulk Menu Translation Implementation Plan

> **For agentic workers:** Use the `executing-plans` skill in inline mode to implement this plan task by task. Steps use checkbox syntax for tracking.

**Goal:** Let restaurant owners translate menu items into English and Simplified Chinese in one progress-tracked session, review drafts, and publish selected ready items with one action.

**Architecture:** The browser determines which menu items need AI work, then calls the existing per-item generation route sequentially with `preserveExisting: true`. Each successful draft is persisted immediately. A new protected collection route validates and publishes selected item IDs in one request. A focused frontend dialog presents confirmation, progress, errors, and review cards.

**Tech Stack:** Existing Express, TypeScript, Mongoose, React, Vite, Tailwind, `apiFetch`, xKiro translation service, Node test scripts, and Playwright.

## Global Constraints

- Supported target locales are `en` and Simplified Chinese (`zhCN` in storage, `zh-CN` in frontend types).
- Vietnamese remains the canonical source for item name and description.
- Bulk management operations derive restaurant scope from authenticated owner/admin identity.
- Public menu serialization returns only locale values with approved status `APPROVED`.
- Bulk AI requests are sequential, one menu item at a time; each generated result persists before the next request.
- Bulk generation preserves existing drafts and current approved text. Bulk publication accepts IDs only, not client-supplied translations.
- The bulk review and progress UI follows the approved QDish emerald/warm-neutral palette and supports mobile widths without horizontal scrolling.
- No queue, progress database, additional AI SDK, or unrelated localization work is introduced.

---

## Task 1: Add safe bulk-generation semantics and bulk publication API

**Files:**
- Modify: `QR_FOOD_ORDER_BE/src/routes/menuRoutes.ts`
- Modify: `QR_FOOD_ORDER_BE/src/services/menuTranslationPolicy.ts` only if a pure promotion helper keeps the route simpler
- Modify: `QR_FOOD_ORDER_BE/src/tests/menuTranslationRoutes.test.ts` or create `QR_FOOD_ORDER_BE/src/tests/bulkMenuTranslationRoutes.test.ts`
- Modify: `QR_FOOD_ORDER_BE/package.json` only if a separate test command is added

**Interfaces:**
- Extend `POST /api/menu/:id/translations/draft` input with optional `{ preserveExisting?: boolean }`. When `true`, do not replace a locale draft or an approved value with status `APPROVED`; write a generated draft only when both are absent.
- Add `POST /api/menu/translations/bulk-publish` with input `{ itemIds: string[] }` and response `{ publishedCount: number; items: ManagedMenuItem[] }`.
- Bulk publication promotes each selected locale draft to `APPROVED`; it preserves a current approved value when that locale has no draft.
- The bulk route rejects invalid, duplicate, cross-restaurant, missing, or incomplete IDs before performing writes. An incomplete locale has neither a draft nor a current approved value.

- [ ] **Step 1: Add failing route coverage for preservation.** In the menu translation route test harness, seed an item with a current approved English translation and a hand-edited Chinese draft. POST with `{ preserveExisting: true }` and assert both values remain byte-for-byte unchanged while a missing locale receives a draft. Include a stale approved locale with no draft and assert it receives a replacement draft.
- [ ] **Step 2: Add failing bulk-publication route cases.** Assert owner success, unauthenticated 401, staff 403, cross-restaurant rejection, invalid/duplicate IDs rejection, incomplete-translation rejection without writes, preservation of an approved locale with no draft, promotion of drafts, and approved-only public output.
- [ ] **Step 3: Implement optional draft preservation.** Parse the optional boolean at the route boundary. Keep the existing behavior when false. When true, merge generated locale values into the current map only for locales without a draft and without a current approved value.
- [ ] **Step 4: Implement the collection publication route.** Register `POST /translations/bulk-publish`, validate and deduplicate the ID list, derive `restaurantId` from `req.auth`, fetch all requested items scoped to that restaurant, prevalidate both locales for every item, then promote drafts and clear only the drafts promoted.
- [ ] **Step 5: Return refreshed managed records and run the focused route test.** Serialize updated items through the existing managed serializer. Confirm public reads still hide draft/stale values and include only approved translations.

**Verification:** `npm run test:menu-translation-routes` (or the added bulk route command), then `npm run build` from `QR_FOOD_ORDER_BE`.

**Dependencies:** None.

**Estimated scope:** Medium.

---

## Task 2: Add frontend eligibility policy and typed service calls

**Files:**
- Create: `QR_FOOD_ORDER_FE/src/lib/bulkMenuTranslation.ts`
- Modify: `QR_FOOD_ORDER_FE/src/services/menuService.ts`
- Create: `QR_FOOD_ORDER_FE/tests/bulkMenuTranslation.test.ts`
- Modify: `QR_FOOD_ORDER_FE/package.json`

**Interfaces:**
- Export `planBulkMenuTranslations(items: MenuItem[])`, returning `stableItemIds`, `reviewItemIds`, and `generationItemIds`.
- Stable means English and Chinese are both approved with status `APPROVED` and neither locale has a draft.
- A locale needs AI generation when it has neither a draft nor an approved value with status `APPROVED`. A menu item needs one generation request when either locale needs AI generation.
- Export `isReadyForBulkTranslationPublish(item: MenuItem)`, true only when each locale has either a draft or an approved value with status `APPROVED`.
- Extend `menuService.generateTranslationDraft(id, options?: { preserveExisting?: boolean })` and add `menuService.bulkPublishTranslations(itemIds: string[])` returning normalized `MenuItem[]` plus `publishedCount`.

- [ ] **Step 1: Write focused policy cases.** Cover both locales stable, missing Chinese, stale English, an existing draft, one stable approval plus one pending draft, and publish readiness with a missing/stale locale.
- [ ] **Step 2: Register the pure policy test.** Add `test:bulk-menu-translation` and include it in the frontend `test:ci` command.
- [ ] **Step 3: Implement the classifier and readiness helper.** Read canonical frontend locale keys `en` and `zh-CN`; resolve an ID using `item.id || item._id` and ignore entries without an ID.
- [ ] **Step 4: Extend the generation service call.** Serialize `{ preserveExisting: true }` when requested; preserve the existing empty-body behavior for the single-item action.
- [ ] **Step 5: Add and type the bulk publication client.** POST only `{ itemIds }`, normalize every returned management record with the existing normalizer, and return the server count.
- [ ] **Step 6: Run the focused test, frontend lint on changed files, and frontend build.**

**Verification:** `npm run test:bulk-menu-translation`, `npx eslint src/lib/bulkMenuTranslation.ts src/services/menuService.ts`, and `npm run build` from `QR_FOOD_ORDER_FE`.

**Dependencies:** Task 1 defines the API response used by `menuService.bulkPublishTranslations`.

**Estimated scope:** Medium.

---

## Task 3: Build the mobile-first progress and review dialog

**Files:**
- Create: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/modals/BulkMenuTranslationDialog.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantMenuTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/tests/bulkMenuTranslation.test.ts` if the state policy needs additional pure cases

**Interfaces:**
- Dialog props: `open`, `onOpenChange`, `menuItems`, `onGenerate(itemId, { preserveExisting: true })`, `onPublish(itemIds)`, and `onSaveTranslation(itemId, locale, value, publish)`.
- Dialog state phases are `confirm`, `progress`, and `review`.
- Generation executes in a sequential `for...of` loop over `generationItemIds`; after every attempt it updates the completed count and that item's status. A catch records the error and proceeds to the next ID.
- The review list combines existing drafts, successfully generated items, and failed items. It selects publish-ready items by default. Failed or incomplete items are visible but cannot be selected.

- [ ] **Step 1: Add the bulk button and state in `RestaurantMenuTab`.** Keep the existing single-item translation action unchanged. Open the new dialog from a dedicated button beside the menu management actions.
- [ ] **Step 2: Implement confirmation and progress states.** Show request count, existing-draft count, stable/skipped count, then a labeled progress bar with `x/y`, numeric percent complete, current item name, and per-item waiting/running/done/failed state.
- [ ] **Step 3: Implement sequential generation and retry.** Call the supplied generation callback one item at a time. Save successful returned `MenuItem` records into local results and the parent menu state. Catch each item's error without aborting the loop. Retry only IDs marked failed.
- [ ] **Step 4: Implement the review state.** Render source Vietnamese, English and Chinese values, locale badges, a checkbox for publish-ready items, and the selected count. Add an edit action that opens the existing `TranslationEditorDialog` for that item and refreshes the preview when it closes.
- [ ] **Step 5: Keep the main action reachable on mobile.** Use stacked cards, a scrollable list, a sticky bottom publish bar with safe-area padding, and no fixed-width table. Disable publish while an edit or publish request is active.
- [ ] **Step 6: Add loading and completion feedback.** Announce progress updates through a polite live region. On completion show successful, skipped, and failed counts. On publication failure refresh management items and display the actual current states.
- [ ] **Step 7: Run frontend build and lint on the dialog and menu tab.**

**Verification:** At a 375px viewport, confirm no horizontal scroll, progress remains visible while the list scrolls, and the publish action remains reachable. At desktop width, confirm the dialog stays within the existing dashboard design system.

**Dependencies:** Task 2.

**Estimated scope:** Large; complete each numbered step and re-run focused checks before continuing.

---

## Task 4: Wire server responses and verify the complete flow

**Files:**
- Modify: `QR_FOOD_ORDER_FE/src/pages/Dashboard.tsx`
- Modify: `QR_FOOD_ORDER_FE/src/components/dashboard/restaurant/RestaurantMenuTab.tsx`
- Modify: `QR_FOOD_ORDER_FE/tests/multilingual-qr-menu.spec.ts`
- Modify: existing frontend multilingual Playwright configuration or CI workflow only if the current command does not discover the new scenario

**Interfaces:**
- `Dashboard` generation callback calls `menuService.generateTranslationDraft(id, { preserveExisting: true })` for bulk requests and updates `menuItems` by stable ID.
- `Dashboard` publication callback calls `menuService.bulkPublishTranslations(ids)`, merges the returned normalized records into `menuItems`, and returns `publishedCount`.

- [ ] **Step 1: Add the Dashboard callbacks.** Keep the single-item generation callback's default behavior. Add the bulk publication callback and update only matching menu entries by `id || _id`.
- [ ] **Step 2: Add a mocked browser scenario.** Mock three menu items: one fully translated stable item, one item requiring generation, and one item whose AI request fails. Verify stable skip, visible progress, continuation after failure, review text, retry, unselecting a ready row, and one bulk-publish request with the selected IDs.
- [ ] **Step 3: Verify approved-only guest visibility in the mocked flow.** After bulk publish, return updated management rows and assert the dashboard state changes. Assert no generation request is made by the guest menu and only approved translations are displayed.
- [ ] **Step 4: Run the focused browser scenario and all applicable local CI checks.** Run encoding check, lint, frontend unit/policy tests, multilingual E2E, and build. Run backend focused tests and build after Task 1.
- [ ] **Step 5: Review the final FE/BE diff.** Confirm no provider secret enters the browser, generated drafts remain private, every management query uses authenticated restaurant scope, and unavailable menu items are included in bulk management.

**Verification:** Existing multilingual Playwright command plus focused FE/BE commands; `npm run check:encoding`, `npm run lint`, and `npm run build` from FE; backend `npm run test:ci` and `npm run build` when authorized to run the full suite.

**Dependencies:** Tasks 1–3.

**Estimated scope:** Medium.

---

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Sequential model calls make large menus take time. | High | Show per-item progress/current name and continue after failures; no fake ETA. |
| Draft preservation logic has locale-level edge cases. | Medium | Test current approved, stale approved, existing draft, and missing locale separately. |
| Menu changes while the dialog is open. | Medium | Before publish, server re-reads and validates every selected ID and translation state; refresh management state after API errors. |
| Partial database persistence after a bulk write error. | Medium | Refresh actual states after error and report which records are already published; retry only records with drafts remaining. |

## Checkpoint: Design and plan review

- [ ] User reviews this plan and the associated design addendum.
- [ ] User approves implementation before source changes begin.
- [ ] After implementation, applicable local build/lint/test checks pass; hosted CI remains unverified until an authorized push.
