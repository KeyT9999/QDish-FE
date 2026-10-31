import React, { useState } from 'react';
import { Check, ChevronDown, Globe, X } from 'lucide-react';
import { getMenuMessage, MENU_LOCALE_OPTIONS } from '@/lib/menuLocale';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LocaleFlagIcon } from '@/components/menu/LocaleFlagIcon';
import type { MenuLocale } from '@/types/menuTranslation';

interface MenuLanguageSelectorProps {
  locale: MenuLocale;
  onChange: (locale: MenuLocale) => void;
}

export const MenuLanguageSelector: React.FC<MenuLanguageSelectorProps> = ({ locale, onChange }) => {
  const [open, setOpen] = useState(false);
  const activeOption = MENU_LOCALE_OPTIONS.find((option) => option.locale === locale) ?? MENU_LOCALE_OPTIONS[0];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        data-testid="menu-language-selector"
        aria-label={`${getMenuMessage(locale, 'language')}: ${activeOption.label}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200/90 bg-slate-100/90 pl-2 pr-2 text-slate-800 shadow-2xs transition-all duration-150 hover:border-emerald-300 hover:bg-emerald-50/70 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 motion-reduce:transition-none cursor-pointer"
      >
        <LocaleFlagIcon locale={activeOption.locale} className="h-4 w-4" />
        <span className="text-[11px] font-black tracking-wide text-slate-800">
          {activeOption.shortCode}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        data-testid="menu-language-sheet"
        className="mx-auto w-full max-w-md rounded-t-3xl border-t border-x border-slate-200/80 bg-white p-4 pb-6 text-slate-900 shadow-2xl"
      >
        <div aria-hidden="true" className="mx-auto mb-1 h-1 w-10 rounded-full bg-slate-200" />

        <SheetHeader className="flex-row items-start justify-between gap-3 p-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <Globe aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="font-heading text-base font-extrabold text-slate-900 leading-snug">
                {getMenuMessage(locale, 'languageSheetTitle')}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                {getMenuMessage(locale, 'languageSheetDescription')}
              </SheetDescription>
            </div>
          </div>

          <SheetClose
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 cursor-pointer"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </SheetClose>
        </SheetHeader>

        <div
          role="group"
          aria-label={getMenuMessage(locale, 'language')}
          className="grid grid-cols-2 gap-2.5 pt-1"
        >
          {MENU_LOCALE_OPTIONS.map((option) => {
            const isSelected = locale === option.locale;
            return (
              <button
                key={option.locale}
                type="button"
                aria-label={option.label}
                aria-pressed={isSelected}
                onClick={() => {
                  onChange(option.locale);
                  setOpen(false);
                }}
                className={`flex min-h-[54px] items-center justify-between gap-2 rounded-2xl border p-2.5 text-left transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 motion-reduce:transition-none cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/85 ring-1 ring-emerald-500/25 shadow-2xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <LocaleFlagIcon locale={option.locale} className="h-6 w-6" />
                  <div className="min-w-0">
                    <div className={`truncate text-xs font-extrabold leading-tight ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {option.label}
                    </div>
                    <div aria-hidden="true" className={`mt-0.5 truncate text-[11px] font-medium leading-tight ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {option.nativeHint}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
