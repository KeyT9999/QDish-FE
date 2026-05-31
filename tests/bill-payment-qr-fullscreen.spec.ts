import { expect, test, type Page } from '@playwright/test';
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
    id: userId,
    username: 'qr-payment-test',
    role: 'STAFF',
    restaurantId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest('base64url');

  return `${data}.${signature}`;
};

const qrDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
    <rect width="320" height="320" fill="white"/>
    <rect x="24" y="24" width="72" height="72" fill="black"/>
    <rect x="40" y="40" width="40" height="40" fill="white"/>
    <rect x="224" y="24" width="72" height="72" fill="black"/>
    <rect x="240" y="40" width="40" height="40" fill="white"/>
    <rect x="24" y="224" width="72" height="72" fill="black"/>
    <rect x="40" y="240" width="40" height="40" fill="white"/>
    <path d="M128 32h24v24h-24zM176 32h24v24h-24zM128 80h24v24h-24zM176 80h48v24h-48zM112 128h24v24h-24zM160 128h24v24h-24zM208 128h24v24h-24zM256 128h24v24h-24zM128 176h72v24h-72zM224 176h24v24h-24zM112 224h24v24h-24zM160 224h24v24h-24zM208 224h72v24h-72zM128 272h24v24h-24zM176 272h24v24h-24zM240 272h40v24h-40z" fill="black"/>
  </svg>
`)}`;

const mockPaymentApis = async (page: Page) => {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname;

    if (pathname === '/api/staff/orders') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    }

    if (pathname === '/api/bills/active') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bills: [{
            billId: 'bill-test-001',
            billCode: 'B10-TEST',
            tableNumber: '10',
            tableSessionId: 'session-test-001',
            sessionCode: 'S10',
            status: 'UNPAID',
            totalAmount: 50000,
            totalItems: 1,
            orderCount: 1,
            orders: []
          }]
        })
      });
    }

    if (pathname === `/api/restaurants/${restaurantId}/payment-settings`) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          settings: {
            restaurantId,
            bankName: 'VietQR Bank',
            bankAccountNumber: '123456789',
            bankAccountHolder: 'Tran Kim Thang',
            bankQrImageUrl: qrDataUri
          }
        })
      });
    }

    if (pathname === '/api/bills/bill-test-001/pay') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bill: {
            id: 'bill-test-001',
            billCode: 'B10-TEST',
            restaurantId,
            tableSessionId: 'session-test-001',
            tableNumber: '10',
            status: 'PAID',
            orderIds: [],
            itemsSnapshot: [],
            subtotal: 50000,
            discountAmount: 0,
            serviceFee: 0,
            taxAmount: 0,
            totalAmount: 50000,
            totalItems: 1
          },
          session: {
            id: 'session-test-001',
            restaurantId,
            tableNumber: '10',
            status: 'CLOSED'
          }
        })
      });
    }

    if (pathname === '/api/notifications/unread-count') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ unreadCount: 0 })
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });
};

const openPaymentModalWithQr = async (page: Page) => {
  await mockPaymentApis(page);
  await page.addInitScript((token) => {
    window.localStorage.setItem('qr_food_order_token', token);
  }, createToken());

  await page.goto(`${appUrl}/staff?tab=orders`);
  await page.getByRole('button', { name: /Thanh toán bill/i }).click();
  await page.getByText(/Chuyển khoản \/ QR/i).click();
  await expect(page.getByAltText(/QR chuyển khoản/i)).toBeVisible();
};

test('bank transfer QR can expand and close without closing payment modal', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openPaymentModalWithQr(page);

  await page.getByRole('button', { name: /Phóng to QR/i }).click();

  const qrDialog = page.getByRole('dialog', { name: /QR chuyển khoản/i });
  await expect(qrDialog).toBeVisible();
  await expect(qrDialog.getByAltText(/QR chuyển khoản phóng to/i)).toBeVisible();
  await expect(qrDialog.getByText(/Tran Kim Thang/i)).toBeVisible();
  await expect(qrDialog.getByText(/VietQR Bank/i)).toBeVisible();
  await expect(qrDialog.getByText(/50\.000/i)).toBeVisible();

  await qrDialog.getByRole('button', { name: /Đóng QR phóng to/i }).click();

  await expect(qrDialog).toBeHidden();
  await expect(page.getByRole('dialog', { name: /Thanh toán bill/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Xác nhận đã nhận tiền/i })).toBeVisible();
});

test('bank transfer QR expands from preview and fits mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPaymentModalWithQr(page);

  await page.getByAltText(/QR chuyển khoản/i).click();

  const qrDialog = page.getByRole('dialog', { name: /QR chuyển khoản/i });
  const enlargedQr = qrDialog.getByAltText(/QR chuyển khoản phóng to/i);
  await expect(qrDialog).toBeVisible();
  await expect(enlargedQr).toBeVisible();

  const box = await enlargedQr.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(390 * 0.92);

  await page.keyboard.press('Escape');
  await expect(qrDialog).toBeHidden();
  await expect(page.getByRole('dialog', { name: /Thanh toán bill/i })).toBeVisible();
});
