import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  CreditCard,
  Shield,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Bell as BellIcon,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import type { NotificationItem } from '@/types';
import { NotificationType, NotificationPriority } from '@/types';
import { formatNotificationSender } from '@/utils/notificationHelper';

interface NotificationDetailModalProps {
  isOpen: boolean;
  notification: NotificationItem | null;
  onClose: () => void;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  [NotificationType.ORDER]: { icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Đơn hàng' },
  [NotificationType.PAYMENT]: { icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Thanh toán' },
  [NotificationType.SUBSCRIPTION]: { icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50', label: 'Gói dịch vụ' },
  [NotificationType.INFO]: { icon: Info, color: 'text-sky-600', bg: 'bg-sky-50', label: 'Thông tin' },
  [NotificationType.SUCCESS]: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Thành công' },
  [NotificationType.WARNING]: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Cảnh báo' },
  [NotificationType.ERROR]: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Lỗi' },
  [NotificationType.SYSTEM]: { icon: BellIcon, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Hệ thống' },
};

function formatDetailTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  isOpen,
  notification,
  onClose
}) => {
  const navigate = useNavigate();

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // prevent scrolling background
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const config = typeConfig[notification.type] || typeConfig[NotificationType.INFO];
  const Icon = config.icon;
  const senderInfo = formatNotificationSender(notification);

  const handleNavigate = () => {
    if (notification.actionUrl) {
      onClose();
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop dark overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm transition-opacity duration-350 animate-in fade-in"
      />

      {/* Modal dialog box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 p-6 transform transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-bottom-4">
        
        {/* Close Button X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl border border-neutral-100 hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pr-6 pb-4 border-b border-neutral-100">
          <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              
              {/* Priority Badges */}
              {notification.priority === NotificationPriority.URGENT && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">
                  Khẩn cấp
                </span>
              )}
              {notification.priority === NotificationPriority.HIGH && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-750 px-2 py-0.5 rounded-full">
                  Quan trọng
                </span>
              )}
              {notification.priority === NotificationPriority.LOW && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                  Mức thấp
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1.5 leading-snug">
              {notification.title}
            </h3>
          </div>
        </div>

        {/* Modal Content Message */}
        <div className="py-5 space-y-4 max-h-[300px] overflow-y-auto pr-1">
          <div className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">
            {notification.message}
          </div>

          {/* Time & Sender Details */}
          <div className="text-[11px] text-neutral-400 space-y-1.5 pt-3 border-t border-neutral-50 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Thời gian: {formatDetailTime(notification.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100/50">
              <span className="text-sm shrink-0">{senderInfo.icon}</span>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-black text-neutral-450 tracking-wider">Nguồn gửi</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-bold text-neutral-800">{senderInfo.text}</span>
                  {senderInfo.roleBadge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-neutral-200/50 text-neutral-600 rounded-md shrink-0 uppercase tracking-wide">
                      {senderInfo.roleBadge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Metadata panel */}
          {notification.metadata && Object.keys(notification.metadata).length > 0 && (
            <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 text-[11px] font-mono space-y-1.5">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                Chi tiết dữ liệu (Metadata)
              </div>
              {Object.entries(notification.metadata).map(([key, val]) => (
                <div key={key} className="flex justify-between py-0.5 border-b border-neutral-100/60 last:border-b-0">
                  <span className="text-neutral-500 font-semibold">{key}:</span>
                  <span className="text-neutral-800 break-all text-right">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-xs font-bold text-neutral-700 transition-colors"
          >
            Đóng
          </button>
          
          {notification.actionUrl && (
            <button
              onClick={handleNavigate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-xs font-bold text-white shadow-sm transition-colors"
            >
              Đi tới ứng dụng
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
