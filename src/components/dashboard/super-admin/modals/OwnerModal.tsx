import React, { useState, useEffect } from 'react';
import { Owner } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export interface OwnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOwner: Owner | null;
  onSave: (payload: any, editingOwner: Owner | null) => Promise<void>;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  open,
  onOpenChange,
  editingOwner,
  onSave
}) => {
  const [ownerForm, setOwnerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    isActive: true
  });

  useEffect(() => {
    if (!open) return;
    if (editingOwner) {
      setOwnerForm({
        fullName: editingOwner.fullName,
        email: editingOwner.email,
        phone: editingOwner.phone,
        username: editingOwner.username,
        password: '',
        isActive: editingOwner.isActive
      });
    } else {
      setOwnerForm({
        fullName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        isActive: true
      });
    }
  }, [open, editingOwner]);

  const handleSave = async () => {
    if (
      !ownerForm.fullName.trim() ||
      !ownerForm.username.trim() ||
      (!editingOwner && !ownerForm.password) ||
      !ownerForm.email.trim() ||
      !ownerForm.phone.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ các thông tin bắt buộc');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerForm.email.trim())) {
      toast.error('Định dạng email không hợp lệ');
      return;
    }

    await onSave(ownerForm, editingOwner);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editingOwner ? 'Sửa thông tin chủ nhà hàng' : 'Thêm chủ nhà hàng mới'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Tạo tài khoản Chủ nhà hàng (Owner) để bắt đầu sử dụng dịch vụ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <Label htmlFor="ownerFullName" className="text-xs text-gray-600 font-semibold">Họ tên chủ nhà hàng *</Label>
            <Input 
              id="ownerFullName" 
              value={ownerForm.fullName} 
              onChange={(e) => setOwnerForm({ ...ownerForm, fullName: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ownerUser" className="text-xs text-gray-600 font-semibold">Username *</Label>
              <Input 
                id="ownerUser" 
                disabled={!!editingOwner} 
                value={ownerForm.username} 
                onChange={(e) => setOwnerForm({ ...ownerForm, username: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ownerPw" className="text-xs text-gray-600 font-semibold">
                Mật khẩu {editingOwner ? '(Không đổi)' : '*'}
              </Label>
              <Input 
                id="ownerPw" 
                type="password" 
                disabled={!!editingOwner} 
                value={ownerForm.password} 
                onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ownerEmail" className="text-xs text-gray-600 font-semibold">Email *</Label>
            <Input 
              id="ownerEmail" 
              type="email" 
              placeholder="owner@gmail.com" 
              value={ownerForm.email} 
              onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ownerPhone" className="text-xs text-gray-600 font-semibold">Số điện thoại *</Label>
              <Input 
                id="ownerPhone" 
                placeholder="09xxxxxxxx" 
                value={ownerForm.phone} 
                onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 font-semibold">Trạng thái hoạt động</Label>
              <Select 
                value={ownerForm.isActive ? "ACTIVE" : "INACTIVE"} 
                onValueChange={(val) => setOwnerForm({ ...ownerForm, isActive: val === "ACTIVE" })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ACTIVE">Hoạt động (Active)</SelectItem>
                  <SelectItem value="INACTIVE">Tạm khóa (Inactive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10"
          >
            Lưu chủ nhà hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
