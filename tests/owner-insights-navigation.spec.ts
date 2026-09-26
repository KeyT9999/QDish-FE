import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';

const restaurantId = '000000000000000000000002';
const userId = '000000000000000000000003';

const createOwnerToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    username: 'owner-insights-test',
    role: 'RESTAURANT_OWNER',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', 'owner-insights-playwright-test').update(data).digest('base64url');
  return `${data}.${signature}`;
};

const restaurant = {
  id: restaurantId,
  _id: restaurantId,
  name: 'Bếp Xanh',
  ownerName: 'Chủ nhà hàng',
  address: '12 Đường Mẫu',
  phone: '0900000000',
  email: 'owner@example.test',
  features: {
    personalizedMenuEnabled: true,
    customerInsightsEnabled: true,
  },
};

const customerInsights = {
  menuCoverage: { totalItems: 5, itemsWithRecipe: 5, coveragePct: 100 },
  attributeDistribution: { VEGAN: 3, GLUTEN_FREE: 1 },
  topDishes: [{ dishId: 'dish-1', name: 'Bowl mẫu', orderCount: 12, revenue: 960000 }],
  customerSegments: [{ segment: 'VEGAN', count: 18, label: 'Thuần chay' }],
  surveyResponseCount: 20,
  realSurveyResponseCount: 17,
  demoSurveyResponseCount: 3,
  completedOrderCount: 12,
  gapAnalysis: ['Có thể cân nhắc thêm lựa chọn giàu đạm'],
  peakHours: {
    periods: [{ period: 'Buổi trưa (11:00 - 14:00)', count: 8, percentage: 67 }],
    hourly: Array.from({ length: 24 }, (_, hour) => hour === 12 ? 8 : 0),
  },
};

const menuInsights = {
  menuCoverage: { totalItems: 5, itemsWithRecipe: 5, coveragePct: 100 },
  attributeDistribution: { VEGAN: 3, GLUTEN_FREE: 1 },
  topDishes: [{ dishId: 'dish-1', name: 'Bowl mẫu', orderCount: 12, revenue: 960000 }],
};

let customerInsightsRequestCount = 0;
let menuInsightsRequestCount = 0;
let ownerFeatures = restaurant.features;
let customerInsightsResponse: typeof customerInsights = customerInsights;
let customerInsightsStatus = 200;
let customerInsightsDelayMs = 0;

test.beforeEach(async ({ context, page }) => {
  customerInsightsRequestCount = 0;
  menuInsightsRequestCount = 0;
  ownerFeatures = restaurant.features;
  customerInsightsResponse = customerInsights;
  customerInsightsStatus = 200;
  customerInsightsDelayMs = 0;

  await context.addInitScript(({ token, selectedRestaurantId }) => {
    window.localStorage.setItem('qr_food_order_token', token);
    window.localStorage.setItem('selected_restaurant_id', selectedRestaurantId);
  }, { token: createOwnerToken(), selectedRestaurantId: restaurantId });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = [];
    let status = 200;

    if (url.pathname === '/api/owner/restaurants') {
      body = url.searchParams.get('archived') === 'true' ? [] : [{ ...restaurant, features: ownerFeatures }];
    } else if (url.pathname === '/api/restaurants/me') {
      body = { ...restaurant, features: ownerFeatures };
    } else if (url.pathname === '/api/notifications/unread-count') {
      body = { unreadCount: 0 };
    } else if (url.pathname === '/api/restaurants/menu-insights') {
      menuInsightsRequestCount += 1;
      body = menuInsights;
    } else if (url.pathname === '/api/restaurants/customer-insights') {
      customerInsightsRequestCount += 1;
      if (customerInsightsDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, customerInsightsDelayMs));
      }
      body = customerInsightsStatus === 200
        ? customerInsightsResponse
        : { message: 'Insight service unavailable' };
      status = customerInsightsStatus;
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
});

