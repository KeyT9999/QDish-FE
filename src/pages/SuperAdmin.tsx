import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Restaurant, RestaurantStatus, OverviewStats, Owner, CreateOwnerPayload, NewRestaurantPayload } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { ownerService } from '@/services/ownerService';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Store, Users, Key, Bell } from 'lucide-react';
import { toast } from 'sonner';

// Import Tabs
import { SuperAdminStatsTab } from '@/components/dashboard/super-admin/SuperAdminStatsTab';
import { RestaurantsTab } from '@/components/dashboard/super-admin/RestaurantsTab';
import { OwnersTab } from '@/components/dashboard/super-admin/OwnersTab';
import { PlansTab } from '@/components/dashboard/super-admin/PlansTab';
import { AdminNotificationsTab } from '@/components/dashboard/super-admin/AdminNotificationsTab';

// Import Modals
import { RestaurantModal } from '@/components/dashboard/super-admin/modals/RestaurantModal';
import { ResetPasswordModal } from '@/components/dashboard/super-admin/modals/ResetPasswordModal';
import { OwnerModal } from '@/components/dashboard/super-admin/modals/OwnerModal';
import { PlanModal } from '@/components/dashboard/super-admin/modals/PlanModal';
import { OwnerPlanOverrideModal } from '@/components/dashboard/super-admin/modals/OwnerPlanOverrideModal';

