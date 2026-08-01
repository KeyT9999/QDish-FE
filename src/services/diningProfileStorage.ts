import type { Allergen, DiningPreference, DiningProfile } from '../types/index.ts';

const STORAGE_KEY = 'qdish_dining_profile';
const LEGACY_STORAGE_KEY = 'qdish_health_profile';

const GOALS = new Set<DiningProfile['goals'][number]>([
  'MUSCLE_GAIN', 'ENERGY_BOOST', 'LIGHT_MEAL', 'COMFORT',
  'BALANCED', 'WEIGHT_LOSS', 'MAINTENANCE', 'GENERAL_HEALTH'
]);
const PREFERENCES = new Set<DiningPreference>([
  'VEGAN', 'VEGETARIAN', 'LOW_CARB', 'HIGH_PROTEIN',
  'KETO', 'GLUTEN_FREE', 'LOW_FAT', 'SUGAR_FREE'
]);
const ALLERGIES = new Set<Allergen>([
  'GLUTEN', 'DAIRY', 'NUTS', 'SHELLFISH', 'SOY', 'EGGS', 'FISH'
] as unknown as Allergen[]);
const CONDITIONS = new Set<DiningProfile['conditions'][number]>([
  'DIABETES', 'HYPERTENSION', 'CELIAC'
]);

type ProfileStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type UnknownRecord = Record<string, unknown>;

export interface StoredDiningProfile {
  schemaVersion: 1;
  updatedAt: string;
  profile: DiningProfile;
}

const emptyProfile: DiningProfile = {
  goals: [],
  preferences: [],
  allergies: [],
  conditions: []
};

Object.freeze(emptyProfile.goals);
Object.freeze(emptyProfile.preferences);
Object.freeze(emptyProfile.allergies);
Object.freeze(emptyProfile.conditions);
export const EMPTY_DINING_PROFILE: DiningProfile = Object.freeze(emptyProfile);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeValues<T extends string>(value: unknown, allowed: ReadonlySet<T>): T[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<T>();
  return value.filter((entry): entry is T => {
    if (typeof entry !== 'string' || !allowed.has(entry as T) || seen.has(entry as T)) {
      return false;
    }
    seen.add(entry as T);
    return true;
  });
}

function normalizeProfile(value: unknown): DiningProfile | undefined {
  if (!isRecord(value)
    || !Array.isArray(value.goals)
    || !Array.isArray(value.preferences)
    || !Array.isArray(value.allergies)
    || !Array.isArray(value.conditions)) {
    return undefined;
  }

  return {
    goals: normalizeValues(value.goals, GOALS),
    preferences: normalizeValues(value.preferences, PREFERENCES),
    allergies: normalizeValues(value.allergies, ALLERGIES),
    conditions: normalizeValues(value.conditions, CONDITIONS)
  };
}

function cloneProfile(profile: DiningProfile): DiningProfile {
  return {
    goals: [...profile.goals],
    preferences: [...profile.preferences],
    allergies: [...profile.allergies],
    conditions: [...profile.conditions]
  };
}

function createEmptyProfile(): DiningProfile {
  return cloneProfile(EMPTY_DINING_PROFILE);
}

function safeIsoTimestamp(now: Date): string {
  try {
    return now.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function parseStoredProfile(value: unknown): StoredDiningProfile | undefined {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isIsoTimestamp(value.updatedAt)) {
    return undefined;
  }

  const profile = normalizeProfile(value.profile);
  return profile === undefined
    ? undefined
    : { schemaVersion: 1, updatedAt: value.updatedAt, profile };
}

function safeRead(storage: ProfileStorage | undefined, key: string): string | null | undefined {
  try {
    return storage?.getItem(key);
  } catch {
    return undefined;
  }
}

function safeParse(value: string | null | undefined): unknown | undefined {
  if (typeof value !== 'string') return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function persist(storage: ProfileStorage | undefined, stored: StoredDiningProfile): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(stored));
    return storage !== undefined;
  } catch {
    return false;
  }
}

function removeLegacyProfile(storage: ProfileStorage | undefined): void {
  try {
    storage?.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage access is optional and can be blocked by browser privacy settings.
  }
}

function emptyStoredProfile(): { profile: DiningProfile; updatedAt: undefined } {
  return { profile: createEmptyProfile(), updatedAt: undefined };
}

/** Loads the current envelope, migrating pre-versioned and legacy local profiles when possible. */
export function loadDiningProfile(storage?: ProfileStorage): StoredDiningProfile | { profile: DiningProfile; updatedAt: undefined } {
  const currentValue = safeRead(storage, STORAGE_KEY);

  if (typeof currentValue === 'string') {
    const storedValue = safeParse(currentValue);
    if (storedValue === undefined) return emptyStoredProfile();

    if (isRecord(storedValue) && 'schemaVersion' in storedValue) {
      const stored = parseStoredProfile(storedValue);
      return stored === undefined
        ? emptyStoredProfile()
        : { ...stored, profile: cloneProfile(stored.profile) };
    }

    const legacyProfile = normalizeProfile(storedValue);
    if (legacyProfile === undefined) return emptyStoredProfile();

    const migrated = saveDiningProfile(storage, legacyProfile);
    removeLegacyProfile(storage);
    return migrated;
  }

  if (currentValue !== null) return emptyStoredProfile();

  const legacyProfile = normalizeProfile(safeParse(safeRead(storage, LEGACY_STORAGE_KEY)));
  if (legacyProfile === undefined) return emptyStoredProfile();

  const migrated = saveDiningProfile(storage, legacyProfile);
  if (persistedCurrentProfile(storage, migrated)) removeLegacyProfile(storage);
  return migrated;
}

function persistedCurrentProfile(storage: ProfileStorage | undefined, stored: StoredDiningProfile): boolean {
  const current = safeParse(safeRead(storage, STORAGE_KEY));
  return isRecord(current)
    && current.schemaVersion === stored.schemaVersion
    && current.updatedAt === stored.updatedAt;
}

export function saveDiningProfile(
  storage: ProfileStorage | undefined,
  profile: DiningProfile,
  now = new Date()
): StoredDiningProfile {
  const normalizedProfile = normalizeProfile(profile) ?? createEmptyProfile();
  const stored: StoredDiningProfile = {
    schemaVersion: 1,
    updatedAt: safeIsoTimestamp(now),
    profile: normalizedProfile
  };

  persist(storage, stored);
  return { ...stored, profile: cloneProfile(stored.profile) };
}

export function clearDiningProfile(storage?: ProfileStorage): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {
    // Storage access is optional and can be blocked by browser privacy settings.
  }
}
