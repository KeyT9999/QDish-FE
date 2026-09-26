import { BarChart3, CircleHelp, Info, Sparkles } from 'lucide-react';
import type { MerchantInsightsPayload } from '@/services/merchantInsightLoader';
import {
  groupMenuAttributes,
  type MenuAttributeEntry,
  type MenuAttributeGroup,
} from './menuAttributePresentation';

interface MenuAttributesPanelProps {
  attributeDistribution: MerchantInsightsPayload['attributeDistribution'];
  menuCoverage: MerchantInsightsPayload['menuCoverage'];
}

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

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
  const width = Math.max(8, Math.round((attribute.count / maxCount) * 100));

  return (
    <div
      role="listitem"
      aria-label={`${attribute.label}: ${formatNumber(attribute.count)} món. ${attribute.description}`}
      className="group rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-[0_1px_4px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${attribute.barClassName}`} aria-hidden="true" />
          <span className="truncate text-xs font-bold text-slate-800">{attribute.label}</span>
          <span title={attribute.description} aria-label={attribute.description}>
            <CircleHelp aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500" />
          </span>
        </div>
        <span className="shrink-0 text-xs font-black tabular-nums text-slate-700">
          {formatNumber(attribute.count)} món
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`${attribute.count} trên ${maxCount} món trong nhóm này`}
      >
        <div
          className={`h-full rounded-full ${attribute.barClassName} motion-safe:transition-[width] motion-safe:duration-500 motion-reduce:transition-none`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-400">{attribute.description}</p>
    </div>
  );
}

function AttributeGroupCard({ group }: { group: MenuAttributeGroup }) {
  const maxCount = Math.max(...group.attributes.map((attribute) => attribute.count), 1);

  return (
    <section aria-labelledby={`menu-attribute-group-${group.key}`} className="min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/45 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 id={`menu-attribute-group-${group.key}`} className="text-sm font-black text-slate-900">{group.label}</h4>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">{group.description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
          {group.attributes.length} nhãn
        </span>
      </div>
      <div role="list" aria-label={`Các thuộc tính nhóm ${group.label}`} className="space-y-2">
        {group.attributes.map((attribute) => (
          <AttributeBar key={attribute.key} attribute={attribute} maxCount={maxCount} />
        ))}
      </div>
    </section>
  );
}

function AttributeSummary({ groups }: { groups: MenuAttributeGroup[] }) {
  const attributes = groups.flatMap((group) => group.attributes);
  const topAttribute = [...attributes].sort((left, right) => right.count - left.count)[0];
  const dietGroup = groups.find((group) => group.key === 'diet');

  return (
    <aside aria-label="Gợi ý đọc báo cáo thuộc tính" className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-black text-slate-900">Gợi ý cho nhà hàng</h4>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-600">
            <li>
              {topAttribute
                ? `Nhãn nổi bật nhất hiện là “${topAttribute.label}” với ${formatNumber(topAttribute.count)} món.`
                : 'Chưa có nhãn nào để tạo nhận xét.'}
            </li>
            <li>
              {dietGroup?.attributes.length
                ? `Nhóm chế độ ăn đang có ${dietGroup.attributes.length} loại nhãn; nên kiểm tra thành phần món trước khi truyền thông cho khách.`
                : 'Chưa có nhãn chế độ ăn; nếu nhà hàng muốn làm rõ món chay hoặc món loại trừ thành phần, hãy bổ sung dữ liệu Recipe.'}
            </li>
            <li>Hãy so sánh các thanh trong cùng một nhóm; các nhóm không cộng thành tổng số món.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export const MenuAttributesPanel = ({ attributeDistribution, menuCoverage }: MenuAttributesPanelProps) => {
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
            <h3 className="text-base font-black text-slate-900">Phân bố thuộc tính món ăn</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-600">
              Xem menu đang được gắn nhãn theo dinh dưỡng, chế độ ăn và ngữ cảnh sử dụng như thế nào.
              Một món có thể có nhiều thuộc tính nên các số liệu không cộng lại thành tổng số món.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Tổng số món"
            value={formatNumber(menuCoverage.totalItems)}
            detail="Số món hiện có trong thực đơn"
          />
          <MetricCard
            label="Món có Recipe"
            value={formatNumber(menuCoverage.itemsWithRecipe)}
            detail={`${coveragePercent}% menu có dữ liệu để phân loại`}
          />
          <MetricCard
            label="Nhóm thuộc tính"
            value={formatNumber(visibleGroups.length)}
            detail="Đang có dữ liệu trong 3 nhóm chính"
          />
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div role="note" className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[11px] leading-4 text-slate-600">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          <p>
            Đây là <strong className="font-bold text-slate-800">số món được gắn nhãn</strong>, không phải số lượt bán hay doanh thu.
            Di chuột vào biểu tượng hỏi để xem cách hiểu từng nhãn.
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
            <h4 className="mt-3 text-sm font-black text-slate-700">Chưa có dữ liệu thuộc tính</h4>
            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
              Chưa có món ăn nào cấu hình Recipe để phân loại thuộc tính.
            </p>
          </div>
        )}

        <AttributeSummary groups={groups} />
      </div>
    </section>
  );
};
