import { BarChart3, CircleHelp, Info, Sparkles } from 'lucide-react';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import {
  groupMenuAttributes,
  type MenuAttributeEntry,
  type MenuAttributeGroup,
  type MenuAttributeGroupKey,
} from './menuAttributePresentation';
import { useOwnerConsoleLocale } from '@/i18n/OwnerConsoleLocaleContext';
import type { OwnerConsoleTranslationKey } from '@/i18n/ownerConsoleCatalog';
import type { OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';

interface MenuAttributesPanelProps {
  attributeDistribution: MerchantInsightsPayload['attributeDistribution'];
  menuCoverage: MerchantInsightsPayload['menuCoverage'];
}

const formatNumber = (value: number, language: OwnerConsoleLanguage) => new Intl.NumberFormat(
  language === 'en' ? 'en-US' : language === 'zh-CN' ? 'zh-CN' : 'vi-VN'
).format(value);

const GROUP_LABEL_KEYS: Record<MenuAttributeGroupKey, OwnerConsoleTranslationKey> = {
  nutrition: 'Dinh dưỡng',
  diet: 'Chế độ ăn',
  context: 'Ngữ cảnh sử dụng',
  other: 'Khác'
};

const GROUP_DESCRIPTION_KEYS: Record<MenuAttributeGroupKey, OwnerConsoleTranslationKey> = {
  nutrition: 'Chỉ số thành phần và năng lượng của món.',
  diet: 'Món phù hợp với nhu cầu ăn kiêng hoặc loại trừ thành phần.',
  context: 'Món phù hợp với thời điểm, mục đích hoặc cách dùng.',
  other: 'Thuộc tính mới chưa có trong danh mục hiển thị.'
};

const ATTRIBUTE_LABEL_KEYS: Record<string, OwnerConsoleTranslationKey> = {
  HIGH_PROTEIN: 'Giàu đạm',
  VERY_HIGH_PROTEIN: 'Rất giàu đạm',
  ENERGY_DENSE: 'Năng lượng cao',
  HEAVY_MEAL: 'Món no',
  LIGHT_MEAL: 'Ăn nhẹ',
  LOW_SUGAR: 'Ít đường',
  LOW_CALORIE: 'Ít calo',
  HIGH_FIBER: 'Nhiều chất xơ',
  LOW_FAT: 'Ít béo',
  HIGH_CARB: 'Nhiều tinh bột',
  KETO_FRIENDLY: 'Phù hợp Keto',
  POST_WORKOUT: 'Sau tập luyện',
  VEGETARIAN: 'Món chay',
  VEGAN: 'Thuần chay',
  GLUTEN_FREE: 'Không gluten',
  DAIRY_FREE: 'Không bơ sữa',
  OFFICE_LUNCH: 'Trưa văn phòng',
  QUICK_BITE: 'Ăn nhanh',
  SOCIAL_SHARING: 'Dùng để chia sẻ',
  FAMILY_MEAL: 'Bữa gia đình',
  LATE_NIGHT_FIT: 'Ăn đêm cân bằng',
  COMFORT_FOOD: 'Món ăn quen thuộc',
  REFRESHING: 'Thanh mát'
};

const ATTRIBUTE_DESCRIPTION_KEYS: Record<string, OwnerConsoleTranslationKey> = {
  HIGH_PROTEIN: 'Từ 25g protein trong một món.',
  VERY_HIGH_PROTEIN: 'Từ 40g protein trong một món.',
  ENERGY_DENSE: 'Từ 600 kcal trong một món.',
  HEAVY_MEAL: 'Từ 700 kcal hoặc 25g chất béo trong một món.',
  LIGHT_MEAL: 'Tối đa 400 kcal và 15g chất béo trong một món.',
  LOW_SUGAR: 'Tối đa 5g đường trong một món.',
  LOW_CALORIE: 'Tối đa 400 kcal trong một món.',
  HIGH_FIBER: 'Từ 6g chất xơ trong một món.',
  LOW_FAT: 'Tối đa 10g chất béo trong một món.',
  HIGH_CARB: 'Từ 80g carb trong một món.',
  KETO_FRIENDLY: 'Tối đa 20g carb và phần lớn năng lượng đến từ chất béo.',
  POST_WORKOUT: 'Từ 25g protein và 30–60g carb trong một món.',
  VEGETARIAN: 'Không có thịt, cá hoặc hải sản theo dữ liệu thành phần.',
  VEGAN: 'Không có thành phần động vật theo dữ liệu thành phần.',
  GLUTEN_FREE: 'Không có thành phần chứa gluten theo dữ liệu thành phần.',
  DAIRY_FREE: 'Không có sữa hoặc chế phẩm từ sữa theo dữ liệu thành phần.',
  OFFICE_LUNCH: 'Khoảng 400–700 kcal và không thuộc nhóm món no.',
  QUICK_BITE: 'Tối đa 350 kcal và phù hợp một khẩu phần.',
  SOCIAL_SHARING: 'Phù hợp từ 2 khẩu phần.',
  FAMILY_MEAL: 'Phù hợp từ 4 khẩu phần.',
  LATE_NIGHT_FIT: '300–600 kcal với chất béo và carb ở mức vừa phải.',
  COMFORT_FOOD: 'Có từ 20g chất béo và 50g carb trong một món.',
  REFRESHING: 'Tối đa 300 kcal và có nguyên liệu rau củ.'
};

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
    </div>
  );
}

