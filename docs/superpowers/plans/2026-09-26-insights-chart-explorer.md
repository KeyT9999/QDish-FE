# Insights Chart Explorer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm khu vực biểu đồ xổ xuống trong tab insights, dùng chung bộ lọc thời gian và số liệu thật từ các API thống kê hiện có.

**Architecture:** Giữ state kỳ dữ liệu và stats ở `Dashboard.tsx`; truyền dữ liệu xuống `MerchantInsightsTab`. Tách phần chart thành component trình bày độc lập và tách adapter dữ liệu thuần để dễ test. Chỉ mount Recharts khi người dùng mở khu vực, không gọi API từ component chart.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Recharts 3, lucide-react, Playwright, Node `--experimental-strip-types` tests.

## Global Constraints

- Không thêm dependency mới; `recharts` đã có trong `package.json`.
- Không thay đổi backend endpoint hoặc schema.
- Không tạo số liệu giả ở frontend; dataset rỗng phải hiển thị empty state.
- Giữ emerald/slate/neutral của dashboard hiện tại; chart colors chỉ phân biệt ngữ nghĩa.
- Interactive UI phải dùng button thật, có focus state, `aria-expanded` và `aria-controls`.
- Mọi bước hoàn thành phải chạy focused test trước, sau đó chạy CI equivalents: encoding, lint, test:ci và build.

---

### Task 1: Tách adapter dữ liệu và viết unit tests

**Files:**
- Create: `src/components/dashboard/restaurant/charts/merchantInsightsChartData.ts`
- Create: `tests/merchantInsightsChartData.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `RestaurantStats` từ `src/types/index.ts`, `MerchantInsightsPayload` từ `src/services/merchantInsightLoader.ts`.
- Produces: pure functions trả các mảng data cho Recharts, không mutate input.

- [ ] **Step 1: Viết test đỏ cho các adapter**

Tạo fixture stats có `revenueByDate`, `revenueByHour`, `topMenuItems`, `revenueByCategory`, `ordersByStatus`, và fixture insights có `topDishes`, `peakHours`, `customerSegments`. Kiểm tra:

```ts
const trend = buildRevenueTrendData(stats);
assert.deepEqual(trend[0], { label: '12/09', revenue: 120000, orders: 3 });

const hourly = buildHourlyOrderData(stats, insights);
assert.equal(hourly.length, 24);
assert.equal(hourly[12].orders, 8);

const empty = buildCategoryRevenueData(null);
assert.deepEqual(empty, []);

