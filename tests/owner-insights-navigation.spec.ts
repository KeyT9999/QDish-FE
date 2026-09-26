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

let customerInsightsRequestCount = 0;

test.beforeEach(async ({ context, page }) => {
  customerInsightsRequestCount = 0;

  await context.addInitScript(({ token, selectedRestaurantId }) => {
    window.localStorage.setItem('qr_food_order_token', token);
    window.localStorage.setItem('selected_restaurant_id', selectedRestaurantId);
  }, { token: createOwnerToken(), selectedRestaurantId: restaurantId });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = [];

    if (url.pathname === '/api/owner/restaurants') {
      body = url.searchParams.get('archived') === 'true' ? [] : [restaurant];
    } else if (url.pathname === '/api/restaurants/me') {
      body = restaurant;
    } else if (url.pathname === '/api/notifications/unread-count') {
      body = { unreadCount: 0 };
    } else if (url.pathname === '/api/restaurants/customer-insights') {
      customerInsightsRequestCount += 1;
      body = customerInsights;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
});

test('offers accessible desktop Insights sections and reuses the shared payload', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/owner?tab=insights');

  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await expect(page.getByText('Bowl mẫu', { exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
  const initialRequestCount = customerInsightsRequestCount;
  expect(initialRequestCount).toBeGreaterThan(0);

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace).toBeVisible();

  const tablist = workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' });
  const tabs = tablist.getByRole('tab');
  await expect(tabs).toHaveCount(5);

  const intelligenceTab = tablist.getByRole('tab', { name: 'QDish Intelligence', exact: true });
  await expect(intelligenceTab).toHaveAttribute('aria-selected', 'true');
  await expect(workspace.getByRole('tabpanel')).toHaveCount(1);

  const surveyTab = tablist.getByRole('tab', { name: 'Xu hướng khảo sát QR', exact: true });
  await surveyTab.click();
  await expect(surveyTab).toHaveAttribute('aria-selected', 'true');
  await expect(workspace.getByRole('tabpanel').getByText('Thuần chay')).toBeVisible();

  const peakHoursTab = tablist.getByRole('tab', { name: 'Khung giờ đặt món', exact: true });
  await surveyTab.press('ArrowRight');
  await expect(peakHoursTab).toHaveAttribute('aria-selected', 'true');
  await expect(workspace.getByRole('tabpanel').getByText('Buổi trưa (11:00 - 14:00)')).toBeVisible();
  await expect(workspace.getByRole('tabpanel')).toHaveCount(1);
  expect(customerInsightsRequestCount).toBe(initialRequestCount);

  await workspace.getByRole('button', { name: 'Tháng này', exact: true }).click();
  await expect.poll(() => customerInsightsRequestCount).toBe(initialRequestCount + 1);

  const refreshButton = workspace.getByRole('button', { name: 'Làm mới báo cáo', exact: true });
  await expect(refreshButton).toHaveCount(1);
  await refreshButton.click();
  await expect.poll(() => customerInsightsRequestCount).toBe(initialRequestCount + 2);
  await expect(peakHoursTab).toHaveAttribute('aria-selected', 'true');
});

test('uses a labeled section selector on mobile without horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/owner?tab=insights');

  await expect(page.getByRole('heading', { name: 'Bảng điều khiển' })).toBeVisible();
  await expect(page.getByText('Bowl mẫu', { exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');

  const workspace = page.getByRole('region', { name: 'Phân tích nhà hàng' });
  await expect(workspace).toBeVisible();
  await expect(workspace.getByRole('tablist', { name: 'Chọn nội dung phân tích' })).toHaveCount(0);

  const sectionSelect = workspace.getByRole('combobox', { name: 'Chọn nội dung phân tích' });
  await expect(sectionSelect).toBeVisible();
  await sectionSelect.selectOption({ label: 'Khung giờ đặt món' });
  await expect(workspace.getByRole('tabpanel').getByText('Buổi trưa (11:00 - 14:00)')).toBeVisible();

  const viewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
});
