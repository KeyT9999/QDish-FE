import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { token } = await authService.login({ username, password });
      const role = login(token);
      
      if (role === Role.SUPER_ADMIN) {
        navigate('/super-admin');
      } else if (role === Role.RESTAURANT_ADMIN) {
        navigate('/dashboard');
      } else if (role === Role.STAFF) {
        navigate('/staff');
      } else {
        setError('Tài khoản không có quyền truy cập hệ thống');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_20px_50px_rgba(15,118,110,0.06)] rounded-3xl p-8 sm:p-10 relative overflow-hidden"
    >
      {/* Decorative top green accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 tracking-wider uppercase mb-3">
          <Sparkles className="w-3 h-3" /> QDish Portal
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          Đăng nhập
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-[280px] mx-auto leading-relaxed">
          Dành cho quản lý nhà hàng, đối tác liên kết và nhân viên vận hành
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        
        {/* Username field */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-[13px] font-semibold text-slate-600">
            Tên đăng nhập
          </Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
              <User className="w-4.5 h-4.5" />
            </div>
            <Input 
              id="username" 
              type="text" 
              placeholder="Nhập tên tài khoản của bạn" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="pl-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-semibold text-slate-600">
              Mật khẩu
            </Label>
            <Link 
              to="/reset-password" 
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
              <Lock className="w-4.5 h-4.5" />
            </div>
            
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-11 pr-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
            />

            {/* Toggle show/hide password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Error Alert Display */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-rose-50/80 border border-rose-100/70 text-rose-700 p-4 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm shadow-rose-900/5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý đăng nhập...
              </>
            ) : (
              'Đăng nhập hệ thống'
            )}
          </Button>
        </div>

      </form>
      
      {/* Notice info */}
      <div className="text-center mt-6 text-[11px] text-slate-400">
        Bạn gặp sự cố tài khoản? Liên hệ <a href="mailto:support@qdish.com" className="text-slate-500 underline font-semibold">Bộ phận hỗ trợ</a>
      </div>

    </motion.div>
  );
};
