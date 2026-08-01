import React, { useState } from 'react';
import { DiningProfile, Allergen, DiningPreference } from '@/types';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldAlert, ArrowLeft, ArrowRight, X, Heart, Award } from 'lucide-react';
import { toast } from 'sonner';
import { recordDiningVisit } from '@/services/diningVisitService';
import { getOrCreateDiningVisitToken } from '@/services/diningVisitToken';

interface DiningOnboardingProps {
  open: boolean;
  onClose: () => void;
  onComplete: (profile: DiningProfile) => void;
  restaurantId: string;
  tableSessionId?: string;
}

export const DiningOnboarding: React.FC<DiningOnboardingProps> = ({
  open,
  onClose,
  onComplete,
  restaurantId,
  tableSessionId
}) => {
  const [step, setStep] = useState(1);
  const [goals, setGoals] = useState<DiningProfile['goals']>([]);
  const [allergies, setAllergies] = useState<Allergen[]>([]);
  const [preferences, setPreferences] = useState<DiningPreference[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const goalsList = [
    { value: 'MUSCLE_GAIN', label: '💪 Ăn tăng cơ', desc: 'Protein dồi dào phục hồi cơ bắp' },
    { value: 'ENERGY_BOOST', label: '⚡ Ăn lấy năng lượng', desc: 'Carb phức hợp dẻo dai cả ngày' },
    { value: 'LIGHT_MEAL', label: '🥗 Ăn rau củ / Ít calo', desc: 'Lành mạnh, dồi dào chất xơ & vitamin' },
    { value: 'COMFORT', label: '🫶 Ăn thưởng thức', desc: 'Trải nghiệm hương vị đậm đà, ngon miệng' },
    { value: 'BALANCED', label: '⚖️ Ăn cân bằng', desc: 'Đầy đủ dinh dưỡng cân đối hoàn hảo' },
    { value: 'WEIGHT_LOSS', label: '🎯 Ăn giảm béo', desc: 'Thực đơn thâm hụt calo lành mạnh' }
  ] as const;

  const allergensList = [
    { value: Allergen.GLUTEN, label: '🌾 Lúa mì / Gluten', emoji: '🌾' },
    { value: Allergen.DAIRY, label: '🥛 Sữa & Phô mai', emoji: '🥛' },
    { value: Allergen.NUTS, label: '🥜 Các loại hạt', emoji: '🥜' },
    { value: Allergen.SHELLFISH, label: '🦐 Hải sản có vỏ', emoji: '🦐' },
    { value: Allergen.SOY, label: '🫘 Đậu nành', emoji: '🫘' },
    { value: Allergen.EGGS, label: '🥚 Trứng', emoji: '🥚' },
    { value: Allergen.FISH, label: '🐟 Cá', emoji: '🐟' }
  ];

  const preferencesList = [
    { value: 'VEGETARIAN' as DiningPreference, label: '🌿 Ăn chay (Vegetarian)', emoji: '🌿' },
    { value: 'VEGAN' as DiningPreference, label: '🌱 Thuần chay (Vegan)', emoji: '🌱' },
    { value: 'LOW_CARB' as DiningPreference, label: '🍚 Ít Tinh Bột (Low Carb)', emoji: '🍚' },
    { value: 'HIGH_PROTEIN' as DiningPreference, label: '💪 Giàu Đạm (High Protein)', emoji: '💪' },
    { value: 'KETO' as DiningPreference, label: '🥑 Thực đơn Keto', emoji: '🥑' },
    { value: 'SUGAR_FREE' as DiningPreference, label: '🍬 Ít đường / Sugar Free', emoji: '🍬' }
  ];

  const handleToggleGoal = (val: typeof goalsList[number]['value']) => {
    if (goals.includes(val)) {
      setGoals(goals.filter(g => g !== val));
    } else {
      setGoals([...goals, val]);
    }
  };

  const handleToggleAllergen = (val: Allergen) => {
    if (allergies.includes(val)) {
      setAllergies(allergies.filter(a => a !== val));
    } else {
      setAllergies([...allergies, val]);
    }
  };

  const handleTogglePreference = (val: DiningPreference) => {
    if (preferences.includes(val)) {
      setPreferences(preferences.filter(p => p !== val));
    } else {
      setPreferences([...preferences, val]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const profileData: DiningProfile = {
      goals,
      allergies,
      conditions: [],
      preferences
    };

    // Local storage is the only profile persistence boundary for anonymous diners.
    onComplete(profileData);

    // Analytics is scoped to this restaurant visit and must never block onboarding.
    if (tableSessionId) {
      try {
        await recordDiningVisit({
          restaurantId,
          tableSessionId,
          visitToken: getOrCreateDiningVisitToken(restaurantId, tableSessionId),
          goals,
          dietaryPreferences: preferences
        });
      } catch (error) {
        console.error('Failed to record anonymous dining visit', error);
      }
    }

    let personality = 'Exploring Foodie 🍽️';
    if (goals.includes('MUSCLE_GAIN')) personality = 'Protein Hunter 💪';
    else if (preferences.includes('VEGAN') || preferences.includes('VEGETARIAN')) personality = 'Green Plant Eater 🌱';
    else if (goals.includes('LIGHT_MEAL')) personality = 'Mindful Eater 🧘';
    else if (goals.includes('ENERGY_BOOST')) personality = 'Power Charger ⚡';

    toast.success(`Hồ sơ ẩm thực đã sẵn sàng! Bạn thuộc nhóm: ${personality}`, {
      duration: 4000,
      position: 'top-center'
    });

    onClose();
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Onboarding Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 flex flex-col my-auto transition-all duration-300">
        
        {/* Progress Bar & Header */}
        <div className="pt-6 px-6 pb-2 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-green-600 animate-pulse" />
              QDish Intelligence
            </span>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors p-1.5 rounded-full hover:bg-neutral-50"
              title="Bỏ qua"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden flex">
            <div className={`h-full bg-green-600 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          </div>
        </div>

        {/* Step Body */}
        <div className="px-6 py-4 flex-1 min-h-[300px]">
          
          {/* STEP 1: GOALS */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Hôm nay bạn muốn gì? 🍽️</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Chọn mục tiêu ăn uống của bạn. Chúng tôi gợi ý các món ăn phù hợp với cơ thể bạn lúc này.
                </p>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {goalsList.map((g) => {
                  const active = goals.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      onClick={() => handleToggleGoal(g.value)}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3 active:scale-[0.99] ${
                        active
                          ? 'border-green-600 bg-green-50/50 shadow-sm shadow-green-100'
                          : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{/* Goal emoji handled in label */}</div>
                      <div>
                        <span className={`text-sm font-bold block ${active ? 'text-green-800' : 'text-neutral-800'}`}>
                          {g.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5 block font-medium leading-tight">
                          {g.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: ALLERGIES */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                  Tránh chất gây dị ứng ⚠️
                </h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Chọn các thành phần bạn bị dị ứng. QDish sẽ <strong className="text-red-600 font-bold">khóa cảnh báo</strong> các món ăn chứa thành phần này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {allergensList.map((a) => {
                  const active = allergies.includes(a.value);
                  return (
                    <button
                      key={a.value}
                      onClick={() => handleToggleAllergen(a.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-[0.99] ${
                        active
                          ? 'border-red-500 bg-red-50/50 shadow-sm shadow-red-100'
                          : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-2xl leading-none">{a.emoji}</span>
                      <span className={`text-xs font-bold leading-tight ${active ? 'text-red-700' : 'text-neutral-700'}`}>
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 flex items-start gap-2 text-[10px] text-amber-800 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Không có chất dị ứng của bạn? Đừng lo, bạn có thể chỉnh sửa lại hồ sơ ẩm thực bất kỳ lúc nào từ thanh tìm kiếm.</span>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Phong cách ẩm thực của bạn? 🌿</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Chọn các chế độ ăn hoặc thói quen ăn uống nếu có. Giúp hệ thống cá nhân hóa công cụ gợi ý tốt hơn.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {preferencesList.map((p) => {
                  const active = preferences.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      onClick={() => handleTogglePreference(p.value)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 active:scale-[0.99] ${
                        active
                          ? 'border-green-600 bg-green-50/50 shadow-sm shadow-green-100'
                          : 'border-neutral-100 hover:border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-2xl leading-none">{p.emoji}</span>
                      <span className={`text-xs font-bold leading-tight ${active ? 'text-green-800' : 'text-neutral-700'}`}>
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-neutral-100 bg-neutral-50 shrink-0 flex items-center justify-between gap-3">
          {/* Back button */}
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              className="rounded-2xl border-neutral-200 text-neutral-600 font-bold h-11 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Quay lại
            </Button>
          ) : (
            <button
              onClick={onClose}
              className="text-xs font-extrabold text-neutral-400 hover:text-neutral-600 transition-colors py-2 px-3 rounded-lg"
            >
              Bỏ qua câu hỏi
            </button>
          )}

          {/* Next / Submit button */}
          <Button
            onClick={handleNext}
            disabled={isSaving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold h-11 text-xs shadow-md shadow-green-600/10"
          >
            {step < 3 ? (
              <>Tiếp theo <ArrowRight className="w-3.5 h-3.5 ml-1" /></>
            ) : (
              <>{isSaving ? 'Đang khởi tạo...' : 'Hoàn tất hồ sơ ✨'}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
