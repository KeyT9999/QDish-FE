import { expect, test } from '@playwright/test';

const makeOrder = (status: 'CONFIRMED' | 'SERVED') => ({
  id: 'order-served-feedback-1',
  restaurantId: '000000000000000000000000',
  tableNumber: 'Bàn 4',
  items: [{ menuItemId: 'menu-1', name: 'Bowl rau củ', price: 125000, quantity: 1 }],
  totalAmount: 125000,
  status,
  createdAt: '2026-09-26T10:00:00.000Z'
});

test('Ra món gives immediate pending feedback, blocks repeat clicks, and shows one localized success toast', async ({ page }) => {
  let patchCount = 0;
  let currentOrder = makeOrder('CONFIRMED');

  await page.addInitScript(() => {
    const payload = btoa(JSON.stringify({
      sub: '000000000000000000000001',
      username: 'kitchen-test',
      role: 'STAFF',
      restaurantId: '000000000000000000000000',
      exp: Math.floor(Date.now() / 1000) + 3600
    })).replace(/=+$/, '');
    localStorage.setItem('qr_food_order_token', `e30.${payload}.test-signature`);
  });

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/api/staff/orders' && request.method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([currentOrder]) });
    }

    if (url.pathname === '/api/bills/active') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bills: [] }) });
    }

    if (url.pathname === '/api/notifications/unread-count') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
    }

    if (url.pathname === '/api/notifications') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [], unreadCount: 0, pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } })
      });
    }

    if (url.pathname === '/api/staff/orders/order-served-feedback-1' && request.method() === 'PATCH') {
      patchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 900));
      currentOrder = makeOrder('SERVED');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentOrder) });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  await page.goto('/staff?tab=orders');

  const serveButton = page.getByRole('button', { name: 'Ra món', exact: true });
  await expect(serveButton).toBeVisible();
  await serveButton.click();

  const pendingButton = page.getByRole('button', { name: 'Đang ra món…', exact: true });
  await expect(pendingButton).toBeDisabled();
  await expect.poll(() => patchCount).toBe(1);

  await pendingButton.evaluate((button) => (button as HTMLButtonElement).click());
  await expect.poll(() => patchCount).toBe(1);

  await expect(page.getByText('Đã ra món thành công', { exact: true })).toBeVisible();
  await expect(page.getByText('Đã ra món thành công', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Đã phục vụ (Served)', { exact: true })).toBeVisible();
});

test('restaurant owner order workspace uses the same single-submit feedback', async ({ page }) => {
  const restaurantId = '000000000000000000000002';
  let patchCount = 0;
  let currentOrder = makeOrder('CONFIRMED');
  const restaurant = {
    id: restaurantId,
    _id: restaurantId,
    name: 'Nhà hàng kiểm thử',
    ownerName: 'Chủ quán',
    address: 'Đà Nẵng',
    phone: '0900000000',
    email: 'owner@example.test',
    features: {}
  };

  await page.addInitScript((selectedRestaurantId) => {
    const payload = btoa(JSON.stringify({
      sub: '000000000000000000000003',
      username: 'owner-test',
      role: 'RESTAURANT_OWNER',
      exp: Math.floor(Date.now() / 1000) + 3600
    })).replace(/=+$/, '');
    localStorage.setItem('qr_food_order_token', `e30.${payload}.test-signature`);
    localStorage.setItem('selected_restaurant_id', selectedRestaurantId);
  }, restaurantId);

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === '/api/owner/restaurants') {
      const body = url.searchParams.get('archived') === 'true' ? [] : [restaurant];
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    }

    if (url.pathname === '/api/restaurants/me') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(restaurant) });
    }

    if (url.pathname === '/api/bills') {
      const bill = {
        billId: 'bill-served-feedback-1',
        billCode: 'BILL-004',
        tableNumber: 'Bàn 4',
        tableSessionId: 'session-4',
        sessionCode: 'T04-SESSION',
        status: 'UNPAID',
        totalAmount: 125000,
        totalItems: 1,
        orderCount: 1,
        orders: [currentOrder]
      };
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bills: [bill], page: 1, limit: 50, total: 1, totalPages: 1 })
      });
    }

    if (url.pathname === '/api/notifications/unread-count') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ unreadCount: 0 }) });
    }

    if (url.pathname === '/api/staff/orders/order-served-feedback-1' && request.method() === 'PATCH') {
      patchCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 800));
      currentOrder = makeOrder('SERVED');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentOrder) });
    }

    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });

  await page.goto('/owner?tab=orders');

  const serveButton = page.getByRole('button', { name: 'Ra món', exact: true });
  await expect(serveButton).toBeVisible();
  await serveButton.click();

  const pendingButton = page.getByRole('button', { name: 'Đang ra món…', exact: true });
  await expect(pendingButton).toBeDisabled();
  await expect.poll(() => patchCount).toBe(1);
  await expect(page.getByText('Đã ra món thành công', { exact: true })).toBeVisible();
  await expect(page.getByText('Đã ra món thành công', { exact: true })).toHaveCount(1);
});
