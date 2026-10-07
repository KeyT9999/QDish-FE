# Bulk AI Translation for Menu Items — Design Addendum

**Status:** Approved
**Date:** 2026-10-07
**Related design:** `2026-10-07-multilingual-qr-menu-design.md`

## Goal

Let a restaurant owner or admin create English and Simplified Chinese drafts for menu items in one flow, follow progress, review the resulting text, and publish selected ready items with one action.

## Scope

- Include every dish returned by the authenticated menu management read, including dishes currently marked unavailable.
- Generate English and Simplified Chinese text for dish names and descriptions. Category names, prices, availability, ingredients, allergens, and nutrition are outside this flow.
- Keep Vietnamese as the source language and keep customer-facing content on approved translations only.

## Product decisions

1. Treat an item as fully translated when both English and Chinese have approved values with status `APPROVED` and neither locale has a pending draft. Fully translated items are counted as skipped.
2. An item with an existing draft is included in the review list. Existing drafts are kept. The AI only creates drafts for locales that have neither a current approved value nor a draft.
3. Generate sequentially, one menu item at a time, through the existing per-item AI route. Each successful response is persisted immediately. The UI reports attempted items as `x/y` and names the item currently being processed.
4. A failed item does not stop the run. Show its error in the result list and provide a retry action. The final summary reports completed and failed counts.
5. Show the Vietnamese source, English draft/approved value, Chinese draft/approved value, and each locale's state in the review list. Reuse the existing translation editor to change an item's draft before publication.
6. Select publish-ready items by default. Let the owner/admin unselect any item before publishing. A row is ready when each locale either has a draft to promote or already has a current approved value.
7. Publish the selected IDs in one authenticated API request. The server derives restaurant scope from authentication, verifies every item and both locale states before writing, promotes draft values, preserves current approved values where there is no draft, and returns updated management records.
8. On a database error during publication, reload the management list and report the persisted state before offering another attempt. The product contract promises one user action and one API request; it does not promise a multi-document Mongo transaction.
9. If the user reloads or leaves during generation, completed item drafts remain saved. The UI does not persist an in-memory job or progress counter; reopening the bulk flow recomputes stable, pending, and missing translations from the saved menu state.
10. Confirm the number of dishes that will call the AI before starting. Each AI request translates one dish into both target languages. The UI keeps the approved QDish emerald and warm-neutral visual system and uses mobile-friendly cards with a persistent review action area.

## User flow

1. The owner/admin opens the restaurant's menu tab and chooses **Dịch menu hàng loạt**.
2. The confirmation state shows the number of AI requests, the number of existing drafts that can go directly to review, and the number of fully translated items that will be skipped.
3. After starting, the dialog shows a progress bar, `x/y` attempts, numeric percent complete, the current dish name, and a per-item result state. Requests run sequentially. Failures are recorded and the next dish starts.
4. When the attempt queue finishes, the dialog presents the review list. Existing drafts and successfully generated drafts appear together. Failed items remain visible with retry controls. The stable translated count remains available in the summary.
5. The owner/admin can inspect text, open the existing translation editor for a row, and select or unselect publish-ready rows. Failed or incomplete rows cannot be selected until both locales are publish-ready.
6. One **Duyệt & hiển thị N món** action sends selected IDs to the bulk publication API. On success, the menu management list updates and a completion toast reports the number of dishes published. Public reads continue to expose only approved values.

## API contract

### Preserve existing values during bulk generation

Extend `POST /api/menu/:id/translations/draft` with an optional request field:

```json
{ "preserveExisting": true }
```

When omitted or `false`, retain current single-item behavior and write generated English and Chinese drafts. When `true`, validate the generated result as usual, then write a draft only for each locale that has no draft and no approved value with status `APPROVED`. Preserve existing drafts and current approved values. A stale approved value with no draft receives a new draft. Return the normal managed menu-item response.

### Publish multiple menu items

Add `POST /api/menu/translations/bulk-publish`, protected by the same owner/admin middleware as single-item translation management.

Request:

