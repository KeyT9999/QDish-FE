import { apiFetch } from './api';
import { Plan } from '../types';

export const planService = {
  // Public APIs
  getPlans: async () => {
    const response = await apiFetch<Plan[] | { plans: Plan[] }>('/api/plans', { requireAuth: false });
    return Array.isArray(response) ? response : response.plans;
  },

  // Super Admin Plan CRUD APIs
  adminGetPlans: () => {
    return apiFetch<Plan[]>('/api/admin/plans');
  },

  adminCreatePlan: (planData: Partial<Plan>) => {
    return apiFetch<{ message: string; plan: Plan }>('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  },

  adminUpdatePlan: (id: string, planData: Partial<Plan>) => {
    return apiFetch<{ message: string; plan: Plan }>(`/api/admin/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(planData)
    });
  },

  adminDeletePlan: (id: string) => {
    return apiFetch<{ message: string }>(`/api/admin/plans/${id}`, {
      method: 'DELETE'
    });
  },

  adminTogglePlanActive: (id: string) => {
    return apiFetch<{ message: string; plan: Plan }>(`/api/admin/plans/${id}/toggle-active`, {
      method: 'PATCH'
    });
  }
};
