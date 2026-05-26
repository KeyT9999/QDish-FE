import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronRight } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItemComponent } from './NotificationItem';
import type { NotificationItem } from '@/types';
import { NotificationDetailModal } from './NotificationDetailModal';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(1);
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    setIsOpen(false);
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleViewAll = () => {
    setIsOpen(false);
    // Navigate to notification tab in current dashboard
    const currentPath = window.location.pathname;
    navigate(`${currentPath}?tab=notifications`);
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-500 relative transition-colors duration-200 shadow-sm/5"
        aria-label="Thông báo"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 ring-2 ring-white animate-in fade-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-h-[520px] bg-white border border-neutral-200/80 rounded-2xl shadow-xl shadow-neutral-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900">Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[380px] p-1.5 space-y-0.5">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <span className="text-xs font-semibold">Chưa có thông báo nào</span>
              </div>
            ) : (
              recentNotifications.map(n => (
                <NotificationItemComponent
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                  onClick={handleNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-100 p-2">
            <button
              onClick={handleViewAll}
              className="w-full flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold text-green-600 hover:bg-green-50 transition-colors"
            >
              Xem tất cả thông báo
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
