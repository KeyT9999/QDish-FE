import { useState } from 'react';
import type { DiningProfile } from '@/types';
import {
  clearDiningProfile,
  loadDiningProfile,
  saveDiningProfile
} from '@/services/diningProfileStorage';

function getLocalStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function useDiningProfile() {
  const [initial] = useState(() => loadDiningProfile(getLocalStorage()));
  const [profile, setProfile] = useState<DiningProfile>(() => initial.profile);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(() => initial.updatedAt);

  const saveProfile = (newProfile: DiningProfile) => {
    const stored = saveDiningProfile(getLocalStorage(), newProfile);
    setProfile(stored.profile);
    setUpdatedAt(stored.updatedAt);
  };

  const clearProfile = () => {
    clearDiningProfile(getLocalStorage());
    setProfile(loadDiningProfile().profile);
    setUpdatedAt(undefined);
  };

  return {
    profile,
    updatedAt,
    saveProfile,
    clearProfile
  };
}
