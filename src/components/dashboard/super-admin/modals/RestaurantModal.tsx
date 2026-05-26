import React, { useState, useEffect } from 'react';
import { Restaurant, RestaurantStatus } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export interface RestaurantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRest: Restaurant | null;
  onSave: (payload: any, editingRest: Restaurant | null) => Promise<void>;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  open,
  onOpenChange,
  editingRest,
  onSave
}) => {
  const [restForm, setRestForm] = useState({
    name: '',
    username: '',
    password: '',
    ownerName: '',
    email: '',
    address: '',
    phone: '',
    status: RestaurantStatus.ACTIVE
  });

  useEffect(() => {
    if (!open) return;
    if (editingRest) {
      setRestForm({
        name: editingRest.name,
        username: editingRest.username,
        password: '',
        ownerName: editingRest.ownerName,
        email: editingRest.email,
        address: editingRest.address,
        phone: editingRest.phone,
        status: editingRest.status
      });
    } else {
      setRestForm({
        name: '',
        username: '',
        password: '',
        ownerName: '',
        email: '',
        address: '',
        phone: '',
        status: RestaurantStatus.ACTIVE
      });
    }
  }, [open, editingRest]);

  const handleSave = async () => {
    if (
      !restForm.name.trim() ||
      !restForm.username.trim() ||
      (!editingRest && !restForm.password) ||
      !restForm.ownerName.trim() ||
      !restForm.email.trim() ||
      !restForm.address.trim() ||
      !restForm.phone.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ các thông tin bắt buộc');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(restForm.email.trim())) {
      toast.error('Định dạng email không hợp lệ');
      return;
    }

    await onSave(restForm, editingRest);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editingRest ? 'Sửa thông tin chi nhánh' : 'Đăng ký nhà hàng mới'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Tạo mới nhà hàng SaaS. Mật khẩu tạm và tài khoản admin sẽ được tự động gửi qua email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1">
            <Label htmlFor="resName" className="text-xs text-gray-600 font-semibold">Tên nhà hàng *</Label>
            <Input 
              id="resName" 
              value={restForm.name} 
              onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="resUser" className="text-xs text-gray-600 font-semibold">Username Admin *</Label>
              <Input 
                id="resUser" 
                disabled={!!editingRest} 
                value={restForm.username} 
                onChange={(e) => setRestForm({ ...restForm, username: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="resPw" className="text-xs text-gray-600 font-semibold">
                Mật khẩu khởi tạo {editingRest ? '(Không đổi)' : '*'}
              </Label>
              <Input 
                id="resPw" 
                type="password" 
                disabled={!!editingRest} 
                value={restForm.password} 
                onChange={(e) => setRestForm({ ...restForm, password: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="resOwner" className="text-xs text-gray-600 font-semibold">Tên chủ sở hữu *</Label>
            <Input 
              id="resOwner" 
              value={restForm.ownerName} 
              onChange={(e) => setRestForm({ ...restForm, ownerName: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="resEmail" className="text-xs text-gray-600 font-semibold">Email nhà hàng *</Label>
            <Input 
              id="resEmail" 
              type="email" 
              placeholder="owner@restaurant.com" 
              value={restForm.email} 
              onChange={(e) => setRestForm({ ...restForm, email: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="resPhone" className="text-xs text-gray-600 font-semibold">Số điện thoại *</Label>
              <Input 
                id="resPhone" 
                placeholder="09xxxxxxxx" 
                value={restForm.phone} 
                onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 font-semibold">Trạng thái hoạt động</Label>
              <Select 
                value={restForm.status} 
                onValueChange={(val) => setRestForm({ ...restForm, status: val as RestaurantStatus })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value={RestaurantStatus.ACTIVE}>Hoạt động (Active)</SelectItem>
                  <SelectItem value={RestaurantStatus.INACTIVE}>Tạm khóa (Inactive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="resAddr" className="text-xs text-gray-600 font-semibold">Địa chỉ nhà hàng *</Label>
            <Input 
              id="resAddr" 
              value={restForm.address} 
              onChange={(e) => setRestForm({ ...restForm, address: e.target.value })} 
              className="rounded-xl" 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10"
          >
            Lưu nhà hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
