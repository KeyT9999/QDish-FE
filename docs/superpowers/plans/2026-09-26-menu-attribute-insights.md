# Menu Attribute Insights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the owner “Thuộc tính thực đơn” insight into an understandable, responsive dashboard section without changing the backend contract.

**Architecture:** Add a pure presentation model for the backend attribute keys, group/sort those entries for the UI, and render the model in `MenuAttributesPanel`. Pass the existing `menuCoverage` payload from `MerchantInsightsTab`. Keep all copy honest about the fact that counts are menu-item tags, not sales.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react, Playwright, Node native strip-types tests.

## Global Constraints

- Work directly on `main` because the user explicitly authorized direct push.
- Use existing CSS/Tailwind primitives; do not add chart dependencies.
- Preserve the current `MerchantInsightsPayload` API and empty/loading states.
- Use Vietnamese labels for every known backend attribute, with a readable fallback for future keys.
- Do not claim demand, revenue, or customer preference from menu attribute counts.

---

## Task 1: Add presentation model tests first

**Files:**
- Create: `tests/menuAttributePresentation.test.ts`
- Create: `src/components/dashboard/restaurant/merchant-insights/menuAttributePresentation.ts`
- Modify: `package.json`

- [x] Add tests for all three groups, localized labels, descending sort, unknown-key fallback, and empty groups.
- [x] Add `test:menu-attribute-presentation` and include it in `test:ci`.
- [x] Run `npm run test:menu-attribute-presentation` and confirm it fails because the presentation module is not implemented yet.

## Task 2: Implement the attribute presentation model

**Files:**
- Create: `src/components/dashboard/restaurant/merchant-insights/menuAttributePresentation.ts`

- [x] Define metadata for every attribute emitted by backend rules: label, description, group, bar color, and optional threshold copy.
- [x] Keep all labels human-readable, including `HIGH_FIBER`, `LATE_NIGHT_FIT`, `SOCIAL_SHARING`, and `FAMILY_MEAL`.
- [x] Implement readable fallback labels for unknown future keys without exposing raw underscore keys as the primary UI label.
- [x] Implement `groupMenuAttributes` to ignore zero/negative counts, keep all known groups, and sort each group by count descending then label ascending.
- [x] Re-run the focused test until it passes.

## Task 3: Build the redesigned panel

**Files:**
- Modify: `src/components/dashboard/restaurant/merchant-insights/MenuAttributesPanel.tsx`
- Modify: `src/components/dashboard/restaurant/MerchantInsightsTab.tsx`

- [x] Replace the chip-only panel with title, explanatory copy, three KPI cards, grouped horizontal bars, and the insight callout.
- [x] Use accessible list/group semantics and accessible labels for each bar.
- [x] Show counts and relative bar widths without implying percentages or summing groups.
- [x] Add the explicit data interpretation note and preserve the existing Recipe empty state.
- [x] Pass `insights.menuCoverage` into `MenuAttributesPanel`.
- [x] Keep responsive behavior single-column below the medium breakpoint and support reduced motion.

## Task 4: Add browser regression coverage

**Files:**
- Modify: `tests/owner-insights-navigation.spec.ts`

- [x] Add a test that opens “Thuộc tính thực đơn” and verifies the new heading, explanation, KPI labels, group headings, localized labels, and absence of the raw `HIGH_FIBER` key.
- [x] Update the empty-state test to assert the new panel’s empty-state copy and KPI context.
- [x] Run `npm run test:e2e:owner-insights` at desktop and mobile viewports.

## Task 5: Verify and ship

- [x] Run `npm run check:encoding`.
- [x] Run `npm run lint`.
- [x] Run `npm run test:ci`.
- [x] Run `npm run test:e2e:owner-insights`, `npm run test:e2e:owner-sidebar`, and `npm run test:e2e:order-status`.
- [x] Run `npm run build` and `git diff --check`.
- [x] Review the final diff for accessibility, responsive layout, and data semantics.
- [ ] Commit with a conventional message and push directly to `origin/main` (blocked by the repository's pull-request-only rule).
- [ ] Inspect GitHub Actions for the pushed SHA and report hosted CI/deployment status accurately.
