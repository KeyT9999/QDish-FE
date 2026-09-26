import { PieChart } from 'lucide-react';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';

const attributeLabels: Record<string, { label: string; description: string; color: string; countColor: string }> = {
  LIGHT_MEAL: { label: 'Ăn nhẹ', description: 'Món ăn thanh đạm, ít calo', color: 'bg-teal-50 text-teal-700 border-teal-200/40', countColor: 'bg-teal-100/80 text-teal-800' },
  LOW_SUGAR: { label: 'Ít đường', description: 'Hàm lượng đường thấp, phù hợp ăn kiêng', color: 'bg-sky-50 text-sky-700 border-sky-200/40', countColor: 'bg-sky-100/80 text-sky-800' },
  LOW_CALORIE: { label: 'Ít Calo', description: 'Lượng calo thấp, tốt cho giảm cân', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/40', countColor: 'bg-emerald-100/80 text-emerald-800' },
  LOW_FAT: { label: 'Ít béo', description: 'Hàm lượng chất béo thấp', color: 'bg-blue-50 text-blue-700 border-blue-200/40', countColor: 'bg-blue-100/80 text-blue-800' },
  VEGETARIAN: { label: 'Món chay', description: 'Không chứa thịt, cá', color: 'bg-green-50 text-green-700 border-green-200/40', countColor: 'bg-green-100/80 text-green-800' },
  VEGAN: { label: 'Thuần chay', description: 'Hoàn toàn từ thực vật, không bơ sữa trứng', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/40', countColor: 'bg-emerald-100/80 text-emerald-800' },
  GLUTEN_FREE: { label: 'Không Gluten', description: 'Không chứa bột mì hoặc gluten', color: 'bg-amber-50 text-amber-700 border-amber-200/40', countColor: 'bg-amber-100/80 text-amber-800' },
  DAIRY_FREE: { label: 'Không bơ sữa', description: 'Không chứa sữa hoặc chế phẩm từ sữa', color: 'bg-pink-50 text-pink-700 border-pink-200/40', countColor: 'bg-pink-100/80 text-pink-800' },
  QUICK_BITE: { label: 'Ăn nhanh', description: 'Tiện lợi, ăn nhanh gọn', color: 'bg-purple-50 text-purple-700 border-purple-200/40', countColor: 'bg-purple-100/80 text-purple-800' },
  HIGH_PROTEIN: { label: 'Giàu đạm', description: 'Hàm lượng protein cao, tốt cho cơ bắp', color: 'bg-orange-50 text-orange-700 border-orange-200/40', countColor: 'bg-orange-100/80 text-orange-800' },
  VERY_HIGH_PROTEIN: { label: 'Cực giàu đạm', description: 'Hàm lượng protein rất cao', color: 'bg-red-50 text-red-700 border-red-200/40', countColor: 'bg-red-100/80 text-red-800' },
  POST_WORKOUT: { label: 'Sau tập luyện', description: 'Phục hồi thể lực và cơ bắp sau tập thể thao', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/40', countColor: 'bg-indigo-100/80 text-indigo-800' },
  OFFICE_LUNCH: { label: 'Trưa văn phòng', description: 'Bữa trưa đầy đủ dinh dưỡng, nhanh gọn cho dân công sở', color: 'bg-slate-50 text-slate-700 border-slate-200/40', countColor: 'bg-slate-200 text-slate-800' },
};

interface MenuAttributesPanelProps {
  attributeDistribution: MerchantInsightsPayload['attributeDistribution'];
}

export const MenuAttributesPanel = ({ attributeDistribution }: MenuAttributesPanelProps) => (
  <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PieChart className="h-4 w-4 text-green-600" />
        <h3 className="text-sm font-bold text-neutral-800">Bản đồ thuộc tính thực đơn</h3>
      </div>
      <p className="text-[11px] text-neutral-400">
        Số lượng món ăn đang được gắn nhãn theo các thuộc tính dinh dưỡng ngữ cảnh.
      </p>

      <div className="flex flex-wrap gap-2 pt-2">
        {Object.entries(attributeDistribution).map(([attribute, count]) => {
          const meta = attributeLabels[attribute] || {
            label: attribute,
            description: 'Thuộc tính dinh dưỡng của món ăn',
            color: 'bg-neutral-50 text-neutral-700 border-neutral-200/80',
            countColor: 'bg-neutral-200 text-neutral-800',
          };

          return (
            <span key={attribute} title={meta.description} className={`flex cursor-help items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold shadow-sm shadow-black/5 transition-all duration-150 hover:scale-[1.03] active:scale-95 motion-reduce:transition-none ${meta.color}`}>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${meta.countColor}`}>
                {count}
              </span>
              {meta.label}
            </span>
          );
        })}

        {Object.keys(attributeDistribution).length === 0 && (
          <div className="w-full py-6 text-center text-xs italic text-neutral-400">
            Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.
          </div>
        )}
      </div>
    </div>
  </div>
);