const fallback = buildTopDishData(null, insights);
assert.deepEqual(fallback[0], {
  name: 'Cơm gà',
  quantity: 5,
  revenue: 500000
});
```

- [ ] **Step 2: Chạy focused test để xác nhận RED**

Run: `node --experimental-strip-types tests/merchantInsightsChartData.test.ts`

Expected: FAIL vì module adapter và các hàm chưa tồn tại.

- [ ] **Step 3: Viết adapter tối thiểu**

Export đúng sáu hàm sau:

```ts
export const buildRevenueTrendData = (stats: RestaurantStats | null) => ...;
export const buildHourlyOrderData = (
  stats: RestaurantStats | null,
  insights: MerchantInsightsPayload
) => ...;
export const buildTopDishData = (
  stats: RestaurantStats | null,
  insights: MerchantInsightsPayload
) => ...;
export const buildCategoryRevenueData = (stats: RestaurantStats | null) => ...;
export const buildOrderStatusData = (stats: RestaurantStats | null) => ...;
export const buildCustomerSegmentData = (insights: MerchantInsightsPayload) => ...;
```

Format label ngày bằng `dd/mm`, label giờ bằng `${hour}:00`, giữ đầy đủ 24 giờ cho hourly chart, và map trạng thái backend sang tiếng Việt: `pending` → `Đang chờ`, `confirmed` → `Đã xác nhận`, `served` → `Đã phục vụ`, `completed` → `Hoàn tất`, `cancelled` → `Đã hủy`.

- [ ] **Step 4: Chạy focused test để xác nhận GREEN**

Run: `node --experimental-strip-types tests/merchantInsightsChartData.test.ts`

Expected: PASS với thông báo `merchant insights chart data tests passed`.

- [ ] **Step 5: Thêm script test vào CI suite**

Trong `package.json`, thêm:

```json
"test:merchant-insights-chart-data": "node --experimental-strip-types tests/merchantInsightsChartData.test.ts"
```

và nối script này vào `test:ci` sau `test:merchant-insight-access`.

- [ ] **Step 6: Commit adapter và tests**

```bash
git add src/components/dashboard/restaurant/charts/merchantInsightsChartData.ts tests/merchantInsightsChartData.test.ts package.json
git diff --cached --check
git commit -m "test: cover merchant insight chart data adapters"
```

### Task 2: Xây dựng component Chart Explorer

**Files:**
- Create: `src/components/dashboard/restaurant/MerchantInsightsCharts.tsx`

**Interfaces:**
- Consumes: `{ stats: RestaurantStats | null; insights: MerchantInsightsPayload; isLoadingStats: boolean; hasStatsError: boolean }`.
- Produces: section trình bày sáu chart, loading skeleton và empty state; không có side effect/API call.

- [ ] **Step 1: Tạo component shell và loading/empty states**

Tạo các helper nội bộ `ChartCard`, `ChartEmptyState`, `ChartSkeleton`. `ChartCard` nhận `title`, `description`, `children`, `className`, `ariaLabel`. Khi `isLoadingStats` là `true`, render sáu skeleton cùng kích thước gần với chart card.

- [ ] **Step 2: Thêm chart doanh thu và số đơn theo thời gian**

Dùng `ComposedChart` với `Area dataKey="revenue"` màu emerald và `Line dataKey="orders"` màu blue, hai `YAxis`, `Tooltip` format `₫` và `đơn`. Nếu adapter trả mảng rỗng, dùng `ChartEmptyState`.

- [ ] **Step 3: Thêm chart khung giờ đặt món**

Dùng `BarChart` dọc với 24 điểm, `dataKey="orders"`, tooltip thêm doanh thu. X-axis format `${hour}h`, giữ tất cả giờ kể cả giá trị 0 để người dùng nhận ra giờ trống.

- [ ] **Step 4: Thêm chart top món bán chạy và danh mục**

Dùng `BarChart layout="vertical"` cho top món, `YAxis type="category"` để tên món dài không bị cắt. Dùng `PieChart` với `innerRadius` cho doanh thu danh mục và legend có tên danh mục, phần trăm.

- [ ] **Step 5: Thêm chart trạng thái đơn và phân khúc khách hàng**

Dùng donut cho `ordersByStatus`; dùng `BarChart layout="vertical"` cho `customerSegments`. Nếu phân khúc rỗng do gói không bật customer insights, hiển thị empty state nói rõ “Chưa có dữ liệu phân khúc trong kỳ này”, không hiển thị số khóa giả.

- [ ] **Step 6: Bổ sung accessibility và responsive**

Mỗi card có heading `h3`, `aria-label`, container `min-w-0`; grid dùng `grid-cols-1 xl:grid-cols-2`. Nút không nằm trong component chart. Không dùng emoji làm icon, dùng icon Lucide đang có trong project. Thêm transition ngắn cho wrapper và tôn trọng `prefers-reduced-motion` bằng utility hiện có hoặc không thêm animation chart.

- [ ] **Step 7: Chạy typecheck sớm**

Run: `npx tsc -b --pretty false`

Expected: component mới compile hoặc trả lỗi type cụ thể để sửa trước khi wire vào page.

- [ ] **Step 8: Commit component chart**

```bash
git add src/components/dashboard/restaurant/MerchantInsightsCharts.tsx
git diff --cached --check
git commit -m "feat: add expandable merchant insight charts"
```

### Task 3: Wire state, period filter và API stats

**Files:**
- Modify: `src/pages/Dashboard.tsx:255-269, 659-668`
- Modify: `src/components/dashboard/restaurant/MerchantInsightsTab.tsx:55-100, 190-235, 667-680`

**Interfaces:**
- `Dashboard` tải stats khi `activeTab` là `overview` hoặc `insights`.
- `MerchantInsightsTab` nhận `stats`, `statsPeriod`, `isLoadingStats`, `onSetStatsPeriod`.
- `MerchantInsightsTab` nhận thêm `hasStatsError` để chart explorer có thể báo lỗi stats inline mà vẫn giữ các insight chart còn dùng được.
- Chart explorer nhận `insights` đã tải và `stats` từ parent.

- [ ] **Step 1: Sửa test/fixture contract cho period chung**

Đảm bảo test access hiện tại vẫn gọi `month`/`week`, sau đó thay local `period` trong `MerchantInsightsTab` bằng prop `statsPeriod`. Danh sách filter chỉ dùng `today`, `week`, `month`, `year` để stats API và insights API nhận cùng giá trị.

- [ ] **Step 2: Mở rộng Dashboard data-loading condition**

Đổi nhánh:

```ts
if (activeTab === 'overview' || activeTab === 'insights') {
  loadStats();
}
```

Giữ nguyên các nhánh load menu/categories/orders/tables/staff. Không tạo request stats cho các tab không liên quan.

- [ ] **Step 3: Truyền props xuống MerchantInsightsTab**

Đổi JSX thành:

```tsx
<MerchantInsightsTab
  restaurant={restaurant}
  stats={stats}
  statsPeriod={statsPeriod}
  isLoadingStats={isLoadingStats}
  onSetStatsPeriod={setStatsPeriod}
