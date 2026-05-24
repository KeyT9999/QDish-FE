import React from 'react';
import { Outlet } from 'react-router-dom';
import { QDishLogo } from '../shared/QDishLogo';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ChefHat, QrCode, ShieldCheck } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-50/40 text-slate-800 font-sans lg:grid lg:grid-cols-12 overflow-hidden relative">
      
      {/* BACKGROUND DECORATIVE GLOWS (Global) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-100/30 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] rounded-full bg-amber-50/40 blur-[100px] pointer-events-none z-0" />

      {/* LEFT PANEL: BRANDING & INTERACTIVE PREVIEWS (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-b from-white to-slate-50/50 border-r border-slate-200/50 overflow-hidden z-10">
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:18px_18px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,white_60%,transparent_100%)] pointer-events-none" />

        {/* Top Section: Logo & Badges */}
        <div className="relative space-y-8">
          <QDishLogo size="lg" className="hover:scale-105 transition-transform duration-300" />
          
          <div className="space-y-4 max-w-sm mt-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">
              <Sparkles className="w-3 h-3" /> Nutrition Tech
            </div>
            
            <h1 className="text-3xl xl:text-4xl font-heading font-bold text-slate-900 tracking-tight leading-[1.15]">
              Hệ sinh thái quản lý <br/>
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">nhà hàng thông minh</span>
            </h1>
            
            <p className="text-slate-500 text-sm leading-relaxed">
              Giải pháp toàn diện kết hợp QR Ordering tối giản và Trí tuệ nhân tạo phân tích Dinh dưỡng thực đơn nhằm nâng tầm dịch vụ ẩm thực hiện đại.
            </p>
          </div>
        </div>

        {/* Middle Section: Floating Interactive Showcases */}
        <div className="relative my-auto flex flex-col items-center justify-center h-[340px] w-full">
          {/* Decorative radial circle behind cards */}
          <div className="absolute w-[260px] h-[260px] rounded-full bg-emerald-50/50 border border-emerald-100/30 flex items-center justify-center">
            <div className="w-[180px] h-[180px] rounded-full bg-white shadow-inner flex items-center justify-center border border-slate-100">
              <Activity className="w-12 h-12 text-emerald-500/20 animate-pulse" />
            </div>
          </div>

          {/* Floating Card 1: Nutrition Insights */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: [0, -10, 0],
              opacity: 1
            }}
            transition={{
              y: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              },
              opacity: { duration: 0.8 }
            }}
            className="absolute top-2 -left-4 xl:-left-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 max-w-[230px] z-20 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Smart Nutrition</h4>
                <p className="text-xs font-bold text-slate-800">Premium Salmon Salad</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Calories</span>
                <span className="font-semibold text-emerald-600">420 kcal</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[70%]" />
              </div>

              <div className="flex gap-1.5 pt-1">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100/30">Protein High</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-100/30">Eco A+</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Card 2: QR Code Order */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ 
              y: [0, 12, 0],
              opacity: 1
            }}
            transition={{
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              },
              opacity: { duration: 0.8, delay: 0.2 }
            }}
            className="absolute bottom-6 -right-4 xl:-right-8 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-100 max-w-[235px] z-10 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-green-50 text-green-600">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Live Order</h4>
                <p className="text-xs font-bold text-slate-800">Bàn 04 • QDish QR</p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                <span>1x Phở Bò Wagyu</span>
                <span className="font-semibold text-slate-800">$18.90</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Đang chế biến
                </span>
                <span className="text-[10px] text-slate-400">2 phút trước</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Footer metrics */}
        <div className="relative flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-6">
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> ISO 27001 Secured
          </span>
          <span>© 2026 QDish Ecosystem</span>
        </div>
      </div>

      {/* RIGHT PANEL: MAIN FORM CARD CONTAINER */}
      <div className="col-span-12 lg:col-span-7 flex flex-col min-h-screen relative z-10">
        
        {/* Mobile Header: Logo (visible only on small/medium screens) */}
        <div className="lg:hidden w-full px-6 pt-8 pb-4 flex flex-col items-center justify-center">
          <QDishLogo size="lg" className="mb-2" />
          <h2 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
            Hệ sinh thái QDish
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý nhà hàng thông minh & dinh dưỡng
          </p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[450px]">
            <Outlet />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden w-full text-center py-6 text-xs text-slate-400 border-t border-slate-100">
          <span>© 2026 QDish Ecosystem • Bảo mật thông tin</span>
        </div>
      </div>

    </div>
  );
};
