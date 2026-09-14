export interface CustomerSummary {
  id: string;
  displayName: string;
  maskedPhone: string;
  marketingConsent: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
  orderCount: number;
  totalSpend: number;
}

export interface CustomerOrderHistory {
  id: string;
  items: Array<{ menuItemId: string; name: string; price: number; quantity: number }>;
  totalAmount: number;
  status: string;
  note?: string;
  createdAt: string;
}

export interface CustomerVisit {
  id: string;
  tableNumber: string;
  sessionCode: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  totalAmount: number;
  orders: CustomerOrderHistory[];
}

export interface CustomerDetailResponse {
  customer: Omit<CustomerSummary, 'maskedPhone'> & { phone: string; consentAt?: string };
  visits: CustomerVisit[];
  pagination: Pagination;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CustomerListResponse {
  data: CustomerSummary[];
  pagination: Pagination;
}

type Fetcher = <T>(path: string, options?: RequestInit & { requireAuth?: boolean }) => Promise<T>;

const defaultFetcher: Fetcher = async <T>(path: string, options?: RequestInit & { requireAuth?: boolean }) => {
  const { apiFetch } = await import('./api');
  return apiFetch<T>(path, options);
};

export function createCustomerCrmClient(fetcher: Fetcher = defaultFetcher) {
  return {
    list(restaurantId: string, input: { page?: number; limit?: number; search?: string } = {}) {
      const params = new URLSearchParams({
        restaurantId,
        page: String(input.page || 1),
        limit: String(input.limit || 20)
      });
      if (input.search?.trim()) params.set('search', input.search.trim());
      return fetcher<CustomerListResponse>(`/api/restaurants/customers?${params.toString()}`);
    },

    detail(restaurantId: string, customerId: string, page = 1, limit = 10) {
      const params = new URLSearchParams({
        restaurantId,
        page: String(page),
        limit: String(limit)
      });
      return fetcher<CustomerDetailResponse>(
        `/api/restaurants/customers/${encodeURIComponent(customerId)}?${params.toString()}`
      );
    }
  };
}

export const customerCrmService = createCustomerCrmClient();