/>
```

- [ ] **Step 4: Thêm nút “Xem biểu đồ” và state mở/đóng**

Trong `MerchantInsightsTab`, thêm `const [isChartsOpen, setIsChartsOpen] = useState(false)`. Đặt button cạnh nút “Làm mới báo cáo”, dùng icon `BarChart3`, `aria-expanded`, `aria-controls="merchant-insights-charts"`, và nhãn `isChartsOpen ? 'Ẩn biểu đồ' : 'Xem biểu đồ'`.

- [ ] **Step 5: Mount Chart Explorer theo state**

Đặt sau Revenue Impact Banner:

```tsx
{isChartsOpen && (
  <MerchantInsightsCharts
    stats={stats}
    insights={insights}
    isLoadingStats={isLoadingStats}
    hasStatsError={hasStatsError}
  />
)}
```

Không render component khi đóng để giữ chi phí Recharts thấp.

- [ ] **Step 6: Giữ period filter và insight fetching đồng bộ**

Đổi `fetchInsights` và dependency của `useEffect` sang `statsPeriod`; gọi `onSetStatsPeriod` từ các nút filter. Không gọi setState sau unmount; giữ loading/error flow hiện tại.

- [ ] **Step 7: Chạy focused tests và typecheck**

Run: `node --experimental-strip-types tests/merchantInsightsChartData.test.ts`

Run: `npx tsc -b --pretty false`

Expected: cả hai lệnh exit code 0.

- [ ] **Step 8: Commit wiring**

```bash
git add src/pages/Dashboard.tsx src/components/dashboard/restaurant/MerchantInsightsTab.tsx
git diff --cached --check
git commit -m "feat: wire shared period into insights charts"
```

### Task 4: Browser regression test cho interaction và layout contract

**Files:**
- Create: `tests/merchant-insights-charts.spec.ts`
- Create: `playwright.merchant-insights.config.ts`

**Interfaces:**
- Test dùng Playwright route mocks cho `/api/restaurants/me`, `/api/restaurants/me/stats`, `/api/restaurants/customer-insights` và không phụ thuộc database thật.

- [ ] **Step 1: Tạo test đỏ cho toggle**

Mock restaurant có `personalizedMenuEnabled: true`, `customerInsightsEnabled: true`; mock stats đủ sáu dataset. Test flow:

```ts
await page.goto('/dashboard?tab=insights');
await expect(page.getByRole('button', { name: 'Xem biểu đồ' })).toBeVisible();
await page.getByRole('button', { name: 'Xem biểu đồ' }).click();
await expect(page.getByRole('region', { name: 'Bảng điều khiển biểu đồ' })).toBeVisible();
for (const title of chartTitles) {
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
}
await page.getByRole('button', { name: 'Ẩn biểu đồ' }).click();
await expect(page.getByRole('region', { name: 'Bảng điều khiển biểu đồ' })).toBeHidden();
```

- [ ] **Step 2: Chạy Playwright để xác nhận RED nếu selector chưa có**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

- [ ] **Step 3: Hoàn thiện route mocks và accessibility assertions**

Mock `localStorage` token trước khi navigation, kiểm tra không có horizontal overflow ở viewport 375px và đọc console message/error để test fail nếu có console error.

- [ ] **Step 4: Chạy Playwright GREEN**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: test pass ở mobile viewport và không có console errors.

- [ ] **Step 5: Commit browser test**

```bash
git add tests/merchant-insights-charts.spec.ts playwright.merchant-insights.config.ts
git diff --cached --check
git commit -m "test: verify merchant insight chart explorer"
```

### Task 5: Full repository verification và review diff

**Files:**
- No new source files; inspect all changed files and workflow commands.

- [ ] **Step 1: Chạy encoding gate**

Run: `npm run check:encoding`

Expected: exit code 0, không phát hiện mojibake.

- [ ] **Step 2: Chạy lint**

Run: `npm run lint`

Expected: exit code 0, không có warning/error mới.

- [ ] **Step 3: Chạy full unit/policy suite**

Run: `npm run test:ci`

Expected: tất cả test trong script pass, bao gồm `test:merchant-insights-chart-data`.

- [ ] **Step 4: Chạy build production**

Run: `npm run build`

Expected: TypeScript và Vite build exit code 0.

- [ ] **Step 5: Chạy focused browser test sau cùng**

Run: `npx playwright test --config playwright.merchant-insights.config.ts tests/merchant-insights-charts.spec.ts`

Expected: toggle, chart headings, mobile overflow và console checks đều pass.

- [ ] **Step 6: Review diff và trạng thái git**

Run:

```bash
git diff main...HEAD --stat
git diff main...HEAD --check
git status --short
```

Xác nhận chỉ có spec, plan, chart adapter, chart component, dashboard wiring, package test script và browser test; không có `.env`, `dist` hoặc generated artifacts.

- [ ] **Step 7: Commit any final fix separately**

Nếu verification phát hiện lỗi, sửa nguồn gốc, chạy lại lệnh tương ứng và commit bằng message mô tả nguyên nhân. Không báo hoàn tất khi còn lệnh gate chưa pass.
