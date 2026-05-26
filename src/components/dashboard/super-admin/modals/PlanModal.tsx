import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export interface PlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPlan: any | null;
  onSave: (payload: any, editingPlan: any | null) => Promise<void>;
}

const getDefaultPlanForm = () => ({
  name: '',
  code: '',
  description: '',
  priceMonthly: 0,
  priceYearly: 0,
  restaurantLimit: -1,
  tableLimit: -1,
  menuItemLimit: -1,
  staffLimit: -1,
  featuresText: '',
  unavailableFeaturesText: '',
  isPopular: false,
  isActive: true,
  sortOrder: 0
});

const parseFeatureList = (value: string) =>
  value
    .split(',')
    .map((feature) => feature.trim())
    .filter(Boolean);

export const PlanModal: React.FC<PlanModalProps> = ({
  open,
  onOpenChange,
  editingPlan,
  onSave
}) => {
  const [planForm, setPlanForm] = useState(getDefaultPlanForm());

  useEffect(() => {
    if (!open) return;
    if (editingPlan) {
      setPlanForm({
        name: editingPlan.name,
        code: editingPlan.code,
        description: editingPlan.description || '',
        priceMonthly: editingPlan.priceMonthly,
        priceYearly: editingPlan.priceYearly,
        restaurantLimit: editingPlan.restaurantLimit,
        tableLimit: editingPlan.tableLimit,
        menuItemLimit: editingPlan.menuItemLimit,
        staffLimit: editingPlan.staffLimit,
        featuresText: editingPlan.features ? editingPlan.features.join(', ') : '',
        unavailableFeaturesText: editingPlan.unavailableFeatures ? editingPlan.unavailableFeatures.join(', ') : '',
        isPopular: editingPlan.isPopular || false,
        isActive: editingPlan.isActive !== undefined ? editingPlan.isActive : true,
        sortOrder: editingPlan.sortOrder || 0
      });
    } else {
      setPlanForm(getDefaultPlanForm());
    }
  }, [open, editingPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim() || !planForm.code.trim()) {
      toast.error('Vui lòng nhập đầy đủ các thông tin bắt buộc');
      return;
    }

    const numericFields = [
      ['Giá theo tháng', planForm.priceMonthly, 0],
      ['Giá theo năm', planForm.priceYearly, 0],
      ['Hạn mức chi nhánh', planForm.restaurantLimit, -1],
      ['Hạn mức bàn ăn', planForm.tableLimit, -1],
      ['Hạn mức món ăn', planForm.menuItemLimit, -1],
      ['Hạn mức nhân viên', planForm.staffLimit, -1],
      ['Thứ tự sắp xếp', planForm.sortOrder, 0]
    ] as const;

    const invalidNumberField = numericFields.find(([, value, min]) => !Number.isFinite(value) || value < min);
    if (invalidNumberField) {
      toast.error(`${invalidNumberField[0]} không hợp lệ`);
      return;
    }

    const features = parseFeatureList(planForm.featuresText);
    const unavailableFeatures = parseFeatureList(planForm.unavailableFeaturesText);

    const payload = {
      name: planForm.name.trim(),
      code: planForm.code.trim().toUpperCase(),
      description: planForm.description.trim(),
      priceMonthly: planForm.priceMonthly,
      priceYearly: planForm.priceYearly,
      restaurantLimit: planForm.restaurantLimit,
      tableLimit: planForm.tableLimit,
      menuItemLimit: planForm.menuItemLimit,
      staffLimit: planForm.staffLimit,
      features,
      unavailableFeatures,
      isPopular: planForm.isPopular,
      isActive: planForm.isActive,
      sortOrder: planForm.sortOrder
    };

    await onSave(payload, editingPlan);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editingPlan ? 'Sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Thiết lập cấu hình giá, hạn mức tài nguyên và tính năng cho gói SaaS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="planName" className="text-xs text-gray-600 font-semibold">Tên gói *</Label>
              <Input 
                id="planName" 
                placeholder="Gói Gold" 
                value={planForm.name} 
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} 
                className="rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="planCode" className="text-xs text-gray-600 font-semibold">Mã gói *</Label>
              <Input 
                id="planCode" 
                placeholder="GOLD" 
                disabled={editingPlan?.code === 'FREE'} 
                value={planForm.code} 
                onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.replace(/\s+/g, '').toUpperCase() })} 
                className="rounded-xl" 
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="planDesc" className="text-xs text-gray-600 font-semibold">Mô tả gói</Label>
            <Input 
              id="planDesc" 
              placeholder="Gói tối ưu cho chuỗi nhà hàng lớn" 
              value={planForm.description} 
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="planPriceM" className="text-xs text-gray-600 font-semibold">Giá theo tháng (VNĐ) *</Label>
              <Input 
                id="planPriceM" 
                type="number" 
                min="0" 
                value={planForm.priceMonthly} 
                onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) || 0 })} 
                className="rounded-xl" 
                required 
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="planPriceY" className="text-xs text-gray-600 font-semibold">Giá theo năm (VNĐ) *</Label>
              <Input 
                id="planPriceY" 
                type="number" 
                min="0" 
                value={planForm.priceYearly} 
                onChange={(e) => setPlanForm({ ...planForm, priceYearly: Number(e.target.value) || 0 })} 
                className="rounded-xl" 
                required 
              />
            </div>
          </div>

          <div className="border-t border-slate-100 my-4 pt-3 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Giới hạn tài nguyên (-1 = Không giới hạn)</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="planResL" className="text-xs text-gray-600 font-semibold">Hạn mức chi nhánh</Label>
                <Input 
                  id="planResL" 
                  type="number" 
                  min="-1" 
                  value={planForm.restaurantLimit} 
                  onChange={(e) => setPlanForm({ ...planForm, restaurantLimit: Number(e.target.value) || 0 })} 
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planTableL" className="text-xs text-gray-600 font-semibold">Hạn mức bàn ăn</Label>
                <Input 
                  id="planTableL" 
                  type="number" 
                  min="-1" 
                  value={planForm.tableLimit} 
                  onChange={(e) => setPlanForm({ ...planForm, tableLimit: Number(e.target.value) || 0 })} 
                  className="rounded-xl" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="planMenuL" className="text-xs text-gray-600 font-semibold">Hạn mức món ăn</Label>
                <Input 
                  id="planMenuL" 
                  type="number" 
                  min="-1" 
                  value={planForm.menuItemLimit} 
                  onChange={(e) => setPlanForm({ ...planForm, menuItemLimit: Number(e.target.value) || 0 })} 
                  className="rounded-xl" 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planStaffL" className="text-xs text-gray-600 font-semibold">Hạn mức nhân viên</Label>
                <Input 
                  id="planStaffL" 
                  type="number" 
                  min="-1" 
                  value={planForm.staffLimit} 
                  onChange={(e) => setPlanForm({ ...planForm, staffLimit: Number(e.target.value) || 0 })} 
                  className="rounded-xl" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="planFeats" className="text-xs text-gray-600 font-semibold">Tính năng (phân tách bằng dấu phẩy) *</Label>
            <Input 
              id="planFeats" 
              placeholder="QR menu, Analytics nâng cao, Báo cáo Excel" 
              value={planForm.featuresText} 
              onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })} 
              className="rounded-xl" 
              required 
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="planUnavailableFeats" className="text-xs text-gray-600 font-semibold">Tính năng không bao gồm</Label>
            <Input 
              id="planUnavailableFeats" 
              placeholder="Hỗ trợ riêng, API nâng cao" 
              value={planForm.unavailableFeaturesText} 
              onChange={(e) => setPlanForm({ ...planForm, unavailableFeaturesText: e.target.value })} 
              className="rounded-xl" 
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="planSortOrder" className="text-xs text-gray-600 font-semibold">Thứ tự hiển thị</Label>
            <Input 
              id="planSortOrder" 
              type="number" 
              min="0" 
              value={planForm.sortOrder} 
              onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) || 0 })} 
              className="rounded-xl" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={planForm.isPopular} 
                onCheckedChange={(val) => setPlanForm({ ...planForm, isPopular: val })} 
                id="planPop" 
              />
              <Label htmlFor="planPop" className="text-xs text-gray-600 font-semibold">Phổ biến nhất</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                checked={planForm.isActive} 
                onCheckedChange={(val) => setPlanForm({ ...planForm, isActive: val })} 
                id="planAct" 
              />
              <Label htmlFor="planAct" className="text-xs text-gray-600 font-semibold">Kích hoạt bán gói</Label>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Hủy</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md">Lưu gói dịch vụ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
