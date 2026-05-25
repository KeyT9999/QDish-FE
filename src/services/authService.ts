import { apiFetch } from './api';

export const authService = {
  login: (data: any) => apiFetch<{ token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),
  
  requestOwnerOTP: (data: any) => apiFetch<any>('/api/auth/register-owner/request-otp', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  verifyOwnerOTP: (data: { email: string; otp: string }) => apiFetch<any>('/api/auth/register-owner/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false
  }),

  resendOwnerOTP: (data: { email: string }) => apiFetch<any>('/api/auth/register-owner/resend-otp', {
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