```json
{ "itemIds": ["<menu-item-id>", "<menu-item-id>"] }
```

The server validates that `itemIds` is a non-empty array of unique valid Mongo IDs. It queries only items owned by the authenticated restaurant. If any ID is missing, cross-restaurant, or has an English/Chinese locale with neither a draft nor an approved `APPROVED` value, reject the entire request before starting writes and return a stable error code plus affected IDs. Never accept translated text or a restaurant ID from the request body.

For each valid selected item, promote each available locale draft to `approved: { value: draft.value, status: "APPROVED" }` and clear that locale draft. Preserve a current approved locale when it has no draft. Return:

```json
{ "publishedCount": 3, "items": [/* updated managed menu items */] }
```

### Public visibility

No public route contract changes. Public menu serialization continues to return only approved values whose status is `APPROVED`; drafts and stale values remain private.

## Frontend structure

- Add a **Dịch menu hàng loạt** action to `RestaurantMenuTab`.
- Add a focused `BulkMenuTranslationDialog` with three states: confirmation, progress, and review.
- Add a pure translation planning helper that classifies menu items as stable/skipped, reviewable, or needing an AI request, and determines whether an item is ready for bulk publication.
- Extend `menuService.generateTranslationDraft` with an optional `preserveExisting` flag and add `menuService.bulkPublishTranslations(itemIds)`.
- Wire generation and bulk publication through `Dashboard` so each response updates the existing `menuItems` state and the review cards.
- Use stable menu item IDs as React keys. Keep progress text accessible through a live status region, label the progress bar, and make review controls usable at mobile and desktop widths.

## Error handling and security

- Keep the xKiro key backend-only. Use the existing generation service and response validation.
- Reuse the existing authenticated restaurant scope. Do not trust body-supplied restaurant IDs.
- Persist each item's draft only after both model output values pass validation; preserve current approved values and existing drafts under `preserveExisting`.
- Continue the batch after an individual AI failure and allow retry of failed items without re-running successful items.
- Before bulk publication, validate the complete selected set before any writes. On write failure, refresh management state and show the actual result.
- Do not expose draft or stale values through public endpoints. Do not alter order payloads or Vietnamese staff/kitchen names.

## Acceptance criteria

- The menu tab shows the bulk translation action for an authenticated restaurant owner/admin.
- The confirmation reports AI-request, existing-draft, and fully translated/skipped counts before any model calls begin.
- Every eligible dish is processed sequentially, including unavailable dishes; progress increments after each attempt, shows `x/y` and numeric percent complete, and identifies the current dish.
- Stable fully translated dishes are skipped. Existing drafts and current approved values survive bulk generation.
- An individual generation error does not stop later items; failed items can be retried and the completion message reports counts.
- The result list displays Vietnamese, English, and Chinese text with status per locale and supports editing through the existing editor.
- Only rows whose two locales will be approved after publication are selectable. Ready rows are selected by default and can be unselected.
- One bulk action publishes selected dishes through one protected request. Cross-restaurant IDs and incomplete translations are rejected before writes.
- After publication, the dashboard reflects the new state and public menu reads expose the approved English/Chinese values only.
- Mobile review uses readable item cards and keeps the bulk publish action reachable without horizontal scrolling.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| A long menu requires many model calls and may hit provider limits. | Run sequentially, show live progress, continue after failures, and provide item-level retry. |
| Re-running generation could erase an edited draft. | Use `preserveExisting: true` for bulk requests and test that drafts remain unchanged. |
| A failed or incomplete translation could be published. | Disable selection until both locale states are publish-ready and validate the whole set on the backend. |
| The browser closes during a batch. | Save each completed draft immediately; recompute remaining work from saved translation state when the user reopens the flow. |
| A bulk database write fails after the user clicks publish. | Refresh management state, show actual published items, and only offer retry for remaining drafts. |

## Out of scope

- Server-side background jobs, SSE, or persisted job progress.
- Bulk category translation.
- Parallel AI requests or one prompt containing the entire menu.
- Automatic publication of generated text.
- Automatic translation of fields other than dish name and description.
