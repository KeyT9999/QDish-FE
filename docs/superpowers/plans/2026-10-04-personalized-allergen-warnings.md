# Personalized Allergen Warnings Implementation Plan

> **For agentic workers:** Execute this plan inline, task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show customer-facing allergen warnings only when relevant to the customer's disclosed allergies, while retaining a fail-safe unknown warning for customers who disclosed allergies when dish data is incomplete.

**Architecture:** Keep the behavior in the existing frontend `getMenuAllergenWarning` policy, which already normalizes allergen codes and compares candidate, confirmed, and cross-contact lists. Hide the detail warning section for unreviewed dishes when the customer has no disclosed allergies. Keep order and bill serialization unchanged so staff still receive the disclosure and unknown/conflict snapshot.

**Tech Stack:** React, TypeScript, Vite, Node built-in assertions, Playwright.

## Global Constraints

- Change frontend customer presentation only; do not change backend allergen review, order, or bill logic.
- Match normalized allergen codes and aliases; do not compare ingredient names with raw substring matching.
- For a customer with no selected allergens, an unreviewed dish returns no per-item warning.
- For a customer with selected allergens, candidate overlap remains a conflict; incomplete data without a candidate overlap remains UNKNOWN and asks the customer to consult staff.
- A fully reviewed dish warns only for confirmed contains or may-contain overlap; ordering remains available.

---

### Task 1: Personalize the shared allergen-warning policy

**Files:**
- Modify: `src/services/allergenPresentation.ts`
- Test: `tests/allergenPresentation.test.ts`

**Interfaces:**
- Preserve `getMenuAllergenWarning(item, reportedAllergies)` and its existing warning union.
- Empty normalized `reportedAllergies` yields `{ kind: 'NONE' }` for customer warnings, including unreviewed dishes.
- Non-empty `reportedAllergies` preserves candidate conflict and fail-safe UNKNOWN behavior.

- [x] **Step 1: Add failing policy assertions**

Add assertions proving that unreviewed dishes with empty or populated candidate data return `{ kind: 'NONE' }` when no allergies were reported. Add an assertion that the same unreviewed dish returns UNKNOWN when allergies were reported but candidate data cannot confirm a match. Keep existing candidate-overlap, confirmed-contains, and cross-contact assertions.

- [x] **Step 2: Run the focused test and confirm RED**

Run: `npm run test:allergen-presentation`

Expected: the new empty-allergy assertions fail because the current policy returns UNKNOWN for every unreviewed dish.

- [x] **Step 3: Make the smallest policy change**

After deriving the normalized reported allergen set, return `{ kind: 'NONE' }` when it is empty. Leave reviewed matching, candidate matching, normalization, and all backend snapshot logic unchanged.

- [x] **Step 4: Run the focused test and confirm GREEN**

Run: `npm run test:allergen-presentation`

Expected: all allergen-presentation assertions pass.

### Task 2: Hide non-personalized UNKNOWN detail notices

**Files:**
- Modify: `src/components/menu/MenuItemDetail.tsx`
- Test: `tests/qr-allergen-order-warning.spec.ts`

**Interfaces:**
- Keep reviewed allergen facts visible in item details.
- Render the unreviewed candidate section only when the customer has disclosed at least one allergy and a candidate exists. Keep the actual warning once in the sticky action area; a dish without candidate data only needs the caution there.
- Retain card, cart, summary, and order behavior through the shared policy from Task 1.

- [x] **Step 1: Extend the QR allergen browser regression**

Add a no-allergy guest case asserting that unreviewed dishes do not show the generic `Chưa xác minh dị ứng` card badge, the repeated UNKNOWN callout, or an unverified-only menu summary. Retain the existing declared-tree-nut flow asserting candidate-match and UNKNOWN notices, cart disclosure, and order submission. The focused policy test from Task 1 provides the failing test before implementation.

- [x] **Step 2: Gate the detail safety section by disclosure relevance**

Keep the section visible for valid reviewed declarations. For an unreviewed declaration, require a customer warning from the shared policy and a candidate before showing the candidate list. Keep UNKNOWN or conflict copy once in the sticky action area. Do not remove verified allergen facts and do not alter the add-to-cart action.

- [x] **Step 3: Run the allergen browser test and confirm GREEN**

Run: `npm run test:e2e:allergen`

Expected: the no-allergy and declared-allergy customer flows both pass.

### Task 3: Verify frontend gates and review the final diff

**Files:**
- Verify: `.github/workflows/ci.yml`, `package.json`, and all changed files above.

- [x] Run `npm ci` to validate the lockfile and install exactly what CI installs.
- [x] Run `npm run check:encoding`.
- [x] Run `npm run lint` and confirm there are no lint errors.
- [x] Run `npm run test:ci`.
- [x] Run `npm run test:e2e:owner-insights`, `npm run test:e2e:owner-sidebar`, and `npm run test:e2e:order-status`.
- [x] Run `npm run test:e2e:allergen`.
- [x] Run `npm run build`.
- [x] Run `npm audit --omit=dev --audit-level=high`, matching the CI advisory step. Existing production dependency advisories are reported; CI marks this step `continue-on-error`.
- [x] Run `git diff --check` and inspect the complete diff for accidental backend, order, bill, or unrelated changes.
- [x] Commit the verified frontend change and plan with a conventional commit message.
