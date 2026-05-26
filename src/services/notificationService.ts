import { apiFetch } from './api';
import type {
  NotificationListResponse,
  CreateNotificationPayload,
  AdminNotificationTargets,
  OwnerNotificationTargets
} from '@/types';

export const notificationService = {
  // Get notifications for current user
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.unreadOnly) query.set('unreadOnly', 'true');
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return apiFetch<NotificationListResponse>(`/api/notifications${qs ? `?${qs}` : ''}`);
  },

  // Get unread count
  getUnreadCount: () =>
    apiFetch<{ unreadCount: number }>('/api/notifications/unread-count'),

  // Mark single notification as read
  markAsRead: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH'
    }),

  // Mark all notifications as read
  markAllAsRead: () =>
    apiFetch<{ success: boolean; updatedCount: number }>('/api/notifications/read-all', {
      method: 'PATCH'
    }),

  // Archive notification
  archiveNotification: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/notifications/${id}/archive`, {
      method: 'PATCH'
    }),

  // Super Admin: create notification
  adminCreateNotification: (payload: CreateNotificationPayload) =>
    apiFetch<{ message: string; notification: any; recipientCount: number }>(
      '/api/admin/notifications',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  // Owner: create notification
  ownerCreateNotification: (payload: CreateNotificationPayload) =>
    apiFetch<{ message: string; notification: any; recipientCount: number }>(
      '/api/owner/notifications',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  // Get admin targets (owners + restaurants)
  getAdminTargets: () =>
    apiFetch<AdminNotificationTargets>('/api/admin/notifications/targets'),

  // Get owner targets (own restaurants)
  getOwnerTargets: () =>
    apiFetch<OwnerNotificationTargets>('/api/owner/notifications/targets')
};
