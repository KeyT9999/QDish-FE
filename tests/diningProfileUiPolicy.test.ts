import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync('src/components/dining/DiningOnboarding.tsx', 'utf8');
assert.equal(onboarding.includes('/api/users/profile/'), false);
assert.equal(onboarding.includes('userId:'), false);
assert.equal(onboarding.includes('recordDiningVisit'), true);
assert.equal(onboarding.includes('void recordDiningVisit({'), true);
assert.equal(onboarding.includes('.catch((error) =>'), true);
assert.equal(onboarding.includes('await recordDiningVisit'), false);

const form = readFileSync('src/components/dining/DiningProfileForm.tsx', 'utf8');
assert.equal(form.includes('Xóa hồ sơ ăn uống'), true);
assert.equal(form.includes('window.confirm'), true);
assert.equal(form.includes('conditions: initialProfile.conditions'), true);

const customerMenu = readFileSync('src/pages/CustomerMenu.tsx', 'utf8');
assert.equal(customerMenu.includes('onboardingHandled'), true);
assert.equal(customerMenu.includes('hasDiningProfileSelections(profile)'), true);
assert.equal(customerMenu.includes('onClearProfile={clearProfile}'), true);
assert.equal(customerMenu.includes('markOnboardingHandled'), true);

console.log('dining profile UI policy tests passed');
