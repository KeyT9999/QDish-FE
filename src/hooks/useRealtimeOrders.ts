import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getRealtimeSocket } from '@/services/realtimeService';
import { orderService } from '@/services/orderService';
import { fetchAllOrderChanges } from '@/lib/realtimeOrderSync';
import { recordRealtimeOrderArrival } from '@/lib/realtimeOrderTelemetry';

type UseRealtimeOrdersOptions = {
  enabled?: boolean;
  restaurantId?: string;
  onNewOrder?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  onTableStatusUpdated?: (table: RealtimeTableStatusPayload) => void;
  onRealtimeSync?: (orders: Order[], options: { requiresFullRefresh: boolean }) => void | Promise<void>;
  showToast?: boolean;
};

export type RealtimeTableStatusPayload = {
  tableId?: string;
  code?: string;
  status?: string;
  activeSessionId?: string | null;
  currentSessionCode?: string | null;
  lastSessionClosedAt?: string | null;
};

export const REALTIME_ORDER_ALERT_DURATION_MS = 15000;

const ALERT_REPEAT_MS = 2000;
const RECENT_EVENT_WINDOW_MS = 60000;
const ORDER_SYNC_OVERLAP_MS = 5000;
const ORDER_SYNC_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const ORDER_SYNC_INITIAL_LOOKBACK_MS = 60000;
const ORDER_SYNC_HEALTHY_INTERVAL_MS = 60000;
const ORDER_SYNC_DEGRADED_INTERVAL_MS = 15000;
const ORDER_SYNC_POLL_TICK_MS = 5000;

let audioContext: AudioContext | null = null;
let isRealtimeAudioReady = false;
let alertIntervalId: number | null = null;
let alertTimeoutId: number | null = null;
let activeAlertOrderId: string | null = null;

const recentlyHandledNewOrderIds = new Map<string, number>();
const recentlyAlertedOrderIds = new Map<string, number>();

const getOrderId = (order: Order) => String(order.id || (order as any)._id || '');
const getOrderItems = (order: Order) => Array.isArray(order.items) ? order.items : [];

const pruneRecentIds = (store: Map<string, number>, now: number) => {
  store.forEach((timestamp, orderId) => {
    if (now - timestamp > RECENT_EVENT_WINDOW_MS) {
      store.delete(orderId);
    }
  });
};

const claimRecentId = (store: Map<string, number>, orderId: string) => {
  if (!orderId) return true;

  const now = Date.now();
  pruneRecentIds(store, now);

  const previousTimestamp = store.get(orderId);
  if (previousTimestamp && now - previousTimestamp < RECENT_EVENT_WINDOW_MS) {
    return false;
  }

  store.set(orderId, now);
  return true;
};

const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
};

const primeAlertAudio = (context: AudioContext) => {
  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.connect(context.destination);

  const oscillator = context.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.connect(gain);
  oscillator.start(now);
  oscillator.stop(now + 0.02);
};

export const enableRealtimeOrderAudio = async () => {
  const context = getAudioContext();
  if (!context) return false;

  if (context.state === 'suspended') {
    await context.resume().catch(() => undefined);
  }

  isRealtimeAudioReady = context.state === 'running';
  if (isRealtimeAudioReady) {
    primeAlertAudio(context);
  }

  return isRealtimeAudioReady;
};

const unlockAudio = () => {
  enableRealtimeOrderAudio().catch(() => undefined);
};

const playAlertPulse = () => {
  if (!audioContext && !isRealtimeAudioReady) return false;

  const context = getAudioContext();
  if (!context) return false;
  if (!isRealtimeAudioReady && context.state !== 'running') return false;

  context.resume().catch(() => undefined);

  const now = context.currentTime;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.32, now + 0.03);
  gain.gain.setValueAtTime(0.26, now + 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);
  gain.connect(context.destination);

  [0, 0.24, 0.48].forEach((offset) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(760, now + offset);
    oscillator.frequency.exponentialRampToValueAtTime(1180, now + offset + 0.1);
    oscillator.connect(gain);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.18);
  });

  return true;
};

export const stopRealtimeOrderAlert = (orderId?: string) => {
  if (orderId && activeAlertOrderId && activeAlertOrderId !== orderId) return;

  if (alertIntervalId) {
    window.clearInterval(alertIntervalId);
    alertIntervalId = null;
  }

  if (alertTimeoutId) {
    window.clearTimeout(alertTimeoutId);
    alertTimeoutId = null;
  }

  activeAlertOrderId = null;
};

