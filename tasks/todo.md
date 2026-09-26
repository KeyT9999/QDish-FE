# Owner Sidebar Navigation Fix

## Delivered

- [x] Extract and test deterministic restaurant-selection resolver.
- [x] Add a failing E2E regression for fresh owner login and delayed restaurant responses.
- [x] Implement one reactive owner-workspace selection source of truth.
- [x] Update `DashboardLayout` to consume shared selection state.
- [x] Update `OwnerDashboard` to remove the stale render gate.
- [x] Add the owner sidebar regression to the frontend CI workflow.
- [x] Run full local verification and code review.

## Follow-up

- [ ] Consolidate the remaining duplicate owner restaurant list requests.
- [ ] Remove full-page reloads from branch switching after realtime tenant rehydration is isolated.
- [ ] Add branch-switching and browser back/forward coverage.
