import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ownerRestaurantService, type OwnerRestaurant } from '@/services/ownerRestaurantService';
import { getNextActiveRestaurantId, refreshOwnerRestaurantLists } from '@/services/ownerRestaurantArchivePolicy';
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
  Users,
  Bell,
  Archive,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { Dashboard } from './Dashboard';
import { OwnerNotificationForm } from '@/components/notification/OwnerNotificationForm';
import { NotificationCenter } from '@/components/notification/NotificationCenter';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'owner-home';

  // State
  const [restaurants, setRestaurants] = useState<OwnerRestaurant[]>([]);
  const [archivedRestaurants, setArchivedRestaurants] = useState<OwnerRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchivedLoading, setIsArchivedLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(searchParams.get('view') === 'archived');
  const [restaurantToArchive, setRestaurantToArchive] = useState<OwnerRestaurant | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [selectedRestId, setSelectedRestId] = useState(localStorage.getItem('selected_restaurant_id') || '');
  const [subDetails, setSubDetails] = useState<any>(null);
  const [billingPlans, setBillingPlans] = useState<Plan[]>([]);
  const [isSubLoading, setIsSubLoading] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [statsPeriod, setStatsPeriod] = useState<string>('all');

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
        toast.loading('Đang chuyển sang cổng thanh toán PayOS...');
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

  const loadRestaurants = async (period = 'all') => {
    setIsLoading(true);
    try {
      const data = await ownerRestaurantService.getMyRestaurants(period);
      setRestaurants(data);

      const storedSelection = localStorage.getItem('selected_restaurant_id') || '';
      const selectedIsActive = data.some((restaurant) => (restaurant.id || restaurant._id) === storedSelection);
      if (storedSelection && !selectedIsActive) {
        const fallbackId = data[0]?.id || data[0]?._id;
        if (fallbackId) {
          localStorage.setItem('selected_restaurant_id', fallbackId);
          setSelectedRestId(fallbackId);
        } else {
          localStorage.removeItem('selected_restaurant_id');
          setSelectedRestId('');
        }
        window.location.reload();
      } else if (data.length > 0 && !storedSelection) {
        const firstId = data[0].id || data[0]._id;
        localStorage.setItem('selected_restaurant_id', firstId);
        setSelectedRestId(firstId);
      }
    } catch {
      toast.error('Không thể tải danh sách chi nhánh nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const loadArchivedRestaurants = async (period = 'all') => {
    setIsArchivedLoading(true);
    try {
      setArchivedRestaurants(await ownerRestaurantService.getArchivedRestaurants(period));
    } catch {
      toast.error('Không thể tải danh sách chi nhánh đã lưu trữ');
    } finally {
      setIsArchivedLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants(statsPeriod);
    loadArchivedRestaurants(statsPeriod);
  }, [statsPeriod]);

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

  const changeRestaurantListView = (archived: boolean) => {
    setShowArchived(archived);
    const nextParams = new URLSearchParams(searchParams);
    if (archived) nextParams.set('view', 'archived');
    else nextParams.delete('view');
    setSearchParams(nextParams, { replace: true });
  };

  const handleArchiveRestaurant = async () => {
    if (!restaurantToArchive) return;
    const restaurantId = restaurantToArchive.id || restaurantToArchive._id;
    const restaurantName = restaurantToArchive.name;
    const wasSelected = localStorage.getItem('selected_restaurant_id') === restaurantId;
    setArchivingId(restaurantId);
    try {
      const result = await ownerRestaurantService.archiveRestaurant(restaurantId);
      setRestaurants((current) => current.filter((item) => (item.id || item._id) !== restaurantId));
      setArchivedRestaurants((current) => [
        { ...restaurantToArchive, archivedAt: result.archivedAt },
        ...current.filter((item) => (item.id || item._id) !== restaurantId)
      ]);
      setRestaurantToArchive(null);
      changeRestaurantListView(true);
      toast.success(`${restaurantName} đã được lưu trữ. Dữ liệu lịch sử vẫn được giữ nguyên.`);

      const refreshed = await refreshOwnerRestaurantLists(
        () => ownerRestaurantService.getMyRestaurants(statsPeriod),
        () => ownerRestaurantService.getArchivedRestaurants(statsPeriod)
      );
      if (refreshed.active.status === 'fulfilled') setRestaurants(refreshed.active.value);
      if (refreshed.archived.status === 'fulfilled') setArchivedRestaurants(refreshed.archived.value);

      if (wasSelected) {
        const nextId = refreshed.active.status === 'fulfilled'
          ? getNextActiveRestaurantId(refreshed.active.value, restaurantId)
          : null;
        if (nextId) {
          localStorage.setItem('selected_restaurant_id', nextId);
          setSelectedRestId(nextId);
          window.location.assign('/owner?tab=owner-home&view=archived');
        } else {
          localStorage.removeItem('selected_restaurant_id');
          setSelectedRestId('');
          navigate('/owner?tab=owner-home&view=archived', { replace: true });
        }
      }
      if (refreshed.active.status === 'rejected' || refreshed.archived.status === 'rejected') {
        toast.error('Chi nhánh đã lưu trữ, nhưng danh sách chưa tải mới được. Vui lòng tải lại trang.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể lưu trữ chi nhánh.');
    } finally {
      setArchivingId(null);
    }
  };

  const handleRestoreRestaurant = async (restaurant: OwnerRestaurant) => {
    const restaurantId = restaurant.id || restaurant._id;
    setRestoringId(restaurantId);
    try {
      const restored = await ownerRestaurantService.restoreRestaurant(restaurantId);
      setArchivedRestaurants((current) => current.filter((item) => (item.id || item._id) !== restaurantId));
      setRestaurants((current) => [
        restored,
        ...current.filter((item) => (item.id || item._id) !== restaurantId)
      ]);
      changeRestaurantListView(false);
      toast.success(`${restaurant.name} đã được khôi phục.`);

      const refreshed = await refreshOwnerRestaurantLists(
        () => ownerRestaurantService.getMyRestaurants(statsPeriod),
        () => ownerRestaurantService.getArchivedRestaurants(statsPeriod)
      );
      if (refreshed.active.status === 'fulfilled') setRestaurants(refreshed.active.value);
      if (refreshed.archived.status === 'fulfilled') setArchivedRestaurants(refreshed.archived.value);

      if (!localStorage.getItem('selected_restaurant_id')) {
        const restoredId = restored.id || restored._id || restaurantId;
        localStorage.setItem('selected_restaurant_id', restoredId);
        setSelectedRestId(restoredId);
      }
      if (refreshed.active.status === 'rejected' || refreshed.archived.status === 'rejected') {
        toast.error('Chi nhánh đã khôi phục, nhưng danh sách chưa tải mới được. Vui lòng tải lại trang.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể khôi phục chi nhánh.');
    } finally {
      setRestoringId(null);
    }
  };

  if (activeTab !== 'owner-home' && activeTab !== 'billing' && activeTab !== 'notifications' && selectedRestId) {
    return <Dashboard ownerRestaurants={restaurants} onCopySuccess={() => loadRestaurants(statsPeriod)} />;
  }

  if (activeTab === 'notifications') {
    return (
      <div className="space-y-8 px-4">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden shadow-emerald-950/5 animate-fade-in">
          <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
            <Bell className="w-80 h-80 text-emerald-500" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Trung tâm thông báo</h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Theo dõi tin tức hệ thống, biến động tài khoản thanh toán và các cập nhật tự động từ QDish SaaS.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <OwnerNotificationForm />
          </div>
          <div className="lg:col-span-2">
            <NotificationCenter />
          </div>
        </div>
      </div>
    );
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
          <div className="space-y-6">
            {/* Expiry Warning Banners */}
            {subDetails.subscription.expiryWarningLevel && subDetails.subscription.expiryWarningLevel !== 'none' && (
              (() => {
                const level = subDetails.subscription.expiryWarningLevel;
                const planName = subDetails.subscription.planName;
                
                let bgClass = '';
                let borderClass = '';
                let textClass = '';
                let message = '';

                if (level === '7days') {
                  bgClass = 'bg-amber-50';
                  borderClass = 'border-amber-200';
                  textClass = 'text-amber-800';
                  message = `Gói ${planName} của bạn sẽ hết hạn sau 7 ngày. Vui lòng gia hạn để tránh gián đoạn dịch vụ.`;
                } else if (level === '3days') {
                  bgClass = 'bg-orange-50';
                  borderClass = 'border-orange-200';
                  textClass = 'text-orange-900';
                  message = `Gói ${planName} của bạn sắp hết hạn (còn 3 ngày). Các tính năng cao cấp sẽ bị khóa sau khi hết hạn.`;
                } else if (level === '1day') {
                  bgClass = 'bg-rose-50 border-rose-200 text-rose-800 animate-pulse';
                  borderClass = 'border-rose-200';
                  textClass = 'text-rose-800';
                  message = `Gói ${planName} của bạn sẽ bị hạ xuống FREE sau 24 giờ nữa. Hãy gia hạn ngay để giữ tất cả tính năng cao cấp.`;
                } else if (level === 'expired') {
                  bgClass = 'bg-rose-100 border-rose-300 text-rose-900';
                  borderClass = 'border-rose-300';
                  textClass = 'text-rose-950';
                  message = `Gói dịch vụ cao cấp đã hết hạn. Hệ thống đã tự động chuyển tài khoản về gói FREE. Các tính năng nâng cao đã bị tạm khóa.`;
                }

                return (
                  <div className={`p-4 rounded-2xl border ${bgClass} ${borderClass} ${textClass} flex items-start gap-3 shadow-sm`}>
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-sm mb-0.5">
                        {level === 'expired' ? 'Cảnh báo: Gói dịch vụ đã hết hạn' : 'Thông báo: Gói dịch vụ sắp hết hạn'}
                      </h4>
                      <p className="text-xs font-semibold leading-relaxed">{message}</p>
                    </div>
                  </div>
                );
              })()
            )}

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
                    <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-500/10 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider block mb-1">Gói hoạt động</span>
                        <h3 className="text-2xl font-black text-slate-900">{subDetails.subscription.planName}</h3>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" /> GÓI HIỆN TẠI
                      </span>
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
                          {subDetails.subscription.planCode === 'FREE' 
                            ? 'Vô thời hạn' 
                            : new Date(subDetails.subscription.expiresAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}

                    {subDetails.subscription.planCode !== 'FREE' && subDetails.subscription.daysRemaining !== undefined && (
                      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
                        <span className="font-semibold text-slate-400">Thời gian còn lại:</span>
                        <span className="font-bold text-slate-850 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-455" />
                          {subDetails.subscription.daysRemaining > 0 
                            ? `${subDetails.subscription.daysRemaining} ngày` 
                            : 'Đã hết hạn'}
                        </span>
                      </div>
                    )}
                  </div>

                  {subDetails.subscription.planCode !== 'PRO' && (
                    <div className="pt-4">
                      <Button 
                        onClick={() => navigate('/pricing')}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md py-6"
                      >
                        Nâng cấp gói dịch vụ <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  )}
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
                      label: 'Lượt quét QR (scans/tháng)',
                      count: subDetails.usage.scanCount || 0,
                      limit: subDetails.limits.scanLimitMonthly !== undefined ? subDetails.limits.scanLimitMonthly : -1,
                      icon: QrCode,
                      color: 'bg-indigo-500',
                      bgColor: 'bg-indigo-50',
                      textColor: 'text-indigo-700'
                    },
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
                                Đã đạt giới hạn tối đa! Vui lòng nâng cấp gói để tiếp tục sử dụng thêm.
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
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(subDetails.limits.features || []).map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Feature Flags */}
                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Tính năng AI & phân tích dữ liệu</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { label: 'Cá nhân hóa Fit Score', enabled: subDetails.limits.fitScoreEnabled || false },
                        { label: 'Hồ sơ dinh dưỡng món ăn', enabled: subDetails.limits.foodAttributesEnabled || false },
                        { label: 'Gợi ý món ăn AI (AI Recommendation)', enabled: subDetails.limits.recommendationEnabled || false },
                        { label: 'Cá nhân hóa thực đơn (Personalized Menu)', enabled: subDetails.limits.personalizedMenuEnabled || false },
                        { label: 'Báo cáo phân tích chuyên sâu', enabled: subDetails.limits.advancedAnalyticsEnabled || false },
                        { label: 'Phân tích hành vi khách hàng', enabled: subDetails.limits.customerInsightsEnabled || false },
                        { label: 'CRM khách hàng & lịch sử gọi món', enabled: subDetails.limits.customerCrmEnabled || false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            item.enabled 
                              ? 'bg-purple-50 text-purple-750 border border-purple-200' 
                              : 'bg-slate-50 text-slate-400 border border-slate-200'
                          }`}>
                            {item.enabled ? (
                              <Sparkles className="w-3 h-3 text-purple-600" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            )}
                          </div>
                          <span className={item.enabled ? 'text-slate-800 font-medium' : 'text-slate-400 line-through'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {subDetails.subscription.canUpgradeTo && subDetails.subscription.canUpgradeTo.length > 0 && (
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
                    {billingPlans
                      .filter((plan) => subDetails.subscription.canUpgradeTo?.includes(plan.code))
                      .map((plan) => {
                        const planId = plan.id || plan._id;
                        const isCurrent = subDetails.subscription.planId === planId;
                        const price = billingCycle === BillingCycle.YEARLY ? plan.priceYearly : plan.priceMonthly;
                        
                        let cardBorderClass = 'border-slate-150';
                        const cardBgClass = 'bg-slate-50/50';
                        let btnClass = isCurrent ? 'bg-slate-200 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white';
                        
                        if (plan.code === 'FREE') {
                          cardBorderClass = 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-50/5 shadow-sm transition-all duration-300';
                          if (!isCurrent) btnClass = 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10';
                        } else if (plan.code === 'PLUS') {
                          cardBorderClass = 'border-blue-500/30 hover:border-blue-500 bg-blue-50/5 shadow-sm transition-all duration-300';
                          if (!isCurrent) btnClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/10';
                        } else if (plan.code === 'PRO') {
                          cardBorderClass = 'border-purple-500/45 hover:border-purple-500 bg-purple-50/5 shadow-[0_4px_15px_rgba(168,85,247,0.04)] scale-102 transition-all duration-300 relative';
                          if (!isCurrent) btnClass = 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-550 hover:to-indigo-550 text-white shadow-md shadow-purple-600/10';
                        }

                        return (
                          <div 
                            key={planId || plan.code} 
                            className={`rounded-2xl border p-4 flex flex-col gap-4 group transition-all duration-300 hover:-translate-y-0.5 ${cardBorderClass} ${cardBgClass}`}
                          >
                            {plan.code === 'PRO' && (
                              <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-[8px] uppercase px-2 py-0.5 rounded-full shadow-md">
                                Khuyên dùng
                              </div>
                            )}
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                  {plan.name}
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                    plan.code === 'FREE' ? 'bg-emerald-100 text-emerald-800' :
                                    plan.code === 'PLUS' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {plan.code}
                                  </span>
                                </h4>
                                {plan.isPopular && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black uppercase animate-pulse">Hot</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{plan.description}</p>
                            </div>

                            <div>
                              <div className="text-xl font-black text-slate-900">
                                {price === 0 ? '0đ' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">
                                / {billingCycle === BillingCycle.YEARLY ? 'năm' : 'tháng'}
                              </div>
                            </div>

                            <div className="space-y-1.5 text-[11px] text-slate-600 flex-1 border-t border-slate-100 pt-3">
                              <div>Lượt quét: <strong>{plan.scanLimitMonthly === -1 ? 'Vô hạn' : `${plan.scanLimitMonthly?.toLocaleString('vi-VN')} scans/tháng`}</strong></div>
                              <div>Chi nhánh: <strong>{plan.restaurantLimit === -1 ? 'Không giới hạn' : `${plan.restaurantLimit} chi nhánh`}</strong></div>
                              <div>AI & Analytics: <strong>{plan.code === 'FREE' ? 'Cơ bản' : plan.code === 'PLUS' ? 'AI Fit Score & Cá nhân hóa' : 'Full AI & Phân tích chuyên sâu'}</strong></div>
                            </div>

                            <Button
                              type="button"
                              disabled={!planId || checkoutPlanId !== null || isCurrent}
                              onClick={() => handleBillingCheckout(plan)}
                              className={`rounded-xl text-xs font-bold transition-all duration-200 ${btnClass}`}
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }

  const totalRevenue = restaurants.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalOrders = restaurants.reduce((sum, r) => sum + (r.orderCount || 0), 0);
  const totalBranches = restaurants.length;

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

      {/* Combined Network Stats */}
      {!isLoading && restaurants.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-xl font-heading font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                Hiệu suất kinh doanh toàn chuỗi
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Số liệu tổng hợp cộng dồn từ tất cả {restaurants.length} chi nhánh nhà hàng thuộc sở hữu của bạn.
              </p>
            </div>
            
            {/* Period Switcher */}
            <div className="inline-flex rounded-xl border border-slate-150 bg-slate-50 p-1 self-start sm:self-center shrink-0">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'today', label: 'Hôm nay' },
                { id: 'week', label: 'Tuần này' },
                { id: 'month', label: 'Tháng này' },
                { id: 'year', label: 'Năm nay' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatsPeriod(item.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                    statsPeriod === item.id 
                      ? 'bg-white text-emerald-700 shadow-sm border-slate-100' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat 1: Total Combined Revenue */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Tổng doanh thu toàn chuỗi
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)}
                  </h3>
                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Doanh thu gộp (All branches)
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-650 flex items-center justify-center font-bold shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2: Total Combined Orders */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Tổng đơn hoàn thành
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {totalOrders.toLocaleString('vi-VN')} đơn
                  </h3>
                  <span className="text-[9px] font-semibold text-blue-650 bg-blue-50 px-1.5 py-0.5 rounded">
                    Số đơn phục vụ thành công
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Stat 3: Total Branches */}
            <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden relative group hover:shadow-md transition-all duration-300">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-purple-500" />
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                    Quy mô chi nhánh
                  </span>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {totalBranches} nhà hàng
                  </h3>
                  <span className="text-[9px] font-semibold text-purple-650 bg-purple-50 px-1.5 py-0.5 rounded">
                    Tổng chi nhánh đăng ký
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isLoading || isArchivedLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : restaurants.length === 0 && archivedRestaurants.length === 0 ? (
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
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h2 className="text-xl font-heading font-bold text-slate-800">
                {showArchived ? 'Chi nhánh đã lưu trữ' : 'Danh sách chi nhánh của bạn'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {showArchived
                  ? 'Chi nhánh lưu trữ không nhận đơn mới; dữ liệu cũ vẫn được giữ và có thể khôi phục.'
                  : 'Chọn chi nhánh để vào quản trị hoặc lưu trữ chi nhánh không còn hoạt động.'}
              </p>
            </div>
            {!showArchived && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md self-start"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm chi nhánh mới
              </Button>
            )}
          </div>

          <div className="inline-flex max-w-full rounded-xl border border-slate-200 bg-slate-50 p-1" role="tablist" aria-label="Lọc chi nhánh">
            <button
              type="button"
              role="tab"
              aria-selected={!showArchived}
              onClick={() => changeRestaurantListView(false)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${!showArchived ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Đang hoạt động <span className="ml-1 text-xs opacity-70">{restaurants.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={showArchived}
              onClick={() => changeRestaurantListView(true)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${showArchived ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Đã lưu trữ <span className="ml-1 text-xs opacity-70">{archivedRestaurants.length}</span>
            </button>
          </div>

          {showArchived ? (
            archivedRestaurants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
                <Archive className="mx-auto mb-3 h-9 w-9 text-slate-400" />
                <h3 className="font-semibold text-slate-800">Chưa có chi nhánh lưu trữ</h3>
                <p className="mt-1 text-sm text-slate-500">Các chi nhánh đã lưu trữ sẽ xuất hiện ở đây để bạn khôi phục khi cần.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {archivedRestaurants.map((rest) => {
                  const id = rest.id || rest._id;
                  return (
                    <Card key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <Archive className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <CardTitle className="truncate text-base font-bold text-slate-800">{rest.name}</CardTitle>
                              <CardDescription className="mt-1 truncate font-mono text-xs">Admin: {rest.username}</CardDescription>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">Đã lưu trữ</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{rest.address}</span></div>
                        <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" /><span>{rest.phone}</span></div>
                        <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{rest.email}</span></div>
                        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <Archive className="h-3.5 w-3.5" />
                          Lưu trữ ngày {rest.archivedAt ? new Date(rest.archivedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRestoreRestaurant(rest)}
                          disabled={restoringId === id}
                          className="mt-1 w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          {restoringId === id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                          Khôi phục chi nhánh
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )
          ) : restaurants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <Store className="mx-auto mb-3 h-9 w-9 text-slate-400" />
              <h3 className="font-semibold text-slate-800">Không có chi nhánh đang hoạt động</h3>
              <p className="mt-1 text-sm text-slate-500">Khôi phục một chi nhánh đã lưu trữ hoặc tạo chi nhánh mới để tiếp tục.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button type="button" variant="outline" onClick={() => changeRestaurantListView(true)}>
                  <Archive className="mr-2 h-4 w-4" /> Xem chi nhánh lưu trữ
                </Button>
                <Button type="button" onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" /> Tạo chi nhánh
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {restaurants.map((rest) => {
                const id = rest.id || rest._id;
                const isSelected = selectedRestId === id;
                return (
                  <Card key={id} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${isSelected ? 'border-emerald-400' : 'border-slate-200'}`}>
                    {isSelected && <div className="h-1 bg-emerald-500" />}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Store className="h-5 w-5" /></div>
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base font-bold text-slate-800">{rest.name}</CardTitle>
                            <CardDescription className="mt-1 truncate font-mono text-xs">Admin: {rest.username}</CardDescription>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Đang chọn</span>
                        ) : (
                          <button type="button" onClick={() => selectRestaurant(id)} className="shrink-0 cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:bg-emerald-50 hover:text-emerald-700">
                            Chọn
                          </button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 text-sm text-slate-600">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{rest.address}</span></div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" /><span>{rest.phone}</span></div>
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><span className="truncate">{rest.email}</span></div>
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className={`rounded-full px-2.5 py-1 font-semibold ${rest.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {rest.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                        <span className="text-slate-500">Doanh thu</span>
                        <strong className="text-slate-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rest.revenue || 0)}</strong>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <button type="button" onClick={() => navigate(`/owner/restaurant/${id}`)} className="cursor-pointer text-xs font-semibold text-slate-600 transition-colors duration-200 hover:text-emerald-700">Xem chi tiết</button>
                        <div className="flex flex-wrap items-center gap-3">
                          {isSelected && (
                            <button type="button" onClick={() => setSearchParams({ tab: 'overview' })} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors duration-200 hover:text-emerald-800">
                              Vào quản trị <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => setRestaurantToArchive(rest)} className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:text-rose-700" aria-label={`Lưu trữ ${rest.name}`}>
                            <Archive className="h-3.5 w-3.5" /> Lưu trữ
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
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

      <Dialog
        open={!!restaurantToArchive}
        onOpenChange={(open) => { if (!open && !archivingId) setRestaurantToArchive(null); }}
      >
        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Archive className="h-5 w-5 text-amber-600" /> Lưu trữ chi nhánh?
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-600">
              {restaurantToArchive?.name} sẽ ngừng nhận đơn mới và không còn được tính vào giới hạn số chi nhánh.
              Đơn hàng, hóa đơn, bàn, thực đơn và lịch sử liên quan vẫn được giữ nguyên.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Hãy đóng các phiên bàn và thanh toán hết hóa đơn trước. Bạn có thể khôi phục chi nhánh sau, nếu gói hiện tại còn hạn mức.</p>
          </div>
          <DialogFooter className="mt-2 gap-2 sm:justify-end">
            <Button type="button" variant="outline" disabled={!!archivingId} onClick={() => setRestaurantToArchive(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              disabled={!restaurantToArchive || archivingId === (restaurantToArchive.id || restaurantToArchive._id)}
              onClick={handleArchiveRestaurant}
              className="bg-amber-700 text-white hover:bg-amber-800"
            >
              {archivingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              {archivingId ? 'Đang lưu trữ...' : 'Lưu trữ chi nhánh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
