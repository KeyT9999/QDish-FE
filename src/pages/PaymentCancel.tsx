import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PENDING_PAYMENT_ORDER_KEY, subscriptionService } from '@/services/subscriptionService';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Thanh toán đã bị hủy. Gói dịch vụ hiện tại của bạn không thay đổi.');
  const [isChecking, setIsChecking] = useState(false);
  const checkedRef = useRef(false);

  const orderCode = searchParams.get('orderCode')
    || searchParams.get('order_code')
    || localStorage.getItem(PENDING_PAYMENT_ORDER_KEY);

  useEffect(() => {
    if (!orderCode || checkedRef.current) return;
    checkedRef.current = true;

    const markCancelled = async () => {
      setIsChecking(true);
      try {
        const result = await subscriptionService.getPaymentStatus(Number(orderCode));
        if (result.status === 'PAID') {
          localStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
          navigate('/payment-success?orderCode=' + orderCode, { replace: true });
          return;
        }
        if (result.status === 'CANCELLED' || result.status === 'EXPIRED' || result.status === 'FAILED') {
          localStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
        }
        setMessage(result.message || 'Thanh toán đã bị hủy. Gói dịch vụ hiện tại của bạn không thay đổi.');
      } catch (error: any) {
        setMessage(error.message || 'Không thể xác minh trạng thái hủy thanh toán. Gói dịch vụ hiện tại chưa được thay đổi.');
      } finally {
        setIsChecking(false);
      }
    };

    markCancelled();
  }, [navigate, orderCode]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-950 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-6">
          {isChecking ? <Loader2 className="w-8 h-8 animate-spin" /> : <AlertCircle className="w-8 h-8" />}
        </div>

        <h1 className="text-2xl font-black text-white mb-3">Thanh Toán Đã Hủy</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/owner?tab=billing')}
            className="flex-1 rounded-2xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Billing
          </Button>
          <Button
            onClick={() => navigate('/owner?tab=billing')}
            className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Thử lại
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
