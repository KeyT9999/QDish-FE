import { useState } from 'react';
import { DiningProfile, DiningPreference, Allergen } from '@/types';

const STORAGE_KEY = 'qdish_dining_profile';

const defaultProfile: DiningProfile = {
  goals: [],
  allergies: [],
  conditions: [],
  preferences: []
};

export function useDiningProfile() {
  const [profile, setProfile] = useState<DiningProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Migrate from old key if exists
      const legacy = localStorage.getItem('qdish_health_profile');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        localStorage.removeItem('qdish_health_profile');
        return parsed;
      }
      return defaultProfile;
    } catch (e) {
      return defaultProfile;
    }
  });

  const saveProfile = (newProfile: DiningProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
  };

  const clearProfile = () => {
    setProfile(defaultProfile);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    profile,
    saveProfile,
    clearProfile
  };
}
