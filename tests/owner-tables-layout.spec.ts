import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const restaurantId = '000000000000000000000002';
const userId = '000000000000000000000003';

const getJwtSecret = () => {
  const envPath = path.resolve(process.cwd(), '../QR_FOOD_ORDER_BE/.env');
  if (!fs.existsSync(envPath)) return 'change-me';

  const match = fs.readFileSync(envPath, 'utf8').match(/^JWT_SECRET=(.*)$/m);
  return match?.[1]?.trim() || 'change-me';
};

const createOwnerToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    username: 'owner-test',
    role: 'RESTAURANT_OWNER',
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest('base64url');
  return `${data}.${signature}`;
};

const tables = [
  ...Array.from({ length: 7 }, (_, index) => ({
    _id: `table-${index + 1}`,
    restaurantId,
    code: String(index + 1).padStart(2, '0'),
    status: 'AVAILABLE',
  })),
  ...Array.from({ length: 3 }, (_, index) => ({
    _id: `occupied-${index + 8}`,
    restaurantId,
    code: String(index + 8).padStart(2, '0'),
    status: index === 2 ? 'PAYMENT_PENDING' : 'OCCUPIED',
    activeSessionId: index === 2 ? undefined : `session-${index + 8}`,
    currentSessionCode: `T${String(index + 8).padStart(2, '0')}-20260914-014619`,
  })),
];

const currentBill = {
  _id: 'bill-10',
  restaurantId,
  tableSessionId: 'session-10',
  tableNumber: '10',
  sessionCode: 'T10-20260914-014619',
  billCode: 'BILL-T10',
  status: 'UNPAID',
  orderIds: ['order-10'],
  itemsSnapshot: [{ name: 'Phở bò', quantity: 2, unitPrice: 50000, totalPrice: 100000 }],
  subtotal: 100000,
  discountAmount: 0,
  serviceFee: 0,
  taxAmount: 0,
  totalAmount: 100000,
  totalItems: 2,
};

const mockApi = async (page: Page) => {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    let body: unknown = [];

    if (url.pathname === '/api/owner/restaurants') {
      body = [{ id: restaurantId, _id: restaurantId, name: 'Bếp Xanh', ownerName: 'Chủ nhà hàng' }];
    } else if (url.pathname === '/api/restaurants/me') {
      body = { id: restaurantId, _id: restaurantId, name: 'Bếp Xanh', ownerName: 'Chủ nhà hàng' };
    } else if (url.pathname === '/api/tables') {
      body = tables;
    } else if (url.pathname === '/api/bills/current') {
      body = {
        session: { _id: 'session-10', restaurantId, tableNumber: '10', status: 'OPEN' },
        bill: currentBill,
        orders: [],
      };
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
};

test.beforeEach(async ({ context, page }) => {
  await context.addInitScript(({ token, selectedRestaurantId }) => {
    window.localStorage.setItem('qr_food_order_token', token);
    window.localStorage.setItem('selected_restaurant_id', selectedRestaurantId);
  }, { token: createOwnerToken(), selectedRestaurantId: restaurantId });

  await mockApi(page);
});

test('renders table cards instead of a wide table at tablet width', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(`${appUrl}/owner?tab=tables`);

  await expect(page.getByText('Bàn 10', { exact: true })).toBeVisible();
  await expect(page.locator('[data-slot="table-container"]')).toHaveCount(0);

  const viewport = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
});

test('keeps phone cards and the desktop breakpoint within the viewport', async ({ page }) => {
  for (const width of [320, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${appUrl}/owner?tab=tables`);

    await expect(page.getByText('Bàn 10', { exact: true })).toBeVisible();

    const viewport = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

    if (width < 1024) {
      await expect(page.locator('[data-slot="table-container"]')).toHaveCount(0);
    } else {
      await expect(page.locator('[data-slot="table-container"]')).toHaveCount(1);
    }
  }
});

test('keeps the desktop table inside its scroll container', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${appUrl}/owner?tab=tables`);

  await expect(page.getByText('Danh sách bàn & mã QR dẫn bàn', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Mở thao tác bàn 10' }).click();
  await expect(page.getByRole('menuitem', { name: 'Xem bill' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Thanh toán bill' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Xem bill' }).click();
  await expect(page.getByRole('menuitem', { name: 'Xem bill' })).toBeHidden();
  const currentBillCard = page.getByText('Bill hiện tại: BILL-T10', { exact: true });
  await expect(currentBillCard).toBeVisible();
  await expect(currentBillCard).toBeInViewport();

  const tableContainer = page.locator('[data-slot="table-container"]');
  const dimensions = await tableContainer.evaluate((element) => ({
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
    columnWidths: Array.from(element.querySelectorAll('thead th')).map((cell) => cell.getBoundingClientRect().width),
  }));
  // Browser layout rounds fractional table widths up by at most one pixel.
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  expect(dimensions.columnWidths.every((width) => width >= 100)).toBe(true);
  expect(dimensions.columnWidths[3]).toBeLessThan(
    dimensions.columnWidths.slice(0, 3).reduce((total, width) => total + width, 0) + dimensions.columnWidths[4]
  );
});
