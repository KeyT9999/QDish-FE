import React from 'react';
import {
  ShoppingBag,
  CreditCard,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bell as BellIcon,
  Clock
} from 'lucide-react';
import type { NotificationItem as NotifItem } from '@/types';
import { NotificationType } from '@/types';

interface NotificationItemProps {
  notification: NotifItem;
  onRead?: (id: string) => void;
  onClick?: (notification: NotifItem) => void;
  compact?: boolean;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  [NotificationType.ORDER]: { icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [NotificationType.PAYMENT]: { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
  [NotificationType.SUBSCRIPTION]: { icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
  [NotificationType.INFO]: { icon: Info, color: 'text-sky-600', bg: 'bg-sky-50' },
  [NotificationType.SUCCESS]: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  [NotificationType.WARNING]: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  [NotificationType.ERROR]: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  [NotificationType.SYSTEM]: { icon: BellIcon, color: 'text-gray-600', bg: 'bg-gray-50' },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

export const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onClick,
  compact = false
}) => {
  const config = typeConfig[notification.type] || typeConfig[NotificationType.INFO];
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
        notification.isRead
          ? 'hover:bg-neutral-50'
          : 'bg-blue-50/40 hover:bg-blue-50/70'
      }`}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${notification.isRead ? 'text-neutral-700' : 'text-gray-900'} truncate`}>
            {notification.title}
          </span>
          {notification.priority === 'URGENT' && (
            <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full shrink-0">
              Khẩn cấp
            </span>
          )}
          {notification.priority === 'HIGH' && (
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full shrink-0">
              Quan trọng
            </span>
          )}
        </div>
        {!compact && (
          <p className={`text-[11px] mt-0.5 line-clamp-2 ${notification.isRead ? 'text-neutral-500' : 'text-neutral-600'}`}>
            {notification.message}
          </p>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span className="text-[10px] text-neutral-400 font-medium">{timeAgo(notification.createdAt)}</span>
        </div>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2 ring-2 ring-blue-100 animate-pulse" />
      )}
    </button>
  );
};
