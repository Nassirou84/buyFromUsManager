import useLocales from '@/locales/use-locales';
import React, { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/lucide-icon';
import useGetCustomerOrders from '@/api/user/get-customer-orders';
import { Customer, CustomerOrder } from './types';
import { CARD, KPI_LABEL, TD, TH, PaymentIcon } from './shared';
import { RECENT_ORDER_DAYS, isRecentOrder, mapApiOrder } from './mapper';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdateCustomer: (updated: Customer) => void;
  onViewInvoice: (order: CustomerOrder) => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer,
  onUpdateCustomer,
  onViewInvoice,
}) => {
  const { t } = useLocales();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Customers added locally have no backend id, so only numeric ids are fetched.
  const ordersQuery = useGetCustomerOrders(customer?.id, isOpen && /^\d+$/.test(customer?.id ?? ''));
  const fetchedOrders = ordersQuery.data?.pages.flatMap((p) => p.orders.map(mapApiOrder));
  const totalOrders = customer?.ordersCount ?? 0;

  // Newest first, with the orders of the last 7 days grouped on top.
  const orders = useMemo(() => {
    const all = [...(fetchedOrders ?? customer?.orders ?? [])];
    const byDateDesc = (a: CustomerOrder, b: CustomerOrder) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    const recent = all.filter(isRecentOrder).sort(byDateDesc);
    const earlier = all.filter((o) => !isRecentOrder(o)).sort(byDateDesc);
    return [...recent, ...earlier];
  }, [fetchedOrders, customer?.orders]);
  const recentCount = customer?.lastSevenDaysOrdersCount ?? orders.filter(isRecentOrder).length;

  if (!isOpen || !customer) return null;

  const handleAddNote = () => {
    const note = window.prompt(t('customers_note_prompt'));
    if (!note) return;
    onUpdateCustomer({
      ...customer,
      crmNotes: `${customer.crmNotes}${t('customers_note_entry', { date: new Date().toLocaleDateString(), note })}`,
    });
    toast.success(t('customers_toast_note'));
  };

  const handleEditAddress = () => {
    const newAddress = window.prompt(t('customers_address_prompt'), customer.deliveryAddress.residence);
    if (!newAddress) return;
    onUpdateCustomer({
      ...customer,
      deliveryAddress: { ...customer.deliveryAddress, residence: newAddress },
    });
    toast.success(t('customers_toast_address'));
  };

  const handleEditPhone = () => {
    const newPhone = window.prompt(t('customers_phone_prompt'), customer.phone);
    if (!newPhone) return;
    onUpdateCustomer({ ...customer, phone: newPhone });
    toast.success(t('customers_toast_phone'));
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-6xl bg-[#f8f9ff] dark:bg-[#0b1326] rounded-2xl shadow-2xl border border-[#e5eeff] dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white dark:bg-[#131b2e] border-b border-[#e5eeff] dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <div className="w-3 h-6 bg-[#2563eb] rounded-full"></div>
            <h2 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">
              {t('customers_detail_title')}{' '}
              <span className="text-[#004ac6] dark:text-blue-400 font-bold">{customer.name}</span>{' '}
              <span className="text-[#565e74] dark:text-slate-400 font-mono font-normal text-[13px]">(#{customer.id})</span>
            </h2>
            {customer.segment === 'VIP Gold' && (
              <span className="px-2.5 py-1 rounded-full bg-[#ffdbcd] text-[#943700] text-[11px] font-semibold flex items-center gap-1">
                <Icon name="military_tech" className="text-[14px]" />
                {t('customers_gold_badge')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Identity & contact */}
            <div className={`${CARD} p-5 flex flex-col justify-between`}>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={KPI_LABEL}>{t('customers_identity')}</span>
                  {customer.isVerified && (
                    <span className="px-1.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded font-medium">
                      {t('customers_verified_account')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <div className="w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-[15px] font-bold shadow-md">
                    {customer.avatarInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] text-[#0b1c30] dark:text-white font-bold">{customer.name}</span>
                    <span className="text-[#565e74] dark:text-slate-400 text-[13px]">
                      {t('customers_member_since', { date: customer.memberSince })}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pt-2 text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <Icon name="call" className="text-[18px] text-[#737686]" />
                    <span className="text-[#0b1c30] dark:text-white font-medium">{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Icon name="mail" className="text-[18px] text-[#737686]" />
                    <span className="text-[#0b1c30] dark:text-white">{customer.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-2.5">
                <a
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[13px] rounded-lg transition-colors font-semibold"
                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="chat" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                  <span>{t('customers_whatsapp')}</span>
                </a>
                <button
                  onClick={handleEditPhone}
                  className="px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 text-[#0b1c30] dark:text-white hover:bg-[#dae2fd] dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center"
                  type="button"
                  title={t('customers_edit_contact')}
                >
                  <Icon name="edit" className="text-[18px]" />
                </button>
              </div>
            </div>

            {/* Default delivery address */}
            <div className={`${CARD} p-5 flex flex-col justify-between`}>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={KPI_LABEL}>{t('customers_main_address')}</span>
                  <Icon name="local_shipping" className="text-[20px] text-[#004ac6] dark:text-blue-400" />
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[13px] font-bold text-[#0b1c30] dark:text-white">{customer.deliveryAddress.residence}</span>
                  <span className="text-[#565e74] dark:text-slate-400 text-[13px]">{customer.deliveryAddress.district}</span>
                  <span className="text-[#565e74] dark:text-slate-400 text-[13px]">{customer.deliveryAddress.city}</span>
                </div>
                <div className="p-2.5 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg mt-1 flex items-center gap-2.5">
                  <Icon name="info" className="text-[18px] text-[#004ac6] dark:text-blue-400" />
                  <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                    {t('customers_pref_slot', { slot: customer.deliveryAddress.preferredTimeSlot })}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-2 text-[#565e74] dark:text-slate-400 text-[11px]">
                <span>
                  {t('customers_carrier')}{' '}
                  <strong className="text-[#0b1c30] dark:text-white">{customer.deliveryAddress.assignedCarrier}</strong>
                </span>
                <button onClick={handleEditAddress} className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold" type="button">
                  {t('customers_edit_address')}
                </button>
              </div>
            </div>

            {/* CRM notes & loyalty */}
            <div className={`${CARD} p-5 flex flex-col justify-between`}>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={KPI_LABEL}>{t('customers_crm_title')}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004ac6] dark:text-blue-400">
                    <Icon name="stars" className="text-[16px]" />
                    {t('customers_points', { count: customer.loyaltyPoints })}
                  </span>
                </div>
                <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 rounded-lg flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-[#0b1c30] dark:text-white">{t('customers_note_label')}</span>
                  <p className="text-[13px] text-[#565e74] dark:text-slate-300 italic leading-relaxed">"{customer.crmNotes}"</p>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2">
                <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{t('customers_note_author')}</span>
                <button onClick={handleAddNote} className="text-[#004ac6] dark:text-blue-400 hover:underline text-[11px] font-semibold" type="button">
                  {t('customers_add_note')}
                </button>
              </div>
            </div>
          </div>

          {/* Orders history */}
          <div className={`${CARD} overflow-hidden`}>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#f0f4ff] dark:border-slate-800">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-[15px] text-[#0b1c30] dark:text-white font-bold">
                  {t('customers_orders_of', { name: customer.name.split(' ')[0] })}
                </h3>
                <span className="px-2.5 py-0.5 bg-[#dae2fd] text-[#004ac6] text-[11px] rounded-full font-bold">
                  {t('customers_orders_count', { count: totalOrders })}
                </span>
              </div>
              <button
                onClick={() => {
                  toast.success(t('customers_toast_statement', { name: customer.name }));
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[#0b1c30] dark:text-white text-[11px] rounded-lg transition-colors font-semibold"
                type="button"
              >
                <Icon name="print" className="text-[16px]" />
                <span>{t('customers_print_statement')}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#eff4ff]/60 dark:bg-slate-800/60 text-[#565e74] dark:text-slate-400 text-[11px] uppercase tracking-wider">
                    <th className={TH}>{t('customers_col_order_no')}</th>
                    <th className={TH}>{t('customers_col_date')}</th>
                    <th className={TH}>{t('customers_col_items')}</th>
                    <th className={TH}>{t('customers_col_total')}</th>
                    <th className={TH}>{t('customers_col_delivery')}</th>
                    <th className={TH}>{t('customers_col_payment_short')}</th>
                    <th className={`${TH} text-right`}>{t('customers_col_quick_actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-[#0b1c30] dark:text-slate-100 text-[13px] divide-y divide-[#f0f4ff] dark:divide-slate-800">
                  {orders.map((order, idx) => (
                    <React.Fragment key={order.id}>
                      {(idx === 0 || isRecentOrder(order) !== isRecentOrder(orders[idx - 1])) && (
                        <tr className="bg-[#eff4ff]/40 dark:bg-slate-800/40">
                          <td colSpan={7} className="py-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-[#004ac6] dark:text-blue-400">
                            {isRecentOrder(order)
                              ? t('customers_orders_last_days', { count: recentCount, days: RECENT_ORDER_DAYS })
                              : t('customers_orders_earlier')}
                          </td>
                        </tr>
                      )}
                      <tr className="hover:bg-[#eff4ff]/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className={TD}>
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-[#004ac6] dark:text-blue-400">{order.orderNumber}</span>
                            <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{order.store}</span>
                          </div>
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.date}</span>
                            <span className="text-[#565e74] dark:text-slate-400 text-[11px]">{order.time}</span>
                          </div>
                        </td>
                        <td className={TD}>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image ? (
                                <img
                                  className="w-12 h-12 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0"
                                  src={item.image}
                                  alt={item.name}
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-[#737686]">
                                  <Icon name="shopping_bag" className="text-[20px]" />
                                </div>
                              )}
                              <div className="flex flex-col max-w-xs">
                                <span className="font-medium line-clamp-1">{item.name}</span>
                                <span className="text-[#565e74] dark:text-slate-400 text-[11px]">
                                  {item.variant ? `${item.variant} • ` : ''}{t('customers_qty', { count: item.quantity })}
                                  {item.warranty ? ` • ${item.warranty}` : ''}
                                  {item.batteryHealth ? ` • ${item.batteryHealth}` : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <div className="flex flex-col">
                            <span className="font-bold">{order.totalAmount.toLocaleString()} FCFA</span>
                            {order.taxIncludedPercent > 0 && (
                              <span className="text-[#737686] text-[11px]">{t('customers_vat_included', { percent: order.taxIncludedPercent })}</span>
                            )}
                          </div>
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e5eeff] dark:bg-slate-700 text-[11px] font-semibold">
                            <Icon name="check_circle" className="text-[14px] text-[#004ac6] dark:text-blue-400" />
                            {t(`customers_order_status_${order.deliveryStatus}`, { defaultValue: order.deliveryStatus })}
                          </span>
                        </td>
                        <td className={`${TD} whitespace-nowrap`}>
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
                            <PaymentIcon method={order.paymentMethod} />
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className={`${TD} text-right whitespace-nowrap`}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewInvoice(order)}
                              className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('customers_download_invoice')}
                              type="button"
                            >
                              <Icon name="picture_as_pdf" className="text-[20px]" />
                            </button>
                            <button
                              onClick={() => toast.success(t('customers_toast_notification', { order: order.orderNumber }))}
                              className="p-1.5 text-[#565e74] dark:text-slate-400 hover:text-[#004ac6] dark:hover:text-blue-400 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title={t('customers_resend_notification')}
                              type="button"
                            >
                              <Icon name="send_to_mobile" className="text-[20px]" />
                            </button>
                            <button
                              onClick={() => onViewInvoice(order)}
                              className="px-2.5 py-1 bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dae2fd] dark:hover:bg-slate-700 text-[11px] rounded-lg transition-colors font-medium"
                              type="button"
                            >
                              {t('customers_details')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#eff4ff]/60 dark:bg-slate-800/60 flex items-center justify-between gap-2 text-[#565e74] dark:text-slate-400 text-[11px] border-t border-[#f0f4ff] dark:border-slate-800">
              <span>
                {ordersQuery.isLoading
                  ? t('customers_loading_orders')
                  : ordersQuery.isError
                    ? t('customers_orders_load_error')
                    : t('customers_last_orders', { count: orders.length })}
              </span>
              {fetchedOrders ? (
                ordersQuery.hasNextPage && (
                  <button
                    className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
                    disabled={ordersQuery.isFetchingNextPage}
                    onClick={() => ordersQuery.fetchNextPage()}
                    type="button"
                  >
                    <span>{t('customers_view_full', { count: totalOrders })}</span>
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </button>
                )
              ) : (
                <button
                  className="text-[#004ac6] dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  onClick={() => toast.info(t('customers_toast_full_history'))}
                  type="button"
                >
                  <span>{t('customers_view_full', { count: customer.ordersCount })}</span>
                  <Icon name="arrow_forward" className="text-[16px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
