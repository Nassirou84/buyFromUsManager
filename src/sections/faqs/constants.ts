import { FaqCategory } from './types';

export type AccordionBehavior = FaqCategory['accordionBehavior'];

export const ACCORDION_OPTIONS: { value: AccordionBehavior; labelKey: string }[] = [
  { value: 'multi-open', labelKey: 'faqs_accordion_multi' },
  { value: 'strict', labelKey: 'faqs_accordion_strict' },
  { value: 'expanded', labelKey: 'faqs_accordion_expanded' },
];

export const TARGET_PAGES: { key: string; labelKey: string }[] = [
  { key: 'all_pages', labelKey: 'faqs_target_global' },
  { key: 'checkout', labelKey: 'faqs_target_checkout' },
  { key: 'pdp', labelKey: 'faqs_target_pdp' },
];

// The backend accepts lowercase letters and digits separated by single dashes.
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
