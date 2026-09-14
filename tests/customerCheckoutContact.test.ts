import assert from 'node:assert/strict';

import {
  buildCustomerContactPayload,
  isOptionalVietnamesePhoneValid
} from '../src/services/customerContact.ts';

assert.equal(isOptionalVietnamesePhoneValid(''), true);
assert.equal(isOptionalVietnamesePhoneValid('0912 345 678'), true);
assert.equal(isOptionalVietnamesePhoneValid('+84912345678'), true);
assert.equal(isOptionalVietnamesePhoneValid('12345'), false);

assert.deepEqual(buildCustomerContactPayload({
  customerName: '  Minh Anh  ',
  customerPhone: '',
  marketingConsent: true
}), {
  customerName: 'Minh Anh'
});

assert.deepEqual(buildCustomerContactPayload({
  customerName: 'Minh Anh',
  customerPhone: '0912 345 678',
  marketingConsent: true
}), {
  customerName: 'Minh Anh',
  customerPhone: '+84912345678',
  marketingConsent: true,
  consentVersion: 'crm-v1'
});

console.log('customer checkout contact tests passed');
