import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const onboarding = readFileSync('src/components/dining/DiningOnboarding.tsx', 'utf8');
assert.equal(onboarding.includes('/api/users/profile/'), false);
assert.equal(onboarding.includes('userId:'), false);
assert.equal(onboarding.includes('recordDiningVisit'), true);

const form = readFileSync('src/components/dining/DiningProfileForm.tsx', 'utf8');
assert.equal(form.includes('Xóa hồ sơ ăn uống'), true);
assert.equal(form.includes('window.confirm'), true);

console.log('dining profile UI policy tests passed');
