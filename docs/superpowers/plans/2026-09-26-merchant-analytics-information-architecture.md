# Merchant Analytics Information Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phân bố toàn bộ số liệu nhà hàng vào đúng tab nghiệp vụ và bổ sung recommendation layer trong Insights mà không thay đổi backend.

**Architecture:** `Dashboard.tsx` giữ stats period/data dùng chung cho các tab vận hành. Các summary presentation components nhận dữ liệu qua props, còn recommendation và chart adapters là pure functions. Customer insights được tải cục bộ trong tab CRM vì tab đó đã sở hữu server state danh sách khách hàng.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Recharts 3, Lucide React, Playwright, Node `--experimental-strip-types` tests.

## Global Constraints

- Không thêm dependency mới.
- Không thay đổi backend endpoint/schema.
- Không tạo số liệu giả ở frontend.
- Giữ emerald/slate/neutral và radius/spacing hiện có.
- Mọi summary có loading, empty, error hoặc entitlement state phù hợp.
- Mobile 375px không horizontal overflow.
- Interactive elements là button/link semantic, có focus-visible state.
- Chạy focused tests trước mỗi commit; trước khi hoàn tất chạy encoding, lint, test:ci, build và browser test.

---

### Task 1: Recommendation domain logic

**Files:**
- Create: `src/components/dashboard/restaurant/insightRecommendations.ts`
- Modify: `tests/merchantInsightsChartData.test.ts`
- Modify: `package.json` only if a separate focused script is needed

**Interfaces:**
- Consumes: `RestaurantStats | null`.
- Produces: `MerchantOperationalRecommendation[]` with `id`, `tone`, `title`, `description`.

- [ ] **Step 1: Write failing tests**

Add cases for peak hour, cancellation rate, slow processing time, empty stats and maximum three recommendations. Assert output values, not implementation calls.

```ts
const recommendations = buildOperationalRecommendations(statsFixture);
assert.equal(recommendations[0].id, 'peak-hour');
assert.match(recommendations[0].description, /12:00/);
```

- [ ] **Step 2: Run focused test and confirm RED**

Run: `npm run test:merchant-insights-chart-data`

Expected: failure because `insightRecommendations.ts` and the exported function do not exist.

- [ ] **Step 3: Implement minimal pure builder**

Use only positive data. Add a peak-hour recommendation when the hourly dataset contains orders; add cancellation warning at `>= 5`; add service-speed warning at `>= 20` minutes; add top-item suggestion when a top item exists. Return at most three items and never invent a count for empty data.

- [ ] **Step 4: Run focused test GREEN**

Run: `npm run test:merchant-insights-chart-data`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/restaurant/insightRecommendations.ts tests/merchantInsightsChartData.test.ts
git diff --cached --check
git commit -m "feat: add merchant insight recommendations"
```

### Task 2: Shared operational summary components

**Files:**
- Create: `src/components/dashboard/restaurant/RestaurantAnalyticsSummary.tsx`
- Create: `src/components/dashboard/restaurant/analyticsSummaryData.ts`
- Create: `tests/analyticsSummaryData.test.ts`

**Interfaces:**
- `buildOrderStatusSummary(stats: RestaurantStats | null)` returns labeled status rows.
- `buildMenuPerformanceSummary(stats: RestaurantStats | null)` returns top dishes/categories.
- `buildTablePerformanceSummary(stats: RestaurantStats | null)` returns ranked tables.
- Presentation exports: `OrderAnalyticsSummary`, `MenuAnalyticsSummary`, `TableAnalyticsSummary`.

- [ ] **Step 1: Write failing adapter tests**

Cover sorted status rows, top-five limits, zero/null safety, and descending table revenue order.

- [ ] **Step 2: Run focused adapter test RED**

Run: `node --experimental-strip-types tests/analyticsSummaryData.test.ts`

Expected: FAIL because the adapter module does not exist.

- [ ] **Step 3: Implement pure adapters**

Keep source payload immutable. Normalize missing arrays to empty arrays. Preserve explicit zero values.

- [ ] **Step 4: Implement summary presentation**

Use one-column mobile and two-column desktop cards. Status uses compact segmented summary plus counts. Menu and tables use accessible ranked rows with proportional bars and numeric labels. Render skeleton when loading, inline error when stats failed, and descriptive empty state for empty arrays.

- [ ] **Step 5: Run focused adapter test and typecheck**

Run: `node --experimental-strip-types tests/analyticsSummaryData.test.ts`

Run: `npx tsc -b --pretty false`

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/restaurant/RestaurantAnalyticsSummary.tsx src/components/dashboard/restaurant/analyticsSummaryData.ts tests/analyticsSummaryData.test.ts
git diff --cached --check
git commit -m "feat: add contextual restaurant analytics summaries"
```

