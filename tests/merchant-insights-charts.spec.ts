import { test, expect } from '@playwright/test';

const createToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: 'user-1',
    username: 'test-admin',
    role: 'RESTAURANT_ADMIN',
    restaurantId: 'restaurant-1'
  })).toString('base64url');

  return `${header}.${payload}.test`;
};

const restaurant = {
  id: 'restaurant-1',
  name: 'Bếp Nhà Mình',
  username: 'bepnhaminh',
  ownerName: 'Nguyễn An',
  email: 'test@example.com',
  address: 'Hà Nội',
  phone: '0900000000',
  status: 'ACTIVE',
  active: true,
  features: {
    fitScoreEnabled: true,
    foodAttributesEnabled: true,
    recommendationEnabled: true,
    personalizedMenuEnabled: true,
    advancedAnalyticsEnabled: true,
    customerInsightsEnabled: true,
    customerCrmEnabled: true
  }
};

const stats = {
  period: { startDate: '2026-09-26', endDate: '2026-09-26' },
  previousPeriod: { startDate: '2026-09-25', endDate: '2026-09-25' },
  overview: {
    totalRevenue: 1200000,
    previousRevenue: 900000,
    revenueChange: 33.33,
    totalOrders: 18,
    previousOrders: 14,
    ordersChange: 28.57,
    averageOrderValue: 66667,
    previousAverageOrderValue: 64286,
    totalCustomers: 12,
    cancellationRate: 5.26,
    averageProcessingTime: 14,
    topSellingItem: { name: 'Cơm gà', quantity: 8 },
    peakHour: 12
  },
  revenueByDate: [
    { date: '2026-09-26', revenue: 1200000, orders: 18 }
  ],
  revenueByHour: [
    { hour: 12, revenue: 520000, orders: 8 },
    { hour: 19, revenue: 420000, orders: 6 }
  ],
  topMenuItems: [
    { menuItemId: 'dish-1', name: 'Cơm gà', quantity: 8, revenue: 640000 },
    { menuItemId: 'dish-2', name: 'Trà đào', quantity: 4, revenue: 120000 }
  ],
  revenueByCategory: [
    { category: 'Món chính', revenue: 640000, quantity: 8 },
    { category: 'Đồ uống', revenue: 120000, quantity: 4 }
  ],
  revenueByTable: [{ tableNumber: 'Bàn 1', revenue: 520000, orders: 8 }],
  ordersByStatus: { pending: 1, confirmed: 2, served: 3, completed: 12, cancelled: 1 },
  largestOrders: []
};

const insights = {
  menuCoverage: { totalItems: 10, itemsWithRecipe: 8, coveragePct: 80 },
  attributeDistribution: { HIGH_PROTEIN: 4 },
  topDishes: [{ dishId: 'dish-1', name: 'Cơm gà', orderCount: 8, revenue: 640000 }],
  customerSegments: [{ segment: 'BALANCED', count: 6, label: 'Cân bằng' }],
  surveyResponseCount: 20,
  gapAnalysis: ['Bổ sung món chay'],
  peakHours: {
    periods: [{ period: 'Bữa trưa', count: 8, percentage: 44 }],
    hourly: Array.from({ length: 24 }, (_, hour) => hour === 12 ? 8 : 0)
  }
};

const chartTitles = [
  'Doanh thu và số đơn theo thời gian',
  'Khung giờ đặt món',
  'Top món bán chạy',
  'Doanh thu theo danh mục',
  'Trạng thái đơn hàng',
  'Phân khúc khách hàng'
];

test('opens and closes the merchant chart explorer without runtime errors', async ({ page }) => {
  const consoleProblems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleProblems.push(message.text());
    }
  });
  page.on('pageerror', (error) => consoleProblems.push(error.message));

  await page.route('**/api/restaurants/me', async (route) => {
    await route.fulfill({ json: restaurant });
  });
  await page.route('**/api/restaurants/me/stats*', async (route) => {
    await route.fulfill({ json: stats });
  });
  await page.route('**/api/restaurants/customer-insights*', async (route) => {
    await route.fulfill({ json: insights });
  });
  await page.route('**/api/menu*', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/categories*', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/bills*', async (route) => {
    await route.fulfill({ json: { bills: [], page: 1, limit: 50, total: 0, totalPages: 1 } });
  });
  await page.route('**/api/tables*', async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route('**/api/restaurants/customers*', async (route) => {
    await route.fulfill({
      json: {
        data: [],
        pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 1 }
      }
    });
  });
  await page.route('**/api/notifications**', async (route) => {
    if (route.request().url().includes('/unread-count')) {
      await route.fulfill({ json: { unreadCount: 0 } });
      return;
    }

    await route.fulfill({
      json: {
        notifications: [],
        unreadCount: 0,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 1 }
      }
    });
  });

  await page.addInitScript((token) => {
    window.localStorage.setItem('qr_food_order_token', token);
  }, createToken());

  await page.goto('/dashboard?tab=insights');
  await expect(page.getByRole('button', { name: 'Xem biểu đồ' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Biến số liệu thành việc nên làm' })).toBeVisible();

  await page.getByRole('button', { name: 'Xem biểu đồ' }).click();
  const chartRegion = page.getByRole('region', { name: 'Bảng điều khiển biểu đồ' });
  await expect(chartRegion).toBeVisible();

  for (const title of chartTitles) {
    await expect(chartRegion.getByRole('heading', { name: title })).toBeVisible();
  }

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('button', { name: 'Ẩn biểu đồ' }).click();
  await expect(chartRegion).toBeHidden();

  await page.goto('/dashboard?tab=orders');
  await expect(page.getByRole('heading', { name: 'Trạng thái đơn hàng' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Đơn hàng giá trị cao' })).toBeVisible();

  await page.goto('/dashboard?tab=menu');
  await expect(page.getByRole('heading', { name: 'Top món bán chạy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Doanh thu theo danh mục' })).toBeVisible();

  await page.goto('/dashboard?tab=tables');
  await expect(page.getByRole('heading', { name: 'Hiệu quả từng bàn' })).toBeVisible();

  await page.goto('/dashboard?tab=customers');
  await expect(page.getByRole('heading', { name: 'Phân khúc khách hàng' })).toBeVisible();
  await expect(page.getByText(/Đã ghi nhận 20 lượt khảo sát/)).toBeVisible();

  expect(consoleProblems).toEqual([]);
});
