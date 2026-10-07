import { expect, test, type Page, type Route } from '@playwright/test';
import { createHmac } from 'node:crypto';
import type { MenuItemTranslationValue, TranslationReviewEntry } from '../src/types/menuTranslation';

const restaurantId = '507f1f77bcf86cd799439091';
const items = [
  {
    _id: '507f1f77bcf86cd799439092',
    restaurantId,
    name: 'Phở bò',
    description: 'Nước dùng bò hầm.',
    translations: {
      en: { name: 'Beef pho', description: 'Rice noodles in slow-simmered beef broth.' },
      'zh-CN': { name: '越南牛肉粉', description: '米粉搭配慢炖牛肉汤。' },
    },
    price: 52000,
    category: 'Món nước',
    categoryId: '507f1f77bcf86cd799439093',
    imageUrl: '',
    available: true,
    allergens: [],
    reviewedAllergens: [],
    mayContainAllergens: [],
    allergenInfoStatus: 'REVIEWED',
  },
  {
    _id: '507f1f77bcf86cd799439094',
    restaurantId,
    name: 'Cơm tấm',
    description: 'Sườn nướng với cơm tấm.',
    translations: {},
    price: 48000,
    category: 'Món chính',
    imageUrl: '',
    available: true,
    allergens: [],
    allergenInfoStatus: 'UNKNOWN',
  },
];

test('QR guest switches languages, falls back to Vietnamese, and submits the Vietnamese dish name', async ({ page }) => {
  let submittedOrder: Record<string, unknown> | undefined;

  await page.addInitScript(() => {
    localStorage.setItem('qdish_dining_onboarding_handled', '1');
    localStorage.setItem('qdish_allergy_disclosure_handled_v1', '1');
  });

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
          username: 'multilingual-test',
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
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(items) });
    }
    if (url.pathname === '/api/categories') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { _id: '507f1f77bcf86cd799439093', restaurantId, name: 'Món nước', translations: { en: { name: 'Noodle soups' }, 'zh-CN': { name: '汤粉类' } } },
          { _id: '507f1f77bcf86cd799439095', restaurantId, name: 'Món chính', translations: {} },
        ]),
      });
    }
    if (url.pathname === '/api/table-sessions/resolve') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session: { _id: '507f1f77bcf86cd799439099', restaurantId, tableNumber: '1', sessionCode: 'T1-TEST', status: 'OPEN' } }),
      });
    }
    if (url.pathname === '/api/orders' && request.method() === 'POST') {
      submittedOrder = request.postDataJSON() as Record<string, unknown>;
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ _id: '507f1f77bcf86cd799439088', restaurantId, tableNumber: '1', items: [], totalAmount: 52000, status: 'PENDING', timestamp: Date.now() }),
      });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  await page.goto(`/order?r=${restaurantId}&t=1`);
  const selector = page.getByTestId('menu-language-selector');
  await expect(selector).toBeVisible();

  await selector.getByRole('button', { name: 'English' }).click();
  await expect(page.getByText('Beef pho', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Noodle soups' })).toBeVisible();
  await expect(page.getByText('Cơm tấm', { exact: true })).toBeVisible();
  await page.getByText('Beef pho', { exact: true }).click();
  await expect(page.getByText('Rice noodles in slow-simmered beef broth.', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Back to menu' }).click();

  await selector.getByRole('button', { name: '中文' }).click();
  await expect(page.getByText('越南牛肉粉', { exact: true }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: '汤粉类' })).toBeVisible();
  await expect(page.getByText('Cơm tấm', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('menu-language-selector').getByRole('button', { name: '中文' })).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: '添加 越南牛肉粉' }).click();
  await page.getByRole('button', { name: /查看购物车/ }).click();
  await expect(page.getByText('越南牛肉粉', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: /继续/ }).click();
  await page.getByRole('button', { name: '确认下单' }).click();

  await expect.poll(() => submittedOrder).toBeDefined();
  expect(submittedOrder).toMatchObject({
    items: [{ menuItemId: items[0]._id, name: 'Phở bò', quantity: 1 }],
  });
});

