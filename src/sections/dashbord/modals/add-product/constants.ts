import { Marketplace } from '../../types';

export type Step = 'source' | 'review' | 'extras';
export const STEP_ORDER: Step[] = ['source', 'review', 'extras'];

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  amazon: 'AMAZON US',
  ebay: 'EBAY LUX',
  aliexpress: 'ALI DIRECT',
  walmart: 'WALMART US',
  direct: 'DIRECT ATELIER',
};

export const SECTION_CLASS =
  'p-4 bg-white dark:bg-slate-900 rounded-xl border border-[#dce9ff] dark:border-slate-700 flex flex-col gap-3 shadow-2xs';
export const SECTION_TITLE_CLASS = 'text-[12.5px] font-bold text-[#0b1c30] dark:text-white';
export const ADD_LINK_CLASS =
  'text-[12px] text-[#004ac6] dark:text-blue-400 hover:underline font-semibold cursor-pointer';
export const EMPTY_CLASS = 'text-[12px] text-[#565e74] dark:text-slate-400';
export const REMOVE_BTN_CLASS =
  'w-8 h-11 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-red-600 cursor-pointer';

export const PRIMARY_BTN_CLASS =
  'px-4 py-2 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-semibold rounded-lg disabled:opacity-40 cursor-pointer shadow-sm transition-all';
export const SECONDARY_BTN_CLASS =
  'px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg cursor-pointer transition-colors';
