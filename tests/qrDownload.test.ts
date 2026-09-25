import assert from 'node:assert/strict';
import { getTableFileName } from '../src/utils/qrDownload.ts';

// Test 1: Simple numbers
assert.equal(getTableFileName('1'), 'ban1.jpg');
assert.equal(getTableFileName('2'), 'ban2.jpg');
assert.equal(getTableFileName('15'), 'ban15.jpg');

// Test 2: Padded numbers
assert.equal(getTableFileName('01'), 'ban1.jpg');
assert.equal(getTableFileName('09'), 'ban9.jpg');

// Test 3: Vietnamese prefixes
assert.equal(getTableFileName('Bàn 1'), 'ban1.jpg');
assert.equal(getTableFileName('Bàn 02'), 'ban2.jpg');
assert.equal(getTableFileName('ban 5'), 'ban5.jpg');
assert.equal(getTableFileName('Ban 10'), 'ban10.jpg');

// Test 4: Alphanumeric codes
assert.equal(getTableFileName('A1'), 'ban1.jpg');
assert.equal(getTableFileName('VIP'), 'banvip.jpg');

console.log('All QR download file name tests passed!');