type ManagedEntry = TranslationReviewEntry<MenuItemTranslationValue>;
type ManagedDish = Omit<typeof items[number], 'translations'> & {
  translations: Partial<Record<'en' | 'zhCN', ManagedEntry>>;
};

const approvedEntry = (name: string, description = `${name} approved description`): ManagedEntry => ({
  displayStatus: 'APPROVED', approved: { status: 'APPROVED', value: { name, description } },
});
const draftEntry = (name: string, description = `${name} draft description`): ManagedEntry => ({
  displayStatus: 'DRAFT', draft: { generatedAt: '2026-10-07T00:00:00.000Z', value: { name, description } },
});
const managedDish = (suffix: number, name: string, translations: ManagedDish['translations'] = {}, available = true): ManagedDish => ({
  ...items[1], _id: `507f1f77bcf86cd799439${suffix}`, name, available, translations,
});
const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
};

async function installBulkMenuApi(page: Page, menu: ManagedDish[]) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: 'bulk-owner', username: 'bulk-owner', role: 'RESTAURANT_OWNER', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
  const signature = createHmac('sha256', 'bulk-menu-playwright-fixture').update(`${header}.${payload}`).digest('base64url');
  await page.addInitScript(({ token, restaurantId }) => {
    localStorage.setItem('qr_food_order_token', token);
    localStorage.setItem('selected_restaurant_id', restaurantId);
    localStorage.setItem('qdish_dining_onboarding_handled', '1');
    localStorage.setItem('qdish_allergy_disclosure_handled_v1', '1');
  }, { token: `${header}.${payload}.${signature}`, restaurantId });

  const fixture = {
    generationRequests: [] as Array<{ id: string; body: Record<string, unknown> }>,
    publicationRequests: [] as string[][],
    saveRequests: [] as Array<{ id: string; locale: string; body: Record<string, unknown> }>,
    managementReads: 0,
    failedGenerationIds: new Set<string>(),
    rateLimitedGenerationIds: new Set<string>(),
    holdGenerationId: '',
    generationHeld: deferred(),
    releaseGeneration: deferred(),
    failNextPublication: false,
    failNextManagementRead: false,
    publicReads: 0,
  };
  const restaurant = {
    _id: restaurantId, id: restaurantId, name: 'Nhà hàng dịch menu', username: 'bulk-menu-test',
    ownerName: 'Owner', email: 'owner@example.test', address: '1 Test Street', phone: '0000000000',
    status: 'ACTIVE', active: true,
    features: { fitScoreEnabled: false, foodAttributesEnabled: false, recommendationEnabled: false, personalizedMenuEnabled: false },
  };
  const json = (route: Route, data: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (path === '/api/owner/restaurants') return json(route, [restaurant]);
    if (path === '/api/restaurants/me' || path === `/api/restaurants/public/${restaurantId}`) return json(route, restaurant);
    if (path === '/api/notifications/unread-count') return json(route, { unreadCount: 0 });
    if (path === '/api/orders/changes') return json(route, { orders: [], snapshotAt: '2026-10-07T00:00:00.000Z', nextCursor: null, hasMore: false });
    if (path === '/api/bills') return json(route, { bills: [], total: 0, page: 1, limit: 50 });
    if (path === '/api/menu/manage') {
      expect(request.headers().authorization).toMatch(/^Bearer /);
      expect(request.headers()['x-restaurant-id']).toBe(restaurantId);
      fixture.managementReads += 1;
      if (fixture.failNextManagementRead) {
        fixture.failNextManagementRead = false;
        return json(route, { message: 'Management refresh unavailable' }, 503);
      }
      return json(route, menu);
    }
    const generation = path.match(/^\/api\/menu\/([^/]+)\/translations\/draft$/);
    if (generation) {
      expect(request.method()).toBe('POST');
      expect(request.headers()['x-restaurant-id']).toBe(restaurantId);
      fixture.generationRequests.push({ id: generation[1], body: request.postDataJSON() as Record<string, unknown> });
      if (fixture.holdGenerationId === generation[1]) {
        fixture.generationHeld.resolve();
        await fixture.releaseGeneration.promise;
      }
      if (fixture.rateLimitedGenerationIds.delete(generation[1])) {
        return json(route, { message: 'X-Kiro đang giới hạn lượt gọi. Hãy thử lại sau.', code: 'TRANSLATION_RATE_LIMITED', retryAfterSeconds: 15 }, 429);
      }
      if (fixture.failedGenerationIds.delete(generation[1])) return json(route, { message: 'AI temporarily unavailable' }, 503);
      const dish = menu.find((item) => item._id === generation[1])!;
      for (const locale of ['en', 'zhCN'] as const) {
        if (!dish.translations[locale]?.draft && dish.translations[locale]?.approved?.status !== 'APPROVED') {
          dish.translations[locale] = draftEntry(locale === 'en' ? `English ${dish.name}` : `中文 ${dish.name}`);
        }
      }
      return json(route, dish);
    }
    if (path === '/api/menu/translations/bulk-publish') {
      expect(request.method()).toBe('POST');
      expect(request.headers()['x-restaurant-id']).toBe(restaurantId);
      const { itemIds } = request.postDataJSON() as { itemIds: string[] };
      fixture.publicationRequests.push(itemIds);
      if (fixture.failNextPublication) {
        fixture.failNextPublication = false;
        return json(route, { message: 'Publication unavailable' }, 503);
      }
      const published = menu.filter((item) => itemIds.includes(item._id));
      for (const dish of published) {
        for (const locale of ['en', 'zhCN'] as const) {
          const entry = dish.translations[locale]!;
          if (entry.draft) dish.translations[locale] = approvedEntry(entry.draft.value.name, entry.draft.value.description);
        }
      }
      return json(route, { publishedCount: published.length, items: published });
    }
    const save = path.match(/^\/api\/menu\/([^/]+)\/translations\/(en|zh-CN)$/);
    if (save) {
      expect(request.method()).toBe('PATCH');
      const body = request.postDataJSON() as { name: string; description: string; publish: boolean };
      fixture.saveRequests.push({ id: save[1], locale: save[2], body });
      const dish = menu.find((item) => item._id === save[1])!;
      const locale = save[2] === 'en' ? 'en' : 'zhCN';
      dish.translations[locale] = { ...dish.translations[locale], ...draftEntry(body.name, body.description) };
      return json(route, dish);
    }
    if (path === '/api/menu') {
      fixture.publicReads += 1;
      expect(request.headers().authorization).toBeUndefined();
      return json(route, menu.filter((dish) => dish.available).map((dish) => ({
        ...dish,
        translations: Object.fromEntries(Object.entries(dish.translations)
          .filter(([, entry]) => entry.approved?.status === 'APPROVED')
          .map(([locale, entry]) => [locale, entry.approved!.value])),
      })));
    }
    if (path === '/api/table-sessions/resolve') return json(route, { session: { _id: '507f1f77bcf86cd799439099', restaurantId, tableNumber: '1', sessionCode: 'T1-TEST', status: 'OPEN' } });
    return json(route, []);
  });
  return fixture;
}