export const startRealtimeOrderAlert = (order: Order) => {
  const orderId = getOrderId(order);

  if (!audioContext && !isRealtimeAudioReady) return false;

  const context = getAudioContext();
  if (!context) return false;
  if (!isRealtimeAudioReady && context.state !== 'running') return false;
  if (!claimRecentId(recentlyAlertedOrderIds, orderId)) return false;

  stopRealtimeOrderAlert();
  activeAlertOrderId = orderId || 'new-order';

  playAlertPulse();
  alertIntervalId = window.setInterval(playAlertPulse, ALERT_REPEAT_MS);
  alertTimeoutId = window.setTimeout(() => {
    stopRealtimeOrderAlert(orderId);
  }, REALTIME_ORDER_ALERT_DURATION_MS);

  return true;
};

const showNewOrderToast = (order: Order) => {
  const orderId = getOrderId(order).slice(-6).toUpperCase();
  const itemCount = getOrderItems(order).reduce((sum, item) => sum + item.quantity, 0);

  toast.success(`Đơn mới bàn ${order.tableNumber}`, {
    description: `#${orderId} • ${itemCount} món • ${formatCurrency(order.totalAmount)}`,
    duration: REALTIME_ORDER_ALERT_DURATION_MS,
    position: 'top-center',
  });
};