test('offers accessible desktop Insights sections and reuses the shared payload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await page.waitForLoadState('networkidle');
  const initialRequestCount = customerInsightsRequestCount;
  expect(initialRequestCount).toBeGreaterThan(0);

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace).toBeVisible();
  await expect(workspace.getByRole('group', { name: 'Kỳ báo cáo' })).toHaveCount(1);
  await expect(workspace.getByRole('button', { name: 'Làm mới báo cáo', exact: true })).toHaveCount(1);

  const tablist = workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' });
  const tabs = tablist.getByRole('tab');
  await expect(tabs).toHaveCount(5);

  const intelligenceTab = tablist.getByRole('tab', { name: 'QDish Intelligence', exact: true });
  await expect(intelligenceTab).toHaveAttribute('aria-selected', 'true');
  await expect(intelligenceTab).toHaveAttribute('tabindex', '0');
  await expect(workspace.getByRole('tabpanel')).toHaveCount(1);
  await expect(workspace.getByRole('tabpanel').getByText('QDish Intelligence Demo')).toBeVisible();
  await expect(
    workspace.getByRole('tabpanel').getByRole('heading', { name: 'Xu hướng từ lượt khảo sát QR' }),
  ).toHaveCount(0);

  const surveyTab = tablist.getByRole('tab', { name: 'Xu hướng khảo sát QR', exact: true });
  await surveyTab.click();
  await expect(surveyTab).toHaveAttribute('aria-selected', 'true');
  await expect(surveyTab).toBeFocused();
  await expect(workspace.getByRole('tabpanel').getByText('Thuần chay')).toBeVisible();
  await expect(workspace.getByRole('tabpanel').getByRole('note', { name: 'Nguồn dữ liệu khảo sát' })).toBeVisible();

  const peakHoursTab = tablist.getByRole('tab', { name: 'Khung giờ đặt món', exact: true });
  await surveyTab.press('ArrowRight');
  await expect(peakHoursTab).toHaveAttribute('aria-selected', 'true');
  await expect(peakHoursTab).toBeFocused();
  await expect(workspace.getByRole('tabpanel').getByText('Buổi trưa (11:00 - 14:00)')).toBeVisible();
  await expect(workspace.getByRole('tabpanel')).toHaveCount(1);
  expect(customerInsightsRequestCount).toBe(initialRequestCount);

  await peakHoursTab.press('End');
  const smartMenuTab = tablist.getByRole('tab', { name: 'Hiệu suất món ăn Smart-Menu', exact: true });
  await expect(smartMenuTab).toHaveAttribute('aria-selected', 'true');
  await expect(smartMenuTab).toBeFocused();
  await expect(workspace.getByRole('tabpanel').getByText('Bowl mẫu', { exact: true })).toBeVisible();

  await smartMenuTab.press('Home');
  await expect(intelligenceTab).toHaveAttribute('aria-selected', 'true');
  await expect(intelligenceTab).toBeFocused();
  await intelligenceTab.press('ArrowLeft');
  await expect(smartMenuTab).toHaveAttribute('aria-selected', 'true');
  await expect(smartMenuTab).toBeFocused();

  await peakHoursTab.click();
  expect(customerInsightsRequestCount).toBe(initialRequestCount);
  await workspace.getByRole('button', { name: 'Tháng này', exact: true }).click();
  await expect.poll(() => customerInsightsRequestCount).toBe(initialRequestCount + 1);
  await expect(peakHoursTab).toHaveAttribute('aria-selected', 'true');

  const refreshButton = workspace.getByRole('button', { name: 'Làm mới báo cáo', exact: true });
  await expect(refreshButton).toHaveCount(1);
  // Let the existing apiFetch GET cache expire before verifying the same-period refresh request.
  await page.waitForTimeout(1100);
  customerInsightsDelayMs = 450;
  await refreshButton.click();
  await expect(refreshButton).toBeDisabled();
  await expect(refreshButton).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => customerInsightsRequestCount).toBe(initialRequestCount + 2);
  await expect(refreshButton).toBeEnabled();
  await expect(peakHoursTab).toHaveAttribute('aria-selected', 'true');

  await smartMenuTab.click();
  await expect(workspace.getByRole('tabpanel').getByText('Bowl mẫu', { exact: true })).toBeVisible();
});

test('uses a labeled section selector on mobile without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/owner?tab=insights');

  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await page.waitForLoadState('networkidle');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace).toBeVisible();
  await expect(workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' })).toHaveCount(0);

  const sectionSelect = workspace.getByRole('combobox', { name: 'Chọn nội dung phân tích' });
  await expect(sectionSelect).toBeVisible();
  const initialRequestCount = customerInsightsRequestCount;
  await sectionSelect.selectOption({ label: 'Khung giờ đặt món' });
  await expect(workspace.getByRole('tabpanel').getByText('Buổi trưa (11:00 - 14:00)')).toBeVisible();
  expect(customerInsightsRequestCount).toBe(initialRequestCount);

  const viewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
});

test('keeps the workspace accessible and free of page overflow at supported widths', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const messageText = message.text();
    // This fixture mocks REST APIs, but CI does not run the Socket.IO backend.
    const unavailableSocketBackend = messageText.includes('/socket.io/?EIO=4&transport=websocket')
      && messageText.includes('net::ERR_CONNECTION_REFUSED');

    if (!unavailableSocketBackend) runtimeErrors.push(messageText);
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/owner?tab=insights');
  await page.waitForLoadState('networkidle');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });

  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(workspace).toBeVisible();
    await expect(workspace.getByRole('tabpanel')).toHaveCount(1);

    if (width < 768) {
      await expect(workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' })).toHaveCount(0);
      const sectionSelect = workspace.getByRole('combobox', { name: 'Chọn nội dung phân tích' });
      await expect(sectionSelect).toBeVisible();
      await expect(sectionSelect).toHaveValue('qdish-intelligence');
    } else {
      const tablist = workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' });
      const selectedTab = tablist.getByRole('tab', { selected: true });
      await expect(selectedTab).toHaveAttribute('tabindex', '0');
      await selectedTab.focus();
      await expect(selectedTab).toBeFocused();
    }

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth);

    if (width === 375 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`owner-insights-${width}.png`), fullPage: true });
    }
  }

  const transitionProperty = await workspace.getByRole('tabpanel').evaluate((element) => getComputedStyle(element).transitionProperty);
  expect(transitionProperty).toBe('none');
  expect(runtimeErrors).toEqual([]);
});

