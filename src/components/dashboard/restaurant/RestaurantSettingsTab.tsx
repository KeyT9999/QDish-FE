import React from 'react';
import { Restaurant } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Landmark } from 'lucide-react';

export interface RestaurantSettingsTabProps {
  restaurant: Restaurant | null;
  generalSettingsForm: {
    name: string;
    ownerName: string;
    address: string;
    phone: string;
    bankName: string;
    bankAccount: string;
  };
  onSetGeneralSettingsForm: (form: RestaurantSettingsTabProps['generalSettingsForm']) => void;
  onSaveGeneralSettings: () => Promise<void>;
  onOpenEmailChangeModal: () => void;
  onOpenBankChangeModal: () => void;
}

export const RestaurantSettingsTab: React.FC<RestaurantSettingsTabProps> = ({
  restaurant,
  generalSettingsForm,
  onSetGeneralSettingsForm,
  onSaveGeneralSettings,
  onOpenEmailChangeModal,
  onOpenBankChangeModal
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Thiết lập cấu hình nhà hàng</h2>
        <p className="text-neutral-500 text-xs mt-0.5">Cấu hình thông tin địa chỉ hiển thị trên hóa đơn và thiết lập tài khoản ngân hàng thụ hưởng qua VietQR.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-neutral-900">Thông tin nhà hàng</CardTitle>
            <CardDescription className="text-xs">Các thông tin này được dùng trên hóa đơn và trang gọi món của khách.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="settingName" className="text-xs font-semibold text-neutral-600">Tên nhà hàng *</Label>
                <Input id="settingName" value={generalSettingsForm.name} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settingOwner" className="text-xs font-semibold text-neutral-600">Chủ sở hữu</Label>
                <Input id="settingOwner" value={generalSettingsForm.ownerName} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, ownerName: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingAddress" className="text-xs font-semibold text-neutral-600">Địa chỉ</Label>
              <Input id="settingAddress" value={generalSettingsForm.address} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, address: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingPhone" className="text-xs font-semibold text-neutral-600">Số điện thoại *</Label>
              <Input id="settingPhone" value={generalSettingsForm.phone} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, phone: e.target.value })} className="rounded-xl" />
            </div>
            <Button onClick={onSaveGeneralSettings} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm">
              Lưu cấu hình
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-neutral-500" />
                Tài khoản Email & Bảo mật
              </CardTitle>
              <CardDescription className="text-xs">Thay đổi email cần xác minh OTP gửi về email hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase">Email hiện tại</p>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.email || 'Chưa có email'}</p>
              </div>
              <Button variant="outline" onClick={onOpenEmailChangeModal} className="rounded-xl font-semibold">
                Yêu cầu đổi Email
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-neutral-500" />
                Ngân hàng nhận thanh toán (VietQR)
              </CardTitle>
              <CardDescription className="text-xs">Thông tin nhận tiền khi khách chọn chuyển khoản VietQR.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">Ngân hàng hiện tại</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankName || 'Chưa cấu hình'}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">Số tài khoản hiện tại</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankAccount || 'Chưa cấu hình'}</p>
                </div>
              </div>
              <Button variant="outline" onClick={onOpenBankChangeModal} className="rounded-xl font-semibold">
                Thay đổi Ngân hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
