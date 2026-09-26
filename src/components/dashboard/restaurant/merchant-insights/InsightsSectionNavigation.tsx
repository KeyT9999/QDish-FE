import { useRef, type KeyboardEvent } from 'react';

export type InsightsSection =
  | 'qdish-intelligence'
  | 'survey-trends'
  | 'peak-hours'
  | 'menu-attributes'
  | 'smart-menu-performance';

export const INSIGHTS_SECTIONS: Array<{ id: InsightsSection; label: string }> = [
  { id: 'qdish-intelligence', label: 'QDish Intelligence' },
  { id: 'survey-trends', label: 'Xu hướng khảo sát QR' },
  { id: 'peak-hours', label: 'Khung giờ đặt món' },
  { id: 'menu-attributes', label: 'Thuộc tính thực đơn' },
  { id: 'smart-menu-performance', label: 'Hiệu suất món ăn Smart-Menu' },
];

interface InsightsSectionNavigationProps {
  selectedSection: InsightsSection;
  onChange: (section: InsightsSection) => void;
}

export const InsightsSectionNavigation = ({
  selectedSection,
  onChange,
}: InsightsSectionNavigationProps) => {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectAndFocus = (index: number) => {
    const section = INSIGHTS_SECTIONS[index];
    if (!section) return;
    onChange(section.id);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % INSIGHTS_SECTIONS.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index - 1 + INSIGHTS_SECTIONS.length) % INSIGHTS_SECTIONS.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = INSIGHTS_SECTIONS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectAndFocus(nextIndex);
  };

  return (
    <>
      <div
        role="tablist"
        aria-label="Chọn nội dung phân tích"
        className="hidden w-full gap-1 overflow-x-auto rounded-xl border border-slate-200/70 bg-slate-100/80 p-1 md:flex"
      >
        {INSIGHTS_SECTIONS.map((section, index) => {
          const isSelected = selectedSection === section.id;

          return (
            <button
              key={section.id}
              ref={(element) => { tabRefs.current[index] = element; }}
              id={`insights-tab-${section.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls={`insights-panel-${section.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(section.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors motion-reduce:transition-none ${
                isSelected
                  ? 'border border-slate-200/60 bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
              }`}
            >
              {section.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5 md:hidden">
        <label htmlFor="insights-section-select" className="text-xs font-semibold text-slate-600">
          Chọn nội dung phân tích
        </label>
        <select
          id="insights-section-select"
          aria-label="Chọn nội dung phân tích"
          value={selectedSection}
          onChange={(event) => onChange(event.target.value as InsightsSection)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-600 motion-reduce:transition-none"
        >
          {INSIGHTS_SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>{section.label}</option>
          ))}
        </select>
      </div>
    </>
  );
};