export const SuperAdmin: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryTab = searchParams.get('tab') as 'stats' | 'restaurants' | 'owners' | 'plans' | 'notifications' || 'restaurants';
  const activeTab = ['stats', 'restaurants', 'owners', 'plans', 'notifications'].includes(queryTab) ? queryTab : 'restaurants';
  const setActiveTab = (tab: 'stats' | 'restaurants' | 'owners' | 'plans' | 'notifications') => setSearchParams({ tab });

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

  // Modals Open/Close States
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);

  const [isResetPwModalOpen, setIsResetPwModalOpen] = useState(false);
  const [selectedRestForPwReset, setSelectedRestForPwReset] = useState<Restaurant | null>(null);

  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const [isResetOwnerPwModalOpen, setIsResetOwnerPwModalOpen] = useState(false);
  const [selectedOwnerForPwReset, setSelectedOwnerForPwReset] = useState<Owner | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  const [isOwnerPlanOverrideModalOpen, setIsOwnerPlanOverrideModalOpen] = useState(false);
  const [selectedOwnerForPlanOverride, setSelectedOwnerForPlanOverride] = useState<Owner | null>(null);

  // Fetch Data Functions
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

  // Modals Trigger Handlers
  const handleOpenRestModal = (item?: Restaurant) => {
    setEditingRest(item || null);
    setIsRestModalOpen(true);
  };

  const handleSaveRestaurant = async (payload: any) => {
    try {
      if (editingRest) {
        await restaurantService.update(editingRest.id || (editingRest as any)._id, {
          name: payload.name.trim(),
          ownerName: payload.ownerName.trim(),
          email: payload.email.trim(),
          address: payload.address.trim(),
          phone: payload.phone.trim(),
          status: payload.status
        });
        toast.success('Đã cập nhật thông tin nhà hàng thành công');
      } else {
        const payloadToSend: NewRestaurantPayload = {
          name: payload.name.trim(),
          username: payload.username.trim(),
          password: payload.password,
          ownerName: payload.ownerName.trim(),
          email: payload.email.trim(),
          address: payload.address.trim(),
          phone: payload.phone.trim(),
          status: payload.status
        };
        await restaurantService.create(payloadToSend);
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
    setIsResetPwModalOpen(true);
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!selectedRestForPwReset) return;
    try {
      await restaurantService.resetPassword(
        selectedRestForPwReset.id || (selectedRestForPwReset as any)._id,
        newPassword
      );
      toast.success(`Đã đặt lại mật khẩu thành công cho nhà hàng ${selectedRestForPwReset.name}`);
      setIsResetPwModalOpen(false);
      setSelectedRestForPwReset(null);
    } catch (err) {
      toast.error('Lỗi khi đặt lại mật khẩu');
    }
  };

  // Owner Handlers
  const handleOpenOwnerModal = (item?: Owner) => {
    setEditingOwner(item || null);
    setIsOwnerModalOpen(true);
  };

  const handleSaveOwner = async (payload: any) => {
    try {
      if (editingOwner) {
        await ownerService.update(editingOwner.id || (editingOwner as any)._id, {
          fullName: payload.fullName.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          isActive: payload.isActive
        });
        toast.success('Đã cập nhật thông tin chủ nhà hàng thành công');
      } else {
        const payloadToSend: CreateOwnerPayload = {
          fullName: payload.fullName.trim(),
          username: payload.username.trim(),
          password: payload.password,
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          isActive: payload.isActive
        };
        await ownerService.create(payloadToSend);
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
    setIsResetOwnerPwModalOpen(true);
  };

  const handleResetOwnerPassword = async (newPassword: string) => {
    if (!selectedOwnerForPwReset) return;
    try {
      await ownerService.resetPassword(
        selectedOwnerForPwReset.id || (selectedOwnerForPwReset as any)._id,
        newPassword
      );
      toast.success(`Đã đặt lại mật khẩu thành công cho ${selectedOwnerForPwReset.fullName}`);
      setIsResetOwnerPwModalOpen(false);
      setSelectedOwnerForPwReset(null);
    } catch (err) {
      toast.error('Lỗi khi đặt lại mật khẩu chủ nhà hàng');
    }
  };

  // SaaS Plans Handlers
  const handleOpenPlanModal = (item?: any) => {
    setEditingPlan(item || null);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (payload: any) => {
    try {
      const { planService } = await import('@/services/planService');
      if (editingPlan) {
        await planService.adminUpdatePlan(editingPlan.id || editingPlan._id, payload);
        toast.success('Đã cập nhật gói dịch vụ thành công');
      } else {
        await planService.adminCreatePlan(payload);
        toast.success('Đã tạo gói dịch vụ mới thành công!');
      }
      setIsPlanModalOpen(false);
      setEditingPlan(null);
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

  // Override Subscription Handlers
  const handleOpenOverrideModal = (owner: Owner) => {
    setSelectedOwnerForPlanOverride(owner);
    setIsOwnerPlanOverrideModalOpen(true);
  };

  const handleOverrideOwnerPlan = async (planId: string, status: string, expiresAt: string) => {
    if (!selectedOwnerForPlanOverride) return;
    try {
      const { subscriptionService } = await import('@/services/subscriptionService');
      await subscriptionService.adminChangeOwnerPlan(
        selectedOwnerForPlanOverride.id || (selectedOwnerForPlanOverride as any)._id,
        planId,
        status,
        expiresAt || undefined
      );
      toast.success(`Đã thay đổi gói dịch vụ thành công cho ${selectedOwnerForPlanOverride.fullName}`);
      setIsOwnerPlanOverrideModalOpen(false);
      setSelectedOwnerForPlanOverride(null);
      loadOwners();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi thay đổi gói');
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Quản trị hệ thống SaaS</h1>
          <p className="text-gray-500 text-sm">Quản lý tài khoản chi nhánh, xem thống kê doanh số toàn hệ thống.</p>
        </div>
      </div>

      {/* Tabs list Navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-3 flex-wrap">
        <Button 
          variant={activeTab === 'restaurants' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('restaurants')}
          className={`rounded-lg px-4 font-semibold text-sm ${
            activeTab === 'restaurants' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          <Store className="w-4 h-4 mr-1.5" />
          Danh sách nhà hàng
        </Button>
        <Button 
          variant={activeTab === 'owners' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('owners')}
          className={`rounded-lg px-4 font-semibold text-sm ${
            activeTab === 'owners' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          <Users className="w-4 h-4 mr-1.5" />
          Chủ nhà hàng
        </Button>
        <Button 
          variant={activeTab === 'stats' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('stats')}
          className={`rounded-lg px-4 font-semibold text-sm ${
            activeTab === 'stats' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mr-1.5" />
          Thống kê SaaS
        </Button>
        <Button 
          variant={activeTab === 'plans' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('plans')}
          className={`rounded-lg px-4 font-semibold text-sm ${
            activeTab === 'plans' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          <Key className="w-4 h-4 mr-1.5" />
          Gói dịch vụ
        </Button>
        <Button 
          variant={activeTab === 'notifications' ? 'default' : 'ghost'} 
          onClick={() => setActiveTab('notifications')}
          className={`rounded-lg px-4 font-semibold text-sm ${
            activeTab === 'notifications' 
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm' 
              : 'text-gray-600'
          }`}
        >
          <Bell className="w-4 h-4 mr-1.5" />
          Thông báo
        </Button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'restaurants' && (
        <RestaurantsTab
          restaurants={restaurants}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoadingRestaurants}
          onAddClick={() => handleOpenRestModal()}
          onEditClick={handleOpenRestModal}
          onResetPwClick={handleOpenResetPwModal}
          onToggleActive={handleToggleActive}
        />
      )}

      {activeTab === 'owners' && (
        <OwnersTab
          owners={owners}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isLoading={isLoadingOwners}
          onAddClick={() => handleOpenOwnerModal()}
          onEditClick={handleOpenOwnerModal}
          onResetPwClick={handleOpenResetOwnerPwModal}
          onOverrideClick={handleOpenOverrideModal}
          onToggleActive={handleToggleOwnerActive}
        />
      )}

      {activeTab === 'stats' && (
        <SuperAdminStatsTab
          overviewStats={overviewStats}
          subscriptionRevenue={subscriptionRevenue}
          isLoadingStats={isLoadingStats}
        />
      )}

      {activeTab === 'plans' && (
        <PlansTab
          plans={plans}
          isLoading={isLoadingPlans}
          onAddClick={() => handleOpenPlanModal()}
          onEditClick={handleOpenPlanModal}
          onDeleteClick={handleDeletePlan}
          onToggleActive={handleTogglePlanActive}
        />
      )}

      {activeTab === 'notifications' && (
        <AdminNotificationsTab />
      )}

      {/* Modals Rendering */}
      <RestaurantModal
        open={isRestModalOpen}
        onOpenChange={setIsRestModalOpen}
        editingRest={editingRest}
        onSave={handleSaveRestaurant}
      />

      <ResetPasswordModal
        open={isResetPwModalOpen}
        onOpenChange={setIsResetPwModalOpen}
        targetName={`nhà hàng ${selectedRestForPwReset?.name || ''}`}
        onReset={handleResetPassword}
      />

      <OwnerModal
        open={isOwnerModalOpen}
        onOpenChange={setIsOwnerModalOpen}
        editingOwner={editingOwner}
        onSave={handleSaveOwner}
      />

      <ResetPasswordModal
        open={isResetOwnerPwModalOpen}
        onOpenChange={setIsResetOwnerPwModalOpen}
        targetName={`chủ nhà hàng ${selectedOwnerForPwReset?.fullName || ''}`}
        onReset={handleResetOwnerPassword}
      />

      <PlanModal
        open={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        editingPlan={editingPlan}
        onSave={handleSavePlan}
      />

      <OwnerPlanOverrideModal
        open={isOwnerPlanOverrideModalOpen}
        onOpenChange={setIsOwnerPlanOverrideModalOpen}
        owner={selectedOwnerForPlanOverride}
        plans={plans}
        onOverride={handleOverrideOwnerPlan}
      />
    </div>
  );
};
