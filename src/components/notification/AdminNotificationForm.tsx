import React, { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService } from '@/services/notificationService';
import {
  NotificationType,
  NotificationPriority,
  NotificationTargetType,
} from '@/types';
import type { AdminNotificationTargets } from '@/types';

const typeOptions = [
  { value: NotificationType.INFO, label: 'Thông tin' },
  { value: NotificationType.SUCCESS, label: 'Thành công' },
  { value: NotificationType.WARNING, label: 'Cảnh báo' },
  { value: NotificationType.SYSTEM, label: 'Hệ thống' },
  { value: NotificationType.ORDER, label: 'Đơn hàng' },
  { value: NotificationType.SUBSCRIPTION, label: 'Gói dịch vụ' },
  { value: NotificationType.PAYMENT, label: 'Thanh toán' },
];

const priorityOptions = [
  { value: NotificationPriority.LOW, label: 'Thấp' },
  { value: NotificationPriority.NORMAL, label: 'Bình thường' },
  { value: NotificationPriority.HIGH, label: 'Quan trọng' },
  { value: NotificationPriority.URGENT, label: 'Khẩn cấp' },
];

const targetOptions = [
  { value: NotificationTargetType.ALL_OWNERS, label: 'Tất cả chủ nhà hàng', needsSelector: false },
  { value: NotificationTargetType.OWNER, label: 'Một chủ nhà hàng cụ thể', needsSelector: 'owner' },
  { value: NotificationTargetType.ALL_RESTAURANTS, label: 'Tất cả nhà hàng', needsSelector: false },
  { value: NotificationTargetType.RESTAURANT, label: 'Một nhà hàng cụ thể', needsSelector: 'restaurant' },
  { value: NotificationTargetType.RESTAURANT_STAFF, label: 'Nhân viên của nhà hàng', needsSelector: 'restaurant' },
  { value: NotificationTargetType.OWNER_STAFF, label: 'Nhân viên của chủ nhà hàng', needsSelector: 'owner' },
];

export const AdminNotificationForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>(NotificationType.INFO);
  const [priority, setPriority] = useState<NotificationPriority>(NotificationPriority.NORMAL);
  const [targetType, setTargetType] = useState<NotificationTargetType>(NotificationTargetType.ALL_OWNERS);
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [targets, setTargets] = useState<AdminNotificationTargets | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    notificationService.getAdminTargets()
      .then(setTargets)
      .catch(err => console.error('Failed to load targets:', err));
  }, []);

  const currentTargetOption = targetOptions.find(t => t.value === targetType);
  const needsSelector = currentTargetOption?.needsSelector;

  const selectorItems = needsSelector === 'owner'
    ? (targets?.owners || []).map(o => ({ id: o.id, label: o.fullName || o.username || o.email || o.id }))
    : needsSelector === 'restaurant'
      ? (targets?.restaurants || []).map(r => ({ id: r.id, label: r.name || r.id }))
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    if (needsSelector && !selectedTargetId) {
      toast.error('Vui lòng chọn đích gửi cụ thể');
      return;
    }

    setSending(true);
    try {
      const payload: any = {
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        targetType,
      };

      if (needsSelector && selectedTargetId) {
        if (needsSelector === 'owner') {
          if (targetType === NotificationTargetType.OWNER) {
            payload.targetIds = [selectedTargetId];
          } else {
            payload.ownerId = selectedTargetId;
          }
        } else if (needsSelector === 'restaurant') {
          payload.targetIds = [selectedTargetId];
        }
      }

      const result = await notificationService.adminCreateNotification(payload);
      toast.success(`Đã gửi thông báo tới ${result.recipientCount} người nhận`);
      setTitle('');
      setMessage('');
      setSelectedTargetId('');
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200/60 rounded-2xl p-6 space-y-5 max-w-2xl">
      <div>
        <h3 className="text-base font-bold text-gray-900">Gửi thông báo hệ thống</h3>
        <p className="text-xs text-neutral-500 mt-0.5">Gửi thông báo đến chủ nhà hàng, nhà hàng hoặc nhân viên</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            placeholder="Nhập tiêu đề thông báo..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-colors"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">Nội dung</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Nhập nội dung thông báo..."
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-colors resize-none"
          />
        </div>

        {/* Type & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Loại thông báo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as NotificationType)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 bg-white"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">Mức ưu tiên</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as NotificationPriority)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 bg-white"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Target Type */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">Gửi tới</label>
          <select
            value={targetType}
            onChange={e => { setTargetType(e.target.value as NotificationTargetType); setSelectedTargetId(''); }}
            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 bg-white"
          >
            {targetOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Target Selector */}
        {needsSelector && selectorItems.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Chọn {needsSelector === 'owner' ? 'chủ nhà hàng' : 'nhà hàng'}
            </label>
            <select
              value={selectedTargetId}
              onChange={e => setSelectedTargetId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 bg-white"
            >
              <option value="">-- Chọn --</option>
              {selectorItems.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={sending || !title.trim() || !message.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sending ? 'Đang gửi...' : 'Gửi thông báo'}
        </button>
      </form>
    </div>
  );
};
