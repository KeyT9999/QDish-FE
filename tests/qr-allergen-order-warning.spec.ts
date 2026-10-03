import { expect, test } from '@playwright/test';

const restaurantId = '507f1f77bcf86cd799439011';

const menuItems = [
  {
    _id: '507f1f77bcf86cd799439012',
    restaurantId,
    name: 'Gỏi hạt điều',
    description: 'Rau thơm và hạt điều rang',
    price: 42000,
    category: 'Món chính',
    imageUrl: '',
    available: true,
    allergens: ['NUTS'],
    allergenInfoStatus: 'REVIEWED',
  },
  {
    _id: '507f1f77bcf86cd799439013',
    restaurantId,
    name: 'Bánh hạnh nhân',
    description: 'Món chưa được kiểm tra thông tin dị ứng',
    price: 35000,
    category: 'Tráng miệng',
    imageUrl: '',
    available: true,
    allergens: ['NUTS'],
    allergenInfoStatus: 'UNKNOWN',
  },
];

test('free QR guest sees allergen warnings and may still place the order', async ({ page }) => {
  let submittedOrder: Record<string, unknown> | undefined;

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === `/api/restaurants/public/${restaurantId}`) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: restaurantId,
          name: 'Nhà hàng thử nghiệm',
          username: 'allergen-test',
          ownerName: 'Owner',
          email: 'owner@example.test',
          address: '1 Test Street',
          phone: '0000000000',
          status: 'ACTIVE',
          active: true,
          features: {
            fitScoreEnabled: false,
            foodAttributesEnabled: false,
            recommendationEnabled: false,
            personalizedMenuEnabled: false,
          },
        }),
      });
    }

    if (url.pathname === '/api/menu') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(menuItems) });
    }

    if (url.pathname === '/api/categories') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }

    if (url.pathname === '/api/table-sessions/resolve') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            _id: '507f1f77bcf86cd799439099',
            restaurantId,
            tableNumber: '1',
            sessionCode: 'T1-TEST',
            status: 'OPEN',
          },
        }),
      });
    }

    if (url.pathname === '/api/orders' && request.method() === 'POST') {
      submittedOrder = request.postDataJSON() as Record<string, unknown>;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: '507f1f77bcf86cd799439088',
          restaurantId,
          tableNumber: '1',
          items: [],
          totalAmount: 42000,
          status: 'PENDING',
          timestamp: Date.now(),
        }),
      });
    }

    if (url.pathname === '/api/orders') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }

    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  await page.goto(`/order?r=${restaurantId}&t=1`);

  await expect(page.getByRole('heading', { name: 'Tránh chất gây dị ứng' })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /Các loại hạt/ }).click();
  await page.getByRole('button', { name: /Lưu thông tin dị ứng/ }).click();

  await expect(page.getByText('Món này có chứa các loại hạt bạn đã khai báo dị ứng.')).toBeVisible();
  await expect(page.getByText('Chưa xác nhận thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.')).toBeVisible();

  await page.getByRole('button', { name: 'Thêm món Gỏi hạt điều' }).click();
  await page.getByRole('button', { name: /Xem giỏ hàng/ }).click();
  await expect(page.getByLabel('Giỏ hàng của bạn').getByText('Món này có chứa các loại hạt bạn đã khai báo dị ứng.')).toBeVisible();
  await page.getByRole('button', { name: /Tiếp tục/ }).click();
  await page.getByRole('button', { name: 'Xác nhận đặt món' }).click();

  await expect.poll(() => submittedOrder).toBeDefined();
  expect(submittedOrder).toMatchObject({
    reportedAllergies: ['NUTS'],
    items: [{ menuItemId: menuItems[0]._id, quantity: 1 }],
  });
  expect(JSON.stringify(submittedOrder?.items)).not.toContain('allergenWarnings');
  expect(JSON.stringify(submittedOrder?.items)).not.toContain('allergenInfoStatus');
});
