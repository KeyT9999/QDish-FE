import type { OwnerConsoleLanguage } from '@/types/ownerConsoleLocale';
import type { MenuLocale } from '@/types/menuTranslation';

type SupportedLocale = OwnerConsoleLanguage | MenuLocale;

const INTL_LOCALE_BY_APP_LOCALE: Record<SupportedLocale, string> = {
  vi: 'vi-VN',
  en: 'en-US',
  'zh-CN': 'zh-CN',
  ru: 'ru-RU',
  ko: 'ko-KR',
  'hi-IN': 'hi-IN',
};

/** Return a BCP 47 locale tag for dates, numbers, and currencies in the app. */
export function getIntlLocale(locale: SupportedLocale | string): string {
  return INTL_LOCALE_BY_APP_LOCALE[locale as SupportedLocale] ?? 'vi-VN';
}
