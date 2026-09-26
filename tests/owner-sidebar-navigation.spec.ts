import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';

const restaurantId = '000000000000000000000004';

const createOwnerToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: 'owner-sidebar-test',
    username: 'owner-sidebar-test',
    role: 'RESTAURANT_OWNER',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', 'owner-sidebar-playwright-test').update(data).digest('base64url');
  return `${data}.${signature}`;
};

const restaurant = {
  id: restaurantId,
  _id: restaurantId,
  name: 'Bếp Sidebar',
  ownerName: 'Chủ nhà hàng',
  address: '12 Đường Mẫu',
  phone: '0900000000',
  email: 'owner@example.test',
  features: {
    personalizedMenuEnabled: true,
    customerInsightsEnabled: true,
    customerCrmEnabled: true,
  },
};

const stats = {
  period: { startDate: '2026-09-26', endDate: '2026-09-26' },
  previousPeriod: { startDate: '2026-09-25', endDate: '2026-09-25' },
  overview: {
    totalRevenue: 0,
    previousRevenue: 0,
    revenueChange: null,
    totalOrders: 0,
    previousOrders: 0,
    ordersChange: null,
    averageOrderValue: 0,
    previousAverageOrderValue: 0,
    totalCustomers: 0,
    cancellationRate: 0,
    averageProcessingTime: 0,
    topSellingItem: null,
    peakHour: 0,
  },
  revenueByDate: [],
  revenueByHour: [],
  topMenuItems: [],
  revenueByCategory: [],
  revenueByTable: [],
  ordersByStatus: { pending: 0, confirmed: 0, served: 0, completed: 0, cancelled: 0 },
  largestOrders: [],
};

const customerInsights = {
  menuCoverage: { totalItems: 0, itemsWithRecipe: 0, coveragePct: 0 },
  attributeDistribution: {},
  topDishes: [],
  customerSegments: [],
  surveyResponseCount: 0,
  gapAnalysis: [],
  peakHours: { periods: [], hourly: [] },
};

const installApiFixtures = async (context: Parameters<typeof test.beforeEach>[0]['context'], layoutWins: boolean) => {
  await context.addInitScript(({ token }) => {
    window.localStorage.setItem('qr_food_order_token', token);
    window.localStorage.removeItem('selected_restaurant_id');
  }, { token: createOwnerToken() });

  await context.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === '/api/owner/restaurants') {
      const isLayoutRequest = !url.searchParams.has('period') && !url.searchParams.has('archived');
      const shouldDelay = layoutWins ? !isLayoutRequest : isLayoutRequest;
      if (shouldDelay) await new Promise((resolve) => setTimeout(resolve, 500));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(url.searchParams.get('archived') === 'true' ? [] : [{ ...restaurant }]),
      });
      return;
    }

    if (url.pathname === '/api/restaurants/me') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(restaurant) });
      return;
    }

    if (url.pathname === '/api/restaurants/me/stats') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stats) });
      return;
    }

    if (url.pathname === '/api/restaurants/customer-insights') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(customerInsights) });
      return;
    }

    if (url.pathname === '/api/notifications/unread-count') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
      return;
    }

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
};

for (const layoutWins of [true, false]) {
  test(`switches from owner home to Overview without reload when ${layoutWins ? 'layout' : 'owner'} response wins`, async ({ page, context }) => {
    let documentRequestCount = 0;
    page.on('request', (request) => {
      if (request.resourceType() === 'document') documentRequestCount += 1;
    });
    await installApiFixtures(context, layoutWins);

    await page.goto('/owner');
    const overviewButton = page.getByRole('button', { name: 'Tổng quan', exact: true });
    await expect(overviewButton).toBeVisible();
    await overviewButton.click();

    await expect(page).toHaveURL(/\/owner\?tab=overview$/);
    await expect(page.getByRole('heading', { name: 'Số liệu kinh doanh' })).toBeVisible();
    await expect(page.getByText('Xin chào, owner-sidebar-test!', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Phân tích thực đơn', exact: true }).click();
    await expect(page).toHaveURL(/\/owner\?tab=insights$/);
    await expect(page.getByRole('region', { name: 'Phân tích nhà hàng' })).toBeVisible();

    await page.getByRole('button', { name: 'Đơn hàng', exact: true }).click();
    await expect(page).toHaveURL(/\/owner\?tab=orders$/);
    await expect(page.getByRole('heading', { name: 'Đơn hàng theo bill' })).toBeVisible();

    await page.getByRole('button', { name: 'Thực đơn', exact: true }).click();
    await expect(page).toHaveURL(/\/owner\?tab=menu$/);
    await expect(page.getByRole('heading', { name: 'Quản lý Món ăn (Menu)' })).toBeVisible();
    expect(documentRequestCount).toBe(1);
  });
}
