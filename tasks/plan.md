# Implementation Plan: Fix Owner Sidebar Navigation Race

## Overview

Fix the owner dashboard navigation race where a sidebar click updates the URL to `/owner?tab=overview` (or another workspace tab) but the page remains on the owner home screen until a full reload. The root cause is duplicated restaurant-selection state and duplicated owner-restaurant requests between `DashboardLayout` and `OwnerDashboard`.

## Verified Root Cause

1. `DashboardLayout` derives `selectedRestId` directly from `localStorage` and independently calls `ownerRestaurantService.getMyRestaurants()` (`src/components/layout/DashboardLayout.tsx:45-73`).
2. `OwnerDashboard` initializes its own React state once from `localStorage` (`src/pages/OwnerDashboard.tsx:59`) and independently calls the same owner restaurant API (`src/pages/OwnerDashboard.tsx:141-169`).
3. The two requests can resolve in either order. If the layout request writes `selected_restaurant_id` first, `OwnerDashboard` sees a valid stored selection but does not call `setSelectedRestId` because its state is still empty (`src/pages/OwnerDashboard.tsx:147-163`).
4. The sidebar reads the newly written storage value and exposes workspace tabs, while `OwnerDashboard` still has `selectedRestId === ''`. Its render gate therefore falls through to the owner home (`src/pages/OwnerDashboard.tsx:369-370`).
5. `DashboardLayout.handleTabClick` correctly updates the query string (`src/components/layout/DashboardLayout.tsx:148-162`), so the URL changes while the content gate remains false. Reloading recreates `OwnerDashboard` and initializes its state from storage, which explains why reload appears to fix the issue.

## Evidence

The race was reproduced with delayed API responses:

- URL after click: `/owner?tab=overview`
- Storage: `selected_restaurant_id` was set
- Visible content: owner home greeting remained visible
- Dashboard content: not rendered
- Requests: active restaurants, archived restaurants, and layout restaurant lookup ran concurrently

## Architecture Decision

Use one reactive owner-workspace selection source of truth. The preferred implementation is an `OwnerWorkspaceProvider`/hook mounted above the outlet, exposing:

- `restaurants`
- `selectedRestId`
- `selectionStatus: 'loading' | 'ready' | 'empty' | 'error'`
- `selectRestaurant(id)`
- `refreshRestaurants()`

Both `DashboardLayout` and `OwnerDashboard` consume this state. They must not independently infer selection from `localStorage`. Consolidating the owner restaurant list fetches is tracked as a follow-up after the navigation hotfix.

Keep the existing `/owner?tab=...` URL contract so bookmarks, notifications, and existing links remain compatible.

## Implemented scope

The shipped fix centralizes the reactive `selectedRestId` and readiness state in `OwnerWorkspaceProvider`, while preserving the existing restaurant list loaders to keep branch-management behavior low-risk. Both concurrent responses now resolve into the same state, so sidebar visibility and owner content cannot diverge. Consolidating the remaining duplicate list requests is a separate follow-up optimization, not a prerequisite for this navigation fix.

## Ordered Tasks

### Phase 1: Model and regression test

#### Task 1: Extract deterministic restaurant-selection resolver

**Acceptance criteria:**

- A pure helper resolves the selected ID from active restaurants and a stored candidate.
- A valid candidate is preserved.
- An invalid or missing candidate falls back to the first active restaurant.
- No active restaurant resolves to `null`/empty without throwing.

**Verification:**

- Add focused unit tests for valid, missing, invalid, and empty lists.

**Dependencies:** None

**Estimated scope:** Small

#### Task 2: Add a failing owner navigation regression test

**Acceptance criteria:**

- Start with an authenticated owner and no selected restaurant in storage.
- Delay the owner page request so the layout request wins the race.
- Click `Tổng quan`, `Phân tích thực đơn`, `Đơn hàng`, and `Thực đơn` without reloading.
- Assert URL, active sidebar item, and destination content all change together.
- Add the reverse response-order case to prove the fix is order-independent.

**Verification:**

- Test fails on the current implementation with URL changed but owner home still visible.

**Dependencies:** Task 1

**Estimated scope:** Medium

### Checkpoint: Reproduction

- [ ] The regression test fails before the implementation change.
- [ ] The test captures the response-order race rather than only testing a preselected branch.

### Phase 2: Single source of truth

#### Task 3: Implement owner workspace provider/hook

**Acceptance criteria:**

