import React from 'react';
import { Outlet } from 'react-router-dom';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface md:bg-gray-100">
      <div className="w-full max-w-md mx-auto min-h-screen bg-surface shadow-2xl overflow-hidden relative pb-24">
        <Outlet />
      </div>
    </div>
  );
};
