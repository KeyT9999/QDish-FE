import React from 'react';
import { Restaurant, Role } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Languages, ShieldAlert, Landmark } from 'lucide-react';
import { RestaurantPaymentSettingsPanel } from './RestaurantPaymentSettingsPanel';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';
import type { OwnerConsoleTranslationKey } from '@/i18n/ownerConsoleCatalog';
import type { OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';

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
  restaurantId: string;
  userRole?: Role;
}

export const RestaurantSettingsTab: React.FC<RestaurantSettingsTabProps> = ({
  restaurant,
  generalSettingsForm,
  onSetGeneralSettingsForm,
  onSaveGeneralSettings,
  onOpenEmailChangeModal,
  restaurantId,
  userRole
}) => {
  const { language, isSaving, setLanguage, t } = useOwnerConsoleLocale();
  const [languageSaveStatus, setLanguageSaveStatus] = React.useState<'saved' | 'error' | null>(null);

  const languageOptions: Array<{ value: OwnerConsoleLanguage; label: OwnerConsoleTranslationKey }> = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'zh-CN', label: '简体中文' }
  ];

  const handleLanguageChange = async (nextLanguage: OwnerConsoleLanguage) => {
    if (isSaving || nextLanguage === language) return;
    setLanguageSaveStatus(null);
    const saved = await setLanguage(nextLanguage);
    setLanguageSaveStatus(saved ? 'saved' : 'error');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">{t('Thiết lập cấu hình nhà hàng')}</h2>
        <p className="text-neutral-500 text-xs mt-0.5">{t('Cấu hình thông tin địa chỉ hiển thị trên hóa đơn và thiết lập tài khoản ngân hàng thụ hưởng qua VietQR.')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-neutral-900">{t('Thông tin nhà hàng')}</CardTitle>
            <CardDescription className="text-xs">{t('Các thông tin này được dùng trên hóa đơn và trang gọi món của khách.')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="settingName" className="text-xs font-semibold text-neutral-600">{t('Tên nhà hàng *')}</Label>
                <Input id="settingName" value={generalSettingsForm.name} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="settingOwner" className="text-xs font-semibold text-neutral-600">{t('Chủ sở hữu')}</Label>
                <Input id="settingOwner" value={generalSettingsForm.ownerName} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, ownerName: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingAddress" className="text-xs font-semibold text-neutral-600">{t('Địa chỉ')}</Label>
              <Input id="settingAddress" value={generalSettingsForm.address} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, address: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingPhone" className="text-xs font-semibold text-neutral-600">{t('Số điện thoại *')}</Label>
              <Input id="settingPhone" value={generalSettingsForm.phone} onChange={(e) => onSetGeneralSettingsForm({ ...generalSettingsForm, phone: e.target.value })} className="rounded-xl" />
            </div>
            <Button onClick={onSaveGeneralSettings} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm">
              {t('Lưu cấu hình')}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {userRole === Role.RESTAURANT_OWNER && (
            <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  {t('Ngôn ngữ giao diện')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('Chọn ngôn ngữ dùng trong trang quản trị. Thay đổi này chỉ áp dụng cho tài khoản của bạn.')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <fieldset disabled={isSaving}>
                  <legend className="sr-only">{t('Ngôn ngữ giao diện')}</legend>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {languageOptions.map((option) => {
                      const isSelected = language === option.value;
                      const inputId = `owner-console-language-${option.value}`;
                      return (
                        <label
                          key={option.value}
                          htmlFor={inputId}
                          className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors duration-200 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                          } ${isSaving ? 'cursor-wait opacity-70' : ''}`}
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name="owner-console-language"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => void handleLanguageChange(option.value)}
                            className="sr-only"
                          />
                          <span className="min-w-0 flex-1">{t(option.label)}</span>
                          {isSelected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <p className="min-h-5 text-xs text-neutral-500" role="status" aria-live="polite">
                  {isSaving
                    ? t('Đang lưu...')
                    : languageSaveStatus === 'saved'
                      ? t('Đã lưu ngôn ngữ giao diện.')
                      : languageSaveStatus === 'error'
                        ? t('Không thể lưu thay đổi. Đã khôi phục lựa chọn trước đó.')
                        : ''}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-neutral-500" />
                {t('Tài khoản Email & Bảo mật')}
              </CardTitle>
              <CardDescription className="text-xs">{t('Thay đổi email cần xác minh OTP gửi về email hiện tại.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-[11px] font-bold text-neutral-400 uppercase">{t('Email hiện tại')}</p>
                <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.email || t('Chưa có email')}</p>
              </div>
              <Button variant="outline" onClick={onOpenEmailChangeModal} className="rounded-xl font-semibold">
                {t('Yêu cầu đổi Email')}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-neutral-500" />
                {t('Ngân hàng nhận thanh toán (VietQR)')}
              </CardTitle>
              <CardDescription className="text-xs">{t('Thông tin nhận tiền khi khách chọn chuyển khoản VietQR.')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{t('Ngân hàng hiện tại')}</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankName || t('Chưa cấu hình')}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase">{t('Số tài khoản hiện tại')}</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-1">{restaurant?.bankAccount || t('Chưa cấu hình')}</p>
                </div>
              </div>
              {userRole === Role.RESTAURANT_OWNER ? (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  {t('Chủ nhà hàng chỉnh thông tin ngân hàng và QR chuyển khoản ở mục bên dưới.')}
                </p>
              ) : (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                  {t('Chỉ Chủ nhà hàng được thay đổi thông tin ngân hàng và QR chuyển khoản.')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <RestaurantPaymentSettingsPanel
        restaurantId={restaurantId}
        restaurant={restaurant}
        userRole={userRole}
      />
    </div>
  );
};
