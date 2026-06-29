import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Read redirected state from register owner
  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  // Load/initialize Google Sign-in for Login
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    const initGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId || 'MOCK_CLIENT_ID',
          callback: handleGoogleLoginResponse,
        });

        const btnContainer = document.getElementById('google-login-button');
        if (btnContainer && clientId) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 350,
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleLoginResponse = async (response: any) => {
    const token = response.credential;
    if (!token) return;

    setError(null);
    setIsLoading(true);

    try {
      const { token: jwtToken } = await authService.googleLogin({ googleToken: token });
      const role = login(jwtToken);
      toast.success('Đăng nhập bằng Google thành công!');

      if (role === Role.SUPER_ADMIN) {
        navigate('/super-admin');
      } else if (role === Role.RESTAURANT_ADMIN) {
        navigate('/dashboard');
      } else if (role === Role.STAFF) {
        navigate('/staff');
      } else if (role === Role.RESTAURANT_OWNER) {
        navigate('/owner');
      } else {
        setError('Tài khoản không có quyền truy cập hệ thống');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập bằng Google thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    const mockEmailInput = prompt("Nhập email Google của tài khoản đã đăng ký (Ví dụ: testowner_1234):");
    if (!mockEmailInput) return;
    
    // Auto add domain if they just enter username
    const formattedEmail = mockEmailInput.includes('@') ? mockEmailInput.split('@')[0] : mockEmailInput;
    const mockToken = `mock-google-token-${formattedEmail.trim()}`;
    handleGoogleLoginResponse({ credential: mockToken });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { token } = await authService.login({ username: username.trim(), password });
      const role = login(token);
      
      if (role === Role.SUPER_ADMIN) {
        navigate('/super-admin');
      } else if (role === Role.RESTAURANT_ADMIN) {
        navigate('/dashboard');
      } else if (role === Role.STAFF) {
        navigate('/staff');
      } else if (role === Role.RESTAURANT_OWNER) {
        navigate('/owner');
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

      {/* Google Login Options */}
      <div className="space-y-4 mb-5">
        <div className="flex flex-col gap-2.5">
          <div id="google-login-button" className="w-full flex justify-center min-h-[40px]" />
          
          {/* Mock Google Login button for development */}
          {(!import.meta.env.VITE_GOOGLE_CLIENT_ID) && (
            <button
              type="button"
              onClick={handleMockGoogleLogin}
              className="w-full h-11 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm"
            >
              <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.19-5.136 4.19A5.69 5.69 0 0 1 8.24 12a5.69 5.69 0 0 1 5.75-5.59c1.47 0 2.82.52 3.89 1.52l2.46-2.46C18.83 4.03 16.54 3 13.99 3 9.02 3 5 7.03 5 12s4.02 9 8.99 9c4.97 0 8.25-3.46 8.25-8.4 0-.58-.06-1.12-.17-1.615H12.24Z" />
              </svg>
              Đăng nhập nhanh bằng Google (Mock)
            </button>
          )}
        </div>
        
        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <span className="relative px-3 bg-white text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Hoặc dùng tài khoản hệ thống
          </span>
        </div>
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

      {/* Link to register-owner */}
      <div className="text-center mt-5 text-[13px] text-slate-500 font-medium">
        Bạn là chủ nhà hàng mới?{' '}
        <Link to="/register-owner" className="text-emerald-600 hover:text-emerald-500 font-bold underline">
          Đăng ký đối tác tại đây
        </Link>
      </div>
      
      {/* Notice info */}
      <div className="text-center mt-6 text-[11px] text-slate-400">
        Bạn gặp sự cố tài khoản? Liên hệ <a href="mailto:support@qdish.com" className="text-slate-500 underline font-semibold">Bộ phận hỗ trợ</a>
      </div>

    </motion.div>
  );
};
