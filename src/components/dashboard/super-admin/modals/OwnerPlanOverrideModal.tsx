import React, { useState, useEffect } from 'react';
import { Owner } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export interface OwnerPlanOverrideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner: Owner | null;
  plans: any[];
  onOverride: (planId: string, status: string, expiresAt: string) => Promise<void>;
}

export const OwnerPlanOverrideModal: React.FC<OwnerPlanOverrideModalProps> = ({
  open,
  onOpenChange,
  owner,
  plans,
  onOverride
}) => {
  const [overrideForm, setOverrideForm] = useState({
    planId: '',
    status: 'ACTIVE',
    expiresAt: ''
  });

  useEffect(() => {
    if (!open || !owner) return;
    const currentPlan = plans.find(p => p.code === owner.planCode);
    const planId = currentPlan?.id || currentPlan?._id || '';
    setOverrideForm({
      planId: planId as string,
      status: owner.subscriptionStatus && owner.subscriptionStatus !== 'N/A' ? owner.subscriptionStatus : 'ACTIVE',
      expiresAt: owner.subscriptionExpiresAt ? new Date(owner.subscriptionExpiresAt).toISOString().split('T')[0] : ''
    });
  }, [open, owner, plans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner || !overrideForm.planId) {
      toast.error('Vui lòng chọn gói dịch vụ');
      return;
    }
    await onOverride(overrideForm.planId, overrideForm.status, overrideForm.expiresAt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">Đổi gói dịch vụ của Chủ nhà hàng</DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Thay đổi gói dịch vụ, trạng thái và ngày hết hạn thủ công cho <strong>{owner?.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-600 font-semibold">Chọn gói dịch vụ mới *</Label>
            <Select 
              value={overrideForm.planId} 
              onValueChange={(val) => setOverrideForm({ ...overrideForm, planId: val || '' })}
            >
              <SelectTrigger className="rounded-xl bg-white">
                <SelectValue placeholder="Chọn gói" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {plans.map(p => (
                  <SelectItem key={p.id || p._id} value={(p.id || p._id) as string}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 font-semibold">Trạng thái đăng ký *</Label>
              <Select 
                value={overrideForm.status} 
                onValueChange={(val) => setOverrideForm({ ...overrideForm, status: val || 'ACTIVE' })}
              >
                <SelectTrigger className="rounded-xl bg-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ACTIVE">Kích hoạt (ACTIVE)</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">Chờ thanh toán (PENDING)</SelectItem>
                  <SelectItem value="EXPIRED">Hết hạn (EXPIRED)</SelectItem>
                  <SelectItem value="CANCELLED">Hủy bỏ (CANCELLED)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="overrideDate" className="text-xs text-gray-600 font-semibold">Hạn sử dụng</Label>
              <Input 
                id="overrideDate" 
                type="date" 
                value={overrideForm.expiresAt} 
                onChange={(e) => setOverrideForm({ ...overrideForm, expiresAt: e.target.value })} 
                className="rounded-xl" 
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md">Đồng ý thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
