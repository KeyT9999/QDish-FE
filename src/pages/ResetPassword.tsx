import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldAlert, KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email tài khoản của bạn trước.');
      return;
    }
    setError(null);
    setIsSendingOtp(true);
    try {
      await authService.requestPasswordReset({ email });
      toast.success('Mã xác thực OTP đã được gửi! Vui lòng kiểm tra hòm thư của bạn.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi mã xác thực. Vui lòng kiểm tra lại email.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và mật khẩu xác nhận không trùng khớp.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hoàn tất đặt lại mật khẩu. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_20px_50px_rgba(15,118,110,0.06)] rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />
        
        <div className="pt-6 pb-6 space-y-5">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="w-18 h-18 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">Cập nhật thành công!</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Mật khẩu mới đã được lưu trữ an toàn. Đang tự động chuyển hướng bạn quay về trang đăng nhập...
            </p>
          </div>

          <div className="pt-4 max-w-[200px] mx-auto">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.2, ease: 'easeInOut' }}
                className="bg-emerald-500 h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_20px_50px_rgba(15,118,110,0.06)] rounded-3xl p-8 sm:p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />

      {/* Back link */}
      <div className="mb-6 relative z-10">
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Quay lại đăng nhập
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative">
        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          Đặt lại mật khẩu
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-[290px] mx-auto leading-relaxed">
          Nhập địa chỉ email đăng ký để nhận mã xác thực OTP thiết lập mật khẩu mới
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        
        {/* Email field with inline OTP Send Button */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[13px] font-semibold text-slate-600">
            Email tài khoản
          </Label>
          <div className="flex gap-2 relative">
            <div className="relative flex-1 group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
              />
            </div>
            
            <Button 
              type="button" 
              disabled={isSendingOtp || !email}
              onClick={handleSendOtp}
              className="shrink-0 h-12 px-4 border border-emerald-500/20 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-xs transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-700/5 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSendingOtp ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" /> Gửi mã OTP
                </>
              )}
            </Button>
          </div>
        </div>

        {/* OTP Code field */}
        <div className="space-y-1.5">
          <Label htmlFor="otp" className="text-[13px] font-semibold text-slate-600">
            Mã OTP xác nhận
          </Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <Input 
              id="otp" 
              type="text" 
              placeholder="Nhập mã OTP 6 chữ số vừa nhận" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="pl-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
            />
          </div>
        </div>

        {/* New Password field */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword" className="text-[13px] font-semibold text-slate-600">
            Mật khẩu mới
          </Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
              <Lock className="w-4.5 h-4.5" />
            </div>
            
            <Input 
              id="newPassword" 
              type={showNewPassword ? "text" : "password"} 
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="pl-11 pr-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password field */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-[13px] font-semibold text-slate-600">
            Xác nhận mật khẩu mới
          </Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
              <Lock className="w-4.5 h-4.5" />
            </div>
            
            <Input 
              id="confirmPassword" 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Nhập lại chính xác mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-11 pr-11 h-12 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer z-10"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
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
                Đang tiến hành đặt lại mật khẩu...
              </>
            ) : (
              'Cập nhật mật khẩu mới'
            )}
          </Button>
        </div>

      </form>
    </motion.div>
  );
};
