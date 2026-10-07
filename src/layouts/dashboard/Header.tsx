import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ChevronDown, ChevronRight, ExternalLink, KeyRound, LogOut, Moon, Search, Store, Sun, User } from "lucide-react";
import { NavigationPath } from './Sidebar';
import { EditPasswordModal } from '@/sections/dashbord/modals/EditPasswordModal';
import { useAuthContext } from '@/auth/hooks';
import { Trans } from 'react-i18next';
import LanguagePoppever from './language-poppever';
import { useLocales } from "@/locales";

interface HeaderProps {
  currentPath: NavigationPath;
  collapsed: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  collapsed,
  searchQuery,
  onSearchChange,
  isDarkMode,
  onToggleDarkMode,
}) => {

  const { t } = useLocales();
  const { user, logout } = useAuthContext();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [showNotifications, setShowNotifications] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [passwordToast, setPasswordToast] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'notif_price_shift_title',
      desc: 'notif_price_shift_desc',
      minutes: 2,
      unread: true,
      type: 'warning'
    },
    {
      id: 2,
      title: 'notif_listing_depleted_title',
      desc: 'notif_listing_depleted_desc',
      minutes: 12,
      unread: true,
      type: 'alert'
    },
    {
      id: 3,
      title: 'notif_high_value_order_title',
      desc: 'notif_high_value_order_desc',
      minutes: 28,
      unread: false,
      type: 'info'
    }
  ]);

  const getBreadcrumbTitle = () => {
    switch (currentPath) {
      case 'catalog-scraping':
        return t('breadcrumb_catalog_scraping');
      case 'orders-fulfillment':
        return t('breadcrumb_orders_fulfillment');
      case 'returns-rmas':
        return t('breadcrumb_returns_rmas');
      case 'delivery-fleet':
        return t('breadcrumb_delivery_fleet');
      case 'promotions-coupons':
        return t('breadcrumb_promotions_coupons');
      case 'banners-merchandising':
        return t('breadcrumb_banners_merchandising');
      case 'users-roles':
        return t('breadcrumb_users_roles');
      case 'platform-settings':
        return t('breadcrumb_platform_settings');
      default:
        return t('breadcrumb_console');
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleOpenPasswordModal = () => {
    setUserDropdownOpen(false);
    setIsPasswordModalOpen(true);
  };

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    setIsLogoutModalOpen(true);
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 ${collapsed ? 'left-20' : 'left-72'
          } h-16 bg-white/85 dark:bg-[#131b2e]/90 backdrop-blur-xl border-b border-[#e5eeff] dark:border-slate-800 shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-6 transition-all duration-300`}
      >
        {/* Left: Breadcrumbs & Universal Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-[#565e74] dark:text-slate-400 text-[13px] whitespace-nowrap">
            <Store size={18} />
            <span className="font-medium text-[#434655] dark:text-slate-300">{t('flot_admin')}</span>
            <ChevronRight size={14} />
            <span className="text-[#0b1c30] dark:text-white font-semibold">{getBreadcrumbTitle()}</span>
          </div>

          {/* Global Search Bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('global_search_placeholder')}
              className="w-full h-9 pl-9 pr-14 bg-[#eff4ff] dark:bg-slate-800/80 text-[13px] text-[#0b1c30] dark:text-white placeholder:text-[#737686] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#004ac6] focus:bg-white dark:focus:bg-slate-800 transition-all border border-transparent focus:border-[#004ac6]/30"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#dce9ff] dark:bg-slate-700 text-[#004ac6] dark:text-blue-300 text-[10px] font-semibold rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Storefront Preview button */}
          <Link
            type="button"
            target="_blank" rel="noopener noreferrer"
            href={process.env.NEXT_PUBLIC_STORE_FRONT_URL}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#004ac6] dark:text-blue-300 hover:text-[#003ea8] text-[13px] font-semibold rounded-lg transition-all border border-[#004ac6]/10 cursor-pointer"
          >
            <ExternalLink size={18} />
            <span className="hidden sm:inline">{t('storefront_preview')}</span>
          </Link>

          {/* Theme Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')}
            title={isDarkMode ? t('switch_to_light_mode') : t('switch_to_dark_mode')}
            className="p-2 rounded-lg text-[#565e74] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800 hover:text-[#0b1c30] dark:hover:text-white transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun size={20} className="" /> : <Moon size={20} className="" />}
          </button>

          <LanguagePoppever />

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={t('notifications')}
              className="relative p-2 rounded-lg text-[#565e74] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800 hover:text-[#0b1c30] dark:hover:text-white transition-colors cursor-pointer"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#bc4800] text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#131b2e] rounded-xl shadow-xl border border-[#e5eeff] dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 bg-[#eff4ff] dark:bg-slate-800/80 border-b border-[#e5eeff] dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-[#0b1c30] dark:text-white">
                      {t('operations_feed')}
                    </span>
                    <span className="px-2 py-0.5 bg-[#ffdbcd] text-[#943700] rounded text-[11px] font-bold">
                      {t('new_count', { count: unreadCount })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] text-[#004ac6] dark:text-blue-400 hover:underline font-medium cursor-pointer"
                  >
                    {t('mark_all_as_read')}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#f0f4ff] dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 hover:bg-[#f8f9ff] dark:hover:bg-slate-800/50 transition-colors ${n.unread ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[12.5px] font-semibold text-[#0b1c30] dark:text-slate-100">
                          {t(n.title)}
                        </span>
                        <span className="text-[10.5px] text-[#737686] whitespace-nowrap">
                          {t('minutes_ago', { count: n.minutes })}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#565e74] dark:text-slate-400 mt-1 leading-snug">
                        {t(n.desc)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 text-center bg-[#f8f9ff] dark:bg-slate-900 border-t border-[#e5eeff] dark:border-slate-800">
                  <span className="text-[11.5px] text-[#565e74] dark:text-slate-400">
                    {t('scrapers_sync_interval')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Interactive Dropdown Menu */}
          <div className="relative" ref={userDropdownRef}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-[#e5eeff] dark:border-slate-800 hover:opacity-90 transition-opacity cursor-pointer group"
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
            >
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[13px] font-semibold text-[#0b1c30] dark:text-white leading-tight group-hover:text-[#004ac6] dark:group-hover:text-blue-400 transition-colors">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[11px] text-[#565e74] dark:text-slate-400 leading-none">
                  {t('management')}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white shadow-sm ring-2 ring-[#dbe1ff] dark:ring-blue-900 group-hover:ring-[#004ac6] transition-all">
                <User size={18} />
              </div>
              <ChevronDown size={16} className={`text-[#737686] transition-transform duration-200 hidden sm:inline ${userDropdownOpen ? 'rotate-180' : ''
                }`} />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#131b2e] rounded-xl shadow-xl border border-[#dce9ff] dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-1.5">
                {/* User Info Header */}
                <div className="p-3 bg-[#eff4ff] dark:bg-slate-800/70 rounded-lg flex items-center gap-3 border border-[#e5eeff] dark:border-slate-700">
                  <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <User size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13.5px] font-bold text-[#0b1c30] dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-[11.5px] text-[#565e74] dark:text-slate-400 truncate">
                      {user?.email}
                    </span>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-[#dbe1ff] dark:bg-blue-950 text-[#004ac6] dark:text-blue-300 text-[10px] font-bold rounded w-fit">
                      {user?.roles?.map(role => role).join(' / ')}
                    </span>
                  </div>
                </div>

                {/* Actions List */}
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {/* Action 1: Password Edit Modal Trigger */}
                  <button
                    type="button"
                    onClick={handleOpenPasswordModal}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#0b1c30] dark:text-slate-200 hover:bg-[#eff4ff] dark:hover:bg-slate-800 hover:text-[#004ac6] dark:hover:text-blue-300 rounded-lg transition-colors cursor-pointer group text-left"
                  >
                    <KeyRound size={18} className="text-[#004ac6] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{t('edit_password')}</span>
                      <span className="text-[10.5px] text-[#737686] dark:text-slate-400">
                        {t('update_console_credentials')}
                      </span>
                    </div>
                  </button>

                  <div className="h-px bg-[#f0f4ff] dark:bg-slate-800 my-1"></div>

                  {/* Action 2: Logout */}
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer group text-left"
                  >
                    <LogOut size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{t('log_out_action')}</span>
                      <span className="text-[10.5px] text-red-400 dark:text-rose-500">
                        {t('end_session_safely')}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Password Edit Modal */}
      <EditPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onPasswordChanged={() => {
          setPasswordToast(true);
          setTimeout(() => setPasswordToast(false), 3500);
        }}
      />

      {/* Logout Confirmation & Session Re-authentication Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#131b2e] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#dce9ff] dark:border-slate-800 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-rose-400 flex items-center justify-center mb-1">
              <LogOut size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30] dark:text-white">
              {t('logout_flot_console_title')}
            </h3>
            <p className="text-[12.5px] text-[#565e74] dark:text-slate-400 leading-relaxed">
              <Trans
                i18nKey="logout_session_locked"
                values={{ name: fullName }}
                components={{ strong: <strong className="text-[#0b1c30] dark:text-slate-200" /> }}
              />
            </p>

            <div className="flex items-center gap-2 w-full mt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  alert(t('session_logged_out_alert', { name: fullName }));
                }}
                className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {t('confirm_log_out')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Password Update Toast */}
      {passwordToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
            <Check size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12.5px] font-bold">{t('password_updated')}</span>
            <span className="text-[11px] text-slate-300">
              {t('credentials_updated_for', { name: fullName })}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
