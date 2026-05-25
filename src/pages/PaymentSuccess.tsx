import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PENDING_PAYMENT_ORDER_KEY, subscriptionService } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('Đang tiến hành xác thực thanh toán với hệ thống...');
  const verifyAttempted = useRef(false);

  const orderCode = searchParams.get('orderCode')
    || searchParams.get('order_code')
    || localStorage.getItem(PENDING_PAYMENT_ORDER_KEY);

  useEffect(() => {
    if (!orderCode) {
      setIsVerifying(false);
      setIsSuccess(false);
      setMessage('Không tìm thấy thông tin mã đơn hàng thanh toán.');
      return;
    }

    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verifyPayment = async () => {
      let attempts = 0;
      const maxAttempts = 3;
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

      while (attempts < maxAttempts) {
        try {
          const data = await subscriptionService.getPaymentStatus(Number(orderCode));
          
          if (data.status === 'PAID') {
            setIsSuccess(true);
            setIsVerifying(false);
            setMessage('Chúc mừng! Thanh toán của bạn đã thành công và gói dịch vụ đã được kích hoạt.');
            localStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
            toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
            window.setTimeout(() => navigate('/owner?tab=billing'), 1800);
            return;
          } else if (data.status === 'CANCELLED' || data.status === 'EXPIRED') {
            setIsSuccess(false);
            setIsVerifying(false);
            setMessage('Giao dịch thanh toán này đã bị hủy bỏ hoặc đã hết hạn.');
            return;
          }
          
          // If pending, retry after 2 seconds
          attempts++;
          if (attempts < maxAttempts) {
            await delay(2000);
          }
        } catch (err: any) {
          console.error(err);
          attempts++;
          if (attempts >= maxAttempts) {
            setIsVerifying(false);
            setIsSuccess(false);
            setMessage(err.message || 'Lỗi hệ thống khi xác minh thanh toán. Vui lòng liên hệ hỗ trợ.');
            return;
          }
          await delay(2500);
        }
      }

      // If finished loops and still pending
      setIsVerifying(false);
      setIsSuccess(false);
      setMessage('Giao dịch đang được xử lý hoặc đang chờ ngân hàng xác nhận. Vui lòng kiểm tra lại tab Gói dịch vụ sau ít phút.');
    };

    verifyPayment();
  }, [orderCode]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans relative overflow-hidden">
      {/* Visual background lights */}
      <div className="absolute w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative text-center">
        {isVerifying ? (
          <div className="py-12 space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-500/20 flex items-center justify-center relative">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Đang xác thực thanh toán</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                Vui lòng không đóng trình duyệt hoặc tải lại trang trong khi hệ thống xác minh với ngân hàng.
              </p>
            </div>
          </div>
        ) : isSuccess ? (
          <div className="py-8 space-y-6 flex flex-col items-center">
            {/* Success Animation Container */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-400 relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <CheckCircle2 className="w-10 h-10" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Thanh Toán Thành Công!</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
                {message}
              </p>
            </div>

            <div className="pt-4 w-full">
              <Button 
                onClick={() => navigate('/owner?tab=billing')}
                className="w-full py-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-900 font-bold rounded-2xl shadow-lg shadow-emerald-600/10 transition-all duration-200"
              >
                Vào trang quản trị <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-2">Xác Thực Thất Bại / Chờ Xử Lý</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                {message}
              </p>
            </div>

            <div className="pt-4 w-full flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="flex-1 rounded-2xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Quay lại bảng giá
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1 rounded-2xl bg-slate-850 border border-slate-700 hover:bg-slate-700 text-white font-bold"
              >
                Thử lại
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
