import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { PromoCode, PromoType } from '@/types/marketing';

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promo: PromoCode) => void;
  initialData?: PromoCode | null;
}

export const CreatePromoModal: React.FC<CreatePromoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { t } = useLocales();
  const [code, setCode] = useState(initialData?.code || '');
  const [campaignLabel, setCampaignLabel] = useState(initialData?.campaignLabel || '');
  const [type, setType] = useState<PromoType>(initialData?.type || 'percentage');
  const [discountValue, setDiscountValue] = useState<number>(initialData?.discountValue || 20);
  const [maxClaims, setMaxClaims] = useState<string>(
    initialData?.maxClaims !== undefined && initialData?.maxClaims !== null
      ? String(initialData.maxClaims)
      : '500'
  );
  const [minSpend, setMinSpend] = useState<string>(
    initialData?.minSpend !== undefined ? String(initialData.minSpend) : '100.00'
  );
  const [immediateActivation, setImmediateActivation] = useState(initialData?.isActive ?? true);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const prefixes = ['PROMO', 'SAVE', 'DEAL', 'FALL', 'WINTER', 'VIP', 'FLASH', 'WELCOME'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = Math.floor(Math.random() * 8 + 2) * 5; // 10, 15, 20...
    setCode(`${randomPrefix}${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error(t('promo_code_required'));
      return;
    }

    const discountDisplay =
      type === 'percentage'
        ? t('promo_discount_percentage', { value: discountValue })
        : type === 'fixed'
          ? t('promo_discount_fixed', { value: discountValue })
          : type === 'shipping'
            ? t('promo_discount_shipping')
            : t('promo_discount_gift');

    const newPromo: PromoCode = {
      id: initialData?.id || `promo-${Date.now()}`,
      code: code.trim().toUpperCase(),
      campaignLabel: campaignLabel.trim() || t('promo_default_campaign'),
      type,
      discountValue: Number(discountValue),
      discountDisplay,
      ruleDescription:
        Number(minSpend) > 0
          ? t('promo_rule_min_cart', { amount: Number(minSpend).toFixed(2) })
          : t('promo_rule_no_min'),
      minSpend: Number(minSpend) || 0,
      currentClaims: initialData?.currentClaims || 0,
      maxClaims: maxClaims ? Number(maxClaims) : null,
      validityStart: initialData?.validityStart || t('promo_today'),
      validityEnd: null,
      validityNote: t('promo_validity_active'),
      isActive: immediateActivation,
      revenueGenerated: initialData?.revenueGenerated || 0,
      conversionRate: initialData?.conversionRate || 92.0,
      tags: ['Live', 'Checkout'],
    };

    onSave(newPromo);
    toast.success(t(initialData ? 'promo_updated' : 'promo_created', { code: newPromo.code }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#131b2e] rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#e5eeff] dark:border-gray-700 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 bg-[#eff4ff] dark:bg-gray-800/80 flex items-center justify-between border-b border-[#e5eeff] dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#004ac6] flex items-center justify-center text-white shadow-xs">
              <Icon name={initialData ? 'edit' : 'add_circle'} className="text-[18px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-[#0b1c30] dark:text-white leading-tight">
                {t(initialData ? 'promo_modal_edit_title' : 'promo_modal_create_title')}
              </h3>
              <span className="text-xs text-[#565e74] dark:text-gray-400">
                {t('promo_modal_subtitle')}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#565e74] dark:text-gray-400 hover:text-[#0b1c30] dark:hover:text-white rounded-lg transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Voucher Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('promo_field_code')}
            </label>
            <div className="relative">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-11 px-3.5 pr-36 uppercase tracking-wider text-sm font-bold text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="e.g. WINTERFEST20"
                required
                type="text"
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#004ac6] dark:text-blue-400 hover:underline text-xs font-semibold"
              >
                {t('promo_generate_random')}
              </button>
            </div>
          </div>

          {/* Campaign Label */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
              {t('promo_field_label')}
            </label>
            <input
              value={campaignLabel}
              onChange={(e) => setCampaignLabel(e.target.value)}
              className="w-full h-10 px-3.5 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              placeholder={t('promo_field_label_placeholder')}
              type="text"
            />
          </div>

          {/* Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('promo_field_type')}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PromoType)}
                className="h-10 px-3 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              >
                <option value="percentage">{t('promo_type_percentage')}</option>
                <option value="fixed">{t('promo_type_fixed')}</option>
                <option value="shipping">{t('promo_type_shipping')}</option>
                <option value="gift">{t('promo_type_gift')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('promo_field_value')}
              </label>
              <input
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full h-10 px-3 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="20"
                required
                type="number"
                min="1"
              />
            </div>
          </div>

          {/* Caps & Minimum Basket */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('promo_field_max_claims')}
              </label>
              <input
                value={maxClaims}
                onChange={(e) => setMaxClaims(e.target.value)}
                className="w-full h-10 px-3 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="500"
                type="number"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30] dark:text-gray-200">
                {t('promo_field_min_basket')}
              </label>
              <input
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                className="w-full h-10 px-3 text-sm text-[#0b1c30] dark:text-white bg-[#eff4ff] dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
                placeholder="100.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          {/* Immediate Activation Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#eff4ff] dark:bg-gray-800/60 rounded-lg">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#0b1c30] dark:text-white">
                {t('promo_immediate_activation')}
              </span>
              <span className="text-[11px] text-[#565e74] dark:text-gray-400">
                {t('promo_publish_instantly')}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={immediateActivation}
                onChange={(e) => setImmediateActivation(e.target.checked)}
                className="sr-only peer"
                type="checkbox"
              />
              <div className="w-11 h-6 bg-gray-300 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]"></div>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#565e74] dark:text-gray-400 hover:text-[#0b1c30] dark:hover:text-white transition-colors"
              type="button"
            >
              {t('cancel')}
            </button>
            <button
              className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#2563eb] transition-colors"
              type="submit"
            >
              {t(initialData ? 'promo_save_changes' : 'promo_deploy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
