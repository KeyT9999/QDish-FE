import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email trước.');
      return;
    }
    setError(null);
    setIsSendingOtp(true);
    try {
      await authService.requestPasswordReset({ email });
      toast.success('Yêu cầu gửi OTP thành công! Vui lòng kiểm tra email của bạn.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi mã OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới cần ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, otp, newPassword });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Thành công!</h3>
          <p className="text-sm text-gray-600">
            Mật khẩu của bạn đã được đặt lại thành công. Đang chuyển hướng về trang đăng nhập...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="mb-2">
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 flex items-center inline-flex">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại đăng nhập
          </Link>
        </div>
        <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
        <CardDescription className="text-center">
          Nhập mã OTP được gửi tới email của bạn
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleReset}>
        <CardContent className="px-0 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email tài khoản</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSendingOtp || !email}
                onClick={handleSendOtp}
                className="shrink-0 border-green-600 text-green-600 hover:bg-green-50"
              >
                {isSendingOtp ? 'Đang gửi...' : 'Gửi mã'}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="otp">Mã OTP</Label>
            <Input 
              id="otp" 
              type="text" 
              placeholder="Nhập mã OTP 6 chữ số" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input 
              id="newPassword" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-0 pb-0">
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
