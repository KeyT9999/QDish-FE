import { test, expect, type Page } from '@playwright/test';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const userId = process.env.E2E_USER_ID || '000000000000000000000001';
const restaurantId = process.env.E2E_RESTAURANT_ID || '000000000000000000000000';
const mojibakePattern = /Ã|Ä|áº|á»|Â|Æ|â€|�/;

const getJwtSecret = () => {
  const envPath = path.resolve(process.cwd(), '../QR_FOOD_ORDER_BE/.env');
  if (!fs.existsSync(envPath)) return 'change-me';

  const match = fs.readFileSync(envPath, 'utf8').match(/^JWT_SECRET=(.*)$/m);
  return match?.[1]?.trim() || 'change-me';
};

const createToken = (role: string) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    id: userId,
    username: 'encoding-test',
    email: 'encoding-test@example.com',
    role,
    restaurantId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest('base64url');
  return `${data}.${signature}`;
};

const notificationPayload = {
  notifications: [
    {
      id: 'notification-recipient-id',
      notificationId: 'notification-id',
      title: 'Thông báo tiếng Việt',
      message: 'Nhận thông báo tức thì thông minh và chính xác hơn từ Chủ nhà hàng của bạn.',
      type: 'SYSTEM',
      priority: 'NORMAL',
      source: 'MANUAL',
      senderRole: 'RESTAURANT_OWNER',
      sender: {
        id: 'owner-id',
        name: 'Chủ nhà hàng'
      },
      restaurant: {
        name: 'QDISH Việt Nam'
      },
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ],
  unreadCount: 1,
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1
  }
};

const installNotificationMocks = async (page: Page) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (pathname === '/api/notifications') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(notificationPayload)
      });
    }

    if (pathname === '/api/notifications/unread-count') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ unreadCount: 1 })
      });
    }

    if (pathname === '/api/notifications/notification-recipient-id/read') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({ success: true })
      });
    }

    if (pathname === '/api/admin/notifications/targets') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          owners: [{ id: userId, fullName: 'Chủ nhà hàng', username: 'owner' }],
          restaurants: [{ id: restaurantId, name: 'QDISH Việt Nam', ownerId: userId }]
        })
      });
    }

    if (pathname === '/api/owner/notifications/targets') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          restaurants: [{ id: restaurantId, name: 'QDISH Việt Nam' }]
        })
      });
    }

    if (pathname === '/api/owner/restaurants') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify([{ id: restaurantId, _id: restaurantId, name: 'QDISH Việt Nam' }])
      });
    }

    if (pathname === '/api/restaurants/me') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          id: restaurantId,
          _id: restaurantId,
          name: 'QDISH Việt Nam',
          ownerName: 'Chủ nhà hàng',
          username: 'restaurant-admin',
          email: 'restaurant@example.com',
          address: 'Việt Nam',
          phone: '0900000000',
          active: true,
          status: 'ACTIVE'
        })
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({})
    });
  });
};

const openRouteWithRole = async (page: Page, url: string, role: string) => {
  await installNotificationMocks(page);
  await page.addInitScript(({ token, restId }) => {
    window.localStorage.setItem('qr_food_order_token', token);
    window.localStorage.setItem('selected_restaurant_id', restId);
  }, { token: createToken(role), restId: restaurantId });
  await page.goto(`${appUrl}${url}`);
};

const expectCleanVietnamese = async (page: Page) => {
  await expect(page.getByText('Thông báo tiếng Việt', { exact: true })).toBeVisible();

  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toContain('Chưa đọc');
  expect(bodyText).toContain('Gói dịch vụ');
  expect(bodyText).toContain('Thanh toán');
  expect(bodyText).toContain('Hệ thống');
  expect(bodyText).toContain('Thông tin');
  expect(bodyText).not.toMatch(mojibakePattern);
};

test('notification pages render Vietnamese without mojibake', async ({ page }) => {
  const cases = [
    { url: '/staff?tab=notifications', role: 'STAFF' },
    { url: '/owner?tab=notifications', role: 'RESTAURANT_OWNER' },
    { url: '/dashboard?tab=notifications', role: 'RESTAURANT_ADMIN' },
    { url: '/super-admin?tab=notifications', role: 'SUPER_ADMIN' },
  ];

  for (const item of cases) {
    await openRouteWithRole(page, item.url, item.role);
    await expectCleanVietnamese(page);
  }
});

test('notification bell dropdown and detail modal keep Vietnamese accents', async ({ page }) => {
  await openRouteWithRole(page, '/staff?tab=orders', 'STAFF');

  await page.getByLabel('Thông báo').click();
  await expect(page.getByText('Thông báo tiếng Việt', { exact: true })).toBeVisible();

  const dropdownText = await page.locator('body').innerText();
  expect(dropdownText).not.toMatch(mojibakePattern);

  await page.locator('button').filter({ hasText: 'Thông báo tiếng Việt' }).click();
  await expect(page.getByText('Nhận thông báo tức thì thông minh và chính xác hơn từ Chủ nhà hàng của bạn.')).toBeVisible();
  await expect(page.getByText('Nguồn gửi', { exact: true })).toBeVisible();

  const modalText = await page.locator('body').innerText();
  expect(modalText).not.toMatch(mojibakePattern);
});
