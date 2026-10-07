import React from 'react';
import { MENU_LOCALE_OPTIONS } from '@/lib/menuLocale';
import type { MenuLocale } from '@/types/menuTranslation';

interface MenuLanguageSelectorProps {
  locale: MenuLocale;
  onChange: (locale: MenuLocale) => void;
}

export const MenuLanguageSelector: React.FC<MenuLanguageSelectorProps> = ({ locale, onChange }) => (
  <div className="flex items-center justify-between gap-3 py-2" data-testid="menu-language-selector">
    <span className="text-[11px] font-semibold text-slate-500">{locale === 'vi' ? 'Ngôn ngữ' : locale === 'en' ? 'Language' : '语言'}</span>
    <div role="group" aria-label="Menu language" className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {MENU_LOCALE_OPTIONS.map((option) => (
        <button
          key={option.locale}
          type="button"
          aria-label={option.label}
          aria-pressed={locale === option.locale}
          onClick={() => onChange(option.locale)}
          className={`min-h-10 min-w-10 rounded-lg px-2.5 text-xs font-bold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 motion-reduce:transition-none ${locale === option.locale ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'}`}
        >
          <span aria-hidden="true" className="mr-1">{option.flag}</span>
          {option.locale === 'zh-CN' ? '中文' : option.locale.toUpperCase()}
        </button>
      ))}
    </div>
  </div>
);
