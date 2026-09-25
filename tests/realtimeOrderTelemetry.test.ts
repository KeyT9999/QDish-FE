import assert from 'node:assert/strict';

import { recordRealtimeOrderArrival, summarizeRealtimeLatency } from '../src/lib/realtimeOrderTelemetry.ts';

const summary = summarizeRealtimeLatency([40, 5, 20, Number.NaN, -1]);
assert.deepEqual(summary, { sampleCount: 3, p50Ms: 20, p95Ms: 40, p99Ms: 40 });
assert.equal(summarizeRealtimeLatency([]), null);

const arrival = recordRealtimeOrderArrival({
  requestId: 'req-123',
  emittedAt: '2026-09-25T10:00:00.000Z',
}, Date.parse('2026-09-25T10:00:00.240Z'));
assert.equal(arrival?.estimatedDeliveryMs, 240);
assert.equal(recordRealtimeOrderArrival({ requestId: 'invalid request id', emittedAt: new Date().toISOString() }), null);
assert.equal(recordRealtimeOrderArrival({ requestId: 'req-456', emittedAt: 'not-a-date' }), null);

const originalInfo = console.info;
let summaryCount = 0;
console.info = () => { summaryCount += 1; };
for (let index = 0; index < 124; index += 1) {
  recordRealtimeOrderArrival({
    requestId: `req-${index}`,
    emittedAt: '2026-09-25T10:00:00.000Z',
  }, Date.parse('2026-09-25T10:00:00.050Z'));
}
console.info = originalInfo;
assert.equal(summaryCount, 5, 'latency summaries should stay at one per 25 arrivals after the rolling sample buffer fills');

console.log('realtime order telemetry tests passed');
