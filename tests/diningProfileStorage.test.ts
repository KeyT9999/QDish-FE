import assert from 'node:assert/strict';

import {
  DINING_ONBOARDING_HANDLED_STORAGE_KEY,
  EMPTY_DINING_PROFILE,
  clearDiningProfile,
  hasDiningProfileSelections,
  loadDiningOnboardingHandled,
  loadDiningProfile,
  markDiningOnboardingHandled,
  saveDiningProfile
} from '../src/services/diningProfileStorage.ts';

function createMemoryStorage() {
  const values = new Map<string, string>();

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
    removeItem(key: string) {
      values.delete(key);
    }
  };
}

function testMigratesPlainProfileAndNormalizesValues() {
  const storage = createMemoryStorage();
  storage.setItem('qdish_dining_profile', JSON.stringify({
    goals: ['BALANCED', 'BALANCED', 'UNKNOWN', 1],
    preferences: ['VEGAN', 'VEGAN', 'UNKNOWN', null],
    allergies: ['SOY', 'SOY', 'UNKNOWN', {}],
    conditions: ['DIABETES', 'DIABETES', 'UNKNOWN', false]
  }));

  const migrated = loadDiningProfile(storage);

  assert.deepEqual(migrated.profile, {
    goals: ['BALANCED'],
    preferences: ['VEGAN'],
    allergies: ['SOY'],
    conditions: ['DIABETES']
  });
  assert.equal(migrated.schemaVersion, 1);
  assert.match(migrated.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(JSON.parse(storage.getItem('qdish_dining_profile')!).schemaVersion, 1);
}

function testMigratesAndRemovesLegacyHealthProfile() {
  const storage = createMemoryStorage();
  storage.setItem('qdish_health_profile', JSON.stringify({
    goals: ['MUSCLE_GAIN'],
    preferences: ['HIGH_PROTEIN'],
    allergies: ['NUTS'],
    conditions: ['HYPERTENSION']
  }));

  const migrated = loadDiningProfile(storage);

  assert.deepEqual(migrated.profile, {
    goals: ['MUSCLE_GAIN'],
    preferences: ['HIGH_PROTEIN'],
    allergies: ['NUTS'],
    conditions: ['HYPERTENSION']
  });
  assert.equal(JSON.parse(storage.getItem('qdish_dining_profile')!).schemaVersion, 1);
  assert.equal(storage.getItem('qdish_health_profile'), null);
}

function testRejectsUnknownVersionsAndMalformedValues() {
  const storage = createMemoryStorage();
  storage.setItem('qdish_dining_profile', JSON.stringify({ schemaVersion: 2, profile: {} }));
  assert.deepEqual(loadDiningProfile(storage).profile, EMPTY_DINING_PROFILE);

  storage.setItem('qdish_dining_profile', '{not json');
  assert.deepEqual(loadDiningProfile(storage).profile, EMPTY_DINING_PROFILE);

  storage.setItem('qdish_dining_profile', JSON.stringify({
    schemaVersion: 1,
    updatedAt: 'not-an-iso-timestamp',
    profile: { goals: [], preferences: [], allergies: [], conditions: [] }
  }));
  assert.deepEqual(loadDiningProfile(storage).profile, EMPTY_DINING_PROFILE);
}

function testDoesNotMigrateLegacyProfileWhenCurrentJsonIsMalformed() {
  const storage = createMemoryStorage();
  storage.setItem('qdish_dining_profile', '{not json');
  storage.setItem('qdish_health_profile', JSON.stringify({
    goals: ['MUSCLE_GAIN'], preferences: [], allergies: [], conditions: []
  }));

  const loaded = loadDiningProfile(storage);

  assert.deepEqual(loaded.profile, EMPTY_DINING_PROFILE);
  assert.equal(storage.getItem('qdish_health_profile') !== null, true);
}

function testLoadsAValidVersionOneEnvelope() {
  const storage = createMemoryStorage();
  storage.setItem('qdish_dining_profile', JSON.stringify({
    schemaVersion: 1,
    updatedAt: '2026-08-01T12:34:56+00:00',
    profile: {
      goals: ['ENERGY_BOOST'], preferences: ['LOW_CARB'], allergies: ['FISH'], conditions: []
    }
  }));

  const loaded = loadDiningProfile(storage);

  assert.equal(loaded.updatedAt, '2026-08-01T12:34:56+00:00');
  assert.deepEqual(loaded.profile, {
    goals: ['ENERGY_BOOST'], preferences: ['LOW_CARB'], allergies: ['FISH'], conditions: []
  });
}

function testSavesCanonicalEnvelopeWithIsoTimestamp() {
  const storage = createMemoryStorage();
  const timestamp = new Date('2026-08-01T12:34:56.789Z');

  const stored = saveDiningProfile(storage, {
    goals: ['BALANCED', 'BALANCED'],
    preferences: ['VEGAN', 'UNKNOWN' as never],
    allergies: ['DAIRY', 'DAIRY'],
    conditions: ['CELIAC', 'UNKNOWN' as never]
  }, timestamp);

  assert.equal(stored.schemaVersion, 1);
  assert.equal(stored.updatedAt, '2026-08-01T12:34:56.789Z');
  assert.deepEqual(stored.profile, {
    goals: ['BALANCED'],
    preferences: ['VEGAN'],
    allergies: ['DAIRY'],
    conditions: ['CELIAC']
  });
  assert.deepEqual(JSON.parse(storage.getItem('qdish_dining_profile')!), stored);
}

function testUsesFreshEmptyProfilesAndClearsStorage() {
  const storage = createMemoryStorage();
  const first = loadDiningProfile(storage);
  const second = loadDiningProfile(storage);

  assert.notEqual(first.profile, second.profile);
  assert.notEqual(first.profile.goals, second.profile.goals);
  assert.throws(() => EMPTY_DINING_PROFILE.goals.push('BALANCED'));

  saveDiningProfile(storage, {
    goals: ['BALANCED'], preferences: [], allergies: [], conditions: []
  });
  storage.setItem('qdish_health_profile', JSON.stringify({
    goals: ['MUSCLE_GAIN'], preferences: [], allergies: [], conditions: []
  }));
  markDiningOnboardingHandled(storage);
  clearDiningProfile(storage);

  assert.equal(storage.getItem('qdish_dining_profile'), null);
  assert.equal(storage.getItem('qdish_health_profile'), null);
  assert.equal(storage.getItem(DINING_ONBOARDING_HANDLED_STORAGE_KEY), '1');
  assert.equal(loadDiningOnboardingHandled(storage), true);
  assert.deepEqual(loadDiningProfile(storage).profile, EMPTY_DINING_PROFILE);
}

function testKeepsLegacyProfileWhenCurrentPlainProfileRewriteFails() {
  const values = new Map<string, string>([
    ['qdish_dining_profile', JSON.stringify({
      goals: ['BALANCED'], preferences: [], allergies: [], conditions: []
    })],
    ['qdish_health_profile', JSON.stringify({
      goals: ['MUSCLE_GAIN'], preferences: [], allergies: [], conditions: []
    })],
  ]);
  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem() {
      throw new Error('storage quota exceeded');
    },
    removeItem(key: string) {
      values.delete(key);
    },
  };

  const loaded = loadDiningProfile(storage);

  assert.deepEqual(loaded.profile, {
    goals: ['BALANCED'], preferences: [], allergies: [], conditions: []
  });
  assert.notEqual(storage.getItem('qdish_health_profile'), null);
}

