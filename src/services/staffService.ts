import { apiFetch } from './api';
import { Staff } from '@/types';

export const staffService = {
  getAll: () => apiFetch<Staff[]>('/api/staff'),
  
  create: (data: Partial<Staff>) => apiFetch<Staff>('/api/staff', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id: string, data: Partial<Staff>) => apiFetch<Staff>(`/api/staff/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  
  toggleActive: (id: string) => apiFetch<{ id: string; isActive: boolean }>([
    `/api/staff`,
    id,
    `toggle-active`
  ].join('/'), {
    method: 'PATCH'
  })
};
