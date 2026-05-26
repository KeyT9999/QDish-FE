import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

import type { NotificationItem, NotificationPriority } from '@/types';
import { notificationService } from '@/services/notificationService';
import { getRealtimeSocket } from '@/services/realtimeService';

interface UseNotificationsOptions {
  enabled?: boolean;
}

export function useNotifications({ enabled = true }: UseNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const fetchingRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const result = await notificationService.getNotifications({
        page: pageNum,
        limit: 20,
        unreadOnly,
        type: filter || undefined
      });
      const safeNotifications = Array.isArray(result?.notifications) ? result.notifications : [];
      const safePagination = result?.pagination;
      const safeUnreadCount = Number.isFinite(result?.unreadCount)
        ? result.unreadCount
        : safeNotifications.filter((notification) => !notification.isRead).length;

      setNotifications(prev =>
        append ? [...prev, ...safeNotifications] : safeNotifications
      );
      setUnreadCount(safeUnreadCount);
      setPage(Number(safePagination?.page) || pageNum);
      setTotalPages(Math.max(1, Number(safePagination?.totalPages) || 1));
      setTotal(Math.max(0, Number(safePagination?.total) || safeNotifications.length));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [filter, unreadOnly]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark read (optimistic update with state rollback)
  const markAsRead = useCallback(async (id: string) => {
    let originalNotifications: NotificationItem[] = [];
    let wasUnread = false;

    setNotifications(prev => {
      originalNotifications = prev;
      return prev.map(n => {
        if (n.id === id) {
          if (!n.isRead) wasUnread = true;
          return { ...n, isRead: true, readAt: new Date().toISOString() };
        }
        return n;
      });
    });

    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Không thể cập nhật trạng thái đã đọc thông báo');
      // Revert states
      setNotifications(originalNotifications);
      if (wasUnread) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, []);

  // Mark all read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Archive
  const archiveNotification = useCallback(async (id: string) => {
    try {
      await notificationService.archiveNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to archive notification:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    fetchNotifications(1);
  }, [enabled, fetchNotifications]);

  // Initial unread count
  useEffect(() => {
    if (!enabled) return;
    fetchUnreadCount();
  }, [enabled, fetchUnreadCount]);

  // Socket.IO realtime listener
  useEffect(() => {
    if (!enabled) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const handleNewNotification = (payload: {
      id: string;
      title: string;
      message: string;
      type: string;
      priority: string;
      actionUrl?: string;
      senderRole?: string;
      senderId?: string;
      metadata?: Record<string, any>;
      createdAt: string;
    }) => {
      // Add to top of list
      const newItem: NotificationItem = {
        id: payload.id,
        notificationId: payload.id,
        title: payload.title,
        message: payload.message,
        type: payload.type as any,
        priority: payload.priority as NotificationPriority,
        source: 'AUTO',
        actionUrl: payload.actionUrl,
        senderRole: payload.senderRole,
        senderId: payload.senderId,
        metadata: payload.metadata,
        isRead: false,
        createdAt: payload.createdAt
      };

      setNotifications(prev => [newItem, ...prev]);

      // Show toast
      const isUrgent = payload.priority === 'URGENT' || payload.priority === 'HIGH';
      if (isUrgent) {
        toast.warning(payload.title, {
          description: payload.message,
          duration: 8000,
          position: 'top-center'
        });
      } else {
        toast.info(payload.title, {
          description: payload.message,
          duration: 5000,
          position: 'top-center'
        });
      }
    };

    const handleUnreadCount = (payload: { unreadCount: number }) => {
      setUnreadCount(payload.unreadCount);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:unread-count', handleUnreadCount);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:unread-count', handleUnreadCount);
    };
  }, [enabled]);

  return {
    notifications,
    unreadCount,
    loading,
    page,
    totalPages,
    total,
    filter,
    unreadOnly,
    setFilter,
    setUnreadOnly,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    setPage
  };
}
