import React from 'react';
import { Outlet } from 'react-router-dom';
import { QDishLogo } from '../shared/QDishLogo';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <QDishLogo size="lg" className="mb-6" />
        <h2 className="mt-2 text-center text-3xl font-heading font-extrabold text-gray-900">
          Hệ sinh thái QDish
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Quản lý nhà hàng thông minh & dinh dưỡng
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