function testSelectionDetectionIncludesAllergiesAndConditions() {
  assert.equal(hasDiningProfileSelections({
    goals: [], preferences: [], allergies: ['SOY'], conditions: []
  }), true);
  assert.equal(hasDiningProfileSelections({
    goals: [], preferences: [], allergies: [], conditions: ['DIABETES']
  }), true);
  assert.equal(hasDiningProfileSelections({
    goals: [], preferences: [], allergies: [], conditions: []
  }), false);
}

function testOnboardingHandledMarkerFailsClosedWithoutThrowing() {
  const storage = createMemoryStorage();
  assert.equal(loadDiningOnboardingHandled(storage), false);

  markDiningOnboardingHandled(storage);

  assert.equal(loadDiningOnboardingHandled(storage), true);
  assert.equal(storage.getItem(DINING_ONBOARDING_HANDLED_STORAGE_KEY), '1');
}

testMigratesPlainProfileAndNormalizesValues();
testMigratesAndRemovesLegacyHealthProfile();
testRejectsUnknownVersionsAndMalformedValues();
testDoesNotMigrateLegacyProfileWhenCurrentJsonIsMalformed();
testLoadsAValidVersionOneEnvelope();
testSavesCanonicalEnvelopeWithIsoTimestamp();
testUsesFreshEmptyProfilesAndClearsStorage();
testKeepsLegacyProfileWhenCurrentPlainProfileRewriteFails();
testSelectionDetectionIncludesAllergiesAndConditions();
testOnboardingHandledMarkerFailsClosedWithoutThrowing();
console.log('dining profile storage tests passed');
