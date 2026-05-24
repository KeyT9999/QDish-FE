import { test, expect } from '@playwright/test';
import { createHmac } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const appUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
const restaurantId = process.env.E2E_RESTAURANT_ID || '000000000000000000000000';
const userId = process.env.E2E_USER_ID || '000000000000000000000001';
const mojibakePattern = /Ã|Ä|áº|á»|Â|Æ|â€|�/;

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
    username: 'comtamfamily',
    role: 'RESTAURANT_ADMIN',
    restaurantId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  })).toString('base64url');
  const data = `${header}.${payload}`;
  const signature = createHmac('sha256', getJwtSecret()).update(data).digest('base64url');
  return `${data}.${signature}`;
};

const cases = [
  {
    tab: 'overview',
    expected: ['Bảng điều khiển', 'Chào mừng quay lại', 'Số liệu kinh doanh']
  },
  {
    tab: 'orders',
    expected: ['Danh sách đơn hàng hiện tại', 'Chưa có đơn hàng nào']
  },
  {
    tab: 'menu',
    expected: ['Quản lý Món ăn', 'Thêm món mới', 'Tên món', 'Giá', 'Danh mục', 'Chỉ số QDish', 'Trạng thái', 'Thao tác', 'Chưa có món ăn nào']
  },
  {
    tab: 'categories',
    expected: ['Quản lý Danh mục món ăn', 'Thêm danh mục', 'Chưa có danh mục nào']
  },
  {
    tab: 'tables',
    expected: ['Đồng bộ bàn ăn & Sinh mã QR', 'Danh sách bàn & Preview mã QR dẫn bàn', 'Chưa có bàn ăn nào được lưu']
  },
  {
    tab: 'staff',
    expected: ['Quản lý Nhân viên', 'Thêm nhân viên mới']
  },
  {
    tab: 'settings',
    expected: ['Thiết lập cấu hình nhà hàng', 'Thông tin nhà hàng']
  }
];

test.beforeEach(async ({ context }) => {
  await context.addInitScript((token) => {
    window.localStorage.setItem('qr_food_order_token', token);
  }, createToken());
});

for (const item of cases) {
  test(`dashboard ${item.tab} has clean Vietnamese text`, async ({ page }) => {
    await page.goto(`${appUrl}/dashboard?tab=${item.tab}`);

    for (const text of item.expected) {
      await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
    }

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(mojibakePattern);
  });
}
