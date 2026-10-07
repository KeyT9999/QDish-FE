import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Role } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { ownerConsolePreferenceService } from '@/services/ownerConsolePreferenceService';
import {
  translateOwnerConsoleMessage,
  type OwnerConsoleTranslationKey
} from './ownerConsoleCatalog';
import { isOwnerConsoleLanguage, type OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';

export interface OwnerConsoleLocaleValue {
  language: OwnerConsoleLanguage;
  isSaving: boolean;
  t: (key: OwnerConsoleTranslationKey, values?: Record<string, string | number>) => string;
  setLanguage: (language: OwnerConsoleLanguage) => Promise<boolean>;
}

const OwnerConsoleLocaleContext = createContext<OwnerConsoleLocaleValue | null>(null);
const VIETNAMESE: OwnerConsoleLanguage = 'vi';

const preferenceStorageKey = (ownerId: string) => `qdish.owner-console-language.${ownerId}`;

const readCachedLanguage = (ownerId?: string): OwnerConsoleLanguage | null => {
  if (!ownerId || typeof window === 'undefined') return null;
  try {
    const cached = window.localStorage.getItem(preferenceStorageKey(ownerId));
    return isOwnerConsoleLanguage(cached) ? cached : null;
  } catch {
    return null;
  }
};

const writeCachedLanguage = (ownerId: string, language: OwnerConsoleLanguage) => {
  try {
    window.localStorage.setItem(preferenceStorageKey(ownerId), language);
  } catch {
    // The server remains the source of truth when browser storage is unavailable.
  }
};

export const OwnerConsoleLocaleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const isOwner = user?.role === Role.RESTAURANT_OWNER;
  const ownerId = isOwner ? user?.id : undefined;
  const [language, setLanguageState] = useState<OwnerConsoleLanguage>(
    () => (isOwner && ownerId ? readCachedLanguage(ownerId) : null) || VIETNAMESE
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!isOwner || !ownerId) {
      setLanguageState(VIETNAMESE);
      return () => {
        isCurrent = false;
      };
    }

    const cachedLanguage = readCachedLanguage(ownerId);
    setLanguageState(cachedLanguage || VIETNAMESE);

    ownerConsolePreferenceService.get()
      .then((preference) => {
        if (!isCurrent) return;
        const savedLanguage = isOwnerConsoleLanguage(preference.preferredLanguage)
          ? preference.preferredLanguage
          : VIETNAMESE;
        setLanguageState(savedLanguage);
        writeCachedLanguage(ownerId, savedLanguage);
      })
      .catch(() => {
        if (!isCurrent) return;
        setLanguageState(VIETNAMESE);
        try {
          window.localStorage.removeItem(preferenceStorageKey(ownerId));
        } catch {
          // Ignore unavailable browser storage.
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOwner, ownerId]);

  const activeLanguage = isOwner ? language : VIETNAMESE;

  useEffect(() => {
    const root = document.documentElement;
    const previousLanguage = root.lang;
    root.lang = activeLanguage;
    return () => {
      root.lang = previousLanguage;
    };
  }, [activeLanguage]);

  const setLanguage = useCallback(async (nextLanguage: OwnerConsoleLanguage) => {
    if (!isOwner || !ownerId || isSaving) return false;

    const previousLanguage = language;
    if (nextLanguage === previousLanguage) return true;

    setLanguageState(nextLanguage);
    setIsSaving(true);
    try {
      const preference = await ownerConsolePreferenceService.update(nextLanguage);
      const savedLanguage = isOwnerConsoleLanguage(preference.preferredLanguage)
        ? preference.preferredLanguage
        : nextLanguage;
      setLanguageState(savedLanguage);
      writeCachedLanguage(ownerId, savedLanguage);
      return true;
    } catch {
      setLanguageState(previousLanguage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [isOwner, isSaving, language, ownerId]);

  const value = useMemo<OwnerConsoleLocaleValue>(() => ({
    language: activeLanguage,
    isSaving,
    t: (key, values) => translateOwnerConsoleMessage(activeLanguage, key, values),
    setLanguage
  }), [activeLanguage, isSaving, setLanguage]);

  return (
    <OwnerConsoleLocaleContext.Provider value={value}>
      {children}
    </OwnerConsoleLocaleContext.Provider>
  );
};

export const useOwnerConsoleLocale = () => {
  const context = useContext(OwnerConsoleLocaleContext);
  if (!context) {
    throw new Error('useOwnerConsoleLocale must be used within OwnerConsoleLocaleProvider');
  }
  return context;
};
