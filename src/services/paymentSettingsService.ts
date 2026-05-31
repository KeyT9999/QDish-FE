import { apiFetch } from './api';
import { RestaurantPaymentSettings } from '@/types';

interface PaymentSettingsResponse {
  settings: RestaurantPaymentSettings;
  url?: string;
  publicId?: string;
}

export interface UpdatePaymentSettingsPayload {
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

export const paymentSettingsService = {
  getPaymentSettings: async (restaurantId: string) => {
    const data = await apiFetch<PaymentSettingsResponse>(`/api/restaurants/${restaurantId}/payment-settings`);
    return data.settings;
  },

  updatePaymentSettings: async (restaurantId: string, payload: UpdatePaymentSettingsPayload) => {
    const data = await apiFetch<PaymentSettingsResponse>(`/api/owner/restaurants/${restaurantId}/payment-settings`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return data.settings;
  },

  uploadBankQr: async (restaurantId: string, file: File) => {
    const formData = new FormData();
    formData.append('qrImage', file);

    const data = await apiFetch<PaymentSettingsResponse>(`/api/owner/restaurants/${restaurantId}/payment-settings/bank-qr`, {
      method: 'POST',
      body: formData
    });
    return data.settings;
  },

  deleteBankQr: async (restaurantId: string) => {
    const data = await apiFetch<PaymentSettingsResponse>(`/api/owner/restaurants/${restaurantId}/payment-settings/bank-qr`, {
      method: 'DELETE'
    });
    return data.settings;
  }
};
