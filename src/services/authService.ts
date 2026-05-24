import { apiFetch } from './api';

export const authService = {
  login: (data: any) => apiFetch<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),
  
  resetPassword: (data: any) => apiFetch<void>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  requestPasswordReset: (data: any) => apiFetch<void>('/api/auth/request-password-reset', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  changePassword: (data: any) => apiFetch<void>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};
