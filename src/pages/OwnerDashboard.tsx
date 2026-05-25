import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ownerRestaurantService } from '@/services/ownerRestaurantService';
import { PENDING_PAYMENT_ORDER_KEY, subscriptionService } from '@/services/subscriptionService';
import { planService } from '@/services/planService';
import { BillingCycle, Plan } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertCircle, 
  CheckCircle2, 
  Store, 
  ShieldCheck, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  Building2, 
  ExternalLink,
  CreditCard,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Check,
  Clock,
  QrCode,
  UtensilsCrossed,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Dashboard } from './Dashboard';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'owner-home';

  // State
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRestId, setSelectedRestId] = useState(localStorage.getItem('selected_restaurant_id') || '');
  const [subDetails, setSubDetails] = useState<any>(null);
  const [billingPlans, setBillingPlans] = useState<Plan[]>([]);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  const loadSubscription = async () => {
    setIsSubLoading(true);
    setBillingError(null);
    try {
      const [subscriptionData, plansData] = await Promise.all([
        subscriptionService.getOwnerSubscription(),
        planService.getPlans()
      ]);
      setSubDetails(subscriptionData);
      setBillingPlans(plansData);
    } catch (err: any) {
      setBillingError(err.message || 'Không thể tải thông tin gói dịch vụ');
      toast.error('Không thể tải thông tin gói dịch vụ của bạn.');
    } finally {
      setIsSubLoading(false);
    }
  };

  const handleBillingCheckout = async (plan: Plan) => {
    const planId = plan.id || plan._id;
    if (!planId) {
      toast.error('Không xác định được gói dịch vụ');
      return;
    }

    if (subDetails?.subscription?.planId === planId && subDetails.subscription.status === 'ACTIVE') {
      toast.info('Bạn đang sử dụng gói này.');
      return;
    }

    setCheckoutPlanId(planId);
    try {
      const response = await subscriptionService.checkoutSubscription(planId, billingCycle);
      if (response.isFree) {
        toast.success('Đã kích hoạt gói miễn phí thành công.');
        await loadSubscription();
        return;
      }
      if (response.checkoutUrl) {
        if (response.orderCode) {
          localStorage.setItem(PENDING_PAYMENT_ORDER_KEY, String(response.orderCode));
        }
        toast.loading('Äang chuyá»ƒn sang cá»•ng thanh toÃ¡n PayOS...');
        window.location.assign(response.checkoutUrl);
        return;
      }
      toast.error('Không nhận được liên kết thanh toán từ hệ thống.');
    } catch (err: any) {
      toast.error(err.message || 'Không thể khởi tạo thanh toán.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      loadSubscription();
    }
  }, [activeTab]);
  
  // Restaurant Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    restaurantName: '',
    restaurantEmail: user?.email || '',
    restaurantPhone: '',
    address: '',
    restaurantUsername: '',
    restaurantPassword: '',
    confirmRestaurantPassword: ''
  });

  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const data = await ownerRestaurantService.getMyRestaurants();
      setRestaurants(data);
      
      // Auto select first branch if none selected yet
      if (data.length > 0 && !localStorage.getItem('selected_restaurant_id')) {
        localStorage.setItem('selected_restaurant_id', data[0].id || data[0]._id);
        setSelectedRestId(data[0].id || data[0]._id);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách chi nhánh nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Update default form email when user profile email is available
  useEffect(() => {
    const email = user?.email;
    if (email && !form.restaurantEmail) {
      setForm(prev => ({ ...prev, restaurantEmail: email }));
    }
  }, [user?.email, form.restaurantEmail]);

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic verification
    if (
      !form.restaurantName.trim() ||
      !form.restaurantEmail.trim() ||
      !form.restaurantPhone.trim() ||
      !form.address.trim() ||
      !form.restaurantUsername.trim() ||
      !form.restaurantPassword ||
      !form.confirmRestaurantPassword
    ) {
      toast.error('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.restaurantEmail.trim())) {
      toast.error('Định dạng email không hợp lệ.');
      return;
    }

    if (form.restaurantPassword.length < 6) {
      toast.error('Mật khẩu admin cần tối thiểu 6 ký tự.');
      return;
    }

    if (form.restaurantPassword !== form.confirmRestaurantPassword) {
      toast.error('Xác nhận mật khẩu admin không trùng khớp.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ownerRestaurantService.createRestaurant({
        restaurantName: form.restaurantName.trim(),
        restaurantEmail: form.restaurantEmail.trim().toLowerCase(),
        restaurantPhone: form.restaurantPhone.trim(),
        address: form.address.trim(),
        restaurantUsername: form.restaurantUsername.trim(),
        restaurantPassword: form.restaurantPassword,
        confirmRestaurantPassword: form.confirmRestaurantPassword
      });

      toast.success(response.message || 'Tạo chi nhánh nhà hàng mới thành công!');
      setIsModalOpen(false);
      
      // Clear form
      setForm({
        restaurantName: '',
        restaurantEmail: user?.email || '',
        restaurantPhone: '',
        address: '',
        restaurantUsername: '',
        restaurantPassword: '',
        confirmRestaurantPassword: ''
      });

      // Reload lists and select the newly created branch
      const newBranchId = response.restaurant?.id || response.restaurant?._id;
      if (newBranchId) {
        localStorage.setItem('selected_restaurant_id', newBranchId);
        setSelectedRestId(newBranchId);
      }
      
      // Full page reload to boot up all sockets & queries correctly for the new tenant workspace
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo nhà hàng mới.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectRestaurant = (id: string) => {
    localStorage.setItem('selected_restaurant_id', id);
    setSelectedRestId(id);
    toast.success('Đã chuyển đổi không gian làm việc chi nhánh!');
    window.location.reload();
  };

  // If the active tab is one of the administrator tabs (from Dashboard layout),
  // we reuse the main <Dashboard /> component directly
  if (activeTab !== 'owner-home' && activeTab !== 'billing' && selectedRestId) {
    return <Dashboard />;
  }

  if (activeTab === 'billing') {
    return (
      <div className="space-y-8 px-4">
        {/* Billing Header Banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden shadow-emerald-950/5">
          <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
            <CreditCard className="w-80 h-80 text-emerald-500" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-4 h-4 animate-pulse" /> Gói Dịch Vụ & Thanh Toán
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Quản Lý Gói Dịch Vụ SaaS của Bạn
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Kiểm tra mức sử dụng tài nguyên, hạn mức tài nguyên và nâng cấp các tính năng cao cấp cho chuỗi nhà hàng của bạn qua cổng PayOS.
            </p>
          </div>
        </div>

        {isSubLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : !subDetails ? (
          <div className="text-center py-12 bg-white border rounded-3xl shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Không thể tải thông tin gói dịch vụ</h3>
            <p className="text-slate-500 text-sm mb-4">{billingError || 'Hệ thống gặp sự cố trong quá trình đồng bộ hóa gói. Vui lòng bấm thử lại.'}</p>
            <Button onClick={loadSubscription} className="bg-emerald-600 text-white rounded-xl">Thử lại</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 1. Left Section: Package Info & Status */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-2xl border border-slate-150 bg-white shadow-sm overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600" />
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800">Gói hiện tại</CardTitle>
                  <CardDescription className="text-xs">Thông tin chi tiết về gói dịch vụ của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-500/10">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block mb-1">Gói hoạt động</span>
                    <h3 className="text-2xl font-black text-slate-900">{subDetails.subscription.planName}</h3>
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-400">Trạng thái:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        subDetails.subscription.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {subDetails.subscription.status === 'ACTIVE' ? 'Đang kích hoạt' : 'Chờ thanh toán'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-400">Chi phí:</span>
                      <span className="font-bold text-slate-800">
                        {subDetails.subscription.amount === 0 
                          ? 'Miễn phí (0đ)' 
                          : `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subDetails.subscription.amount)} / ${subDetails.subscription.billingCycle === 'YEARLY' ? 'năm' : 'tháng'}`}
                      </span>
                    </div>

                    {subDetails.subscription.startedAt && (
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="font-semibold text-slate-400">Ngày kích hoạt:</span>
                        <span className="font-bold text-slate-850 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-450" />
                          {new Date(subDetails.subscription.startedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}

                    {subDetails.subscription.expiresAt && (
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="font-semibold text-slate-400">Hạn sử dụng:</span>
                        <span className="font-bold text-slate-850 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-455" />
                          {subDetails.subscription.amount === 0 
                            ? 'Vô thời hạn' 
                            : new Date(subDetails.subscription.expiresAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md py-6"
                    >
                      Nâng cấp gói dịch vụ <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. Right Section: Limit Usage & Compliance */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border border-slate-150 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800">Giới hạn sử dụng tài nguyên</CardTitle>
                  <CardDescription className="text-xs">Số lượng tài nguyên đã tạo so với giới hạn tối đa của gói hiện tại</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Items list */}
                  {[
                    {
                      label: 'Chi nhánh / Nhà hàng',
                      count: subDetails.usage.restaurantCount,
                      limit: subDetails.limits.restaurantLimit,
                      icon: Building2,
                      color: 'bg-emerald-500',
                      bgColor: 'bg-emerald-50',
                      textColor: 'text-emerald-700'
                    },
                    {
                      label: 'Bàn ăn hoạt động',
                      count: subDetails.usage.tableCount,
                      limit: subDetails.limits.tableLimit,
                      icon: QrCode,
                      color: 'bg-green-500',
                      bgColor: 'bg-green-50',
                      textColor: 'text-green-700'
                    },
                    {
                      label: 'Món ăn trong thực đơn',
                      count: subDetails.usage.menuItemCount,
                      limit: subDetails.limits.menuItemLimit,
                      icon: UtensilsCrossed,
                      color: 'bg-emerald-600',
                      bgColor: 'bg-emerald-50/80',
                      textColor: 'text-emerald-800'
                    },
                    {
                      label: 'Nhân viên (Staff)',
                      count: subDetails.usage.staffCount,
                      limit: subDetails.limits.staffLimit,
                      icon: Users,
                      color: 'bg-teal-500',
                      bgColor: 'bg-teal-50',
                      textColor: 'text-teal-700'
                    }
                  ].map((resItem, idx) => {
                    const isUnlimited = resItem.limit === -1;
                    const percent = isUnlimited ? 0 : Math.min(100, (resItem.count / resItem.limit) * 100);
                    const isAtLimit = !isUnlimited && resItem.count >= resItem.limit;
                    const ResIcon = resItem.icon;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${resItem.bgColor} ${resItem.textColor} flex items-center justify-center shrink-0`}>
                              <ResIcon className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-800">{resItem.label}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-extrabold text-slate-900 text-sm">{resItem.count}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-slate-500 font-bold">{isUnlimited ? 'Không giới hạn' : resItem.limit}</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {!isUnlimited ? (
                          <div className="relative pt-1">
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? 'bg-rose-500 animate-pulse' : resItem.color}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            {isAtLimit && (
                              <span className="text-[9px] font-bold text-rose-500 mt-1 block">
                                Đã đạt giới hạn tối đa! Vui lòng nâng cấp gói để tạo thêm.
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-2 rounded-full bg-slate-50 overflow-hidden border border-emerald-500/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 w-full opacity-30" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Package Features List */}
              <Card className="rounded-2xl border border-slate-150 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-800">Tính năng gói sở hữu</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(subDetails.limits.features || []).map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-150 bg-white shadow-sm">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800">Gói có thể nâng cấp</CardTitle>
                    <CardDescription className="text-xs">Danh sách gói đang được Super Admin kích hoạt</CardDescription>
                  </div>
                  <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setBillingCycle(BillingCycle.MONTHLY)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg ${billingCycle === BillingCycle.MONTHLY ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      Tháng
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle(BillingCycle.YEARLY)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg ${billingCycle === BillingCycle.YEARLY ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                    >
                      Năm
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {billingPlans.map((plan) => {
                    const planId = plan.id || plan._id;
                    const isCurrent = subDetails.subscription.planId === planId;
                    const price = billingCycle === BillingCycle.YEARLY ? plan.priceYearly : plan.priceMonthly;
                    return (
                      <div key={planId || plan.code} className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4 flex flex-col gap-4">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-black text-slate-900 text-sm">{plan.name}</h4>
                            {plan.isPopular && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase">Hot</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
                        </div>

                        <div>
                          <div className="text-xl font-black text-slate-900">
                            {price === 0 ? '0đ' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            / {billingCycle === BillingCycle.YEARLY ? 'năm' : 'tháng'}
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-600 flex-1">
                          <div>Chi nhánh: <strong>{plan.restaurantLimit === -1 ? 'Không giới hạn' : plan.restaurantLimit}</strong></div>
                          <div>Bàn: <strong>{plan.tableLimit === -1 ? 'Không giới hạn' : plan.tableLimit}</strong></div>
                          <div>Món: <strong>{plan.menuItemLimit === -1 ? 'Không giới hạn' : plan.menuItemLimit}</strong></div>
                          <div>Staff: <strong>{plan.staffLimit === -1 ? 'Không giới hạn' : plan.staffLimit}</strong></div>
                        </div>

                        <Button
                          type="button"
                          disabled={!planId || checkoutPlanId !== null || isCurrent}
                          onClick={() => handleBillingCheckout(plan)}
                          className={`rounded-xl text-xs font-bold ${isCurrent ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                        >
                          {checkoutPlanId === planId ? (
                            <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang xử lý</span>
                          ) : isCurrent ? (
                            'Gói hiện tại'
                          ) : price === 0 ? (
                            'Chọn FREE'
                          ) : (
                            `Nâng cấp ${plan.code}`
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden shadow-emerald-950/10">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
          <Store className="w-80 h-80" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" /> Tài khoản Chủ nhà hàng (Owner)
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
            Xin chào, {user?.username}!
          </h1>
          <p className="text-emerald-50 text-sm md:text-base leading-relaxed">
            Quản lý các chuỗi cửa hàng, thiết lập thực đơn QR và theo dõi doanh thu của các chi nhánh tại QDish.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : restaurants.length === 0 ? (
        /* Empty State Landing Page */
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
          <Building2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 opacity-80" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Bạn chưa đăng ký chi nhánh nào</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Để bắt đầu sử dụng các tính năng quản lý thực đơn QR, gọi món, quản lý bàn ăn, nhân viên bếp của QDish, hãy tạo chi nhánh đầu tiên của bạn.
          </p>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-2.5 font-bold shadow-md shadow-emerald-600/15"
          >
            <Plus className="w-4 h-4 mr-2" /> Tạo chi nhánh đầu tiên
          </Button>
        </div>
      ) : (
        /* Branch lists and quick selection workspace */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-800">Danh sách chi nhánh của bạn</h2>
              <p className="text-slate-400 text-xs mt-0.5">Chọn một chi nhánh dưới đây để chuyển sang không gian quản trị chi tiết.</p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm chi nhánh mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => {
              const isSelected = selectedRestId === (rest.id || rest._id);
              return (
                <Card 
                  key={rest.id || rest._id} 
                  className={`overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative border ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' 
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      
                      {isSelected ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Không gian làm việc
                        </span>
                      ) : (
                        <button
                          onClick={() => selectRestaurant(rest.id || rest._id)}
                          className="text-[10px] bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-600 font-bold px-2.5 py-1 rounded-full uppercase transition-colors"
                        >
                          Chọn làm việc
                        </button>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg font-heading font-bold text-slate-800 mt-3.5">
                      {rest.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono text-slate-400">
                      ID Admin: {rest.username}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{rest.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{rest.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{rest.email}</span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rest.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        {rest.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                      
                      {isSelected && (
                        <button 
                          onClick={() => setSearchParams({ tab: 'overview' })}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          Vào Quản trị <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialog: Create Restaurant Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">Đăng ký chi nhánh mới</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Điền các thông tin dưới đây để tạo chi nhánh và tài khoản đăng nhập cho quản lý chi nhánh.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRestaurant} className="space-y-4 py-3">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="resName" className="text-xs text-gray-600 font-semibold">Tên chi nhánh nhà hàng *</Label>
              <Input 
                id="resName" 
                placeholder="Ví dụ: QDish Buffet Hải Sản Cầu Giấy"
                value={form.restaurantName} 
                onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} 
                className="rounded-xl" 
                required
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="resEmail" className="text-xs text-gray-600 font-semibold">Email nhà hàng *</Label>
                <Input 
                  id="resEmail" 
                  type="email" 
                  placeholder="email@restaurant.com"
                  value={form.restaurantEmail} 
                  onChange={(e) => setForm({ ...form, restaurantEmail: e.target.value })} 
                  className="rounded-xl" 
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resPhone" className="text-xs text-gray-600 font-semibold">Số điện thoại *</Label>
                <Input 
                  id="resPhone" 
                  placeholder="09xxxxxxxx"
                  value={form.restaurantPhone} 
                  onChange={(e) => setForm({ ...form, restaurantPhone: e.target.value })} 
                  className="rounded-xl" 
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <Label htmlFor="resAddr" className="text-xs text-gray-600 font-semibold">Địa chỉ chi nhánh *</Label>
              <Input 
                id="resAddr" 
                placeholder="Số nhà, tên đường, quận/huyện, thành phố"
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
                className="rounded-xl" 
                required
              />
            </div>

            <div className="border-t border-slate-100 my-4 pt-3">
              <span className="text-xs font-bold text-slate-800 block mb-2.5">
                Thiết lập tài khoản Admin đăng nhập chi nhánh
              </span>
              
              {/* Username */}
              <div className="space-y-1 mb-3">
                <Label htmlFor="resUsername" className="text-xs text-gray-600 font-semibold">Username Admin *</Label>
                <Input 
                  id="resUsername" 
                  placeholder="Ví dụ: buffet_caugiay_admin"
                  value={form.restaurantUsername} 
                  onChange={(e) => setForm({ ...form, restaurantUsername: e.target.value.replace(/\s+/g, '') })} 
                  className="rounded-xl" 
                  required
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="resPw" className="text-xs text-gray-600 font-semibold">Mật khẩu *</Label>
                  <Input 
                    id="resPw" 
                    type="password" 
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.restaurantPassword} 
                    onChange={(e) => setForm({ ...form, restaurantPassword: e.target.value })} 
                    className="rounded-xl" 
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirmResPw" className="text-xs text-gray-600 font-semibold">Nhập lại mật khẩu *</Label>
                  <Input 
                    id="confirmResPw" 
                    type="password" 
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmRestaurantPassword} 
                    onChange={(e) => setForm({ ...form, confirmRestaurantPassword: e.target.value })} 
                    className="rounded-xl" 
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">Hủy</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/10"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo nhà hàng'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
