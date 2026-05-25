import { apiFetch } from './api';
import { Subscription, Plan, BillingCycle } from '../types';

export const PENDING_PAYMENT_ORDER_KEY = 'qdish_pending_subscription_order_code';

export interface OwnerSubscriptionDetails {
  subscription: {
    id: string;
    planId: string;
    planName: string;
    planCode: string;
    plan?: Plan;
    status: string;
    billingCycle: BillingCycle;
    amount: number;
    startedAt?: string;
    expiresAt?: string;
  };
  limits: {
    restaurantLimit: number;
    tableLimit: number;
    menuItemLimit: number;
    staffLimit: number;
    features: string[];
  };
  usage: {
    restaurantCount: number;
    tableCount: number;
    menuItemCount: number;
    staffCount: number;
  };
}

export interface CheckoutResponse {
  checkoutUrl?: string;
  qrCode?: string;
  paymentLinkId?: string;
  orderCode?: number;
  amount?: number;
  status?: string;
  isFree?: boolean;
  message?: string;
  subscription?: Subscription;
}

export interface PaymentStatusResponse {
  status: 'PAID' | 'PENDING' | 'CANCELLED' | 'EXPIRED' | 'FAILED' | 'PROCESSING' | 'UNDERPAID';
  message: string;
}

export interface SubscriptionRevenueSummary {
  totalRevenue: number;
  monthRevenue: number;
  paidCount: number;
  monthPaidCount: number;
  pendingCount: number;
  cancelledCount: number;
  failedCount: number;
  revenueByPlan: Array<{
    planId: string;
    planName?: string;
    planCode?: string;
    revenue: number;
    count: number;
  }>;
  transactions: Array<{
    id: string;
    orderCode: number;
    amount: number;
    status: string;
    paymentLinkId?: string;
    checkoutUrl?: string;
    owner?: any;
    plan?: any;
    createdAt?: string;
    updatedAt?: string;
  }>;
}

export const subscriptionService = {
  // Owner subscription APIs
  getOwnerSubscription: () => {
    return apiFetch<OwnerSubscriptionDetails>('/api/owner/subscription');
  },

  checkoutSubscription: (planId: string, billingCycle: BillingCycle = BillingCycle.MONTHLY) => {
    return apiFetch<CheckoutResponse>('/api/owner/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId, billingCycle })
    });
  },

  getPaymentStatus: (orderCode: number) => {
    return apiFetch<PaymentStatusResponse>(
      `/api/owner/subscription/payment-status?orderCode=${orderCode}`
    );
  },

  // Super Admin Subscription APIs
  adminGetSubscriptions: () => {
    return apiFetch<Subscription[]>('/api/admin/subscriptions');
  },

  adminGetSubscriptionDetails: (ownerId: string) => {
    return apiFetch<{ subscription: Subscription; usage: any }>(`/api/admin/subscriptions/${ownerId}`);
  },

  adminChangeOwnerPlan: (ownerId: string, planId: string, status?: string, expiresAt?: string) => {
    return apiFetch<{ message: string; subscription: Subscription }>(`/api/admin/subscriptions/${ownerId}/plan`, {
      method: 'PATCH',
      body: JSON.stringify({ planId, status, expiresAt })
    });
  },

  adminGetSubscriptionRevenue: () => {
    return apiFetch<SubscriptionRevenueSummary>('/api/admin/subscription-revenue');
  }
};
