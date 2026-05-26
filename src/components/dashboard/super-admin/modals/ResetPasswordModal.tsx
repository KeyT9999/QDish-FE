import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetName: string;
  onReset: (newPassword: string) => Promise<void>;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onOpenChange,
  targetName,
  onReset
}) => {
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (open) {
      setPassword('');
    }
  }, [open]);

  const handleReset = async () => {
    if (!password.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (password.trim().length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    await onReset(password.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">Đặt lại mật khẩu</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Khôi phục mật khẩu cho {targetName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-1">
            <Label htmlFor="resetNewPw" className="text-xs text-gray-600 font-semibold">Mật khẩu mới *</Label>
            <Input 
              id="resetNewPw" 
              type="password" 
              placeholder="Tối thiểu 6 ký tự" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="rounded-xl" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button 
            onClick={handleReset} 
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
          >
            Đặt lại mật khẩu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
