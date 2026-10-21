import useLocales from '@/locales/use-locales';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/lucide-icon';
import { PromoCode } from '@/types/marketing';
import useGetPromoCodes, { GET_PROMO_CODES_QUERY_KEY } from '@/api/promo-code/get-promo-codes';
import usePostPromoCode from '@/api/promo-code/post-promo-code';
import usePatchPromoCode from '@/api/promo-code/patch-promo-code';
import useDeletePromoCode from '@/api/promo-code/delete-promo-code';
import {
  buildDuplicatePayload,
  buildPromoPayload,
  isDuplicateCodeError,
  mapApiPromo,
  NEW_PROMO_TERMS,
  PROMO_TYPES,
} from './mapper';
import { CreatePromoModal } from './modals/CreatePromoModal';
import { PromoAnalyticsModal } from './modals/PromoAnalyticsModal';

const ITEMS_PER_PAGE = 5;

export const PromotionsView: React.FC = () => {
  const { t } = useLocales();
  const queryClient = useQueryClient();

  const { data: apiPromos, isLoading, isError, refetch } = useGetPromoCodes();
  const { mutate: postPromo, isPending: isCreating } = usePostPromoCode();
  const { mutate: patchPromo, isPending: isUpdating } = usePatchPromoCode();
  const { mutate: deletePromo } = useDeletePromoCode();

  const promos = useMemo(() => (apiPromos ?? []).map((promo) => mapApiPromo(promo, t)), [apiPromos, t]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [analyticsPromo, setAnalyticsPromo] = useState<PromoCode | null>(null);

  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const handleCopy = (code: string, id: number) => {
    void navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(t('promo_code_copied', { code }));
    setTimeout(() => setCopiedId(null), 1800);
  };

  const refresh = () => queryClient.invalidateQueries({ queryKey: GET_PROMO_CODES_QUERY_KEY });

  const handleTogglePromoStatus = (promo: PromoCode) => {
    patchPromo(
      { id: promo.id, data: { isActive: !promo.isActive } },
      {
        onSuccess: () => {
          refresh();
          toast.success(t(promo.isActive ? 'promo_deactivated' : 'promo_activated', { code: promo.code }));
        },
        onError: () => toast.error(t('promo_update_failed')),
      }
    );
  };

  const handleSavePromo = (payload: ReturnType<typeof buildPromoPayload>) => {
    if (editingPromo) {
      patchPromo(
        { id: editingPromo.id, data: payload },
        {
          onSuccess: () => {
            refresh();
            toast.success(t('promo_updated', { code: payload.code }));
            setIsCreateOpen(false);
            setEditingPromo(null);
          },
          onError: (error) =>
            toast.error(t(isDuplicateCodeError(error) ? 'promo_code_exists' : 'promo_update_failed')),
        }
      );
      return;
    }
    postPromo(
      { ...payload, terms: NEW_PROMO_TERMS },
      {
        onSuccess: () => {
          refresh();
          toast.success(t('promo_created', { code: payload.code }));
          setIsCreateOpen(false);
        },
        onError: (error) =>
          toast.error(t(isDuplicateCodeError(error) ? 'promo_code_exists' : 'promo_create_failed')),
      }
    );
  };

  const handleDuplicatePromo = (promo: PromoCode) => {
    const copySuffix = Math.floor(Math.random() * 90 + 10);
    const copyCode = `${promo.code}_${copySuffix}`;
    postPromo(
      buildDuplicatePayload(promo, copyCode, t('promo_copy_suffix', { label: promo.campaignLabel })),
      {
        onSuccess: () => {
          refresh();
          toast.success(t('promo_duplicated', { code: promo.code, copy: copyCode }));
        },
        onError: () => toast.error(t('promo_create_failed')),
      }
    );
  };

  const handleDeletePromo = (promo: PromoCode) => {
    deletePromo(promo.id, {
      onSuccess: () => {
        refresh();
        toast.success(t('promo_deleted', { code: promo.code }));
      },
      onError: () => toast.error(t('promo_delete_failed')),
    });
  };

  const filteredPromos = useMemo(() => {
    const query = searchFilter.toLowerCase();
    return promos.filter((p) => {
      const matchSearch =
        p.code.toLowerCase().includes(query) ||
        p.campaignLabel.toLowerCase().includes(query) ||
        p.ruleDescription.toLowerCase().includes(query);
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.isActive) ||
        (statusFilter === 'paused' && !p.isActive) ||
        (statusFilter === 'expiring' && p.isExpiringSoon);
      return matchSearch && matchType && matchStatus;
    });
  }, [promos, searchFilter, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPromos.length / ITEMS_PER_PAGE));
  const displayedPromos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPromos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPromos, currentPage]);

  // Deleting can leave the current page past the end
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const activeCount = promos.filter((p) => p.isActive).length;
  const pausedCount = promos.length - activeCount;
  const expiringCount = promos.filter((p) => p.isActive && p.isExpiringSoon).length;
  const totalClaims = promos.reduce((sum, p) => sum + p.currentClaims, 0);

  const exportCSV = () => {
    const headers = ['Code', 'Campaign', 'Type', 'Discount', 'Claims', 'Max Claims', 'Status'];
    const rows = filteredPromos.map((p) => [
      p.code,
      `"${p.campaignLabel}"`,
      p.type,
      `"${p.discountDisplay}"`,
      p.currentClaims,
      p.maxClaims || t('promo_unlimited'),
      p.isActive ? t('active') : t('promo_paused'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `promos-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('promo_exported'));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-[11px] font-bold text-[#004ac6] dark:text-blue-400 uppercase tracking-wider mb-1">
            {t('marketing_campaigns')}
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white">
            {t('promotions_coupons_title')}
          </h1>
          <p className="text-[13px] text-[#565e74] dark:text-slate-400 mt-1">
            {t('promotions_subtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPromo(null);
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#004ac6] hover:bg-[#2563eb] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors duration-150"
        >
          <Icon name="add" className="text-[18px]" />
          <span>{t('promo_create_code')}</span>
        </button>
      </div>

      {/* Section 1: KPI Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Metric 1: Active Codes */}
        <div className="relative overflow-hidden p-6 bg-white dark:bg-[#131b2e] rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#eff4ff] dark:bg-gray-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
                <Icon name="confirmation_number" className="text-[22px]" />
              </div>
              <span className="text-xs text-[#004ac6] dark:text-blue-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#004ac6] animate-pulse"></span> {t('promo_live_status')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#565e74] dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                {t('promo_active_codes')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl text-[#0b1c30] dark:text-white font-bold tracking-tight">
                  {activeCount}
                </span>
                <span className="text-lg text-[#0b1c30] dark:text-gray-200 font-semibold">{t('active')}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-[#565e74] dark:text-gray-400 text-xs">
                <span className="px-1.5 py-0.5 bg-[#dae2fd] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 rounded font-semibold">
                  {expiringCount} {t('promo_expiring_soon')}
                </span>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <span>{pausedCount} {t('promo_paused')}</span>
              </div>
            </div>
          </div>

          {/* Sparkline Visual */}
          <div className="mt-6 pt-2 flex items-end gap-1.5 h-10">
            <div className="flex-1 bg-[#dce9ff] dark:bg-gray-700 rounded-xs h-3/6"></div>
            <div className="flex-1 bg-[#dce9ff] dark:bg-gray-700 rounded-xs h-4/6"></div>
            <div className="flex-1 bg-[#dce9ff] dark:bg-gray-700 rounded-xs h-5/6"></div>
            <div className="flex-1 bg-[#004ac6] rounded-xs h-full"></div>
            <div className="flex-1 bg-[#2563eb] rounded-xs h-4/5"></div>
          </div>
        </div>

        {/* Metric 2: Coupon Redemptions */}
        <div className="relative overflow-hidden p-6 bg-white dark:bg-[#131b2e] rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 flex flex-col justify-between group hover:shadow-md transition-shadow duration-200">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#eff4ff] dark:bg-gray-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
                <Icon name="trending_up" className="text-[22px]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#565e74] dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                {t('promo_total_redemptions')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl text-[#0b1c30] dark:text-white font-bold tracking-tight">
                  {totalClaims.toLocaleString()}
                </span>
                <span className="text-sm text-[#565e74] dark:text-gray-400">{t('promo_claims')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#131b2e] p-4 rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[320px]">
          <div className="relative flex-1 max-w-sm">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
            <input
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-9 pr-3 bg-[#eff4ff] dark:bg-gray-800 text-xs text-[#0b1c30] dark:text-gray-200 placeholder:text-gray-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6]"
              placeholder={t('promo_filter_placeholder')}
              type="text"
            />
          </div>

          {/* Type Dropdown */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 pr-8 bg-[#eff4ff] dark:bg-gray-800 text-xs font-medium text-[#0b1c30] dark:text-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
            >
              <option value="all">{t('promo_all_types')}</option>
              {PROMO_TYPES.map((promoType) => (
                <option key={promoType} value={promoType}>
                  {t(`promo_type_${promoType}`)}
                </option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[18px]" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3.5 pr-8 bg-[#eff4ff] dark:bg-gray-800 text-xs font-medium text-[#0b1c30] dark:text-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-1 focus:ring-[#004ac6] cursor-pointer"
            >
              <option value="all">{t('promo_all_statuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="paused">{t('promo_paused')}</option>
              <option value="expiring">{t('promo_expiring_soon')}</option>
            </select>
            <Icon name="expand_more" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[18px]" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 px-2 font-medium">
            {t('promo_showing_count', {
              count: displayedPromos.length,
              total: filteredPromos.length,
            })}
          </span>
          <button
            onClick={exportCSV}
            className="p-2 text-[#565e74] hover:text-[#0b1c30] dark:text-gray-400 dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={t('promo_export_csv')}
          >
            <Icon name="download" className="text-[20px]" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-6 text-sm text-[#565e74] dark:text-slate-400">{t('promos_loading')}</div>
      )}

      {isError && (
        <div className="p-6 mb-6 bg-white dark:bg-[#131b2e] rounded-xl border border-[#e5eeff] dark:border-gray-800 flex items-center justify-between gap-4">
          <span className="text-sm text-red-600">{t('promos_load_failed')}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-[#004ac6] dark:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {t('promos_retry')}
          </button>
        </div>
      )}

      {!isLoading && !isError && promos.length === 0 && (
        <div className="p-6 text-sm text-[#565e74] dark:text-slate-400">{t('promos_empty')}</div>
      )}

      {/* Active Promo Codes Table */}
      <div className="bg-white dark:bg-[#131b2e] rounded-xl shadow-xs border border-[#e5eeff] dark:border-gray-800 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] dark:bg-gray-800/80 text-[#565e74] dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider border-b border-[#e5eeff] dark:border-gray-700">
                <th className="py-3.5 px-6">{t('promo_col_code')}</th>
                <th className="py-3.5 px-6">{t('promo_col_rule')}</th>
                <th className="py-3.5 px-6">{t('promo_col_usage')}</th>
                <th className="py-3.5 px-6">{t('promo_col_validity')}</th>
                <th className="py-3.5 px-6">{t('promo_col_status')}</th>
                <th className="py-3.5 px-6 text-right">{t('promo_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4ff] dark:divide-gray-800 text-xs text-[#0b1c30] dark:text-gray-200">
              {displayedPromos.map((promo, idx) => {
                const claimPercent = promo.maxClaims
                  ? Math.min(100, Math.round((promo.currentClaims / promo.maxClaims) * 100))
                  : null;
                const isNearCap = claimPercent !== null && claimPercent >= 85 && claimPercent < 100;
                const isCapped = claimPercent !== null && claimPercent >= 100;

                return (
                  <tr
                    key={promo.id}
                    className={`transition-colors group ${
                      idx % 2 === 1 ? 'bg-[#eff4ff]/30 dark:bg-gray-800/20' : ''
                    } hover:bg-[#eff4ff]/70 dark:hover:bg-gray-800/60 ${
                      !promo.isActive ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Code Voucher */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tracking-wider text-[#004ac6] dark:text-blue-400 bg-[#dbe1ff] dark:bg-blue-950 px-2 py-0.5 rounded uppercase">
                          {promo.code}
                        </span>
                        <button
                          onClick={() => handleCopy(promo.code, promo.id)}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                          title={t('promo_copy_code')}
                        >
                          <Icon name={copiedId === promo.id ? 'check' : 'content_copy'} className="text-[16px]" />
                        </button>
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-1">
                        {promo.campaignLabel}
                      </span>
                    </td>

                    {/* Discount Rule */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#0b1c30] dark:text-white">
                          {promo.discountDisplay}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {promo.ruleDescription}
                        </span>
                      </div>
                    </td>

                    {/* Usage & Redemption Cap */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 max-w-xs">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-[#0b1c30] dark:text-white">
                            {promo.currentClaims.toLocaleString()}{' '}
                            <span className="text-gray-400 font-normal">
                              / {promo.maxClaims ? promo.maxClaims.toLocaleString() : t('promo_unlimited')}
                            </span>
                          </span>
                          <span
                            className={
                              isNearCap
                                ? 'text-[#943700] dark:text-amber-400 font-bold'
                                : isCapped
                                ? 'text-gray-500 font-semibold'
                                : 'text-gray-500'
                            }
                          >
                            {isCapped
                              ? t('promo_capped')
                              : isNearCap
                              ? `${claimPercent}% (${t('promo_near_cap')})`
                              : claimPercent !== null
                              ? `${claimPercent}%`
                              : t('promo_live')}
                          </span>
                        </div>
                        <div className="w-full bg-[#eff4ff] dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isNearCap
                                ? 'bg-[#943700] dark:bg-amber-500'
                                : isCapped
                                ? 'bg-gray-400'
                                : 'bg-[#004ac6]'
                            }`}
                            style={{
                              width: `${claimPercent !== null ? claimPercent : 24}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Validity Period */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#0b1c30] dark:text-white font-medium">
                          {promo.validityStart}
                          {promo.validityEnd ? ` - ${promo.validityEnd}` : ''}
                        </span>
                        <span
                          className={`text-[11px] ${
                            promo.isExpiringSoon
                              ? 'text-[#943700] dark:text-amber-400 font-semibold'
                              : 'text-gray-500'
                          }`}
                        >
                          {promo.validityNote}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          checked={promo.isActive}
                          onChange={() => handleTogglePromoStatus(promo)}
                          className="sr-only peer"
                          type="checkbox"
                        />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6]"></div>
                        <span
                          className={`ml-2 text-xs font-medium ${
                            promo.isActive
                              ? 'text-[#0b1c30] dark:text-white font-semibold'
                              : 'text-gray-400'
                          }`}
                        >
                          {promo.isActive ? t('active') : t('promo_paused')}
                        </span>
                      </label>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setAnalyticsPromo(promo)}
                          className="p-1.5 text-gray-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-700 rounded transition-colors"
                          title={t('promo_analytics')}
                        >
                          <Icon name="query_stats" className="text-[19px]" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingPromo(promo);
                            setIsCreateOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-700 rounded transition-colors"
                          title={t('promo_edit')}
                        >
                          <Icon name="edit" className="text-[19px]" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePromo(promo)}
                          className="p-1.5 text-gray-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-gray-700 rounded transition-colors"
                          title={t('promo_duplicate')}
                        >
                          <Icon name="content_copy" className="text-[19px]" />
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                          title={t('promo_delete')}
                        >
                          <Icon name="delete" className="text-[19px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 bg-[#eff4ff] dark:bg-gray-800/80 border-t border-[#e5eeff] dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('promo_displaying', {
              from: displayedPromos.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0,
              to: Math.min(currentPage * ITEMS_PER_PAGE, filteredPromos.length),
              total: filteredPromos.length,
            })}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-[#e5eeff] dark:border-gray-700 text-[#0b1c30] dark:text-gray-200 text-xs font-semibold rounded-lg shadow-xs hover:bg-[#f0f4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('promo_previous')}
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  currentPage === i + 1
                    ? 'bg-[#004ac6] text-white shadow-xs'
                    : 'bg-white dark:bg-gray-900 border border-[#e5eeff] dark:border-gray-700 text-[#0b1c30] dark:text-gray-200 hover:bg-[#f0f4ff]'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-[#e5eeff] dark:border-gray-700 text-[#0b1c30] dark:text-gray-200 text-xs font-semibold rounded-lg shadow-xs hover:bg-[#f0f4ff] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t('next')}
            </button>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <CreatePromoModal
          key={editingPromo?.id ?? 'new'}
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            setEditingPromo(null);
          }}
          onSave={handleSavePromo}
          isSaving={isCreating || isUpdating}
          initialData={editingPromo}
        />
      )}

      <PromoAnalyticsModal promo={analyticsPromo} onClose={() => setAnalyticsPromo(null)} />
    </div>
  );
};
