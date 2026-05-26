import { NotificationItem, NotificationType } from '../types';

export interface FormattedSender {
  icon: string;
  text: string;
  roleBadge?: string;
  highlightName?: string;
}

/**
 * Formats the notification sender into a readable structure with icon, text, and badges.
 * Handles both manual users and automated system events.
 */
export function formatNotificationSender(notification: NotificationItem): FormattedSender {
  const { source, type, senderRole, sender, restaurant } = notification;

  // 1. AUTO system notifications (source === 'AUTO')
  if (source === 'AUTO') {
    switch (type) {
      case NotificationType.ORDER:
        return {
          icon: '⚙️',
          text: 'Hệ thống đơn hàng',
          roleBadge: 'Đơn hàng'
        };
      case NotificationType.PAYMENT:
        return {
          icon: '💳',
          text: 'Hệ thống thanh toán PayOS',
          roleBadge: 'Thanh toán'
        };
      case NotificationType.SUBSCRIPTION:
        return {
          icon: '🛡️',
          text: 'Hệ thống gói dịch vụ',
          roleBadge: 'Gói dịch vụ'
        };
      default:
        return {
          icon: '⚙️',
          text: 'Hệ thống QDish',
          roleBadge: 'Hệ thống'
        };
    }
  }

  // 2. MANUAL notifications (source === 'MANUAL')
  if (source === 'MANUAL') {
    const senderName = sender?.name;
    const restaurantName = restaurant?.name;

    if (senderRole === 'SUPER_ADMIN') {
      return {
        icon: '👤',
        text: `Super Admin - ${senderName || 'KAYT'}`,
        roleBadge: 'Super Admin',
        highlightName: senderName || 'KAYT'
      };
    }

    if (senderRole === 'RESTAURANT_OWNER') {
      const displayName = restaurantName ? `Chủ nhà hàng - ${restaurantName}` : `Chủ nhà hàng - ${senderName || 'Owner'}`;
      return {
        icon: '👤',
        text: displayName,
        roleBadge: 'Chủ nhà hàng',
        highlightName: restaurantName || senderName || 'Owner'
      };
    }

    if (senderRole === 'RESTAURANT_ADMIN') {
      const displayName = restaurantName ? `Quản lý nhà hàng - ${restaurantName}` : `Quản lý nhà hàng - ${senderName || 'Admin'}`;
      return {
        icon: '👤',
        text: displayName,
        roleBadge: 'Quản lý',
        highlightName: restaurantName || senderName || 'Admin'
      };
    }

    if (senderRole === 'STAFF') {
      return {
        icon: '👤',
        text: `Nhân viên - ${senderName || 'Staff'}`,
        roleBadge: 'Nhân viên',
        highlightName: senderName || 'Staff'
      };
    }
  }

  // 3. Fallback
  return {
    icon: '⚙️',
    text: 'Hệ thống QDish',
    roleBadge: 'Hệ thống'
  };
}
