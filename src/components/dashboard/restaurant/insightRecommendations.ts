import type { RestaurantStats } from '@/types';

export type MerchantOperationalRecommendationTone = 'info' | 'warning' | 'positive';

export interface MerchantOperationalRecommendation {
  id: 'peak-hour' | 'cancellation-rate' | 'processing-time' | 'top-dish';
  tone: MerchantOperationalRecommendationTone;
  title: string;
  description: string;
}

const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const findPeakHour = (stats: RestaurantStats) => {
  const hourlyData = (stats.revenueByHour || []).filter((item) => item.orders > 0);
  if (hourlyData.length === 0) return null;

  return hourlyData.reduce((peak, item) => {
    if (!peak) return item;
    if (item.orders > peak.orders) return item;
    if (item.orders === peak.orders && item.revenue > peak.revenue) return item;
    return peak;
  }, hourlyData[0] || null);
};

export const buildOperationalRecommendations = (
  stats: RestaurantStats | null
): MerchantOperationalRecommendation[] => {
  if (!stats?.overview) return [];

  const recommendations: MerchantOperationalRecommendation[] = [];
  const peakHour = findPeakHour(stats);

  if (peakHour) {
    recommendations.push({
      id: 'peak-hour',
      tone: 'info',
      title: `Chuẩn bị cho cao điểm ${formatHour(peakHour.hour)}`,
      description: `${peakHour.orders.toLocaleString('vi-VN')} đơn tập trung vào khung giờ này. Nên chuẩn bị sẵn nguyên liệu và bố trí đủ người trước khi bắt đầu cao điểm.`
    });
  }

  if (stats.overview.cancellationRate >= 5) {
    recommendations.push({
      id: 'cancellation-rate',
      tone: 'warning',
      title: 'Tỷ lệ huỷ đơn cần theo dõi',
      description: `Tỷ lệ huỷ đang ở mức ${stats.overview.cancellationRate}%. Hãy kiểm tra các đơn chờ xác nhận và thời gian phản hồi của bếp.`
    });
  }

  if (stats.overview.averageProcessingTime >= 20) {
    recommendations.push({
      id: 'processing-time',
      tone: 'warning',
      title: 'Thời gian xử lý đang cao',
      description: `Một đơn mất trung bình ${stats.overview.averageProcessingTime} phút để hoàn tất. Nên rà lại khung giờ đông và các món có thời gian chuẩn bị lâu.`
    });
  }

  if (recommendations.length < 3 && stats.overview.topSellingItem) {
    recommendations.push({
      id: 'top-dish',
      tone: 'positive',
      title: `Đẩy mạnh ${stats.overview.topSellingItem.name}`,
      description: `${stats.overview.topSellingItem.name} đang bán chạy nhất với ${stats.overview.topSellingItem.quantity.toLocaleString('vi-VN')} suất. Có thể thử đưa món này vào combo hoặc khu vực nổi bật.`
    });
  }

  return recommendations.slice(0, 3);
};
