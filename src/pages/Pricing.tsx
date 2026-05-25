import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role, Plan, BillingCycle } from '@/types';
import { planService } from '@/services/planService';
import { PENDING_PAYMENT_ORDER_KEY, subscriptionService } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Building, 
  Users, 
  QrCode, 
  DollarSign, 
  ArrowLeft,
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export const Pricing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const fetchedPlans = await planService.getPlans();
        setPlans(fetchedPlans);

        if (user && user.role === Role.RESTAURANT_OWNER) {
          const subDetails = await subscriptionService.getOwnerSubscription();
          setCurrentSub(subDetails.subscription);
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Không thể tải thông tin gói dịch vụ');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleCheckout = async (plan: Plan) => {
    if (!user) {
      toast.info('Vui lòng đăng nhập hoặc đăng ký tài khoản Chủ nhà hàng để mua gói.');
      navigate('/login?redirect=pricing');
      return;
    }

    if (user.role !== Role.RESTAURANT_OWNER) {
      toast.error('Chỉ tài khoản Chủ nhà hàng (Owner) mới có thể thực hiện thanh toán mua gói.');
      return;
    }

    // Check if they are checkout their current active plan
    if (currentSub && currentSub.planId === (plan.id || plan._id) && currentSub.status === 'ACTIVE') {
      toast.info('Bạn đã đang sử dụng gói dịch vụ này.');
      return;
    }

    setIsProcessing(plan.id || plan._id || 'free');
    try {
      const response = await subscriptionService.checkoutSubscription(
        (plan.id || plan._id) as string, 
        billingCycle
      );

      if (response.isFree) {
        toast.success('Đã kích hoạt gói dịch vụ Starter miễn phí thành công!');
        window.location.reload();
      } else if (response.checkoutUrl) {
        if (response.orderCode) {
          localStorage.setItem(PENDING_PAYMENT_ORDER_KEY, String(response.orderCode));
        }
        toast.loading('Đang chuyển hướng sang cổng thanh toán PayOS...');
        // Redirect to PayOS checkout page
        window.location.assign(response.checkoutUrl);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gặp lỗi trong quá trình khởi tạo giao dịch.');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <span className="text-sm font-semibold text-neutral-500">Đang tải bảng giá dịch vụ...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[150px] -z-10" />

      {/* Header and Back navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(user?.role === Role.RESTAURANT_OWNER ? '/owner' : '/login')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span className="text-xs font-semibold text-slate-400">PayOS Secure Checkout</span>
        </div>
      </header>

      {/* Main pricing content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 md:pt-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-900/60 backdrop-blur-sm mb-4 inline-block">
            Bảng Giá Dịch Vụ SaaS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight font-heading">
            Chọn Gói Phù Hợp Để <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">Bứt Phá Doanh Thu</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Hệ thống menu QR thông minh, order realtime đỉnh cao cho mọi quy mô từ quán trà sữa nhỏ đến chuỗi nhà hàng sang trọng.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3 mt-10">
            <button 
              onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                billingCycle === BillingCycle.MONTHLY 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              Thanh toán hàng tháng
            </button>
            <button 
              onClick={() => setBillingCycle(BillingCycle.YEARLY)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                billingCycle === BillingCycle.YEARLY 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                  : 'bg-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              Thanh toán 12 tháng
              <span className="absolute -top-3.5 -right-3 bg-gradient-to-r from-red-500 to-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-md scale-90 tracking-wider">
                Tiết kiệm
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isFree = plan.priceMonthly === 0;
            const price = billingCycle === BillingCycle.YEARLY ? plan.priceYearly : plan.priceMonthly;
            const cycleText = billingCycle === BillingCycle.YEARLY ? 'năm' : 'tháng';
            const isPopular = plan.isPopular;
            
            const isCurrentActive = currentSub && 
                                   currentSub.planId === (plan.id || plan._id) && 
                                   currentSub.status === 'ACTIVE';

            return (
              <div 
                key={plan.id || plan._id}
                className={`relative rounded-3xl p-6 md:p-8 flex flex-col transition-all duration-300 border backdrop-blur-md group ${
                  isPopular 
                    ? 'bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-emerald-500/60 shadow-[0_10px_30px_rgba(16,185,129,0.08)] scale-105 z-10' 
                    : 'bg-slate-850/60 border-slate-700/50 hover:border-slate-600 shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Popularity Badge */}
                {isPopular && (
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-900 font-extrabold text-[10px] uppercase px-4 py-1 rounded-full shadow-lg flex items-center gap-1 leading-none tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Phổ biến nhất
                  </div>
                )}

                {/* Gói hiện tại Badge */}
                {isCurrentActive && (
                  <div className="absolute top-4 right-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-[9px] uppercase px-2.5 py-1 rounded-lg">
                    Gói hiện tại
                  </div>
                )}

                {/* Plan Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed min-h-[40px]">{plan.description}</p>
                </div>

                {/* Price Display */}
                <div className="mb-8">
                  {isFree ? (
                    <div className="flex items-baseline text-white">
                      <span className="text-4xl md:text-5xl font-black tracking-tight">Miễn phí</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline text-white">
                        <span className="text-4xl md:text-5xl font-black tracking-tight">
                          {formatPrice(price).replace('₫', '')}
                        </span>
                        <span className="text-emerald-500 font-black text-xl ml-1">₫</span>
                        <span className="text-slate-400 text-xs font-semibold ml-2">/ {cycleText}</span>
                      </div>
                      
                      {billingCycle === BillingCycle.YEARLY && (
                        <div className="text-[10px] text-amber-400 font-bold mt-1">
                          Được giảm giá đặc biệt khi chọn chu kỳ 12 tháng!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Core limits details */}
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-8 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                      <Building className="w-3.5 h-3.5 text-emerald-500" /> Chi nhánh:
                    </span>
                    <span className="font-bold text-white">
                      {plan.restaurantLimit === -1 ? 'Không giới hạn' : `${plan.restaurantLimit} chi nhánh`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                      <QrCode className="w-3.5 h-3.5 text-emerald-500" /> Bàn ăn / QR:
                    </span>
                    <span className="font-bold text-white">
                      {plan.tableLimit === -1 ? 'Không giới hạn' : `Tối đa ${plan.tableLimit} bàn`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Món ăn thực đơn:
                    </span>
                    <span className="font-bold text-white">
                      {plan.menuItemLimit === -1 ? 'Không giới hạn' : `Tối đa ${plan.menuItemLimit} món`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                      <Users className="w-3.5 h-3.5 text-emerald-500" /> Nhân viên:
                    </span>
                    <span className="font-bold text-white">
                      {plan.staffLimit === -1 ? 'Không giới hạn' : `Tối đa ${plan.staffLimit} nhân viên`}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="flex-1 mb-8 space-y-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tính năng bao gồm:</span>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Button CTA */}
                <Button 
                  onClick={() => handleCheckout(plan)}
                  disabled={isProcessing !== null || isCurrentActive}
                  className={`w-full py-6 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    isCurrentActive 
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                      : isPopular 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-900 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-750 hover:bg-slate-700 text-white hover:text-white border border-slate-650'
                  }`}
                >
                  {isProcessing === (plan.id || plan._id || 'free') ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang khởi tạo...
                    </span>
                  ) : isCurrentActive ? (
                    'Gói bạn đang sử dụng'
                  ) : isFree ? (
                    'Bắt đầu Miễn phí'
                  ) : (
                    <span className="flex items-center gap-1.5 justify-center">
                      Kích hoạt ngay <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* PayOS Guarantee & Security Callout */}
        <div className="mt-16 text-center max-w-xl mx-auto p-4 rounded-2xl bg-slate-850/30 border border-slate-800/80 flex items-center gap-3 justify-center text-slate-400 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <span>QDish sử dụng cổng thanh toán chính thức <strong>PayOS</strong>. Giao dịch an toàn, kích hoạt ngay lập tức qua mã QR ngân hàng hoặc chuyển khoản 24/7.</span>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
