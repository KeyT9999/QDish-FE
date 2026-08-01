import { expect, test, type Page, type Route } from '@playwright/test';

const restaurantId = '507f1f77bcf86cd799439011';
const diningProfileStorageKey = 'qdish_dining_profile';

const generalHeading = 'G\u1ee3i \u00fd ph\u00f9 h\u1ee3p l\u00fac n\u00e0y';
const personalizedHeading = 'G\u1ee3i \u00fd d\u00e0nh cho b\u1ea1n';
const noAllergenSafeDishesMessage = 'Ch\u01b0a t\u00ecm th\u1ea5y m\u00f3n ph\u00f9 h\u1ee3p v\u1edbi d\u1ecb \u1ee9ng \u0111\u00e3 ch\u1ecdn';

type InlineProfile = {
  goals: string[];
  preferences: string[];
  allergies: string[];
};

const emptyProfile: InlineProfile = {
  goals: [],
  preferences: [],
  allergies: [],
};

const safeDish = {
  _id: '507f1f77bcf86cd799439012',
  restaurantId,
  name: 'Protein Bowl',
  description: 'A safe, high-protein bowl',
  price: 89000,
  category: 'Main',
  imageUrl: '',
  available: true,
  calories: 480,
  protein: 32,
  carbs: 45,
  fat: 14,
  allergens: [],
  foodAttributes: ['HIGH_PROTEIN'],
};

const blockedDish = {
  ...safeDish,
  _id: '507f1f77bcf86cd799439013',
  name: 'Soy Tofu Bowl',
  allergens: ['SOY'],
};

type RecommendationPayload = {
  mode: 'GENERAL' | 'PERSONALIZED';
  emptyReason?: 'NO_ALLERGEN_SAFE_DISHES';
  bestForYou: Array<Record<string, unknown>>;
  fullMenu: Array<Record<string, unknown>>;
  pairingSuggestions: Array<Record<string, unknown>>;
};

interface MockScenario {
  personalizedMenuEnabled?: boolean;
  fitScoreEnabled?: boolean;
  recommendationStatus?: number;
  recommendationResponse?: (profile: InlineProfile) => RecommendationPayload;
}

function recommendationFor(dish: Record<string, unknown>, fitScore = 91) {
  return {
    dish,
    fitScore,
    bestContext: 'lunch',
    bestContextLabel: 'Lunch',
    reason: 'A good fit for this meal',
    allergenWarnings: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
    ? value
    : [];
}

function parseRequestBody(route: Route): Record<string, unknown> {
  try {
    const body = route.request().postData();
    const parsed = body ? JSON.parse(body) : undefined;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function inlineProfileFrom(body: Record<string, unknown>): InlineProfile {
  const candidate = body.userProfile;
  if (!isRecord(candidate)) return emptyProfile;

  return {
    goals: stringArray(candidate.goals),
    preferences: stringArray(candidate.preferences),
    allergies: stringArray(candidate.allergies),
  };
}

function isPersonalized(profile: InlineProfile): boolean {
  return profile.goals.length > 0 || profile.preferences.length > 0;
}

function recommendationSection(page: Page) {
  return page.getByRole('heading', { name: new RegExp(`${generalHeading}|${personalizedHeading}`) })
    .locator('..')
    .locator('..');
}

async function seedDiningProfile(page: Page, profile: InlineProfile) {
  await page.addInitScript(({ key, profile: profileToStore }) => {
    window.localStorage.setItem(key, JSON.stringify({
      schemaVersion: 1,
      updatedAt: '2026-08-01T12:00:00.000Z',
      profile: {
        ...profileToStore,
        conditions: [],
      },
    }));
  }, { key: diningProfileStorageKey, profile });
}

async function mockCustomerMenu(page: Page, scenario: MockScenario = {}) {
  const profileCalls: string[] = [];
  const recommendationProfiles: InlineProfile[] = [];
  const fitScoreProfiles: InlineProfile[] = [];

  await page.route('**/api/**', async (route) => {
    const requestUrl = new URL(route.request().url());
    const { pathname } = requestUrl;

    if (pathname.startsWith('/api/users/profile/')) {
      profileCalls.push(requestUrl.toString());
      return route.abort();
    }

    if (pathname === `/api/restaurants/public/${restaurantId}`) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: restaurantId,
          name: 'Local First Kitchen',
          username: 'local-first-kitchen',
          ownerName: 'Owner',
          email: 'owner@example.test',
          address: '1 Test Street',
          phone: '0000000000',
          status: 'ACTIVE',
          active: true,
          features: {
            fitScoreEnabled: scenario.fitScoreEnabled ?? false,
            foodAttributesEnabled: true,
            recommendationEnabled: true,
            personalizedMenuEnabled: scenario.personalizedMenuEnabled ?? false,
          },
        }),
      });
    }

    if (pathname === '/api/menu') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([safeDish, blockedDish]),
      });
    }

    if (pathname === '/api/categories') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }

    if (pathname === '/api/recommendations') {
      const profile = inlineProfileFrom(parseRequestBody(route));
      recommendationProfiles.push(profile);
      const response = scenario.recommendationResponse?.(profile) ?? {
        mode: isPersonalized(profile) ? 'PERSONALIZED' : 'GENERAL',
        bestForYou: [recommendationFor(safeDish)],
        fullMenu: [],
        pairingSuggestions: [],
      };

      return route.fulfill({
        status: scenario.recommendationStatus ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    }

    if (pathname === '/api/dishes/fit-scores') {
      const profile = inlineProfileFrom(parseRequestBody(route));
      fitScoreProfiles.push(profile);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ scores: {} }),
      });
    }

    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  return { profileCalls, recommendationProfiles, fitScoreProfiles };
}

