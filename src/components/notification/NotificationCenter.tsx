import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItemComponent } from './NotificationItem';
import { NotificationType } from '@/types';
import type { NotificationItem } from '@/types';
import { NotificationDetailModal } from './NotificationDetailModal';

const filterTabs = [
  { key: '', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: NotificationType.ORDER, label: 'Đơn hàng' },
  { key: NotificationType.SUBSCRIPTION, label: 'Gói dịch vụ' },
  { key: NotificationType.PAYMENT, label: 'Thanh toán' },
  { key: NotificationType.SYSTEM, label: 'Hệ thống' },
  { key: NotificationType.INFO, label: 'Thông tin' },
];

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
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
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleFilterChange = (key: string) => {
    if (key === 'unread') {
      setUnreadOnly(true);
      setFilter('');
    } else {
      setUnreadOnly(false);
      setFilter(key);
    }
  };

  const activeFilter = unreadOnly ? 'unread' : filter;

  const handleNotificationClick = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchNotifications(newPage);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Trung tâm thông báo</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {total} thông báo • {unreadCount} chưa đọc
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 border border-green-200/50 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === tab.key
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-[10px]">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white border border-neutral-200/60 rounded-2xl overflow-hidden">
        {loading && notifications.length === 0 ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-neutral-100 rounded w-1/3" />
                  <div className="h-2.5 bg-neutral-50 rounded w-2/3" />
                  <div className="h-2 bg-neutral-50 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 opacity-30" />
            </div>
            <span className="text-sm font-semibold text-neutral-500">Chưa có thông báo nào</span>
            <span className="text-xs text-neutral-400 mt-1">
              {activeFilter ? 'Thử bỏ bộ lọc để xem tất cả thông báo' : 'Thông báo mới sẽ xuất hiện ở đây'}
            </span>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {notifications.map(n => (
              <div key={n.id} className="px-2 py-0.5">
                <NotificationItemComponent
                  notification={n}
                  onRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <span className="text-xs font-semibold text-neutral-600">
            Trang {page} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
      )}

      {/* Reusable Notification Detail Modal */}
      <NotificationDetailModal
        isOpen={isModalOpen}
        notification={selectedNotification}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
