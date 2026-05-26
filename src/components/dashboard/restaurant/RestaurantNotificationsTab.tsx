import React from 'react';
import { Role } from '@/types';
import { NotificationCenter } from '@/components/notification/NotificationCenter';
import { OwnerNotificationForm } from '@/components/notification/OwnerNotificationForm';

export interface RestaurantNotificationsTabProps {
  userRole?: Role;
}

export const RestaurantNotificationsTab: React.FC<RestaurantNotificationsTabProps> = ({
  userRole
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Trung tâm thông báo</h2>
        <p className="text-neutral-500 text-xs mt-0.5">Theo dõi tin tức hệ thống và các cập nhật mới nhất cho nhà hàng của bạn.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userRole === Role.RESTAURANT_OWNER ? (
          <>
            <div className="lg:col-span-1 animate-fade-in">
              <OwnerNotificationForm />
            </div>
            <div className="lg:col-span-2">
              <NotificationCenter />
            </div>
          </>
        ) : (
          <div className="lg:col-span-3">
            <NotificationCenter />
          </div>
        )}
      </div>
    </div>
  );
};