test('onboarding stores a version-one local profile and never calls the guest profile API', async ({ page }) => {
  const requests = await mockCustomerMenu(page, { personalizedMenuEnabled: true });

  await page.goto(`/order?r=${restaurantId}`);

  await page.getByRole('button', { name: /\u0102n t\u0103ng c\u01a1/ }).click();
  await page.getByRole('button', { name: /Ti\u1ebfp theo/ }).click();
  await page.getByRole('button', { name: /\u0110\u1eadu n\u00e0nh/ }).click();
  await page.getByRole('button', { name: /Ti\u1ebfp theo/ }).click();
  await page.getByRole('button', { name: /High Protein/ }).click();
  await page.getByRole('button', { name: /Ho\u00e0n t\u1ea5t h\u1ed3 s\u01a1/ }).click();

  await expect.poll(async () => page.evaluate((key) => window.localStorage.getItem(key), diningProfileStorageKey))
    .not.toBeNull();
  const stored = await page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) ?? 'null'), diningProfileStorageKey);

  expect(stored).toMatchObject({
    schemaVersion: 1,
    profile: {
      goals: ['MUSCLE_GAIN'],
      preferences: ['HIGH_PROTEIN'],
      allergies: ['SOY'],
      conditions: [],
    },
  });
  expect(requests.profileCalls).toEqual([]);
});

