import React, { useEffect, useState } from 'react';
import { Restaurant, RestaurantPaymentSettings, Role } from '@/types';
import { paymentSettingsService } from '@/services/paymentSettingsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface RestaurantPaymentSettingsPanelProps {
  restaurantId: string;
  restaurant: Restaurant | null;
  userRole?: Role;
  onUpdated?: () => Promise<void> | void;
}

const emptySettings: RestaurantPaymentSettings = {
  restaurantId: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
  bankQrImageUrl: ''
};

export const RestaurantPaymentSettingsPanel: React.FC<RestaurantPaymentSettingsPanelProps> = ({
  restaurantId,
  restaurant,
  userRole,
  onUpdated
}) => {
  const isOwner = userRole === Role.RESTAURANT_OWNER;
  const [settings, setSettings] = useState<RestaurantPaymentSettings>(emptySettings);
  const [form, setForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: ''
  });
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingQr, setIsDeletingQr] = useState(false);

  useEffect(() => {
    if (!restaurantId) return;
    setIsLoading(true);
    paymentSettingsService.getPaymentSettings(restaurantId)
      .then((data) => {
        setSettings(data);
        setForm({
          bankName: data.bankName || restaurant?.bankName || '',
          bankAccountNumber: data.bankAccountNumber || restaurant?.bankAccountNumber || restaurant?.bankAccount || '',
          bankAccountHolder: data.bankAccountHolder || restaurant?.bankAccountHolder || restaurant?.ownerName || ''
        });
      })
      .catch(() => {
        setForm({
          bankName: restaurant?.bankName || '',
          bankAccountNumber: restaurant?.bankAccountNumber || restaurant?.bankAccount || '',
          bankAccountHolder: restaurant?.bankAccountHolder || restaurant?.ownerName || ''
        });
      })
      .finally(() => setIsLoading(false));
  }, [restaurantId, restaurant?.bankName, restaurant?.bankAccountNumber, restaurant?.bankAccount, restaurant?.bankAccountHolder, restaurant?.ownerName]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleSave = async () => {
    if (!isOwner || !restaurantId) return;
    setIsSaving(true);
    try {
      const nextSettings = await paymentSettingsService.updatePaymentSettings(restaurantId, {
        bankName: form.bankName.trim(),
        bankAccountNumber: form.bankAccountNumber.trim(),
        bankAccountHolder: form.bankAccountHolder.trim()
      });
      setSettings(nextSettings);
      toast.success('Đã lưu thông tin thanh toán chuyển khoản');
      await onUpdated?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu thông tin thanh toán');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadQr = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !isOwner || !restaurantId) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ hỗ trợ ảnh QR định dạng jpg, png hoặc webp');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ảnh QR không được vượt quá 3MB');
      return;
    }

    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const nextSettings = await paymentSettingsService.uploadBankQr(restaurantId, file);
      setSettings(nextSettings);
      toast.success('Đã upload QR chuyển khoản');
      await onUpdated?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể upload QR chuyển khoản');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteQr = async () => {
    if (!isOwner || !restaurantId) return;
    setIsDeletingQr(true);
    try {
      const nextSettings = await paymentSettingsService.deleteBankQr(restaurantId);
      setSettings(nextSettings);
      setLocalPreview(null);
      toast.success('Đã xóa QR chuyển khoản');
      await onUpdated?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa QR chuyển khoản');
    } finally {
      setIsDeletingQr(false);
    }
  };

  const qrPreview = localPreview || settings.bankQrImageUrl;

  return (
    <Card className="shadow-sm border-neutral-200/50 rounded-2xl bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
          <Landmark className="w-4 h-4 text-neutral-500" />
          Thông tin thanh toán / QR chuyển khoản
        </CardTitle>
        <CardDescription className="text-xs">
          QR này dùng khi nhân viên/chủ quán chọn chuyển khoản trong modal thanh toán bill.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-xl bg-neutral-50 p-4 text-sm font-semibold text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải cấu hình thanh toán...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-600">Tên ngân hàng</Label>
                <Input
                  value={form.bankName}
                  onChange={(event) => setForm({ ...form, bankName: event.target.value })}
                  disabled={!isOwner}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-600">Số tài khoản</Label>
                <Input
                  value={form.bankAccountNumber}
                  onChange={(event) => setForm({ ...form, bankAccountNumber: event.target.value })}
                  disabled={!isOwner}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-600">Chủ tài khoản</Label>
                <Input
                  value={form.bankAccountHolder}
                  onChange={(event) => setForm({ ...form, bankAccountHolder: event.target.value })}
                  disabled={!isOwner}
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
              <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                {qrPreview ? (
                  <img src={qrPreview} alt="QR chuyển khoản" className="h-full w-full object-contain" />
                ) : (
                  <span className="px-4 text-center text-xs font-semibold text-neutral-400">Chưa có QR</span>
                )}
              </div>
              <div className="flex flex-col justify-center gap-3">
                {isOwner ? (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      {isSaving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                      Lưu thông tin
                    </Button>
                    <label className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50">
                      {isUploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                      Upload QR
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleUploadQr} disabled={isUploading} />
                    </label>
                    {settings.bankQrImageUrl && (
                      <Button type="button" variant="outline" onClick={handleDeleteQr} disabled={isDeletingQr} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                        {isDeletingQr ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <X className="mr-1.5 h-4 w-4" />}
                        Xóa QR
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                    Chỉ Chủ nhà hàng được sửa thông tin ngân hàng và QR chuyển khoản. Admin/Staff chỉ dùng QR này khi thanh toán bill.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
