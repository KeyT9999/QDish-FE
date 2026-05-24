import { useState, useEffect } from 'react';
import { HealthProfile, HealthLabel, Allergen } from '@/types';

const STORAGE_KEY = 'qdish_health_profile';

const defaultProfile: HealthProfile = {
  goals: [],
  allergies: [],
  conditions: [],
  preferences: []
};

export function useHealthProfile() {
  const [profile, setProfile] = useState<HealthProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultProfile;
    } catch (e) {
      return defaultProfile;
    }
  });

  const saveProfile = (newProfile: HealthProfile) => {
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
