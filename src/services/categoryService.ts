import { apiFetch } from './api';

export interface CategoryItem {
  _id: string;
  restaurantId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export const categoryService = {
  getAll: (restaurantId: string) => apiFetch<CategoryItem[]>(`/api/categories?restaurantId=${restaurantId}`, {
    requireAuth: false
  }),
  
  create: (name: string) => apiFetch<CategoryItem>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name })
  }),
  
  update: (id: string, name: string) => apiFetch<CategoryItem>(`/api/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name })
  }),
  
  delete: (id: string) => apiFetch<void>(`/api/categories/${id}`, {
    method: 'DELETE'
  })
};