### Task 3: Wire shared stats and overview KPI placement

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/dashboard/restaurant/RestaurantOverviewTab.tsx`
- Modify: `src/components/dashboard/restaurant/RestaurantOrdersTab.tsx`
- Modify: `src/components/dashboard/restaurant/RestaurantMenuTab.tsx`
- Modify: `src/components/dashboard/restaurant/RestaurantTablesTab.tsx`
- Modify: `src/types/index.ts` only if a prop type needs extraction

**Interfaces:**
- Stats tabs are `overview`, `insights`, `orders`, `menu`, `tables`.
- Orders/Menu/Tables receive `stats`, `isLoadingStats`, `hasStatsError`.

- [ ] **Step 1: Add props and render summary slots**

Place `OrderAnalyticsSummary` before order filters, `MenuAnalyticsSummary` after menu header, and `TableAnalyticsSummary` after table status summary and before table management list.

- [ ] **Step 2: Extend overview KPI grid**

Keep existing four cards and add customer count and cancellation rate cards. Use a responsive grid that is one column on mobile, two on small screens, three on large screens and six only on wide screens. Keep labels and values readable without relying on color alone.

- [ ] **Step 3: Load stats for relevant tabs**

Change the Dashboard effect so `loadStats()` runs for `overview`, `insights`, `orders`, `menu`, and `tables`. Keep menu/categories/orders/table loading branches intact and avoid stats calls for unrelated tabs.

- [ ] **Step 4: Run typecheck and focused tests**

Run: `npx tsc -b --pretty false`

Run: `npm run test:merchant-insights-chart-data`

Expected: PASS.

- [ ] **Step 5: Commit wiring**

```bash
git add src/pages/Dashboard.tsx src/components/dashboard/restaurant/RestaurantOverviewTab.tsx src/components/dashboard/restaurant/RestaurantOrdersTab.tsx src/components/dashboard/restaurant/RestaurantMenuTab.tsx src/components/dashboard/restaurant/RestaurantTablesTab.tsx src/types/index.ts
git diff --cached --check
git commit -m "feat: place analytics summaries in merchant tabs"
```

### Task 4: Add action recommendations to Insights

**Files:**
- Create: `src/components/dashboard/restaurant/MerchantOperationalRecommendations.tsx`
- Modify: `src/components/dashboard/restaurant/MerchantInsightsTab.tsx`

**Interfaces:**
- Component consumes `RestaurantStats | null` and `isLoadingStats`.
- Uses `buildOperationalRecommendations` and does not fetch data.

- [ ] **Step 1: Add recommendation component**

Render a labeled section with up to three cards, tone icon, title and description. Empty stats render nothing after loading; loading renders three compact skeleton cards.

- [ ] **Step 2: Mount at the correct information priority**

Mount after the revenue impact banner and before `MerchantInsightsCharts`. Preserve `Xem biểu đồ` toggle and existing AI gap analysis below.

- [ ] **Step 3: Run typecheck and chart browser test**

Run: `npx tsc -b --pretty false`

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: PASS with recommendation heading visible for mocked stats.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/restaurant/MerchantOperationalRecommendations.tsx src/components/dashboard/restaurant/MerchantInsightsTab.tsx tests/merchant-insights-charts.spec.ts
git diff --cached --check
git commit -m "feat: surface actionable merchant recommendations"
```

### Task 5: Add customer segment placement in CRM tab

**Files:**
- Modify: `src/components/dashboard/restaurant/RestaurantCustomersTab.tsx`
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/components/dashboard/restaurant/RestaurantAnalyticsSummary.tsx`
- Modify: `tests/merchant-insights-charts.spec.ts`

**Interfaces:**
- Customers tab receives `period` and `customerInsightsEnabled`.
- It loads `customer-insights` only when entitlement is enabled.
- `CustomerSegmentsSummary` receives `CustomerInsightsPayload | null`, loading and error state.

- [ ] **Step 1: Extend browser mock/test with customer route**

Mock `/api/restaurants/customer-insights` and add a navigation assertion for `/dashboard?tab=customers`.

- [ ] **Step 2: Run browser test RED**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: fail because the CRM tab does not yet render the segment summary.

- [ ] **Step 3: Add entitlement-aware customer insight loading**

Use existing `loadMerchantInsights` and `apiFetch`, depend on `restaurantId`, `period`, and `customerInsightsEnabled`, and keep CRM list loading independent. On error, render retry only for the summary.

- [ ] **Step 4: Render customer summary before CRM list**

Use horizontal bars and a survey response count. If not entitled, show a compact locked card and do not call the customer-insights endpoint.

- [ ] **Step 5: Run browser test GREEN**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: PASS with customer segment summary, no console errors and no horizontal overflow at 375px.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/restaurant/RestaurantCustomersTab.tsx src/pages/Dashboard.tsx src/components/dashboard/restaurant/RestaurantAnalyticsSummary.tsx tests/merchant-insights-charts.spec.ts
git diff --cached --check
git commit -m "feat: add customer segments to crm dashboard"
```

### Task 6: Full verification and visual quality pass

**Files:**
- Inspect all changed source and test files.

- [ ] **Step 1: Run encoding gate**

Run: `npm run check:encoding`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit code 0. Review warnings for newly introduced issues.

- [ ] **Step 3: Run typecheck**

Run: `npx tsc -b --pretty false`

Expected: exit code 0.

- [ ] **Step 4: Run full test suite**

Run: `npm run test:ci`

Expected: all existing and new unit tests pass.

- [ ] **Step 5: Run production build**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 6: Run focused browser verification**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: overview/insights/orders/menu/tables/customers placements, toggle behavior, mobile overflow and console checks pass.

- [ ] **Step 7: Inspect diff hygiene**

Run: `git diff --check` and `git status --short`.

Confirm no `.env`, `dist`, Playwright artifacts or unrelated files are included. Review all visible copy for broken Vietnamese, duplicate CTAs and chart labels.

- [ ] **Step 8: Commit any final fix separately**

If a gate finds a problem, fix the root cause, rerun the smallest relevant check and commit with a specific message before rerunning the full verification.