test('shows loading progress while the shared insight payload is loading', async ({ page }) => {
  customerInsightsDelayMs = 650;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace).toHaveAttribute('aria-busy', 'true');
  await expect(workspace.getByRole('status').getByText('Đang tổng hợp báo cáo dữ liệu thực đơn...')).toBeVisible();
  await expect(workspace.getByRole('tabpanel')).toHaveCount(0);
  await expect(workspace.getByRole('tabpanel').getByText('QDish Intelligence Demo')).toBeVisible();
  await expect(workspace).not.toHaveAttribute('aria-busy', 'true');
  await expect(workspace.getByRole('tabpanel')).toHaveCount(1);
  expect(customerInsightsRequestCount).toBe(1);
});

test('shows the error state and retries through the shared loader', async ({ page }) => {
  customerInsightsStatus = 503;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace.getByRole('heading', { name: 'Không thể tải dữ liệu phân tích' })).toBeVisible();
  await expect(workspace.getByText('Đã xảy ra lỗi khi kết nối với máy chủ tính toán. Vui lòng làm mới lại trang.')).toBeVisible();
  expect(customerInsightsRequestCount).toBe(1);

  customerInsightsStatus = 200;
  await workspace.getByRole('button', { name: 'Thử lại' }).click();
  await expect(workspace.getByText('QDish Intelligence Demo')).toBeVisible();
  expect(customerInsightsRequestCount).toBe(2);
});

test('preserves threshold and empty-state copy for an empty insight payload', async ({ page }) => {
  customerInsightsResponse = {
    ...customerInsights,
    attributeDistribution: {},
    topDishes: [],
    customerSegments: [],
    surveyResponseCount: 0,
    realSurveyResponseCount: 0,
    demoSurveyResponseCount: 0,
    completedOrderCount: 0,
    gapAnalysis: [],
    peakHours: { periods: [], hourly: Array(24).fill(0) },
  };
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  const tablist = workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' });
  await expect(workspace.getByRole('tabpanel').getByText('Cần thêm dữ liệu hoạt động')).toBeVisible();
  await expect(workspace.getByRole('tabpanel').getByText('Lượt khảo sát: 0/20')).toBeVisible();

  await tablist.getByRole('tab', { name: 'Thuộc tính thực đơn', exact: true }).click();
  await expect(workspace.getByRole('tabpanel').getByText('Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.')).toBeVisible();
  await tablist.getByRole('tab', { name: 'Hiệu suất món ăn Smart-Menu', exact: true }).click();
  await expect(workspace.getByRole('tabpanel').getByText('Chưa có số lượng món bán cho các món có recipe.')).toBeVisible();
});

test('keeps PRO-only analysis locked on PLUS while retaining its existing menu request', async ({ page }) => {
  ownerFeatures = { ...restaurant.features, customerInsightsEnabled: false };
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');
  await page.waitForLoadState('networkidle');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  const tablist = workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' });
  await expect(workspace.getByRole('heading', { name: 'Tính năng QDish Intelligence bị khóa' })).toBeVisible();
  expect(menuInsightsRequestCount).toBeGreaterThan(0);
  expect(customerInsightsRequestCount).toBe(0);

  await tablist.getByRole('tab', { name: 'Xu hướng khảo sát QR', exact: true }).click();
  await expect(workspace.getByRole('heading', { name: 'Xu hướng khảo sát chuyên sâu bị khóa' })).toBeVisible();
  await tablist.getByRole('tab', { name: 'Khung giờ đặt món', exact: true }).click();
  await expect(workspace.getByRole('heading', { name: 'Tính năng Phân tích giờ vàng bị khóa' })).toBeVisible();
  expect(menuInsightsRequestCount).toBe(1);
  expect(customerInsightsRequestCount).toBe(0);

  await tablist.getByRole('tab', { name: 'Hiệu suất món ăn Smart-Menu', exact: true }).click();
  const smartMenuPanel = workspace.getByRole('tabpanel');
  await expect(smartMenuPanel.getByText('0 đơn đã phục vụ/hoàn tất', { exact: true })).toHaveCount(0);
  await expect(smartMenuPanel.getByText('Số đơn đã phục vụ/hoàn tất chỉ khả dụng trên gói PRO.')).toBeVisible();
  await expect(smartMenuPanel.getByText('Bowl mẫu', { exact: true })).toBeVisible();
});

test('keeps FREE plan disclosure and does not request insight data', async ({ page }) => {
  ownerFeatures = { ...restaurant.features, personalizedMenuEnabled: false, customerInsightsEnabled: false };
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace.getByRole('heading', { name: 'Tính năng Phân tích chuyên sâu bị khóa' })).toBeVisible();
  await expect(workspace.getByText('Đặc quyền gói PLUS & PRO:')).toBeVisible();
  expect(customerInsightsRequestCount).toBe(0);
  expect(menuInsightsRequestCount).toBe(0);
});
