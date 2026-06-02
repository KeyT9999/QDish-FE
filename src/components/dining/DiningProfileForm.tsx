import React, { useState } from 'react';
import { DiningProfile, Allergen, DiningPreference } from '@/types';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ShieldAlert, UtensilsCrossed, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DiningProfileFormProps {
  initialProfile: DiningProfile;
  onSave: (profile: DiningProfile) => void;
  onClose: () => void;
}

export const DiningProfileForm: React.FC<DiningProfileFormProps> = ({
  initialProfile,
  onSave,
  onClose
}) => {
  const [goals, setGoals] = useState<DiningProfile['goals']>(initialProfile.goals || []);
  const [allergies, setAllergies] = useState<Allergen[]>(initialProfile.allergies || []);
  const [preferences, setPreferences] = useState<DiningPreference[]>(initialProfile.preferences || []);

  const goalsList = [
    { value: 'MUSCLE_GAIN', label: '💪 Tăng cơ', emoji: '💪' },
    { value: 'ENERGY_BOOST', label: '⚡ Tăng năng lượng', emoji: '⚡' },
    { value: 'LIGHT_MEAL', label: '🥗 Ăn nhẹ', emoji: '🥗' },
    { value: 'COMFORT', label: '🫶 Comfort Food', emoji: '🫶' },
    { value: 'BALANCED', label: '⚖️ Cân bằng', emoji: '⚖️' },
    { value: 'WEIGHT_LOSS', label: '🎯 Giảm cân', emoji: '🎯' },
    { value: 'MAINTENANCE', label: '✅ Giữ cân', emoji: '✅' },
    { value: 'GENERAL_HEALTH', label: '🌿 Sức khỏe tổng quát', emoji: '🌿' },
  ] as const;

  const allergensList = [
    { value: Allergen.GLUTEN, label: '🌾 Gluten (Lúa mì)' },
    { value: Allergen.DAIRY, label: '🥛 Sữa & Phô mai' },
    { value: Allergen.NUTS, label: '🥜 Hạt & Đậu phộng' },
    { value: Allergen.SHELLFISH, label: '🦐 Hải sản có vỏ' },
    { value: Allergen.SOY, label: '🫘 Đậu nành' },
    { value: Allergen.EGGS, label: '🥚 Trứng' },
    { value: Allergen.FISH, label: '🐟 Cá' },
  ];

  const preferencesList: { value: DiningPreference; label: string }[] = [
    { value: 'VEGAN', label: '🌱 Vegan (Thuần chay)' },
    { value: 'VEGETARIAN', label: '🌿 Vegetarian (Ăn chay)' },
    { value: 'LOW_CARB', label: '🍚 Low Carb' },
    { value: 'HIGH_PROTEIN', label: '💪 High Protein' },
    { value: 'KETO', label: '🥑 Keto' },
    { value: 'GLUTEN_FREE', label: '🌾 Gluten Free' },
    { value: 'LOW_FAT', label: '💧 Low Fat' },
    { value: 'SUGAR_FREE', label: '🍬 Sugar Free' },
  ];

  const handleToggleGoal = (value: typeof goalsList[number]['value']) => {
    if (goals.includes(value)) {
      setGoals(goals.filter(g => g !== value));
    } else {
      setGoals([...goals, value]);
    }
  };

  const handleToggleAllergen = (value: Allergen) => {
    if (allergies.includes(value)) {
      setAllergies(allergies.filter(a => a !== value));
    } else {
      setAllergies([...allergies, value]);
    }
  };

  const handleTogglePreference = (value: DiningPreference) => {
    if (preferences.includes(value)) {
      setPreferences(preferences.filter(p => p !== value));
    } else {
      setPreferences([...preferences, value]);
    }
  };

  const handleSave = () => {
    const updatedProfile: DiningProfile = {
      goals,
      allergies,
      conditions: [],
      preferences
    };
    onSave(updatedProfile);
    toast.success('Đã cập nhật hồ sơ ẩm thực của bạn!', {
      duration: 3000,
      position: 'top-center'
    });
    onClose();
  };

  const handleReset = () => {
    setGoals([]);
    setAllergies([]);
    setPreferences([]);
  };

  return (
    <div className="flex flex-col h-full bg-surface">
      <SheetHeader className="px-5 pt-2 pb-3 border-b border-gray-100">
        <SheetTitle className="text-xl font-heading font-bold text-gray-900 flex items-center">
          <Sparkles className="w-5 h-5 text-amber-500 mr-2" />
          Hồ sơ ẩm thực
        </SheetTitle>
        <SheetDescription className="text-gray-500 text-xs">
          Giúp QDish hiểu bạn hơn để gợi ý món ăn phù hợp nhất. Không có món nào tốt hay xấu — chỉ có món phù hợp với bạn.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4 pb-28">
        <div className="space-y-6">
          
          {/* Section 1: Goals — non-judgmental */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              1. Hôm nay bạn muốn gì?
            </h3>
            <div className="flex flex-wrap gap-2">
              {goalsList.map((g) => {
                const active = goals.includes(g.value);
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleToggleGoal(g.value)}
                    className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all active:scale-95 duration-200 ${
                      active
                        ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-600/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Allergies */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              2. Dị ứng & Tránh ăn
            </h3>
            <p className="text-xs text-red-500 font-medium">
              * Hệ thống sẽ tự động khóa món có chứa thành phần dị ứng để bảo vệ bạn.
            </p>
            <div className="flex flex-wrap gap-2">
              {allergensList.map((a) => {
                const active = allergies.includes(a.value);
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => handleToggleAllergen(a.value)}
                    className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all active:scale-95 duration-200 ${
                      active
                        ? 'border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Preferences — non-judgmental */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              3. Phong cách ẩm thực
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferencesList.map((p) => {
                const active = preferences.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleTogglePreference(p.value)}
                    className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all active:scale-95 duration-200 ${
                      active
                        ? 'border-green-600 bg-green-600 text-white shadow-sm shadow-green-600/20'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </ScrollArea>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-100 flex gap-3 z-10">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="rounded-xl px-4"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Đặt lại
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/20"
        >
          <Save className="w-4 h-4 mr-2" />
          Lưu hồ sơ
        </Button>
      </div>
    </div>
  );
};
