export type OwnerConsoleLanguage = 'vi' | 'en' | 'zh-CN';

export const OWNER_CONSOLE_LANGUAGES: OwnerConsoleLanguage[] = ['vi', 'en', 'zh-CN'];

export const isOwnerConsoleLanguage = (value: unknown): value is OwnerConsoleLanguage =>
  OWNER_CONSOLE_LANGUAGES.includes(value as OwnerConsoleLanguage);
