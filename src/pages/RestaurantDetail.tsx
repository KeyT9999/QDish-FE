import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ownerRestaurantService } from '@/services/ownerRestaurantService';
import { Restaurant } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  Building2, 
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await ownerRestaurantService.getRestaurantDetails(id);
      setRestaurant(data);
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải thông tin chi tiết nhà hàng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-slate-500 text-sm font-medium">Đang tải thông tin chi tiết...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16 bg-white border rounded-3xl p-8 max-w-lg mx-auto shadow-sm space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-2 opacity-80 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-800">Không tìm thấy nhà hàng</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Yêu cầu không hợp lệ hoặc bạn không có quyền truy cập vào thông tin chi nhánh này.
        </p>
        <Button 
          onClick={() => navigate('/owner')}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-6 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 animate-in fade-in duration-250">
      {/* Back navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/owner')} 
          className="w-fit text-slate-600 hover:text-slate-900 font-bold -ml-2 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách
        </Button>
      </div>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden shadow-emerald-950/10">
        <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 opacity-10">
          <Store className="w-80 h-80" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5" /> Chi nhánh nhà hàng
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              restaurant.status === 'ACTIVE'
                ? 'bg-emerald-100/90 text-emerald-800'
                : 'bg-rose-100/90 text-rose-800'
            }`}>
              {restaurant.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight">
            {restaurant.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-emerald-50/90">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-300" /> Admin ID: <strong className="text-white font-semibold">{restaurant.username}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-300" /> Ngày đăng ký: <strong className="text-white font-semibold">
                {(restaurant as any).createdAt ? new Date((restaurant as any).createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: General Info & Plan Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/40 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" /> Thông tin chung chi nhánh
              </CardTitle>
              <CardDescription className="text-xs">Thông tin liên lạc và người quản trị chính của chi nhánh</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tên chi nhánh</span>
                  <div className="text-sm font-semibold text-slate-800">{restaurant.name}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tên chủ sở hữu</span>
                  <div className="text-sm font-semibold text-slate-800">{restaurant.ownerName}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tên đăng nhập Admin chi nhánh</span>
                  <div className="text-sm font-mono font-bold text-emerald-700">{restaurant.username}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Số điện thoại liên lạc</span>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" /> {restaurant.phone}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Hòm thư điện tử (Email)</span>
                  <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" /> {restaurant.email}
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Địa chỉ chi nhánh</span>
                  <div className="text-sm font-semibold text-slate-800 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> <span>{restaurant.address}</span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/40 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-650" /> Tính năng AI & phân tích dữ liệu áp dụng
              </CardTitle>
              <CardDescription className="text-xs">Trạng thái kích hoạt của các tính năng dựa trên gói dịch vụ hiện có</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Cá nhân hóa Fit Score', enabled: restaurant.features?.fitScoreEnabled || false },
                  { label: 'Hồ sơ dinh dưỡng món ăn', enabled: restaurant.features?.foodAttributesEnabled || false },
                  { label: 'Gợi ý món ăn AI (AI Recommendation)', enabled: restaurant.features?.recommendationEnabled || false },
                  { label: 'Cá nhân hóa thực đơn (Personalized Menu)', enabled: restaurant.features?.personalizedMenuEnabled || false },
                  { label: 'Báo cáo phân tích chuyên sâu', enabled: restaurant.features?.advancedAnalyticsEnabled || false },
                  { label: 'Phân tích hành vi khách hàng', enabled: restaurant.features?.customerInsightsEnabled || false }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      item.enabled 
                        ? 'bg-purple-50/20 border-purple-100 text-purple-900 shadow-sm/5' 
                        : 'bg-slate-50/50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.enabled 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {item.enabled ? <Sparkles className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-350" />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${item.enabled ? 'text-slate-850' : 'text-slate-400'}`}>
                        {item.label}
                      </div>
                      <span className={`text-[9px] font-semibold uppercase ${item.enabled ? 'text-purple-655 font-extrabold' : 'text-slate-400 line-through'}`}>
                        {item.enabled ? 'Kích hoạt' : 'Chưa kích hoạt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Payment Details & Bank QR */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Settings Card */}
          <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/40 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" /> Nhận tiền & Ngân hàng
              </CardTitle>
              <CardDescription className="text-xs">Thông tin nhận tiền chuyển khoản của chi nhánh này</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4 text-xs">
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tên ngân hàng</span>
                  <div className="text-sm font-semibold text-slate-800">
                    {restaurant.bankName || 'Chưa thiết lập'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Số tài khoản</span>
                  <div className="text-sm font-mono font-bold text-slate-800">
                    {restaurant.bankAccountNumber || restaurant.bankAccount || 'Chưa thiết lập'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Chủ tài khoản</span>
                  <div className="text-sm font-semibold text-slate-850">
                    {restaurant.bankAccountHolder || 'Chưa thiết lập'}
                  </div>
                </div>

              </div>

              {/* QR Image Section */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Mã QR ngân hàng chi nhánh</span>
                {restaurant.bankQrImageUrl ? (
                  <div className="relative group border border-slate-150 rounded-2xl p-2 bg-slate-50/50 flex justify-center items-center overflow-hidden">
                    <img 
                      src={restaurant.bankQrImageUrl} 
                      alt={`QR ngân hàng - ${restaurant.name}`}
                      className="max-h-64 object-contain rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-103"
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-150 rounded-2xl p-6 text-center bg-slate-50/30 flex flex-col items-center justify-center gap-2">
                    <QrCode className="w-10 h-10 text-slate-350 opacity-70 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700">Chưa thiết lập ảnh QR ngân hàng</span>
                    <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto">
                      Để thiết lập QR thanh toán, vui lòng chuyển qua không gian làm việc chi nhánh và thực hiện tại mục Thiết lập.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};
