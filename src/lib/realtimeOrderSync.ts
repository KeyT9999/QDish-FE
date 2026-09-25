export interface RealtimeOrderChangesPage<TOrder> {
  orders: TOrder[];
  snapshotAt: string;
  nextCursor: string | null;
  hasMore: boolean;
}

export interface RealtimeOrderChangesRequest {
  since: string;
  cursor: string | null;
  snapshotAt: string | null;
  limit: number;
}

type FetchChangesPage<TOrder> = (
  request: RealtimeOrderChangesRequest
) => Promise<RealtimeOrderChangesPage<TOrder>>;

const getOrderId = (order: unknown) => {
  if (!order || typeof order !== 'object') return '';
  const value = order as { id?: unknown; _id?: unknown };
  return String(value.id || value._id || '');
};

export async function fetchAllOrderChanges<TOrder>(
  fetchPage: FetchChangesPage<TOrder>,
  options: { since: string; limit?: number }
): Promise<{ orders: TOrder[]; snapshotAt: string }> {
  const limit = Math.min(Math.max(Math.trunc(options.limit || 100), 1), 200);
  const ordersById = new Map<string, TOrder>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let snapshotAt: string | null = null;
  let hasMore = true;
  let pageCount = 0;

  while (hasMore) {
    pageCount += 1;
    if (pageCount > 1000) throw new Error('Order changes exceeded the pagination safety limit');

    const page = await fetchPage({
      since: options.since,
      cursor,
      snapshotAt,
      limit
    });

    if (!page.snapshotAt || !Number.isFinite(Date.parse(page.snapshotAt))) {
      throw new Error('Order changes response has an invalid snapshot timestamp');
    }
    if (snapshotAt && snapshotAt !== page.snapshotAt) {
      throw new Error('Order changes snapshot changed during pagination');
    }
    snapshotAt ??= page.snapshotAt;

    for (const order of page.orders) {
      const orderId = getOrderId(order);
      if (!orderId) throw new Error('Order changes response contains an order without an id');
      ordersById.set(orderId, order);
    }

    hasMore = page.hasMore;
    if (hasMore) {
      if (!page.nextCursor || seenCursors.has(page.nextCursor)) {
        throw new Error('Order changes pagination is missing a forward cursor');
      }
      seenCursors.add(page.nextCursor);
    }
    cursor = page.nextCursor;
  }

  return { orders: [...ordersById.values()], snapshotAt: snapshotAt! };
}
