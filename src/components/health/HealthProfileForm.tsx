import React, { useState } from 'react';
import { HealthProfile, Allergen, HealthLabel } from '@/types';
import { Button } from '@/components/ui/button';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, ShieldAlert, Award, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface HealthProfileFormProps {
  initialProfile: HealthProfile;
  onSave: (profile: HealthProfile) => void;
  onClose: () => void;
}

export const HealthProfileForm: React.FC<HealthProfileFormProps> = ({
  initialProfile,
  onSave,
  onClose
}) => {
  const [goals, setGoals] = useState<HealthProfile['goals']>(initialProfile.goals || []);
  const [allergies, setAllergies] = useState<Allergen[]>(initialProfile.allergies || []);
  const [preferences, setPreferences] = useState<HealthLabel[]>(initialProfile.preferences || []);

  const goalsList = [
    { value: 'WEIGHT_LOSS', label: 'Giảm cân (Weight Loss)' },
    { value: 'MUSCLE_GAIN', label: 'Tăng cơ (Muscle Gain)' },
    { value: 'MAINTENANCE', label: 'Giữ cân (Maintenance)' },
    { value: 'GENERAL_HEALTH', label: 'Ăn uống lành mạnh (General Health)' }
  ] as const;

  const allergensList = [
    { value: Allergen.GLUTEN, label: 'Gluten (Lúa mì, bột mì)' },
    { value: Allergen.DAIRY, label: 'Dairy (Sữa, phô mai)' },
    { value: Allergen.NUTS, label: 'Nuts (Hạt dẻ, đậu phộng)' },
    { value: Allergen.SHELLFISH, label: 'Shellfish (Tôm, cua, sò)' },
    { value: Allergen.SOY, label: 'Soy (Đậu nành)' },
    { value: Allergen.EGGS, label: 'Eggs (Trứng)' },
    { value: Allergen.FISH, label: 'Fish (Cá)' }
  ];

  const preferencesList = [
    { value: HealthLabel.VEGAN, label: 'Vegan (Thuần chay)' },
    { value: HealthLabel.VEGETARIAN, label: 'Vegetarian (Ăn chay)' },
    { value: HealthLabel.LOW_CARB, label: 'Low Carb (Ít tinh bột)' },
    { value: HealthLabel.HIGH_PROTEIN, label: 'High Protein (Giàu đạm)' },
    { value: HealthLabel.KETO, label: 'Keto Diet' },
    { value: HealthLabel.GLUTEN_FREE, label: 'Gluten Free' },
    { value: HealthLabel.LOW_FAT, label: 'Low Fat (Ít chất béo)' },
    { value: HealthLabel.SUGAR_FREE, label: 'Sugar Free (Không đường)' }
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

  const handleTogglePreference = (value: HealthLabel) => {
    if (preferences.includes(value)) {
      setPreferences(preferences.filter(p => p !== value));
    } else {
      setPreferences([...preferences, value]);
    }
  };

  const handleSave = () => {
    const updatedProfile: HealthProfile = {
      goals,
      allergies,
      conditions: [], // Placeholder
      preferences
    };
    onSave(updatedProfile);
    toast.success('Đã cập nhật hồ sơ sức khỏe của bạn!', {
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
          <Heart className="w-5 h-5 text-green-500 mr-2 fill-green-500" />
          Hồ sơ sức khỏe
        </SheetTitle>
        <SheetDescription className="text-gray-500 text-xs">
          Khai báo thể trạng giúp chúng tôi tự động lọc chất gây dị ứng và đề xuất món ăn phù hợp với bạn.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea className="flex-1 px-5 py-4 pb-28">
        <div className="space-y-6">
          
          {/* Section 1: Goals */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-500" />
              1. Mục tiêu của bạn
            </h3>
            <div className="flex flex-wrap gap-2">
              {goalsList.map((g) => {
                const active = goals.includes(g.value);
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleToggleGoal(g.value)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition-transform active:scale-95 duration-200 ${
                      active
                        ? 'border-green-600 bg-green-600 text-white shadow-sm'
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
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition-transform active:scale-95 duration-200 ${
                      active
                        ? 'border-red-500 bg-red-500 text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Preferences */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Heart className="w-4 h-4 text-green-500" />
              3. Chế độ ăn kiêng
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferencesList.map((p) => {
                const active = preferences.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleTogglePreference(p.value)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition-transform active:scale-95 duration-200 ${
                      active
                        ? 'border-green-600 bg-green-600 text-white shadow-sm'
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
