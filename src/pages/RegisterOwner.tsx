import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Phone, UserCheck, AlertCircle, Sparkles, KeyRound, RefreshCw, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

export const RegisterOwner: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // OTP State
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cooldown timer for OTP Resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!fullName.trim() || !email.trim() || !phone.trim() || !username.trim() || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Định dạng email không hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.requestOwnerOTP({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: username.trim(),
        password,
        confirmPassword
      });
      
      toast.success(response.message || 'Mã xác thực OTP đã được gửi đến email của bạn.');
      setStep(2);
      setResendCooldown(60); // Set 60s cooldown
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi yêu cầu gửi mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyOwnerOTP({
        email: email.trim().toLowerCase(),
        otp: otp.trim()
      });
      
      toast.success('Xác thực thành công! Tài khoản của bạn đã được khởi tạo.');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực OTP thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.resendOwnerOTP({
        email: email.trim().toLowerCase()
      });
      toast.success(response.message || 'Mã xác thực OTP mới đã được gửi.');
      setResendCooldown(60);
      setOtp('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-[0_20px_50px_rgba(15,118,110,0.06)] rounded-3xl p-8 sm:p-10 relative overflow-hidden max-w-lg w-full mx-auto animate-fade-in"
    >
      {/* Decorative top green accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />

      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="absolute top-5 left-5 inline-flex items-center gap-1 text-slate-500 hover:text-emerald-600 text-xs font-bold transition-colors duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-6 relative">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 tracking-wider uppercase mb-3">
          <Sparkles className="w-3 h-3" /> Đăng ký đối tác QDish
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          {step === 1 ? 'Đăng ký Chủ nhà hàng' : 'Xác thực tài khoản'}
        </h3>
        <p className="text-slate-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {step === 1 
            ? 'Tạo tài khoản Chủ nhà hàng để bắt đầu số hóa quy trình kinh doanh và đặt món QR'
            : `Nhập mã OTP 6 số đã được gửi đến email ${email}`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleRequestOTP}
            className="space-y-4"
          >
            {/* FullName field */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[13px] font-semibold text-slate-600">
                Họ tên chủ nhà hàng *
              </Label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <Input 
                  id="fullName" 
                  type="text" 
                  placeholder="Nhập họ và tên của bạn" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                />
              </div>
            </div>

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] font-semibold text-slate-600">
                  Email liên hệ *
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@restaurant.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[13px] font-semibold text-slate-600">
                  Số điện thoại *
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <Input 
                    id="phone" 
                    type="text" 
                    placeholder="09xxxxxxxx" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                  />
                </div>
              </div>
            </div>

            {/* Username field */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[13px] font-semibold text-slate-600">
                Tên đăng nhập *
              </Label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                  <User className="w-4.5 h-4.5" />
                </div>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Chọn tên đăng nhập viết liền không dấu" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                />
              </div>
            </div>

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password field */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] font-semibold text-slate-600">
                  Mật khẩu *
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Tối thiểu 6 ký tự" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                  />
                </div>
              </div>

              {/* Confirm Password field */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[13px] font-semibold text-slate-600">
                  Xác nhận mật khẩu *
                </Label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Nhập lại mật khẩu" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px]"
                  />
                </div>
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
                  <div className="bg-rose-50/80 border border-rose-100/70 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm shadow-rose-900/5">
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
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi mã xác nhận...
                  </>
                ) : (
                  'Gửi mã xác nhận qua Email'
                )}
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerifyOTP}
            className="space-y-5"
          >
            {/* OTP Input */}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-[13px] font-semibold text-slate-600 block text-center">
                Mã xác thực OTP (6 chữ số) *
              </Label>
              <div className="relative group max-w-[240px] mx-auto">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-200 z-10">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <Input 
                  id="otp" 
                  type="text" 
                  maxLength={6}
                  placeholder="xxxxxx" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="pl-11 h-12 text-center tracking-[8px] font-bold text-lg bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200"
                />
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
                  <div className="bg-rose-50/80 border border-rose-100/70 text-rose-700 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm shadow-rose-900/5">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit & Resend Actions */}
            <div className="space-y-3 pt-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xác thực OTP...
                  </>
                ) : (
                  'Hoàn tất đăng ký'
                )}
              </Button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || isLoading}
                className="w-full h-11 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Gửi lại mã OTP (${resendCooldown}s)` 
                  : 'Gửi lại mã OTP'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Link back to login */}
      <div className="text-center mt-6 text-[13px] text-slate-500 font-medium">
        Đã có tài khoản đối tác?{' '}
        <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-bold underline">
          Đăng nhập tại đây
        </Link>
      </div>
      
      {/* Notice info */}
      <div className="text-center mt-5 text-[11px] text-slate-400">
        Bằng việc đăng ký, bạn đồng ý với các điều khoản đối tác và chính sách bảo mật của QDish.
      </div>
    </motion.div>
  );
};
