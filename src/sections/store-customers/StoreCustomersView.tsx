import useLocales from '@/locales/use-locales';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import { Customer, CustomerOrder, CustomerSegment } from './types';
import { InvoicePdfModal } from './InvoicePdfModal';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { CARD, KPI_LABEL, TH, TD, PaymentIcon } from './shared';
import { AddCustomerModal } from './AddCustomerModal';
import { RECENT_ORDER_DAYS } from './mapper';

interface StoreCustomersViewProps {
  customers: Customer[];
  totalItems: number;
  page: number;
  pageSize: number;
  isLoading?: boolean;
  isError?: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (keyword: string) => void;
  onUpdateCustomer: (updated: Customer) => void;
  onAddCustomer: (customer: Customer) => void;
}

type SegmentFilter = 'all' | CustomerSegment;

const SEGMENT_PILLS: { key: SegmentFilter; labelKey: string; active: string; dot?: string }[] = [
  { key: 'all', labelKey: 'customers_pill_all', active: 'bg-[#2563eb] text-white' },
  { key: 'VIP Gold', labelKey: 'customers_pill_vip', active: 'bg-[#bc4800] text-white font-bold', dot: 'bg-[#bc4800]' },
  { key: 'Régulier', labelKey: 'customers_pill_regular', active: 'bg-[#004ac6] text-white font-bold', dot: 'bg-[#004ac6]' },
  { key: 'Nouveau client', labelKey: 'customers_pill_new', active: 'bg-[#3f465c] text-white font-bold', dot: 'bg-[#3f465c]' },
  { key: 'Comptes en attente', labelKey: 'customers_pill_pending', active: 'bg-[#ba1a1a] text-white font-bold', dot: 'bg-[#ba1a1a]' },
];

