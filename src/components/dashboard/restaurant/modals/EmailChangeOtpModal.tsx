import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface EmailChangeOtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestOtp: (email: string) => Promise<void>;
  onSave: (email: string, otp: string) => Promise<void>;
}

export const EmailChangeOtpModal: React.FC<EmailChangeOtpModalProps> = ({
  open,
  onOpenChange,
  onRequestOtp,
  onSave
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  useEffect(() => {
    if (!open) {
      setNewEmail('');
      setEmailOtp('');
      setIsOtpSent(false);
      setIsSendingOtp(false);
    }
  }, [open]);

  const handleRequestOtp = async () => {
    if (!newEmail.trim()) {
      toast.error('Vui lòng điền email mới');
      return;
    }
    setIsSendingOtp(true);
    try {
      await onRequestOtp(newEmail.trim());
      setIsOtpSent(true);
      toast.success('Mã OTP đổi email đã được gửi. Vui lòng kiểm tra email của bạn.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi gửi OTP đổi email');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSave = async () => {
    if (!newEmail.trim() || !emailOtp.trim()) {
      toast.error('Vui lòng điền đầy đủ email mới và OTP');
      return;
    }
    await onSave(newEmail.trim(), emailOtp.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>Thay đổi Email nhà hàng</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">Quy trình yêu cầu mã OTP gửi về email hiện tại của nhà hàng.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <Label htmlFor="newEmail" className="text-xs text-gray-600 font-semibold">Email mới *</Label>
            <div className="flex gap-2">
              <Input id="newEmail" type="email" placeholder="email@moi.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="rounded-xl flex-1" />
              <Button onClick={handleRequestOtp} disabled={isSendingOtp} className="bg-gray-900 hover:bg-black text-white rounded-xl font-semibold text-xs px-3">
                {isSendingOtp ? 'Đang gửi...' : 'Gửi OTP'}
              </Button>
            </div>
          </div>

          {isOtpSent && (
            <div className="space-y-1">
              <Label htmlFor="emailOtp" className="text-xs text-gray-600 font-semibold">Mã OTP (6 số) *</Label>
              <Input id="emailOtp" placeholder="Nhập OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="rounded-xl" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleSave} disabled={!isOtpSent} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Xác nhận đổi email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
