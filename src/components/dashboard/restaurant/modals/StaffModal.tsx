import React, { useState, useEffect } from 'react';
import { Staff } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStaff: Staff | null;
  onSave: (data: { username: string; password: string; name: string }, editingStaff: Staff | null) => Promise<void>;
}

export const StaffModal: React.FC<StaffModalProps> = ({
  open,
  onOpenChange,
  editingStaff,
  onSave
}) => {
  const [staffForm, setStaffForm] = useState({
    username: '',
    password: '',
    name: '',
    isActive: true
  });

  useEffect(() => {
    if (!open) return;
    if (editingStaff) {
      setStaffForm({
        username: editingStaff.username,
        password: '',
        name: editingStaff.name,
        isActive: editingStaff.isActive
      });
    } else {
      setStaffForm({
        username: '',
        password: '',
        name: '',
        isActive: true
      });
    }
  }, [open, editingStaff]);

  const handleSave = async () => {
    if (!staffForm.username.trim() || !staffForm.name.trim() || (!editingStaff && !staffForm.password)) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }
    await onSave({
      username: staffForm.username.trim(),
      name: staffForm.name.trim(),
      password: staffForm.password
    }, editingStaff);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>{editingStaff ? 'Sửa tài khoản nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">Tạo tài khoản đăng nhập cho nhân viên bếp hoặc chạy bàn.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <Label htmlFor="staffName" className="text-xs text-gray-600 font-semibold">Tên hiển thị *</Label>
            <Input id="staffName" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="staffUsername" className="text-xs text-gray-600 font-semibold">Username đăng nhập *</Label>
            <Input id="staffUsername" value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="staffPw" className="text-xs text-gray-600 font-semibold">Mật khẩu {editingStaff ? '(Để trống nếu không đổi)' : '*'}</Label>
            <Input id="staffPw" type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="rounded-xl" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Lưu tài khoản</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
