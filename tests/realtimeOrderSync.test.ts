import assert from 'node:assert/strict';
import { fetchAllOrderChanges } from '../src/lib/realtimeOrderSync.ts';

async function run() {
  const requests: Array<{ since: string; cursor: string | null; snapshotAt: string | null }> = [];
  const result = await fetchAllOrderChanges<{ id: string; updatedAt: string }>(
    async ({ since, cursor, snapshotAt }) => {
      requests.push({ since, cursor, snapshotAt });
      if (!cursor) {
        return {
          orders: [{ id: 'order-1', updatedAt: '2026-09-25T01:00:00.000Z' }],
          snapshotAt: '2026-09-25T01:01:00.000Z',
          nextCursor: 'cursor-page-2',
          hasMore: true
        };
      }

      return {
        orders: [
          { id: 'order-1', updatedAt: '2026-09-25T01:00:30.000Z' },
          { id: 'order-2', updatedAt: '2026-09-25T01:00:45.000Z' }
        ],
        snapshotAt: '2026-09-25T01:01:00.000Z',
        nextCursor: null,
        hasMore: false
      };
    },
    { since: '2026-09-25T00:59:00.000Z' }
  );

  assert.deepEqual(result.orders.map((order) => order.id), ['order-1', 'order-2']);
  assert.equal(result.orders[0].updatedAt, '2026-09-25T01:00:30.000Z', 'the newest version should win when an order appears more than once');
  assert.equal(result.snapshotAt, '2026-09-25T01:01:00.000Z');
  assert.deepEqual(requests, [
    { since: '2026-09-25T00:59:00.000Z', cursor: null, snapshotAt: null },
    { since: '2026-09-25T00:59:00.000Z', cursor: 'cursor-page-2', snapshotAt: '2026-09-25T01:01:00.000Z' }
  ]);

  await assert.rejects(
    fetchAllOrderChanges(
      async () => ({
        orders: [],
        snapshotAt: '2026-09-25T01:01:00.000Z',
        nextCursor: null,
        hasMore: true
      }),
      { since: '2026-09-25T00:59:00.000Z' }
    ),
    /cursor/i
  );
}

run().then(() => console.log('realtime order sync tests passed')).catch((error) => {
  console.error(error);
  process.exit(1);
});
