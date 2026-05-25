import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import { AuthLayout } from '@/components/layout/AuthLayout';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Pages are split by route so heavy dashboard/chart code does not block first load.
const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const ResetPassword = lazy(() => import('@/pages/ResetPassword').then((module) => ({ default: module.ResetPassword })));
const CustomerMenu = lazy(() => import('@/pages/CustomerMenu').then((module) => ({ default: module.CustomerMenu })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const StaffDashboard = lazy(() => import('@/pages/StaffDashboard').then((module) => ({ default: module.StaffDashboard })));
const SuperAdmin = lazy(() => import('@/pages/SuperAdmin').then((module) => ({ default: module.SuperAdmin })));
const RegisterOwner = lazy(() => import('@/pages/RegisterOwner').then((module) => ({ default: module.RegisterOwner })));
const OwnerDashboard = lazy(() => import('@/pages/OwnerDashboard').then((module) => ({ default: module.OwnerDashboard })));
const Pricing = lazy(() => import('@/pages/Pricing').then((module) => ({ default: module.Pricing })));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess').then((module) => ({ default: module.PaymentSuccess })));
const PaymentCancel = lazy(() => import('@/pages/PaymentCancel').then((module) => ({ default: module.PaymentCancel })));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-semibold text-neutral-500">Đang tải...</div>}>
          <Routes>
             {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register-owner" element={<RegisterOwner />} />
            </Route>

            {/* Customer Route (No auth required) */}
            <Route element={<CustomerLayout />}>
              <Route path="/order" element={<CustomerMenu />} />
            </Route>

            {/* Public Pricing and Payment Success Routes */}
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancel" element={<PaymentCancel />} />

            {/* Dashboard Routes (Auth required) */}
            <Route element={<DashboardLayout />}>
              {/* Restaurant Admin */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={[Role.RESTAURANT_ADMIN]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={[Role.STAFF, Role.RESTAURANT_ADMIN]}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Super Admin */}
              <Route
                path="/super-admin"
                element={
                  <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
                    <SuperAdmin />
                  </ProtectedRoute>
                }
              />

              {/* Restaurant Owner */}
              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={[Role.RESTAURANT_OWNER]}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}

export default App;