export const useRealtimeOrders = ({
  enabled = true,
  restaurantId = '',
  onNewOrder,
  onOrderUpdated,
  onTableStatusUpdated,
  onRealtimeSync,
  showToast = true,
}: UseRealtimeOrdersOptions) => {
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const onTableStatusUpdatedRef = useRef(onTableStatusUpdated);
  const onRealtimeSyncRef = useRef(onRealtimeSync);
  const lastSyncedRestaurantIdRef = useRef('');
  const lastSyncedAtRef = useRef(0);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    onOrderUpdatedRef.current = onOrderUpdated;
    onTableStatusUpdatedRef.current = onTableStatusUpdated;
    onRealtimeSyncRef.current = onRealtimeSync;
  }, [onNewOrder, onOrderUpdated, onTableStatusUpdated, onRealtimeSync]);

  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!enabled || !restaurantId) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    if (lastSyncedRestaurantIdRef.current !== restaurantId) {
      lastSyncedRestaurantIdRef.current = restaurantId;
      lastSyncedAtRef.current = Date.now() - ORDER_SYNC_INITIAL_LOOKBACK_MS;
    }

    let isActive = true;
    let lastJoinKey = '';
    let isSubscribed = false;
    let lastFallbackSyncAt = Date.now();
    let syncPromise: Promise<void> | null = null;

    const handleNewOrder = (order: Order) => {
      const displayOrder = { ...order };
      delete displayOrder.realtimeTrace;
      const orderId = getOrderId(order);
      if (!claimRecentId(recentlyHandledNewOrderIds, orderId)) return;
      if (order.realtimeTrace) recordRealtimeOrderArrival(order.realtimeTrace);

      onNewOrderRef.current?.(displayOrder);
      startRealtimeOrderAlert(displayOrder);
      if (showToast) {
        showNewOrderToast(displayOrder);
      }
    };

    const handleOrderUpdated = (order: Order) => {
      onOrderUpdatedRef.current?.(order);
    };

    const handleTableStatusUpdated = (table: RealtimeTableStatusPayload) => {
      onTableStatusUpdatedRef.current?.(table);
    };

    const syncMissedOrders = () => {
      if (!isActive) return Promise.resolve();
      if (syncPromise) return syncPromise;

      const lastSyncedAt = lastSyncedAtRef.current;
      if (Date.now() - lastSyncedAt > ORDER_SYNC_MAX_AGE_MS) {
        const refreshStartedAt = Date.now();
        syncPromise = Promise.resolve(onRealtimeSyncRef.current?.([], { requiresFullRefresh: true }))
          .then(() => { lastSyncedAtRef.current = refreshStartedAt; })
          .catch((error) => console.error('[realtime] full order refresh failed', error))
          .finally(() => { syncPromise = null; });
        return syncPromise;
      }

      const since = new Date(Math.max(0, lastSyncedAt - ORDER_SYNC_OVERLAP_MS)).toISOString();
      syncPromise = fetchAllOrderChanges<Order>(
        (request) => orderService.getChanges({ restaurantId, ...request }),
        { since, limit: 200 }
      )
        .then(async ({ orders, snapshotAt }) => {
          if (!isActive) return;
          await onRealtimeSyncRef.current?.(orders, { requiresFullRefresh: false });
          lastSyncedAtRef.current = Date.parse(snapshotAt);
        })
        .catch(async (error) => {
          if (!isActive) return;
          console.error('[realtime] order changes reconciliation failed', error);
          try {
            const refreshStartedAt = Date.now();
            await onRealtimeSyncRef.current?.([], { requiresFullRefresh: true });
            lastSyncedAtRef.current = refreshStartedAt;
          } catch (refreshError) {
            console.error('[realtime] fallback order refresh failed', refreshError);
          }
        })
        .finally(() => { syncPromise = null; });

      return syncPromise;
    };

    const requestRestaurantJoin = () => {
      if (!socket.connected) return;
      const joinKey = `${socket.id || 'connected'}:${restaurantId}`;
      if (lastJoinKey === joinKey) return;
      lastJoinKey = joinKey;

      socket.timeout(5000).emit('restaurant:join', { restaurantId }, (error: Error | null, result?: {
        ok?: boolean;
        message?: string;
      }) => {
        if (!isActive) return;
        if (error || !result?.ok) {
          isSubscribed = false;
          lastJoinKey = '';
          console.error('[realtime] restaurant room subscription acknowledgement failed', error);
          if (result?.message) toast.error(result.message);
          return;
        }
        isSubscribed = true;
        void syncMissedOrders();
      });
    };

    const handleConnect = () => {
      lastJoinKey = '';
      isSubscribed = false;
      requestRestaurantJoin();
    };

    const handleRealtimeReady = (payload: { restaurantId?: string }) => {
      if (payload?.restaurantId === restaurantId) {
        isSubscribed = true;
        void syncMissedOrders();
      }
    };

    const handleAccessRevoked = (payload: { restaurantId?: string }) => {
      if (payload?.restaurantId === restaurantId) {
        lastJoinKey = '';
        isSubscribed = false;
        toast.warning('Quyền realtime của chi nhánh này đã bị thu hồi.');
      }
    };

    const handleVisible = () => {
      if (document.visibilityState !== 'visible') return;
      requestRestaurantJoin();
      void syncMissedOrders();
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-updated', handleOrderUpdated);
    socket.on('table:status-updated', handleTableStatusUpdated);
    socket.on('connect', handleConnect);
    socket.on('realtime:ready', handleRealtimeReady);
    socket.on('restaurant:access-revoked', handleAccessRevoked);
    window.addEventListener('focus', handleVisible);
    document.addEventListener('visibilitychange', handleVisible);
    const fallbackPollId = window.setInterval(() => {
      if (!isActive || document.visibilityState !== 'visible') return;
      const intervalMs = socket.connected && isSubscribed
        ? ORDER_SYNC_HEALTHY_INTERVAL_MS
        : ORDER_SYNC_DEGRADED_INTERVAL_MS;
      if (Date.now() - lastFallbackSyncAt < intervalMs) return;
      lastFallbackSyncAt = Date.now();
      if (!isSubscribed) requestRestaurantJoin();
      void syncMissedOrders();
    }, ORDER_SYNC_POLL_TICK_MS);

    // The singleton socket may have connected before this hook mounted.
    requestRestaurantJoin();

    return () => {
      isActive = false;
      socket.off('new-order', handleNewOrder);
      socket.off('order-updated', handleOrderUpdated);
      socket.off('table:status-updated', handleTableStatusUpdated);
      socket.off('connect', handleConnect);
      socket.off('realtime:ready', handleRealtimeReady);
      socket.off('restaurant:access-revoked', handleAccessRevoked);
      window.removeEventListener('focus', handleVisible);
      document.removeEventListener('visibilitychange', handleVisible);
      window.clearInterval(fallbackPollId);
      stopRealtimeOrderAlert();
    };
  }, [enabled, restaurantId, showToast]);
};

export const upsertRealtimeOrder = (orders: Order[], incoming: Order) => {
  const incomingId = getOrderId(incoming);
  if (!incomingId) return orders;

  const existingIndex = orders.findIndex((order) => getOrderId(order) === incomingId);
  if (existingIndex === -1) {
    return [incoming, ...orders];
  }

  const next = [...orders];
  next[existingIndex] = incoming;
  return next;
};
