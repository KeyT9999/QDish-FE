# Bulk Saved Draft Preview Implementation Plan

> **For agentic workers:** Execute this plan inline in the current session. The user approved the design and requested implementation.

**Goal:** Let restaurant owners inspect saved menu translation drafts before starting AI translation for the remaining items.

**Architecture:** Extend `BulkMenuTranslationDialog` with a `saved-drafts` review scope derived from the current menu item state. The confirmation view opens that scope without calling the AI; the review view displays only items with saved drafts and offers a return action to continue the original confirmation flow. No API or persistence changes are needed.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React.

## Global Constraints

- Keep the bulk generation flow sequential and preserve its existing draft and publication behavior.
- The saved-draft preview must not invoke `onGenerate`.
- Keep the QDish emerald and neutral palette and mobile-friendly card list.
- Keep unrelated in-progress repository changes intact.

---

### Task 1: Add a saved-draft review scope

**Files:**
- Modify: `src/components/dashboard/restaurant/modals/BulkMenuTranslationDialog.tsx`

**Interfaces:**
- Reuse `hasDraft(item)` and `isReadyForBulkTranslationPublish(item)`; do not add API methods.
- Add local review scope state: `'all' | 'saved-drafts'`.

- [x] Derive `savedDraftItems` from `reviewItems.filter(hasDraft)` and derive `visibleReviewItems` from the active review scope.
- [x] Calculate publish-ready IDs from `visibleReviewItems` so selection and the publish count match the list currently shown.
- [x] Add an `openSavedDrafts` handler that switches to the saved-draft scope, preselects only publish-ready saved drafts, and enters review without calling `runGeneration`.
- [x] Reset the review scope to `all` after an AI generation run so the normal result list still includes successes and failures.
- [x] Show a review header status that says how many saved drafts are being viewed instead of reporting a generation completion summary.

### Task 2: Add visible preview and return actions

**Files:**
- Modify: `src/components/dashboard/restaurant/modals/BulkMenuTranslationDialog.tsx`

- [x] When saved drafts exist, show an outlined **Xem N bản nháp đã lưu** button on the confirmation screen.
- [x] Render `visibleReviewItems` in the existing mobile-friendly review cards.
- [x] In saved-draft scope, show **Quay lại** to return to confirmation, allowing the owner to start the remaining AI requests afterward.
- [x] Keep editing and bulk publication available for saved drafts that are complete in both target languages.

### Task 3: Compile the frontend

**Files:**
- No additional files.

- [x] Run `npm run build` from `QR_FOOD_ORDER_FE` and resolve any TypeScript or bundler errors caused by this change.

## Acceptance Criteria

- The confirmation screen exposes a secondary action only when at least one saved draft exists.
- Opening the preview makes zero AI requests and shows only saved-draft items.
- Incomplete drafts remain editable but cannot be published until both locales are ready.
- Returning from preview restores the confirmation screen and its **Bắt đầu dịch N món** action.
- The regular post-generation review still shows every review item, including failures.
