import { useCallback, useRef, useState } from 'react';

export function usePendingOrderUpdates() {
  const [pendingOrderIds, setPendingOrderIds] = useState<ReadonlySet<string>>(() => new Set());
  const pendingOrderIdsRef = useRef(new Set<string>());

  const beginOrderUpdate = useCallback((orderId: string) => {
    if (!orderId || pendingOrderIdsRef.current.has(orderId)) return false;

    const next = new Set(pendingOrderIdsRef.current);
    next.add(orderId);
    pendingOrderIdsRef.current = next;
    setPendingOrderIds(next);
    return true;
  }, []);

  const finishOrderUpdate = useCallback((orderId: string) => {
    if (!pendingOrderIdsRef.current.has(orderId)) return;

    const next = new Set(pendingOrderIdsRef.current);
    next.delete(orderId);
    pendingOrderIdsRef.current = next;
    setPendingOrderIds(next);
  }, []);

  return { pendingOrderIds, beginOrderUpdate, finishOrderUpdate };
}
