# Owner tables UI redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove owner tables-tab overflow and improve status scanning and action ergonomics across desktop, tablet, and mobile.

**Architecture:** Keep the existing `RestaurantTablesTab` container and callbacks. Render a compact table for widths at least `1024px`, and a card layout below that breakpoint. Add pure status-summary helpers only if needed, keeping data fetching and billing behavior unchanged.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, existing shadcn-style primitives, `lucide-react`, Playwright for browser verification.

## Global Constraints

- Do not change backend APIs, URL routes, callback signatures, or billing modal behavior.
- Do not add dependencies.
- The component must remain keyboard accessible and use at least `44px` touch targets in compact layouts.
- Verify at `320px`, `768px`, `1024px`, and `1440px`.
- Keep the existing neutral and emerald visual language.

### Task 1: Add the layout regression test

**Files:**
- Create: `tests/owner-tables-layout.spec.ts`
- Inspect: `src/components/dashboard/restaurant/RestaurantTablesTab.tsx`

**Interfaces:**
- Consumes: the running Vite app at `/owner?tab=tables` and the existing test authentication setup if available.
- Produces: a browser assertion that the rendered document does not exceed the viewport and that compact action controls remain visible.

- [ ] **Step 1: Write the failing browser test**

  Add a Playwright test that visits the owner tables route, checks `document.documentElement.scrollWidth <= window.innerWidth`, and checks the compact table-card action region at a mobile viewport. Reuse the repository's existing setup instead of adding authentication fixtures.

- [ ] **Step 2: Run the focused test**

  Run `npx playwright test tests/owner-tables-layout.spec.ts`.

  Expected: the current implementation demonstrates the overflow or fails to find the compact layout at the target breakpoint.

### Task 2: Implement the responsive tables redesign

**Files:**
- Modify: `src/components/dashboard/restaurant/RestaurantTablesTab.tsx`

**Interfaces:**
- Consumes: existing `RestaurantTable`, `TableStatus`, billing callbacks, and `useIsMobile`.
- Produces: a responsive tables surface with compact actions and a status summary.

- [ ] **Step 1: Add compact-breakpoint status and summary data**

  Use `useIsMobile(1024)` for the compact layout decision. Derive vacant, occupied, and payment-pending counts from the existing `tables` prop without changing the API.

- [ ] **Step 2: Replace the compact action row with a two-column grid**

  Make QR the full-width action and place view-bill and payment actions in two equal columns when a session exists. Keep each compact button at `min-h-11` and ensure long labels can shrink without clipping.

- [ ] **Step 3: Add the status summary strip**

  Render three small summary items above the list with text and icons. Use semantic labels and preserve the single emerald accent.

- [ ] **Step 4: Make the desktop table fit its content**

  Replace the fixed oversized action group with one visible QR button and a compact secondary-actions menu. Apply `min-w-0` and `truncate` to the URL and session cells. Keep the card wrapper `overflow-hidden` so no child can create a page-level scrollbar.

- [ ] **Step 5: Run the TypeScript build**

  Run `npm run build`.

  Expected: exit code `0`.

### Task 3: Verify and review the rendered UI

**Files:**
- Modify: none unless verification reveals a defect.

**Interfaces:**
- Consumes: the implementation from Task 2.
- Produces: verified responsive behavior and a clean browser console.

- [ ] **Step 1: Run the focused browser test**

  Run `npx playwright test tests/owner-tables-layout.spec.ts`.

- [ ] **Step 2: Run the full project checks**

  Run `npm run lint` and `npm run build`.

- [ ] **Step 3: Inspect screenshots at all target widths**

  Verify `320px`, `768px`, `1024px`, and `1440px`. Confirm no horizontal page overflow, readable labels, visible focus states, and working QR, bill, and payment controls.

- [ ] **Step 4: Review the final diff**

  Run `git diff --check` and `git status --short`. Confirm only the planned tables component, focused test, and plan/spec files changed.
