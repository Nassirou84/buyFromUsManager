import useLocales from '@/locales/use-locales';
import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import useGetCourriers, { GET_ALL_COURRIERS_QUERY_KEY, ApiCourrier } from '@/api/courrier/get-courriers';
import useAddCourrier from '@/api/courrier/add-courrier';

interface CarrierPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD = 'w-full h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#004ac6]/40 transition-colors';
const LABEL = 'text-[11.5px] font-bold text-[#565e74] dark:text-slate-400';

const EMPTY_FORM = { name: '', contact: '', pickupLocation: '', pickupContact: '', usaAddress: '' };

/** Lists the registered carrier partners (backend Courrier entity) and, when
 * "Add" is clicked, shows a creation form in the right-hand pane. */
export const CarrierPartnersModal: React.FC<CarrierPartnersModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocales();
  const queryClient = useQueryClient();
  const { data: courriers = [], isLoading } = useGetCourriers();
  const { mutate: addCourrier, isPending } = useAddCourrier();

  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setIsAdding(false);
      setSelectedId(null);
      setSearch('');
      setForm(EMPTY_FORM);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courriers;
    return courriers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.pickupLocation.toLowerCase().includes(q) ||
        c.contact.toLowerCase().includes(q)
    );
  }, [courriers, search]);

  if (!isOpen) return null;

  const selected = selectedId != null ? courriers.find((c) => c.id === selectedId) ?? null : null;

  const setField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const canSubmit =
    form.name.trim().length > 0 &&
    form.contact.trim().length > 0 &&
    form.pickupLocation.trim().length > 0 &&
    form.pickupContact.trim().length > 0 &&
    form.usaAddress.trim().length > 0 &&
    !isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    addCourrier(
      {
        name: form.name.trim(),
        contact: form.contact.trim(),
        pickupLocation: form.pickupLocation.trim(),
        pickupContact: form.pickupContact.trim(),
        usaAddress: form.usaAddress.trim(),
      },
      {
        onSuccess: (created) => {
          // Reflect the new partner immediately, then let the server data win.
          queryClient.setQueryData<ApiCourrier[]>([GET_ALL_COURRIERS_QUERY_KEY], (prev) =>
            prev ? [created, ...prev] : [created]
          );
          queryClient.invalidateQueries({ queryKey: [GET_ALL_COURRIERS_QUERY_KEY] });
          setForm(EMPTY_FORM);
          setIsAdding(false);
          toast.success(t('carrier_added_success'));
        },
        onError: () => {
          toast.error(t('carrier_add_error'));
        },
      }
    );
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-3xl h-[500px] bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-3 h-6 bg-[#004ac6] rounded-full"></div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold truncate">{t('carrier_partners_title')}</h2>
              <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('carrier_partners_subtitle')}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Body: list (left) + form (right) */}
        <div className="flex min-h-0 flex-1">
          {/* LEFT — list */}
          <div className="w-[260px] sm:w-[300px] shrink-0 flex flex-col border-r border-[#e5eeff] dark:border-slate-800 bg-white dark:bg-[#131b2e]">
            <div className="p-3 flex flex-col gap-2.5 border-b border-[#e5eeff] dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setIsAdding(true); setSelectedId(null); setForm(EMPTY_FORM); }}
                className="inline-flex items-center justify-center gap-1.5 px-3 h-9 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[12.5px] font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Icon name="add" className="text-[18px]" />
                <span>{t('add_carrier_partner')}</span>
              </button>
              <div className="relative">
                <Icon name="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737686] text-[16px]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('carrier_search_placeholder')}
                  className="w-full h-9 pl-8 pr-3 bg-[#eff4ff] dark:bg-slate-800 text-[12.5px] text-[#0b1c30] dark:text-white rounded-lg focus:outline-none border border-transparent focus:border-[#004ac6]/40"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-[12.5px] text-[#565e74] dark:text-slate-400">
                  <Icon name="progress_activity" className="text-[18px] animate-spin" />
                  <span>{t('carrier_loading')}</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-8 px-3 text-center">
                  <Icon name="local_shipping" className="text-[28px] text-[#c3c6d7] dark:text-slate-600" />
                  <span className="text-[12.5px] text-[#565e74] dark:text-slate-400">{t('carrier_list_empty')}</span>
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedId(c.id); setIsAdding(false); }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedId === c.id
                        ? 'border-[#004ac6] bg-[#eff4ff] dark:bg-blue-950/40 dark:border-blue-500'
                        : 'border-[#e5eeff] dark:border-slate-800 hover:border-[#004ac6]/40 bg-[#f8f9ff] dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon name="local_shipping" className="text-[15px] text-[#004ac6] dark:text-blue-400 shrink-0" />
                      <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white truncate">{c.name}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11.5px] text-[#565e74] dark:text-slate-400">
                      <Icon name="call" className="text-[13px] shrink-0" />
                      <span className="truncate">{c.contact}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-[#565e74] dark:text-slate-400">
                      <Icon name="pin_drop" className="text-[13px] shrink-0" />
                      <span className="truncate">{c.pickupLocation}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT — add form or placeholder */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {isAdding ? (
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300">
                    <Icon name="local_shipping" className="text-[18px]" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white">{t('carrier_form_title')}</span>
                    <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('carrier_form_desc')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className={LABEL}>{t('carrier_name')}</label>
                  <input className={FIELD} value={form.name} onChange={setField('name')} placeholder={t('carrier_name_ph')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL}>{t('carrier_contact')}</label>
                  <input className={FIELD} value={form.contact} onChange={setField('contact')} placeholder={t('carrier_contact_ph')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL}>{t('carrier_pickup_location')}</label>
                  <input className={FIELD} value={form.pickupLocation} onChange={setField('pickupLocation')} placeholder={t('carrier_pickup_location_ph')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL}>{t('carrier_pickup_contact')}</label>
                  <input className={FIELD} value={form.pickupContact} onChange={setField('pickupContact')} placeholder={t('carrier_pickup_contact_ph')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={LABEL}>{t('carrier_usa_address')}</label>
                  <input className={FIELD} value={form.usaAddress} onChange={setField('usaAddress')} placeholder={t('carrier_usa_address_ph')} />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    disabled={isPending}
                    className="px-3.5 h-10 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-medium disabled:opacity-60"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center gap-1.5 px-4 h-10 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[13px] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Icon name={isPending ? 'progress_activity' : 'check'} className={`text-[17px] ${isPending ? 'animate-spin' : ''}`} />
                    <span>{t('carrier_save')}</span>
                  </button>
                </div>
              </form>
            ) : selected ? (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-[#eff4ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300">
                    <Icon name="local_shipping" className="text-[18px]" />
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-bold text-[#0b1c30] dark:text-white truncate">{selected.name}</span>
                    <span className="text-[12px] text-[#565e74] dark:text-slate-400">{t('carrier_details_title')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className={LABEL}>{t('carrier_contact')}</span>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                    <Icon name="call" className="text-[15px] text-[#565e74] dark:text-slate-400 shrink-0" />
                    <span className="break-words">{selected.contact}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={LABEL}>{t('carrier_pickup_location')}</span>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                    <Icon name="pin_drop" className="text-[15px] text-[#565e74] dark:text-slate-400 shrink-0" />
                    <span className="break-words">{selected.pickupLocation}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={LABEL}>{t('carrier_pickup_contact')}</span>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                    <Icon name="call" className="text-[15px] text-[#565e74] dark:text-slate-400 shrink-0" />
                    <span className="break-words">{selected.pickupContact}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={LABEL}>{t('carrier_usa_address')}</span>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                    <Icon name="pin_drop" className="text-[15px] text-[#565e74] dark:text-slate-400 shrink-0" />
                    <span className="break-words">{selected.usaAddress}</span>
                  </div>
                </div>
                {selected.createdAt && (
                  <div className="flex flex-col gap-1">
                    <span className={LABEL}>{t('carrier_created_at')}</span>
                    <div className="flex items-center gap-1.5 text-[13px] text-[#0b1c30] dark:text-white">
                      <Icon name="calendar_today" className="text-[15px] text-[#565e74] dark:text-slate-400 shrink-0" />
                      <span>{new Date(selected.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 p-8 text-center">
                <Icon name="local_shipping" className="text-[36px] text-[#c3c6d7] dark:text-slate-600" />
                <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white">{t('carrier_select_prompt')}</span>
                <span className="text-[12px] text-[#565e74] dark:text-slate-400 max-w-[280px]">{t('carrier_select_prompt_desc')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
