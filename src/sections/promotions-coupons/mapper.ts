import { TFunction } from 'i18next';
import { ApiPromoCode, PromoCodePayload } from '@/api/promo-code/get-promo-codes';
import { PromoCode, PromoType } from '@/types/marketing';

export const PROMO_TYPES: PromoType[] = ['percentage', 'fixed'];

const DEFAULT_TERMS = 'all_users';
const MINIMUM_AMOUNT_TERMS = 'target_amount';
const EXPIRING_SOON_DAYS = 7;
const DAY_MS = 86_400_000;

const formatDate = (value: string) => new Date(value).toLocaleDateString();

// <input type="date"> works in local "YYYY-MM-DD", the API in ISO strings.
export const toDateInputValue = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const fromDateInputValue = (value: string, endOfDay: boolean) =>
  value ? new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString() : null;

const ruleDescription = (promo: ApiPromoCode, minSpend: number | undefined, t: TFunction) => {
  const parts: string[] = [];
  switch (promo.terms) {
    case 'first_time_purchase':
      parts.push(t('promo_terms_first_time'));
      break;
    case 'specific_users':
      parts.push(t('promo_terms_specific_users'));
      break;
    case 'target_quantity':
      parts.push(t('promo_terms_quantity', { count: Number(promo.target) || 0 }));
      break;
    case 'target_category':
      parts.push(t('promo_terms_category', { name: promo.target ?? '' }));
      break;
  }
  parts.push(minSpend ? t('promo_rule_min_cart', { amount: minSpend.toFixed(2) }) : t('promo_rule_no_min'));
  return parts.join(' · ');
};

const validityNote = (promo: ApiPromoCode, t: TFunction) => {
  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return t('promo_scheduled');
  if (!promo.expiresAt) return t('promo_no_expiration');
  const msLeft = new Date(promo.expiresAt).getTime() - now;
  if (msLeft < 0) return t('promo_expired');
  const days = Math.ceil(msLeft / DAY_MS);
  return days <= 1 ? t('promo_ends_today') : t('promo_ends_in_days', { days });
};

export const mapApiPromo = (promo: ApiPromoCode, t: TFunction): PromoCode => {
  const discountValue = Number(promo.discount) || 0;
  // Older codes stored their minimum cart amount in `target` instead of `minSpend`.
  const minSpend =
    promo.minSpend ?? (promo.terms === MINIMUM_AMOUNT_TERMS ? Number(promo.target) || undefined : undefined);
  const msLeft = promo.expiresAt ? new Date(promo.expiresAt).getTime() - Date.now() : null;

  return {
    id: promo.id,
    code: promo.code,
    campaignLabel: promo.campaignLabel ?? '',
    type: promo.type,
    discountValue,
    discountDisplay: t(promo.type === 'fixed' ? 'promo_discount_fixed' : 'promo_discount_percentage', {
      value: discountValue,
    }),
    ruleDescription: ruleDescription(promo, minSpend, t),
    minSpend,
    currentClaims: promo.currentClaims ?? 0,
    maxClaims: promo.maxClaims,
    startsAt: promo.startsAt,
    expiresAt: promo.expiresAt,
    validityStart: formatDate(promo.startsAt ?? promo.createdAt),
    validityEnd: promo.expiresAt ? formatDate(promo.expiresAt) : null,
    validityNote: validityNote(promo, t),
    isActive: promo.isActive,
    isExpiringSoon: msLeft !== null && msLeft >= 0 && msLeft <= EXPIRING_SOON_DAYS * DAY_MS,
    terms: promo.terms ?? DEFAULT_TERMS,
    target: promo.target,
  };
};

export type PromoFormValues = {
  code: string;
  campaignLabel: string;
  type: PromoType;
  discountValue: number;
  maxClaims: string;
  minSpend: string;
  startsAt: string; // "YYYY-MM-DD" or empty
  expiresAt: string; // "YYYY-MM-DD" or empty
  isActive: boolean;
};

// `terms` is left out when editing so the audience rule of an existing code is never overwritten.
export const buildPromoPayload = (values: PromoFormValues): Omit<PromoCodePayload, 'terms'> => ({
  code: values.code.trim().toUpperCase(),
  campaignLabel: values.campaignLabel.trim() || null,
  type: values.type,
  discount: String(values.discountValue),
  minSpend: Number(values.minSpend) > 0 ? Number(values.minSpend) : null,
  maxClaims: values.maxClaims ? Number(values.maxClaims) : null,
  isActive: values.isActive,
  startsAt: fromDateInputValue(values.startsAt, false),
  expiresAt: fromDateInputValue(values.expiresAt, true),
});

export const NEW_PROMO_TERMS = DEFAULT_TERMS;

export const buildDuplicatePayload = (promo: PromoCode, code: string, campaignLabel: string): PromoCodePayload => ({
  code,
  campaignLabel,
  type: promo.type,
  discount: String(promo.discountValue),
  terms: promo.terms,
  target: promo.target,
  minSpend: promo.minSpend ?? null,
  maxClaims: promo.maxClaims,
  isActive: true,
  startsAt: null,
  expiresAt: promo.expiresAt,
});

export const isDuplicateCodeError = (error: unknown) =>
  Array.isArray((error as { violations?: unknown[] })?.violations) &&
  (error as { violations: { message?: string }[] }).violations.some((v) => v.message === 'promo_code_already_exists');