test('GENERAL recommendations render the exact heading without a legacy personalized Fit Score badge', async ({ page }) => {
  const requests = await mockCustomerMenu(page, {
    recommendationResponse: () => ({
      mode: 'GENERAL',
      bestForYou: [recommendationFor(safeDish, 91)],
      fullMenu: [],
      pairingSuggestions: [],
    }),
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(page.getByRole('heading', { name: generalHeading, exact: true })).toBeVisible();
  await expect(recommendationSection(page).getByText('91% ph\u00f9 h\u1ee3p', { exact: true })).toHaveCount(0);
  expect(requests.profileCalls).toEqual([]);
});

test('PERSONALIZED recommendations render the exact heading', async ({ page }) => {
  await seedDiningProfile(page, { goals: ['MUSCLE_GAIN'], preferences: [], allergies: [] });
  const requests = await mockCustomerMenu(page, {
    recommendationResponse: () => ({
      mode: 'PERSONALIZED',
      bestForYou: [recommendationFor(safeDish)],
      fullMenu: [],
      pairingSuggestions: [],
    }),
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(page.getByRole('heading', { name: personalizedHeading, exact: true })).toBeVisible();
  expect(requests.profileCalls).toEqual([]);
});

test('an allergies-only profile stays GENERAL, sends inline allergies, and omits blocked dishes from recommendations', async ({ page }) => {
  await seedDiningProfile(page, { goals: [], preferences: [], allergies: ['SOY'] });
  const requests = await mockCustomerMenu(page, {
    recommendationResponse: (profile) => ({
      mode: isPersonalized(profile) ? 'PERSONALIZED' : 'GENERAL',
      bestForYou: [recommendationFor(safeDish)],
      fullMenu: [],
      pairingSuggestions: [],
    }),
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(page.getByRole('heading', { name: generalHeading, exact: true })).toBeVisible();
  await expect(recommendationSection(page).getByRole('heading', { name: blockedDish.name })).toHaveCount(0);
  await expect.poll(() => requests.recommendationProfiles.length).toBe(1);
  expect(requests.recommendationProfiles[0]).toEqual({ goals: [], preferences: [], allergies: ['SOY'] });
  expect(requests.profileCalls).toEqual([]);
});

test('NO_ALLERGEN_SAFE_DISHES renders the approved safety copy', async ({ page }) => {
  await seedDiningProfile(page, { goals: [], preferences: [], allergies: ['SOY'] });
  const requests = await mockCustomerMenu(page, {
    recommendationResponse: () => ({
      mode: 'GENERAL',
      emptyReason: 'NO_ALLERGEN_SAFE_DISHES',
      bestForYou: [],
      fullMenu: [],
      pairingSuggestions: [],
    }),
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(page.getByRole('status')).toHaveText(noAllergenSafeDishesMessage);
  expect(requests.profileCalls).toEqual([]);
});

test('editing a profile sends updated goals, preferences, and allergies to both request families', async ({ page }) => {
  await seedDiningProfile(page, { goals: ['MUSCLE_GAIN'], preferences: ['HIGH_PROTEIN'], allergies: [] });
  const requests = await mockCustomerMenu(page, { personalizedMenuEnabled: true, fitScoreEnabled: true });

  await page.goto(`/order?r=${restaurantId}`);
  await expect(page.getByRole('heading', { name: personalizedHeading, exact: true })).toBeVisible();
  requests.recommendationProfiles.length = 0;
  requests.fitScoreProfiles.length = 0;

  await page.getByRole('button', { name: 'H\u1ed3 s\u01a1 \u1ea9m th\u1ef1c' }).click();
  await page.getByRole('button', { name: /\u0102n l\u1ea5y n\u0103ng l\u01b0\u1ee3ng/ }).click();
  await page.getByRole('button', { name: /\u0110\u1eadu n\u00e0nh/ }).click();
  await page.getByRole('button', { name: /L\u01b0u h\u1ed3 s\u01a1/ }).click();

  const updatedProfile = {
    goals: ['MUSCLE_GAIN', 'ENERGY_BOOST'],
    preferences: ['HIGH_PROTEIN'],
    allergies: ['SOY'],
  };
  await expect.poll(() => requests.recommendationProfiles.some((profile) => JSON.stringify(profile) === JSON.stringify(updatedProfile)))
    .toBe(true);
  await expect.poll(() => requests.fitScoreProfiles.some((profile) => JSON.stringify(profile) === JSON.stringify(updatedProfile)))
    .toBe(true);
  expect(requests.profileCalls).toEqual([]);
});

test('clearing requires confirmation: cancel preserves local storage and confirm resets recommendations to GENERAL', async ({ page }) => {
  await seedDiningProfile(page, { goals: ['MUSCLE_GAIN'], preferences: ['HIGH_PROTEIN'], allergies: ['SOY'] });
  const requests = await mockCustomerMenu(page, { personalizedMenuEnabled: true });

  await page.goto(`/order?r=${restaurantId}`);
  await expect(page.getByRole('heading', { name: personalizedHeading, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'H\u1ed3 s\u01a1 \u1ea9m th\u1ef1c' }).click();

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'X\u00f3a h\u1ed3 s\u01a1 \u0103n u\u1ed1ng' }).click();
  await expect.poll(async () => page.evaluate((key) => window.localStorage.getItem(key), diningProfileStorageKey))
    .not.toBeNull();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'X\u00f3a h\u1ed3 s\u01a1 \u0103n u\u1ed1ng' }).click();
  await expect.poll(async () => page.evaluate((key) => window.localStorage.getItem(key), diningProfileStorageKey))
    .toBeNull();
  await expect(page.getByRole('heading', { name: generalHeading, exact: true })).toBeVisible();
  await expect(recommendationSection(page).getByText('91% ph\u00f9 h\u1ee3p', { exact: true })).toHaveCount(0);
  expect(requests.profileCalls).toEqual([]);
});

test('a recommendation failure leaves menu cards and cart controls usable', async ({ page }) => {
  const requests = await mockCustomerMenu(page, { recommendationStatus: 500 });

  await page.goto(`/order?r=${restaurantId}`);

  await expect.poll(() => requests.recommendationProfiles.length).toBe(1);
  await expect(page.getByRole('heading', { name: safeDish.name }).first()).toBeVisible();
  await page.getByRole('heading', { name: safeDish.name }).first().click();
  await page.getByRole('button', { name: /Th\u00eam v\u00e0o gi\u1ecf h\u00e0ng/ }).click();
  await expect(page.getByRole('button', { name: /Xem gi\u1ecf h\u00e0ng/ })).toBeVisible();
  expect(requests.profileCalls).toEqual([]);
});
