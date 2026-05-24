import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QDishLogo } from '../shared/QDishLogo';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  ClipboardList, 
  UtensilsCrossed, 
  FileText, 
  QrCode, 
  Users, 
  Settings, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  Bell, 
  ChevronDown, 
  User, 
  Building2, 
  Store, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Role } from '@/types';
import { restaurantService } from '@/services/restaurantService';
import { toast } from 'sonner';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Nhà hàng QDish');
  const [showBranches, setShowBranches] = useState(false);

  useEffect(() => {
    if (user?.role === Role.RESTAURANT_ADMIN && user.restaurantId) {
      restaurantService.getSettings()
        .then(data => {
          if (data && data.name) {
            setRestaurantName(data.name);
          }
        })
        .catch(() => {
          // Fallback to default
        });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/login');
  };

  const currentTab = searchParams.get('tab') || '';

  // Configure Sidebar Menu Items based on role
  const getMenuItems = () => {
    if (user?.role === Role.RESTAURANT_ADMIN) {
      return [
        { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'orders', label: 'Đơn hàng', icon: ClipboardList },
        { id: 'menu', label: 'Thực đơn', icon: UtensilsCrossed },
        { id: 'categories', label: 'Danh mục', icon: FileText },
        { id: 'tables', label: 'Bàn & QR', icon: QrCode },
        { id: 'staff', label: 'Nhân viên', icon: Users },
        { id: 'settings', label: 'Thiết lập', icon: Settings },
      ];
    } else if (user?.role === Role.SUPER_ADMIN) {
      return [
        { id: 'stats', label: 'Thống kê SaaS', icon: LayoutDashboard },
        { id: 'restaurants', label: 'Chi nhánh', icon: Store },
      ];
    } else if (user?.role === Role.STAFF) {
      return [
        { id: 'orders', label: 'Đơn chế biến', icon: ClipboardList },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const handleTabClick = (tabId: string) => {
    setSearchParams({ tab: tabId });
    setIsMobileOpen(false);
  };

  // Determine current active tab label for breadcrumbs
  const getActiveTabLabel = () => {
    const activeItem = menuItems.find(item => item.id === currentTab);
    if (activeItem) return activeItem.label;
    
    // Default fallback based on path
    if (location.pathname === '/staff') return 'Đơn chế biến';
    if (location.pathname === '/super-admin') return 'Quản lý SaaS';
    return 'Tổng quan';
  };

  const roleName = user?.role === Role.SUPER_ADMIN ? 'Super Admin' 
                 : user?.role === Role.RESTAURANT_ADMIN ? 'Chủ nhà hàng'
                 : user?.role === Role.STAFF ? 'Nhân viên Bếp'
                 : 'Người dùng';

  // Render Sidebar Content (shared between Desktop & Mobile Drawer)
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-neutral-800">
      {/* Brand Logo & Header */}
      <div className="p-5 border-b border-neutral-100 flex items-center gap-3">
        <QDishLogo size="sm" />
        <div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">QDish</span>
          <span className="text-[10px] block font-medium text-neutral-400 -mt-1 uppercase tracking-wider">Console</span>
        </div>
      </div>

      {/* Restaurant Switcher (SaaS Multitenancy style) */}
      {user?.role === Role.RESTAURANT_ADMIN && (
        <div className="px-4 py-3 border-b border-neutral-100 relative">
          <button 
            onClick={() => setShowBranches(!showBranches)}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 transition-colors duration-200 text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold text-gray-900 truncate leading-snug">{restaurantName}</span>
                <span className="block text-[10px] text-neutral-500 font-medium">Chi nhánh chính</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
          </button>

          {showBranches && (
            <div className="absolute left-4 right-4 mt-1 bg-white border border-neutral-150 rounded-xl shadow-lg z-50 p-1.5 space-y-1">
              <div className="p-1 px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Chi nhánh khác</div>
              <button 
                onClick={() => { setShowBranches(false); toast.info('Tính năng đa chi nhánh đang chạy thử nghiệm.'); }}
                className="w-full text-left p-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center justify-between"
              >
                <span>QDish Low-Carb (Branch 2)</span>
                <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-medium">Offline</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Chức năng</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (!currentTab && item.id === (user?.role === Role.SUPER_ADMIN ? 'restaurants' : 'overview'));
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 relative ${
                isActive 
                  ? 'bg-green-50/60 text-green-700' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-green-600' : 'text-neutral-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-green-600 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer with Profile & Logout */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/40">
        <div className="flex items-center gap-3 mb-3 p-1.5 rounded-xl border border-neutral-100/50 bg-white shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-green-600/10">
            {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-gray-900 truncate leading-snug">{user?.username}</span>
            <span className="block text-[10px] text-neutral-500 font-medium truncate">{roleName}</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout} 
          className="w-full bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-neutral-200 rounded-xl text-xs font-bold py-2 shadow-sm transition-colors duration-200"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex text-neutral-800">
      {/* 1. Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 border-r border-neutral-200/60 bg-white flex-col shrink-0 fixed top-0 bottom-0 left-0 z-30">
        {renderSidebarContent()}
      </aside>

      {/* 2. Mobile Drawer Sidebar (Backdrop & Content Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm transition-opacity" 
          />
          {/* Drawer body */}
          <div className="relative w-64 bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300">
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg border border-neutral-100 hover:bg-neutral-50 text-neutral-500"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Topbar */}
        <header className="h-16 border-b border-neutral-200/60 bg-white px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm/5">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <MenuIcon className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
              <span>{user?.role === Role.SUPER_ADMIN ? 'Hệ thống' : 'Quản lý'}</span>
              <span className="text-neutral-300">/</span>
              <span className="text-gray-900 font-bold">{getActiveTabLabel()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Action buttons based on Role */}
            {user?.role === Role.RESTAURANT_ADMIN && user.restaurantId && (
              <a 
                href={`/order?r=${user.restaurantId}&t=1`} 
                target="_blank" 
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/40 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors duration-200 shadow-sm shadow-green-600/5"
              >
                <span>Xem Menu khách</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Notification bell */}
            <div className="relative">
              <button className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 text-neutral-500 relative transition-colors duration-200 shadow-sm/5">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse ring-2 ring-white" />
              </button>
            </div>

            {/* User Initials Badge (Top right) */}
            <div className="w-8 h-8 rounded-xl bg-neutral-100 border border-neutral-200/50 flex items-center justify-center font-bold text-xs text-neutral-700">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
            </div>
          </div>
        </header>

        {/* Content canvas container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
