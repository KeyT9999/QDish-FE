import { expect, test, type Page } from '@playwright/test';

const restaurantId = '507f1f77bcf86cd799439011';
const dishId = '507f1f77bcf86cd799439012';

interface FitScoreScenario {
  fitScoreEnabled: boolean;
  fitScoreResponse?: Record<string, unknown>;
  fitScoreStatus?: number;
  legacyScore: number;
}

const dish = {
  _id: dishId,
  restaurantId,
  name: 'Protein Bowl',
  description: 'A balanced bowl',
  price: 89000,
  category: 'Main',
  imageUrl: '',
  available: true,
  calories: 480,
  protein: 32,
  carbs: 45,
  fat: 14,
  allergens: [],
  foodAttributes: ['HIGH_PROTEIN']
};

async function mockCustomerMenu(page: Page, scenario: FitScoreScenario) {
  let fitScoreRequests = 0;

  await page.addInitScript(() => {
    window.localStorage.setItem('qdish_dining_profile', JSON.stringify({
      goals: ['MUSCLE_GAIN'],
      preferences: ['HIGH_PROTEIN'],
      allergies: [],
      conditions: []
    }));
  });

  await page.route('**/api/**', async (route) => {
    const requestUrl = new URL(route.request().url());

    if (requestUrl.pathname === `/api/restaurants/public/${restaurantId}`) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: restaurantId,
          name: 'Fit Score Kitchen',
          username: 'fit-score-kitchen',
          ownerName: 'Owner',
          email: 'owner@example.com',
          address: '1 Test Street',
          phone: '0000000000',
          status: 'ACTIVE',
          active: true,
          features: {
            fitScoreEnabled: scenario.fitScoreEnabled,
            foodAttributesEnabled: true,
            recommendationEnabled: true,
            personalizedMenuEnabled: false
          }
        })
      });
    }

    if (requestUrl.pathname === '/api/menu') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([dish])
      });
    }

    if (requestUrl.pathname === '/api/categories') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }

    if (requestUrl.pathname === '/api/recommendations') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          bestForYou: [{
            dish,
            fitScore: scenario.legacyScore,
            bestContextLabel: 'Gym Fit',
            reason: 'High protein'
          }],
          pairingSuggestions: []
        })
      });
    }

    if (requestUrl.pathname === '/api/dishes/fit-scores') {
      fitScoreRequests += 1;
      return route.fulfill({
        status: scenario.fitScoreStatus ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(scenario.fitScoreResponse ?? { message: 'Fit Score unavailable' })
      });
    }

    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });

  return { fitScoreRequests: () => fitScoreRequests };
}

function recommendationSection(page: Page) {
  return page.getByRole('heading', { name: 'D\u00e0nh ri\u00eang cho b\u1ea1n' }).locator('..').locator('..');
}

test('blocked independent score renders the red allergen badge in recommendations', async ({ page }) => {
  await mockCustomerMenu(page, {
    fitScoreEnabled: true,
    legacyScore: 91,
    fitScoreResponse: {
      scores: {
        [dishId]: {
          score: 0,
          label: 'Allergen conflict',
          contextType: 'allergen_block',
          reasons: ['Contains soy'],
          blocked: true,
          blockReason: 'allergen'
        }
      }
    }
  });

  await page.goto(`/order?r=${restaurantId}`);

  const section = recommendationSection(page);
  await expect(section.getByText('C\u00f3 d\u1ecb \u1ee9ng', { exact: true })).toBeVisible();
  await expect(section.getByText('0%', { exact: true })).toHaveCount(0);
  await section.getByRole('heading', { name: dish.name }).click();
  await expect(page.getByRole('heading', { name: 'C\u00f3 th\u00e0nh ph\u1ea7n g\u00e2y d\u1ecb \u1ee9ng' })).toBeVisible();
  await expect(page.getByText('0%', { exact: true })).toHaveCount(0);
});

test('recommendation-only plans preserve the eligible legacy score without a batch request', async ({ page }) => {
  const requests = await mockCustomerMenu(page, {
    fitScoreEnabled: false,
    legacyScore: 73
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(recommendationSection(page).getByText('73% ph\u00f9 h\u1ee3p', { exact: true })).toBeVisible();
  expect(requests.fitScoreRequests()).toBe(0);
});

test('enabled batch failure does not fall back to the legacy recommendation score', async ({ page }) => {
  await mockCustomerMenu(page, {
    fitScoreEnabled: true,
    legacyScore: 73,
    fitScoreStatus: 500
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(recommendationSection(page)).toBeVisible();
  await expect(recommendationSection(page).getByText(/73%/)).toHaveCount(0);
});

test('card, recommendation, and detail share the _id score and show its context label', async ({ page }) => {
  await mockCustomerMenu(page, {
    fitScoreEnabled: true,
    legacyScore: 61,
    fitScoreResponse: {
      scores: {
        [dishId]: {
          score: 88,
          label: 'Great fit',
          contextType: 'gym_fit',
          reasons: ['High protein'],
          blocked: false
        }
      }
    }
  });

  await page.goto(`/order?r=${restaurantId}`);

  await expect(page.getByText('88% ph\u00f9 h\u1ee3p', { exact: true })).toHaveCount(2);
  await recommendationSection(page).getByRole('heading', { name: dish.name }).click();
  await expect(page.getByText('88%', { exact: true })).toBeVisible();
  await expect(page.getByText('Ng\u1eef c\u1ea3nh: T\u1eadp luy\u1ec7n', { exact: true })).toBeVisible();
});