function AttributeBar({ attribute, maxCount }: { attribute: MenuAttributeEntry; maxCount: number }) {
  const { language, t } = useOwnerConsoleLocale();
  const labelKey = ATTRIBUTE_LABEL_KEYS[attribute.key];
  const descriptionKey = ATTRIBUTE_DESCRIPTION_KEYS[attribute.key];
  const label = labelKey ? t(labelKey) : attribute.label;
  const description = descriptionKey ? t(descriptionKey) : attribute.description;
  const width = Math.max(8, Math.round((attribute.count / maxCount) * 100));

  return (
    <div
      role="listitem"
      aria-label={t('{label}: {count} món. {description}', { label, count: formatNumber(attribute.count, language), description })}
      className="group rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${attribute.barClassName}`} aria-hidden="true" />
          <span className="truncate text-xs font-bold text-slate-800">{label}</span>
          <span title={description} aria-label={description}>
            <CircleHelp aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
          </span>
        </div>
        <span className="shrink-0 text-xs font-black tabular-nums text-slate-700">
          {t('{count} món', { count: formatNumber(attribute.count, language) })}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={t('{count}/{max} món trong nhóm này', { count: attribute.count, max: maxCount })}
      >
        <div
          className={`h-full rounded-full ${attribute.barClassName} motion-safe:transition-[width] motion-safe:duration-500 motion-reduce:transition-none`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-400">{description}</p>
    </div>
  );
}

function AttributeGroupCard({ group }: { group: MenuAttributeGroup }) {
  const { language, t } = useOwnerConsoleLocale();
  const maxCount = Math.max(...group.attributes.map((attribute) => attribute.count), 1);
  const groupLabel = t(GROUP_LABEL_KEYS[group.key]);
  const groupDescription = t(GROUP_DESCRIPTION_KEYS[group.key]);

  return (
    <section aria-labelledby={`menu-attribute-group-${group.key}`} className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/45 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 id={`menu-attribute-group-${group.key}`} className="text-sm font-black text-slate-900">{groupLabel}</h4>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">{groupDescription}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
          {t('{count} nhãn', { count: group.attributes.length })}
        </span>
      </div>
      <div role="list" aria-label={t('Các thuộc tính nhóm {group}', { group: groupLabel })} className="space-y-2">
        {group.attributes.map((attribute) => (
          <AttributeBar key={attribute.key} attribute={attribute} maxCount={maxCount} />
        ))}
      </div>
    </section>
  );
}

function AttributeSummary({ groups }: { groups: MenuAttributeGroup[] }) {
  const { language, t } = useOwnerConsoleLocale();
  const attributes = groups.flatMap((group) => group.attributes);
  const topAttribute = [...attributes].sort((left, right) => right.count - left.count)[0];
  const topAttributeLabelKey = topAttribute ? ATTRIBUTE_LABEL_KEYS[topAttribute.key] : undefined;
  const topAttributeLabel = topAttribute
    ? topAttributeLabelKey ? t(topAttributeLabelKey) : topAttribute.label
    : '';
  const dietGroup = groups.find((group) => group.key === 'diet');

  return (
    <aside aria-label={t('Gợi ý đọc báo cáo thuộc tính')} className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900">{t('Gợi ý cho nhà hàng')}</h4>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-600">
            <li>
              {topAttribute
                ? t('Nhãn nổi bật nhất hiện là “{label}” với {count} món.', { label: topAttributeLabel, count: formatNumber(topAttribute.count, language) })
                : t('Chưa có nhãn nào để tạo nhận xét.')}
            </li>
            <li>
              {dietGroup?.attributes.length
                ? t('Nhóm chế độ ăn đang có {count} loại nhãn; hãy kiểm tra thành phần món trước khi giới thiệu với khách.', { count: dietGroup.attributes.length })
                : t('Chưa có nhãn chế độ ăn; hãy bổ sung dữ liệu Recipe nếu muốn làm rõ món chay hoặc thành phần được loại trừ.')}
            </li>
            <li>{t('Hãy so sánh các thanh trong cùng nhóm; các nhóm không cộng lại thành tổng số món.')}</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export const MenuAttributesPanel = ({ attributeDistribution, menuCoverage }: MenuAttributesPanelProps) => {
  const { language, t } = useOwnerConsoleLocale();
  const groups = groupMenuAttributes(attributeDistribution);
  const visibleGroups = groups.filter((group) => group.attributes.length > 0);
  const hasAttributes = visibleGroups.length > 0;
  const coveragePercent = Number.isFinite(menuCoverage.coveragePct)
    ? Math.max(0, Math.min(100, menuCoverage.coveragePct))
    : 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-100/80 bg-white shadow-[0_18px_48px_rgba(15,118,110,0.08)]">
      <div className="border-b border-emerald-100/70 bg-gradient-to-r from-emerald-50/90 via-teal-50/45 to-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
            <BarChart3 aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-900">{t('Phân bố thuộc tính món ăn')}</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
              {t('Xem nhãn dinh dưỡng, chế độ ăn và ngữ cảnh sử dụng của thực đơn. Một món có thể có nhiều thuộc tính, vì vậy số liệu không cộng lại thành tổng số món.')}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label={t('Tổng số món')}
            value={formatNumber(menuCoverage.totalItems, language)}
            detail={t('Số món hiện có trong thực đơn')}
          />
          <MetricCard
            label={t('Món có Recipe')}
            value={formatNumber(menuCoverage.itemsWithRecipe, language)}
            detail={t('Thực đơn có dữ liệu phân loại cho {percent}% số món.', { percent: coveragePercent })}
          />
          <MetricCard
            label={t('Nhóm thuộc tính')}
            value={formatNumber(visibleGroups.length, language)}
            detail={t('Đang có dữ liệu trong 3 nhóm chính')}
          />
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div role="note" className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[11px] leading-4 text-slate-600">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            {t('Đây là số món được gắn nhãn, không phải số lượt bán hay doanh thu. Di chuột vào biểu tượng trợ giúp để xem ý nghĩa của từng nhãn.')}
          </p>
        </div>

        {hasAttributes ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {visibleGroups.map((group) => (
              <AttributeGroupCard key={group.key} group={group} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
            <BarChart3 aria-hidden="true" className="mx-auto h-8 w-8 text-slate-300" />
            <h4 className="mt-3 text-sm font-black text-slate-700">{t('Chưa có dữ liệu thuộc tính')}</h4>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              {t('Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.')}
            </p>
          </div>
        )}

        <AttributeSummary groups={groups} />
      </div>
    </section>
  );
};
