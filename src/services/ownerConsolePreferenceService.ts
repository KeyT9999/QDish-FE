import { apiFetch } from './api';
import type { OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';

export interface OwnerConsolePreference {
  preferredLanguage?: OwnerConsoleLanguage;
}

export const ownerConsolePreferenceService = {
  get: () => apiFetch<OwnerConsolePreference>('/api/auth/preferences'),

  update: (preferredLanguage: OwnerConsoleLanguage) =>
    apiFetch<OwnerConsolePreference>('/api/auth/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ preferredLanguage })
    })
};
