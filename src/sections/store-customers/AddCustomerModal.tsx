import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Customer, CustomerSegment } from './types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
}

const SEGMENT_OPTIONS: { value: CustomerSegment; labelKey: string }[] = [
  { value: 'Nouveau client', labelKey: 'customers_seg_new' },
  { value: 'Régulier', labelKey: 'customers_seg_regular' },
  { value: 'VIP Gold', labelKey: 'customers_seg_vip' },
  { value: 'Comptes en attente', labelKey: 'customers_seg_pending' },
];

// The value is stored on the customer and also drives the payment icon, so it stays fixed; only the label is translated
const PAYMENT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'Wave CI', labelKey: 'customers_pay_wave' },
  { value: 'Orange Money', labelKey: 'customers_pay_orange' },
  { value: 'MTN MoMo', labelKey: 'customers_pay_mtn' },
  { value: 'Carte Bancaire CI', labelKey: 'customers_pay_card' },
  { value: 'Espèces à réception', labelKey: 'customers_pay_cash' },
];

const FIELD = 'h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[#0b1c30] dark:text-white focus:outline-none border border-transparent focus:border-[#2563eb]/40';
const LABEL = 'text-xs font-semibold text-[#565e74] dark:text-slate-400';

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAddCustomer }) => {
  const { t, currentLang } = useLocales();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [address, setAddress] = useState('');
  const [segment, setSegment] = useState<CustomerSegment>('Nouveau client');
  const [payment, setPayment] = useState('Wave CI');

  if (!isOpen) return null;

  const city = 'Abidjan';
  const district = 'Cocody';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('customers_toast_name_required'));
      return;
    }

    const initials =
      name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'CL';

    onAddCustomer({
      id: `CL-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: email || 'contact@client-ci.com',
      phone: phone || '+225 07 00 00 00 00',
      avatarInitials: initials,
      segment,
      isVerified: true,
      location: { city, district, address: address || t('customers_new_default_district') },
      ordersCount: 0,
      lastActivity: t('customers_new_last_activity'),
      ltv: 0,
      lastOrderAmount: 0,
      preferredPayment: payment,
      memberSince: new Date().toLocaleDateString(currentLang.value, { month: 'long', year: 'numeric' }),
      deliveryAddress: {
        residence: address || t('customers_new_default_residence'),
        district,
        city,
        preferredTimeSlot: t('customers_new_time_slot'),
        assignedCarrier: 'Flot Express Abidjan',
      },
      crmNotes: t('customers_new_crm_note'),
      loyaltyPoints: 100,
      orders: [],
    });
    toast.success(t('customers_toast_added', { name }));
    setName('');
    setEmail('');
    setPhone('+225 ');
    setAddress('');
    setSegment('Nouveau client');
    setPayment('Wave CI');
    onClose();
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#131b2e] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 border-b border-[#e5eeff] dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Icon name="person_add" className="text-[22px] text-[#004ac6] dark:text-blue-400" />
            <span className="font-bold text-base text-[#0b1c30] dark:text-white">{t('customers_add_title')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#737686] hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#e5eeff] dark:hover:bg-slate-700 transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-[13px]">
          <div className="flex flex-col gap-1">
            <label className={LABEL}>{t('customers_add_name')}</label>
            <input
              type="text"
              required
              className={FIELD}
              placeholder={t('customers_add_name_ph')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t('customers_add_email')}</label>
              <input
                type="email"
                className={FIELD}
                placeholder="client@domaine.ci"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t('customers_add_phone')}</label>
              <input
                type="text"
                className={`${FIELD} font-mono text-xs`}
                placeholder="+225 07 00 00 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t('customers_add_segment')}</label>
              <select
                className={`${FIELD} cursor-pointer`}
                value={segment}
                onChange={(e) => setSegment(e.target.value as CustomerSegment)}
              >
                {SEGMENT_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>{t(labelKey)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={LABEL}>{t('customers_add_payment')}</label>
              <select
                className={`${FIELD} cursor-pointer`}
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
              >
                {PAYMENT_OPTIONS.map(({ value, labelKey }) => (
                  <option key={value} value={value}>{t(labelKey)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={LABEL}>{t('customers_add_address')}</label>
            <input
              type="text"
              className={FIELD}
              placeholder={t('customers_add_address_ph')}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5eeff] dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white font-semibold text-xs rounded-lg hover:bg-[#dae2fd] dark:hover:bg-slate-700 transition-colors"
            >
              {t('customers_add_cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#2563eb] text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-[#004ac6] transition-all"
            >
              {t('customers_add_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
