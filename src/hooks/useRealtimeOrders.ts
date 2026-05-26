import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { Order } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { getRealtimeSocket } from '@/services/realtimeService';

type UseRealtimeOrdersOptions = {
  enabled?: boolean;
  onNewOrder?: (order: Order) => void;
  onOrderUpdated?: (order: Order) => void;
  showToast?: boolean;
};

export const REALTIME_ORDER_ALERT_DURATION_MS = 15000;

const ALERT_REPEAT_MS = 2000;
const RECENT_EVENT_WINDOW_MS = 60000;

let audioContext: AudioContext | null = null;
let isRealtimeAudioReady = false;
let alertIntervalId: ReturnType<typeof window.setInterval> | null = null;
let alertTimeoutId: ReturnType<typeof window.setTimeout> | null = null;
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
  onNewOrder,
  onOrderUpdated,
  showToast = true,
}: UseRealtimeOrdersOptions) => {
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdatedRef = useRef(onOrderUpdated);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
    onOrderUpdatedRef.current = onOrderUpdated;
  }, [onNewOrder, onOrderUpdated]);

  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const handleNewOrder = (order: Order) => {
      const orderId = getOrderId(order);
      if (!claimRecentId(recentlyHandledNewOrderIds, orderId)) return;

      onNewOrderRef.current?.(order);
      startRealtimeOrderAlert(order);
      if (showToast) {
        showNewOrderToast(order);
      }
    };

    const handleOrderUpdated = (order: Order) => {
      onOrderUpdatedRef.current?.(order);
    };

    socket.emit('restaurant:join');
    socket.on('new-order', handleNewOrder);
    socket.on('order-updated', handleOrderUpdated);

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-updated', handleOrderUpdated);
      stopRealtimeOrderAlert();
    };
  }, [enabled, showToast]);
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
