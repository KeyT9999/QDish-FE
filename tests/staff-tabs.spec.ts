import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const restaurantId = process.env.E2E_RESTAURANT_ID || '000000000000000000000000';
const userId = process.env.E2E_USER_ID || '000000000000000000000001';

const getJwtSecret = () => {
  const envPath = path.resolve(process.cwd(), '../QR_FOOD_ORDER_BE/.env');
  if (!fs.existsSync(envPath)) return 'change-me';

  const match = fs.readFileSync(envPath, 'utf8').match(/^JWT_SECRET=(.*)$/m);
  return match?.[1]?.trim() || 'change-me';
};

const createToken = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    username: 'staff-tab-test',
    role: 'STAFF',
    restaurantId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest('base64url');

  return `${data}.${signature}`;
};

const mockStaffApis = async (page: import('@playwright/test').Page) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === '/api/staff/orders') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }

    if (path === '/api/notifications/unread-count') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 1 })
      });
    }

    if (path === '/api/notifications/test-notification/read') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    }

    if (path === '/api/notifications') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          notifications: [
            {
              id: 'test-notification',
              notificationId: 'test-notification',
              title: 'Kitchen alert test',
              message: 'Kitchen alert test detail',
              type: 'SYSTEM',
              priority: 'NORMAL',
              source: 'AUTO',
              isRead: false,
              createdAt: new Date('2026-05-26T12:00:00.000Z').toISOString()
            }
          ],
          unreadCount: 1,
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1
          }
        })
      });
    }

    return route.continue();
  });
};

test.beforeEach(async ({ context }) => {
  await context.addInitScript((token) => {
    window.localStorage.setItem('qr_food_order_token', token);
  }, createToken());
});

test('staff dashboard switches between orders and notifications without blanking the SPA', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await mockStaffApis(page);
  await page.goto(`${appUrl}/staff?tab=overview`);

  const main = page.locator('main');
  await expect(main).toBeVisible();
  await expect.poll(async () => (await main.innerText()).trim().length).toBeGreaterThan(20);
  await expect(page).toHaveURL(/\/staff\?tab=orders$/);

  const staffNavButtons = page.locator('nav button');
  await expect(staffNavButtons).toHaveCount(2);

  await staffNavButtons.nth(1).click();

  await expect(page).toHaveURL(/\/staff\?tab=notifications$/);
  await expect(main).toBeVisible();
  await expect.poll(async () => (await main.innerText()).trim().length).toBeGreaterThan(20);
  await expect(page.getByText('Kitchen alert test', { exact: true })).toBeVisible();

  const notificationCard = page.locator('button').filter({ hasText: 'Kitchen alert test detail' });
  await expect(notificationCard).toHaveCount(1);
  await notificationCard.click();
  await expect(page.getByText('Kitchen alert test detail')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.getByText('Kitchen alert test detail')).toHaveCount(1);

  await staffNavButtons.nth(0).click();
  await expect(page).toHaveURL(/\/staff\?tab=orders$/);
  await expect(main).toBeVisible();

  await staffNavButtons.nth(1).click();
  await expect(page).toHaveURL(/\/staff\?tab=notifications$/);
  await expect(main).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/staff\?tab=orders$/);
  await expect(main).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/\/staff\?tab=notifications$/);
  await expect(main).toBeVisible();

  await page.reload();
  await expect(page).toHaveURL(/\/staff\?tab=notifications$/);
  await expect(main).toBeVisible();
  await expect.poll(async () => (await main.innerText()).trim().length).toBeGreaterThan(20);

  expect(runtimeErrors).toEqual([]);
  expect(consoleErrors.filter((message) =>
    !message.includes('Failed to load resource') &&
    !message.includes('WebSocket connection')
  )).toEqual([]);
});

test('staff mobile drawer switches tab without crashing layout', async ({ page }) => {
  const runtimeErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await mockStaffApis(page);
  await page.goto(`${appUrl}/staff?tab=orders`);

  const main = page.locator('main');
  await expect(main).toBeVisible();

  await page.locator('header button').first().click();
  const drawerNavButtons = page.locator('.fixed.inset-0.z-50 nav button');
  await expect(drawerNavButtons).toHaveCount(2);

  await drawerNavButtons.nth(1).click();

  await expect(page).toHaveURL(/\/staff\?tab=notifications$/);
  await expect(main).toBeVisible();
  await expect.poll(async () => (await main.innerText()).trim().length).toBeGreaterThan(20);
  await expect(page.getByText('Kitchen alert test', { exact: true })).toBeVisible();

  expect(runtimeErrors).toEqual([]);
  expect(consoleErrors.filter((message) =>
    !message.includes('Failed to load resource') &&
    !message.includes('WebSocket connection')
  )).toEqual([]);
});
