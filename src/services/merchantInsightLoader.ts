export interface MenuInsightsPayload {
  menuCoverage: {
    totalItems: number;
    itemsWithRecipe: number;
    coveragePct: number;
  };
  attributeDistribution: Record<string, number>;
  topDishes: Array<{
    dishId: string;
    name: string;
    orderCount: number;
    revenue: number;
  }>;
}

export interface CustomerInsightsPayload {
  customerSegments: Array<{
    segment: string;
    count: number;
    label: string;
  }>;
  surveyResponseCount: number;
  gapAnalysis: string[];
  peakHours: {
    periods: Array<{
      period: string;
      count: number;
      percentage: number;
    }>;
    hourly: number[];
  };
}

export type MerchantInsightsPayload = MenuInsightsPayload & CustomerInsightsPayload;

type InsightFetcher = <T>(
  path: string,
  options: { requireAuth: boolean }
) => Promise<T>;

interface LoadMerchantInsightsInput {
  restaurantId: string;
  period: string;
  customerInsightsEnabled: boolean;
  fetcher: InsightFetcher;
}

const emptyCustomerInsights = (): CustomerInsightsPayload => ({
  customerSegments: [],
  surveyResponseCount: 0,
  gapAnalysis: [],
  peakHours: {
    periods: [],
    hourly: Array(24).fill(0)
  }
});

export async function loadMerchantInsights({
  restaurantId,
  period,
  customerInsightsEnabled,
  fetcher
}: LoadMerchantInsightsInput): Promise<MerchantInsightsPayload> {
  const query = `restaurantId=${encodeURIComponent(restaurantId)}&period=${encodeURIComponent(period)}`;

  if (customerInsightsEnabled) {
    return fetcher<MerchantInsightsPayload>(
      `/api/restaurants/customer-insights?${query}`,
      { requireAuth: true }
    );
  }

  return {
    ...(await fetcher<MenuInsightsPayload>(
      `/api/restaurants/menu-insights?${query}`,
      { requireAuth: true }
    )),
    ...emptyCustomerInsights()
  };
}
