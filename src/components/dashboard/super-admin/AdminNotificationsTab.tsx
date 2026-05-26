import React from 'react';
import { AdminNotificationForm } from '@/components/notification/AdminNotificationForm';
import { NotificationCenter } from '@/components/notification/NotificationCenter';

export const AdminNotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold text-gray-800">Thông báo hệ thống</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Tạo thông báo thủ công gửi đến chủ nhà hàng, chi nhánh hoặc nhân viên toàn hệ thống.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AdminNotificationForm />
        </div>
        <div className="lg:col-span-2">
          <NotificationCenter />
        </div>
      </div>
    </div>
  );
};
