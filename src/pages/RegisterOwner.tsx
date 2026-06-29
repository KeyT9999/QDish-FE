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
  
  // Google Auth State
  const [isGoogle, setIsGoogle] = useState(false);
  const [googleToken, setGoogleToken] = useState('');
  
  // OTP State
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load/initialize Google Sign-in
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    const initGoogle = () => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId || 'MOCK_CLIENT_ID',
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById('google-signin-button');
        if (btnContainer && clientId) {
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.offsetWidth || 350,
            text: 'signup_with',
            shape: 'pill',
          });
        }
      }
    };

    // Retry initialization if google script takes time to load
    const interval = setInterval(() => {
      if ((window as any).google) {
        initGoogle();
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    const token = response.credential;
    if (!token) return;

    setError(null);
    setIsLoading(true);

    try {
      const checkRes = await authService.googleCheckEmail({ googleToken: token });
      
      if (checkRes.exists) {
        setError('Email tài khoản Google này đã được đăng ký làm chủ nhà hàng. Vui lòng chuyển sang trang Đăng nhập.');
        toast.error('Email Google đã tồn tại trong hệ thống.');
      } else {
        setFullName(checkRes.name || '');
        setEmail(checkRes.email || '');
        setIsGoogle(true);
        setGoogleToken(token);
        toast.success('Xác thực Google thành công! Vui lòng hoàn thành các thông tin còn lại.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xác thực Google thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockGoogleSignup = () => {
    const mockEmail = `testowner_${Math.floor(1000 + Math.random() * 9000)}`;
    const mockToken = `mock-google-token-${mockEmail}`;
    handleGoogleCredentialResponse({ credential: mockToken });
  };

  const handleGoogleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      await authService.googleRegister({
        googleToken,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: username.trim(),
        password,
        confirmPassword
      });
      
      toast.success('Đăng ký chủ nhà hàng bằng Google thành công! Vui lòng đăng nhập.');
      navigate('/login', { state: { username: username.trim() } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Google Sign-in Option */}
            {!isGoogle && (
              <div className="space-y-4 mb-5">
                <div className="flex flex-col gap-2.5">
                  <div id="google-signin-button" className="w-full flex justify-center min-h-[40px]" />
                  
                  {/* Mock Google Signup button for development */}
                  {(!import.meta.env.VITE_GOOGLE_CLIENT_ID) && (
                    <button
                      type="button"
                      onClick={handleMockGoogleSignup}
                      className="w-full h-11 bg-slate-50 hover:bg-slate-100 active:scale-[0.99] border border-slate-200 text-slate-700 font-semibold rounded-full transition-all duration-200 flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm"
                    >
                      <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.19-5.136 4.19A5.69 5.69 0 0 1 8.24 12a5.69 5.69 0 0 1 5.75-5.59c1.47 0 2.82.52 3.89 1.52l2.46-2.46C18.83 4.03 16.54 3 13.99 3 9.02 3 5 7.03 5 12s4.02 9 8.99 9c4.97 0 8.25-3.46 8.25-8.4 0-.58-.06-1.12-.17-1.615H12.24Z" />
                      </svg>
                      Đăng ký nhanh bằng Google (Mock)
                    </button>
                  )}
                </div>
                
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                  </div>
                  <span className="relative px-3 bg-white text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Hoặc đăng ký bằng tài khoản mới
                  </span>
                </div>
              </div>
            )}

            {isGoogle && (
              <div className="mb-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3.5 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-800">Đã liên kết Google</div>
                  <div className="text-[11px] text-slate-500 font-medium">Hoàn tất biểu mẫu để tạo tài khoản.</div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsGoogle(false);
                    setGoogleToken('');
                    setFullName('');
                    setEmail('');
                  }}
                  className="ml-auto text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}

            <form
              onSubmit={isGoogle ? handleGoogleRegister : handleRequestOTP}
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
                      placeholder="name@restaurant." 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={isGoogle}
                      className={`pl-11 h-11 border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200 text-[14px] ${
                        isGoogle 
                          ? 'bg-slate-100/70 text-slate-400 cursor-not-allowed border-emerald-100' 
                          : 'bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white'
                      }`}
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
                      placeholder="Tối thiều 6 ký tự" 
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
                      {isGoogle ? 'Đang tạo tài khoản...' : 'Đang gửi mã xác nhận...'}
                    </>
                  ) : (
                    isGoogle ? 'Hoàn tất đăng ký bằng Google' : 'Gửi mã xác nhận qua Email'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
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
