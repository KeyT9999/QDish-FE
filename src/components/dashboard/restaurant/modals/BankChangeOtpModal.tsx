import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';

export interface BankInfo {
  code: string;
  name: string;
}

export interface BankChangeOtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banksList: BankInfo[];
  onRequestOtp: (bankAccount: string, bankName: string) => Promise<void>;
  onSave: (bankAccount: string, bankName: string, otp: string) => Promise<void>;
}

export const BankChangeOtpModal: React.FC<BankChangeOtpModalProps> = ({
  open,
  onOpenChange,
  banksList,
  onRequestOtp,
  onSave
}) => {
  const { t } = useOwnerConsoleLocale();
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [bankOtp, setBankOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    if (!open) {
      setNewBankName('');
      setNewBankAccount('');
      setBankOtp('');
      setIsOtpSent(false);
      setIsSendingOtp(false);
    }
  }, [open]);

  const handleRequestOtp = async () => {
    if (!newBankAccount.trim() || !newBankName) {
      toast.error(t('Vui lòng điền Số tài khoản và chọn Ngân hàng'));
      return;
    }
    setIsSendingOtp(true);
    try {
      await onRequestOtp(newBankAccount.trim(), newBankName);
      setIsOtpSent(true);
      toast.success(t('Mã OTP đổi ngân hàng đã được gửi đến email hiện tại của nhà hàng.'));
    } catch (err: any) {
      toast.error(err.message || t('Lỗi gửi OTP đổi ngân hàng'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSave = async () => {
    if (!newBankAccount.trim() || !newBankName || !bankOtp.trim()) {
      toast.error(t('Vui lòng điền đầy đủ thông tin tài khoản bank và OTP'));
      return;
    }
    await onSave(newBankAccount.trim(), newBankName, bankOtp.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>{t('Cấu hình ngân hàng VietQR')}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">{t('Mã OTP đổi ngân hàng sẽ được gửi về email hiện tại của nhà hàng.')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600 font-semibold">{t('Ngân hàng thụ hưởng *')}</Label>
            <Select value={newBankName} onValueChange={(val) => setNewBankName(val || '')}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder={t('Chọn ngân hàng')} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {banksList.map(b => (
                  <SelectItem key={b.code} value={b.name}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="newBankAcc" className="text-xs text-gray-600 font-semibold">{t('Số tài khoản ngân hàng mới *')}</Label>
            <div className="flex gap-2">
              <Input id="newBankAcc" placeholder={t('Nhập số tài khoản')} value={newBankAccount} onChange={(e) => setNewBankAccount(e.target.value)} className="rounded-xl flex-1" />
              <Button onClick={handleRequestOtp} disabled={isSendingOtp} className="bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs px-3">
                {isSendingOtp ? t('Đang gửi...') : t('Gửi OTP')}
              </Button>
            </div>
          </div>

          {isOtpSent && (
            <div className="space-y-1">
              <Label htmlFor="bankOtp" className="text-xs text-gray-600 font-semibold">{t('Mã OTP (6 số) *')}</Label>
              <Input id="bankOtp" placeholder={t('Nhập OTP đổi ngân hàng')} value={bankOtp} onChange={(e) => setBankOtp(e.target.value)} className="rounded-xl" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">{t('Hủy')}</Button>
          <Button onClick={handleSave} disabled={!isOtpSent} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">{t('Xác nhận đổi ngân hàng')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