export const StoreCustomersView: React.FC<StoreCustomersViewProps> = ({
  customers,
  totalItems,
  page,
  pageSize,
  isLoading,
  isError,
  onPageChange,
  onSearchChange,
  onUpdateCustomer,
  onAddCustomer,
}) => {
  const { t } = useLocales();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<CustomerOrder | null>(null);

  const activeCustomer = customers.find((c) => c.id === selectedId) ?? null;

  // Text search runs on the server (keyword filter); only the segment filter is applied to the loaded page.
  const filteredCustomers = customers.filter((c) => segmentFilter === 'all' || c.segment === segmentFilter);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const countFor = (key: SegmentFilter) =>
    key === 'all' ? totalItems : customers.filter((c) => c.segment === key).length;

  const segmentBadge = (segment: CustomerSegment) => {
    switch (segment) {
      case 'VIP Gold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdbcd] text-[#943700] text-[11px] font-semibold">
            <Icon name="stars" className="text-[14px]" />
            {t('customers_seg_vip')}
          </span>
        );
      case 'Régulier':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-semibold">
            {t('customers_seg_regular')}
          </span>
        );
      case 'Nouveau client':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#e5eeff] dark:bg-slate-700 text-[#565e74] dark:text-slate-200 text-[11px] font-semibold">
            {t('customers_seg_new')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold">
            {t('customers_seg_pending')}
          </span>
        );
    }
  };

  const handleExportCsv = () => {
    const rows = customers.map(
      (c) =>
        `"${c.id}","${c.name}","${c.email}","${c.phone}","${c.segment}","${c.location.city}","${c.ltv}","${c.ordersCount}","${c.preferredPayment}"`
    );
    const csvContent = [t('customers_csv_headers'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_flot_boutique_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t('customers_toast_export'));
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Context header & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 text-[#565e74] dark:text-slate-400 text-[11px]">
            <span>{t('customers_breadcrumb_ops')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span>{t('customers_breadcrumb_crm')}</span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-[#004ac6] dark:text-blue-400 font-semibold">{t('customers_breadcrumb_mgmt')}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] dark:text-white tracking-tight">{t('customers_title')}</h1>
          <p className="text-[13px] text-[#565e74] dark:text-slate-400 max-w-3xl">{t('customers_desc')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-colors border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="file_download" className="text-[18px]" />
            <span>{t('customers_export')}</span>
          </button>
          <button
            onClick={() => {
              setSegmentFilter('VIP Gold');
              toast.info(t('customers_toast_segment'));
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-[#131b2e] hover:bg-[#eff4ff] dark:hover:bg-slate-800 text-[#0b1c30] dark:text-white text-[13px] rounded-lg shadow-2xs transition-colors border border-[#e5eeff] dark:border-slate-700 font-medium"
            type="button"
          >
            <Icon name="group_work" className="text-[18px]" />
            <span>{t('customers_segment_btn')}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2563eb] hover:bg-[#004ac6] text-white text-[13px] rounded-lg shadow-sm transition-colors font-semibold"
            type="button"
          >
            <Icon name="person_add" className="text-[18px]" />
            <span>{t('customers_add')}</span>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between pb-2">
            <span className={KPI_LABEL}>{t('customers_kpi_active')}</span>
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="groups" className="text-[20px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">{totalItems.toLocaleString()}</span>
            <span className="inline-flex items-center text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">
              <Icon name="trending_up" className="text-[14px]" />
              +12.4%
            </span>
          </div>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400 pt-1">{t('customers_kpi_active_note')}</span>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between pb-2">
            <span className={KPI_LABEL}>{t('customers_kpi_new')}</span>
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#2563eb]">
              <Icon name="person_add" className="text-[20px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">348</span>
            <span className="inline-flex items-center text-[11px] text-[#004ac6] dark:text-blue-400 font-semibold">
              <Icon name="arrow_upward" className="text-[14px]" />
              +8.1%
            </span>
          </div>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400 pt-1">{t('customers_kpi_new_note')}</span>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between pb-2">
            <span className={KPI_LABEL}>{t('customers_kpi_basket')}</span>
            <div className="w-9 h-9 rounded-lg bg-[#ffdbcd] flex items-center justify-center text-[#bc4800]">
              <Icon name="shopping_bag" className="text-[20px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">
              184,500 <span className="text-[11px] font-normal text-[#565e74] dark:text-slate-400">FCFA</span>
            </span>
          </div>
          <span className="text-[11px] text-[#565e74] dark:text-slate-400 pt-1">{t('customers_kpi_basket_note')}</span>
        </div>

        <div className={`${CARD} p-5 flex flex-col justify-between`}>
          <div className="flex items-center justify-between pb-2">
            <span className={KPI_LABEL}>{t('customers_kpi_repeat')}</span>
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] dark:bg-slate-800 flex items-center justify-center text-[#004ac6] dark:text-blue-400">
              <Icon name="verified_user" className="text-[20px]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-[#0b1c30] dark:text-white">41.8%</span>
            <span className="text-[11px] text-[#565e74] dark:text-slate-400 font-medium">{t('customers_kpi_repeat_note')}</span>
          </div>
          <div className="w-full bg-[#e5eeff] dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#2563eb] h-full rounded-full" style={{ width: '41.8%' }}></div>
          </div>
        </div>
      </div>

      {/* Search & segment toolbar */}
      <div className={`${CARD} p-5 flex flex-col gap-4`}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Icon name="search" className="text-[20px] absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
            <input
              className="w-full h-11 pl-11 pr-4 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] focus:outline-none border border-transparent focus:border-[#2563eb]/40 transition-colors"
              placeholder={t('customers_search_placeholder')}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearchChange(e.target.value);
              }}
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value as SegmentFilter)}
            className="h-10 px-3 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[12px] rounded-lg cursor-pointer border-none focus:outline-none"
          >
            <option value="all">{t('customers_segment_all_statuses')}</option>
            {SEGMENT_PILLS.filter((p) => p.key !== 'all').map((p) => (
              <option key={p.key} value={p.key}>
                {t('customers_segment_option', { label: t(p.labelKey) })}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {SEGMENT_PILLS.map(({ key, labelKey, active, dot }) => {
            const isActive = segmentFilter === key;
            return (
              <button
                key={key}
                onClick={() => setSegmentFilter(key)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? active
                    : 'bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#e5eeff] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-slate-200'
                }`}
                type="button"
              >
                {dot && <span className={`inline-block w-2 h-2 rounded-full ${dot}`}></span>}
                <span>{t(labelKey)}</span>
                <span className={`text-[11px] ${isActive ? 'opacity-80' : 'text-[#565e74] dark:text-slate-400'}`}>
                  ({countFor(key)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer directory */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="p-5 flex items-center justify-between border-b border-[#f0f4ff] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{t('customers_directory')}</h2>
            <span className="px-2.5 py-0.5 bg-[#eff4ff] dark:bg-slate-800 text-[#565e74] dark:text-slate-300 text-[11px] rounded-full">
              {t('customers_showing', { shown: filteredCustomers.length, total: totalItems })}
            </span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              onSearchChange('');
              setSegmentFilter('all');
              toast.info(t('customers_toast_refresh'));
            }}
            className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#0b1c30] dark:hover:text-white hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
            type="button"
            title={t('customers_refresh')}
          >
            <Icon name="refresh" className="text-[20px]" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eff4ff]/60 dark:bg-slate-800/60 text-[#565e74] dark:text-slate-400 text-[11px] uppercase tracking-wider">
                <th className={TH}>{t('customers_col_customer')}</th>
                <th className={TH}>{t('customers_col_segment')}</th>
                <th className={TH}>{t('customers_col_location')}</th>
                <th className={TH}>{t('customers_col_orders')}</th>
                <th className={TH}>{t('customers_col_ltv')}</th>
                <th className={TH}>{t('customers_col_payment')}</th>
                <th className={`${TH} text-right`}>{t('customers_col_actions')}</th>
              </tr>
            </thead>
            <tbody className="text-[#0b1c30] dark:text-slate-100 text-[13px] divide-y divide-[#f0f4ff] dark:divide-slate-800">
              {(isLoading || isError || filteredCustomers.length === 0) && (
                <tr>
                  <td colSpan={7} className={`${TD} text-center text-[#565e74] dark:text-slate-400`}>
                    {isLoading ? t('customers_loading') : isError ? t('customers_load_error') : t('customers_empty')}
                  </td>
                </tr>
              )}
              {filteredCustomers.map((customer) => {
                const isSelected = customer.id === activeCustomer?.id;
                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedId(customer.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#eff4ff] dark:bg-slate-800/70' : 'hover:bg-[#eff4ff]/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className={TD}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shadow-2xs shrink-0 ${
                            isSelected ? 'bg-[#2563eb] text-white' : 'bg-[#dae2fd] text-[#131b2e]'
                          }`}
                        >
                          {customer.avatarInitials}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold">{customer.name}</span>
                            {customer.isVerified && (
                              <span title={t('customers_verified_account')}>
                                <Icon name="verified" className="text-[16px] text-[#004ac6] dark:text-blue-400" />
                              </span>
                            )}
                          </div>
                          <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                            {customer.email} • {customer.phone}
                          </span>
                          <span className="text-[#737686] text-[11px] font-mono">{t('customers_id', { id: customer.id })}</span>
                        </div>
                      </div>
                    </td>

                    <td className={TD}>{segmentBadge(customer.segment)}</td>

                    <td className={TD}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {customer.location.city} - {customer.location.district}
                        </span>
                        <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{customer.location.address}</span>
                      </div>
                    </td>

                    <td className={TD}>
                      <div className="flex flex-col">
                        <span className="font-bold">{t('customers_n_orders', { count: customer.ordersCount })}</span>
                        <span
                          className={`text-[11px] ${
                            customer.lastSevenDaysOrdersCount
                              ? 'text-[#004ac6] dark:text-blue-400 font-semibold'
                              : 'text-[#565e74] dark:text-slate-400'
                          }`}
                        >
                          {t('customers_orders_last_days_short', {
                            count: customer.lastSevenDaysOrdersCount ?? 0,
                            days: RECENT_ORDER_DAYS,
                          })}
                        </span>
                        <span
                          className={`text-[11px] ${
                            customer.lastActivity.includes('Aujourd')
                              ? 'text-[#004ac6] dark:text-blue-400 font-medium'
                              : 'text-[#565e74] dark:text-slate-400'
                          }`}
                        >
                          {customer.lastActivity}
                        </span>
                      </div>
                    </td>

                    <td className={TD}>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px]">
                          {customer.ltv.toLocaleString()}{' '}
                          <span className="text-[11px] font-normal text-[#565e74] dark:text-slate-400">FCFA</span>
                        </span>
                        {customer.lastOrderAmount > 0 && (
                          <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                            {t('customers_last', { amount: customer.lastOrderAmount.toLocaleString() })}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className={TD}>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800 rounded-lg text-[11px] font-medium">
                        <PaymentIcon method={customer.preferredPayment} />
                        {customer.preferredPayment}
                      </span>
                    </td>

                    <td className={`${TD} text-right`}>
                      {isSelected ? (
                        <button
                          className="px-2.5 py-1 bg-[#2563eb] text-white text-[11px] rounded-lg shadow-2xs inline-flex items-center gap-1 font-semibold"
                          type="button"
                        >
                          <Icon name="visibility" className="text-[16px]" />
                          <span>{t('customers_selected')}</span>
                        </button>
                      ) : (
                        <button
                          className="px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white text-[11px] rounded-lg hover:bg-[#dae2fd] dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1 font-medium"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(customer.id);
                          }}
                        >
                          <Icon name="visibility" className="text-[16px]" />
                          <span>{t('customers_view')}</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#565e74] dark:text-slate-400 text-[11px] border-t border-[#f0f4ff] dark:border-slate-800">
          <span>{t('customers_showing_footer', { shown: filteredCustomers.length, total: totalItems })}</span>
          <div className="flex items-center gap-1.5">
            <button
              className="px-2.5 py-1 bg-white dark:bg-[#131b2e] rounded shadow-2xs disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              type="button"
            >
              {t('customers_prev')}
            </button>
            <span className="px-2.5 py-1 bg-[#2563eb] text-white rounded font-semibold">
              {page} / {totalPages}
            </span>
            <button
              className="px-2.5 py-1 bg-white dark:bg-[#131b2e] rounded shadow-2xs disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              type="button"
            >
              {t('customers_next')}
            </button>
          </div>
        </div>
      </div>

      <CustomerDetailsModal
        isOpen={!!activeCustomer}
        onClose={() => setSelectedId(null)}
        customer={activeCustomer}
        onUpdateCustomer={onUpdateCustomer}
        onViewInvoice={setInvoiceOrder}
      />

      {activeCustomer && (
        <InvoicePdfModal
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          customer={activeCustomer}
          order={invoiceOrder}
        />
      )}

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={(newC) => {
          onAddCustomer(newC);
        }}
      />
    </div>
  );
};
