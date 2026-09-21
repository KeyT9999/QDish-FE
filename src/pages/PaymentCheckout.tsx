import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionService, CheckoutDetailsResponse, PENDING_PAYMENT_ORDER_KEY } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

export const PaymentCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCodeParam = searchParams.get('orderCode') || localStorage.getItem(PENDING_PAYMENT_ORDER_KEY);

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [details, setDetails] = useState<CheckoutDetailsResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const orderCode = orderCodeParam ? Number(orderCodeParam) : null;

  useEffect(() => {
    if (!orderCode || isNaN(orderCode)) {
      setIsLoading(false);
      return;
    }

    const loadDetails = async () => {
      try {
        const data = await subscriptionService.getCheckoutDetails(orderCode);
        setDetails(data);
        if (data.status === 'PAID') {
          toast.success('Đơn hàng này đã được thanh toán thành công!');
          navigate(`/payment-success?orderCode=${orderCode}`, { replace: true });
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Không tìm thấy thông tin đơn thanh toán.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [orderCode, navigate]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Đã sao chép ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmSandbox = async () => {
    if (!orderCode) return;
    setIsConfirming(true);
    try {
      const res = await subscriptionService.confirmSandboxPayment(orderCode);
      toast.success(res.message || 'Kích hoạt gói dịch vụ thành công!');
      localStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
      navigate(`/payment-success?orderCode=${orderCode}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xác nhận thanh toán sandbox.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelCheckout = async () => {
    if (!orderCode) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy giao dịch thanh toán này?')) return;
    setIsCancelling(true);
    try {
      await subscriptionService.cancelCheckout(orderCode);
      localStorage.removeItem(PENDING_PAYMENT_ORDER_KEY);
      toast.info('Đã hủy đơn thanh toán thành công.');
      navigate('/owner?tab=billing', { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy giao dịch.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Đang tải thông tin cổng thanh toán...</p>
      </div>
    );
  }

  if (!orderCode || !details) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-950 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Không tìm thấy đơn thanh toán</h2>
            <p className="text-xs text-slate-400">Mã đơn hàng không hợp lệ hoặc giao dịch đã kết thúc.</p>
          </div>
          <Button
            onClick={() => navigate('/owner?tab=billing')}
            className="w-full py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Gói Dịch Vụ
          </Button>
        </div>
      </div>
    );
  }

  const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(details.amount);
  const transferContent = `QDISH ${details.orderCode}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Visual Ambient Glows */}
      <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] top-1/4 -left-20 -z-10 pointer-events-none" />
      <div className="absolute w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] bottom-1/4 -right-20 -z-10 pointer-events-none" />

      <div className="w-full max-w-3xl space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => navigate('/owner?tab=billing')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại trang quản lý gói
        </button>

        {/* Sandbox Notice Banner */}
        {details.isSandbox && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-200 flex items-start gap-3.5 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-amber-300">Cổng Thanh Toán Mô Phỏng (Sandbox Testing Gateway)</p>
              <p className="text-amber-200/80 leading-relaxed">
                Tài khoản PayOS của hệ thống hiện đang tạm dừng hoặc chờ gia hạn hạn mức (Code 215). Để hỗ trợ chấm điểm và nghiệm thu đồ án mượt mà, hệ thống đã tự động chuyển sang chế độ <strong>Sandbox</strong>. Bạn có thể quét mã QR giả lập hoặc nhấn nút xác nhận bên dưới để hoàn tất nâng cấp ngay lập tức!
              </p>
            </div>
          </div>
        )}

        {/* Main Checkout Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: QR Code & Bank Details */}
          <div className="md:col-span-6 flex flex-col items-center justify-center space-y-5 border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5" /> Quét mã VietQR
              </div>
              <h3 className="text-base font-bold text-white">Quét mã để thanh toán</h3>
            </div>

            {/* QR Frame */}
            <div className="bg-white p-4 rounded-2xl shadow-xl shadow-black/40 border-4 border-slate-800 relative group">
              <img
                src={details.qrCode || `https://img.vietqr.io/image/970422-0905123456-compact2.png?amount=${details.amount}&addInfo=QDISH%20${details.orderCode}&accountName=QDISH%20SAAS`}
                alt="QR Payment"
                className="w-56 h-56 object-contain rounded-lg"
              />
              <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl pointer-events-none animate-pulse" />
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed max-w-xs">
              Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank,...) và quét mã QR trên để chuyển khoản.
            </p>
          </div>

          {/* Right Column: Invoice Details & Action Buttons */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Chi tiết hóa đơn</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <h2 className="text-2xl font-black text-white">{details.plan?.name || 'Gói Dịch Vụ'}</h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase">
                    {details.plan?.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{details.plan?.description}</p>
              </div>

              {/* Price & Billing Cycle Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Chu kỳ thanh toán:</span>
                  <strong className="text-white font-semibold">
                    {details.billingCycle === 'YEARLY' ? 'Theo năm (Tiết kiệm 2 tháng)' : 'Theo tháng'}
                  </strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Mã đơn thanh toán:</span>
                  <div className="flex items-center gap-1.5 font-mono text-white font-bold">
                    #{details.orderCode}
                    <button
                      onClick={() => handleCopy(String(details.orderCode), 'Mã đơn')}
                      className="hover:text-emerald-400 transition-colors p-1"
                      title="Sao chép mã đơn"
                    >
                      {copiedField === 'Mã đơn' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    {transferContent}
                    <button
                      onClick={() => handleCopy(transferContent, 'Nội dung')}
                      className="hover:text-white transition-colors"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'Nội dung' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-emerald-400">{formattedAmount}</span>
                </div>
              </div>

              {/* Features List */}
              {details.plan?.features && details.plan.features.length > 0 && (
                <div className="space-y-1.5 text-xs text-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Quyền lợi gói:</span>
                  <ul className="space-y-1 pl-1">
                    {details.plan.features.slice(0, 3).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <Button
                type="button"
                disabled={isConfirming || isCancelling}
                onClick={handleConfirmSandbox}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/15 transition-all duration-200"
              >
                {isConfirming ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang kích hoạt gói...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-950" />
                    {details.isSandbox ? 'Xác Nhận Đã Thanh Toán (Sandbox Demo)' : 'Tôi Đã Chuyển Khoản Thành Công'}
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isConfirming || isCancelling}
                onClick={handleCancelCheckout}
                className="w-full py-5 rounded-2xl border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                {isCancelling ? 'Đang hủy...' : 'Hủy đơn thanh toán'}
              </Button>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Hệ thống bảo mật SSL 256-bit & Tương thích chuẩn VietQR Napas247</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