test('owner bulk translation preserves drafts, reports sequential progress, retries failures and publishes selected dishes for guests', async ({ page }) => {
  const stable = managedDish(101, 'Món đã duyệt', { en: approvedEntry('Stable English'), zhCN: approvedEntry('稳定中文') });
  const saved = managedDish(102, 'Món có nháp', {
    en: { ...draftEntry('Saved English draft'), approved: approvedEntry('Previously approved English').approved },
    zhCN: { ...draftEntry('已保存的中文草稿'), approved: approvedEntry('已批准中文').approved },
  });
  const candidates = Array.from({ length: 8 }, (_, index) => managedDish(110 + index, `Món cần dịch ${index + 1}`));
  candidates[0].available = false;
  candidates[0].translations.en = draftEntry('Preserved unavailable English');
  const fixture = await installBulkMenuApi(page, [stable, saved, ...candidates]);
  fixture.failedGenerationIds.add(candidates[1]._id);
  fixture.holdGenerationId = candidates[3]._id;

  await page.goto('/owner?tab=menu');
  await page.getByRole('button', { name: 'Dịch menu hàng loạt', exact: true }).click();
  const bulk = page.getByRole('dialog', { name: 'Dịch menu hàng loạt', exact: true });
  await expect(bulk.getByText('Đã duyệt hai ngôn ngữ', { exact: true })).toBeVisible();
  await expect(bulk.getByText('Được bỏ qua lần này', { exact: true }).locator('..').getByText('1', { exact: true })).toBeVisible();
  await bulk.getByRole('button', { name: 'Bắt đầu dịch 8 món' }).click();
  await fixture.generationHeld.promise;
  await expect(bulk.getByRole('status')).toContainText('3/8 món · 38%');
  await expect(bulk.getByRole('progressbar', { name: 'Tiến độ dịch món ăn' })).toHaveAttribute('value', '3');
  expect(fixture.generationRequests.map(({ id }) => id)).toEqual(candidates.slice(0, 4).map((dish) => dish._id));
  expect(fixture.generationRequests.every(({ body }) => body.preserveExisting === true)).toBe(true);
  fixture.releaseGeneration.resolve();

  await expect(bulk.getByRole('status')).toContainText('7 món dịch thành công · 1 món bỏ qua · 1 món thất bại');
  await expect(bulk.getByRole('article', { name: `Bản dịch ${stable.name}`, exact: true })).toHaveCount(0);
  const unavailable = bulk.getByRole('article', { name: `Bản dịch ${candidates[0].name}`, exact: true });
  await expect(unavailable.getByText('Preserved unavailable English', { exact: true })).toBeVisible();
  await expect(unavailable.getByText(`中文 ${candidates[0].name}`, { exact: true })).toBeVisible();
  await expect(unavailable.getByText('Preserved unavailable English draft description', { exact: true })).toBeVisible();
  await expect(unavailable.getByText(`中文 ${candidates[0].name} draft description`, { exact: true })).toBeVisible();
  const savedRow = bulk.getByRole('article', { name: `Bản dịch ${saved.name}`, exact: true });
  await expect(savedRow.getByText('Saved English draft', { exact: true })).toBeVisible();
  await expect(savedRow.getByText('已保存的中文草稿', { exact: true })).toBeVisible();
  await bulk.getByRole('button', { name: 'Thử lại 1 món lỗi' }).click();
  await expect(bulk.getByRole('status')).toContainText('0 món thất bại');
  expect(fixture.generationRequests.map(({ id }) => id)).toEqual([...candidates.map((dish) => dish._id), candidates[1]._id]);

  await savedRow.getByRole('button', { name: 'Sửa nháp' }).click();
  const editor = page.getByRole('dialog', { name: 'Bản dịch món ăn', exact: true });
  await expect(editor.getByLabel('Tên · English')).toHaveValue('Saved English draft');
  await expect(editor.getByRole('button', { name: 'Duyệt & hiển thị', exact: true })).toHaveCount(0);
  await editor.getByLabel('Tên · English').fill('Owner reviewed English draft');
  await editor.getByRole('button', { name: 'Lưu nháp', exact: true }).click();
  await expect.poll(() => fixture.saveRequests.length).toBe(1);
  expect(fixture.saveRequests[0].body).toMatchObject({ publish: false, name: 'Owner reviewed English draft' });
  await editor.getByRole('button', { name: '中文', exact: true }).click();
  await expect(editor.getByLabel('Tên · 简体中文')).toHaveValue('已保存的中文草稿');
  await editor.getByRole('button', { name: 'Đóng bản dịch' }).click();
  await savedRow.getByRole('checkbox', { name: `Chọn duyệt ${saved.name}` }).uncheck();
  await expect(bulk.getByText('Đã chọn 8/9 món sẵn sàng duyệt.')).toBeVisible();
  await bulk.getByRole('button', { name: 'Duyệt & hiển thị 8 món' }).click();
  await expect(bulk.getByText('Đã duyệt và hiển thị 8 món cho khách.')).toBeVisible();
  expect(fixture.publicationRequests).toEqual([candidates.map((dish) => dish._id)]);
  await expect(unavailable.getByText('Đã duyệt & hiển thị', { exact: true })).toBeVisible();
  await bulk.getByRole('button', { name: 'Đóng dịch menu hàng loạt' }).click();
  // Reopening reads parent menuItems, proving normalized publication responses reached Dashboard state.
  await page.getByRole('button', { name: 'Dịch menu hàng loạt', exact: true }).click();
  await expect(bulk.getByRole('button', { name: 'Kiểm tra bản nháp đã lưu' })).toBeVisible();
  await bulk.getByRole('button', { name: 'Kiểm tra bản nháp đã lưu' }).click();
  await expect(bulk.getByRole('article')).toHaveCount(1);
  await expect(bulk.getByText('Owner reviewed English draft', { exact: true })).toBeVisible();

  const generationCount = fixture.generationRequests.length;
  await page.goto(`/order?r=${restaurantId}&t=1`);
  await page.getByTestId('menu-language-selector').getByRole('button', { name: 'English' }).click();
  await expect(page.getByText(`English ${candidates[1].name}`, { exact: true })).toBeVisible();
  await expect(page.getByText('Previously approved English', { exact: true })).toBeVisible();
  await expect(page.getByText('Owner reviewed English draft', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Preserved unavailable English', { exact: true })).toHaveCount(0);
  await page.getByTestId('menu-language-selector').getByRole('button', { name: '中文' }).click();
  await expect(page.getByText(`中文 ${candidates[1].name}`, { exact: true })).toBeVisible();
  await expect(page.getByText('已批准中文', { exact: true })).toBeVisible();
  await expect(page.getByText('已保存的中文草稿', { exact: true })).toHaveCount(0);
  expect(fixture.publicReads).toBe(1);
  expect(fixture.generationRequests).toHaveLength(generationCount);
  expect(fixture.generationRequests.every(({ body }) => body.preserveExisting === true)).toBe(true);
});

test('owner single dish AI action retains default generation request semantics', async ({ page }) => {
  const dish = managedDish(301, 'Món dịch riêng');
  const fixture = await installBulkMenuApi(page, [dish]);
  await page.goto('/owner?tab=menu');
  await page.getByRole('row').filter({ hasText: dish.name }).getByRole('button').click();
  await page.getByRole('menuitem', { name: 'Dịch Anh / Trung' }).click();
  const editor = page.getByRole('dialog', { name: 'Bản dịch món ăn', exact: true });
  await editor.getByRole('button', { name: 'Tạo bản nháp AI' }).click();
  await expect(editor.getByLabel('Tên · English')).toHaveValue(`English ${dish.name}`);
  expect(fixture.generationRequests).toEqual([{ id: dish._id, body: {} }]);
  expect(fixture.publicationRequests).toHaveLength(0);
});

test('owner bulk translation pauses the remaining queue when the AI provider rate limits', async ({ page }) => {
  const candidates = Array.from({ length: 5 }, (_, index) => managedDish(410 + index, `Món giới hạn ${index + 1}`));
  const fixture = await installBulkMenuApi(page, candidates);
  fixture.rateLimitedGenerationIds.add(candidates[2]._id);

  await page.goto('/owner?tab=menu');
  await page.getByRole('button', { name: 'Dịch menu hàng loạt', exact: true }).click();
  const bulk = page.getByRole('dialog', { name: 'Dịch menu hàng loạt', exact: true });
  await bulk.getByRole('button', { name: 'Bắt đầu dịch 5 món' }).click();

  await expect(bulk.getByRole('status')).toContainText('2 món dịch thành công');
  await expect(bulk.getByRole('status')).toContainText('2 món tạm dừng');
  await expect(bulk.getByRole('alert')).toContainText('X-Kiro đang giới hạn lượt gọi');
  await expect(bulk.getByRole('button', { name: 'Thử lại 3 món' })).toBeVisible();
  expect(fixture.generationRequests.map(({ id }) => id)).toEqual(candidates.slice(0, 3).map((dish) => dish._id));
  await expect(bulk.getByRole('article', { name: `Bản dịch ${candidates[3].name}`, exact: true })).toContainText('Tạm dừng');

  await bulk.getByRole('button', { name: 'Thử lại 3 món' }).click();
  await expect(bulk.getByRole('status')).toContainText('0 món tạm dừng');
  expect(fixture.generationRequests.map(({ id }) => id)).toEqual([
    ...candidates.slice(0, 3).map((dish) => dish._id),
    candidates[2]._id,
    candidates[3]._id,
    candidates[4]._id,
  ]);
});

test('owner must refresh management state after publication and automatic refresh fail before retrying or editing', async ({ page }) => {
  const failed = managedDish(201, 'Món dịch lỗi');
  const ready = managedDish(202, 'Món có thể duyệt');
  const fixture = await installBulkMenuApi(page, [failed, ready]);
  fixture.failedGenerationIds.add(failed._id);
  await page.goto('/owner?tab=menu');
  await page.getByRole('button', { name: 'Dịch menu hàng loạt', exact: true }).click();
  const bulk = page.getByRole('dialog', { name: 'Dịch menu hàng loạt', exact: true });
  await bulk.getByRole('button', { name: 'Bắt đầu dịch 2 món' }).click();
  await expect(bulk.getByRole('status')).toContainText('1 món thất bại');
  const generationRequests = [...fixture.generationRequests];
  const initialReads = fixture.managementReads;
  fixture.failNextPublication = true;
  fixture.failNextManagementRead = true;
  await bulk.getByRole('button', { name: 'Duyệt & hiển thị 1 món' }).click();
  await expect(bulk.getByRole('alert')).toContainText('Management refresh unavailable');
  expect(fixture.publicationRequests).toEqual([[ready._id]]);
  expect(fixture.managementReads).toBe(initialReads + 1);
  const refresh = bulk.getByRole('button', { name: 'Tải lại trạng thái', exact: true });
  await expect(refresh).toBeVisible();
  await expect(refresh).toBeEnabled();
  await expect(bulk.getByRole('button', { name: 'Thử lại', exact: true })).toBeDisabled();
  await expect(bulk.getByRole('button', { name: 'Thử lại 1 món lỗi' })).toBeDisabled();
  for (const edit of await bulk.getByRole('button', { name: 'Sửa nháp' }).all()) await expect(edit).toBeDisabled();
  await expect(bulk.getByRole('button', { name: 'Duyệt & hiển thị 1 món' })).toBeDisabled();
  expect(fixture.generationRequests).toEqual(generationRequests);

  await refresh.click();
  await expect(refresh).toHaveCount(0);
  expect(fixture.managementReads).toBe(initialReads + 2);
  await expect(bulk.getByRole('button', { name: 'Thử lại', exact: true })).toBeEnabled();
  await expect(bulk.getByRole('button', { name: 'Thử lại 1 món lỗi' })).toBeEnabled();
  for (const edit of await bulk.getByRole('button', { name: 'Sửa nháp' }).all()) await expect(edit).toBeEnabled();
  await expect(bulk.getByRole('button', { name: 'Duyệt & hiển thị 1 món' })).toBeEnabled();
  expect(fixture.generationRequests).toEqual(generationRequests);
  // The refreshed failed dish remains retryable; the ready dish remains publishable without AI regeneration.
  await bulk.getByRole('article', { name: `Bản dịch ${ready.name}`, exact: true }).getByRole('button', { name: 'Sửa nháp' }).click();
  await expect(page.getByRole('dialog', { name: 'Bản dịch món ăn', exact: true }).getByLabel('Tên · English')).toHaveValue(`English ${ready.name}`);
  await page.getByRole('button', { name: 'Đóng bản dịch' }).click();
  await bulk.getByRole('button', { name: 'Duyệt & hiển thị 1 món' }).click();
  await expect(bulk.getByText('Đã duyệt và hiển thị 1 món cho khách.')).toBeVisible();
  expect(fixture.publicationRequests).toEqual([[ready._id], [ready._id]]);
  expect(fixture.generationRequests).toEqual(generationRequests);
});
