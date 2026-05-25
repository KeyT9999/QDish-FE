import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Restaurant, NewRestaurantPayload, RestaurantStatus, OverviewStats, Owner, CreateOwnerPayload } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { ownerService } from '@/services/ownerService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Store, Plus, Edit2, Key, Loader2, CheckCircle, ShieldAlert, Users, UserCheck, X, CreditCard, ReceiptText } from 'lucide-react';
import { toast } from 'sonner';

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

export const SuperAdmin: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as 'stats' | 'restaurants' | 'owners' | 'plans' || 'restaurants';
  const activeTab = ['stats', 'restaurants', 'owners', 'plans'].includes(queryTab) ? queryTab : 'restaurants';
  const setActiveTab = (tab: 'stats' | 'restaurants' | 'owners' | 'plans') => setSearchParams({ tab });

  // Data States
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState<any | null>(null);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals for Restaurant
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);
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

  const [isResetPwModalOpen, setIsResetPwModalOpen] = useState(false);
  const [selectedRestForPwReset, setSelectedRestForPwReset] = useState<Restaurant | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Modals for Owner
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [ownerForm, setOwnerForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    isActive: true
  });

  const [isResetOwnerPwModalOpen, setIsResetOwnerPwModalOpen] = useState(false);
  const [selectedOwnerForPwReset, setSelectedOwnerForPwReset] = useState<Owner | null>(null);
  const [newOwnerPassword, setNewOwnerPassword] = useState('');

  // SaaS Plans States
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState(getDefaultPlanForm());

  // Owner Plan Override Modal States
  const [isOwnerPlanOverrideModalOpen, setIsOwnerPlanOverrideModalOpen] = useState(false);
  const [selectedOwnerForPlanOverride, setSelectedOwnerForPlanOverride] = useState<Owner | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    planId: '',
    status: 'ACTIVE',
    expiresAt: ''
  });

  // Fetch Data
  const loadRestaurants = useCallback(async () => {
    setIsLoadingRestaurants(true);
    try {
      const data = await restaurantService.getAll(
        debouncedSearchTerm.trim() || undefined,
        statusFilter !== 'ALL' ? statusFilter : undefined
      );
      setRestaurants(data);
    } catch (err) {
      toast.error('Không thể tải danh sách nhà hàng');
    } finally {
      setIsLoadingRestaurants(false);
    }
  }, [debouncedSearchTerm, statusFilter]);

  const loadOwners = useCallback(async () => {
    setIsLoadingOwners(true);
    try {
      const statusParam = statusFilter === 'ACTIVE' ? 'ACTIVE' : statusFilter === 'INACTIVE' ? 'INACTIVE' : undefined;
      const data = await ownerService.getAll(
        debouncedSearchTerm.trim() || undefined,
        statusParam
      );
      setOwners(data);
    } catch (err) {
      toast.error('Không thể tải danh sách chủ nhà hàng');
    } finally {
      setIsLoadingOwners(false);
    }
  }, [debouncedSearchTerm, statusFilter]);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const { subscriptionService } = await import('@/services/subscriptionService');
      const [data, revenueData] = await Promise.all([
        restaurantService.getOverviewStats(),
        subscriptionService.adminGetSubscriptionRevenue()
      ]);
      setOverviewStats(data);
      setSubscriptionRevenue(revenueData);
    } catch (err) {
      toast.error('Không thể tải thống kê SaaS');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    try {
      const { planService } = await import('@/services/planService');
      const data = await planService.adminGetPlans();
      setPlans(data);
    } catch (err) {
      toast.error('Không thể tải danh sách gói dịch vụ');
    } finally {
      setIsLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === 'stats') loadStats();
    if (activeTab === 'restaurants') loadRestaurants();
    if (activeTab === 'owners') {
      loadOwners();
      loadPlans();
    }
    if (activeTab === 'plans') loadPlans();
  }, [activeTab, loadRestaurants, loadStats, loadOwners, loadPlans]);

  // CRUD Handlers
  const handleOpenRestModal = (item?: Restaurant) => {
    if (item) {
      setEditingRest(item);
      setRestForm({
        name: item.name,
        username: item.username,
        password: '',
        ownerName: item.ownerName,
        email: item.email,
        address: item.address,
        phone: item.phone,
        status: item.status
      });
    } else {
      setEditingRest(null);
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
    setIsRestModalOpen(true);
  };

  const handleSaveRestaurant = async () => {
    // Basic validation
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

    try {
      if (editingRest) {
        await restaurantService.update(editingRest.id || (editingRest as any)._id, {
          name: restForm.name.trim(),
          ownerName: restForm.ownerName.trim(),
          email: restForm.email.trim(),
          address: restForm.address.trim(),
          phone: restForm.phone.trim(),
          status: restForm.status
        });
        toast.success('Đã cập nhật thông tin nhà hàng thành công');
      } else {
        const payload: NewRestaurantPayload = {
          name: restForm.name.trim(),
          username: restForm.username.trim(),
          password: restForm.password,
          ownerName: restForm.ownerName.trim(),
          email: restForm.email.trim(),
          address: restForm.address.trim(),
          phone: restForm.phone.trim(),
          status: restForm.status
        };
        await restaurantService.create(payload);
        toast.success('Đã tạo nhà hàng mới và gửi thông tin qua email chào mừng!');
      }
      setIsRestModalOpen(false);
      loadRestaurants();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu nhà hàng');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: RestaurantStatus) => {
    try {
      const nextActive = currentStatus !== RestaurantStatus.ACTIVE;
      await restaurantService.toggleActive(id, nextActive);
      toast.success('Đã thay đổi trạng thái hoạt động của nhà hàng');
      loadRestaurants();
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái nhà hàng');
    }
  };

  const handleOpenResetPwModal = (item: Restaurant) => {
    setSelectedRestForPwReset(item);
    setNewPassword('');
    setIsResetPwModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!selectedRestForPwReset || !newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    try {
      await restaurantService.resetPassword(
        selectedRestForPwReset.id || (selectedRestForPwReset as any)._id,
        newPassword.trim()
      );
      toast.success(`Đã đặt lại mật khẩu thành công cho nhà hàng ${selectedRestForPwReset.name}`);
      setIsResetPwModalOpen(false);
      setSelectedRestForPwReset(null);
    } catch (err) {
      toast.error('Lỗi khi đặt lại mật khẩu');
    }
  };

  // Owner Event Handlers
  const handleOpenOwnerModal = (item?: Owner) => {
    if (item) {
      setEditingOwner(item);
      setOwnerForm({
        fullName: item.fullName,
        email: item.email,
        phone: item.phone,
        username: item.username,
        password: '',
        isActive: item.isActive
      });
    } else {
      setEditingOwner(null);
      setOwnerForm({
        fullName: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        isActive: true
      });
    }
    setIsOwnerModalOpen(true);
  };

  const handleSaveOwner = async () => {
    if (
      !ownerForm.fullName.trim() ||
      !ownerForm.username.trim() ||
      (!editingOwner && !ownerForm.password) ||
      !ownerForm.email.trim() ||
      !ownerForm.phone.trim()
    ) {
      toast.error('Vui lòng nhập đầy đủ các thông tin bắt buộc');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerForm.email.trim())) {
      toast.error('Định dạng email không hợp lệ');
      return;
    }

    try {
      if (editingOwner) {
        await ownerService.update(editingOwner.id || (editingOwner as any)._id, {
          fullName: ownerForm.fullName.trim(),
          email: ownerForm.email.trim(),
          phone: ownerForm.phone.trim(),
          isActive: ownerForm.isActive
        });
        toast.success('Đã cập nhật thông tin chủ nhà hàng thành công');
      } else {
        const payload: CreateOwnerPayload = {
          fullName: ownerForm.fullName.trim(),
          username: ownerForm.username.trim(),
          password: ownerForm.password,
          email: ownerForm.email.trim(),
          phone: ownerForm.phone.trim(),
          isActive: ownerForm.isActive
        };
        await ownerService.create(payload);
        toast.success('Đã tạo tài khoản chủ nhà hàng mới thành công!');
      }
      setIsOwnerModalOpen(false);
      loadOwners();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu thông tin chủ nhà hàng');
    }
  };

  const handleToggleOwnerActive = async (id: string) => {
    try {
      const response = await ownerService.toggleActive(id);
      toast.success(response.message || 'Đã thay đổi trạng thái hoạt động của chủ nhà hàng');
      loadOwners();
    } catch (err) {
      toast.error('Lỗi khi thay đổi trạng thái hoạt động của chủ nhà hàng');
    }
  };

  const handleOpenResetOwnerPwModal = (item: Owner) => {
    setSelectedOwnerForPwReset(item);
    setNewOwnerPassword('');
    setIsResetOwnerPwModalOpen(true);
  };

  const handleResetOwnerPassword = async () => {
    if (!selectedOwnerForPwReset || !newOwnerPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    if (newOwnerPassword.trim().length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }
    try {
      await ownerService.resetPassword(
        selectedOwnerForPwReset.id || (selectedOwnerForPwReset as any)._id,
        newOwnerPassword.trim()
      );
      toast.success(`Đã đặt lại mật khẩu thành công cho ${selectedOwnerForPwReset.fullName}`);
      setIsResetOwnerPwModalOpen(false);
      setSelectedOwnerForPwReset(null);
    } catch (err) {
      toast.error('Lỗi khi đặt lại mật khẩu chủ nhà hàng');
    }
  };

  // ============================================
  // SaaS Plans CRUD Handlers
  // ============================================
  const handleOpenPlanModal = (item?: any) => {
    if (item) {
      setEditingPlan(item);
      setPlanForm({
        name: item.name,
        code: item.code,
        description: item.description || '',
        priceMonthly: item.priceMonthly,
        priceYearly: item.priceYearly,
        restaurantLimit: item.restaurantLimit,
        tableLimit: item.tableLimit,
        menuItemLimit: item.menuItemLimit,
        staffLimit: item.staffLimit,
        featuresText: item.features ? item.features.join(', ') : '',
        unavailableFeaturesText: item.unavailableFeatures ? item.unavailableFeatures.join(', ') : '',
        isPopular: item.isPopular || false,
        isActive: item.isActive !== undefined ? item.isActive : true,
        sortOrder: item.sortOrder || 0
      });
    } else {
      setEditingPlan(null);
      setPlanForm(getDefaultPlanForm());
    }
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
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
    try {
      const { planService } = await import('@/services/planService');
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

      if (editingPlan) {
        await planService.adminUpdatePlan(editingPlan.id || editingPlan._id, payload);
        toast.success('Đã cập nhật gói dịch vụ thành công');
      } else {
        await planService.adminCreatePlan(payload);
        toast.success('Đã tạo gói dịch vụ mới thành công!');
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
      setPlanForm(getDefaultPlanForm());
      loadPlans();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu gói dịch vụ');
    }
  };

  const handleTogglePlanActive = async (plan: any) => {
    try {
      const { planService } = await import('@/services/planService');
      await planService.adminTogglePlanActive(plan.id || plan._id);
      toast.success('Đã cập nhật trạng thái hoạt động gói dịch vụ');
      loadPlans();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đổi trạng thái');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return;
    try {
      const { planService } = await import('@/services/planService');
      await planService.adminDeletePlan(id);
      toast.success('Đã xóa gói dịch vụ thành công');
      loadPlans();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa gói dịch vụ');
    }
  };

  // Manual Subscription Override Handlers
  const handleOpenOverrideModal = (owner: Owner) => {
    setSelectedOwnerForPlanOverride(owner);
    setOverrideForm({
      planId: plans.find(p => p.code === owner.planCode)?.id || plans.find(p => p.code === owner.planCode)?._id || '',
      status: owner.subscriptionStatus && owner.subscriptionStatus !== 'N/A' ? owner.subscriptionStatus : 'ACTIVE',
      expiresAt: owner.subscriptionExpiresAt ? new Date(owner.subscriptionExpiresAt).toISOString().split('T')[0] : ''
    });
    setIsOwnerPlanOverrideModalOpen(true);
  };

  const handleOverrideOwnerPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwnerForPlanOverride || !overrideForm.planId) {
      toast.error('Vui lòng chọn gói dịch vụ');
      return;
    }
    try {
      const { subscriptionService } = await import('@/services/subscriptionService');
      await subscriptionService.adminChangeOwnerPlan(
        selectedOwnerForPlanOverride.id || (selectedOwnerForPlanOverride as any)._id,
        overrideForm.planId,
        overrideForm.status,
        overrideForm.expiresAt || undefined
      );
      toast.success(`Đã thay đổi gói dịch vụ thành công cho ${selectedOwnerForPlanOverride.fullName}`);
      setIsOwnerPlanOverrideModalOpen(false);
      setSelectedOwnerForPlanOverride(null);
      loadOwners();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thay đổi gói');
    }
  };

  const topRevenueData = useMemo(() => overviewStats?.top5Restaurants || [], [overviewStats?.top5Restaurants]);

  return (
    <div className="space-y-6 px-4">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Quản trị hệ thống SaaS</h1>
          <p className="text-gray-500 text-sm">Quản lý tài khoản chi nhánh, xem thống kê doanh số toàn hệ thống.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <Button 
          variant={activeTab === 'restaurants' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('restaurants')}
          className={`rounded-lg px-4 font-semibold text-sm ${activeTab === 'restaurants' ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'text-gray-600'}`}
        >
          <Store className="w-4 h-4 mr-1.5" />
          Danh sách nhà hàng
        </Button>
        <Button 
          variant={activeTab === 'owners' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('owners')}
          className={`rounded-lg px-4 font-semibold text-sm ${activeTab === 'owners' ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'text-gray-600'}`}
        >
          <Users className="w-4 h-4 mr-1.5" />
          Chủ nhà hàng
        </Button>
        <Button 
          variant={activeTab === 'stats' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('stats')}
          className={`rounded-lg px-4 font-semibold text-sm ${activeTab === 'stats' ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'text-gray-600'}`}
        >
          <LayoutDashboard className="w-4 h-4 mr-1.5" />
          Thống kê SaaS
        </Button>
        <Button 
          variant={activeTab === 'plans' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('plans')}
          className={`rounded-lg px-4 font-semibold text-sm ${activeTab === 'plans' ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' : 'text-gray-600'}`}
        >
          <Key className="w-4 h-4 mr-1.5" />
          Gói dịch vụ
        </Button>
      </div>

      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-2 w-full sm:max-w-md">
              <Input 
                placeholder="Tìm kiếm tên, email, địa chỉ..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="rounded-xl flex-1"
              />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="w-36 rounded-xl bg-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value={RestaurantStatus.ACTIVE}>Hoạt động</SelectItem>
                  <SelectItem value={RestaurantStatus.INACTIVE}>Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenRestModal()} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">
              <Plus className="w-4 h-4 mr-1.5" /> Thêm nhà hàng mới
            </Button>
          </div>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              {isLoadingRestaurants ? (
                <div className="flex py-16 justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tên nhà hàng</TableHead>
                      <TableHead className="text-xs">Chủ sở hữu</TableHead>
                      <TableHead className="text-xs">Username</TableHead>
                      <TableHead className="text-xs">Email / Điện thoại</TableHead>
                      <TableHead className="text-xs">Hoạt động</TableHead>
                      <TableHead className="text-right text-xs">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {restaurants.map((rest) => (
                      <TableRow key={rest.id || (rest as any)._id}>
                        <TableCell className="font-bold text-xs text-gray-900">{rest.name}</TableCell>
                        <TableCell className="text-xs text-gray-800">{rest.ownerName}</TableCell>
                        <TableCell className="text-xs text-gray-600 font-mono">{rest.username}</TableCell>
                        <TableCell className="text-xs text-gray-500 space-y-0.5">
                          <span className="block">{rest.email}</span>
                          <span className="block">{rest.phone}</span>
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={rest.status === RestaurantStatus.ACTIVE} 
                            onCheckedChange={() => handleToggleActive(rest.id || (rest as any)._id, rest.status)} 
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenRestModal(rest)} className="text-gray-600 hover:text-green-600 h-8 w-8"><Edit2 className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleOpenResetPwModal(rest)} className="text-gray-600 hover:text-blue-600 h-8 w-8"><Key className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {restaurants.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">Không tìm thấy chi nhánh nào</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {isLoadingStats ? (
            <div className="flex py-16 justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : (
            <>
              {/* SaaS cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Chi nhánh đang hoạt động</CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-600 flex items-center gap-1.5">
                      <CheckCircle className="w-7 h-7 text-green-500" />
                      {overviewStats?.totalActive || 0} chi nhánh
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Chi nhánh tạm dừng/khóa</CardDescription>
                    <CardTitle className="text-3xl font-bold text-red-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-7 h-7 text-red-400" />
                      {overviewStats?.totalInactive || 0} chi nhánh
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Doanh thu subscription</CardDescription>
                    <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-1.5">
                      <CreditCard className="w-6 h-6 text-emerald-500" />
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subscriptionRevenue?.totalRevenue || 0)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Doanh thu tháng này</CardDescription>
                    <CardTitle className="text-2xl font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subscriptionRevenue?.monthRevenue || 0)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="shadow-sm border-gray-100">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs">Giao dịch subscription</CardDescription>
                    <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-1.5">
                      <ReceiptText className="w-6 h-6 text-slate-500" />
                      {subscriptionRevenue?.paidCount || 0} paid
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Pending: {subscriptionRevenue?.pendingCount || 0} | Cancelled: {subscriptionRevenue?.cancelledCount || 0}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Chart */}
              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Top 5 Chi nhánh có doanh số cao nhất (Toàn bộ thời gian)</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  {topRevenueData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-gray-400 text-xs">Chưa có dữ liệu giao dịch</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={topRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                        <YAxis stroke="#9ca3af" fontSize={11} />
                        <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))} />
                        <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Giao dịch thanh toán gói gần đây</CardTitle>
                  <CardDescription className="text-xs">Nguồn doanh thu chỉ tính PaymentTransaction có trạng thái PAID.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">OrderCode</TableHead>
                        <TableHead className="text-xs">Owner</TableHead>
                        <TableHead className="text-xs">Gói</TableHead>
                        <TableHead className="text-xs">Số tiền</TableHead>
                        <TableHead className="text-xs">Trạng thái</TableHead>
                        <TableHead className="text-xs">Thời gian</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(subscriptionRevenue?.transactions || []).slice(0, 8).map((transaction: any) => (
                        <TableRow key={transaction.id || transaction.orderCode}>
                          <TableCell className="text-xs font-mono">{transaction.orderCode}</TableCell>
                          <TableCell className="text-xs">{transaction.owner?.fullName || transaction.owner?.username || '---'}</TableCell>
                          <TableCell className="text-xs font-bold">{transaction.plan?.code || '---'}</TableCell>
                          <TableCell className="text-xs font-semibold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount || 0)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              transaction.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700'
                                : transaction.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-gray-500">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('vi-VN') : '---'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!subscriptionRevenue?.transactions || subscriptionRevenue.transactions.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-400 py-8 text-sm">Chưa có giao dịch subscription</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'owners' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex gap-2 w-full sm:max-w-md">
              <Input 
                placeholder="Tìm kiếm họ tên, email, điện thoại..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="rounded-xl flex-1"
              />
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
                <SelectTrigger className="w-36 rounded-xl bg-white">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Tạm khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleOpenOwnerModal()} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">
              <Plus className="w-4 h-4 mr-1.5" /> Thêm chủ nhà hàng mới
            </Button>
          </div>

          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              {isLoadingOwners ? (
                <div className="flex py-16 justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Họ tên chủ nhà hàng</TableHead>
                      <TableHead className="text-xs">Tên đăng nhập</TableHead>
                      <TableHead className="text-xs">Email / Điện thoại</TableHead>
                      <TableHead className="text-xs">Xác thực email</TableHead>
                      <TableHead className="text-xs">Nhà hàng quản lý</TableHead>
                      <TableHead className="text-xs">Gói dịch vụ</TableHead>
                      <TableHead className="text-xs">Ngày đăng ký</TableHead>
                      <TableHead className="text-xs">Trạng thái</TableHead>
                      <TableHead className="text-right text-xs">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.map((owner) => (
                      <TableRow key={owner.id || (owner as any)._id}>
                        <TableCell className="font-bold text-xs text-gray-900">{owner.fullName}</TableCell>
                        <TableCell className="text-xs text-gray-600 font-mono">{owner.username}</TableCell>
                        <TableCell className="text-xs text-gray-500 space-y-0.5">
                          <span className="block">{owner.email}</span>
                          <span className="block">{owner.phone}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            owner.isEmailVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {owner.isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (owner.restaurantsCount || 0) > 0
                                ? 'bg-green-50 text-green-700 border border-green-150'
                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}>
                              {owner.restaurantsCount || 0} chi nhánh
                            </span>
                            {owner.restaurants && owner.restaurants.length > 0 && (
                              <span className="block text-[10px] text-slate-400 truncate max-w-[180px] font-medium" title={owner.restaurants.join(', ')}>
                                {owner.restaurants.join(', ')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              owner.planCode === 'PRO'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                                : owner.planCode === 'PLUS'
                                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {owner.planName || 'Starter / FREE'}
                            </span>
                            <span className="block text-[9px] font-mono text-slate-400 uppercase">
                              {owner.subscriptionStatus === 'ACTIVE' ? 'Đang kích hoạt' : 'Chờ thanh toán'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('vi-VN') : '---'}
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={owner.isActive} 
                            onCheckedChange={() => handleToggleOwnerActive(owner.id || (owner as any)._id)} 
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button size="sm" variant="outline" onClick={() => handleOpenOverrideModal(owner)} className="text-emerald-700 border-emerald-200/50 hover:bg-emerald-50 h-8 text-[11px] font-bold rounded-xl"><UserCheck className="w-3.5 h-3.5 mr-1" /> Đổi gói</Button>
                          <Button size="icon" variant="ghost" onClick={() => handleOpenOwnerModal(owner)} className="text-gray-600 hover:text-green-600 h-8 w-8"><Edit2 className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => handleOpenResetOwnerPwModal(owner)} className="text-gray-600 hover:text-blue-600 h-8 w-8"><Key className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {owners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400 py-8 text-sm">Không tìm thấy chủ nhà hàng nào</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-800">Quản lý Gói dịch vụ SaaS</h2>
              <p className="text-xs text-gray-400 mt-0.5">Thêm, sửa, xóa, và điều chỉnh hạn mức tài nguyên cho các gói SaaS.</p>
            </div>
            <Button onClick={() => handleOpenPlanModal()} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">
              <Plus className="w-4 h-4 mr-1.5" /> Tạo gói mới
            </Button>
          </div>

          <Card className="shadow-sm border-gray-100 bg-white">
            <CardContent className="p-0">
              {isLoadingPlans ? (
                <div className="flex py-16 justify-center"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Tên gói / Mã</TableHead>
                      <TableHead className="text-xs">Giá tháng / năm</TableHead>
                      <TableHead className="text-xs">Hạn mức chi nhánh</TableHead>
                      <TableHead className="text-xs">Hạn mức bàn</TableHead>
                      <TableHead className="text-xs">Hạn mức món</TableHead>
                      <TableHead className="text-xs">Hạn mức nhân viên</TableHead>
                      <TableHead className="text-xs">Trạng thái</TableHead>
                      <TableHead className="text-right text-xs">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id || plan._id}>
                        <TableCell>
                          <div>
                            <span className="font-bold text-xs text-gray-900 block">{plan.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">{plan.code}</span>
                            {plan.isPopular && <span className="inline-block bg-amber-100 text-amber-800 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ml-1">HOT</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-gray-800 font-semibold space-y-0.5">
                          <span className="block">{plan.priceMonthly === 0 ? 'FREE' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceMonthly)} / tháng</span>
                          {plan.priceYearly > 0 && <span className="block text-[10px] text-slate-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.priceYearly)} / năm</span>}
                        </TableCell>
                        <TableCell className="text-xs text-gray-700">{plan.restaurantLimit === -1 ? 'Không giới hạn' : `${plan.restaurantLimit} chi nhánh`}</TableCell>
                        <TableCell className="text-xs text-gray-700">{plan.tableLimit === -1 ? 'Không giới hạn' : `${plan.tableLimit} bàn`}</TableCell>
                        <TableCell className="text-xs text-gray-700">{plan.menuItemLimit === -1 ? 'Không giới hạn' : `${plan.menuItemLimit} món`}</TableCell>
                        <TableCell className="text-xs text-gray-700">{plan.staffLimit === -1 ? 'Không giới hạn' : `${plan.staffLimit} nhân viên`}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={plan.isActive} 
                            onCheckedChange={() => handleTogglePlanActive(plan)} 
                          />
                        </TableCell>
                        <TableCell className="text-right space-x-1.5">
                          <Button size="icon" variant="ghost" onClick={() => handleOpenPlanModal(plan)} className="text-gray-600 hover:text-green-600 h-8 w-8"><Edit2 className="w-4 h-4" /></Button>
                          {plan.code !== 'FREE' && (
                            <Button size="icon" variant="ghost" onClick={() => handleDeletePlan(plan.id || plan._id)} className="text-gray-600 hover:text-red-600 h-8 w-8"><X className="w-4 h-4" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {plans.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400 py-8 text-sm">Không tìm thấy gói dịch vụ nào</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog 1: Add/Edit Restaurant Modal */}
      <Dialog open={isRestModalOpen} onOpenChange={setIsRestModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingRest ? 'Sửa thông tin chi nhánh' : 'Đăng ký nhà hàng mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Tạo mới nhà hàng SaaS. Mật khẩu tạm và tài khoản admin sẽ được tự động gửi qua email.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="resName" className="text-xs text-gray-600 font-semibold">Tên nhà hàng *</Label>
              <Input id="resName" value={restForm.name} onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="resUser" className="text-xs text-gray-600 font-semibold">Username Admin *</Label>
                <Input id="resUser" disabled={!!editingRest} value={restForm.username} onChange={(e) => setRestForm({ ...restForm, username: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="resPw" className="text-xs text-gray-600 font-semibold">Mật khẩu khởi tạo {editingRest ? '(Không đổi)' : '*'}</Label>
                <Input id="resPw" type="password" disabled={!!editingRest} value={restForm.password} onChange={(e) => setRestForm({ ...restForm, password: e.target.value })} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="resOwner" className="text-xs text-gray-600 font-semibold">Tên chủ sở hữu *</Label>
              <Input id="resOwner" value={restForm.ownerName} onChange={(e) => setRestForm({ ...restForm, ownerName: e.target.value })} className="rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="resEmail" className="text-xs text-gray-600 font-semibold">Email nhà hàng *</Label>
              <Input id="resEmail" type="email" placeholder="owner@restaurant.com" value={restForm.email} onChange={(e) => setRestForm({ ...restForm, email: e.target.value })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="resPhone" className="text-xs text-gray-600 font-semibold">Số điện thoại *</Label>
                <Input id="resPhone" placeholder="09xxxxxxxx" value={restForm.phone} onChange={(e) => setRestForm({ ...restForm, phone: e.target.value })} className="rounded-xl" />
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
              <Input id="resAddr" value={restForm.address} onChange={(e) => setRestForm({ ...restForm, address: e.target.value })} className="rounded-xl" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveRestaurant} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Lưu nhà hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Reset Restaurant Admin Password Modal */}
      <Dialog open={isResetPwModalOpen} onOpenChange={setIsResetPwModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu admin</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Khôi phục mật khẩu tạm cho nhà hàng {selectedRestForPwReset?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="newPwRest" className="text-xs text-gray-600 font-semibold">Mật khẩu mới *</Label>
              <Input id="newPwRest" type="password" placeholder="Tối thiểu 6 ký tự" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPwModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleResetPassword} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Đặt lại mật khẩu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Add/Edit Owner Modal */}
      <Dialog open={isOwnerModalOpen} onOpenChange={setIsOwnerModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingOwner ? 'Sửa thông tin chủ nhà hàng' : 'Thêm chủ nhà hàng mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Tạo tài khoản Chủ nhà hàng (Owner) để bắt đầu sử dụng dịch vụ.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <Label htmlFor="ownerFullName" className="text-xs text-gray-600 font-semibold">Họ tên chủ nhà hàng *</Label>
              <Input id="ownerFullName" value={ownerForm.fullName} onChange={(e) => setOwnerForm({ ...ownerForm, fullName: e.target.value })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ownerUser" className="text-xs text-gray-600 font-semibold">Username *</Label>
                <Input id="ownerUser" disabled={!!editingOwner} value={ownerForm.username} onChange={(e) => setOwnerForm({ ...ownerForm, username: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ownerPw" className="text-xs text-gray-600 font-semibold">Mật khẩu {editingOwner ? '(Không đổi)' : '*'}</Label>
                <Input id="ownerPw" type="password" disabled={!!editingOwner} value={ownerForm.password} onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })} className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="ownerEmail" className="text-xs text-gray-600 font-semibold">Email *</Label>
              <Input id="ownerEmail" type="email" placeholder="owner@gmail.com" value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ownerPhone" className="text-xs text-gray-600 font-semibold">Số điện thoại *</Label>
                <Input id="ownerPhone" placeholder="09xxxxxxxx" value={ownerForm.phone} onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-gray-600 font-semibold">Trạng thái hoạt động</Label>
                <Select 
                  value={ownerForm.isActive ? "ACTIVE" : "INACTIVE"} 
                  onValueChange={(val) => setOwnerForm({ ...ownerForm, isActive: val === "ACTIVE" })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ACTIVE">Hoạt động (Active)</SelectItem>
                    <SelectItem value="INACTIVE">Tạm khóa (Inactive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOwnerModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleSaveOwner} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/10">Lưu chủ nhà hàng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 4: Reset Owner Password Modal */}
      <Dialog open={isResetOwnerPwModalOpen} onOpenChange={setIsResetOwnerPwModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu chủ nhà hàng</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Khôi phục mật khẩu cho tài khoản {selectedOwnerForPwReset?.fullName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Label htmlFor="newPwOwner" className="text-xs text-gray-600 font-semibold">Mật khẩu mới *</Label>
              <Input id="newPwOwner" type="password" placeholder="Tối thiểu 6 ký tự" value={newOwnerPassword} onChange={(e) => setNewOwnerPassword(e.target.value)} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetOwnerPwModalOpen(false)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleResetOwnerPassword} className="bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold">Đặt lại mật khẩu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 5: Add/Edit SaaS Plan Modal */}
      <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Sửa gói dịch vụ' : 'Tạo gói dịch vụ mới'}</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Thiết lập cấu hình giá, hạn mức tài nguyên và tính năng cho gói SaaS.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePlan} className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="planName" className="text-xs text-gray-600 font-semibold">Tên gói *</Label>
                <Input id="planName" placeholder="Gói Gold" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="rounded-xl" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planCode" className="text-xs text-gray-600 font-semibold">Mã gói *</Label>
                <Input id="planCode" placeholder="GOLD" disabled={editingPlan?.code === 'FREE'} value={planForm.code} onChange={(e) => setPlanForm({ ...planForm, code: e.target.value.replace(/\s+/g, '').toUpperCase() })} className="rounded-xl" required />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="planDesc" className="text-xs text-gray-600 font-semibold">Mô tả gói</Label>
              <Input id="planDesc" placeholder="Gói tối ưu cho chuỗi nhà hàng lớn" value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="planPriceM" className="text-xs text-gray-600 font-semibold">Giá theo tháng (VNĐ) *</Label>
                <Input id="planPriceM" type="number" min="0" value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })} className="rounded-xl" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="planPriceY" className="text-xs text-gray-600 font-semibold">Giá theo năm (VNĐ) *</Label>
                <Input id="planPriceY" type="number" min="0" value={planForm.priceYearly} onChange={(e) => setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })} className="rounded-xl" required />
              </div>
            </div>

            <div className="border-t border-slate-100 my-4 pt-3 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Giới hạn tài nguyên (-1 = Không giới hạn)</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="planResL" className="text-xs text-gray-600 font-semibold">Hạn mức chi nhánh</Label>
                  <Input id="planResL" type="number" min="-1" value={planForm.restaurantLimit} onChange={(e) => setPlanForm({ ...planForm, restaurantLimit: Number(e.target.value) })} className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="planTableL" className="text-xs text-gray-600 font-semibold">Hạn mức bàn ăn</Label>
                  <Input id="planTableL" type="number" min="-1" value={planForm.tableLimit} onChange={(e) => setPlanForm({ ...planForm, tableLimit: Number(e.target.value) })} className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="planMenuL" className="text-xs text-gray-600 font-semibold">Hạn mức món ăn</Label>
                  <Input id="planMenuL" type="number" min="-1" value={planForm.menuItemLimit} onChange={(e) => setPlanForm({ ...planForm, menuItemLimit: Number(e.target.value) })} className="rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="planStaffL" className="text-xs text-gray-600 font-semibold">Hạn mức nhân viên</Label>
                  <Input id="planStaffL" type="number" min="-1" value={planForm.staffLimit} onChange={(e) => setPlanForm({ ...planForm, staffLimit: Number(e.target.value) })} className="rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="planFeats" className="text-xs text-gray-600 font-semibold">Tính năng (phân tách bằng dấu phẩy) *</Label>
              <Input id="planFeats" placeholder="QR menu, Analytics nâng cao, Báo cáo Excel" value={planForm.featuresText} onChange={(e) => setPlanForm({ ...planForm, featuresText: e.target.value })} className="rounded-xl" required />
            </div>

            <div className="space-y-1">
              <Label htmlFor="planUnavailableFeats" className="text-xs text-gray-600 font-semibold">Tính năng không bao gồm</Label>
              <Input id="planUnavailableFeats" placeholder="Hỗ trợ riêng, API nâng cao" value={planForm.unavailableFeaturesText} onChange={(e) => setPlanForm({ ...planForm, unavailableFeaturesText: e.target.value })} className="rounded-xl" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="planSortOrder" className="text-xs text-gray-600 font-semibold">Thứ tự hiển thị</Label>
              <Input id="planSortOrder" type="number" min="0" value={planForm.sortOrder} onChange={(e) => setPlanForm({ ...planForm, sortOrder: Number(e.target.value) })} className="rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <Switch checked={planForm.isPopular} onCheckedChange={(val) => setPlanForm({ ...planForm, isPopular: val })} id="planPop" />
                <Label htmlFor="planPop" className="text-xs text-gray-600 font-semibold">Phổ biến nhất</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={planForm.isActive} onCheckedChange={(val) => setPlanForm({ ...planForm, isActive: val })} id="planAct" />
                <Label htmlFor="planAct" className="text-xs text-gray-600 font-semibold">Kích hoạt bán gói</Label>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsPlanModalOpen(false)} className="rounded-xl">Hủy</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md">Lưu gói dịch vụ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog 6: Manual Owner Plan Override Modal */}
      <Dialog open={isOwnerPlanOverrideModalOpen} onOpenChange={setIsOwnerPlanOverrideModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Đổi gói dịch vụ của Chủ nhà hàng</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Thay đổi gói dịch vụ, trạng thái và ngày hết hạn thủ công cho <strong>{selectedOwnerForPlanOverride?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleOverrideOwnerPlan} className="space-y-4 py-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600 font-semibold">Chọn gói dịch vụ mới *</Label>
              <Select value={overrideForm.planId} onValueChange={(val) => setOverrideForm({ ...overrideForm, planId: val || '' })}>
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
                <Select value={overrideForm.status} onValueChange={(val) => setOverrideForm({ ...overrideForm, status: val || 'ACTIVE' })}>
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
                <Input id="overrideDate" type="date" value={overrideForm.expiresAt} onChange={(e) => setOverrideForm({ ...overrideForm, expiresAt: e.target.value })} className="rounded-xl" />
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={() => setIsOwnerPlanOverrideModalOpen(false)} className="rounded-xl">Hủy</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md">Đồng ý thay đổi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
