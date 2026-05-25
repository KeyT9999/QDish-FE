import { apiFetch } from './api';
import { Owner, CreateOwnerPayload } from '@/types';

export const ownerService = {
  getAll: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<Owner[]>(`/api/owners${queryString}`);
  },

  getById: (id: string) => {
    return apiFetch<Owner>(`/api/owners/${id}`);
  },

  create: (data: CreateOwnerPayload) => {
    return apiFetch<{ message: string; user: Owner }>('/api/owners', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: (id: string, data: Partial<CreateOwnerPayload>) => {
    return apiFetch<{ message: string; user: Owner }>(`/api/owners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  toggleActive: (id: string) => {
    return apiFetch<{ isActive: boolean; message: string }>(`/api/owners/${id}/toggle-active`, {
      method: 'PATCH'
    });
  },

  resetPassword: (id: string, newPassword: string) => {
    return apiFetch<{ message: string }>(`/api/owners/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }
};
