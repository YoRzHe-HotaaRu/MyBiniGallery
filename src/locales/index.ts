// @/src/locales/index.ts
export { en } from './en';
export { id } from './id';
export type { Translations } from './en';

import { en } from './en';
import { id } from './id';
import { Translations } from './en';

export type Language = 'en' | 'id';

export const locales: Record<Language, Translations> = { en, id };
