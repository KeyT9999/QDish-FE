import { useState } from 'react';
import type { DiningProfile } from '@/types';
import {
  clearDiningProfile,
  loadDiningOnboardingHandled,
  loadDiningProfile,
  markDiningOnboardingHandled,
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
  const [initial] = useState(() => {
    const storage = getLocalStorage();
    return {
      storedProfile: loadDiningProfile(storage),
      onboardingHandled: loadDiningOnboardingHandled(storage)
    };
  });
  const [profile, setProfile] = useState<DiningProfile>(() => initial.storedProfile.profile);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(() => initial.storedProfile.updatedAt);
  const [onboardingHandled, setOnboardingHandled] = useState(() => initial.onboardingHandled);

  const saveProfile = (newProfile: DiningProfile) => {
    const stored = saveDiningProfile(getLocalStorage(), newProfile);
    setProfile(stored.profile);
    setUpdatedAt(stored.updatedAt);
  };

  const clearProfile = () => {
    clearDiningProfile(getLocalStorage());
    setProfile(loadDiningProfile().profile);
    setUpdatedAt(undefined);
    setOnboardingHandled(true);
  };

  const handleOnboarding = () => {
    markDiningOnboardingHandled(getLocalStorage());
    setOnboardingHandled(true);
  };

  return {
    profile,
    updatedAt,
    onboardingHandled,
    saveProfile,
    clearProfile,
    markOnboardingHandled: handleOnboarding
  };
}
