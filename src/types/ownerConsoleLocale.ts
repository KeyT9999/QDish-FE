export type OwnerConsoleLanguage = 'vi' | 'en' | 'zh-CN' | 'ru' | 'ko' | 'hi-IN';

export const OWNER_CONSOLE_LANGUAGES: OwnerConsoleLanguage[] = ['vi', 'en', 'zh-CN', 'ru', 'ko', 'hi-IN'];

export const isOwnerConsoleLanguage = (value: unknown): value is OwnerConsoleLanguage =>
  OWNER_CONSOLE_LANGUAGES.includes(value as OwnerConsoleLanguage);