- The selected restaurant is resolved once and published reactively to consumers.
- Layout and owner page no longer maintain separate React selection state.
- Storage is updated only after the resolved selection is known.
- Loading and empty selection states are explicit.

**Verification:**

- Unit-test the resolver and selection transitions.
- Verify only one active-list request is made for the owner workspace.

**Dependencies:** Task 1

**Estimated scope:** Medium

#### Task 4: Make sidebar navigation depend on workspace readiness

**Acceptance criteria:**

- Sidebar does not expose restaurant-management tabs as ready before workspace selection is resolved.
- Once ready, clicking a tab updates the query parameter and destination content in the same render flow.
- Mobile drawer closes after navigation.
- Existing role-specific routes continue to work for admin, staff, and super-admin users.

**Verification:**

- Test fresh owner login, direct deep links, and mobile navigation.

**Dependencies:** Task 3

**Estimated scope:** Medium

#### Task 5: Remove the OwnerDashboard render race

**Acceptance criteria:**

- `OwnerDashboard` consumes the shared `selectedRestId` and readiness state.
- While selection is loading, it renders a workspace loading state instead of silently showing owner home for a requested workspace tab.
- When selection is ready, all workspace tabs render without reload.
- When there are no active restaurants, owner home/create-branch remains the correct destination.

**Verification:**

- Run the regression test from Task 2.
- Verify direct `/owner?tab=overview` and `/owner?tab=insights` navigation.

**Dependencies:** Task 3

**Estimated scope:** Medium

### Checkpoint: Core navigation

- [ ] Race regression passes with both response orders.
- [ ] URL, sidebar active state, and rendered content remain synchronized.
- [ ] No full-page reload is required for tab navigation.

### Phase 3: Hardening and verification

#### Task 6: Normalize and preserve tab query state

**Acceptance criteria:**

- Unsupported owner tab values normalize to `owner-home` or a safe workspace default using `replace: true`.
- Existing query parameters such as `view=archived` are preserved when appropriate.
- Dashboard tab transitions do not erase unrelated query parameters accidentally.

**Verification:**

- Test invalid tabs, browser back/forward, direct links, and refresh.

**Dependencies:** Task 5

**Estimated scope:** Small

#### Task 7: Remove reload-based selection switching where safe

**Acceptance criteria:**

- Selecting another branch updates shared state and navigates to a deterministic tab without `window.location.reload()`.
- Realtime/data loaders receive the new restaurant ID after selection changes.
- If a full reload remains necessary for a separate socket lifecycle, document and isolate that behavior from tab navigation.

**Verification:**

- Switch branches and verify sidebar, restaurant name, URL, and content all update.

**Dependencies:** Task 3, Task 5

**Estimated scope:** Medium

#### Task 8: Run the complete verification gate

**Acceptance criteria:**

- Focused navigation tests pass.
- Typecheck, lint, unit tests, build, and browser tests pass.
- No new runtime errors or page overflow are introduced.

**Verification commands:**

- `npm run check:encoding`
- `npm run test:ci`
- `npm run lint`
- `npx tsc -b --pretty false`
- `npm run build`
- Owner navigation Playwright suite at supported viewports

**Dependencies:** Tasks 1-7

**Estimated scope:** Small

## Minimal Hotfix Option

If an immediate low-risk patch is needed before the provider refactor, change `OwnerDashboard.loadRestaurants` so it always calls `setSelectedRestId(resolvedId)` when the stored ID is valid, not only when storage is empty or invalid. Also add an explicit loading gate before rendering owner home for a requested workspace tab. This addresses the observed race but leaves duplicate fetching and duplicated selection ownership in place; it should be followed by Tasks 3-5.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Moving selection state changes owner branch behavior | High | Preserve the existing storage key and URL contract; cover branch switching in E2E tests |
| Duplicate requests remain during migration | Medium | Keep the provider as the only owner-list loader and remove child fetches after consumers migrate |
| Direct deep links render the wrong fallback | Medium | Add explicit tab normalization and a loading/empty state |
| Realtime sockets retain the previous restaurant | High | Reconnect or update the socket subscription after the shared selected ID changes; test branch switching |
| Existing role routes regress | Medium | Run role-specific navigation smoke tests for owner, admin, staff, and super-admin |

## Definition of Done

- Fresh owner login can navigate from Trang chủ to every sidebar workspace without reload.
- URL, active sidebar state, and content are synchronized.
- Response ordering no longer changes the rendered destination.
- No duplicate reactive owner-selection source of truth remains.
- Regression, unit, typecheck, lint, build, and browser checks pass.
